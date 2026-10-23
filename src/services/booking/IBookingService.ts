/**
 * Hayaah Dental Clinic - Booking Service Interface
 * All storage interactions go through this typed async contract.
 * Implemented by DemoBookingService and SupabaseBookingService.
 */

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

export interface IBookingService {
  readonly isDemo: boolean;

  // --- Public Booking Methods ---
  /**
   * Calculate live time slots for a specific date, service, and optional doctor
   */
  getAvailability(date: string, serviceId?: string, doctorId?: string): Promise<DayAvailability>;

  /**
   * Book a new appointment with double-booking prevention, validation, and anti-spam
   */
  createAppointment(data: CreateAppointmentDTO): Promise<{
    success: boolean;
    appointment?: Appointment;
    error?: string;
  }>;

  /**
   * Patient self-service lookup by booking code and verified phone
   */
  getAppointmentByCode(code: string, phone: string): Promise<Appointment | null>;

  /**
   * Patient self-service lookup by secret manageToken (no login required)
   */
  getAppointmentByToken?(token: string): Promise<Appointment | null>;

  /**
   * Cancel appointment respecting clinic cancellation window policy
   */
  cancelAppointment(
    code: string,
    phone: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }>;

  /**
   * Cancel appointment by patient manageToken
   */
  cancelAppointmentByToken?(
    token: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }>;

  /**
   * Reschedule an existing appointment to a new date/time
   */
  rescheduleAppointment(params: RescheduleAppointmentDTO): Promise<{
    success: boolean;
    appointment?: Appointment;
    error?: string;
  }>;

  /**
   * Reschedule appointment by patient manageToken
   */
  rescheduleAppointmentByToken?(params: {
    token: string;
    newDate: string;
    newStartTime: string;
    newDoctorId?: string;
  }): Promise<{
    success: boolean;
    appointment?: Appointment;
    error?: string;
  }>;

  // --- Admin Methods ---
  /**
   * Query appointments with flexible date, status, doctor, and text filters
   */
  listAppointments(filters?: AppointmentFilters): Promise<Appointment[]>;

  /**
   * Update appointment workflow status (pending -> confirmed -> completed/cancelled/no-show)
   */
  updateStatus(
    id: string,
    status: AppointmentStatus,
    internalNotes?: string
  ): Promise<Appointment>;

  /**
   * Full or partial edit of an existing appointment
   */
  updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment>;

  /**
   * Block a specific time range or whole day for a doctor or all clinic doctors
   */
  blockSlot(data: Omit<BlockedSlot, 'id' | 'createdAt'>): Promise<BlockedSlot>;

  /**
   * Remove a blocked slot
   */
  unblockSlot(id: string): Promise<boolean>;

  /**
   * Retrieve all blocked slots
   */
  getBlockedSlots(dateRange?: { from?: string; to?: string }): Promise<BlockedSlot[]>;

  /**
   * Get clinic booking configuration and rules
   */
  getSettings(): Promise<BookingSettings>;

  /**
   * Update clinic booking configuration
   */
  updateSettings(settings: Partial<BookingSettings>): Promise<BookingSettings>;

  /**
   * Get aggregated patient records with visit counts and history
   */
  listPatients(): Promise<PatientRecord[]>;

  /**
   * Delete patient history (privacy right)
   */
  deletePatient(phone: string): Promise<boolean>;

  /**
   * Get dashboard KPI numbers, rates, and totals
   */
  getStats(): Promise<BookingStats>;

  /**
   * Get all doctor schedules
   */
  getDoctors(): Promise<DoctorSchedule[]>;

  /**
   * Add a new doctor
   */
  addDoctor(doctor: Omit<DoctorSchedule, 'doctorId'> & { doctorId?: string }): Promise<DoctorSchedule>;

  /**
   * Edit doctor profile, services or working hours
   */
  editDoctor(id: string, updates: Partial<DoctorSchedule>): Promise<DoctorSchedule>;

  /**
   * Delete a doctor
   */
  deleteDoctor(id: string): Promise<boolean>;

  /**
   * Update doctor schedule or details (alias for editDoctor)
   */
  updateDoctor(id: string, updates: Partial<DoctorSchedule>): Promise<DoctorSchedule>;

  /**
   * Reset data to initial realistic demo seed (demo adapter only)
   */
  resetDemoData(): Promise<void>;
}
