import { describe, it, expect, beforeEach } from 'vitest';
import { DemoBookingService } from '../DemoBookingService';
import { validateBookingForm } from '../bookingValidation';

describe('Doctor Management System', () => {
  let service: DemoBookingService;

  beforeEach(async () => {
    service = new DemoBookingService();
    await service.resetDemoData();
  });

  it('addDoctor successfully creates a new doctor schedule and returns it', async () => {
    const initialDoctors = await service.getDoctors();
    const initialCount = initialDoctors.length;

    const newDoc = await service.addDoctor({
      doctorName: {
        ar: 'د. يوسف حسان',
        en: 'Dr. Youssef Hassan',
      },
      title: {
        ar: 'استشاري تقويم وتجميل الأسنان',
        en: 'Consultant of Orthodontics & Aesthetics',
      },
      avatar: 'https://example.com/avatar.jpg',
      isActive: true,
      services: ['orthodontics-consult', 'teeth-whitening'],
    });

    expect(newDoc.doctorId).toBeDefined();
    expect(newDoc.doctorName.ar).toBe('د. يوسف حسان');
    expect(newDoc.doctorName.en).toBe('Dr. Youssef Hassan');
    expect(newDoc.title.ar).toBe('استشاري تقويم وتجميل الأسنان');
    expect(newDoc.isActive).toBe(true);
    expect(newDoc.services).toContain('orthodontics-consult');
    expect(newDoc.weeklyHours).toBeDefined();

    const afterDoctors = await service.getDoctors();
    expect(afterDoctors.length).toBe(initialCount + 1);
    expect(afterDoctors.some((d) => d.doctorId === newDoc.doctorId)).toBe(true);
  });

  it('editDoctor updates doctor metadata and active status', async () => {
    const newDoc = await service.addDoctor({
      doctorName: { ar: 'طبيب للتعديل', en: 'Doctor to Edit' },
      title: { ar: 'أخصائي جراحة', en: 'Surgery Specialist' },
      isActive: true,
      services: ['*'],
    });

    const updated = await service.editDoctor(newDoc.doctorId, {
      title: { ar: 'استشاري جراحة الوجه والفكين', en: 'Maxillofacial Surgery Consultant' },
      isActive: false,
    });

    expect(updated.title.ar).toBe('استشاري جراحة الوجه والفكين');
    expect(updated.isActive).toBe(false);

    const docs = await service.getDoctors();
    const found = docs.find((d) => d.doctorId === newDoc.doctorId);
    expect(found?.title.ar).toBe('استشاري جراحة الوجه والفكين');
    expect(found?.isActive).toBe(false);
  });

  it('deleteDoctor removes the doctor from storage', async () => {
    const newDoc = await service.addDoctor({
      doctorName: { ar: 'طبيب للحذف', en: 'Doctor to Delete' },
      title: { ar: 'ممارس عام', en: 'General Dentist' },
      isActive: true,
      services: ['*'],
    });

    const beforeList = await service.getDoctors();
    expect(beforeList.some((d) => d.doctorId === newDoc.doctorId)).toBe(true);

    const deleted = await service.deleteDoctor(newDoc.doctorId);
    expect(deleted).toBe(true);

    const afterList = await service.getDoctors();
    expect(afterList.some((d) => d.doctorId === newDoc.doctorId)).toBe(false);
  });

  it('assigns an eligible doctor when doctorId is "any"', async () => {
    const res = await service.createAppointment({
      serviceId: 'teeth-whitening',
      doctorId: 'any',
      date: '2026-11-22',
      startTime: '10:00',
      patientName: 'سارة خالد',
      patientPhone: '01099887766',
      consentGiven: true,
    });

    expect(res.success).toBe(true);
    expect(res.appointment).toBeDefined();
    expect(res.appointment?.doctorId).toBeDefined();
    expect(res.appointment?.doctorId).not.toBe('any');

    // Assigned doctor must support the requested service
    const docs = await service.getDoctors();
    const assigned = docs.find((d) => d.doctorId === res.appointment?.doctorId);
    expect(assigned).toBeDefined();
    expect(
      assigned?.services.includes('*') || assigned?.services.includes('teeth-whitening')
    ).toBe(true);
  });
});

describe('Zod Booking Validation Schema', () => {
  const validData = {
    patientName: 'أحمد محمود',
    patientPhone: '01012345678',
    patientEmail: 'ahmed@example.com',
    patientType: 'new',
    serviceId: 'scaling-polishing',
    doctorId: 'any',
    date: '2026-11-15',
    startTime: '11:00',
    consentGiven: true,
    notes: 'استشارة فحص ألم في الضرس',
  };

  it('passes on valid Egyptian booking inputs', () => {
    const result = validateBookingForm(validData, true);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result.data?.patientName).toBe('أحمد محمود');
  });

  it('fails if name is shorter than 2 characters', () => {
    const result = validateBookingForm({ ...validData, patientName: 'أ' }, true);
    expect(result.isValid).toBe(false);
    expect(result.errors.patientName).toBeDefined();
  });

  it('fails on invalid Egyptian phone number', () => {
    const result = validateBookingForm({ ...validData, patientPhone: '12345' }, true);
    expect(result.isValid).toBe(false);
    expect(result.errors.patientPhone).toBeDefined();
  });

  it('fails if consentGiven is false', () => {
    const result = validateBookingForm({ ...validData, consentGiven: false }, true);
    expect(result.isValid).toBe(false);
    expect(result.errors.consentGiven).toBeDefined();
  });

  it('supports English localized error messages', () => {
    const result = validateBookingForm({ ...validData, patientPhone: '0000' }, false);
    expect(result.isValid).toBe(false);
    expect(result.errors.patientPhone).toContain('Egyptian phone number');
  });
});
