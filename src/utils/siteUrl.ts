/**
 * SITE URL RESOLVER
 * Resolves the canonical base site URL dynamically without trailing slash.
 * Priority:
 * 1. import.meta.env.VITE_SITE_URL (configured in Vercel / .env)
 * 2. window.location.origin (current runtime browser origin)
 * 3. Default fallback: 'https://dentallclinic.vercel.app'
 */
export function getSiteUrl(): string {
  const envUrl = (import.meta.env.VITE_SITE_URL || '').trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }
  return 'https://dentallclinic.vercel.app';
}
