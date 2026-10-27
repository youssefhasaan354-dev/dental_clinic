import { describe, it, expect } from 'vitest';
import { validateBookingForm } from '../bookingValidation';

const validBaseBooking = {
  patientName: 'أحمد محمود علي',
  patientPhone: '01012345678',
  patientEmail: 'ahmed@example.com',
  patientType: 'new' as const,
  serviceId: 'srv_consultation',
  doctorId: 'doc_1',
  date: '2026-11-15',
  startTime: '10:30',
  consentGiven: true,
  notes: 'لا توجد سوابق حساسية',
};

describe('Zod 4 Booking Validation (AR & EN)', () => {
  it('validates a completely valid booking in Arabic and English', () => {
    const arRes = validateBookingForm(validBaseBooking, true);
    expect(arRes.isValid).toBe(true);
    expect(arRes.errors).toEqual({});
    expect(arRes.data?.patientName).toBe('أحمد محمود علي');

    const enRes = validateBookingForm(validBaseBooking, false);
    expect(enRes.isValid).toBe(true);
    expect(enRes.errors).toEqual({});
  });

  describe('patientName validation', () => {
    it('shows custom error when name is missing/undefined', () => {
      const data = { ...validBaseBooking, patientName: undefined };
      const ar = validateBookingForm(data, true);
      const en = validateBookingForm(data, false);

      expect(ar.isValid).toBe(false);
      expect(ar.errors.patientName).toBe('يرجى إدخال اسم المريض بالكامل');
      expect(en.errors.patientName).toBe('Patient full name is required');
    });

    it('shows custom error when name is wrong type', () => {
      const data = { ...validBaseBooking, patientName: 12345 };
      const ar = validateBookingForm(data, true);
      const en = validateBookingForm(data, false);

      expect(ar.isValid).toBe(false);
      expect(ar.errors.patientName).toBe('يرجى إدخال اسم المريض بالكامل');
      expect(en.errors.patientName).toBe('Patient full name is required');
    });

    it('shows custom error when name is too short (< 2 chars)', () => {
      const data = { ...validBaseBooking, patientName: 'أ' };
      const ar = validateBookingForm(data, true);
      const en = validateBookingForm(data, false);

      expect(ar.isValid).toBe(false);
      expect(ar.errors.patientName).toBe('يجب ألا يقل الاسم عن حرفين');
      expect(en.errors.patientName).toBe('Full name must be at least 2 characters');
    });

    it('shows custom error when name is too long (> 80 chars)', () => {
      const data = { ...validBaseBooking, patientName: 'أ'.repeat(81) };
      const ar = validateBookingForm(data, true);
      const en = validateBookingForm(data, false);

      expect(ar.isValid).toBe(false);
      expect(ar.errors.patientName).toBe('يجب ألا يتجاوز الاسم 80 حرفاً');
      expect(en.errors.patientName).toBe('Full name cannot exceed 80 characters');
    });
  });

  describe('patientPhone validation', () => {
    it('shows custom error when phone is missing/undefined', () => {
      const data = { ...validBaseBooking, patientPhone: undefined };
      const ar = validateBookingForm(data, true);
      const en = validateBookingForm(data, false);

      expect(ar.isValid).toBe(false);
      expect(ar.errors.patientPhone).toBe('رقم الهاتف مطلوب');
      expect(en.errors.patientPhone).toBe('Phone number is required');
    });

    it('shows custom error when phone is wrong type', () => {
      const data = { ...validBaseBooking, patientPhone: 1012345678 };
      const ar = validateBookingForm(data, true);
      const en = validateBookingForm(data, false);

      expect(ar.isValid).toBe(false);
      expect(ar.errors.patientPhone).toBe('رقم الهاتف مطلوب');
      expect(en.errors.patientPhone).toBe('Phone number is required');
    });

    it('shows custom error for invalid Egyptian phone format', () => {
      const data = { ...validBaseBooking, patientPhone: '01399999999' };
      const ar = validateBookingForm(data, true);
      const en = validateBookingForm(data, false);

      expect(ar.isValid).toBe(false);
      expect(ar.errors.patientPhone).toBe(
        'يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678 أو 0226355669)'
      );
      expect(en.errors.patientPhone).toBe(
        'Please enter a valid Egyptian phone number (e.g. 01012345678)'
      );
    });
  });

  describe('patientEmail validation', () => {
    it('shows custom error when email format is invalid', () => {
      const data = { ...validBaseBooking, patientEmail: 'invalid-email-address' };
      const ar = validateBookingForm(data, true);
      const en = validateBookingForm(data, false);

      expect(ar.isValid).toBe(false);
      expect(ar.errors.patientEmail).toBe('صيغة البريد الإلكتروني غير صحيحة');
      expect(en.errors.patientEmail).toBe('Invalid email address format');
    });

    it('allows undefined or empty string for optional email', () => {
      const data1 = { ...validBaseBooking, patientEmail: undefined };
      const data2 = { ...validBaseBooking, patientEmail: '' };
      expect(validateBookingForm(data1).isValid).toBe(true);
      expect(validateBookingForm(data2).isValid).toBe(true);
    });
  });

  describe('patientType validation', () => {
    it('shows custom error when patientType is invalid enum value or wrong type', () => {
      const data = { ...validBaseBooking, patientType: 'vip' as any };
      const ar = validateBookingForm(data, true);
      const en = validateBookingForm(data, false);

      expect(ar.isValid).toBe(false);
      expect(ar.errors.patientType).toBe('نوع المريض غير صحيح');
      expect(en.errors.patientType).toBe('Invalid patient type');
    });

    it('defaults to "new" when omitted', () => {
      const { patientType, ...rest } = validBaseBooking;
      const res = validateBookingForm(rest);
      expect(res.isValid).toBe(true);
      expect(res.data?.patientType).toBe('new');
    });
  });

  describe('serviceId validation', () => {
    it('shows custom error when serviceId is missing/undefined', () => {
      const data = { ...validBaseBooking, serviceId: undefined };
      const ar = validateBookingForm(data, true);
      const en = validateBookingForm(data, false);

      expect(ar.isValid).toBe(false);
      expect(ar.errors.serviceId).toBe('يرجى اختيار الخدمة المطلوبة');
      expect(en.errors.serviceId).toBe('Please select a service');
    });

    it('shows custom error when serviceId is empty', () => {
      const data = { ...validBaseBooking, serviceId: '' };
      const ar = validateBookingForm(data, true);
      const en = validateBookingForm(data, false);

      expect(ar.isValid).toBe(false);
      expect(ar.errors.serviceId).toBe('يرجى اختيار الخدمة المطلوبة');
      expect(en.errors.serviceId).toBe('Please select a service');
    });
  });

  describe('date validation', () => {
    it('shows custom error when date is missing/undefined', () => {
      const data = { ...validBaseBooking, date: undefined };
      const ar = validateBookingForm(data, true);
      const en = validateBookingForm(data, false);

      expect(ar.isValid).toBe(false);
      expect(ar.errors.date).toBe('يرجى تحديد تاريخ الموعد');
      expect(en.errors.date).toBe('Please select an appointment date');
    });

    it('shows custom error when date format is invalid', () => {
      const data = { ...validBaseBooking, date: '15-11-2026' };
      const ar = validateBookingForm(data, true);
      const en = validateBookingForm(data, false);

      expect(ar.isValid).toBe(false);
      expect(ar.errors.date).toBe('صيغة التاريخ غير صحيحة (YYYY-MM-DD)');
      expect(en.errors.date).toBe('Invalid date format (YYYY-MM-DD)');
    });
  });

  describe('startTime validation', () => {
    it('shows custom error when startTime is missing/undefined', () => {
      const data = { ...validBaseBooking, startTime: undefined };
      const ar = validateBookingForm(data, true);
      const en = validateBookingForm(data, false);

      expect(ar.isValid).toBe(false);
      expect(ar.errors.startTime).toBe('يرجى تحديد وقت الموعد');
      expect(en.errors.startTime).toBe('Please select an appointment time');
    });

    it('shows custom error when startTime format is invalid', () => {
      const data = { ...validBaseBooking, startTime: '10:30:00' };
      const ar = validateBookingForm(data, true);
      const en = validateBookingForm(data, false);

      expect(ar.isValid).toBe(false);
      expect(ar.errors.startTime).toBe('صيغة الوقت غير صحيحة (HH:mm)');
      expect(en.errors.startTime).toBe('Invalid time format (HH:mm)');
    });
  });

  describe('consentGiven validation', () => {
    it('shows custom error when consentGiven is false', () => {
      const data = { ...validBaseBooking, consentGiven: false };
      const ar = validateBookingForm(data, true);
      const en = validateBookingForm(data, false);

      expect(ar.isValid).toBe(false);
      expect(ar.errors.consentGiven).toBe('يجب الموافقة على سياسة الخصوصية للمتابعة');
      expect(en.errors.consentGiven).toBe('You must accept the privacy policy to proceed');
    });

    it('shows custom error when consentGiven is missing/undefined', () => {
      const data = { ...validBaseBooking, consentGiven: undefined };
      const ar = validateBookingForm(data, true);
      const en = validateBookingForm(data, false);

      expect(ar.isValid).toBe(false);
      expect(ar.errors.consentGiven).toBe('يجب الموافقة على سياسة الخصوصية للمتابعة');
      expect(en.errors.consentGiven).toBe('You must accept the privacy policy to proceed');
    });

    it('shows custom error when consentGiven is non-boolean truthy', () => {
      const data = { ...validBaseBooking, consentGiven: 'true' as any };
      const ar = validateBookingForm(data, true);
      const en = validateBookingForm(data, false);

      expect(ar.isValid).toBe(false);
      expect(ar.errors.consentGiven).toBe('يجب الموافقة على سياسة الخصوصية للمتابعة');
      expect(en.errors.consentGiven).toBe('You must accept the privacy policy to proceed');
    });
  });

  describe('notes validation', () => {
    it('shows custom error when notes exceed 1000 characters', () => {
      const data = { ...validBaseBooking, notes: 'ن'.repeat(1001) };
      const ar = validateBookingForm(data, true);
      const en = validateBookingForm(data, false);

      expect(ar.isValid).toBe(false);
      expect(ar.errors.notes).toBe('الملاحظات يجب ألا تتجاوز 1000 حرف');
      expect(en.errors.notes).toBe('Notes must not exceed 1000 characters');
    });

    it('allows undefined or notes <= 1000 chars', () => {
      const data1 = { ...validBaseBooking, notes: undefined };
      const data2 = { ...validBaseBooking, notes: 'ن'.repeat(1000) };
      expect(validateBookingForm(data1).isValid).toBe(true);
      expect(validateBookingForm(data2).isValid).toBe(true);
    });
  });
});
