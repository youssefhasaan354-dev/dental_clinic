/**
 * Hayaah Dental Clinic - Booking System Type Definitions
 * Strict types for appointments, availability, doctors, schedules, and settings.
 */

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type PatientType = 'new' | 'returning';

export interface DoctorSchedule {
  doctorId: string;
  doctorName: { ar: string; en: string };
  title: { ar: string; en: string };
  avatar?: string;
  isActive: boolean;
  services: string[]; // service IDs or ['*'] for all
  weeklyHours: {
    // 0: Sunday, 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday (closed), 6: Saturday
    [dayOfWeek: number]: {
      isWorking: boolean;
      start: string; // "10:00"
      end: string;   // "22:00"
    };
  };
}

export interface BlockedSlot {
  id: string;
  doctorId?: string; // If undefined, applies to all clinic doctors
  date: string; // "YYYY-MM-DD"
  startTime?: string; // "13:00" - if undefined, entire day is blocked
  endTime?: string;   // "14:00"
  reason: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  bookingCode: string; // e.g. "HAY-4F7K2"
  patientName: string;
  patientPhone: string; // Normalized Egyptian phone "+201012345678" or "01012345678"
  patientEmail?: string;
  patientType: PatientType;
  serviceId: string;
  serviceName: { ar: string; en: string };
  serviceDuration: number; // Duration in minutes (e.g. 30, 45, 60)
  doctorId: string; // Doctor ID or "any"
  doctorName?: { ar: string; en: string };
  date: string; // "YYYY-MM-DD" in Cairo time
  startTime: string; // "10:30"
  endTime: string; // "11:00"
  status: AppointmentStatus;
  notes?: string;
  internalNotes?: string;
  consentGiven: boolean;
  isWalkIn?: boolean;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface TimeSlot {
  time: string; // "10:00"
  endTime: string; // "10:30"
  period: 'morning' | 'afternoon' | 'evening';
  isAvailable: boolean;
  doctorId?: string;
  reasonDisabled?: string;
}

export interface DayAvailability {
  date: string; // "YYYY-MM-DD"
  isWorkingDay: boolean;
  isFullyBooked: boolean;
  availableSlotCount: number;
  slots: TimeSlot[];
}

export interface BookingSettings {
  slotDurationMinutes: number; // default: 30
  workingDays: number[]; // [6, 0, 1, 2, 3, 4] (Sat-Thu), 5 (Fri) closed
  openTime: string; // "10:00"
  closeTime: string; // "22:00"
  timezone: string; // "Africa/Cairo"
  minNoticeHours: number; // default: 2 hours
  maxAdvanceDays: number; // default: 60 days
  cancellationWindowHours: number; // default: 3 hours
  autoConfirm: boolean; // default: false (requires receptionist confirmation)
  clinicPhone: string; // "02 2635 5669"
  clinicWhatsapp: string; // "201000000000" or clinic landline
  notificationTemplates: {
    whatsappAr: string;
    whatsappEn: string;
  };
}

export interface PatientRecord {
  phone: string;
  name: string;
  email?: string;
  patientType: PatientType;
  appointmentsCount: number;
  lastVisitDate?: string;
  lastService?: string;
  notes?: string;
  createdAt: string;
}

export interface BookingStats {
  todayTotal: number;
  todayPending: number;
  todayConfirmed: number;
  thisWeekTotal: number;
  pendingConfirmations: number;
  noShowRate: number; // percentage 0-100
  newPatientsCount: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
}

export interface CreateAppointmentDTO {
  serviceId: string;
  doctorId?: string; // "any" or specific ID
  date: string; // "YYYY-MM-DD"
  startTime: string; // "10:30"
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientType?: PatientType;
  notes?: string;
  consentGiven: boolean;
  honeypot?: string; // Anti-spam
  isWalkIn?: boolean;
}

export interface RescheduleAppointmentDTO {
  bookingCode: string;
  patientPhone: string;
  newDate: string;
  newStartTime: string;
  newDoctorId?: string;
}

export interface AppointmentFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: AppointmentStatus | 'all';
  doctorId?: string | 'all';
  serviceId?: string | 'all';
  searchQuery?: string;
}
