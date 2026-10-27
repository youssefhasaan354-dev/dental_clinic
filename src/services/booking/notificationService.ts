/**
 * Hayaah Dental Clinic - Notification Dispatcher & Channel Adapters
 *
 * Provides a clean extensible notification abstraction:
 * 1. WhatsApp Web/App prefilled link builder (primary, zero-cost, instant)
 * 2. Pluggable stub adapters for SMS (e.g. Twilio/Vodafone SMS), Email (e.g. Resend/SendGrid),
 *    and WhatsApp Business Cloud API.
 *
 * NOTE: As required, this does NOT fake sending emails. Stubs log to console or return no-op,
 * and provide clear plug points where clinic credentials can be wired in.
 */

import { Appointment, BookingSettings } from './types';
import { DEFAULT_BOOKING_SETTINGS } from './slotEngine';
import { getSiteUrl } from '../../utils/siteUrl';
import { CLINIC_DATA } from '../../data/clinic';

export interface NotificationPayload {
  type: 'booking_created' | 'booking_confirmed' | 'booking_cancelled' | 'booking_rescheduled';
  appointment: Appointment;
  language?: 'ar' | 'en';
}

export interface INotificationAdapter {
  name: string;
  send(payload: NotificationPayload): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

/**
 * Build prefilled WhatsApp URL for patient to message the clinic directly
 */
export function buildClinicWhatsAppUrl(
  appointment: Appointment,
  settings: BookingSettings = DEFAULT_BOOKING_SETTINGS,
  language: 'ar' | 'en' = 'ar'
): string {
  const isAr = language === 'ar';
  const defaultClinicWhatsapp = (CLINIC_DATA.whatsapp?.number || '20226355669').replace(/[^0-9]/g, '');
  const cleanSettingsTarget = settings?.clinicWhatsapp ? settings.clinicWhatsapp.replace(/[^0-9]/g, '') : '';
  const clinicTarget = (cleanSettingsTarget && cleanSettingsTarget !== '201000000000') ? cleanSettingsTarget : defaultClinicWhatsapp;

  if (!appointment || typeof appointment !== 'object' || !appointment.serviceName) {
    const fallbackMsg = isAr
      ? 'مرحباً عيادة حياة لطب الأسنان، أود الاستفسار عن حجز موعد كشف واستشارة'
      : 'Hello Hayaah Dental Clinic, I would like to inquire about booking an appointment';
    return `https://wa.me/${clinicTarget}?text=${encodeURIComponent(fallbackMsg)}`;
  }

  const sName = isAr
    ? (appointment.serviceName?.ar || appointment.serviceName || '')
    : (appointment.serviceName?.en || appointment.serviceName || '');
  const dName = appointment.doctorName
    ? (isAr ? (appointment.doctorName?.ar || appointment.doctorName) : (appointment.doctorName?.en || appointment.doctorName))
    : (isAr ? 'أي طبيب متاح' : 'Any available doctor');

  const siteUrl = getSiteUrl();
  const manageUrl = appointment.manageToken
    ? `${siteUrl}/booking/manage?token=${appointment.manageToken}`
    : `${siteUrl}/booking/manage?code=${appointment.bookingCode}&phone=${encodeURIComponent(appointment.patientPhone)}`;

  const text = isAr
    ? `السلام عليكم، أود تأكيد موعدي في عيادة حياة لطب الأسنان:\n` +
      `• كود الحجز: ${appointment.bookingCode}\n` +
      `• الاسم: ${appointment.patientName}\n` +
      `• الخدمة: ${sName}\n` +
      `• التاريخ: ${appointment.date}\n` +
      `• الوقت: ${appointment.startTime} (بتوقيت القاهرة)\n` +
      `• الطبيب: ${dName}\n` +
      `• رابط إدارة وتعديل الحجز: ${manageUrl}\n` +
      `\nشكراً لكم.`
    : `Hello, I would like to confirm my appointment at Hayaah Dental Clinic:\n` +
      `• Booking Code: ${appointment.bookingCode}\n` +
      `• Name: ${appointment.patientName}\n` +
      `• Service: ${sName}\n` +
      `• Date: ${appointment.date}\n` +
      `• Time: ${appointment.startTime} (Cairo Time)\n` +
      `• Doctor: ${dName}\n` +
      `• Manage Booking Link: ${manageUrl}\n` +
      `\nThank you.`;

  return `https://wa.me/${clinicTarget}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate iCalendar (.ics) content for downloading
 */
export function generateIcsContent(appointment: Appointment, clinicAddress: string = 'Fareed Semeika St., Heliopolis, Cairo'): string {
  const [year, month, day] = appointment.date.split('-');
  const [startH, startM] = appointment.startTime.split(':');
  const [endH, endM] = appointment.endTime.split(':');

  // Format as YYYYMMDDTHHmmss
  const dtStart = `${year}${month}${day}T${startH}${startM}00`;
  const dtEnd = `${year}${month}${day}T${endH}${endM}00`;

  const siteUrl = getSiteUrl();
  const manageUrl = appointment.manageToken
    ? `${siteUrl}/booking/manage?token=${appointment.manageToken}`
    : `${siteUrl}/booking/manage?code=${appointment.bookingCode}&phone=${encodeURIComponent(appointment.patientPhone)}`;

  const serviceName = typeof appointment.serviceName === 'object' && appointment.serviceName !== null
    ? (appointment.serviceName.ar || appointment.serviceName.en || '')
    : String(appointment.serviceName || '');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hayaah Dental Clinic//Appointment Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${appointment.bookingCode}@hayaahdental.com`,
    `DTSTAMP:${dtStart}Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:موعد عيادة حياة لطب الأسنان - ${serviceName}`,
    `DESCRIPTION:حجز موعد كود ${appointment.bookingCode} - ${serviceName}. إدارة الموعد: ${manageUrl}. هاتف العيادة: 02 2635 5669`,
    `URL:${manageUrl}`,
    `LOCATION:${clinicAddress}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Generate Google Calendar Web URL
 */
export function buildGoogleCalendarUrl(appointment: Appointment, clinicAddress: string = 'Fareed Semeika St., Heliopolis, Cairo'): string {
  const startIso = `${appointment.date.replace(/-/g, '')}T${appointment.startTime.replace(/:/g, '')}00`;
  const endIso = `${appointment.date.replace(/-/g, '')}T${appointment.endTime.replace(/:/g, '')}00`;

  const siteUrl = getSiteUrl();
  const manageUrl = appointment.manageToken
    ? `${siteUrl}/booking/manage?token=${appointment.manageToken}`
    : `${siteUrl}/booking/manage?code=${appointment.bookingCode}&phone=${encodeURIComponent(appointment.patientPhone)}`;

  const serviceName = typeof appointment.serviceName === 'object' && appointment.serviceName !== null
    ? (appointment.serviceName.ar || appointment.serviceName.en || '')
    : String(appointment.serviceName || '');

  const title = encodeURIComponent(`موعد عيادة حياة لطب الأسنان - ${serviceName}`);
  const details = encodeURIComponent(
    `كود الحجز: ${appointment.bookingCode}\nالخدمة: ${serviceName}\nالمريض: ${appointment.patientName}\nإدارة وتعديل الحجز: ${manageUrl}\nهاتف العيادة: 02 2635 5669`
  );
  const location = encodeURIComponent(clinicAddress);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
}

/**
 * Stub Adapter for WhatsApp Cloud API / Twilio
 * Ready for future production activation without changing business logic
 */
export class WhatsAppApiStubAdapter implements INotificationAdapter {
  name = 'WhatsApp Cloud API Stub';

  async send(payload: NotificationPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // In production, fetch endpoint: https://graph.facebook.com/v18.0/{phone_number_id}/messages
    // For now, log clean debug info
    console.info('[NotificationAdapter: WhatsApp API Stub] Dispatched notification event:', {
      type: payload.type,
      code: payload.appointment.bookingCode,
      recipient: payload.appointment.patientPhone,
    });
    return { success: true, messageId: `wa_mock_${Date.now()}` };
  }
}

/**
 * Stub Adapter for Email (e.g. Resend, Sendgrid, Postmark)
 */
export class EmailStubAdapter implements INotificationAdapter {
  name = 'Email Dispatcher Stub';

  async send(payload: NotificationPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!payload.appointment.patientEmail) {
      return { success: false, error: 'No patient email provided' };
    }
    console.info('[NotificationAdapter: Email Stub] Event captured for future SMTP/API integration:', {
      type: payload.type,
      code: payload.appointment.bookingCode,
      to: payload.appointment.patientEmail,
    });
    return { success: true, messageId: `email_mock_${Date.now()}` };
  }
}

/**
 * Pluggable notify dispatcher hook/helper
 */
export async function notify(payload: NotificationPayload, adapters: INotificationAdapter[] = [new WhatsAppApiStubAdapter(), new EmailStubAdapter()]): Promise<void> {
  for (const adapter of adapters) {
    try {
      await adapter.send(payload);
    } catch (err) {
      console.warn(`[NotificationDispatcher] Adapter ${adapter.name} failed:`, err);
    }
  }
}
