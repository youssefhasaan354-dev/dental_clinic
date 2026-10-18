import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation, useLanguage } from '../../i18n/LanguageContext';
import { useData } from '../../context/DataContext';
import { SERVICES } from '../../data/services';
import { CLINIC_DATA } from '../../data/clinic';
import {
  getBookingService,
  validateAndNormalizeEgyptianPhone,
  buildClinicWhatsAppUrl,
  generateIcsContent,
  buildGoogleCalendarUrl,
  formatCairoDate,
  getCairoNow,
} from '../../services/booking';
import { CustomCalendar } from './CustomCalendar';
import { TimeSlotPicker } from './TimeSlotPicker';
import confetti from 'canvas-confetti';
import {
  FiCheck,
  FiArrowRight,
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiDownload,
  FiShare2,
  FiCopy,
  FiPrinter,
  FiAlertCircle,
  FiShield,
  FiCheckCircle,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import './BookingWizard.scss';

export const BookingWizard = ({ defaultService = '', className = '' }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { clinicInfo } = useData();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isAr = language === 'ar';
  const bookingService = useMemo(() => getBookingService(), []);

  // Check URL query parameter for preselected service
  const preselectedService = searchParams.get('service') || defaultService || '';

  // Step state (1: Service, 2: Doctor, 3: Date & Time, 4: Details, 5: Review, 6: Success)
  const [step, setStep] = useState(1);

  // Doctors list
  const [doctors, setDoctors] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState(preselectedService || 'scaling-polishing');
  const [selectedDoctorId, setSelectedDoctorId] = useState('any'); // 'any' or specific ID
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to tomorrow or next non-Friday
    const d = getCairoNow();
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 5) d.setDate(d.getDate() + 1); // skip Friday
    return formatCairoDate(d);
  });
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Patient inputs
  const [patientData, setPatientData] = useState({
    name: '',
    phone: '',
    email: '',
    patientType: 'new',
    notes: '',
    consent: false,
    honeypot: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Load doctors
  useEffect(() => {
    async function loadDocs() {
      try {
        const docList = await bookingService.getDoctors();
        setDoctors(docList);
      } catch (err) {
        console.warn('Failed to load doctors:', err);
      } finally {
        setIsLoadingDoctors(false);
      }
    }
    loadDocs();
  }, [bookingService]);

  // Load availability when date, service, or doctor changes
  useEffect(() => {
    if (!selectedDate) return;

    let isMounted = true;
    setIsLoadingSlots(true);

    bookingService
      .getAvailability(selectedDate, selectedServiceId, selectedDoctorId)
      .then((availability) => {
        if (!isMounted) return;
        setAvailableSlots(availability.slots || []);
        // Reset selected time if it's no longer available in this day
        if (selectedTime) {
          const match = availability.slots.find((s) => s.time === selectedTime && s.isAvailable);
          if (!match) setSelectedTime('');
        }
      })
      .catch((err) => {
        console.error('Failed to get slot availability:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate, selectedServiceId, selectedDoctorId, bookingService]);

  // All services list + General Checkup card
  const allServices = useMemo(() => {
    const list = [...SERVICES];
    const hasGeneral = list.some((s) => s.id === 'general-checkup');
    if (!hasGeneral) {
      list.unshift({
        id: 'general-checkup',
        slug: 'general-checkup',
        title: {
          ar: 'كشف عام واستشارة طبية شاملة',
          en: 'General Dental Checkup & Consultation',
        },
        shortDesc: {
          ar: 'فحص شامل لصحة الأسنان واللثة وتشخيص دقيق مع وضع خطة علاجية مخصصة.',
          en: 'Comprehensive oral examination, gum health check, and customized treatment plan.',
        },
        duration: { ar: '٣٠ دقيقة', en: '30 mins' },
      });
    }
    return list;
  }, []);

  const activeServiceObj = useMemo(() => {
    return allServices.find((s) => s.id === selectedServiceId) || allServices[0];
  }, [allServices, selectedServiceId]);

  const activeDoctorObj = useMemo(() => {
    if (selectedDoctorId === 'any') return null;
    return doctors.find((d) => d.doctorId === selectedDoctorId);
  }, [doctors, selectedDoctorId]);

  // Validation for Step 4
  const validatePatientDetails = () => {
    const errs = {};
    if (!patientData.name.trim()) {
      errs.name = isAr ? 'يرجى إدخال اسم المريض بالكامل' : 'Patient full name is required';
    }
    const phoneCheck = validateAndNormalizeEgyptianPhone(patientData.phone);
    if (!patientData.phone.trim() || !phoneCheck.isValid) {
      errs.phone = isAr
        ? 'يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)'
        : 'Please enter a valid Egyptian phone number (e.g. 01012345678)';
    }
    if (patientData.email.trim() && !/^\S+@\S+\.\S+$/.test(patientData.email)) {
      errs.email = isAr ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email format';
    }
    if (!patientData.consent) {
      errs.consent = isAr
        ? 'يجب الموافقة على سياسة الخصوصية للمتابعة'
        : 'You must agree to the privacy policy to proceed';
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit appointment
  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const res = await bookingService.createAppointment({
        serviceId: selectedServiceId,
        doctorId: selectedDoctorId,
        date: selectedDate,
        startTime: selectedTime,
        patientName: patientData.name.trim(),
        patientPhone: patientData.phone.trim(),
        patientEmail: patientData.email.trim() || undefined,
        patientType: patientData.patientType,
        notes: patientData.notes.trim() || undefined,
        consentGiven: patientData.consent,
        honeypot: patientData.honeypot,
      });

      if (!res.success) {
        setSubmissionError(res.error || (isAr ? 'تعذر إتمام الحجز، يرجى المحاولة لاحقاً' : 'Booking failed'));
        setIsSubmitting(false);
        return;
      }

      setConfirmedAppointment(res.appointment);
      setStep(6); // Success step

      // Trigger Confetti
      try {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#0c6674', '#2ca49a', '#10B981'],
        });
      } catch (e) {
        // Safe confetti fallback
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      setSubmissionError(isAr ? 'حدث خطأ أثناء معالجة الحجز' : 'An error occurred while booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download ICS File
  const handleDownloadIcs = () => {
    if (!confirmedAppointment) return;
    const icsString = generateIcsContent(confirmedAppointment, CLINIC_DATA.address.ar);
    const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Hayaah-${confirmedAppointment.bookingCode}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy booking code to clipboard
  const handleCopyCode = () => {
    if (!confirmedAppointment) return;
    navigator.clipboard.writeText(confirmedAppointment.bookingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Step Navigation Helpers
  const canProceedFromStep1 = Boolean(selectedServiceId);
  const canProceedFromStep3 = Boolean(selectedDate && selectedTime);

  const stepLabels = [
    { num: 1, ar: 'الخدمة', en: 'Service' },
    { num: 2, ar: 'الطبيب', en: 'Doctor' },
    { num: 3, ar: 'الموعد', en: 'Time' },
    { num: 4, ar: 'البيانات', en: 'Details' },
    { num: 5, ar: 'التأكيد', en: 'Confirm' },
  ];

  return (
    <div className={`booking-wizard-card ${className}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Demo storage status pill */}
      {bookingService.isDemo && (
        <div className="demo-mode-pill d-flex align-items-center justify-content-between p-2 px-3 mb-3 rounded-pill bg-light border">
          <div className="d-flex align-items-center gap-2">
            <FiShield className="text-primary" />
            <span className="small text-muted">
              {isAr
                ? 'وضع تجريبي تفاعلي — يعمل مباشرة وبدون تضارب في المواعيد'
                : 'Interactive demo mode — live availability & zero conflict checks'}
            </span>
          </div>
          <Link to="/booking/manage" className="manage-booking-quick-link small text-primary text-decoration-none fw-bold">
            {isAr ? 'إدارة حجز سابق' : 'Manage Booking'}
          </Link>
        </div>
      )}

      {/* Progress Tracker (Steps 1 to 5) */}
      {step <= 5 && (
        <div className="booking-progress-tracker mb-4">
          <div className="steps-container d-flex justify-content-between position-relative">
            <div
              className="progress-line-fill position-absolute"
              style={{
                [isAr ? 'right' : 'left']: '5%',
                width: `${((step - 1) / 4) * 90}%`,
              }}
            />
            {stepLabels.map((s) => {
              const isActive = step === s.num;
              const isCompleted = step > s.num;

              return (
                <div
                  key={s.num}
                  className={`step-indicator ${isActive ? 'active' : ''} ${
                    isCompleted ? 'completed' : ''
                  }`}
                  onClick={() => {
                    // Allow navigating back to completed steps
                    if (isCompleted) setStep(s.num);
                  }}
                  style={{ cursor: isCompleted ? 'pointer' : 'default' }}
                >
                  <div className="step-circle">
                    {isCompleted ? <FiCheck /> : s.num}
                  </div>
                  <span className="step-label d-none d-sm-block">
                    {isAr ? s.ar : s.en}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Animated Step Content */}
      <AnimatePresence mode="wait">
        {/* STEP 1: SERVICE SELECTION */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: isAr ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isAr ? -20 : 20 }}
            transition={{ duration: 0.25 }}
            className="step-pane"
          >
            <div className="pane-header mb-4 text-center">
              <h4 className="fw-bold mb-1">
                {isAr ? '١. اختر الخدمة أو نوع الاستشارة' : '1. Choose Service or Consultation'}
              </h4>
              <p className="text-muted small">
                {isAr
                  ? 'اختر الإجراء المطلوب لعرض أوقات الأطباء المتخصصين المتاحة'
                  : 'Select your required dental treatment to see matching doctor schedules'}
              </p>
            </div>

            <div className="services-grid mb-4">
              {allServices.map((srv) => {
                const isSelected = selectedServiceId === srv.id;
                const titleText = isAr ? srv.title.ar : srv.title.en;
                const descText = isAr ? srv.shortDesc.ar : srv.shortDesc.en;
                const durText = isAr
                  ? srv.duration?.ar || '٣٠ دقيقة'
                  : srv.duration?.en || '30 mins';

                return (
                  <div
                    key={srv.id}
                    className={`service-select-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedServiceId(srv.id)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedServiceId(srv.id);
                      }
                    }}
                  >
                    <div className="card-top d-flex align-items-center justify-content-between mb-2">
                      <h6 className="service-title fw-bold m-0">{titleText}</h6>
                      <span className="duration-tag small text-muted d-flex align-items-center gap-1">
                        <FiClock className="small" />
                        <span>{durText}</span>
                      </span>
                    </div>
                    <p className="service-desc text-muted small mb-0">{descText}</p>
                    {isSelected && (
                      <div className="selected-badge">
                        <FiCheckCircle />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="step-actions d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2 rounded-pill"
                disabled={!canProceedFromStep1}
                onClick={() => setStep(2)}
              >
                <span>{isAr ? 'متابعة لاختيار الطبيب' : 'Next: Choose Doctor'}</span>
                {isAr ? <FiArrowLeft /> : <FiArrowRight />}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: DOCTOR SELECTION */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: isAr ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isAr ? -20 : 20 }}
            transition={{ duration: 0.25 }}
            className="step-pane"
          >
            <div className="pane-header mb-4 text-center">
              <h4 className="fw-bold mb-1">
                {isAr ? '٢. تحديد الطبيب المختص (اختياري)' : '2. Select Doctor (Optional)'}
              </h4>
              <p className="text-muted small">
                {isAr
                  ? 'يمكنك اختيار طبيب محدد، أو ترك الخيار على "أي طبيب متاح" لأفضل خيارات وقت'
                  : 'Choose a specific doctor or leave as "Any available doctor" for best slot availability'}
              </p>
            </div>

            <div className="doctors-grid mb-4">
              {/* Option: Any Available Doctor */}
              <div
                className={`doctor-select-card ${selectedDoctorId === 'any' ? 'selected' : ''}`}
                onClick={() => setSelectedDoctorId('any')}
                role="button"
                tabIndex={0}
              >
                <div className="doctor-avatar-circle any-doc-avatar">
                  <FiUser />
                </div>
                <div className="doctor-info">
                  <h6 className="doc-name fw-bold mb-1">
                    {isAr ? 'أي طبيب متاح (الخيار الموصى به)' : 'Any Available Doctor (Recommended)'}
                  </h6>
                  <p className="doc-role small text-muted mb-0">
                    {isAr
                      ? 'يمنحك أكبر عدد من المواعيد المتاحة خلال اليوم المطلوب'
                      : 'Gives you the widest selection of available appointment slots'}
                  </p>
                </div>
                {selectedDoctorId === 'any' && (
                  <div className="selected-badge">
                    <FiCheckCircle />
                  </div>
                )}
              </div>

              {/* Dynamic Clinic Doctors */}
              {doctors.map((doc) => {
                const isSelected = selectedDoctorId === doc.doctorId;
                const docName = isAr ? doc.doctorName.ar : doc.doctorName.en;
                const docTitle = isAr ? doc.title.ar : doc.title.en;

                return (
                  <div
                    key={doc.doctorId}
                    className={`doctor-select-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedDoctorId(doc.doctorId)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="doctor-avatar-circle">
                      <FiUser />
                    </div>
                    <div className="doctor-info">
                      <h6 className="doc-name fw-bold mb-1">{docName}</h6>
                      <p className="doc-role small text-muted mb-0">{docTitle}</p>
                    </div>
                    {isSelected && (
                      <div className="selected-badge">
                        <FiCheckCircle />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="step-actions d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-outline-secondary px-4 py-2 d-flex align-items-center gap-2 rounded-pill"
                onClick={() => setStep(1)}
              >
                {isAr ? <FiArrowRight /> : <FiArrowLeft />}
                <span>{isAr ? 'رجوع' : 'Back'}</span>
              </button>

              <button
                type="button"
                className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2 rounded-pill"
                onClick={() => setStep(3)}
              >
                <span>{isAr ? 'متابعة لاختيار الموعد' : 'Next: Date & Time'}</span>
                {isAr ? <FiArrowLeft /> : <FiArrowRight />}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: DATE & TIME CALENDAR */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: isAr ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isAr ? -20 : 20 }}
            transition={{ duration: 0.25 }}
            className="step-pane"
          >
            <div className="pane-header mb-4 text-center">
              <h4 className="fw-bold mb-1">
                {isAr ? '٣. حدد اليوم والوقت المناسب' : '3. Select Date & Time'}
              </h4>
              <p className="text-muted small">
                {isAr
                  ? 'مواعيد العمل السبت–الخميس (١٠ ص - ١٠ م). الجمعة مغلق. بتوقيت القاهرة.'
                  : 'Saturday–Thursday (10 AM - 10 PM). Friday closed. Cairo Local Time.'}
              </p>
            </div>

            <div className="row g-4 mb-4">
              {/* Custom Calendar Column */}
              <div className="col-lg-6 col-md-12">
                <div className="calendar-box p-3 bg-light rounded-4 border">
                  <CustomCalendar
                    selectedDate={selectedDate}
                    onSelectDate={(newDate) => {
                      setSelectedDate(newDate);
                    }}
                    language={language}
                  />
                </div>
              </div>

              {/* Time Slots Column */}
              <div className="col-lg-6 col-md-12">
                <div className="slots-box p-3 bg-light rounded-4 border h-100 d-flex flex-column">
                  <TimeSlotPicker
                    slots={availableSlots}
                    selectedTime={selectedTime}
                    onSelectTime={(time) => setSelectedTime(time)}
                    isLoading={isLoadingSlots}
                    isFriday={selectedDate ? new Date(selectedDate).getDay() === 5 : false}
                    language={language}
                  />
                </div>
              </div>
            </div>

            <div className="step-actions d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-outline-secondary px-4 py-2 d-flex align-items-center gap-2 rounded-pill"
                onClick={() => setStep(2)}
              >
                {isAr ? <FiArrowRight /> : <FiArrowLeft />}
                <span>{isAr ? 'رجوع' : 'Back'}</span>
              </button>

              <button
                type="button"
                className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2 rounded-pill"
                disabled={!canProceedFromStep3}
                onClick={() => setStep(4)}
              >
                <span>{isAr ? 'متابعة لبيانات المريض' : 'Next: Patient Details'}</span>
                {isAr ? <FiArrowLeft /> : <FiArrowRight />}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: PATIENT DETAILS */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: isAr ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isAr ? -20 : 20 }}
            transition={{ duration: 0.25 }}
            className="step-pane"
          >
            <div className="pane-header mb-4 text-center">
              <h4 className="fw-bold mb-1">
                {isAr ? '٤. بيانات المريض وتأكيد الاتصال' : '4. Patient Contact Details'}
              </h4>
              <p className="text-muted small">
                {isAr
                  ? 'بياناتك الشخصية مشفرة ومحمية، وتُستخدم حصرياً لتنسيق موعدك في العيادة'
                  : 'Your information is encrypted & used solely to schedule your clinic visit'}
              </p>
            </div>

            <form
              className="patient-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (validatePatientDetails()) {
                  setStep(5);
                }
              }}
            >
              {/* Honeypot field for anti-spam */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <input
                  type="text"
                  name="honeypot"
                  tabIndex={-1}
                  autoComplete="off"
                  value={patientData.honeypot}
                  onChange={(e) => setPatientData({ ...patientData, honeypot: e.target.value })}
                />
              </div>

              {/* Patient Type: New vs Returning */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark mb-2">
                  {isAr ? 'نوع الزيارة:' : 'Patient Visit Type:'}
                </label>
                <div className="d-flex gap-3">
                  <label className="patient-type-pill flex-grow-1 p-2 border rounded-3 text-center cursor-pointer">
                    <input
                      type="radio"
                      name="patientType"
                      value="new"
                      checked={patientData.patientType === 'new'}
                      onChange={() => setPatientData({ ...patientData, patientType: 'new' })}
                      className="me-2"
                    />
                    <span className="small fw-bold">
                      {isAr ? 'مريض جديد (لأول مرة)' : 'New Patient (First Visit)'}
                    </span>
                  </label>

                  <label className="patient-type-pill flex-grow-1 p-2 border rounded-3 text-center cursor-pointer">
                    <input
                      type="radio"
                      name="patientType"
                      value="returning"
                      checked={patientData.patientType === 'returning'}
                      onChange={() => setPatientData({ ...patientData, patientType: 'returning' })}
                      className="me-2"
                    />
                    <span className="small fw-bold">
                      {isAr ? 'مريض سابق بالعيادة' : 'Returning Patient'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Full Name */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark">
                  {isAr ? 'الاسم بالكامل *' : 'Full Name *'}
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <FiUser />
                  </span>
                  <input
                    type="text"
                    className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                    placeholder={isAr ? 'مثال: أحمد محمد محمود' : 'e.g. Ahmed Mahmoud'}
                    value={patientData.name}
                    onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                  />
                </div>
                {validationErrors.name && (
                  <div className="invalid-feedback d-block">{validationErrors.name}</div>
                )}
              </div>

              {/* Mobile Phone (Egyptian Validation) */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark">
                  {isAr ? 'رقم الهاتف المحمول (مصر) *' : 'Egyptian Mobile Number *'}
                </label>
                <div className="input-group" dir="ltr">
                  <span className="input-group-text bg-light text-muted">
                    <FiPhone />
                  </span>
                  <input
                    type="tel"
                    className={`form-control ${validationErrors.phone ? 'is-invalid' : ''}`}
                    placeholder="01012345678"
                    value={patientData.phone}
                    onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
                  />
                </div>
                <small className="text-muted d-block mt-1">
                  {isAr
                    ? 'يقبل شبكات المحمول المصرية (010, 011, 012, 015) أو الخط الأرضي 02'
                    : 'Valid Egyptian mobile networks (010, 011, 012, 015) or Cairo landline 02'}
                </small>
                {validationErrors.phone && (
                  <div className="invalid-feedback d-block">{validationErrors.phone}</div>
                )}
              </div>

              {/* Email (Optional) */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark">
                  {isAr ? 'البريد الإلكتروني (اختياري)' : 'Email Address (Optional)'}
                </label>
                <div className="input-group" dir="ltr">
                  <span className="input-group-text bg-light text-muted">
                    <FiMail />
                  </span>
                  <input
                    type="email"
                    className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
                    placeholder="name@example.com"
                    value={patientData.email}
                    onChange={(e) => setPatientData({ ...patientData, email: e.target.value })}
                  />
                </div>
                {validationErrors.email && (
                  <div className="invalid-feedback d-block">{validationErrors.email}</div>
                )}
              </div>

              {/* Notes / Symptoms */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark">
                  {isAr ? 'ملاحظات أو أعراض تشعر بها (اختياري)' : 'Symptoms or Notes (Optional)'}
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder={
                    isAr
                      ? 'مثال: ألم في الضرس الخلفي، رغبة في استشارة تبييض...'
                      : 'e.g. Mild pain in molar, interested in whitening consultation...'
                  }
                  value={patientData.notes}
                  onChange={(e) => setPatientData({ ...patientData, notes: e.target.value })}
                />
              </div>

              {/* Privacy Consent Checkbox */}
              <div className="form-check mb-4">
                <input
                  type="checkbox"
                  id="wizardConsentCheck"
                  className={`form-check-input ${validationErrors.consent ? 'is-invalid' : ''}`}
                  checked={patientData.consent}
                  onChange={(e) => setPatientData({ ...patientData, consent: e.target.checked })}
                />
                <label htmlFor="wizardConsentCheck" className="form-check-label small text-muted">
                  {isAr ? (
                    <>
                      أوافق على{' '}
                      <Link to="/privacy" target="_blank" className="text-primary text-decoration-none fw-bold">
                        سياسة الخصوصية
                      </Link>{' '}
                      واستخدام بياناتي المسجلة لتنسيق موعد الكشف بالعيادة.
                    </>
                  ) : (
                    <>
                      I accept the{' '}
                      <Link to="/privacy" target="_blank" className="text-primary text-decoration-none fw-bold">
                        Privacy Policy
                      </Link>{' '}
                      and allow Hayaah Clinic to process my details to schedule my appointment.
                    </>
                  )}
                </label>
                {validationErrors.consent && (
                  <div className="invalid-feedback d-block">{validationErrors.consent}</div>
                )}
              </div>

              <div className="step-actions d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2 d-flex align-items-center gap-2 rounded-pill"
                  onClick={() => setStep(3)}
                >
                  {isAr ? <FiArrowRight /> : <FiArrowLeft />}
                  <span>{isAr ? 'رجوع' : 'Back'}</span>
                </button>

                <button
                  type="submit"
                  className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2 rounded-pill"
                >
                  <span>{isAr ? 'مراجعة وتأكيد الحجز' : 'Review & Confirm'}</span>
                  {isAr ? <FiArrowLeft /> : <FiArrowRight />}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* STEP 5: REVIEW & CONFIRM */}
        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: isAr ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isAr ? -20 : 20 }}
            transition={{ duration: 0.25 }}
            className="step-pane"
          >
            <div className="pane-header mb-4 text-center">
              <h4 className="fw-bold mb-1">
                {isAr ? '٥. مراجعة تفاصيل الموعد' : '5. Review Appointment Summary'}
              </h4>
              <p className="text-muted small">
                {isAr
                  ? 'يرجى مراجعة تفاصيل الحجز قبل الإرسال النهائي لتثبيت الموعد'
                  : 'Please check your appointment details before final confirmation'}
              </p>
            </div>

            {/* Error banner if submission failed or slot taken */}
            {submissionError && (
              <div className="alert alert-danger d-flex align-items-start gap-2 mb-4 p-3 rounded-3">
                <FiAlertCircle className="fs-5 flex-shrink-0 mt-1" />
                <div className="flex-grow-1">
                  <div className="fw-bold mb-1">{submissionError}</div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger mt-1 rounded-pill"
                    onClick={() => setStep(3)}
                  >
                    {isAr ? 'اختيار موعد آخر الآن' : 'Choose another slot'}
                  </button>
                </div>
              </div>
            )}

            <div className="summary-card p-4 rounded-4 bg-light border mb-4">
              <div className="row g-3">
                {/* Service */}
                <div className="col-sm-6">
                  <div className="summary-item">
                    <span className="label small text-muted d-block">
                      {isAr ? 'الخدمة المطلوبة:' : 'Selected Service:'}
                    </span>
                    <strong className="value text-dark">
                      {isAr ? activeServiceObj.title.ar : activeServiceObj.title.en}
                    </strong>
                    <span className="d-block small text-muted">
                      {isAr
                        ? activeServiceObj.duration?.ar || '٣٠ دقيقة'
                        : activeServiceObj.duration?.en || '30 mins'}
                    </span>
                  </div>
                </div>

                {/* Doctor */}
                <div className="col-sm-6">
                  <div className="summary-item">
                    <span className="label small text-muted d-block">
                      {isAr ? 'الطبيب المعالج:' : 'Doctor:'}
                    </span>
                    <strong className="value text-dark">
                      {activeDoctorObj
                        ? (isAr ? activeDoctorObj.doctorName.ar : activeDoctorObj.doctorName.en)
                        : (isAr ? 'أي طبيب متاح بالعيادة' : 'Any Available Doctor')}
                    </strong>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="col-sm-6">
                  <div className="summary-item">
                    <span className="label small text-muted d-block">
                      {isAr ? 'التاريخ والوقت:' : 'Date & Time:'}
                    </span>
                    <strong className="value text-primary d-flex align-items-center gap-1">
                      <FiCalendar />
                      <span>{selectedDate}</span>
                      <span className="mx-1">•</span>
                      <FiClock />
                      <span>{selectedTime}</span>
                    </strong>
                    <small className="text-muted">
                      {isAr ? 'بتوقيت القاهرة' : 'Cairo Local Time'}
                    </small>
                  </div>
                </div>

                {/* Patient Name & Phone */}
                <div className="col-sm-6">
                  <div className="summary-item">
                    <span className="label small text-muted d-block">
                      {isAr ? 'اسم ورقم المريض:' : 'Patient Name & Phone:'}
                    </span>
                    <strong className="value text-dark d-block">{patientData.name}</strong>
                    <span className="small text-muted" dir="ltr">{patientData.phone}</span>
                  </div>
                </div>

                {/* Clinic Location */}
                <div className="col-12 border-top pt-3">
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <FiMapPin className="text-primary flex-shrink-0" />
                    <span>
                      {isAr ? CLINIC_DATA.address.ar : CLINIC_DATA.address.en}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="step-actions d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-outline-secondary px-4 py-2 d-flex align-items-center gap-2 rounded-pill"
                onClick={() => setStep(4)}
                disabled={isSubmitting}
              >
                {isAr ? <FiArrowRight /> : <FiArrowLeft />}
                <span>{isAr ? 'تعديل البيانات' : 'Edit Details'}</span>
              </button>

              <button
                type="button"
                className="btn btn-primary px-5 py-2 d-flex align-items-center gap-2 rounded-pill"
                disabled={isSubmitting}
                onClick={handleConfirmBooking}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    <span>{isAr ? 'جاري تثبيت الموعد...' : 'Confirming...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isAr ? 'تأكيد الحجز الآن' : 'Confirm Appointment'}</span>
                    <FiCheck />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 6: SUCCESS & CONFIRMATION ACTIONS */}
        {step === 6 && confirmedAppointment && (
          <motion.div
            key="step6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="step-pane success-pane text-center"
          >
            {/* Animated Checkmark Bubble */}
            <div className="success-icon-bubble mx-auto mb-3">
              <FiCheck />
            </div>

            <h3 className="fw-bold mb-2 text-success">
              {isAr ? 'تم تأكيد حجز موعدك بنجاح!' : 'Appointment Successfully Booked!'}
            </h3>

            <p className="text-muted small mb-4">
              {isAr
                ? 'شكراً لاختيارك عيادة حياة لطب الأسنان. تم حجز موعدك بنجاح في النظام.'
                : 'Thank you for choosing Hayaah Dental Clinic. Your appointment is officially scheduled.'}
            </p>

            {/* Prominent Booking Code Card */}
            <div className="booking-code-card p-3 rounded-4 bg-light border mx-auto mb-4" style={{ maxWidth: '420px' }}>
              <span className="small text-muted d-block mb-1">
                {isAr ? 'كود الحجز المرجعي الخاص بك:' : 'Your Unique Booking Code:'}
              </span>
              <div className="d-flex align-items-center justify-content-center gap-3">
                <span className="code-display fw-bold fs-3 text-primary letter-spacing-1">
                  {confirmedAppointment.bookingCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="btn btn-sm btn-outline-primary rounded-pill d-flex align-items-center gap-1"
                  title={isAr ? 'نسخ كود الحجز' : 'Copy code'}
                >
                  <FiCopy />
                  <span className="small">{copiedCode ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ' : 'Copy')}</span>
                </button>
              </div>
              <small className="text-muted mt-2 d-block">
                {isAr
                  ? 'احتفظ بهذا الكود لتعديل أو إلغاء موعدك في أي وقت'
                  : 'Keep this code to reschedule or cancel your visit anytime'}
              </small>
            </div>

            {/* Quick Summary Pill */}
            <div className="confirmed-details-card p-3 rounded-3 border bg-white mb-4 text-start mx-auto" style={{ maxWidth: '480px' }} dir={isAr ? 'rtl' : 'ltr'}>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted small">{isAr ? 'الخدمة:' : 'Service:'}</span>
                <strong className="small">{confirmedAppointment.serviceName.ar}</strong>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted small">{isAr ? 'الموعد:' : 'Appointment:'}</span>
                <strong className="small text-primary">
                  {confirmedAppointment.date} • {confirmedAppointment.startTime} ({isAr ? 'بتوقيت القاهرة' : 'Cairo'})
                </strong>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted small">{isAr ? 'المريض:' : 'Patient:'}</span>
                <strong className="small">{confirmedAppointment.patientName}</strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="success-action-buttons d-flex flex-wrap justify-content-center gap-2 mb-4">
              {/* WhatsApp direct to clinic */}
              <a
                href={buildClinicWhatsAppUrl(confirmedAppointment, undefined, language)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success d-flex align-items-center gap-2 rounded-pill px-4"
              >
                <FaWhatsapp />
                <span>{isAr ? 'إرسال تأكيد عبر واتساب للعيادة' : 'Send via WhatsApp to Clinic'}</span>
              </a>

              {/* Add to Calendar: .ics download */}
              <button
                type="button"
                onClick={handleDownloadIcs}
                className="btn btn-outline-primary d-flex align-items-center gap-2 rounded-pill px-3"
              >
                <FiDownload />
                <span>{isAr ? 'إضافة إلى تقويم الهاتف (.ics)' : 'Add to Calendar (.ics)'}</span>
              </button>

              {/* Google Calendar Web Link */}
              <a
                href={buildGoogleCalendarUrl(confirmedAppointment, CLINIC_DATA.address.ar)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-secondary d-flex align-items-center gap-2 rounded-pill px-3"
              >
                <FiCalendar />
                <span>Google Calendar</span>
              </a>

              {/* Print Confirmation */}
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-outline-dark d-flex align-items-center gap-2 rounded-pill px-3"
              >
                <FiPrinter />
                <span>{isAr ? 'طباعة القسيمة' : 'Print Voucher'}</span>
              </button>
            </div>

            {/* Manage booking direct link */}
            <div className="manage-booking-footer-link pt-3 border-top">
              <Link
                to={`/booking/manage?code=${confirmedAppointment.bookingCode}&phone=${encodeURIComponent(
                  confirmedAppointment.patientPhone
                )}`}
                className="text-primary fw-bold text-decoration-none small d-inline-flex align-items-center gap-1"
              >
                <span>{isAr ? 'عرض أو تعديل أو إلغاء هذا الحجز' : 'View, Reschedule or Cancel this Booking'}</span>
                {isAr ? <FiArrowLeft /> : <FiArrowRight />}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingWizard;
