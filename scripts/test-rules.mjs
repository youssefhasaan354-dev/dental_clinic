import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import fs from 'fs';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';

async function run() {
  console.log('--- Starting Firestore Rules Test Suite ---');
  const rules = fs.readFileSync('firestore.rules', 'utf8');
  const testEnv = await initializeTestEnvironment({
    projectId: 'test-rules-project',
    firestore: {
      rules,
      host: '127.0.0.1',
      port: 8080,
    },
  });

  try {
    // 1. Setup base fixtures (admins & settings)
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'admins', 'owner-1'), { role: 'owner', name: 'Owner' });
      await setDoc(doc(db, 'admins', 'recep-1'), { role: 'receptionist', name: 'Receptionist' });
      await setDoc(doc(db, 'admins', 'viewer-1'), { role: 'viewer', name: 'Viewer' });
      await setDoc(doc(db, 'admins', 'editor-1'), { role: 'editor', name: 'Editor' });
      await setDoc(doc(db, 'booking_settings', 'global'), { autoConfirm: true });
    });

    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const ownerDb = testEnv.authenticatedContext('owner-1').firestore();
    const recepDb = testEnv.authenticatedContext('recep-1').firestore();
    const viewerDb = testEnv.authenticatedContext('viewer-1').firestore();
    const editorDb = testEnv.authenticatedContext('editor-1').firestore();
    const anonUserDb = testEnv.authenticatedContext('anon-user').firestore();

    // TEST 1: Appointments CREATE denied if internalNotes is present
    console.log('Testing: Appointment create with internalNotes denied...');
    await assertFails(
      setDoc(doc(unauthedDb, 'appointments', 'apt-with-notes'), {
        patientName: 'Test Patient',
        patientPhone: '01012345678',
        serviceId: 'checkup',
        date: '2026-11-01',
        startTime: '10:00',
        bookingCode: 'HAY-NOTES',
        manageToken: 'tok-notes',
        status: 'pending',
        internalNotes: 'Secret staff notes',
      })
    );
    console.log('✓ PASS: internalNotes denied on public create');

    // TEST 2: Arbitrary slot CREATE denied
    console.log('Testing: Anonymous slot create without matching appointment denied...');
    await assertFails(
      setDoc(doc(unauthedDb, 'slots', 'doc1_2026-11-01_1000'), {
        doctorId: 'doc1',
        date: '2026-11-01',
        startTime: '10:00',
        appointmentId: 'non-existent-apt',
      })
    );
    console.log('✓ PASS: Arbitrary slot create denied');

    // TEST 3: Arbitrary slot DELETE denied
    console.log('Testing: Anonymous arbitrary slot delete denied...');
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'slots', 'doc1_2026-11-01_1000'), {
        doctorId: 'doc1',
        date: '2026-11-01',
        startTime: '10:00',
        appointmentId: 'apt-active',
      });
      await setDoc(doc(db, 'appointments', 'apt-active'), {
        patientName: 'Active Patient',
        patientPhone: '01011111111',
        serviceId: 'checkup',
        date: '2026-11-01',
        startTime: '10:00',
        endTime: '10:30',
        doctorId: 'doc1',
        bookingCode: 'HAY-ACT1',
        manageToken: 'tok-active',
        status: 'confirmed',
      });
      await setDoc(doc(db, 'bookingLookup', 'tok-active'), {
        appointmentId: 'apt-active',
        bookingCode: 'HAY-ACT1',
        date: '2026-11-01',
        startTime: '10:00',
        endTime: '10:30',
        doctorId: 'doc1',
        status: 'confirmed',
      });
    });

    await assertFails(
      deleteDoc(doc(unauthedDb, 'slots', 'doc1_2026-11-01_1000'))
    );
    console.log('✓ PASS: Anonymous arbitrary slot delete denied');

    // TEST 4: Patient Cancel by Token succeeds when slots, bookingLookup, appointments updated together
    console.log('Testing: Patient cancel transaction with valid token succeeds...');
    const cancelBatch = writeBatch(unauthedDb);
    cancelBatch.delete(doc(unauthedDb, 'slots', 'doc1_2026-11-01_1000'));
    cancelBatch.update(doc(unauthedDb, 'bookingLookup', 'tok-active'), {
      status: 'cancelled',
      cancelledAt: '2026-10-19T12:00:00Z',
      cancellationReason: 'Patient cancelled',
      updatedAt: '2026-10-19T12:00:00Z',
    });
    cancelBatch.update(doc(unauthedDb, 'appointments', 'apt-active'), {
      status: 'cancelled',
      cancelledAt: '2026-10-19T12:00:00Z',
      cancellationReason: 'Patient cancelled',
      updatedAt: '2026-10-19T12:00:00Z',
    });
    await assertSucceeds(cancelBatch.commit());
    console.log('✓ PASS: Patient cancel with valid token succeeded');

    // TEST 5: Patient Reschedule by Token succeeds with matching new slot
    console.log('Testing: Patient reschedule transaction with valid token succeeds...');
    // Setup appointment to reschedule
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'slots', 'doc1_2026-11-05_0900'), {
        doctorId: 'doc1',
        date: '2026-11-05',
        startTime: '09:00',
        appointmentId: 'apt-resched',
      });
      await setDoc(doc(db, 'appointments', 'apt-resched'), {
        patientName: 'Resched Patient',
        patientPhone: '01022222222',
        serviceId: 'cleaning',
        date: '2026-11-05',
        startTime: '09:00',
        endTime: '09:30',
        doctorId: 'doc1',
        bookingCode: 'HAY-RSC1',
        manageToken: 'tok-resched',
        status: 'confirmed',
      });
      await setDoc(doc(db, 'bookingLookup', 'tok-resched'), {
        appointmentId: 'apt-resched',
        bookingCode: 'HAY-RSC1',
        date: '2026-11-05',
        startTime: '09:00',
        endTime: '09:30',
        doctorId: 'doc1',
        status: 'confirmed',
      });
    });

    const reschedBatch = writeBatch(unauthedDb);
    reschedBatch.delete(doc(unauthedDb, 'slots', 'doc1_2026-11-05_0900'));
    reschedBatch.set(doc(unauthedDb, 'slots', 'doc1_2026-11-06_1100'), {
      doctorId: 'doc1',
      date: '2026-11-06',
      startTime: '11:00',
      appointmentId: 'apt-resched',
    });
    reschedBatch.update(doc(unauthedDb, 'bookingLookup', 'tok-resched'), {
      status: 'confirmed',
      date: '2026-11-06',
      startTime: '11:00',
      endTime: '11:30',
      doctorId: 'doc1',
      updatedAt: '2026-10-19T12:00:00Z',
    });
    reschedBatch.update(doc(unauthedDb, 'appointments', 'apt-resched'), {
      status: 'confirmed',
      date: '2026-11-06',
      startTime: '11:00',
      endTime: '11:30',
      doctorId: 'doc1',
      updatedAt: '2026-10-19T12:00:00Z',
    });
    await assertSucceeds(reschedBatch.commit());
    console.log('✓ PASS: Patient reschedule with valid token succeeded');

    // TEST 6: Reschedule without token or mismatch fails
    console.log('Testing: Reschedule without token or direct appointment tampering fails...');
    await assertFails(
      updateDoc(doc(unauthedDb, 'appointments', 'apt-resched'), {
        date: '2026-11-07',
        patientName: 'Hacked Name',
      })
    );
    console.log('✓ PASS: Direct appointment tampering without token denied');

    // TEST 7: Activity logs staff only
    console.log('Testing: Activity logs create staff only...');
    await assertFails(
      setDoc(doc(unauthedDb, 'activity_logs', 'log-anon'), {
        action: 'Hack attempt',
        timestamp: '2026-10-19',
      })
    );
    await assertSucceeds(
      setDoc(doc(recepDb, 'activity_logs', 'log-recep'), {
        action: 'Manual booking created',
        timestamp: '2026-10-19',
      })
    );
    console.log('✓ PASS: Activity log requires staff');

    // TEST 8: Staff roles
    console.log('Testing: Staff roles enforcement...');
    // Appointments read: staff can read, unauthed cannot
    await assertFails(getDoc(doc(unauthedDb, 'appointments', 'apt-resched')));
    await assertSucceeds(getDoc(doc(recepDb, 'appointments', 'apt-resched')));
    await assertSucceeds(getDoc(doc(ownerDb, 'appointments', 'apt-resched')));

    // Doctor schedules: editor/owner can write, viewer/unauthed cannot
    await assertSucceeds(
      setDoc(doc(editorDb, 'doctor_schedules', 'doc1'), {
        active: true,
        days: [0, 1, 2],
      })
    );
    await assertFails(
      setDoc(doc(viewerDb, 'doctor_schedules', 'doc1'), {
        active: false,
      })
    );
    await assertFails(
      setDoc(doc(unauthedDb, 'doctor_schedules', 'doc1'), {
        active: false,
      })
    );
    console.log('✓ PASS: Staff roles (owner/receptionist/editor/viewer) enforced as specified');

    console.log('--- ALL FIRESTORE RULES TESTS PASSED SUCCESSFULLY! ---');
  } finally {
    await testEnv.cleanup();
  }
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
