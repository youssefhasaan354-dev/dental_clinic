import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSiteUrl } from '../siteUrl';
import { buildClinicWhatsAppUrl, generateIcsContent, buildGoogleCalendarUrl } from '../../services/booking/notificationService';
import { Appointment } from '../../services/booking/types';

describe('Site URL Resolution & Notification Link Integration', () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    // Restore globalThis.window
    if (originalWindow !== undefined) {
      globalThis.window = originalWindow;
    } else {
      delete (globalThis as any).window;
    }
  });

  it('strips trailing slashes from site url', () => {
    const url = getSiteUrl();
    expect(url.endsWith('/')).toBe(false);
    expect(url.startsWith('http')).toBe(true);
  });

  it('uses window.location.origin as browser runtime fallback when VITE_SITE_URL is unset', () => {
    const originalEnv = import.meta.env.VITE_SITE_URL;
    (import.meta.env as any).VITE_SITE_URL = '';

    (globalThis as any).window = {
      location: {
        origin: 'https://preview-hayaah-round2.vercel.app/',
      },
    };

    const url = getSiteUrl();
    expect(url).toBe('https://preview-hayaah-round2.vercel.app');

    (import.meta.env as any).VITE_SITE_URL = originalEnv;
  });

  it('falls back to https://dentallclinic.vercel.app when neither env nor window origin is present', () => {
    const originalEnv = import.meta.env.VITE_SITE_URL;
    (import.meta.env as any).VITE_SITE_URL = '';
    delete (globalThis as any).window;

    const url = getSiteUrl();
    expect(url).toBe('https://dentallclinic.vercel.app');

    (import.meta.env as any).VITE_SITE_URL = originalEnv;
  });

  it('embeds dynamic getSiteUrl() in WhatsApp, ICS, and Google Calendar links', () => {
    const dummyAppt: Appointment = {
      id: 'apt-test-1',
      bookingCode: 'HAY-LINK1',
      manageToken: 'token-dyn-link',
      patientName: 'Test Patient',
      patientPhone: '+201012345678',
      serviceId: 'checkup',
      serviceName: { ar: 'كشف عام', en: 'General Checkup' },
      doctorId: 'doc-1',
      date: '2026-11-20',
      startTime: '10:00',
      endTime: '10:30',
      status: 'confirmed',
      consentGiven: true,
    };

    const siteUrl = getSiteUrl();

    // 1. WhatsApp link contains siteUrl
    const waUrl = buildClinicWhatsAppUrl(dummyAppt);
    expect(waUrl).toContain(encodeURIComponent(`${siteUrl}/booking/manage?token=token-dyn-link`));

    // 2. ICS content contains siteUrl
    const icsContent = generateIcsContent(dummyAppt);
    expect(icsContent).toContain(`URL:${siteUrl}/booking/manage?token=token-dyn-link`);

    // 3. Google Calendar link contains siteUrl
    const gCalUrl = buildGoogleCalendarUrl(dummyAppt);
    expect(gCalUrl).toContain(encodeURIComponent(`${siteUrl}/booking/manage?token=token-dyn-link`));
  });
});
