/**
 * Hayaah Dental Clinic - Object Cleaner
 * Recursively removes undefined fields from objects and array items before saving to Firestore.
 */

export function stripUndefined<T>(value: T): T {
  if (value === undefined || value === null) return value;

  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => (typeof item === 'object' && item !== null && !(item instanceof Date) ? stripUndefined(item) : item)) as unknown as T;
  }

  if (typeof value === 'object' && !(value instanceof Date)) {
    const result: any = {};
    for (const [key, val] of Object.entries(value)) {
      if (val === undefined) continue;
      if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
        result[key] = stripUndefined(val);
      } else {
        result[key] = val;
      }
    }
    return result as T;
  }

  return value;
}
