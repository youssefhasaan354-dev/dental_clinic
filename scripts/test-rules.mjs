import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import fs from 'fs';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, runTransaction } from 'firebase/firestore';

async function run() {
  console.log('--- Starting Exact Transaction Firestore Rules Test Suite ---');
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
    // Setup base fixtures
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
    const editorDb = testEnv.authenticatedContext('editor-1').firestore();
    const viewerDb = testEnv.authenticatedContext('viewer-1').firestore();

    const nowIso = new Date().toISOString();

    // CASE (h): tx.get on appointments by an anonymous user fails
    console.log('Testing (h): tx.get on appointments by anonymous fails...');
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'appointments', 'apt-target'), {
        patientName: 'Confidential Patient',
        patientPhone: '01000000000',
        serviceId: 'checkup',
        date: '2026-11-01',
        startTime: '10:00',
        bookingCode: 'HAY-CONF1',
        manageToken: 'tok-conf1',
        status: 'confirmed',
      });
    });

    await assertFails(
      runTransaction(unauthedDb, async (tx) => {
        await tx.get(doc(unauthedDb, 'appointments', 'apt-target'));
      })
    );
    console.log('✓ PASS (h): tx.get on appointments by anonymous denied by rules');

    // CASE (g): createAppointment transaction as an anonymous user succeeds (2-block service, no email/notes)
    console.log('Testing (g): createAppointment transaction as anonymous succeeds for 2-block service without email/notes...');
    const apptIdG = 'apt-60m-new';
    const tokenG = 'tok-60m-new';
    const slotG1 = 'doc-1_2026-11-01_1000';
    const slotG2 = 'doc-1_2026-11-01_1030';

    await assertSucceeds(
      runTransaction(unauthedDb, async (tx) => {
        const s1 = await tx.get(doc(unauthedDb, 'slots', slotG1));
        const s2 = await tx.get(doc(unauthedDb, 'slots', slotG2));
        if (s1.exists() || s2.exists()) throw new Error('SLOT_TAKEN');

        tx.set(doc(unauthedDb, 'slots', slotG1), {
          doctorId: 'doc-1',
          date: '2026-11-01',
          startTime: '10:00',
          appointmentId: apptIdG,
          createdAt: nowIso,
        });
        tx.set(doc(unauthedDb, 'slots', slotG2), {
          doctorId: 'doc-1',
          date: '2026-11-01',
          startTime: '10:30',
          appointmentId: apptIdG,
          createdAt: nowIso,
        });

        // Appointment without email and without notes
        tx.set(doc(unauthedDb, 'appointments', apptIdG), {
          id: apptIdG,
          bookingCode: 'HAY-G60M',
          manageToken: tokenG,
          patientName: 'Ali Ahmed',
          patientPhone: '+201012345678',
          patientType: 'new',
          serviceId: 'root-canal',
          date: '2026-11-01',
          startTime: '10:00',
          endTime: '11:00',
          doctorId: 'doc-1',
          status: 'confirmed',
          consentGiven: true,
          createdAt: nowIso,
          updatedAt: nowIso,
        });

        tx.set(doc(unauthedDb, 'bookingLookup', tokenG), {
          appointmentId: apptIdG,
          bookingCode: 'HAY-G60M',
          manageToken: tokenG,
          date: '2026-11-01',
          startTime: '10:00',
          endTime: '11:00',
          serviceId: 'root-canal',
          doctorId: 'doc-1',
          status: 'confirmed',
          createdAt: nowIso,
        });
      })
    );
    console.log('✓ PASS (g): Anonymous 2-block appointment created successfully via runTransaction');

    // CASE (b): Anonymous cannot delete the 2nd block of a multi-block booking
    console.log('Testing (b): Anonymous cannot delete the 2nd block of a multi-block booking...');
    await assertFails(
      deleteDoc(doc(unauthedDb, 'slots', slotG2))
    );
    console.log('✓ PASS (b): 2nd block deletion of active booking denied');

    // CASE (a): Patient cancel of a 60-minute booking (2 slots) succeeds with token flow (NO tx.get on appointments)
    console.log('Testing (a): Patient cancel of a 60-minute booking succeeds via token flow without reading appointments...');
    await assertSucceeds(
      runTransaction(unauthedDb, async (tx) => {
        // EXACT service reads: only bookingLookup
        const lookupRef = doc(unauthedDb, 'bookingLookup', tokenG);
        const lookupSnap = await tx.get(lookupRef);
        if (!lookupSnap.exists()) throw new Error('Not found');

        // WRITES: delete both slots, update bookingLookup, update appointments
        tx.delete(doc(unauthedDb, 'slots', slotG1));
        tx.delete(doc(unauthedDb, 'slots', slotG2));

        const cancelData = {
          status: 'cancelled',
          cancelledAt: nowIso,
          cancellationReason: 'Patient cancelled online',
          updatedAt: nowIso,
        };

        tx.update(lookupRef, cancelData);
        tx.update(doc(unauthedDb, 'appointments', apptIdG), cancelData);
      })
    );
    console.log('✓ PASS (a): 60-min booking cancelled and slots released successfully via runTransaction');

    // CASE (c): Patient cannot change a cancelled booking back to confirmed (terminal status protection)
    console.log('Testing (c): Patient cannot un-cancel a cancelled booking back to confirmed...');
    await assertFails(
      runTransaction(unauthedDb, async (tx) => {
        const lookupRef = doc(unauthedDb, 'bookingLookup', tokenG);
        const lookupSnap = await tx.get(lookupRef);
        if (!lookupSnap.exists()) throw new Error('Not found');

        const uncancelData = {
          status: 'confirmed',
          updatedAt: nowIso,
        };

        tx.update(lookupRef, uncancelData);
        tx.update(doc(unauthedDb, 'appointments', apptIdG), uncancelData);
      })
    );
    console.log('✓ PASS (c): Un-cancelling a cancelled booking denied');

    // CASE (d): Patient cannot update bookingLookup alone without matching appointments update
    console.log('Testing (d): Patient cannot update bookingLookup alone without appointments update...');
    // Setup active appointment
    const apptIdD = 'apt-desync';
    const tokenD = 'tok-desync';
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'appointments', apptIdD), {
        id: apptIdD,
        bookingCode: 'HAY-DSNC',
        manageToken: tokenD,
        patientName: 'Desync Test',
        patientPhone: '01000000000',
        serviceId: 'checkup',
        date: '2026-11-05',
        startTime: '10:00',
        endTime: '10:30',
        doctorId: 'doc-1',
        status: 'confirmed',
      });
      await setDoc(doc(db, 'bookingLookup', tokenD), {
        appointmentId: apptIdD,
        bookingCode: 'HAY-DSNC',
        manageToken: tokenD,
        date: '2026-11-05',
        startTime: '10:00',
        endTime: '10:30',
        doctorId: 'doc-1',
        status: 'confirmed',
      });
    });

    await assertFails(
      runTransaction(unauthedDb, async (tx) => {
        const lookupRef = doc(unauthedDb, 'bookingLookup', tokenD);
        await tx.get(lookupRef);
        // Only updates lookup, does not update appointments
        tx.update(lookupRef, {
          status: 'cancelled',
          cancelledAt: nowIso,
          cancellationReason: 'Hacker try',
          updatedAt: nowIso,
        });
      })
    );
    console.log('✓ PASS (d): Updating bookingLookup alone without appointments denied');

    // CASE (e): Reschedule by +30 minutes (overlapping blocks) succeeds
    console.log('Testing (e): Reschedule by +30 minutes with overlapping blocks succeeds...');
    const apptIdE = 'apt-overlap';
    const tokenE = 'tok-overlap';
    const slotOld1 = 'doc-1_2026-11-06_1000';
    const slotShared = 'doc-1_2026-11-06_1030';
    const slotNew2 = 'doc-1_2026-11-06_1100';

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'slots', slotOld1), {
        doctorId: 'doc-1',
        date: '2026-11-06',
        startTime: '10:00',
        appointmentId: apptIdE,
      });
      await setDoc(doc(db, 'slots', slotShared), {
        doctorId: 'doc-1',
        date: '2026-11-06',
        startTime: '10:30',
        appointmentId: apptIdE,
      });
      await setDoc(doc(db, 'appointments', apptIdE), {
        id: apptIdE,
        bookingCode: 'HAY-OVLP',
        manageToken: tokenE,
        patientName: 'Overlap Test',
        patientPhone: '01000000000',
        serviceId: 'root-canal',
        date: '2026-11-06',
        startTime: '10:00',
        endTime: '11:00',
        doctorId: 'doc-1',
        status: 'confirmed',
      });
      await setDoc(doc(db, 'bookingLookup', tokenE), {
        appointmentId: apptIdE,
        bookingCode: 'HAY-OVLP',
        manageToken: tokenE,
        date: '2026-11-06',
        startTime: '10:00',
        endTime: '11:00',
        doctorId: 'doc-1',
        status: 'confirmed',
      });
    });

    await assertSucceeds(
      runTransaction(unauthedDb, async (tx) => {
        const lookupRef = doc(unauthedDb, 'bookingLookup', tokenE);
        const [lookupSnap, sharedSnap, new2Snap] = await Promise.all([
          tx.get(lookupRef),
          tx.get(doc(unauthedDb, 'slots', slotShared)),
          tx.get(doc(unauthedDb, 'slots', slotNew2)),
        ]);

        if (!lookupSnap.exists()) throw new Error('Not found');
        if (new2Snap.exists() && new2Snap.data()?.appointmentId !== apptIdE) throw new Error('SLOT_TAKEN');
        if (sharedSnap.exists() && sharedSnap.data()?.appointmentId !== apptIdE) throw new Error('SLOT_TAKEN');

        // Delete ONLY slot in old but not new (slotOld1 10:00)
        tx.delete(doc(unauthedDb, 'slots', slotOld1));

        // Create ONLY slot in new but not old (slotNew2 11:00)
        tx.set(doc(unauthedDb, 'slots', slotNew2), {
          doctorId: 'doc-1',
          date: '2026-11-06',
          startTime: '11:00',
          appointmentId: apptIdE,
          createdAt: nowIso,
        });

        // Shared slot (10:30) is NOT touched!

        const reschedData = {
          date: '2026-11-06',
          startTime: '10:30',
          endTime: '11:30',
          doctorId: 'doc-1',
          status: 'confirmed',
          updatedAt: nowIso,
        };

        tx.update(lookupRef, reschedData);
        tx.update(doc(unauthedDb, 'appointments', apptIdE), reschedData);
      })
    );
    console.log('✓ PASS (e): Overlapping reschedule (+30m) succeeded without duplicate slot operations');

    // CASE (f): Reschedule without creating the new slot doc fails
    console.log('Testing (f): Reschedule without creating the new slot doc fails...');
    const apptIdF = 'apt-noslot';
    const tokenF = 'tok-noslot';
    const slotF_old = 'doc-1_2026-11-07_1000';

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'slots', slotF_old), {
        doctorId: 'doc-1',
        date: '2026-11-07',
        startTime: '10:00',
        appointmentId: apptIdF,
      });
      await setDoc(doc(db, 'appointments', apptIdF), {
        id: apptIdF,
        bookingCode: 'HAY-NSLT',
        manageToken: tokenF,
        patientName: 'No Slot Test',
        patientPhone: '01000000000',
        serviceId: 'checkup',
        date: '2026-11-07',
        startTime: '10:00',
        endTime: '10:30',
        doctorId: 'doc-1',
        status: 'confirmed',
      });
      await setDoc(doc(db, 'bookingLookup', tokenF), {
        appointmentId: apptIdF,
        bookingCode: 'HAY-NSLT',
        manageToken: tokenF,
        date: '2026-11-07',
        startTime: '10:00',
        endTime: '10:30',
        doctorId: 'doc-1',
        status: 'confirmed',
      });
    });

    await assertFails(
      runTransaction(unauthedDb, async (tx) => {
        const lookupRef = doc(unauthedDb, 'bookingLookup', tokenF);
        await tx.get(lookupRef);

        tx.delete(doc(unauthedDb, 'slots', slotF_old));
        // Intentionally OMIT tx.set on new slot doc!

        const reschedData = {
          date: '2026-11-08',
          startTime: '14:00',
          endTime: '14:30',
          doctorId: 'doc-1',
          status: 'confirmed',
          updatedAt: nowIso,
        };

        tx.update(lookupRef, reschedData);
        tx.update(doc(unauthedDb, 'appointments', apptIdF), reschedData);
      })
    );
    console.log('✓ PASS (f): Reschedule without creating new slot doc denied');

    // Anonymous appointment create without slot fails
    console.log('Testing: Anonymous appointment create without claiming first slot fails...');
    const apptIdNoSlot = 'apt-no-slot-test';
    const tokenNoSlot = 'tok-no-slot-test';
    await assertFails(
      runTransaction(unauthedDb, async (tx) => {
        tx.set(doc(unauthedDb, 'appointments', apptIdNoSlot), {
          id: apptIdNoSlot,
          bookingCode: 'HAY-NOSLOT',
          manageToken: tokenNoSlot,
          patientName: 'No Slot Patient',
          patientPhone: '+201012345678',
          patientType: 'new',
          serviceId: 'root-canal',
          date: '2026-11-01',
          startTime: '12:00',
          endTime: '12:30',
          doctorId: 'doc-1',
          status: 'confirmed',
          consentGiven: true,
          createdAt: nowIso,
          updatedAt: nowIso,
        });
        tx.set(doc(unauthedDb, 'bookingLookup', tokenNoSlot), {
          appointmentId: apptIdNoSlot,
          bookingCode: 'HAY-NOSLOT',
          manageToken: tokenNoSlot,
          date: '2026-11-01',
          startTime: '12:00',
          endTime: '12:30',
          serviceId: 'root-canal',
          doctorId: 'doc-1',
          status: 'confirmed',
          createdAt: nowIso,
        });
        // Intentionally OMIT tx.set on slots/doc-1_2026-11-01_1200
      })
    );
    console.log('✓ PASS: Anonymous appointment create without first slot doc rejected');

    // Staff role checks
    console.log('Testing staff role protections...');
    await assertFails(getDoc(doc(unauthedDb, 'appointments', apptIdF)));
    await assertSucceeds(getDoc(doc(recepDb, 'appointments', apptIdF)));
    await assertSucceeds(getDoc(doc(ownerDb, 'appointments', apptIdF)));

    await assertSucceeds(
      setDoc(doc(editorDb, 'doctor_schedules', 'doc-1'), {
        active: true,
        days: [0, 1, 2],
      })
    );
    await assertFails(
      setDoc(doc(viewerDb, 'doctor_schedules', 'doc-1'), {
        active: false,
      })
    );

    // Viewer cannot update or delete bookingLookup (only Owner and Receptionist can)
    console.log('Testing: Viewer cannot update or delete bookingLookup...');
    const testLookupToken = 'tok-lookup-viewer-check';
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'bookingLookup', testLookupToken), {
        appointmentId: 'apt-lookup-viewer',
        bookingCode: 'HAY-VIEW1',
        manageToken: testLookupToken,
        status: 'confirmed',
        date: '2026-11-01',
        startTime: '10:00',
        endTime: '10:30',
        doctorId: 'doc-1',
      });
    });

    // Viewer read is allowed (list is isStaff, get is public)
    await assertSucceeds(getDoc(doc(viewerDb, 'bookingLookup', testLookupToken)));

    // Viewer update fails
    await assertFails(
      updateDoc(doc(viewerDb, 'bookingLookup', testLookupToken), {
        status: 'cancelled',
      })
    );

    // Viewer delete fails
    await assertFails(deleteDoc(doc(viewerDb, 'bookingLookup', testLookupToken)));

    // Receptionist and Owner update and delete succeed
    await assertSucceeds(
      updateDoc(doc(recepDb, 'bookingLookup', testLookupToken), {
        status: 'cancelled',
      })
    );
    await assertSucceeds(deleteDoc(doc(ownerDb, 'bookingLookup', testLookupToken)));
    console.log('✓ PASS: Viewer cannot update/delete bookingLookup (receptionist/owner allowed)');

    console.log('✓ PASS: Staff role permissions strictly enforced');

    console.log('--- ALL EXACT TRANSACTION RULES TESTS PASSED! ---');
  } finally {
    await testEnv.cleanup();
  }
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
