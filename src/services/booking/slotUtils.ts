/**
 * Hayaah Dental Clinic - Firestore Slot & Double-Booking Utilities
 * Collection `slots`: one doc per occupied 30-minute block.
 * Deterministic ID format: ${doctorId}_${YYYY-MM-DD}_${HHmm}
 */

import { addMinutesToTime, timeToMinutes } from './slotEngine';

/**
 * Format "HH:mm" time string into 4-digit "HHmm"
 * e.g. "10:30" -> "1030", "09:00" -> "0900", "9:00" -> "0900"
 */
export function formatTimeHHmm(timeStr: string): string {
  const parts = timeStr.trim().split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return `${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}`;
}

/**
 * Generate deterministic slot doc ID:
 * Format: ${doctorId}_${YYYY-MM-DD}_${HHmm}
 */
export function getSlotDocId(doctorId: string, date: string, startTime: string): string {
  return `${doctorId}_${date}_${formatTimeHHmm(startTime)}`;
}

/**
 * Calculate all occupied 30-minute block start times for a given service duration.
 * e.g. startTime "10:00" and duration 30 -> ["10:00"]
 * e.g. startTime "10:00" and duration 45 -> ["10:00", "10:30"] (spans 2 30-min blocks)
 * e.g. startTime "10:00" and duration 60 -> ["10:00", "10:30"]
 * e.g. startTime "10:00" and duration 90 -> ["10:00", "10:30", "11:00"]
 */
export function getServiceSlotBlocks(
  startTime: string,
  durationMinutes: number,
  blockSizeMinutes: number = 30
): string[] {
  const blocks: string[] = [];
  const totalMins = Math.max(durationMinutes, blockSizeMinutes);
  const blockCount = Math.ceil(totalMins / blockSizeMinutes);

  for (let i = 0; i < blockCount; i++) {
    const blockTime = addMinutesToTime(startTime, i * blockSizeMinutes);
    blocks.push(blockTime);
  }

  return blocks;
}

/**
 * Get all deterministic slot doc IDs that a booking will occupy.
 */
export function getSlotDocIdsForBooking(
  doctorId: string,
  date: string,
  startTime: string,
  durationMinutes: number
): string[] {
  const blocks = getServiceSlotBlocks(startTime, durationMinutes);
  return blocks.map((blockTime) => getSlotDocId(doctorId, date, blockTime));
}

/**
 * Cryptographically random manage token generator (>= 20 chars, uses crypto.getRandomValues).
 */
export function generateManageToken(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(24);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback
  return (
    'tok_' +
    Date.now().toString(36) +
    Math.random().toString(36).substring(2) +
    Math.random().toString(36).substring(2)
  );
}

/**
 * Fast phone hash for bookingLookup documents to verify phone without storing plaintext phone in public lookup docs.
 */
export async function hashPhoneForLookup(normalizedPhone: string): Promise<string> {
  const cleaned = normalizedPhone.replace(/\D/g, '');
  if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
    try {
      const msgBuffer = new TextEncoder().encode(`hayaah_phone_${cleaned}`);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
    } catch {
      // Fallback
    }
  }

  let hash = 5381;
  for (let i = 0; i < cleaned.length; i++) {
    hash = (hash * 33) ^ cleaned.charCodeAt(i);
  }
  return `ph_${(hash >>> 0).toString(16)}`;
}
