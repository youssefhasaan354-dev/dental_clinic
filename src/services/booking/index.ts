/**
 * Hayaah Dental Clinic - Booking Service Factory
 * Switches automatically between DemoBookingService (localStorage default) and
 * SupabaseBookingService (when environment credentials exist).
 */

import { IBookingService } from './IBookingService';
import { DemoBookingService } from './DemoBookingService';
import { SupabaseBookingService } from './SupabaseBookingService';

let serviceInstance: IBookingService | null = null;

export function getBookingService(): IBookingService {
  if (serviceInstance) return serviceInstance;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co') {
    try {
      console.info('[BookingService] Initializing Supabase production adapter');
      serviceInstance = new SupabaseBookingService(supabaseUrl, supabaseAnonKey);
    } catch (err) {
      console.warn('[BookingService] Supabase initialization failed, falling back to Demo adapter:', err);
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
export * from './notificationService';
