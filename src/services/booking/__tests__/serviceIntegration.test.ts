import { describe, it, expect, beforeAll } from 'vitest';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { FirebaseBookingService } from '../FirebaseBookingService';
import { doc, setDoc } from 'firebase/firestore';

import fs from 'fs';

const isEmulatorActive = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

describe.runIf(isEmulatorActive)('FirebaseBookingService live integration against Firestore emulator', () => {
  let service: FirebaseBookingService;

  beforeAll(async () => {
    // Enable emulator mode and point to test project
    process.env.VITE_USE_FIREBASE_EMULATOR = 'true';
    process.env.TEST_PROJECT_ID = 'test-rules-project';
    service = new FirebaseBookingService();

    const hostPort = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
    const [host, port] = hostPort.split(':');
    const rules = fs.readFileSync('firestore.rules', 'utf8');
    const testEnv = await initializeTestEnvironment({
      projectId: 'test-rules-project',
      firestore: {
        rules,
        host,
        port: Number(port),
      },
    });

    // Set up fixtures with security rules disabled (simulating admin pre-population)
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'booking_settings', 'global'), {
        autoConfirm: true,
        minNoticeHours: 0,
        bufferMinutes: 0,
      });
      await setDoc(doc(db, 'doctor_schedules', 'doc-1'), {
        doctorId: 'doc-1',
        isActive: true,
        weeklyHours: {
          0: { isWorking: true, start: '09:00', end: '22:00' },
          1: { isWorking: true, start: '09:00', end: '22:00' },
          2: { isWorking: true, start: '09:00', end: '22:00' },
          3: { isWorking: true, start: '09:00', end: '22:00' },
          4: { isWorking: true, start: '09:00', end: '22:00' },
          5: { isWorking: false, start: '00:00', end: '00:00' },
          6: { isWorking: true, start: '09:00', end: '22:00' },
        },
      });
    });
  });

  it('performs end-to-end create -> reschedule -> cancel via real FirebaseBookingService methods', async () => {
    const testDate = '2026-11-15';
    // 1. Create Appointment as an anonymous patient
    const createRes = await service.createAppointment({
      patientName: 'Integration Patient',
      patientPhone: '01012345678',
      serviceId: 'checkup-cleaning',
      date: testDate,
      startTime: '10:00',
      consentGiven: true,
    });

    expect(createRes.success).toBe(true);
    expect(createRes.appointment).toBeDefined();
    const apt = createRes.appointment!;
    expect(apt.manageToken).toBeDefined();

    const token = apt.manageToken!;

    // 2. Lookup by Token (public endpoint)
    const fetched = await service.getAppointmentByToken(token);
    expect(fetched).not.toBeNull();
    expect(fetched?.bookingCode).toBe(apt.bookingCode);
    expect(fetched?.startTime).toBe('10:00');

    // 3. Reschedule by Token (over +30 mins: 10:30)
    const reschedRes = await service.rescheduleAppointmentByToken({
      token,
      newDate: testDate,
      newStartTime: '10:30',
      newDoctorId: 'doc-1',
    });

    expect(reschedRes.success).toBe(true);
    expect(reschedRes.appointment?.startTime).toBe('10:30');

    // Verify lookup was updated
    const afterResched = await service.getAppointmentByToken(token);
    expect(afterResched?.startTime).toBe('10:30');

    // 4. Cancel by Token
    const cancelRes = await service.cancelAppointmentByToken(token, 'Integration test cancellation');
    expect(cancelRes.success).toBe(true);

    // Verify lookup is cancelled
    const afterCancel = await service.getAppointmentByToken(token);
    expect(afterCancel?.status).toBe('cancelled');
  });
});
