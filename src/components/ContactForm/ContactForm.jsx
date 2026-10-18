import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../i18n/LanguageContext';
import { CLINIC_DATA } from '../../data/clinic';
import { SERVICES } from '../../data/services';
import { FiCalendar, FiClock, FiUser, FiPhone, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import confetti from 'canvas-confetti';
import './ContactForm.scss';

/**
 * Backend-ready booking function
 * Easily replaced with an API call (e.g. fetch('/api/appointments', ...))
 */
export async function submitBooking(bookingData) {
  // Simulating small network latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  // In production, this can POST to a backend or CRM:
  // const res = await fetch('/api/bookings', { method: 'POST', body: JSON.stringify(bookingData) });

  return {
    success: true,
    bookingId: 'HY-' + Math.floor(100000 + Math.random() * 900000),
    data: bookingData,
  };
}

const ContactForm = ({ defaultService = '', className = '' }) => {
  const { t, language } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: defaultService,
    date: '',
    time: '12:00',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fridayNotice, setFridayNotice] = useState(false);

  // Validate Egyptian phone number (e.g. 010..., 011..., 012..., 015..., or landline 02...)
  const validateEgyptianPhone = (phone) => {
    const cleaned = phone.replace(/[\s-]/g, '');
    const mobileRegex = /^01[0125][0-9]{8}$/;
    const landlineRegex = /^02[0-9]{8}$/;
    const intlRegex = /^\+20[0-9]{9,10}$/;
    return mobileRegex.test(cleaned) || landlineRegex.test(cleaned) || intlRegex.test(cleaned);
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setFormData((prev) => ({ ...prev, date: selectedDate }));

    if (selectedDate) {
      const d = new Date(selectedDate);
      // getDay() = 5 is Friday
      if (d.getDay() === 5) {
        setFridayNotice(true);
      } else {
        setFridayNotice(false);
      }
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = t('appointment.validation.nameRequired');
    }
    if (!formData.phone.trim() || !validateEgyptianPhone(formData.phone)) {
      errs.phone = t('appointment.validation.phoneRequired');
    }
    if (!formData.service) {
      errs.service = t('appointment.validation.serviceRequired');
    }
    if (!formData.date) {
      errs.date = t('appointment.validation.dateRequired');
    } else {
      const d = new Date(formData.date);
      if (d.getDay() === 5) {
        errs.date = t('appointment.validation.fridayWarning');
      }
    }
    if (!formData.time) {
      errs.time = t('appointment.validation.timeRequired');
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const result = await submitBooking(formData);

      if (result.success) {
        setIsSubmitted(true);
        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.7 },
            colors: ['#583FBC', '#2BB3B1', '#10B981'],
          });
        } catch (e) {
          // ignore if canvas-confetti has restrictions
        }

        // Construct formatted WhatsApp message
        const serviceObj = SERVICES.find((s) => s.id === formData.service);
        const serviceName = serviceObj
          ? (language === 'ar' ? serviceObj.title.ar : serviceObj.title.en)
          : formData.service;

        const whatsappMessage = language === 'ar'
          ? `السلام عليكم، أود تأكيد حجز موعد كشف في عيادة حياة لطب الأسنان:\n` +
            `• الاسم: ${formData.name}\n` +
            `• الهاتف: ${formData.phone}\n` +
            `• الخدمة: ${serviceName}\n` +
            `• التاريخ المطلوب: ${formData.date}\n` +
            `• الوقت المفضل: ${formData.time}\n` +
            (formData.notes ? `• تفاصيل الشكوى: ${formData.notes}\n` : '') +
            `\nشكراً جزيلاً.`
          : `Hello, I would like to confirm an appointment booking at Hayaah Dental Clinic:\n` +
            `• Name: ${formData.name}\n` +
            `• Phone: ${formData.phone}\n` +
            `• Service: ${serviceName}\n` +
            `• Preferred Date: ${formData.date}\n` +
            `• Preferred Time: ${formData.time}\n` +
            (formData.notes ? `• Notes: ${formData.notes}\n` : '') +
            `\nThank you.`;

        // Redirect after short delay so patient sees the success state
        setTimeout(() => {
          window.open(CLINIC_DATA.whatsapp.getChatUrl(whatsappMessage), '_blank');
        }, 1200);
      }
    } catch (err) {
      console.error('Booking failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`hayaah-booking-card ${className}`}>
      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            key="success"
            className="booking-success-box text-center p-4 p-md-5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="success-icon-bubble mb-3">
              <FiCheck />
            </div>
            <h3 className="success-title">{t('appointment.successTitle')}</h3>
            <p className="success-desc mb-4">{t('appointment.successDesc')}</p>

            <div className="d-flex justify-content-center gap-3">
              <button
                type="button"
                className="btn-reset-form"
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({ name: '', phone: '', service: '', date: '', time: '12:00', notes: '' });
                }}
              >
                {language === 'ar' ? 'حجز موعد آخر' : 'Book Another Slot'}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="booking-form-inner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="row g-3">
              {/* Full Name */}
              <div className="col-md-6">
                <div className={`form-field-group ${errors.name ? 'has-error' : ''}`}>
                  <label htmlFor="booking-name" className="field-label">
                    <FiUser /> {t('appointment.formName')} *
                  </label>
                  <input
                    id="booking-name"
                    type="text"
                    className="form-control-custom"
                    placeholder={t('appointment.formNamePlaceholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {errors.name && <span className="error-hint">{errors.name}</span>}
                </div>
              </div>

              {/* Mobile Phone */}
              <div className="col-md-6">
                <div className={`form-field-group ${errors.phone ? 'has-error' : ''}`}>
                  <label htmlFor="booking-phone" className="field-label">
                    <FiPhone /> {t('appointment.formPhone')} *
                  </label>
                  <input
                    id="booking-phone"
                    type="tel"
                    dir="ltr"
                    className="form-control-custom"
                    placeholder={t('appointment.formPhonePlaceholder')}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  {errors.phone && <span className="error-hint">{errors.phone}</span>}
                </div>
              </div>

              {/* Service Select */}
              <div className="col-12">
                <div className={`form-field-group ${errors.service ? 'has-error' : ''}`}>
                  <label htmlFor="booking-service" className="field-label">
                    {t('appointment.formService')} *
                  </label>
                  <select
                    id="booking-service"
                    className="form-control-custom form-select-custom"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  >
                    <option value="">{t('appointment.formServiceSelect')}</option>
                    {SERVICES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {language === 'ar' ? s.title.ar : s.title.en}
                      </option>
                    ))}
                  </select>
                  {errors.service && <span className="error-hint">{errors.service}</span>}
                </div>
              </div>

              {/* Date */}
              <div className="col-md-6">
                <div className={`form-field-group ${errors.date || fridayNotice ? 'has-error' : ''}`}>
                  <label htmlFor="booking-date" className="field-label">
                    <FiCalendar /> {t('appointment.formDate')} *
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    className="form-control-custom"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={handleDateChange}
                  />
                  {fridayNotice && (
                    <span className="friday-warning-badge d-flex align-items-center gap-1 mt-1">
                      <FiAlertCircle />
                      {t('appointment.validation.fridayWarning')}
                    </span>
                  )}
                  {errors.date && !fridayNotice && <span className="error-hint">{errors.date}</span>}
                </div>
              </div>

              {/* Time Slot (10:00 to 22:00) */}
              <div className="col-md-6">
                <div className={`form-field-group ${errors.time ? 'has-error' : ''}`}>
                  <label htmlFor="booking-time" className="field-label">
                    <FiClock /> {t('appointment.formTime')} (10:00 AM - 10:00 PM) *
                  </label>
                  <select
                    id="booking-time"
                    className="form-control-custom form-select-custom"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  >
                    <option value="10:00">10:00 AM / صباحاً</option>
                    <option value="11:00">11:00 AM / صباحاً</option>
                    <option value="12:00">12:00 PM / ظهراً</option>
                    <option value="13:00">01:00 PM / ظهراً</option>
                    <option value="14:00">02:00 PM / عصراً</option>
                    <option value="15:00">03:00 PM / عصراً</option>
                    <option value="16:00">04:00 PM / مساءً</option>
                    <option value="17:00">05:00 PM / مساءً</option>
                    <option value="18:00">06:00 PM / مساءً</option>
                    <option value="19:00">07:00 PM / مساءً</option>
                    <option value="20:00">08:00 PM / مساءً</option>
                    <option value="21:00">09:00 PM / مساءً</option>
                  </select>
                  {errors.time && <span className="error-hint">{errors.time}</span>}
                </div>
              </div>

              {/* Notes */}
              <div className="col-12">
                <div className="form-field-group">
                  <label htmlFor="booking-notes" className="field-label">
                    {t('appointment.formNotes')}
                  </label>
                  <textarea
                    id="booking-notes"
                    rows="3"
                    className="form-control-custom"
                    placeholder={t('appointment.formNotesPlaceholder')}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  ></textarea>
                </div>
              </div>

              {/* Submit CTA Button */}
              <div className="col-12 mt-4">
                <button
                  type="submit"
                  className="btn-submit-booking w-100"
                  disabled={isSubmitting}
                >
                  <FaWhatsapp className="whatsapp-icon-btn" />
                  <span>
                    {isSubmitting ? t('appointment.submitting') : t('appointment.submitButton')}
                  </span>
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactForm;
