/**
 * Hayaah Dental Clinic - Booking Service Factory
 * Switches automatically between DemoBookingService (localStorage default) and
 * FirebaseBookingService (when 4 Firebase environment variables exist).
 */

import { IBookingService } from './IBookingService';
import { DemoBookingService } from './DemoBookingService';
import { FirebaseBookingService } from './FirebaseBookingService';
import { isFirebaseConfigured } from '../firebase/client';

let serviceInstance: IBookingService | null = null;

export function getBookingService(): IBookingService {
  if (serviceInstance) return serviceInstance;

  if (isFirebaseConfigured()) {
    try {
      console.info('[BookingService] Initializing Firebase production adapter');
      serviceInstance = new FirebaseBookingService();
    } catch (err) {
      console.warn('[BookingService] Firebase initialization failed, falling back to Demo adapter:', err);
      serviceInstance = new DemoBookingService();
    }
  } else {
    serviceInstance = new DemoBookingService();
  }

  return serviceInstance;
}

// Re-export types & utilities
export * from './types';
export * from './IBookingService';
export * from './slotEngine';
export * from './slotUtils';
export * from './notificationService';
export * from './bookingValidation';
