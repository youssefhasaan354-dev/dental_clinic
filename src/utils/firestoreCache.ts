/**
 * Hayaah Dental Clinic - Firestore Client-Side Cache
 * Stores public GET data in localStorage with a 10-minute TTL to reduce Firestore reads.
 * Invalidated on admin writes.
 */

const CACHE_PREFIX = 'hayaah_fs_cache_';
const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CacheEnvelope<T> {
  data: T;
  expiresAt: number;
}

export function getCachedData<T>(key: string): T | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;

  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;

    const envelope: CacheEnvelope<T> = JSON.parse(raw);
    if (Date.now() > envelope.expiresAt) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return envelope.data;
  } catch {
    return null;
  }
}

export function setCachedData<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const envelope: CacheEnvelope<T> = {
      data,
      expiresAt: Date.now() + ttlMs,
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(envelope));
  } catch (err) {
    console.warn(`[FirestoreCache] Failed to write cache for ${key}:`, err);
  }
}

export function invalidateCachedData(keyOrPrefix?: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    if (!keyOrPrefix) {
      // Clear all cache entries
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(CACHE_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      return;
    }

    const fullKey = `${CACHE_PREFIX}${keyOrPrefix}`;
    localStorage.removeItem(fullKey);

    // Also match prefixes
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(fullKey)) {
        localStorage.removeItem(k);
      }
    }
  } catch (err) {
    console.warn('[FirestoreCache] Failed to invalidate cache:', err);
  }
}
