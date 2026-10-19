import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getCachedData, setCachedData, invalidateCachedData } from '../firestoreCache';

describe('firestoreCache utility', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    const localStorageMock = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
      key: (i: number) => Object.keys(mockStorage)[i] || null,
      get length() {
        return Object.keys(mockStorage).length;
      },
    };

    // Attach to global window
    (global as any).window = {
      localStorage: localStorageMock,
    };
    (global as any).localStorage = localStorageMock;
  });

  afterEach(() => {
    delete (global as any).window;
    delete (global as any).localStorage;
  });

  it('stores and retrieves cached data within TTL', () => {
    const key = 'test_services';
    const payload = [{ id: 'srv1', title: 'Cleaning' }];
    setCachedData(key, payload);

    const retrieved = getCachedData<typeof payload>(key);
    expect(retrieved).toEqual(payload);
  });

  it('returns null if item is expired', () => {
    const key = 'test_expired';
    const payload = { test: true };
    // Manually write an expired record
    const expiredData = {
      expiresAt: Date.now() - 1000, // already expired
      data: payload,
    };
    mockStorage[`hayaah_fs_cache_${key}`] = JSON.stringify(expiredData);

    const retrieved = getCachedData(key);
    expect(retrieved).toBeNull();
  });

  it('invalidates single cache key and all cache keys correctly', () => {
    setCachedData('cache_a', { a: 1 });
    setCachedData('cache_b', { b: 2 });

    expect(getCachedData('cache_a')).toEqual({ a: 1 });
    expect(getCachedData('cache_b')).toEqual({ b: 2 });

    invalidateCachedData('cache_a');
    expect(getCachedData('cache_a')).toBeNull();
    expect(getCachedData('cache_b')).toEqual({ b: 2 });

    invalidateCachedData(); // Invalidate all
    expect(getCachedData('cache_b')).toBeNull();
  });
});
