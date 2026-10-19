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
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
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
  const { getFirestore } = await import('firebase/firestore');
  firestoreInstance = getFirestore(app);
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
