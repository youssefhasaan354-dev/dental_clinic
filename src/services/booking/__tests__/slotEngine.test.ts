import { describe, it, expect } from 'vitest';
import {
  computeDayAvailability,
  validateAndNormalizeEgyptianPhone,
  generateBookingCode,
  isTimeRangeOverlapping,
  canCancelAppointment,
  DEFAULT_BOOKING_SETTINGS,
  CAIRO_TIMEZONE,
} from '../slotEngine';
import { fromZonedTime } from 'date-fns-tz';
import { DoctorSchedule, Appointment, BlockedSlot } from '../types';

// Mock doctors with Saturday-Thursday 10:00-22:00 schedule (Friday closed)
const mockDoctors: DoctorSchedule[] = [
  {
    doctorId: 'doc-ortho',
    doctorName: { ar: 'استشاري التقويم', en: 'Orthodontics Consultant' },
    title: { ar: 'استشاري تقويم الأسنان', en: 'Orthodontics Consultant' },
    isActive: true,
    services: ['*'],
    weeklyHours: {
      0: { isWorking: true, start: '10:00', end: '22:00' }, // Sun
      1: { isWorking: true, start: '10:00', end: '22:00' }, // Mon
      2: { isWorking: true, start: '10:00', end: '22:00' }, // Tue
      3: { isWorking: true, start: '10:00', end: '22:00' }, // Wed
      4: { isWorking: true, start: '10:00', end: '22:00' }, // Thu
      5: { isWorking: false, start: '00:00', end: '00:00' }, // Fri (CLOSED)
      6: { isWorking: true, start: '10:00', end: '22:00' }, // Sat
    },
  },
  {
    doctorId: 'doc-implants',
    doctorName: { ar: 'أخصائي الزراعة', en: 'Implantology Specialist' },
    title: { ar: 'أخصائي زراعة الأسنان', en: 'Implantology Specialist' },
    isActive: true,
    services: ['*'],
    weeklyHours: {
      0: { isWorking: true, start: '10:00', end: '22:00' },
      1: { isWorking: true, start: '10:00', end: '22:00' },
      2: { isWorking: true, start: '10:00', end: '22:00' },
      3: { isWorking: true, start: '10:00', end: '22:00' },
      4: { isWorking: true, start: '10:00', end: '22:00' },
      5: { isWorking: false, start: '00:00', end: '00:00' },
      6: { isWorking: true, start: '10:00', end: '22:00' },
    },
  },
];

describe('Slot Engine - Core Rules & Availability', () => {
  it('disables Fridays completely (Friday closed in Egypt clinic schedule)', () => {
    // 2026-10-23 is a Friday
    const friday = '2026-10-23';
    const result = computeDayAvailability({
      date: friday,
      existingAppointments: [],
      blockedSlots: [],
      doctors: mockDoctors,
      referenceNow: new Date('2026-10-20T10:00:00Z'),
    });

    expect(result.isWorkingDay).toBe(false);
    expect(result.slots.length).toBe(0);
    expect(result.availableSlotCount).toBe(0);
    expect(result.isFullyBooked).toBe(true);
  });

  it('generates regular 30-min slots from 10:00 to 22:00 on working days', () => {
    // 2026-10-24 is a Saturday
    const saturday = '2026-10-24';
    const result = computeDayAvailability({
      date: saturday,
      serviceDurationMinutes: 30,
      existingAppointments: [],
      blockedSlots: [],
      doctors: mockDoctors,
      referenceNow: new Date('2026-10-20T10:00:00Z'),
    });

    expect(result.isWorkingDay).toBe(true);
    expect(result.slots.length).toBeGreaterThan(0);
    expect(result.slots[0].time).toBe('10:00');
    expect(result.slots[0].endTime).toBe('10:30');
    expect(result.slots[0].period).toBe('morning');
    expect(result.slots[result.slots.length - 1].time).toBe('21:30');
    expect(result.slots[result.slots.length - 1].endTime).toBe('22:00');
  });

  it('handles service duration correctly (e.g. 60-min service ending at 22:00)', () => {
    const saturday = '2026-10-24';
    const result = computeDayAvailability({
      date: saturday,
      serviceDurationMinutes: 60,
      existingAppointments: [],
      blockedSlots: [],
      doctors: mockDoctors,
      referenceNow: new Date('2026-10-20T10:00:00Z'),
    });

    // Last slot for 60 min must be 21:00 (ends at 22:00)
    const lastSlot = result.slots[result.slots.length - 1];
    expect(lastSlot.time).toBe('21:00');
    expect(lastSlot.endTime).toBe('22:00');
  });

  it('detects existing appointment conflicts and prevents double-booking', () => {
    const monday = '2026-10-26';
    const existing: Appointment[] = [
      {
        id: 'apt-1',
        bookingCode: 'HAY-ABC12',
        patientName: 'أحمد محمود',
        patientPhone: '+201012345678',
        patientType: 'new',
        serviceId: 'checkup-cleaning',
        serviceName: { ar: 'كشف وتنظيف', en: 'Checkup' },
        serviceDuration: 30,
        doctorId: 'doc-ortho',
        date: monday,
        startTime: '11:00',
        endTime: '11:30',
        status: 'confirmed',
        consentGiven: true,
        createdAt: '2026-10-20T10:00:00Z',
        updatedAt: '2026-10-20T10:00:00Z',
      },
    ];

    // Check with doc-ortho specifically
    const orthoResult = computeDayAvailability({
      date: monday,
      serviceDurationMinutes: 30,
      doctorId: 'doc-ortho',
      existingAppointments: existing,
      blockedSlots: [],
      doctors: mockDoctors,
      referenceNow: new Date('2026-10-20T10:00:00Z'),
    });

    const slot1100 = orthoResult.slots.find((s) => s.time === '11:00');
    expect(slot1100?.isAvailable).toBe(false);

    // But slot 10:30 is available
    const slot1030 = orthoResult.slots.find((s) => s.time === '10:30');
    expect(slot1030?.isAvailable).toBe(true);
  });

  it('respects blocked slots (e.g. clinic lunch break 13:00 - 14:00)', () => {
    const tuesday = '2026-10-27';
    const blocked: BlockedSlot[] = [
      {
        id: 'blk-lunch',
        date: tuesday,
        startTime: '13:00',
        endTime: '14:00',
        reason: 'Daily staff break',
        createdAt: '2026-10-20T10:00:00Z',
      },
    ];

    const result = computeDayAvailability({
      date: tuesday,
      serviceDurationMinutes: 30,
      existingAppointments: [],
      blockedSlots: blocked,
      doctors: mockDoctors,
      referenceNow: new Date('2026-10-20T10:00:00Z'),
    });

    const slot1300 = result.slots.find((s) => s.time === '13:00');
    const slot1330 = result.slots.find((s) => s.time === '13:30');
    const slot1400 = result.slots.find((s) => s.time === '14:00');

    expect(slot1300?.isAvailable).toBe(false);
    expect(slot1330?.isAvailable).toBe(false);
    expect(slot1400?.isAvailable).toBe(true);
  });

  it('enforces same-day minimum notice (2 hours ahead in Cairo)', () => {
    // Current time is 11:30 Cairo local time
    const today = '2026-10-20';
    const refNow = fromZonedTime('2026-10-20 11:30:00', CAIRO_TIMEZONE);

    const result = computeDayAvailability({
      date: today,
      serviceDurationMinutes: 30,
      existingAppointments: [],
      blockedSlots: [],
      doctors: mockDoctors,
      referenceNow: refNow,
    });

    // 11:30 + 2 hours notice = 13:30 earliest allowed slot
    const slot1200 = result.slots.find((s) => s.time === '12:00');
    const slot1300 = result.slots.find((s) => s.time === '13:00');
    const slot1330 = result.slots.find((s) => s.time === '13:30');

    expect(slot1200?.isAvailable).toBe(false);
    expect(slot1300?.isAvailable).toBe(false);
    expect(slot1330?.isAvailable).toBe(true);
  });

  it('rejects dates beyond maxAdvanceDays (60 days)', () => {
    const futureDate = '2026-12-30'; // > 70 days away
    const refNow = new Date('2026-10-20T10:00:00Z');

    const result = computeDayAvailability({
      date: futureDate,
      existingAppointments: [],
      blockedSlots: [],
      doctors: mockDoctors,
      referenceNow: refNow,
    });

    expect(result.slots.length).toBe(0);
    expect(result.isFullyBooked).toBe(true);
  });
});

describe('Time Range Overlap Helper', () => {
  it('correctly detects overlaps', () => {
    expect(isTimeRangeOverlapping('10:00', '10:30', '10:00', '10:30')).toBe(true);
    expect(isTimeRangeOverlapping('10:00', '11:00', '10:30', '11:00')).toBe(true);
    expect(isTimeRangeOverlapping('10:00', '10:30', '10:30', '11:00')).toBe(false); // Adjacent is not overlap
    expect(isTimeRangeOverlapping('10:00', '11:00', '11:00', '12:00')).toBe(false);
  });
});

describe('Egyptian Phone Validation & Normalization', () => {
  it('validates and normalizes 010/011/012/015 numbers', () => {
    expect(validateAndNormalizeEgyptianPhone('01012345678')).toEqual({
      isValid: true,
      normalized: '+201012345678',
    });
    expect(validateAndNormalizeEgyptianPhone('01198765432')).toEqual({
      isValid: true,
      normalized: '+201198765432',
    });
    expect(validateAndNormalizeEgyptianPhone('01234567890')).toEqual({
      isValid: true,
      normalized: '+201234567890',
    });
    expect(validateAndNormalizeEgyptianPhone('01555555555')).toEqual({
      isValid: true,
      normalized: '+201555555555',
    });
  });

  it('validates numbers already formatted with +20 or 20', () => {
    expect(validateAndNormalizeEgyptianPhone('+201012345678')).toEqual({
      isValid: true,
      normalized: '+201012345678',
    });
    expect(validateAndNormalizeEgyptianPhone('201012345678')).toEqual({
      isValid: true,
      normalized: '+201012345678',
    });
  });

  it('validates Cairo landlines (02...)', () => {
    expect(validateAndNormalizeEgyptianPhone('0226355669')).toEqual({
      isValid: true,
      normalized: '+20226355669',
    });
  });

  it('rejects invalid or non-Egyptian formats', () => {
    expect(validateAndNormalizeEgyptianPhone('12345').isValid).toBe(false);
    expect(validateAndNormalizeEgyptianPhone('01912345678').isValid).toBe(false); // 019 invalid
    expect(validateAndNormalizeEgyptianPhone('0101234567').isValid).toBe(false); // 10 digits instead of 11
    expect(validateAndNormalizeEgyptianPhone('').isValid).toBe(false);
  });
});

describe('Booking Code Generation', () => {
  it('generates codes in format HAY-XXXXX with uppercase alphanumeric chars', () => {
    const code = generateBookingCode();
    expect(code).toMatch(/^HAY-[2-9A-HJ-NP-Z]{5}$/);
  });
});

describe('Cancellation Window Enforcement', () => {
  it('allows cancellation when outside 3-hour window', () => {
    const apt: Appointment = {
      id: 'apt-test',
      bookingCode: 'HAY-TEST1',
      patientName: 'Test',
      patientPhone: '+201012345678',
      patientType: 'new',
      serviceId: 'checkup-cleaning',
      serviceName: { ar: 'كشف', en: 'Checkup' },
      serviceDuration: 30,
      doctorId: 'doc-ortho',
      date: '2026-10-25',
      startTime: '14:00',
      endTime: '14:30',
      status: 'confirmed',
      consentGiven: true,
      createdAt: '2026-10-20T10:00:00Z',
      updatedAt: '2026-10-20T10:00:00Z',
    };

    const refNow = fromZonedTime('2026-10-25 10:00:00', CAIRO_TIMEZONE); // 4 hours before 14:00
    const check = canCancelAppointment(apt, DEFAULT_BOOKING_SETTINGS, refNow);
    expect(check.allowed).toBe(true);
  });

  it('prevents cancellation within 3 hours of appointment', () => {
    const apt: Appointment = {
      id: 'apt-test',
      bookingCode: 'HAY-TEST1',
      patientName: 'Test',
      patientPhone: '+201012345678',
      patientType: 'new',
      serviceId: 'checkup-cleaning',
      serviceName: { ar: 'كشف', en: 'Checkup' },
      serviceDuration: 30,
      doctorId: 'doc-ortho',
      date: '2026-10-25',
      startTime: '14:00',
      endTime: '14:30',
      status: 'confirmed',
      consentGiven: true,
      createdAt: '2026-10-20T10:00:00Z',
      updatedAt: '2026-10-20T10:00:00Z',
    };

    const refNow = fromZonedTime('2026-10-25 12:30:00', CAIRO_TIMEZONE); // 1.5 hours before 14:00
    const check = canCancelAppointment(apt, DEFAULT_BOOKING_SETTINGS, refNow);
    expect(check.allowed).toBe(false);
  });
});
