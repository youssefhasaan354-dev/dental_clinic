/**
 * Hayaah Dental Clinic - Timezone-Safe Slot Engine
 * Strict Africa/Cairo timezone calculations, conflict detection, and slot generation.
 */

import { toZonedTime, fromZonedTime, format } from 'date-fns-tz';
import {
  BookingSettings,
  DoctorSchedule,
  BlockedSlot,
  Appointment,
  TimeSlot,
  DayAvailability,
} from './types';

export const CAIRO_TIMEZONE = 'Africa/Cairo';

// Default clinic working settings (Saturday-Thursday 10:00-22:00, Friday closed)
export const DEFAULT_BOOKING_SETTINGS: BookingSettings = {
  slotDurationMinutes: 30,
  workingDays: [6, 0, 1, 2, 3, 4], // 6=Saturday, 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday. 5=Friday (closed)
  openTime: '10:00',
  closeTime: '22:00',
  timezone: CAIRO_TIMEZONE,
  minNoticeHours: 2,
  maxAdvanceDays: 60,
  cancellationWindowHours: 3,
  autoConfirm: false,
  clinicPhone: '02 2635 5669',
  clinicWhatsapp: '20226355669',
  notificationTemplates: {
    whatsappAr: 'مرحباً {name}، نؤكد حجز موعدك في عيادة حياة لطب الأسنان يوم {date} الساعة {time}. كود الحجز: {code}',
    whatsappEn: 'Hello {name}, your appointment at Hayaah Dental Clinic is confirmed for {date} at {time}. Booking code: {code}',
  },
};

/**
 * Service duration defaults (minutes)
 * // TODO: confirm specific durations with clinic
 */
export const SERVICE_DURATIONS: Record<string, number> = {
  'checkup-cleaning': 30,
  'scaling-polishing': 30,
  'teeth-whitening': 60,
  'laser-whitening': 60,
  'root-canal': 60,
  'endodontics': 60,
  'dental-implants': 45,
  'implants-consult': 45,
  'cosmetic-fillings': 45,
  'veneers-hollywood': 45,
  'pediatric-dentistry': 30,
  'orthodontics-consult': 45,
  'general-checkup': 30,
};

/**
 * Get current time zoned to Africa/Cairo
 */
export function getCairoNow(customDate?: Date): Date {
  const base = customDate || new Date();
  return toZonedTime(base, CAIRO_TIMEZONE);
}

/**
 * Format a Date object to YYYY-MM-DD in Cairo timezone
 */
export function formatCairoDate(date: Date): string {
  const cairoDate = toZonedTime(date, CAIRO_TIMEZONE);
  return format(cairoDate, 'yyyy-MM-dd', { timeZone: CAIRO_TIMEZONE });
}

/**
 * Normalise Egyptian phone number and validate.
 * Accepts: 010..., 011..., 012..., 015... (11 digits), +201..., 201..., or Cairo landline 02...
 * Returns { isValid: boolean, normalized: string }
 */
export function validateAndNormalizeEgyptianPhone(rawPhone: string): {
  isValid: boolean;
  normalized: string;
} {
  if (!rawPhone) return { isValid: false, normalized: '' };

  // Remove whitespace, dashes, brackets
  const cleaned = rawPhone.replace(/[\s\-\(\)]/g, '');

  // 1. Egyptian mobile with country code +20 or 20
  if (/^\+201[0125][0-9]{8}$/.test(cleaned)) {
    return { isValid: true, normalized: cleaned };
  }
  if (/^201[0125][0-9]{8}$/.test(cleaned)) {
    return { isValid: true, normalized: `+${cleaned}` };
  }

  // 2. Egyptian local mobile starting with 010/011/012/015 (11 digits)
  if (/^01[0125][0-9]{8}$/.test(cleaned)) {
    const intl = `+2${cleaned}`;
    return { isValid: true, normalized: intl };
  }

  // 3. Cairo landline (02 + 8 digits)
  if (/^02[0-9]{8}$/.test(cleaned)) {
    return { isValid: true, normalized: `+2${cleaned}` };
  }
  if (/^\+202[0-9]{8}$/.test(cleaned)) {
    return { isValid: true, normalized: cleaned };
  }

  return { isValid: false, normalized: cleaned };
}

/**
 * Generate a clean, human-readable 5-character booking code (e.g. HAY-4F7K2)
 */
export function generateBookingCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude 0, 1, I, O to prevent confusion
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `HAY-${code}`;
}

/**
 * Convert "HH:mm" time string to minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Convert minutes from midnight to "HH:mm"
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Add minutes to "HH:mm" string
 */
export function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  const total = timeToMinutes(timeStr) + minutesToAdd;
  return minutesToTime(total);
}

/**
 * Determine period of day from time string
 */
export function getSlotPeriod(timeStr: string): 'morning' | 'afternoon' | 'evening' {
  const mins = timeToMinutes(timeStr);
  if (mins < 13 * 60) return 'morning'; // 10:00 to 12:59
  if (mins < 17 * 60) return 'afternoon'; // 13:00 to 16:59
  return 'evening'; // 17:00 to 22:00
}

/**
 * Check if two time ranges overlap
 * Range A: [startA, endA), Range B: [startB, endB)
 */
export function isTimeRangeOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);

  return aStart < bEnd && aEnd > bStart;
}

/**
 * Compute availability for a given date, service, and doctor
 */
export function computeDayAvailability(options: {
  date: string; // "YYYY-MM-DD"
  serviceDurationMinutes?: number;
  doctorId?: string; // "any" or specific ID
  existingAppointments: Appointment[];
  blockedSlots: BlockedSlot[];
  doctors: DoctorSchedule[];
  settings?: BookingSettings;
  referenceNow?: Date; // For testing/simulation
}): DayAvailability {
  const settings = options.settings || DEFAULT_BOOKING_SETTINGS;
  const duration = options.serviceDurationMinutes || settings.slotDurationMinutes;
  const targetDoctorId = options.doctorId && options.doctorId !== 'any' ? options.doctorId : undefined;

  // 1. Parse date in Cairo time
  const [year, month, day] = options.date.split('-').map(Number);
  const targetDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const cairoTargetDate = toZonedTime(targetDate, CAIRO_TIMEZONE);
  const dayOfWeek = cairoTargetDate.getUTCDay(); // 0=Sunday, 5=Friday, 6=Saturday

  // 2. Check if working day (Friday is closed)
  const isWorkingDay = settings.workingDays.includes(dayOfWeek);
  if (!isWorkingDay) {
    return {
      date: options.date,
      isWorkingDay: false,
      isFullyBooked: true,
      availableSlotCount: 0,
      slots: [],
    };
  }

  // 3. Check advance booking constraints
  const nowInCairo = getCairoNow(options.referenceNow);
  const todayStr = format(nowInCairo, 'yyyy-MM-dd', { timeZone: CAIRO_TIMEZONE });

  // Past date check
  if (options.date < todayStr) {
    return {
      date: options.date,
      isWorkingDay: true,
      isFullyBooked: true,
      availableSlotCount: 0,
      slots: [],
    };
  }

  // Max advance days check
  const nowMs = nowInCairo.getTime();
  const targetMs = new Date(`${options.date}T12:00:00+02:00`).getTime();
  const diffDays = Math.ceil((targetMs - nowMs) / (1000 * 60 * 60 * 24));
  if (diffDays > settings.maxAdvanceDays) {
    return {
      date: options.date,
      isWorkingDay: true,
      isFullyBooked: true,
      availableSlotCount: 0,
      slots: [],
    };
  }

  // 4. Filter doctors: active and working on this day of week
  const activeDoctors = options.doctors.filter((doc) => {
    if (!doc.isActive) return false;
    if (targetDoctorId && doc.doctorId !== targetDoctorId) return false;
    const schedule = doc.weeklyHours[dayOfWeek];
    return schedule && schedule.isWorking;
  });

  if (activeDoctors.length === 0) {
    return {
      date: options.date,
      isWorkingDay: true,
      isFullyBooked: true,
      availableSlotCount: 0,
      slots: [],
    };
  }

  // 5. Existing active appointments on this date
  const dayAppointments = options.existingAppointments.filter(
    (apt) => apt.date === options.date && apt.status !== 'cancelled'
  );

  // 6. Blocked slots on this date
  const dayBlockedSlots = options.blockedSlots.filter((b) => b.date === options.date);

  // 7. Calculate notice window for same-day bookings
  const isToday = options.date === todayStr;
  const currentMinutesInCairo = nowInCairo.getHours() * 60 + nowInCairo.getMinutes();
  const minNoticeMinutes = settings.minNoticeHours * 60;
  const earliestAllowedMinutes = isToday ? currentMinutesInCairo + minNoticeMinutes : 0;

  // 8. Generate slots from openTime to closeTime
  const openMins = timeToMinutes(settings.openTime);
  const closeMins = timeToMinutes(settings.closeTime);
  const interval = settings.slotDurationMinutes; // 30 min increments

  const slots: TimeSlot[] = [];
  let availableCount = 0;

  for (let startMins = openMins; startMins + duration <= closeMins; startMins += interval) {
    const slotStartTime = minutesToTime(startMins);
    const slotEndTime = minutesToTime(startMins + duration);
    const period = getSlotPeriod(slotStartTime);

    // Rule A: Same day notice window check
    if (isToday && startMins < earliestAllowedMinutes) {
      slots.push({
        time: slotStartTime,
        endTime: slotEndTime,
        period,
        isAvailable: false,
        reasonDisabled: 'notice_window',
      });
      continue;
    }

    // Rule B: Check doctor availability
    // Find at least one doctor who is available for the full duration [slotStartTime, slotEndTime]
    let availableDoctorId: string | undefined = undefined;

    for (const doc of activeDoctors) {
      const docSchedule = doc.weeklyHours[dayOfWeek];
      if (!docSchedule || !docSchedule.isWorking) continue;

      const docStartMins = timeToMinutes(docSchedule.start);
      const docEndMins = timeToMinutes(docSchedule.end);

      // Check within doctor's working hours
      if (startMins < docStartMins || startMins + duration > docEndMins) {
        continue;
      }

      // Check doctor blocked slots
      const isDocBlocked = dayBlockedSlots.some((block) => {
        if (block.doctorId && block.doctorId !== doc.doctorId) return false;
        // If entire day is blocked
        if (!block.startTime || !block.endTime) return true;
        // If overlapping with blocked range
        return isTimeRangeOverlapping(slotStartTime, slotEndTime, block.startTime, block.endTime);
      });

      if (isDocBlocked) continue;

      // Check existing appointments conflict for this doctor
      const hasConflict = dayAppointments.some((apt) => {
        // If appointment was assigned to this doctor, or was 'any' and blocked
        const conflictsDoctor =
          apt.doctorId === doc.doctorId ||
          (apt.doctorId === 'any' && activeDoctors.length === 1);

        if (!conflictsDoctor) return false;

        return isTimeRangeOverlapping(slotStartTime, slotEndTime, apt.startTime, apt.endTime);
      });

      if (!hasConflict) {
        availableDoctorId = doc.doctorId;
        break; // Found an available doctor
      }
    }

    const isAvailable = Boolean(availableDoctorId);
    if (isAvailable) availableCount++;

    slots.push({
      time: slotStartTime,
      endTime: slotEndTime,
      period,
      isAvailable,
      doctorId: availableDoctorId,
      reasonDisabled: isAvailable ? undefined : 'slot_booked_or_blocked',
    });
  }

  return {
    date: options.date,
    isWorkingDay: true,
    isFullyBooked: availableCount === 0,
    availableSlotCount: availableCount,
    slots,
  };
}

/**
 * Check if an appointment can be cancelled according to clinic cancellation window
 */
export function canCancelAppointment(
  appointment: Appointment,
  settings?: BookingSettings,
  referenceNow?: Date
): { allowed: boolean; reason?: string } {
  const s = settings || DEFAULT_BOOKING_SETTINGS;
  const now = referenceNow || new Date();

  // Convert appointment datetime in Cairo to UTC timestamp
  const aptCairoDateTimeStr = `${appointment.date} ${appointment.startTime}:00`;
  const aptUtcDate = fromZonedTime(aptCairoDateTimeStr, CAIRO_TIMEZONE);

  const diffMs = aptUtcDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < s.cancellationWindowHours) {
    return {
      allowed: false,
      reason: `لا يمكن إلغاء الموعد قبل أقل من ${s.cancellationWindowHours} ساعات من موعد الزيارة / Cannot cancel within ${s.cancellationWindowHours} hours of appointment`,
    };
  }

  return { allowed: true };
}
