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
      setDoc(doc(ownerDb, 'doctor_schedules', 'doc-1'), {
        active: true,
        days: [0, 1, 2],
      })
    );
    await assertFails(
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

    // site_images security tests: public read, write isEditor()
    console.log('Testing: site_images security rules (public read, write isEditor)...');
    await assertSucceeds(getDoc(doc(unauthedDb, 'site_images', 'global')));
    await assertFails(setDoc(doc(unauthedDb, 'site_images', 'global'), { 'slot-hero': { mediaType: 'video' } }));
    await assertFails(setDoc(doc(viewerDb, 'site_images', 'global'), { 'slot-hero': { mediaType: 'video' } }));
    await assertSucceeds(setDoc(doc(editorDb, 'site_images', 'global'), { 'slot-hero': { mediaType: 'video' } }));
    await assertSucceeds(setDoc(doc(ownerDb, 'site_images', 'global'), { 'slot-hero': { mediaType: 'image' } }));

    // New Phase D: Appointment Payload Validation Rules
    console.log('Testing: Appointment payload validation rules (name length, phone format, allowed keys, notes length)...');
    const validSlotId = 'doc-1_2026-11-01_1130';
    const validApptId = 'apt-val-check';

    // 1. Name too short (< 2 chars) fails
    await assertFails(
      runTransaction(unauthedDb, async (tx) => {
        tx.set(doc(unauthedDb, 'slots', validSlotId), {
          doctorId: 'doc-1',
          date: '2026-11-01',
          startTime: '11:30',
          appointmentId: validApptId,
        });
        tx.set(doc(unauthedDb, 'appointments', validApptId), {
          id: validApptId,
          bookingCode: 'HAY-VAL1',
          manageToken: 'tok-val1',
          patientName: 'A', // invalid: too short
          patientPhone: '+201012345678',
          serviceId: 'root-canal',
          date: '2026-11-01',
          startTime: '11:30',
          doctorId: 'doc-1',
          status: 'confirmed',
          consentGiven: true,
        });
      })
    );
    console.log('✓ PASS: Short patientName (<2 chars) correctly rejected');

    // 2. Invalid phone format fails
    await assertFails(
      runTransaction(unauthedDb, async (tx) => {
        tx.set(doc(unauthedDb, 'slots', validSlotId), {
          doctorId: 'doc-1',
          date: '2026-11-01',
          startTime: '11:30',
          appointmentId: validApptId,
        });
        tx.set(doc(unauthedDb, 'appointments', validApptId), {
          id: validApptId,
          bookingCode: 'HAY-VAL2',
          manageToken: 'tok-val2',
          patientName: 'Ahmed Omar',
          patientPhone: 'invalid-phone-123', // invalid
          serviceId: 'root-canal',
          date: '2026-11-01',
          startTime: '11:30',
          doctorId: 'doc-1',
          status: 'confirmed',
          consentGiven: true,
        });
      })
    );
    console.log('✓ PASS: Invalid patientPhone correctly rejected');

    // 3. Injected unexpected keys fail (keys().hasOnly check)
    await assertFails(
      runTransaction(unauthedDb, async (tx) => {
        tx.set(doc(unauthedDb, 'slots', validSlotId), {
          doctorId: 'doc-1',
          date: '2026-11-01',
          startTime: '11:30',
          appointmentId: validApptId,
        });
        tx.set(doc(unauthedDb, 'appointments', validApptId), {
          id: validApptId,
          bookingCode: 'HAY-VAL3',
          manageToken: 'tok-val3',
          patientName: 'Ahmed Omar',
          patientPhone: '+201012345678',
          serviceId: 'root-canal',
          date: '2026-11-01',
          startTime: '11:30',
          doctorId: 'doc-1',
          status: 'confirmed',
          consentGiven: true,
          injectedAdminRole: 'owner', // unexpected key!
        });
      })
    );
    console.log('✓ PASS: Injected unexpected keys correctly rejected by keys().hasOnly');

    // 4. Excessively long notes (> 1000 chars) fail
    await assertFails(
      runTransaction(unauthedDb, async (tx) => {
        tx.set(doc(unauthedDb, 'slots', validSlotId), {
          doctorId: 'doc-1',
          date: '2026-11-01',
          startTime: '11:30',
          appointmentId: validApptId,
        });
        tx.set(doc(unauthedDb, 'appointments', validApptId), {
          id: validApptId,
          bookingCode: 'HAY-VAL4',
          manageToken: 'tok-val4',
          patientName: 'Ahmed Omar',
          patientPhone: '+201012345678',
          serviceId: 'root-canal',
          date: '2026-11-01',
          startTime: '11:30',
          doctorId: 'doc-1',
          status: 'confirmed',
          consentGiven: true,
          notes: 'x'.repeat(1005), // too long
        });
      })
    );
    console.log('✓ PASS: Excessively long notes (>1000 chars) correctly rejected');

    // A3.1: Status must match getAutoConfirm()
    console.log('Testing (A3.1): Status must be confirmed only when autoConfirm == true...');
    // Currently autoConfirm is true -> pending must FAIL
    const testSlotA3 = 'doc-1_2026-11-01_1300';
    const testApptA3 = 'apt-a3-status';
    await assertFails(
      runTransaction(unauthedDb, async (tx) => {
        tx.set(doc(unauthedDb, 'slots', testSlotA3), {
          doctorId: 'doc-1',
          date: '2026-11-01',
          startTime: '13:00',
          appointmentId: testApptA3,
        });
        tx.set(doc(unauthedDb, 'appointments', testApptA3), {
          id: testApptA3,
          bookingCode: 'HAY-A3S1',
          manageToken: 'tok-a3s1',
          patientName: 'Status Test',
          patientPhone: '+201012345678',
          serviceId: 'root-canal',
          date: '2026-11-01',
          startTime: '13:00',
          doctorId: 'doc-1',
          status: 'pending', // rejected because autoConfirm is true!
          consentGiven: true,
        });
      })
    );
    console.log('✓ PASS (A3.1): Anonymous pending appointment rejected when autoConfirm is true');

    // Toggle autoConfirm to false and verify confirmed fails while pending succeeds
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'booking_settings', 'global'), { autoConfirm: false });
    });

    const testSlotA3b = 'doc-1_2026-11-01_1330';
    const testApptA3b = 'apt-a3-status-b';
    await assertFails(
      runTransaction(unauthedDb, async (tx) => {
        tx.set(doc(unauthedDb, 'slots', testSlotA3b), {
          doctorId: 'doc-1',
          date: '2026-11-01',
          startTime: '13:30',
          appointmentId: testApptA3b,
        });
        tx.set(doc(unauthedDb, 'appointments', testApptA3b), {
          id: testApptA3b,
          bookingCode: 'HAY-A3S2',
          manageToken: 'tok-a3s2',
          patientName: 'Status Test',
          patientPhone: '+201012345678',
          serviceId: 'root-canal',
          date: '2026-11-01',
          startTime: '13:30',
          doctorId: 'doc-1',
          status: 'confirmed', // rejected because autoConfirm is false!
          consentGiven: true,
        });
      })
    );

    // Pending succeeds when autoConfirm is false
    await assertSucceeds(
      runTransaction(unauthedDb, async (tx) => {
        tx.set(doc(unauthedDb, 'slots', testSlotA3b), {
          doctorId: 'doc-1',
          date: '2026-11-01',
          startTime: '13:30',
          appointmentId: testApptA3b,
        });
        tx.set(doc(unauthedDb, 'appointments', testApptA3b), {
          id: testApptA3b,
          bookingCode: 'HAY-A3S2',
          manageToken: 'tok-a3s2',
          patientName: 'Status Test',
          patientPhone: '+201012345678',
          serviceId: 'root-canal',
          date: '2026-11-01',
          startTime: '13:30',
          doctorId: 'doc-1',
          status: 'pending', // succeeds when autoConfirm is false
          consentGiven: true,
        });
        tx.set(doc(unauthedDb, 'bookingLookup', 'tok-a3s2'), {
          appointmentId: testApptA3b,
          bookingCode: 'HAY-A3S2',
          manageToken: 'tok-a3s2',
          date: '2026-11-01',
          startTime: '13:30',
          doctorId: 'doc-1',
          status: 'pending',
        });
      })
    );
    console.log('✓ PASS (A3.1): When autoConfirm is false, confirmed is rejected and pending is accepted');

    // Restore autoConfirm to true for subsequent tests
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'booking_settings', 'global'), { autoConfirm: true });
    });

    // A3.2: isWalkIn protection (forbidden from public client, allowed for staff)
    console.log('Testing (A3.2): isWalkIn forbidden from anonymous client, allowed for staff...');
    const testSlotWalkIn = 'doc-1_2026-11-01_1400';
    const testApptWalkIn = 'apt-a3-walkin';
    await assertFails(
      runTransaction(unauthedDb, async (tx) => {
        tx.set(doc(unauthedDb, 'slots', testSlotWalkIn), {
          doctorId: 'doc-1',
          date: '2026-11-01',
          startTime: '14:00',
          appointmentId: testApptWalkIn,
        });
        tx.set(doc(unauthedDb, 'appointments', testApptWalkIn), {
          id: testApptWalkIn,
          bookingCode: 'HAY-WALK1',
          manageToken: 'tok-walk1',
          patientName: 'WalkIn Impostor',
          patientPhone: '+201012345678',
          serviceId: 'root-canal',
          date: '2026-11-01',
          startTime: '14:00',
          doctorId: 'doc-1',
          status: 'confirmed',
          consentGiven: true,
          isWalkIn: true, // Forbidden from anonymous!
        });
      })
    );

    // Receptionist can create walkIn appointment
    await assertSucceeds(
      setDoc(doc(recepDb, 'appointments', testApptWalkIn), {
        id: testApptWalkIn,
        bookingCode: 'HAY-WALK1',
        manageToken: 'tok-walk1',
        patientName: 'WalkIn Patient',
        patientPhone: '+201012345678',
        serviceId: 'root-canal',
        date: '2026-11-01',
        startTime: '14:00',
        doctorId: 'doc-1',
        status: 'confirmed',
        consentGiven: true,
        isWalkIn: true,
      })
    );
    console.log('✓ PASS (A3.2): Anonymous isWalkIn: true rejected, receptionist allowed');

    // A3.3: consentGiven == true is mandatory for public client
    console.log('Testing (A3.3): consentGiven == true mandatory for anonymous client...');
    const testSlotConsent = 'doc-1_2026-11-01_1430';
    const testApptConsent = 'apt-a3-consent';
    // Missing consentGiven
    await assertFails(
      runTransaction(unauthedDb, async (tx) => {
        tx.set(doc(unauthedDb, 'slots', testSlotConsent), {
          doctorId: 'doc-1',
          date: '2026-11-01',
          startTime: '14:30',
          appointmentId: testApptConsent,
        });
        tx.set(doc(unauthedDb, 'appointments', testApptConsent), {
          id: testApptConsent,
          bookingCode: 'HAY-CNS1',
          manageToken: 'tok-cns1',
          patientName: 'Consent Patient',
          patientPhone: '+201012345678',
          serviceId: 'root-canal',
          date: '2026-11-01',
          startTime: '14:30',
          doctorId: 'doc-1',
          status: 'confirmed',
          // consentGiven missing!
        });
      })
    );
    // consentGiven: false
    await assertFails(
      runTransaction(unauthedDb, async (tx) => {
        tx.set(doc(unauthedDb, 'slots', testSlotConsent), {
          doctorId: 'doc-1',
          date: '2026-11-01',
          startTime: '14:30',
          appointmentId: testApptConsent,
        });
        tx.set(doc(unauthedDb, 'appointments', testApptConsent), {
          id: testApptConsent,
          bookingCode: 'HAY-CNS1',
          manageToken: 'tok-cns1',
          patientName: 'Consent Patient',
          patientPhone: '+201012345678',
          serviceId: 'root-canal',
          date: '2026-11-01',
          startTime: '14:30',
          doctorId: 'doc-1',
          status: 'confirmed',
          consentGiven: false, // Must be true!
        });
      })
    );
    console.log('✓ PASS (A3.3): Anonymous missing/false consentGiven rejected');

    // A3.4: createdAt / updatedAt size bounds and type
    console.log('Testing (A3.4): createdAt / updatedAt bounds and string type validation...');
    const testSlotTime = 'doc-1_2026-11-01_1500';
    const testApptTime = 'apt-a3-time';
    // Non-string createdAt fails
    await assertFails(
      runTransaction(unauthedDb, async (tx) => {
        tx.set(doc(unauthedDb, 'slots', testSlotTime), {
          doctorId: 'doc-1',
          date: '2026-11-01',
          startTime: '15:00',
          appointmentId: testApptTime,
        });
        tx.set(doc(unauthedDb, 'appointments', testApptTime), {
          id: testApptTime,
          bookingCode: 'HAY-TIME1',
          manageToken: 'tok-time1',
          patientName: 'Time Patient',
          patientPhone: '+201012345678',
          serviceId: 'root-canal',
          date: '2026-11-01',
          startTime: '15:00',
          doctorId: 'doc-1',
          status: 'confirmed',
          consentGiven: true,
          createdAt: 1714000000000, // Invalid: number instead of string
        });
      })
    );
    // Overly long createdAt fails (> 50 chars)
    await assertFails(
      runTransaction(unauthedDb, async (tx) => {
        tx.set(doc(unauthedDb, 'slots', testSlotTime), {
          doctorId: 'doc-1',
          date: '2026-11-01',
          startTime: '15:00',
          appointmentId: testApptTime,
        });
        tx.set(doc(unauthedDb, 'appointments', testApptTime), {
          id: testApptTime,
          bookingCode: 'HAY-TIME2',
          manageToken: 'tok-time2',
          patientName: 'Time Patient',
          patientPhone: '+201012345678',
          serviceId: 'root-canal',
          date: '2026-11-01',
          startTime: '15:00',
          doctorId: 'doc-1',
          status: 'confirmed',
          consentGiven: true,
          createdAt: '2026-11-01T15:00:00.000Z' + 'x'.repeat(40), // > 50 chars!
        });
      })
    );
    console.log('✓ PASS (A3.4): Non-string and excessively long createdAt/updatedAt rejected');

    // 5. Doctor management security: only owner can write/delete, public can read
    console.log('Testing doctor management security rules...');
    await assertSucceeds(getDoc(doc(unauthedDb, 'doctor_schedules', 'doc-1')));
    await assertSucceeds(getDoc(doc(unauthedDb, 'doctors', 'doc-1')));

    // Unauthenticated write fails
    await assertFails(setDoc(doc(unauthedDb, 'doctor_schedules', 'doc-test-unauth'), { doctorId: 'doc-test-unauth' }));
    await assertFails(setDoc(doc(unauthedDb, 'doctors', 'doc-test-unauth'), { id: 'doc-test-unauth' }));

    // Editor write fails (only owner allowed)
    await assertFails(setDoc(doc(editorDb, 'doctor_schedules', 'doc-test-editor'), { doctorId: 'doc-test-editor' }));
    await assertFails(setDoc(doc(editorDb, 'doctors', 'doc-test-editor'), { id: 'doc-test-editor' }));

    // Owner write succeeds
    await assertSucceeds(setDoc(doc(ownerDb, 'doctor_schedules', 'doc-test-owner'), { doctorId: 'doc-test-owner', isActive: true }));
    await assertSucceeds(setDoc(doc(ownerDb, 'doctors', 'doc-test-owner'), { id: 'doc-test-owner', name_ar: 'طبيب معتمد' }));
    await assertSucceeds(deleteDoc(doc(ownerDb, 'doctor_schedules', 'doc-test-owner')));
    await assertSucceeds(deleteDoc(doc(ownerDb, 'doctors', 'doc-test-owner')));
    console.log('✓ PASS: Doctor management write/delete strictly restricted to owner only (editor & public denied)');

    console.log('--- ALL EXACT TRANSACTION RULES TESTS PASSED! ---');
  } finally {
    await testEnv.cleanup();
  }
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
