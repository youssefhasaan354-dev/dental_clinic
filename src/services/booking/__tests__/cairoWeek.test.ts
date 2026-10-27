import { describe, it, expect } from 'vitest';

describe('Cairo Saturday-Thursday Week calculation', () => {
  it('identifies the start of the week as Saturday and end as Thursday', () => {
    // Reference date: Wednesday 2026-10-21
    const testDate = new Date('2026-10-21T12:00:00Z');
    const dayOfWeek = testDate.getDay(); // Sunday=0, Monday=1, ..., Wednesday=3, Saturday=6
    expect(dayOfWeek).toBe(3);

    // Saturday of this week is 2026-10-17
    const diffToSat = (dayOfWeek + 1) % 7;
    const startOfWeek = new Date(testDate);
    startOfWeek.setDate(testDate.getDate() - diffToSat);
    expect(startOfWeek.toISOString().slice(0, 10)).toBe('2026-10-17');

    // Thursday of this week is 2026-10-22
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 5);
    expect(endOfWeek.toISOString().slice(0, 10)).toBe('2026-10-22');
  });

  it('correctly filters appointments belonging to the Saturday-Thursday window', () => {
    const startIso = '2026-10-17';
    const endIso = '2026-10-22';

    const testAppointments = [
      { date: '2026-10-16', status: 'confirmed' }, // Friday before
      { date: '2026-10-17', status: 'confirmed' }, // Saturday (in)
      { date: '2026-10-19', status: 'confirmed' }, // Monday (in)
      { date: '2026-10-22', status: 'confirmed' }, // Thursday (in)
      { date: '2026-10-23', status: 'confirmed' }, // Friday after (out)
      { date: '2026-10-24', status: 'confirmed' }, // Next Saturday (out)
    ];

    const thisWeek = testAppointments.filter((a) => a.date >= startIso && a.date <= endIso);
    expect(thisWeek.length).toBe(3);
    expect(thisWeek.map((a) => a.date)).toEqual(['2026-10-17', '2026-10-19', '2026-10-22']);
  });
});
