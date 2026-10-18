/**
 * Hayaah Dental Clinic - Realistic Demo Seed Data
 * Contains ~40 appointments across past/future 3 weeks, realistic doctors with neutral titles,
 * blocked lunch breaks, and default settings.
 * All fake patient names and fake 01000000xxx Egyptian phone numbers are clearly marked as demo.
 */

import { format, subDays, addDays } from 'date-fns';
import { Appointment, DoctorSchedule, BlockedSlot, BookingSettings } from './types';
import { DEFAULT_BOOKING_SETTINGS, getCairoNow } from './slotEngine';

export const INITIAL_DOCTORS: DoctorSchedule[] = [
  {
    doctorId: 'doc-ortho',
    doctorName: {
      ar: 'استشاري تقويم الأسنان والفكين', // Neutral title (no invented names)
      en: 'Orthodontics & Dentofacial Consultant',
    },
    title: {
      ar: 'استشاري تقويم وتجميل الابتسامة',
      en: 'Orthodontics Consultant',
    },
    isActive: true,
    services: ['orthodontics-consult', 'checkup-cleaning', 'general-checkup'],
    weeklyHours: {
      0: { isWorking: true, start: '10:00', end: '22:00' }, // Sun
      1: { isWorking: true, start: '10:00', end: '22:00' }, // Mon
      2: { isWorking: true, start: '10:00', end: '22:00' }, // Tue
      3: { isWorking: true, start: '10:00', end: '22:00' }, // Wed
      4: { isWorking: true, start: '10:00', end: '22:00' }, // Thu
      5: { isWorking: false, start: '00:00', end: '00:00' }, // Fri CLOSED
      6: { isWorking: true, start: '10:00', end: '22:00' }, // Sat
    },
  },
  {
    doctorId: 'doc-implants',
    doctorName: {
      ar: 'أخصائي زراعة وجراحة الأسنان',
      en: 'Dental Implants & Oral Surgery Specialist',
    },
    title: {
      ar: 'أخصائي جراحة وزراعة الأسنان',
      en: 'Implantology Specialist',
    },
    isActive: true,
    services: ['dental-implants', 'implants-consult', 'checkup-cleaning', 'general-checkup'],
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
  {
    doctorId: 'doc-endo',
    doctorName: {
      ar: 'أخصائي علاج الجذور وعصب الأسنان',
      en: 'Endodontics & Root Canal Specialist',
    },
    title: {
      ar: 'أخصائي المعالجة اللبية وحشو العصب',
      en: 'Endodontics Specialist',
    },
    isActive: true,
    services: ['root-canal', 'endodontics', 'cosmetic-fillings', 'checkup-cleaning', 'general-checkup'],
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
  {
    doctorId: 'doc-pediatric',
    doctorName: {
      ar: 'أخصائية طب أسنان الأطفال وتجميل الأسنان',
      en: 'Pediatric & Aesthetic Dentistry Specialist',
    },
    title: {
      ar: 'أخصائية أسنان الأطفال والتجميل',
      en: 'Pediatric & Cosmetic Dentist',
    },
    isActive: true,
    services: ['pediatric-dentistry', 'teeth-whitening', 'laser-whitening', 'scaling-polishing', 'general-checkup'],
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

/**
 * Generate 40 realistic seed appointments relative to today's date in Cairo
 */
export function generateSeedAppointments(): Appointment[] {
  const cairoNow = getCairoNow();
  const seedList: Appointment[] = [];

  const samplePatients = [
    { name: 'أحمد محمود سليمان (تجريبي)', phone: '+201000000101', type: 'new' as const },
    { name: 'سارة خالد عبد الرحمن (تجريبي)', phone: '+201000000102', type: 'returning' as const },
    { name: 'محمد إبراهيم حسان (تجريبي)', phone: '+201100000103', type: 'new' as const },
    { name: 'نوران حسن فهمي (تجريبي)', phone: '+201200000104', type: 'returning' as const },
    { name: 'يوسف طارق علام (تجريبي)', phone: '+201500000105', type: 'new' as const },
    { name: 'مريم عادل مصطفى (تجريبي)', phone: '+201000000106', type: 'returning' as const },
    { name: 'كريم وائل الصاوي (تجريبي)', phone: '+201100000107', type: 'new' as const },
    { name: 'دينا شريف النجار (تجريبي)', phone: '+201200000108', type: 'returning' as const },
    { name: 'محمود عبد العزيز (تجريبي)', phone: '+201500000109', type: 'new' as const },
    { name: 'رانيا نبيل زكي (تجريبي)', phone: '+201000000110', type: 'returning' as const },
    { name: 'طارق حسام غنيم (تجريبي)', phone: '+201100000111', type: 'new' as const },
    { name: 'هند سمير الجوهري (تجريبي)', phone: '+201200000112', type: 'new' as const },
    { name: 'عمر شادي بدر (تجريبي)', phone: '+201500000113', type: 'returning' as const },
    { name: 'آية فتحي رضوان (تجريبي)', phone: '+201000000114', type: 'new' as const },
    { name: 'مصطفى كمال الدين (تجريبي)', phone: '+201100000115', type: 'returning' as const },
  ];

  const sampleServices = [
    { id: 'scaling-polishing', ar: 'تنظيف وتلميع الأسنان', en: 'Scaling & Polishing', dur: 30, doc: 'doc-pediatric' },
    { id: 'teeth-whitening', ar: 'تبييض الأسنان بالليزر', en: 'Laser Teeth Whitening', dur: 60, doc: 'doc-pediatric' },
    { id: 'root-canal', ar: 'علاج جذور الأسنان (حشو عصب)', en: 'Root Canal Treatment', dur: 60, doc: 'doc-endo' },
    { id: 'dental-implants', ar: 'استشارة وزراعة الأسنان', en: 'Dental Implants Consult', dur: 45, doc: 'doc-implants' },
    { id: 'cosmetic-fillings', ar: 'حشو الأسنان التجميلي', en: 'Cosmetic Fillings', dur: 45, doc: 'doc-endo' },
    { id: 'pediatric-dentistry', ar: 'طب أسنان الأطفال والوقاية', en: 'Pediatric Dentistry', dur: 30, doc: 'doc-pediatric' },
    { id: 'orthodontics-consult', ar: 'استشارة تقويم الأسنان', en: 'Orthodontics Consultation', dur: 45, doc: 'doc-ortho' },
    { id: 'general-checkup', ar: 'كشف واستشارة عامة', en: 'General Dental Checkup', dur: 30, doc: 'doc-ortho' },
  ];

  // Distribution:
  // Days -14 to -1: Completed, Cancelled, No-Show (~22 appointments)
  // Day 0 (today): 4 appointments (Confirmed, Pending)
  // Days +1 to +14: Upcoming Confirmed, Pending (~16 appointments)
  const relativeDays = [
    -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1,
    0, 0, 0, 0,
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14
  ];

  const times = ['10:30', '11:30', '12:00', '14:30', '16:00', '17:30', '19:00', '20:30'];

  let counter = 1;
  for (let i = 0; i < relativeDays.length; i++) {
    const dayOffset = relativeDays[i];
    const targetDateObj = dayOffset < 0 ? subDays(cairoNow, Math.abs(dayOffset)) : addDays(cairoNow, dayOffset);
    
    // Skip if target is Friday (day 5)
    if (targetDateObj.getDay() === 5) {
      continue;
    }

    const dateStr = format(targetDateObj, 'yyyy-MM-dd');
    const patient = samplePatients[i % samplePatients.length];
    const service = sampleServices[i % sampleServices.length];
    const time = times[(i * 2 + counter) % times.length];
    const doctorObj = INITIAL_DOCTORS.find((d) => d.doctorId === service.doc) || INITIAL_DOCTORS[0];

    // Compute end time
    const [h, m] = time.split(':').map(Number);
    const endMinutes = h * 60 + m + service.dur;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    // Determine realistic status
    let status: Appointment['status'] = 'confirmed';
    if (dayOffset < 0) {
      if (i % 7 === 0) status = 'cancelled';
      else if (i % 9 === 0) status = 'no_show';
      else status = 'completed';
    } else if (dayOffset === 0) {
      status = i % 2 === 0 ? 'confirmed' : 'pending';
    } else {
      status = i % 3 === 0 ? 'pending' : 'confirmed';
    }

    const hexCode = (1000 + counter).toString(16).toUpperCase();
    const bookingCode = `HAY-${hexCode}K${counter % 9}`;

    seedList.push({
      id: `seed-apt-${counter}`,
      bookingCode,
      patientName: patient.name,
      patientPhone: patient.phone,
      patientEmail: `patient${counter}@demo.hayaah`,
      patientType: patient.type,
      serviceId: service.id,
      serviceName: { ar: service.ar, en: service.en },
      serviceDuration: service.dur,
      doctorId: doctorObj.doctorId,
      doctorName: { ar: doctorObj.doctorName.ar, en: doctorObj.doctorName.en },
      date: dateStr,
      startTime: time,
      endTime,
      status,
      notes: i % 2 === 0 ? 'مريض تجريبي عبر نموذج الموقع' : undefined,
      internalNotes: dayOffset < 0 ? 'تم إنهاء الجلسة بنجاح وتقديم التوصيات' : undefined,
      consentGiven: true,
      createdAt: format(subDays(cairoNow, Math.max(1, Math.abs(dayOffset) + 1)), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      updatedAt: format(cairoNow, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    });

    counter++;
  }

  return seedList;
}

export const INITIAL_BLOCKED_SLOTS: BlockedSlot[] = [
  {
    id: 'block-lunch-daily',
    date: format(getCairoNow(), 'yyyy-MM-dd'),
    startTime: '13:00',
    endTime: '14:00',
    reason: 'استراحة الفريق الطبي الدورية / Daily Clinic Team Break',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'block-maintenance',
    date: format(addDays(getCairoNow(), 3), 'yyyy-MM-dd'),
    startTime: '10:00',
    endTime: '11:00',
    reason: 'معايرة وصيانة أجهزة التعقيم / Sterilization Equipment Check',
    createdAt: new Date().toISOString(),
  },
];
