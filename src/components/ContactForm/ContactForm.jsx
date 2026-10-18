import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation, useLanguage } from '../../i18n/LanguageContext';
import { useData } from '../../context/DataContext';
import { getStorageService } from '../../services/storage';
import { FiCalendar, FiClock, FiUser, FiPhone, FiCheck, FiAlertCircle, FiShield } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import './ContactForm.scss';

const ContactForm = ({ defaultService = '', className = '' }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { services, clinicInfo } = useData();

  const isAr = language === 'ar';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: defaultService,
    date: '',
    time: '12:00',
    notes: '',
    consent: false,
    honeypot: '', // Honeypot anti-spam
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
      errs.name = isAr ? 'يرجى إدخال الاسم بالكامل' : 'Full name is required';
    }
    if (!formData.phone.trim() || !validateEgyptianPhone(formData.phone)) {
      errs.phone = isAr ? 'يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)' : 'Please enter a valid Egyptian phone (e.g. 01012345678)';
    }
    if (!formData.service) {
      errs.service = isAr ? 'يرجى اختيار الخدمة المطلوبة' : 'Please select a service';
    }
    if (!formData.date) {
      errs.date = isAr ? 'يرجى اختيار التاريخ المفضل' : 'Please select a date';
    } else {
      const d = new Date(formData.date);
      if (d.getDay() === 5) {
        errs.date = isAr ? 'العيادة مغلقة أيام الجمعة' : 'The clinic is closed on Fridays';
      }
    }
    if (!formData.time) {
      errs.time = isAr ? 'يرجى تحديد الوقت المفضل' : 'Please select a time';
    }
    if (!formData.consent) {
      errs.consent = isAr ? 'يجب الموافقة على سياسة الخصوصية للمتابعة' : 'You must accept the Privacy Policy to proceed';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot anti-spam check: if honeypot is filled, silently discard spam
    if (formData.honeypot) {
      console.warn('Bot submission blocked via honeypot');
      setIsSubmitted(true);
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const serviceObj = services.find((s) => s.id === formData.service);
      const serviceName = serviceObj
        ? (isAr ? serviceObj.title.ar : serviceObj.title.en)
        : formData.service;

      // Save to unified storage (IndexedDB / localStorage in demo, Supabase in live mode)
      const storage = getStorageService();
      await storage.createAppointmentRequest({
        patientName: formData.name.trim(),
        patientPhone: formData.phone.trim(),
        preferredDate: formData.date,
        preferredTime: formData.time,
        serviceId: formData.service,
        serviceName,
        notes: formData.notes.trim() || undefined,
      });

      setIsSubmitted(true);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#0c6674', '#2ca49a', '#10B981'],
        });
      } catch (err) {
        // ignore if canvas-confetti has restrictions
      }

      // Construct formatted WhatsApp message for quick direct follow-up
      const whatsappMsg = isAr
        ? `السلام عليكم، أود تأكيد طلب موعد في عيادة حياة لطب الأسنان:\n` +
          `• الاسم: ${formData.name}\n` +
          `• الهاتف: ${formData.phone}\n` +
          `• الخدمة: ${serviceName}\n` +
          `• اليوم المفضل: ${formData.date}\n` +
          `• الوقت المفضل: ${formData.time}\n` +
          `\n(تم إرسال الطلب عبر الموقع - هذا طلب وليس حجزاً مؤكداً)`
        : `Hello, I submitted an appointment request for Hayaah Dental Clinic:\n` +
          `• Name: ${formData.name}\n` +
          `• Phone: ${formData.phone}\n` +
          `• Service: ${serviceName}\n` +
          `• Date: ${formData.date}\n` +
          `• Time: ${formData.time}\n` +
          `\n(Sent via website - inquiry pending confirmation)`;

      const whatsappTarget = clinicInfo?.whatsapp?.replace(/[^0-9]/g, '') || '20226355669';
      const whatsappUrl = `https://wa.me/${whatsappTarget}?text=${encodeURIComponent(whatsappMsg)}`;

      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1500);
    } catch (err) {
      console.error('Appointment request failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`hayaah-booking-card ${className}`}>
      {/* Demo Mode Notice Banner on Form */}
      <div className="demo-form-badge mb-3 p-2 px-3 rounded-3 d-flex align-items-center gap-2" style={{ backgroundColor: '#fff3cd', color: '#856404', fontSize: '0.8rem', border: '1px solid #ffeeba' }}>
        <FiShield className="flex-shrink-0" />
        <span>
          {isAr
            ? 'نموذج تجريبي آمن — هذا طلب وليس حجزاً مؤكداً (تُحفظ الطلبات محلياً في لوحة الإدارة للعيادة)'
            : 'Secure demo request form — inquiry only, not confirmed booking (stored locally in admin inbox)'}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            key="success"
            className="booking-success-box text-center p-4 p-md-5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="success-icon-bubble mb-3 mx-auto">
              <FiCheck />
            </div>
            <h3 className="success-title">
              {isAr ? 'تم استلام طلبك بنجاح' : 'Request Received Successfully'}
            </h3>
            <p className="success-desc mb-3">
              {isAr
                ? 'شكراً لتواصلك. سيقوم فريق الاستقبال بمراجعة الموعد والتواصل معك هاتفياً أو عبر واتساب لتأكيد الحجز النهائي.'
                : 'Thank you. Our reception team will review dentist schedules and contact you to confirm the appointment.'}
            </p>
            <div className="alert alert-light border small text-muted mb-4 text-center">
              {isAr
                ? 'تنبيه: هذا طلب مبدئي وليس حجزاً نهائياً. لا يتم تأكيد الحجز إلا بعد اتصال موظف الاستقبال.'
                : 'Note: This is an initial request. Booking is finalized once confirmed by our staff.'}
            </div>

            <div className="d-flex justify-content-center gap-3">
              <button
                type="button"
                className="btn-reset-form"
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    name: '',
                    phone: '',
                    service: '',
                    date: '',
                    time: '12:00',
                    notes: '',
                    consent: false,
                    honeypot: '',
                  });
                }}
              >
                {isAr ? 'طلب موعد آخر' : 'Submit Another Request'}
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
            noValidate
          >
            {/* Honeypot Anti-Spam Hidden Input */}
            <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
              <label htmlFor="website_check">Leave this field blank</label>
              <input
                id="website_check"
                type="text"
                name="website_check"
                tabIndex={-1}
                autoComplete="off"
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
              />
            </div>

            <div className="row g-3">
              {/* Full Name */}
              <div className="col-md-6">
                <div className={`form-field-group ${errors.name ? 'has-error' : ''}`}>
                  <label htmlFor="booking-name" className="field-label">
                    <FiUser /> {isAr ? 'الاسم بالكامل' : 'Full Name'} *
                  </label>
                  <input
                    id="booking-name"
                    type="text"
                    className="form-control-custom"
                    placeholder={isAr ? 'مثال: أحمد محمود' : 'e.g. Ahmed Mahmoud'}
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
                    <FiPhone /> {isAr ? 'رقم الهاتف المحمول' : 'Mobile Phone'} *
                  </label>
                  <input
                    id="booking-phone"
                    type="tel"
                    dir="ltr"
                    className="form-control-custom"
                    placeholder={isAr ? '010XXXXXXXX أو 02XXXXXXXX' : '010XXXXXXXX or 02XXXXXXXX'}
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
                    {isAr ? 'الخدمة المطلوبة' : 'Requested Service'} *
                  </label>
                  <select
                    id="booking-service"
                    className="form-control-custom form-select-custom"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  >
                    <option value="">{isAr ? '-- اختر الخدمة المطلوبة --' : '-- Select Service --'}</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {isAr ? s.title.ar : s.title.en}
                      </option>
                    ))}
                  </select>
                  {errors.service && <span className="error-hint">{errors.service}</span>}
                </div>
              </div>

              {/* Preferred Date */}
              <div className="col-md-6">
                <div className={`form-field-group ${errors.date || fridayNotice ? 'has-error' : ''}`}>
                  <label htmlFor="booking-date" className="field-label">
                    <FiCalendar /> {isAr ? 'اليوم المفضل' : 'Preferred Date'} *
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
                      {isAr ? 'العيادة مغلقة يوم الجمعة - يرجى اختيار يوم آخر' : 'Clinic is closed on Friday - please choose another day'}
                    </span>
                  )}
                  {errors.date && !fridayNotice && <span className="error-hint">{errors.date}</span>}
                </div>
              </div>

              {/* Preferred Time Slot */}
              <div className="col-md-6">
                <div className={`form-field-group ${errors.time ? 'has-error' : ''}`}>
                  <label htmlFor="booking-time" className="field-label">
                    <FiClock /> {isAr ? 'الوقت المفضل (10 ص - 10 م)' : 'Preferred Time (10 AM - 10 PM)'} *
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

              {/* Optional Note with Explicit Medical Privacy Hint per Rule 16 */}
              <div className="col-12">
                <div className="form-field-group">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label htmlFor="booking-notes" className="field-label mb-0">
                      {isAr ? 'ملاحظة أو استفسار عام (اختياري)' : 'General Note or Inquiry (Optional)'}
                    </label>
                  </div>
                  <div className="small text-danger fw-semibold mb-1" style={{ fontSize: '0.78rem' }}>
                    {isAr
                      ? '⚠️ تنبيه خصوصية: من فضلك لا تكتب أي تفاصيل طبية سريرية هنا.'
                      : '⚠️ Privacy Notice: Please do not write medical details here.'}
                  </div>
                  <textarea
                    id="booking-notes"
                    rows="2"
                    className="form-control-custom"
                    placeholder={isAr ? 'ملاحظة تنظيمية بخصوص الموعد (تجنب التفاصيل الطبية)...' : 'Administrative scheduling note (avoid medical details)...'}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  ></textarea>
                </div>
              </div>

              {/* Consent Checkbox per Rule 17 */}
              <div className="col-12">
                <div className={`form-check ${errors.consent ? 'text-danger' : ''}`}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="privacyConsentCheck"
                    checked={formData.consent}
                    onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  />
                  <label className="form-check-label small" htmlFor="privacyConsentCheck" style={{ lineHeight: '1.5' }}>
                    {isAr ? (
                      <>
                        أوافق على <Link to="/privacy" className="text-decoration-underline text-primary" target="_blank">سياسة الخصوصية وحماية البيانات</Link> وأعلم أن هذا طلب حجز أولي وليس موعداً مؤكداً.
                      </>
                    ) : (
                      <>
                        I accept the <Link to="/privacy" className="text-decoration-underline text-primary" target="_blank">Privacy Policy</Link> and acknowledge this is an inquiry, not a confirmed appointment.
                      </>
                    )}
                  </label>
                  {errors.consent && <div className="error-hint mt-1">{errors.consent}</div>}
                </div>
              </div>

              {/* Submit CTA Button */}
              <div className="col-12 mt-3">
                <button
                  type="submit"
                  className="btn-submit-booking w-100 d-flex align-items-center justify-content-center gap-2"
                  disabled={isSubmitting}
                >
                  <FaWhatsapp className="whatsapp-icon-btn" />
                  <span>
                    {isSubmitting
                      ? (isAr ? 'جاري إرسال الطلب...' : 'Submitting Request...')
                      : (isAr ? 'إرسال طلب الموعد والمتابعة عبر واتساب' : 'Submit Request & Follow up on WhatsApp')}
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
