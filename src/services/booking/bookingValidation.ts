/**
 * Hayaah Dental Clinic - Booking Validation with Zod
 * Enforces strict client & service layer validation for appointments,
 * Egyptian phone numbers, privacy consent, and reasonable character lengths.
 */

import { z } from 'zod';
import { validateAndNormalizeEgyptianPhone } from './slotEngine';

export const bookingFormSchema = z.object({
  patientName: z
    .string({
      required_error: 'يرجى إدخال اسم المريض بالكامل / Patient full name is required',
    })
    .trim()
    .min(2, {
      message: 'يجب ألا يقل الاسم عن حرفين / Full name must be at least 2 characters',
    })
    .max(80, {
      message: 'يجب ألا يتجاوز الاسم 80 حرفاً / Full name cannot exceed 80 characters',
    }),

  patientPhone: z
    .string({
      required_error: 'رقم الهاتف مطلوب / Phone number is required',
    })
    .trim()
    .refine(
      (val) => validateAndNormalizeEgyptianPhone(val).isValid,
      {
        message:
          'يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678 أو 0226355669) / Please enter a valid Egyptian phone number (e.g. 01012345678)',
      }
    ),

  patientEmail: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      {
        message: 'صيغة البريد الإلكتروني غير صحيحة / Invalid email address format',
      }
    ),

  patientType: z
    .enum(['new', 'returning'], {
      invalid_type_error: 'نوع المريض غير صحيح / Invalid patient type',
    })
    .default('new'),

  serviceId: z
    .string({
      required_error: 'يرجى اختيار الخدمة المطلوبة / Please select a service',
    })
    .min(1, {
      message: 'يرجى اختيار الخدمة المطلوبة / Please select a service',
    }),

  doctorId: z.string().optional().default('any'),

  date: z
    .string({
      required_error: 'يرجى تحديد تاريخ الموعد / Please select an appointment date',
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'صيغة التاريخ غير صحيحة (YYYY-MM-DD) / Invalid date format (YYYY-MM-DD)',
    }),

  startTime: z
    .string({
      required_error: 'يرجى تحديد وقت الموعد / Please select an appointment time',
    })
    .regex(/^\d{2}:\d{2}$/, {
      message: 'صيغة الوقت غير صحيحة (HH:mm) / Invalid time format (HH:mm)',
    }),

  consentGiven: z.literal(true, {
    errorMap: () => ({
      message:
        'يجب الموافقة على سياسة الخصوصية للمتابعة / You must accept the privacy policy to proceed',
    }),
  }),

  notes: z
    .string()
    .max(1000, {
      message: 'الملاحظات يجب ألا تتجاوز 1000 حرف / Notes must not exceed 1000 characters',
    })
    .optional(),

  honeypot: z.string().optional(),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

/**
 * Validates booking data and returns localized error map
 */
export function validateBookingForm(
  data: unknown,
  isAr = true
): {
  isValid: boolean;
  errors: Record<string, string>;
  data?: BookingFormValues;
} {
  const result = bookingFormSchema.safeParse(data);

  if (result.success) {
    return {
      isValid: true,
      errors: {},
      data: result.data,
    };
  }

  const errors: Record<string, string> = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0] ? String(issue.path[0]) : '_root';
    if (!errors[field]) {
      const msg = issue.message;
      if (msg.includes(' / ')) {
        const [arMsg, enMsg] = msg.split(' / ');
        errors[field] = isAr ? arMsg.trim() : enMsg.trim();
      } else {
        errors[field] = msg;
      }
    }
  }

  return {
    isValid: false,
    errors,
  };
}
