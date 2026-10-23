import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSiteUrl } from '../siteUrl';

describe('getSiteUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('strips trailing slashes from site url', () => {
    const url = getSiteUrl();
    expect(url.endsWith('/')).toBe(false);
    expect(url.startsWith('http')).toBe(true);
  });
});
