/**
 * Hayaah Dental Clinic - Demo Booking Service Adapter (Default)
 *
 * Implements IBookingService using localStorage with an in-memory fallback.
 * Seeded with ~40 realistic sample appointments, doctors, lunch breaks, and rules.
 * Safe against double booking, includes Egyptian phone normalization, and rate limits.
 */

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
import {
  INITIAL_DOCTORS,
  INITIAL_BLOCKED_SLOTS,
  generateSeedAppointments,
} from './seedData';
import { notify } from './notificationService';

const STORAGE_KEYS = {
  APPOINTMENTS: 'hayaah_appointments_v1',
  DOCTORS: 'hayaah_doctors_v1',
  BLOCKED_SLOTS: 'hayaah_blocked_slots_v1',
  SETTINGS: 'hayaah_booking_settings_v1',
  INITIALIZED: 'hayaah_booking_initialized_v1',
};

export class DemoBookingService implements IBookingService {
  readonly isDemo = true;

  // In-memory fallback if localStorage is disabled or throws
  private memoryStore: Record<string, any> = {};

  constructor() {
    this.ensureInitialized();
  }

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        if (item) return JSON.parse(item);
      }
    } catch (e) {
      console.warn(`[DemoBookingService] localStorage read failed for ${key}, using memory:`, e);
    }
    return this.memoryStore[key] !== undefined ? this.memoryStore[key] : defaultValue;
  }

  private setItem<T>(key: string, value: T): void {
    this.memoryStore[key] = value;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      console.warn(`[DemoBookingService] localStorage write failed for ${key}:`, e);
    }
  }

  private ensureInitialized(): void {
    const initialized = this.getItem<boolean>(STORAGE_KEYS.INITIALIZED, false);
    if (!initialized) {
      this.setItem(STORAGE_KEYS.APPOINTMENTS, generateSeedAppointments());
      this.setItem(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
      this.setItem(STORAGE_KEYS.BLOCKED_SLOTS, INITIAL_BLOCKED_SLOTS);
      this.setItem(STORAGE_KEYS.SETTINGS, DEFAULT_BOOKING_SETTINGS);
      this.setItem(STORAGE_KEYS.INITIALIZED, true);
    }
  }

  // --- Public Booking Methods ---

  async getAvailability(date: string, serviceId?: string, doctorId?: string): Promise<DayAvailability> {
    const appointments = this.getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    const doctors = this.getItem<DoctorSchedule[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    const blockedSlots = this.getItem<BlockedSlot[]>(STORAGE_KEYS.BLOCKED_SLOTS, []);
    const settings = this.getItem<BookingSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_BOOKING_SETTINGS);

    const duration = serviceId ? SERVICE_DURATIONS[serviceId] || settings.slotDurationMinutes : settings.slotDurationMinutes;

    return computeDayAvailability({
      date,
      serviceDurationMinutes: duration,
      doctorId,
      existingAppointments: appointments,
      blockedSlots,
      doctors,
      settings,
    });
  }

  async createAppointment(data: CreateAppointmentDTO): Promise<{
    success: boolean;
    appointment?: Appointment;
    error?: string;
  }> {
    // 1. Honeypot check
    if (data.honeypot) {
      console.warn('[DemoBookingService] Spam honeypot triggered');
      return { success: true };
    }

    // 2. Validate & normalize phone
    const phoneCheck = validateAndNormalizeEgyptianPhone(data.patientPhone);
    if (!phoneCheck.isValid) {
      return {
        success: false,
        error: 'يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678 أو 0226355669) / Please enter a valid Egyptian phone number',
      };
    }

    const appointments = this.getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    const doctors = this.getItem<DoctorSchedule[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    const blockedSlots = this.getItem<BlockedSlot[]>(STORAGE_KEYS.BLOCKED_SLOTS, []);
    const settings = this.getItem<BookingSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_BOOKING_SETTINGS);

    // 3. Simple Rate Limiting: max 3 bookings per phone per day
    const todayStr = formatCairoDate(getCairoNow());
    const phoneTodayCount = appointments.filter((apt) => {
      const aptCreatedDate = apt.createdAt.split('T')[0];
      return apt.patientPhone === phoneCheck.normalized && aptCreatedDate === todayStr;
    }).length;

    if (phoneTodayCount >= 3) {
      return {
        success: false,
        error: 'تم تجاوز الحد الأقصى المسموح للحجوزات اليومية لهذا الرقم (3 حجوزات) / Daily booking limit reached (max 3 bookings per day)',
      };
    }

    // 4. Double booking prevention: Re-check availability right before writing
    const duration = SERVICE_DURATIONS[data.serviceId] || settings.slotDurationMinutes;
    const availability = computeDayAvailability({
      date: data.date,
      serviceDurationMinutes: duration,
      doctorId: data.doctorId,
      existingAppointments: appointments,
      blockedSlots,
      doctors,
      settings,
    });

    const targetSlot = availability.slots.find((s) => s.time === data.startTime);
    if (!targetSlot || !targetSlot.isAvailable) {
      return {
        success: false,
        error: 'عفواً، تم حجز هذا الموعد للتو أو لم يعد متاحاً! يرجى اختيار موعد آخر / This slot was just taken. Please choose another time.',
      };
    }

    // 5. Build appointment entity
    const assignedDoctorId = data.doctorId && data.doctorId !== 'any' ? data.doctorId : (targetSlot.doctorId || 'doc-ortho');
    const doctorObj = doctors.find((d) => d.doctorId === assignedDoctorId);
    const endTime = addMinutesToTime(data.startTime, duration);
    const bookingCode = generateBookingCode();
    const nowIso = new Date().toISOString();

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      bookingCode,
      patientName: data.patientName.trim(),
      patientPhone: phoneCheck.normalized,
      patientEmail: data.patientEmail?.trim() || undefined,
      patientType: data.patientType || 'new',
      serviceId: data.serviceId,
      serviceName: {
        ar: this.getServiceNameAr(data.serviceId),
        en: this.getServiceNameEn(data.serviceId),
      },
      serviceDuration: duration,
      doctorId: assignedDoctorId,
      doctorName: doctorObj ? { ar: doctorObj.doctorName.ar, en: doctorObj.doctorName.en } : undefined,
      date: data.date,
      startTime: data.startTime,
      endTime,
      status: settings.autoConfirm ? 'confirmed' : 'pending',
      notes: data.notes?.trim() || undefined,
      consentGiven: data.consentGiven,
      isWalkIn: data.isWalkIn,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    appointments.unshift(newAppointment);
    this.setItem(STORAGE_KEYS.APPOINTMENTS, appointments);

    // 6. Trigger notification dispatcher hook
    notify({
      type: 'booking_created',
      appointment: newAppointment,
    });

    return {
      success: true,
      appointment: newAppointment,
    };
  }

  async getAppointmentByCode(code: string, phone: string): Promise<Appointment | null> {
    const phoneCheck = validateAndNormalizeEgyptianPhone(phone);
    const cleanCode = code.trim().toUpperCase();

    const appointments = this.getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    const match = appointments.find((apt) => {
      const codeMatch = apt.bookingCode.toUpperCase() === cleanCode;
      const phoneMatch =
        apt.patientPhone === phoneCheck.normalized ||
        apt.patientPhone.replace(/\D/g, '') === phone.replace(/\D/g, '');
      return codeMatch && phoneMatch;
    });

    return match || null;
  }

  async cancelAppointment(code: string, phone: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    const apt = await this.getAppointmentByCode(code, phone);
    if (!apt) {
      return {
        success: false,
        error: 'لم يتم العثور على حجز يطابق هذا الكود ورقم الهاتف / Appointment not found matching code and phone',
      };
    }

    if (apt.status === 'cancelled') {
      return { success: false, error: 'هذا الموعد ملغي بالفعل / This appointment is already cancelled' };
    }

    const settings = this.getItem<BookingSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_BOOKING_SETTINGS);
    const cancelCheck = canCancelAppointment(apt, settings);
    if (!cancelCheck.allowed) {
      return { success: false, error: cancelCheck.reason };
    }

    const appointments = this.getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    const index = appointments.findIndex((a) => a.id === apt.id);
    if (index !== -1) {
      appointments[index] = {
        ...appointments[index],
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancellationReason: reason || 'إلغاء من قبل المريض عبر الموقع / Cancelled by patient online',
        updatedAt: new Date().toISOString(),
      };
      this.setItem(STORAGE_KEYS.APPOINTMENTS, appointments);

      notify({
        type: 'booking_cancelled',
        appointment: appointments[index],
      });
    }

    return { success: true };
  }

  async rescheduleAppointment(params: RescheduleAppointmentDTO): Promise<{
    success: boolean;
    appointment?: Appointment;
    error?: string;
  }> {
    const apt = await this.getAppointmentByCode(params.bookingCode, params.patientPhone);
    if (!apt) {
      return {
        success: false,
        error: 'لم يتم العثور على الحجز / Appointment not found',
      };
    }

    if (apt.status === 'cancelled') {
      return { success: false, error: 'لا يمكن تعديل موعد ملغي / Cannot reschedule a cancelled appointment' };
    }

    // Check slot availability on the new date
    const availability = await this.getAvailability(params.newDate, apt.serviceId, params.newDoctorId || apt.doctorId);
    const targetSlot = availability.slots.find((s) => s.time === params.newStartTime);

    if (!targetSlot || !targetSlot.isAvailable) {
      return {
        success: false,
        error: 'عفواً، الموعد الجديد غير متاح حالياً. يرجى اختيار موعد آخر / The requested slot is not available.',
      };
    }

    const appointments = this.getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    const index = appointments.findIndex((a) => a.id === apt.id);
    if (index === -1) return { success: false, error: 'Appointment not found' };

    const newEndTime = addMinutesToTime(params.newStartTime, apt.serviceDuration);
    const settings = this.getItem<BookingSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_BOOKING_SETTINGS);

    appointments[index] = {
      ...appointments[index],
      date: params.newDate,
      startTime: params.newStartTime,
      endTime: newEndTime,
      doctorId: params.newDoctorId || targetSlot.doctorId || apt.doctorId,
      status: settings.autoConfirm ? 'confirmed' : 'pending',
      updatedAt: new Date().toISOString(),
    };

    this.setItem(STORAGE_KEYS.APPOINTMENTS, appointments);

    notify({
      type: 'booking_rescheduled',
      appointment: appointments[index],
    });

    return {
      success: true,
      appointment: appointments[index],
    };
  }

  // --- Admin Methods ---

  async listAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {
    let list = this.getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);

    if (!filters) return list;

    if (filters.status && filters.status !== 'all') {
      list = list.filter((a) => a.status === filters.status);
    }

    if (filters.doctorId && filters.doctorId !== 'all') {
      list = list.filter((a) => a.doctorId === filters.doctorId);
    }

    if (filters.serviceId && filters.serviceId !== 'all') {
      list = list.filter((a) => a.serviceId === filters.serviceId);
    }

    if (filters.dateFrom) {
      list = list.filter((a) => a.date >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      list = list.filter((a) => a.date <= filters.dateTo!);
    }

    if (filters.searchQuery?.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          a.patientPhone.includes(q) ||
          a.bookingCode.toLowerCase().includes(q)
      );
    }

    // Sort by date descending, then startTime descending
    list.sort((a, b) => {
      const cmp = b.date.localeCompare(a.date);
      if (cmp !== 0) return cmp;
      return b.startTime.localeCompare(a.startTime);
    });

    return list;
  }

  async updateStatus(id: string, status: AppointmentStatus, internalNotes?: string): Promise<Appointment> {
    const list = this.getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) throw new Error(`Appointment with ID ${id} not found`);

    list[index] = {
      ...list[index],
      status,
      internalNotes: internalNotes !== undefined ? internalNotes : list[index].internalNotes,
      updatedAt: new Date().toISOString(),
    };

    this.setItem(STORAGE_KEYS.APPOINTMENTS, list);

    if (status === 'confirmed') {
      notify({ type: 'booking_confirmed', appointment: list[index] });
    }

    return list[index];
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const list = this.getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) throw new Error(`Appointment ${id} not found`);

    list[index] = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.setItem(STORAGE_KEYS.APPOINTMENTS, list);
    return list[index];
  }

  async blockSlot(data: Omit<BlockedSlot, 'id' | 'createdAt'>): Promise<BlockedSlot> {
    const blocked = this.getItem<BlockedSlot[]>(STORAGE_KEYS.BLOCKED_SLOTS, []);
    const newBlock: BlockedSlot = {
      ...data,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    blocked.push(newBlock);
    this.setItem(STORAGE_KEYS.BLOCKED_SLOTS, blocked);
    return newBlock;
  }

  async unblockSlot(id: string): Promise<boolean> {
    const blocked = this.getItem<BlockedSlot[]>(STORAGE_KEYS.BLOCKED_SLOTS, []);
    const filtered = blocked.filter((b) => b.id !== id);
    this.setItem(STORAGE_KEYS.BLOCKED_SLOTS, filtered);
    return filtered.length !== blocked.length;
  }

  async getBlockedSlots(dateRange?: { from?: string; to?: string }): Promise<BlockedSlot[]> {
    let blocked = this.getItem<BlockedSlot[]>(STORAGE_KEYS.BLOCKED_SLOTS, []);
    if (dateRange?.from) blocked = blocked.filter((b) => b.date >= dateRange.from!);
    if (dateRange?.to) blocked = blocked.filter((b) => b.date <= dateRange.to!);
    return blocked;
  }

  async getSettings(): Promise<BookingSettings> {
    return this.getItem<BookingSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_BOOKING_SETTINGS);
  }

  async updateSettings(settings: Partial<BookingSettings>): Promise<BookingSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    this.setItem(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }

  async listPatients(): Promise<PatientRecord[]> {
    const appointments = this.getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    const patientMap = new Map<string, PatientRecord>();

    for (const apt of appointments) {
      const phone = apt.patientPhone;
      const existing = patientMap.get(phone);

      if (!existing) {
        patientMap.set(phone, {
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
          existing.lastService = apt.serviceName.ar;
        }
      }
    }

    return Array.from(patientMap.values()).sort((a, b) => b.appointmentsCount - a.appointmentsCount);
  }

  async deletePatient(phone: string): Promise<boolean> {
    const appointments = this.getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    const filtered = appointments.filter((a) => a.patientPhone !== phone);
    this.setItem(STORAGE_KEYS.APPOINTMENTS, filtered);
    return true;
  }

  async getStats(): Promise<BookingStats> {
    const appointments = this.getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    const todayStr = formatCairoDate(getCairoNow());

    const todayApts = appointments.filter((a) => a.date === todayStr);
    const todayPending = todayApts.filter((a) => a.status === 'pending').length;
    const todayConfirmed = todayApts.filter((a) => a.status === 'confirmed').length;

    const pendingConfirmations = appointments.filter((a) => a.status === 'pending').length;
    const completedAppointments = appointments.filter((a) => a.status === 'completed').length;
    const cancelledAppointments = appointments.filter((a) => a.status === 'cancelled').length;
    const noShowAppointments = appointments.filter((a) => a.status === 'no_show').length;

    const totalPast = completedAppointments + noShowAppointments;
    const noShowRate = totalPast > 0 ? Math.round((noShowAppointments / totalPast) * 100) : 0;

    const newPatientsCount = appointments.filter((a) => a.patientType === 'new').length;

    return {
      todayTotal: todayApts.length,
      todayPending,
      todayConfirmed,
      thisWeekTotal: appointments.filter((a) => Math.abs(a.date.localeCompare(todayStr)) <= 3).length,
      pendingConfirmations,
      noShowRate,
      newPatientsCount,
      totalAppointments: appointments.length,
      completedAppointments,
      cancelledAppointments,
    };
  }

  async getDoctors(): Promise<DoctorSchedule[]> {
    return this.getItem<DoctorSchedule[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
  }

  async updateDoctor(id: string, updates: Partial<DoctorSchedule>): Promise<DoctorSchedule> {
    const doctors = this.getItem<DoctorSchedule[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    const index = doctors.findIndex((d) => d.doctorId === id);
    if (index === -1) throw new Error(`Doctor ${id} not found`);

    doctors[index] = { ...doctors[index], ...updates };
    this.setItem(STORAGE_KEYS.DOCTORS, doctors);
    return doctors[index];
  }

  async resetDemoData(): Promise<void> {
    this.setItem(STORAGE_KEYS.APPOINTMENTS, generateSeedAppointments());
    this.setItem(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    this.setItem(STORAGE_KEYS.BLOCKED_SLOTS, INITIAL_BLOCKED_SLOTS);
    this.setItem(STORAGE_KEYS.SETTINGS, DEFAULT_BOOKING_SETTINGS);
    this.setItem(STORAGE_KEYS.INITIALIZED, true);
  }

  private getServiceNameAr(id: string): string {
    const names: Record<string, string> = {
      'scaling-polishing': 'تنظيف وتلميع الأسنان',
      'teeth-whitening': 'تبييض الأسنان بالليزر',
      'laser-whitening': 'تبييض الأسنان بالليزر',
      'root-canal': 'علاج جذور الأسنان وحشو العصب',
      'dental-implants': 'زراعة وتعويض الأسنان',
      'implants-consult': 'استشارة زراعة الأسنان',
      'cosmetic-fillings': 'حشو الأسنان التجميلي',
      'pediatric-dentistry': 'طب أسنان الأطفال',
      'orthodontics-consult': 'استشارة تقويم الأسنان',
      'general-checkup': 'كشف واستشارة عامة',
    };
    return names[id] || 'كشف واستشارة طبية';
  }

  private getServiceNameEn(id: string): string {
    const names: Record<string, string> = {
      'scaling-polishing': 'Scaling & Polishing',
      'teeth-whitening': 'Laser Teeth Whitening',
      'laser-whitening': 'Laser Teeth Whitening',
      'root-canal': 'Root Canal Treatment',
      'dental-implants': 'Dental Implants',
      'implants-consult': 'Dental Implants Consult',
      'cosmetic-fillings': 'Cosmetic Fillings',
      'pediatric-dentistry': 'Pediatric Dentistry',
      'orthodontics-consult': 'Orthodontics Consultation',
      'general-checkup': 'General Dental Checkup',
    };
    return names[id] || 'General Dental Consultation';
  }
}
