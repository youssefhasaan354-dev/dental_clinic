/**
 * Hayaah Dental Clinic - Firebase Production Booking Adapter
 * Connects to Google Cloud Firestore with real-time double-booking prevention,
 * transactional atomic slot claiming, and strict patient privacy separation.
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
  getSlotDocId,
  getServiceSlotBlocks,
  getSlotDocIdsForBooking,
  generateManageToken,
  hashPhoneForLookup,
} from './slotUtils';
import { INITIAL_DOCTORS, INITIAL_BLOCKED_SLOTS } from './seedData';
import { notify } from './notificationService';
import { getFirebaseFirestore } from '../firebase/client';

export class FirebaseBookingService implements IBookingService {
  readonly isDemo = false;

  private async getDB() {
    return getFirebaseFirestore();
  }

  // --- Public Booking Methods ---

  async getAvailability(date: string, serviceId?: string, doctorId?: string): Promise<DayAvailability> {
    const db = await this.getDB();
    const { collection, getDocs, query, where } = await import('firebase/firestore');

    const [doctorsRes, blockedRes, slotsRes, settingsRes] = await Promise.all([
      this.getDoctors(),
      this.getBlockedSlots({ from: date, to: date }),
      getDocs(query(collection(db, 'slots'), where('date', '==', date))),
      this.getSettings(),
    ]);

    // Public reads from slots collection (which contains ZERO patient data)
    const slotAppointments: Appointment[] = slotsRes.docs.map((d) => {
      const data = d.data();
      return {
        id: data.appointmentId || d.id,
        bookingCode: '',
        patientName: '',
        patientPhone: '',
        patientType: 'new',
        serviceId: '',
        serviceName: { ar: '', en: '' },
        serviceDuration: 30,
        doctorId: data.doctorId,
        date: data.date,
        startTime: data.startTime,
        endTime: addMinutesToTime(data.startTime, 30),
        status: 'confirmed',
        consentGiven: true,
        createdAt: '',
        updatedAt: '',
      };
    });

    const duration = serviceId
      ? SERVICE_DURATIONS[serviceId] || settingsRes.slotDurationMinutes
      : settingsRes.slotDurationMinutes;

    return computeDayAvailability({
      date,
      serviceDurationMinutes: duration,
      doctorId,
      existingAppointments: slotAppointments,
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
    // 1. Anti-spam honeypot
    if (data.honeypot) {
      return { success: true };
    }

    // 2. Validate and normalize Egyptian phone number
    const phoneCheck = validateAndNormalizeEgyptianPhone(data.patientPhone);
    if (!phoneCheck.isValid) {
      return {
        success: false,
        error: 'يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678 أو 0226355669) / Please enter a valid Egyptian phone number',
      };
    }

    const db = await this.getDB();
    const { collection, doc, runTransaction } = await import('firebase/firestore');

    const [settings, doctors] = await Promise.all([this.getSettings(), this.getDoctors()]);
    const duration = SERVICE_DURATIONS[data.serviceId] || settings.slotDurationMinutes;
    const endTime = addMinutesToTime(data.startTime, duration);
    const blocks = getServiceSlotBlocks(data.startTime, duration);
    const bookingCode = generateBookingCode();
    const manageToken = generateManageToken();
    const phoneHash = await hashPhoneForLookup(phoneCheck.normalized);
    const nowIso = new Date().toISOString();

    // Determine candidate doctors
    const isAnyDoctor = !data.doctorId || data.doctorId === 'any';
    const candidateDoctors = isAnyDoctor
      ? doctors.filter((d) => d.isActive)
      : doctors.filter((d) => d.doctorId === data.doctorId && d.isActive);

    if (candidateDoctors.length === 0) {
      return {
        success: false,
        error: 'لا يوجد أطباء متاحون في هذا التخصص حالياً / No active doctors found for this service',
      };
    }

    try {
      const createdAppointment = await runTransaction(db, async (tx) => {
        // Step A: All Firestore transaction READS must happen first
        const doctorAvailability: {
          doctor: DoctorSchedule;
          slotRefs: any[];
          isAvailable: boolean;
        }[] = [];

        for (const docObj of candidateDoctors) {
          const slotRefs = blocks.map((b) => doc(db, 'slots', getSlotDocId(docObj.doctorId, data.date, b)));
          const slotSnaps = await Promise.all(slotRefs.map((ref) => tx.get(ref)));
          const isAvailable = slotSnaps.every((snap) => !snap.exists());

          doctorAvailability.push({
            doctor: docObj,
            slotRefs,
            isAvailable,
          });
        }

        // Find first doctor whose required blocks are 100% free
        const chosen = doctorAvailability.find((d) => d.isAvailable);
        if (!chosen) {
          throw new Error('SLOT_TAKEN');
        }

        const chosenDoctor = chosen.doctor;
        const apptRef = doc(collection(db, 'appointments'));
        const lookupRef = doc(db, 'bookingLookup', manageToken);

        const appointmentPayload: Appointment = {
          id: apptRef.id,
          bookingCode,
          manageToken,
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
          doctorId: chosenDoctor.doctorId,
          doctorName: { ar: chosenDoctor.doctorName.ar, en: chosenDoctor.doctorName.en },
          date: data.date,
          startTime: data.startTime,
          endTime,
          status: settings.autoConfirm ? 'confirmed' : 'pending',
          notes: data.notes?.trim() || undefined,
          consentGiven: data.consentGiven,
          isWalkIn: Boolean(data.isWalkIn),
          createdAt: nowIso,
          updatedAt: nowIso,
        };

        const lookupPayload = {
          appointmentId: apptRef.id,
          bookingCode,
          manageToken,
          date: data.date,
          startTime: data.startTime,
          endTime,
          serviceId: data.serviceId,
          serviceName: appointmentPayload.serviceName,
          serviceDuration: duration,
          doctorId: chosenDoctor.doctorId,
          doctorName: appointmentPayload.doctorName,
          status: appointmentPayload.status,
          phoneHash,
          createdAt: nowIso,
        };

        // Step B: All Firestore transaction WRITES
        // 1. Claim deterministic slot docs
        blocks.forEach((block) => {
          const slotDocRef = doc(db, 'slots', getSlotDocId(chosenDoctor.doctorId, data.date, block));
          tx.set(slotDocRef, {
            doctorId: chosenDoctor.doctorId,
            date: data.date,
            startTime: block,
            appointmentId: apptRef.id,
            createdAt: nowIso,
          });
        });

        // 2. Create appointment document (private, staff only)
        tx.set(apptRef, appointmentPayload);

        // 3. Create bookingLookup document (public patient self-service by token)
        tx.set(lookupRef, lookupPayload);

        return appointmentPayload;
      });

      notify({ type: 'booking_created', appointment: createdAppointment });
      return { success: true, appointment: createdAppointment };
    } catch (err: any) {
      if (err.message === 'SLOT_TAKEN') {
        return {
          success: false,
          error: 'عفواً، تم حجز هذا الموعد للتو! يرجى اختيار موعد آخر / This slot was just taken. Please choose another time.',
        };
      }
      return { success: false, error: err.message || 'Failed to book appointment' };
    }
  }

  // --- Patient Self-Service via manageToken ---

  async getAppointmentByToken(token: string): Promise<Appointment | null> {
    if (!token) return null;
    const db = await this.getDB();
    const { doc, getDoc } = await import('firebase/firestore');

    const snap = await getDoc(doc(db, 'bookingLookup', token.trim()));
    if (!snap.exists()) return null;

    const d = snap.data();
    return {
      id: d.appointmentId,
      bookingCode: d.bookingCode,
      manageToken: token.trim(),
      patientName: d.patientName || '',
      patientPhone: '', // Not exposed publicly in lookup doc for patient privacy
      patientType: 'returning',
      serviceId: d.serviceId,
      serviceName: d.serviceName,
      serviceDuration: d.serviceDuration,
      doctorId: d.doctorId,
      doctorName: d.doctorName,
      date: d.date,
      startTime: d.startTime,
      endTime: d.endTime,
      status: d.status,
      consentGiven: true,
      createdAt: d.createdAt,
      updatedAt: d.createdAt,
    };
  }

  async cancelAppointmentByToken(
    token: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    const apt = await this.getAppointmentByToken(token);
    if (!apt) {
      return { success: false, error: 'Appointment not found' };
    }

    const settings = await this.getSettings();
    const check = canCancelAppointment(apt, settings);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    const db = await this.getDB();
    const { doc, runTransaction } = await import('firebase/firestore');
    const nowIso = new Date().toISOString();
    const slotDocIds = getSlotDocIdsForBooking(apt.doctorId, apt.date, apt.startTime, apt.serviceDuration);

    try {
      await runTransaction(db, async (tx) => {
        // Delete all occupied slot documents
        slotDocIds.forEach((slotId) => {
          tx.delete(doc(db, 'slots', slotId));
        });

        // Update bookingLookup
        tx.update(doc(db, 'bookingLookup', token), {
          status: 'cancelled',
          cancelledAt: nowIso,
          cancellationReason: reason || 'Cancelled by patient online',
        });

        // Update appointment
        tx.update(doc(db, 'appointments', apt.id), {
          status: 'cancelled',
          cancelledAt: nowIso,
          cancellationReason: reason || 'Cancelled by patient online',
          updatedAt: nowIso,
        });
      });

      notify({
        type: 'booking_cancelled',
        appointment: { ...apt, status: 'cancelled' },
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to cancel appointment' };
    }
  }

  async rescheduleAppointmentByToken(params: {
    token: string;
    newDate: string;
    newStartTime: string;
    newDoctorId?: string;
  }): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
    const apt = await this.getAppointmentByToken(params.token);
    if (!apt) {
      return { success: false, error: 'Appointment not found' };
    }

    const settings = await this.getSettings();
    const check = canCancelAppointment(apt, settings);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    const db = await this.getDB();
    const { doc, runTransaction } = await import('firebase/firestore');

    const chosenDoctorId = params.newDoctorId || apt.doctorId;
    const newEndTime = addMinutesToTime(params.newStartTime, apt.serviceDuration);
    const oldSlotIds = getSlotDocIdsForBooking(apt.doctorId, apt.date, apt.startTime, apt.serviceDuration);
    const newBlocks = getServiceSlotBlocks(params.newStartTime, apt.serviceDuration);
    const newSlotIds = newBlocks.map((b) => getSlotDocId(chosenDoctorId, params.newDate, b));
    const nowIso = new Date().toISOString();

    try {
      const updated = await runTransaction(db, async (tx) => {
        // Read new slots to prevent double-booking
        const newSlotSnaps = await Promise.all(
          newSlotIds.map((id) => tx.get(doc(db, 'slots', id)))
        );

        const isCollision = newSlotSnaps.some((snap) => {
          if (!snap.exists()) return false;
          // OK if the existing slot doc belongs to this same appointment
          return snap.data()?.appointmentId !== apt.id;
        });

        if (isCollision) {
          throw new Error('SLOT_TAKEN');
        }

        // Delete old slot docs
        oldSlotIds.forEach((id) => {
          tx.delete(doc(db, 'slots', id));
        });

        // Create new slot docs
        newBlocks.forEach((block) => {
          const slotId = getSlotDocId(chosenDoctorId, params.newDate, block);
          tx.set(doc(db, 'slots', slotId), {
            doctorId: chosenDoctorId,
            date: params.newDate,
            startTime: block,
            appointmentId: apt.id,
            createdAt: nowIso,
          });
        });

        // Update bookingLookup
        tx.update(doc(db, 'bookingLookup', params.token), {
          date: params.newDate,
          startTime: params.newStartTime,
          endTime: newEndTime,
          doctorId: chosenDoctorId,
          status: settings.autoConfirm ? 'confirmed' : 'pending',
          updatedAt: nowIso,
        });

        // Update appointment
        tx.update(doc(db, 'appointments', apt.id), {
          date: params.newDate,
          startTime: params.newStartTime,
          endTime: newEndTime,
          doctorId: chosenDoctorId,
          status: settings.autoConfirm ? 'confirmed' : 'pending',
          updatedAt: nowIso,
        });

        return {
          ...apt,
          date: params.newDate,
          startTime: params.newStartTime,
          endTime: newEndTime,
          doctorId: chosenDoctorId,
          status: (settings.autoConfirm ? 'confirmed' : 'pending') as AppointmentStatus,
        };
      });

      notify({ type: 'booking_rescheduled', appointment: updated });
      return { success: true, appointment: updated };
    } catch (err: any) {
      if (err.message === 'SLOT_TAKEN') {
        return {
          success: false,
          error: 'عفواً، تم حجز هذا الموعد للتو! يرجى اختيار موعد آخر / This slot was just taken. Please choose another time.',
        };
      }
      return { success: false, error: err.message || 'Failed to reschedule appointment' };
    }
  }

  // --- Staff Lookup by Code + Phone ---

  async getAppointmentByCode(code: string, phone: string): Promise<Appointment | null> {
    const db = await this.getDB();
    const { collection, getDocs, query, where } = await import('firebase/firestore');

    const phoneCheck = validateAndNormalizeEgyptianPhone(phone);
    const q = query(collection(db, 'appointments'), where('bookingCode', '==', code.trim().toUpperCase()));
    const snap = await getDocs(q);

    if (snap.empty) return null;
    const docData = snap.docs[0].data() as Appointment;

    // Verify phone match
    const stored = (docData.patientPhone || '').replace(/\D/g, '');
    const input = phoneCheck.normalized.replace(/\D/g, '');
    if (stored !== input) return null;

    return { ...docData, id: snap.docs[0].id };
  }

  async cancelAppointment(
    code: string,
    phone: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    const apt = await this.getAppointmentByCode(code, phone);
    if (!apt) return { success: false, error: 'Appointment not found' };
    if (apt.manageToken) {
      return this.cancelAppointmentByToken(apt.manageToken, reason);
    }

    const settings = await this.getSettings();
    const check = canCancelAppointment(apt, settings);
    if (!check.allowed) return { success: false, error: check.reason };

    const db = await this.getDB();
    const { doc, runTransaction } = await import('firebase/firestore');
    const slotDocIds = getSlotDocIdsForBooking(apt.doctorId, apt.date, apt.startTime, apt.serviceDuration);
    const nowIso = new Date().toISOString();

    await runTransaction(db, async (tx) => {
      slotDocIds.forEach((id) => tx.delete(doc(db, 'slots', id)));
      tx.update(doc(db, 'appointments', apt.id), {
        status: 'cancelled',
        cancelledAt: nowIso,
        cancellationReason: reason || 'Cancelled by patient',
        updatedAt: nowIso,
      });
    });

    notify({ type: 'booking_cancelled', appointment: { ...apt, status: 'cancelled' } });
    return { success: true };
  }

  async rescheduleAppointment(
    params: RescheduleAppointmentDTO
  ): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
    const apt = await this.getAppointmentByCode(params.bookingCode, params.patientPhone);
    if (!apt) return { success: false, error: 'Appointment not found' };
    if (apt.manageToken) {
      return this.rescheduleAppointmentByToken({
        token: apt.manageToken,
        newDate: params.newDate,
        newStartTime: params.newStartTime,
        newDoctorId: params.newDoctorId,
      });
    }

    const db = await this.getDB();
    const { doc, runTransaction } = await import('firebase/firestore');
    const chosenDoctorId = params.newDoctorId || apt.doctorId;
    const newEndTime = addMinutesToTime(params.newStartTime, apt.serviceDuration);
    const oldSlotIds = getSlotDocIdsForBooking(apt.doctorId, apt.date, apt.startTime, apt.serviceDuration);
    const newBlocks = getServiceSlotBlocks(params.newStartTime, apt.serviceDuration);
    const newSlotIds = newBlocks.map((b) => getSlotDocId(chosenDoctorId, params.newDate, b));
    const nowIso = new Date().toISOString();

    try {
      const updated = await runTransaction(db, async (tx) => {
        const snaps = await Promise.all(newSlotIds.map((id) => tx.get(doc(db, 'slots', id))));
        if (snaps.some((s) => s.exists() && s.data()?.appointmentId !== apt.id)) {
          throw new Error('SLOT_TAKEN');
        }

        oldSlotIds.forEach((id) => tx.delete(doc(db, 'slots', id)));
        newBlocks.forEach((block) => {
          tx.set(doc(db, 'slots', getSlotDocId(chosenDoctorId, params.newDate, block)), {
            doctorId: chosenDoctorId,
            date: params.newDate,
            startTime: block,
            appointmentId: apt.id,
            createdAt: nowIso,
          });
        });

        tx.update(doc(db, 'appointments', apt.id), {
          date: params.newDate,
          startTime: params.newStartTime,
          endTime: newEndTime,
          doctorId: chosenDoctorId,
          updatedAt: nowIso,
        });

        return {
          ...apt,
          date: params.newDate,
          startTime: params.newStartTime,
          endTime: newEndTime,
          doctorId: chosenDoctorId,
        };
      });

      notify({ type: 'booking_rescheduled', appointment: updated });
      return { success: true, appointment: updated };
    } catch (err: any) {
      if (err.message === 'SLOT_TAKEN') {
        return {
          success: false,
          error: 'عفواً، تم حجز هذا الموعد للتو! يرجى اختيار موعد آخر / This slot was just taken.',
        };
      }
      return { success: false, error: err.message };
    }
  }

  // --- Admin Methods ---

  async listAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {
    const db = await this.getDB();
    const { collection, getDocs, query, orderBy } = await import('firebase/firestore');

    const snap = await getDocs(query(collection(db, 'appointments'), orderBy('date', 'desc')));
    let appointments: Appointment[] = snap.docs.map((d) => ({
      ...(d.data() as Appointment),
      id: d.id,
    }));

    if (filters?.status && filters.status !== 'all') {
      appointments = appointments.filter((a) => a.status === filters.status);
    }
    if (filters?.doctorId && filters.doctorId !== 'all') {
      appointments = appointments.filter((a) => a.doctorId === filters.doctorId);
    }
    if (filters?.dateFrom) {
      appointments = appointments.filter((a) => a.date >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      appointments = appointments.filter((a) => a.date <= filters.dateTo!);
    }
    if (filters?.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase();
      appointments = appointments.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          a.patientPhone.includes(q) ||
          a.bookingCode.toLowerCase().includes(q)
      );
    }

    return appointments;
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
    internalNotes?: string
  ): Promise<Appointment> {
    const db = await this.getDB();
    const { doc, getDoc, updateDoc } = await import('firebase/firestore');

    const apptRef = doc(db, 'appointments', id);
    const snap = await getDoc(apptRef);
    if (!snap.exists()) throw new Error('Appointment not found');

    const apt = { ...(snap.data() as Appointment), id };
    const updates: any = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (internalNotes !== undefined) updates.internalNotes = internalNotes;

    await updateDoc(apptRef, updates);

    // If cancelled by staff, delete the slot docs
    if (status === 'cancelled') {
      const slotDocIds = getSlotDocIdsForBooking(apt.doctorId, apt.date, apt.startTime, apt.serviceDuration);
      const { deleteDoc } = await import('firebase/firestore');
      await Promise.all(slotDocIds.map((sid) => deleteDoc(doc(db, 'slots', sid))));
    }

    // Update bookingLookup if manageToken exists
    if (apt.manageToken) {
      try {
        await updateDoc(doc(db, 'bookingLookup', apt.manageToken), { status });
      } catch (err) {
        console.warn('Could not update bookingLookup doc:', err);
      }
    }

    const updated = { ...apt, ...updates };
    if (status === 'confirmed') {
      notify({ type: 'booking_confirmed', appointment: updated });
    }
    return updated;
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const db = await this.getDB();
    const { doc, getDoc, updateDoc } = await import('firebase/firestore');

    const apptRef = doc(db, 'appointments', id);
    const snap = await getDoc(apptRef);
    if (!snap.exists()) throw new Error('Appointment not found');

    const payload = { ...updates, updatedAt: new Date().toISOString() };
    await updateDoc(apptRef, payload);

    return { ...(snap.data() as Appointment), ...payload, id };
  }

  async blockSlot(data: Omit<BlockedSlot, 'id' | 'createdAt'>): Promise<BlockedSlot> {
    const db = await this.getDB();
    const { collection, addDoc } = await import('firebase/firestore');

    const docData = {
      ...data,
      createdAt: new Date().toISOString(),
    };
    const res = await addDoc(collection(db, 'blocked_slots'), docData);

    return {
      id: res.id,
      ...docData,
    };
  }

  async unblockSlot(id: string): Promise<boolean> {
    const db = await this.getDB();
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'blocked_slots', id));
    return true;
  }

  async getBlockedSlots(dateRange?: { from?: string; to?: string }): Promise<BlockedSlot[]> {
    const db = await this.getDB();
    const { collection, getDocs } = await import('firebase/firestore');

    const snap = await getDocs(collection(db, 'blocked_slots'));
    let slots = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<BlockedSlot, 'id'>),
    }));

    if (slots.length === 0) {
      slots = INITIAL_BLOCKED_SLOTS;
    }

    if (dateRange?.from) {
      slots = slots.filter((s) => s.date >= dateRange.from!);
    }
    if (dateRange?.to) {
      slots = slots.filter((s) => s.date <= dateRange.to!);
    }

    return slots;
  }

  async getSettings(): Promise<BookingSettings> {
    const db = await this.getDB();
    const { doc, getDoc } = await import('firebase/firestore');

    const snap = await getDoc(doc(db, 'booking_settings', 'global'));
    if (!snap.exists()) return DEFAULT_BOOKING_SETTINGS;
    return snap.data() as BookingSettings;
  }

  async updateSettings(settings: Partial<BookingSettings>): Promise<BookingSettings> {
    const db = await this.getDB();
    const { doc, setDoc } = await import('firebase/firestore');

    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    await setDoc(doc(db, 'booking_settings', 'global'), updated);
    return updated;
  }

  async listPatients(): Promise<PatientRecord[]> {
    const appointments = await this.listAppointments();
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
          lastService: apt.serviceName?.ar || '',
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
    const db = await this.getDB();
    const { collection, getDocs, query, where, deleteDoc } = await import('firebase/firestore');

    const q = query(collection(db, 'appointments'), where('patientPhone', '==', phone));
    const snap = await getDocs(q);

    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    return true;
  }

  async getStats(): Promise<BookingStats> {
    const appointments = await this.listAppointments();
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
    const db = await this.getDB();
    const { collection, getDocs } = await import('firebase/firestore');

    const snap = await getDocs(collection(db, 'doctors'));
    if (snap.empty) {
      return INITIAL_DOCTORS;
    }

    return snap.docs.map((d) => {
      const data = d.data();
      return {
        doctorId: d.id,
        doctorName: data.doctorName || { ar: data.name_ar || '', en: data.name_en || '' },
        title: data.title || { ar: data.title_ar || '', en: data.title_en || '' },
        avatar: data.avatar || data.avatar_url,
        isActive: data.isActive !== undefined ? data.isActive : data.is_active !== undefined ? data.is_active : true,
        services: data.services || ['*'],
        weeklyHours: data.weeklyHours || data.weekly_hours || INITIAL_DOCTORS[0].weeklyHours,
      };
    });
  }

  async updateDoctor(id: string, updates: Partial<DoctorSchedule>): Promise<DoctorSchedule> {
    const db = await this.getDB();
    const { doc, setDoc } = await import('firebase/firestore');

    const doctors = await this.getDoctors();
    const existing = doctors.find((d) => d.doctorId === id) || INITIAL_DOCTORS[0];
    const updated = { ...existing, ...updates, doctorId: id };

    await setDoc(doc(db, 'doctors', id), updated);
    return updated;
  }

  async resetDemoData(): Promise<void> {
    console.info('[FirebaseBookingService] resetDemoData is not applicable on live Firebase database.');
  }

  // --- Helpers ---

  private getServiceNameAr(id: string): string {
    const names: Record<string, string> = {
      'checkup-cleaning': 'كشف دوري وتنظيف الأسنان',
      'scaling-polishing': 'إزالة الجير وتلميع الأسنان',
      'teeth-whitening': 'تبييض الأسنان الاحترافي',
      'laser-whitening': 'تبييض الأسنان بالليزر',
      'root-canal': 'علاج وجذور الأسنان',
      'endodontics': 'حشو العصب المتقدم',
      'dental-implants': 'زراعة الأسنان الألمانية',
      'implants-consult': 'استشارة زراعة الأسنان',
      'cosmetic-fillings': 'الحشوات التجميلية الضوئية',
      'veneers-hollywood': 'ابتسامة هوليوود والفينير',
      'pediatric-dentistry': 'طب أسنان الأطفال',
      'orthodontics-consult': 'استشارة تقويم الأسنان',
      'general-checkup': 'كشف عام واستشارة طبية',
    };
    return names[id] || 'كشف واستشارة طبية';
  }

  private getServiceNameEn(id: string): string {
    const names: Record<string, string> = {
      'checkup-cleaning': 'Checkup & Deep Cleaning',
      'scaling-polishing': 'Scaling & Teeth Polishing',
      'teeth-whitening': 'Professional Whitening',
      'laser-whitening': 'Laser Teeth Whitening',
      'root-canal': 'Root Canal Treatment',
      'endodontics': 'Advanced Endodontics',
      'dental-implants': 'German Dental Implants',
      'implants-consult': 'Implants Consultation',
      'cosmetic-fillings': 'Cosmetic Composite Fillings',
      'veneers-hollywood': 'Hollywood Smile & Veneers',
      'pediatric-dentistry': 'Pediatric Dentistry',
      'orthodontics-consult': 'Orthodontics Consultation',
      'general-checkup': 'General Consultation',
    };
    return names[id] || 'General Dental Consultation';
  }
}
