/**
 * Hayaah Dental Clinic - Lightweight Privacy-Friendly Analytics
 *
 * Supported providers:
 * 1. Plausible Analytics via VITE_PLAUSIBLE_DOMAIN (zero cookies, privacy-first)
 * 2. Google Analytics 4 via VITE_ANALYTICS_ID (anonymized IP)
 *
 * CRITICAL RULE: NO Personally Identifiable Information (PII) like patient name,
 * phone number, or notes is EVER captured or dispatched.
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    plausible?: (eventName: string, options?: { props?: Record<string, string | number | boolean> }) => void;
  }
}

export function initAnalytics(): void {
  if (typeof window === 'undefined') return;

  const plausibleDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
  const analyticsId = import.meta.env.VITE_ANALYTICS_ID;

  // 1. Plausible Analytics injection
  if (plausibleDomain && !document.querySelector('script[data-domain]')) {
    const script = document.createElement('script');
    script.defer = true;
    script.setAttribute('data-domain', plausibleDomain);
    script.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(script);
  }

  // 2. Google Analytics 4 injection
  if (analyticsId && !document.querySelector('script[src*="googletagmanager.com"]')) {
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
    document.head.appendChild(gaScript);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: any[]) {
      window.dataLayer?.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', analyticsId, {
      anonymize_ip: true,
      send_page_view: true,
    });
  }
}

export function trackEvent(eventName: string, params: Record<string, string | number | boolean> = {}): void {
  if (typeof window === 'undefined') return;

  // Sanitize: strictly strip any accidental PII fields
  const safeProps: Record<string, string | number | boolean> = {};
  const forbiddenKeys = ['name', 'phone', 'email', 'note', 'notes', 'patientName', 'patientPhone', 'patientEmail'];

  for (const [key, value] of Object.entries(params)) {
    if (!forbiddenKeys.some((f) => key.toLowerCase().includes(f.toLowerCase()))) {
      safeProps[key] = value;
    }
  }

  try {
    if (typeof window.plausible === 'function') {
      window.plausible(eventName, { props: safeProps });
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, safeProps);
    }
  } catch {
    // Fail silently without disrupting user interaction
  }
}
