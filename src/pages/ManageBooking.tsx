import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation, useLanguage } from '../i18n/LanguageContext';
import {
  getBookingService,
  validateAndNormalizeEgyptianPhone,
  canCancelAppointment,
  generateIcsContent,
  buildGoogleCalendarUrl,
  buildClinicWhatsAppUrl,
  Appointment,
  TimeSlot,
} from '../services/booking';
import { CustomCalendar } from '../components/BookingWizard/CustomCalendar';
import { TimeSlotPicker } from '../components/BookingWizard/TimeSlotPicker';
import { CLINIC_DATA } from '../data/clinic';
import {
  FiSearch,
  FiCalendar,
  FiClock,
  FiUser,
  FiPhone,
  FiMapPin,
  FiXCircle,
  FiRotateCw,
  FiCheckCircle,
  FiAlertCircle,
  FiDownload,
  FiArrowRight,
  FiArrowLeft,
  FiShield,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import './ManageBooking.scss';

export const ManageBooking: React.FC = () => {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  const [searchParams] = useSearchParams();

  // Dynamic SEO noindex tag
  useEffect(() => {
    let metaTag = document.querySelector('meta[name="robots"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'robots');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', 'noindex, nofollow');

    return () => {
      const allowIndexing = import.meta.env.VITE_ALLOW_INDEXING === 'true';
      metaTag?.setAttribute('content', allowIndexing ? 'index, follow' : 'noindex, nofollow');
    };
  }, []);

  const bookingService = useMemo(() => getBookingService(), []);

  const [bookingCode, setBookingCode] = useState(searchParams.get('code') || '');
  const [patientPhone, setPatientPhone] = useState(searchParams.get('phone') || '');
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Reschedule state
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);

  // Cancellation state
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const urlToken = searchParams.get('token') || searchParams.get('manageToken');

  const fetchAppointmentByToken = async (tokenToFetch: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setActionSuccessMsg(null);

    try {
      if (bookingService.getAppointmentByToken) {
        const result = await bookingService.getAppointmentByToken(tokenToFetch);
        if (result) {
          setAppointment(result);
          setRescheduleDate(result.date);
          setIsLoading(false);
          return;
        }
      }
      setErrorMsg(
        isAr
          ? 'لم يتم العثور على حجز يطابق هذا الرابط السري. يرجى التأكد من الرابط أو إدخال كود الحجز ورقم الهاتف.'
          : 'No booking found matching this manage token. Please check your link or enter your code and phone.'
      );
      setAppointment(null);
    } catch (err) {
      console.error('Failed to retrieve appointment by token:', err);
      setErrorMsg(isAr ? 'حدث خطأ أثناء البحث عن الحجز' : 'Failed to search for booking');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAppointment = async (codeToFetch: string, phoneToFetch: string) => {
    if (!codeToFetch.trim() || !phoneToFetch.trim()) {
      setErrorMsg(
        isAr
          ? 'يرجى إدخال كود الحجز ورقم الهاتف المسجل'
          : 'Please enter both your booking code and registered phone number'
      );
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setActionSuccessMsg(null);

    try {
      const result = await bookingService.getAppointmentByCode(codeToFetch, phoneToFetch);
      if (!result) {
        setErrorMsg(
          isAr
            ? 'لم يتم العثور على حجز يطابق هذا الكود ورقم الهاتف. يرجى التأكد من البيانات المدخلة.'
            : 'No booking found matching this code and phone. Please check your details.'
        );
        setAppointment(null);
      } else {
        setAppointment(result);
        setRescheduleDate(result.date);
      }
    } catch (err) {
      console.error('Failed to retrieve appointment:', err);
      setErrorMsg(isAr ? 'حدث خطأ أثناء البحث عن الحجز' : 'Failed to search for booking');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto lookup if query params exist (token priority, then code + phone)
  useEffect(() => {
    const token = searchParams.get('token') || searchParams.get('manageToken');
    if (token) {
      fetchAppointmentByToken(token);
      return;
    }

    const code = searchParams.get('code');
    const phone = searchParams.get('phone');
    if (code && phone) {
      fetchAppointment(code, phone);
    }
  }, [searchParams]);

  // Load available slots for rescheduling
  useEffect(() => {
    if (!isRescheduling || !rescheduleDate || !appointment) return;

    let active = true;
    setIsLoadingSlots(true);

    bookingService
      .getAvailability(rescheduleDate, appointment.serviceId, appointment.doctorId)
      .then((avail) => {
        if (!active) return;
        setRescheduleSlots(avail.slots || []);
      })
      .catch((err) => console.error('Error fetching reschedule slots:', err))
      .finally(() => {
        if (active) setIsLoadingSlots(false);
      });

    return () => {
      active = false;
    };
  }, [isRescheduling, rescheduleDate, appointment, bookingService]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAppointment(bookingCode, patientPhone);
  };

  const handleConfirmCancel = async () => {
    if (!appointment) return;
    setIsSubmittingCancel(true);
    setErrorMsg(null);

    try {
      let res: { success: boolean; error?: string };

      if (appointment.manageToken && bookingService.cancelAppointmentByToken) {
        res = await bookingService.cancelAppointmentByToken(
          appointment.manageToken,
          cancellationReason.trim() || undefined
        );
      } else {
        res = await bookingService.cancelAppointment(
          appointment.bookingCode,
          appointment.patientPhone,
          cancellationReason.trim() || undefined
        );
      }

      if (!res.success) {
        setErrorMsg(res.error || (isAr ? 'تعذر إلغاء الموعد' : 'Could not cancel appointment'));
      } else {
        setActionSuccessMsg(isAr ? 'تم إلغاء الموعد بنجاح.' : 'Appointment has been cancelled.');
        setIsCancelling(false);
        // Refresh appointment status
        if (appointment.manageToken) {
          await fetchAppointmentByToken(appointment.manageToken);
        } else {
          await fetchAppointment(appointment.bookingCode, appointment.patientPhone);
        }
      }
    } catch (err) {
      console.error('Cancel error:', err);
      setErrorMsg(isAr ? 'حدث خطأ أثناء معالجة الإلغاء' : 'An error occurred while cancelling');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!appointment || !rescheduleDate || !rescheduleTime) return;
    setIsSubmittingReschedule(true);
    setErrorMsg(null);

    try {
      let res: { success: boolean; appointment?: Appointment; error?: string };

      if (appointment.manageToken && bookingService.rescheduleAppointmentByToken) {
        res = await bookingService.rescheduleAppointmentByToken({
          token: appointment.manageToken,
          newDate: rescheduleDate,
          newStartTime: rescheduleTime,
        });
      } else {
        res = await bookingService.rescheduleAppointment({
          bookingCode: appointment.bookingCode,
          patientPhone: appointment.patientPhone,
          newDate: rescheduleDate,
          newStartTime: rescheduleTime,
        });
      }

      if (!res.success) {
        setErrorMsg(res.error || (isAr ? 'تعذر تعديل الموعد' : 'Could not reschedule appointment'));
      } else {
        setActionSuccessMsg(isAr ? 'تم تعديل الموعد بنجاح!' : 'Appointment successfully rescheduled!');
        setIsRescheduling(false);
        if (appointment.manageToken) {
          await fetchAppointmentByToken(appointment.manageToken);
        } else {
          await fetchAppointment(appointment.bookingCode, appointment.patientPhone);
        }
      }
    } catch (err) {
      console.error('Reschedule error:', err);
      setErrorMsg(isAr ? 'حدث خطأ أثناء تعديل الموعد' : 'An error occurred while rescheduling');
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  // Download ICS
  const handleDownloadIcs = () => {
    if (!appointment) return;
    const icsString = generateIcsContent(appointment, CLINIC_DATA.address.ar);
    const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Hayaah-${appointment.bookingCode}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusBadges: Record<string, { labelAr: string; labelEn: string; bg: string }> = {
    pending: { labelAr: 'قيد التأكيد', labelEn: 'Pending', bg: 'bg-warning text-dark' },
    confirmed: { labelAr: 'مؤكد', labelEn: 'Confirmed', bg: 'bg-success text-white' },
    completed: { labelAr: 'مكتمل', labelEn: 'Completed', bg: 'bg-info text-white' },
    cancelled: { labelAr: 'ملغي', labelEn: 'Cancelled', bg: 'bg-danger text-white' },
    no_show: { labelAr: 'لم يحضر', labelEn: 'No Show', bg: 'bg-secondary text-white' },
  };

  const cancelCheck = appointment ? canCancelAppointment(appointment) : { allowed: true };

  return (
    <div className="manage-booking-page py-5 bg-light min-vh-100" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container">
        {/* Page Header */}
        <div className="page-header-box text-center mb-5">
          <span className="badge bg-primary-subtle text-primary mb-2 px-3 py-2 rounded-pill fw-bold">
            <FiShield className="me-1" />
            {isAr ? 'بوابة المريض المباشرة' : 'Patient Self-Service Portal'}
          </span>
          <h2 className="fw-bold mb-2">
            {isAr ? 'إدارة وتعديل موعد الحجز' : 'Manage Your Appointment'}
          </h2>
          <p className="text-muted small mx-auto" style={{ maxWidth: '580px' }}>
            {isAr
              ? 'أدخل كود الحجز (HAY-XXXXX) ورقم هاتفك للاطلاع على تفاصيل موعدك، أو إعادة جدولته، أو إلغائه.'
              : 'Enter your booking code (HAY-XXXXX) and registered mobile phone to view, reschedule, or cancel your visit.'}
          </p>
        </div>

        {/* Search / Lookup Form */}
        <div className="lookup-card card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-5 mx-auto" style={{ maxWidth: '640px' }}>
          <form onSubmit={handleSearchSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">
                  {isAr ? 'كود الحجز المرجعي *' : 'Booking Code *'}
                </label>
                <input
                  type="text"
                  className="form-control text-uppercase"
                  placeholder="HAY-4F7K2"
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">
                  {isAr ? 'رقم الهاتف المسجل *' : 'Registered Phone *'}
                </label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="01012345678"
                  dir="ltr"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  required
                />
              </div>

              <div className="col-12 mt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-100 py-2 rounded-pill d-flex align-items-center justify-content-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      <span>{isAr ? 'جاري البحث عن الحجز...' : 'Searching...'}</span>
                    </>
                  ) : (
                    <>
                      <FiSearch />
                      <span>{isAr ? 'عرض تفاصيل الحجز' : 'Find Booking'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mt-4 p-3 rounded-3 mb-0">
              <FiAlertCircle className="flex-shrink-0" />
              <span className="small">{errorMsg}</span>
            </div>
          )}

          {actionSuccessMsg && (
            <div className="alert alert-success d-flex align-items-center gap-2 mt-4 p-3 rounded-3 mb-0">
              <FiCheckCircle className="flex-shrink-0" />
              <span className="small">{actionSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* Appointment Details Display */}
        {appointment && (
          <div className="appointment-result-card card border-0 shadow rounded-4 p-4 p-md-5 mx-auto" style={{ maxWidth: '780px' }}>
            {/* Top Status Banner */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 border-bottom pb-4 mb-4">
              <div>
                <span className="small text-muted d-block">{isAr ? 'كود الحجز:' : 'Booking Code:'}</span>
                <h3 className="fw-bold text-primary m-0 letter-spacing-1">{appointment.bookingCode}</h3>
              </div>

              <span className={`badge rounded-pill px-3 py-2 fs-6 ${statusBadges[appointment.status]?.bg || 'bg-secondary'}`}>
                {isAr ? statusBadges[appointment.status]?.labelAr : statusBadges[appointment.status]?.labelEn}
              </span>
            </div>

            {/* Appointment Details Grid */}
            <div className="row g-4 mb-4">
              <div className="col-sm-6">
                <div className="p-3 bg-light rounded-3 border">
                  <span className="text-muted small d-block mb-1">{isAr ? 'الخدمة:' : 'Service:'}</span>
                  <strong className="d-block">{isAr ? appointment.serviceName.ar : appointment.serviceName.en}</strong>
                  <small className="text-muted">{appointment.serviceDuration} {isAr ? 'دقيقة' : 'mins'}</small>
                </div>
              </div>

              <div className="col-sm-6">
                <div className="p-3 bg-light rounded-3 border">
                  <span className="text-muted small d-block mb-1">{isAr ? 'الطبيب:' : 'Doctor:'}</span>
                  <strong className="d-block">
                    {appointment.doctorName
                      ? (isAr ? appointment.doctorName.ar : appointment.doctorName.en)
                      : (isAr ? 'أي طبيب متاح' : 'Any Available Doctor')}
                  </strong>
                </div>
              </div>

              <div className="col-sm-6">
                <div className="p-3 bg-light rounded-3 border">
                  <span className="text-muted small d-block mb-1">{isAr ? 'التاريخ والوقت:' : 'Date & Time:'}</span>
                  <strong className="d-flex align-items-center gap-1 text-primary">
                    <FiCalendar />
                    <span>{appointment.date}</span>
                    <span className="mx-1">•</span>
                    <FiClock />
                    <span>{appointment.startTime}</span>
                  </strong>
                  <small className="text-muted">{isAr ? 'بتوقيت القاهرة' : 'Cairo Local Time'}</small>
                </div>
              </div>

              <div className="col-sm-6">
                <div className="p-3 bg-light rounded-3 border">
                  <span className="text-muted small d-block mb-1">{isAr ? 'اسم المريض:' : 'Patient Name:'}</span>
                  <strong className="d-block">{appointment.patientName}</strong>
                  <span className="small text-muted" dir="ltr">{appointment.patientPhone}</span>
                </div>
              </div>

              <div className="col-12">
                <div className="p-3 bg-light rounded-3 border d-flex align-items-center gap-2">
                  <FiMapPin className="text-primary flex-shrink-0" />
                  <span className="small text-muted">
                    {isAr ? CLINIC_DATA.address.ar : CLINIC_DATA.address.en}
                  </span>
                </div>
              </div>
            </div>

            {/* In-Place Reschedule Box */}
            {isRescheduling && (
              <div className="reschedule-box p-4 rounded-4 bg-light border mb-4">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <FiRotateCw className="text-primary" />
                  <span>{isAr ? 'اختيار موعد بديل' : 'Select New Appointment Slot'}</span>
                </h5>

                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <div className="bg-white p-3 rounded-3 border">
                      <CustomCalendar
                        selectedDate={rescheduleDate}
                        onSelectDate={(newDate) => {
                          setRescheduleDate(newDate);
                          setRescheduleTime('');
                        }}
                        language={language}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="bg-white p-3 rounded-3 border h-100">
                      <TimeSlotPicker
                        slots={rescheduleSlots}
                        selectedTime={rescheduleTime}
                        onSelectTime={(time) => setRescheduleTime(time)}
                        isLoading={isLoadingSlots}
                        isFriday={rescheduleDate ? new Date(rescheduleDate).getDay() === 5 : false}
                        language={language}
                      />
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setIsRescheduling(false)}
                    disabled={isSubmittingReschedule}
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary rounded-pill px-4"
                    disabled={!rescheduleDate || !rescheduleTime || isSubmittingReschedule}
                    onClick={handleConfirmReschedule}
                  >
                    {isSubmittingReschedule ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" />
                        <span>{isAr ? 'جاري التعديل...' : 'Updating...'}</span>
                      </>
                    ) : (
                      <span>{isAr ? 'تأكيد الموعد الجديد' : 'Confirm New Slot'}</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Cancellation Confirmation Box */}
            {isCancelling && (
              <div className="cancellation-box p-4 rounded-4 bg-danger-subtle border border-danger-subtle mb-4">
                <h5 className="fw-bold text-danger mb-2 d-flex align-items-center gap-2">
                  <FiAlertCircle />
                  <span>{isAr ? 'هل أنت متأكد من إلغاء الموعد؟' : 'Are you sure you want to cancel?'}</span>
                </h5>
                <p className="small text-muted mb-3">
                  {isAr
                    ? 'سيتم إلغاء الموعد وإتاحته لمرضى آخرين. يمكنك حجز موعد جديد في أي وقت.'
                    : 'Your appointment slot will be released. You can book a new appointment at any time.'}
                </p>

                <div className="mb-3">
                  <label className="form-label small fw-bold">
                    {isAr ? 'سبب الإلغاء (اختياري):' : 'Reason for cancellation (optional):'}
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder={isAr ? 'مثال: ظرف طارئ، تغيير المخطط...' : 'e.g. Schedule conflict...'}
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                  />
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setIsCancelling(false)}
                    disabled={isSubmittingCancel}
                  >
                    {isAr ? 'تراجع' : 'Keep Appointment'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger rounded-pill px-4"
                    disabled={isSubmittingCancel}
                    onClick={handleConfirmCancel}
                  >
                    {isSubmittingCancel ? (
                      <span>{isAr ? 'جاري الإلغاء...' : 'Cancelling...'}</span>
                    ) : (
                      <span>{isAr ? 'تأكيد إلغاء الحجز' : 'Confirm Cancellation'}</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons for Active Appointments */}
            {appointment.status !== 'cancelled' && !isRescheduling && !isCancelling && (
              <div className="d-flex flex-wrap gap-2 pt-3 border-top">
                {/* Reschedule Button */}
                <button
                  type="button"
                  className="btn btn-outline-primary rounded-pill px-4 d-flex align-items-center gap-2"
                  onClick={() => setIsRescheduling(true)}
                >
                  <FiRotateCw />
                  <span>{isAr ? 'إعادة جدولة الموعد' : 'Reschedule Slot'}</span>
                </button>

                {/* Cancel Button */}
                {cancelCheck.allowed ? (
                  <button
                    type="button"
                    className="btn btn-outline-danger rounded-pill px-4 d-flex align-items-center gap-2"
                    onClick={() => setIsCancelling(true)}
                  >
                    <FiXCircle />
                    <span>{isAr ? 'إلغاء الموعد' : 'Cancel Booking'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="btn btn-outline-secondary rounded-pill px-3"
                    title={cancelCheck.reason}
                  >
                    <span className="small">{cancelCheck.reason}</span>
                  </button>
                )}

                {/* WhatsApp Link */}
                <a
                  href={buildClinicWhatsAppUrl(appointment, undefined, language)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-success rounded-pill px-3 d-flex align-items-center gap-2"
                >
                  <FaWhatsapp />
                  <span>{isAr ? 'واتساب العيادة' : 'WhatsApp'}</span>
                </a>

                {/* Calendar File */}
                <button
                  type="button"
                  onClick={handleDownloadIcs}
                  className="btn btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-2"
                >
                  <FiDownload />
                  <span>{isAr ? 'إضافة للتقويم (.ics)' : 'Add to Calendar'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Back to Home Link */}
        <div className="text-center mt-5">
          <Link to="/" className="text-muted text-decoration-none small d-inline-flex align-items-center gap-1">
            {isAr ? <FiArrowRight /> : <FiArrowLeft />}
            <span>{isAr ? 'العودة إلى الصفحة الرئيسية' : 'Return to Home'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ManageBooking;
