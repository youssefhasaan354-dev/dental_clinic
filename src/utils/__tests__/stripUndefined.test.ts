import { describe, it, expect } from 'vitest';
import { stripUndefined } from '../stripUndefined';

describe('stripUndefined utility', () => {
  it('removes undefined properties from a flat object', () => {
    const input = {
      name: 'Dr. Sarah',
      email: undefined,
      phone: '01012345678',
      notes: undefined,
    };
    const result = stripUndefined(input);
    expect(result).toEqual({
      name: 'Dr. Sarah',
      phone: '01012345678',
    });
    expect(Object.prototype.hasOwnProperty.call(result, 'email')).toBe(false);
  });

  it('preserves null, boolean, and empty strings', () => {
    const input = {
      notes: null,
      active: false,
      title: '',
      count: 0,
    };
    const result = stripUndefined(input);
    expect(result).toEqual({
      notes: null,
      active: false,
      title: '',
      count: 0,
    });
  });

  it('recursively cleans nested objects and arrays', () => {
    const input = {
      doctor: {
        id: 'doc1',
        bio: undefined,
        hours: {
          start: '10:00',
          break: undefined,
        },
      },
      list: [1, undefined, { nested: undefined, valid: true }],
    };
    const result = stripUndefined(input);
    expect(result).toEqual({
      doctor: {
        id: 'doc1',
        hours: {
          start: '10:00',
        },
      },
      list: [1, { valid: true }],
    });
  });
});
