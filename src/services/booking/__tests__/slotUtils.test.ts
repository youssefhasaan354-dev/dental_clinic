import { describe, it, expect } from 'vitest';
import {
  formatTimeHHmm,
  getSlotDocId,
  getServiceSlotBlocks,
  getSlotDocIdsForBooking,
  generateManageToken,
  hashPhoneForLookup,
} from '../slotUtils';

describe('Slot Utilities and Double-Booking Prevention', () => {
  describe('formatTimeHHmm', () => {
    it('formats 2-digit hour times correctly', () => {
      expect(formatTimeHHmm('10:30')).toBe('1030');
      expect(formatTimeHHmm('14:00')).toBe('1400');
      expect(formatTimeHHmm('21:45')).toBe('2145');
    });

    it('pads single-digit hours with leading zero', () => {
      expect(formatTimeHHmm('9:00')).toBe('0900');
      expect(formatTimeHHmm('9:30')).toBe('0930');
      expect(formatTimeHHmm('09:00')).toBe('0900');
    });
  });

  describe('getSlotDocId', () => {
    it('generates deterministic slot doc ID in doctorId_YYYY-MM-DD_HHmm format', () => {
      const docId = getSlotDocId('doc-1', '2026-10-25', '10:30');
      expect(docId).toBe('doc-1_2026-10-25_1030');
    });

    it('is completely deterministic across repeated calls', () => {
      const id1 = getSlotDocId('doc-surgery', '2026-11-01', '14:00');
      const id2 = getSlotDocId('doc-surgery', '2026-11-01', '14:00');
      expect(id1).toBe(id2);
      expect(id1).toBe('doc-surgery_2026-11-01_1400');
    });
  });

  describe('getServiceSlotBlocks', () => {
    it('returns a single 30-min block for 30-minute services', () => {
      const blocks = getServiceSlotBlocks('10:00', 30);
      expect(blocks).toEqual(['10:00']);
    });

    it('returns two 30-min blocks for 45-minute services', () => {
      // 45 minutes occupies 10:00-10:30 and 10:30-11:00
      const blocks = getServiceSlotBlocks('10:00', 45);
      expect(blocks).toEqual(['10:00', '10:30']);
    });

    it('returns two 30-min blocks for 60-minute services', () => {
      const blocks = getServiceSlotBlocks('10:00', 60);
      expect(blocks).toEqual(['10:00', '10:30']);
    });

    it('returns three 30-min blocks for 90-minute complex procedures', () => {
      const blocks = getServiceSlotBlocks('10:00', 90);
      expect(blocks).toEqual(['10:00', '10:30', '11:00']);
    });
  });

  describe('getSlotDocIdsForBooking', () => {
    it('generates all occupied slot IDs for a 60-min service', () => {
      const slotIds = getSlotDocIdsForBooking('doc-1', '2026-10-25', '10:00', 60);
      expect(slotIds).toEqual([
        'doc-1_2026-10-25_1000',
        'doc-1_2026-10-25_1030',
      ]);
    });
  });

  describe('Multi-block conflict detection', () => {
    it('detects conflict when a new booking overlaps with the first block of an existing 60m booking', () => {
      const existingBookingSlots = new Set(
        getSlotDocIdsForBooking('doc-1', '2026-10-25', '10:00', 60)
      );
      // Existing holds: 'doc-1_2026-10-25_1000' and 'doc-1_2026-10-25_1030'

      // New candidate: 30m at 10:00
      const candidate1 = getSlotDocIdsForBooking('doc-1', '2026-10-25', '10:00', 30);
      const hasConflict1 = candidate1.some((id) => existingBookingSlots.has(id));
      expect(hasConflict1).toBe(true);
    });

    it('detects conflict when a new booking overlaps with the second block of an existing 60m booking', () => {
      const existingBookingSlots = new Set(
        getSlotDocIdsForBooking('doc-1', '2026-10-25', '10:00', 60)
      );

      // New candidate: 30m at 10:30
      const candidate2 = getSlotDocIdsForBooking('doc-1', '2026-10-25', '10:30', 30);
      const hasConflict2 = candidate2.some((id) => existingBookingSlots.has(id));
      expect(hasConflict2).toBe(true);
    });

    it('detects conflict when an earlier 60m booking extends into the existing booking', () => {
      const existingBookingSlots = new Set(
        getSlotDocIdsForBooking('doc-1', '2026-10-25', '10:00', 60)
      );

      // New candidate: 60m at 09:30 (occupies 09:30 and 10:00)
      const candidate3 = getSlotDocIdsForBooking('doc-1', '2026-10-25', '09:30', 60);
      const hasConflict3 = candidate3.some((id) => existingBookingSlots.has(id));
      expect(hasConflict3).toBe(true);
    });

    it('allows booking immediately after the existing booking ends', () => {
      const existingBookingSlots = new Set(
        getSlotDocIdsForBooking('doc-1', '2026-10-25', '10:00', 60)
      );

      // New candidate: 30m at 11:00
      const candidate4 = getSlotDocIdsForBooking('doc-1', '2026-10-25', '11:00', 30);
      const hasConflict4 = candidate4.some((id) => existingBookingSlots.has(id));
      expect(hasConflict4).toBe(false);
    });

    it('allows same-time booking for a different available doctor', () => {
      const existingBookingSlots = new Set(
        getSlotDocIdsForBooking('doc-1', '2026-10-25', '10:00', 60)
      );

      // New candidate: 60m at 10:00 for doctor 'doc-pediatric'
      const candidate5 = getSlotDocIdsForBooking('doc-pediatric', '2026-10-25', '10:00', 60);
      const hasConflict5 = candidate5.some((id) => existingBookingSlots.has(id));
      expect(hasConflict5).toBe(false);
    });
  });

  describe('generateManageToken', () => {
    it('generates cryptographically strong random token of at least 20 chars', () => {
      const token = generateManageToken();
      expect(token.length).toBeGreaterThanOrEqual(20);
    });

    it('generates distinct unique tokens across repeated calls', () => {
      const tokenA = generateManageToken();
      const tokenB = generateManageToken();
      expect(tokenA).not.toBe(tokenB);
    });
  });

  describe('hashPhoneForLookup', () => {
    it('produces consistent hash for normalized phone numbers', async () => {
      const hash1 = await hashPhoneForLookup('+201012345678');
      const hash2 = await hashPhoneForLookup('+201012345678');
      expect(hash1).toBe(hash2);
    });

    it('hashes equivalent phone strings cleanly without symbols', async () => {
      const hashA = await hashPhoneForLookup('01012345678');
      const hashB = await hashPhoneForLookup('010-1234-5678');
      expect(hashA).toBe(hashB);
    });
  });
});
