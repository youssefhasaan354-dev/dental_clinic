/**
 * Hayaah Dental Clinic - Supabase Production Booking Adapter
 * Connects to live PostgreSQL database with Row Level Security and Auth.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IBookingService } from './IBookingService';
import {
  DayAvailability,
  Appointment,
  CreateAppointmentDTO,
  RescheduleAppointmentDTO,
  AppointmentFilters,
  AppointmentStatus,
  BlockedSlot,
  BookingSettings,
  PatientRecord,
  BookingStats,
  DoctorSchedule,
} from './types';
import {
  computeDayAvailability,
  validateAndNormalizeEgyptianPhone,
  generateBookingCode,
  addMinutesToTime,
  SERVICE_DURATIONS,
  DEFAULT_BOOKING_SETTINGS,
  canCancelAppointment,
  getCairoNow,
  formatCairoDate,
} from './slotEngine';
import { notify } from './notificationService';

export class SupabaseBookingService implements IBookingService {
  readonly isDemo = false;
  private client: SupabaseClient;

  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    this.client = createClient(supabaseUrl, supabaseAnonKey);
  }

  async getAvailability(date: string, serviceId?: string, doctorId?: string): Promise<DayAvailability> {
    const [doctorsRes, blockedRes, aptsRes, settingsRes] = await Promise.all([
      this.getDoctors(),
      this.getBlockedSlots({ from: date, to: date }),
      this.client.from('appointments').select('*').eq('date', date).neq('status', 'cancelled'),
      this.getSettings(),
    ]);

    const existingAppointments: Appointment[] = (aptsRes.data || []).map(this.mapAppointmentRow);
    const duration = serviceId ? SERVICE_DURATIONS[serviceId] || settingsRes.slotDurationMinutes : settingsRes.slotDurationMinutes;

    return computeDayAvailability({
      date,
      serviceDurationMinutes: duration,
      doctorId,
      existingAppointments,
      blockedSlots: blockedRes,
      doctors: doctorsRes,
      settings: settingsRes,
    });
  }

  async createAppointment(data: CreateAppointmentDTO): Promise<{
    success: boolean;
    appointment?: Appointment;
    error?: string;
  }> {
    if (data.honeypot) {
      return { success: true };
    }

    const phoneCheck = validateAndNormalizeEgyptianPhone(data.patientPhone);
    if (!phoneCheck.isValid) {
      return {
        success: false,
        error: 'يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678) / Invalid Egyptian phone number',
      };
    }

    const settings = await this.getSettings();
    const duration = SERVICE_DURATIONS[data.serviceId] || settings.slotDurationMinutes;
    const endTime = addMinutesToTime(data.startTime, duration);
    const bookingCode = generateBookingCode();
    const doctorId = data.doctorId && data.doctorId !== 'any' ? data.doctorId : 'doc-ortho';

    const insertPayload = {
      booking_code: bookingCode,
      patient_name: data.patientName.trim(),
      patient_phone: phoneCheck.normalized,
      patient_email: data.patientEmail?.trim() || null,
      patient_type: data.patientType || 'new',
      service_id: data.serviceId,
      service_name_ar: 'كشف واستشارة طبية',
      service_name_en: 'General Dental Consultation',
      service_duration: duration,
      doctor_id: doctorId,
      date: data.date,
      start_time: data.startTime,
      end_time: endTime,
      status: settings.autoConfirm ? 'confirmed' : 'pending',
      notes: data.notes?.trim() || null,
      consent_given: data.consentGiven,
      is_walk_in: Boolean(data.isWalkIn),
    };

    const { data: created, error } = await this.client
      .from('appointments')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      // Postgres unique constraint violation code 23505
      if (error.code === '23505') {
        return {
          success: false,
          error: 'عفواً، تم حجز هذا الموعد للتو! يرجى اختيار موعد آخر / This slot was just taken. Please choose another time.',
        };
      }
      return { success: false, error: error.message };
    }

    const appt = this.mapAppointmentRow(created);
    notify({ type: 'booking_created', appointment: appt });

    return { success: true, appointment: appt };
  }

  async getAppointmentByCode(code: string, phone: string): Promise<Appointment | null> {
    const phoneCheck = validateAndNormalizeEgyptianPhone(phone);
    const { data, error } = await this.client
      .from('appointments')
      .select('*')
      .eq('booking_code', code.trim().toUpperCase())
      .single();

    if (error || !data) return null;

    // Verify phone match for privacy protection
    const cleanedStored = data.patient_phone.replace(/\D/g, '');
    const cleanedInput = phoneCheck.normalized.replace(/\D/g, '');
    if (cleanedStored !== cleanedInput) return null;

    return this.mapAppointmentRow(data);
  }

  async cancelAppointment(code: string, phone: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    const apt = await this.getAppointmentByCode(code, phone);
    if (!apt) return { success: false, error: 'Appointment not found' };

    const settings = await this.getSettings();
    const check = canCancelAppointment(apt, settings);
    if (!check.allowed) return { success: false, error: check.reason };

    const { error } = await this.client
      .from('appointments')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || 'Cancelled by patient online',
        updated_at: new Date().toISOString(),
      })
      .eq('id', apt.id);

    if (error) return { success: false, error: error.message };

    notify({ type: 'booking_cancelled', appointment: { ...apt, status: 'cancelled' } });
    return { success: true };
  }

  async rescheduleAppointment(params: RescheduleAppointmentDTO): Promise<{
    success: boolean;
    appointment?: Appointment;
    error?: string;
  }> {
    const apt = await this.getAppointmentByCode(params.bookingCode, params.patientPhone);
    if (!apt) return { success: false, error: 'Appointment not found' };

    const newEndTime = addMinutesToTime(params.newStartTime, apt.serviceDuration);
    const settings = await this.getSettings();

    const { data, error } = await this.client
      .from('appointments')
      .update({
        date: params.newDate,
        start_time: params.newStartTime,
        end_time: newEndTime,
        doctor_id: params.newDoctorId || apt.doctorId,
        status: settings.autoConfirm ? 'confirmed' : 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', apt.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    const updated = this.mapAppointmentRow(data);
    notify({ type: 'booking_rescheduled', appointment: updated });
    return { success: true, appointment: updated };
  }

  async listAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {
    let query = this.client.from('appointments').select('*');

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters?.doctorId && filters.doctorId !== 'all') {
      query = query.eq('doctor_id', filters.doctorId);
    }
    if (filters?.dateFrom) {
      query = query.gte('date', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('date', filters.dateTo);
    }

    query = query.order('date', { ascending: false }).order('start_time', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    let results = (data || []).map(this.mapAppointmentRow);

    if (filters?.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase();
      results = results.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          a.patientPhone.includes(q) ||
          a.bookingCode.toLowerCase().includes(q)
      );
    }

    return results;
  }

  async updateStatus(id: string, status: AppointmentStatus, internalNotes?: string): Promise<Appointment> {
    const payload: any = { status, updated_at: new Date().toISOString() };
    if (internalNotes !== undefined) payload.internal_notes = internalNotes;

    const { data, error } = await this.client
      .from('appointments')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    const apt = this.mapAppointmentRow(data);
    if (status === 'confirmed') notify({ type: 'booking_confirmed', appointment: apt });
    return apt;
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.status) payload.status = updates.status;
    if (updates.date) payload.date = updates.date;
    if (updates.startTime) payload.start_time = updates.startTime;
    if (updates.endTime) payload.end_time = updates.endTime;
    if (updates.doctorId) payload.doctor_id = updates.doctorId;
    if (updates.internalNotes !== undefined) payload.internal_notes = updates.internalNotes;

    const { data, error } = await this.client
      .from('appointments')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapAppointmentRow(data);
  }

  async blockSlot(data: Omit<BlockedSlot, 'id' | 'createdAt'>): Promise<BlockedSlot> {
    const { data: created, error } = await this.client
      .from('blocked_slots')
      .insert({
        doctor_id: data.doctorId || null,
        date: data.date,
        start_time: data.startTime || null,
        end_time: data.endTime || null,
        reason: data.reason,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: created.id,
      doctorId: created.doctor_id,
      date: created.date,
      startTime: created.start_time,
      endTime: created.end_time,
      reason: created.reason,
      createdAt: created.created_at,
    };
  }

  async unblockSlot(id: string): Promise<boolean> {
    const { error } = await this.client.from('blocked_slots').delete().eq('id', id);
    return !error;
  }

  async getBlockedSlots(dateRange?: { from?: string; to?: string }): Promise<BlockedSlot[]> {
    let query = this.client.from('blocked_slots').select('*');
    if (dateRange?.from) query = query.gte('date', dateRange.from);
    if (dateRange?.to) query = query.lte('date', dateRange.to);

    const { data, error } = await query;
    if (error) return [];
    return (data || []).map((b) => ({
      id: b.id,
      doctorId: b.doctor_id,
      date: b.date,
      startTime: b.start_time,
      endTime: b.end_time,
      reason: b.reason,
      createdAt: b.created_at,
    }));
  }

  async getSettings(): Promise<BookingSettings> {
    const { data, error } = await this.client.from('booking_settings').select('*').single();
    if (error || !data) return DEFAULT_BOOKING_SETTINGS;
    return {
      slotDurationMinutes: data.slot_duration_minutes,
      workingDays: data.working_days,
      openTime: data.open_time,
      closeTime: data.close_time,
      timezone: data.timezone,
      minNoticeHours: data.min_notice_hours,
      maxAdvanceDays: data.max_advance_days,
      cancellationWindowHours: data.cancellation_window_hours,
      autoConfirm: data.auto_confirm,
      clinicPhone: data.clinic_phone,
      clinicWhatsapp: data.clinic_whatsapp,
      notificationTemplates: data.notification_templates,
    };
  }

  async updateSettings(settings: Partial<BookingSettings>): Promise<BookingSettings> {
    const payload: any = {};
    if (settings.slotDurationMinutes) payload.slot_duration_minutes = settings.slotDurationMinutes;
    if (settings.workingDays) payload.working_days = settings.workingDays;
    if (settings.openTime) payload.open_time = settings.openTime;
    if (settings.closeTime) payload.close_time = settings.closeTime;
    if (settings.minNoticeHours !== undefined) payload.min_notice_hours = settings.minNoticeHours;
    if (settings.maxAdvanceDays !== undefined) payload.max_advance_days = settings.maxAdvanceDays;
    if (settings.cancellationWindowHours !== undefined) payload.cancellation_window_hours = settings.cancellationWindowHours;
    if (settings.autoConfirm !== undefined) payload.auto_confirm = settings.autoConfirm;

    await this.client.from('booking_settings').update(payload).eq('id', 1);
    return this.getSettings();
  }

  async listPatients(): Promise<PatientRecord[]> {
    const { data, error } = await this.client.from('appointments').select('*');
    if (error) return [];
    const appointments = (data || []).map(this.mapAppointmentRow);
    const map = new Map<string, PatientRecord>();

    for (const apt of appointments) {
      const phone = apt.patientPhone;
      const existing = map.get(phone);
      if (!existing) {
        map.set(phone, {
          phone,
          name: apt.patientName,
          email: apt.patientEmail,
          patientType: apt.patientType,
          appointmentsCount: 1,
          lastVisitDate: apt.date,
          lastService: apt.serviceName.ar,
          notes: apt.notes,
          createdAt: apt.createdAt,
        });
      } else {
        existing.appointmentsCount += 1;
        if (apt.date > (existing.lastVisitDate || '')) {
          existing.lastVisitDate = apt.date;
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.appointmentsCount - a.appointmentsCount);
  }

  async deletePatient(phone: string): Promise<boolean> {
    const { error } = await this.client.from('appointments').delete().eq('patient_phone', phone);
    return !error;
  }

  async getStats(): Promise<BookingStats> {
    const { data } = await this.client.from('appointments').select('*');
    const appointments = (data || []).map(this.mapAppointmentRow);
    const todayStr = formatCairoDate(getCairoNow());

    const todayApts = appointments.filter((a) => a.date === todayStr);
    const todayPending = todayApts.filter((a) => a.status === 'pending').length;
    const todayConfirmed = todayApts.filter((a) => a.status === 'confirmed').length;
    const pendingConfirmations = appointments.filter((a) => a.status === 'pending').length;
    const completed = appointments.filter((a) => a.status === 'completed').length;
    const cancelled = appointments.filter((a) => a.status === 'cancelled').length;
    const noShow = appointments.filter((a) => a.status === 'no_show').length;
    const past = completed + noShow;
    const noShowRate = past > 0 ? Math.round((noShow / past) * 100) : 0;
    const newPatients = appointments.filter((a) => a.patientType === 'new').length;

    return {
      todayTotal: todayApts.length,
      todayPending,
      todayConfirmed,
      thisWeekTotal: appointments.filter((a) => Math.abs(a.date.localeCompare(todayStr)) <= 3).length,
      pendingConfirmations,
      noShowRate,
      newPatientsCount: newPatients,
      totalAppointments: appointments.length,
      completedAppointments: completed,
      cancelledAppointments: cancelled,
    };
  }

  async getDoctors(): Promise<DoctorSchedule[]> {
    const { data } = await this.client.from('doctors').select('*');
    return (data || []).map((d) => ({
      doctorId: d.id,
      doctorName: { ar: d.name_ar, en: d.name_en },
      title: { ar: d.title_ar, en: d.title_en },
      avatar: d.avatar_url,
      isActive: d.is_active,
      services: d.services,
      weeklyHours: d.weekly_hours,
    }));
  }

  async updateDoctor(id: string, updates: Partial<DoctorSchedule>): Promise<DoctorSchedule> {
    const payload: any = {};
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;
    if (updates.weeklyHours) payload.weekly_hours = updates.weeklyHours;

    const { data, error } = await this.client.from('doctors').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return {
      doctorId: data.id,
      doctorName: { ar: data.name_ar, en: data.name_en },
      title: { ar: data.title_ar, en: data.title_en },
      avatar: data.avatar_url,
      isActive: data.is_active,
      services: data.services,
      weeklyHours: data.weekly_hours,
    };
  }

  async resetDemoData(): Promise<void> {
    // No-op on live Supabase
    console.info('[SupabaseBookingService] resetDemoData is not applicable on live database');
  }

  private mapAppointmentRow(row: any): Appointment {
    return {
      id: row.id,
      bookingCode: row.booking_code,
      patientName: row.patient_name,
      patientPhone: row.patient_phone,
      patientEmail: row.patient_email || undefined,
      patientType: row.patient_type,
      serviceId: row.service_id,
      serviceName: { ar: row.service_name_ar, en: row.service_name_en },
      serviceDuration: row.service_duration,
      doctorId: row.doctor_id,
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.status,
      notes: row.notes || undefined,
      internalNotes: row.internal_notes || undefined,
      consentGiven: row.consent_given,
      isWalkIn: row.is_walk_in,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      cancelledAt: row.cancelled_at || undefined,
      cancellationReason: row.cancellation_reason || undefined,
    };
  }
}
