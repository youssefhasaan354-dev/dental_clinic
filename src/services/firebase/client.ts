/**
 * Hayaah Dental Clinic - Firebase Modular Client
 * Lazily loads Firebase Auth & Firestore on demand via dynamic import.
 * When Firebase credentials are not provided, this module is never loaded,
 * ensuring Demo Mode bundle remains 100% lightweight with zero Firebase overhead.
 */

import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';

let appInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;
let authInstance: Auth | null = null;

/**
 * Returns true if all 4 required Firebase environment variables are provided
 * and demo mode is not explicitly forced.
 */
export function isFirebaseConfigured(): boolean {
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    return false;
  }

  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    return true;
  }

  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;

  return Boolean(
    apiKey &&
    authDomain &&
    projectId &&
    appId &&
    apiKey.trim().length > 0 &&
    authDomain.trim().length > 0 &&
    projectId.trim().length > 0 &&
    appId.trim().length > 0
  );
}

/**
 * Lazily initialize and return the FirebaseApp instance.
 */
export async function getFirebaseApp(): Promise<FirebaseApp> {
  if (appInstance) return appInstance;

  if (!isFirebaseConfigured()) {
    throw new Error('Firebase environment variables are not fully configured.');
  }

  const { initializeApp, getApps, getApp } = await import('firebase/app');

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'emulator-api-key',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'emulator.firebaseapp.com',
    projectId:
      import.meta.env.VITE_FIREBASE_PROJECT_ID ||
      (typeof process !== 'undefined' && (process.env?.TEST_PROJECT_ID || process.env?.GCLOUD_PROJECT)) ||
      'test-rules-project',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef',
  };

  if (getApps().length === 0) {
    appInstance = initializeApp(firebaseConfig);
  } else {
    appInstance = getApp();
  }

  return appInstance;
}

/**
 * Lazily get Firestore instance.
 */
export async function getFirebaseFirestore(): Promise<Firestore> {
  if (firestoreInstance) return firestoreInstance;

  const app = await getFirebaseApp();
  const { initializeFirestore, getFirestore } = await import('firebase/firestore');
  try {
    firestoreInstance = initializeFirestore(app, { ignoreUndefinedProperties: true });
  } catch {
    firestoreInstance = getFirestore(app);
  }

  // Connect to Firestore emulator in dev/test when enabled
  if (
    import.meta.env.DEV &&
    (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true' ||
      (typeof process !== 'undefined' && process.env?.FIRESTORE_EMULATOR_HOST))
  ) {
    try {
      const { connectFirestoreEmulator } = await import('firebase/firestore');
      const host =
        (typeof process !== 'undefined' && process.env?.FIRESTORE_EMULATOR_HOST?.split(':')[0]) ||
        '127.0.0.1';
      const port = Number(
        (typeof process !== 'undefined' && process.env?.FIRESTORE_EMULATOR_HOST?.split(':')[1]) ||
        8080
      );
      connectFirestoreEmulator(firestoreInstance, host, port);
    } catch {
      // Ignore if already connected
    }
  }

  return firestoreInstance;
}

/**
 * Lazily get Firebase Auth instance.
 */
export async function getFirebaseAuth(): Promise<Auth> {
  if (authInstance) return authInstance;

  const app = await getFirebaseApp();
  const { getAuth } = await import('firebase/auth');
  authInstance = getAuth(app);
  return authInstance;
}
