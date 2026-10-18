import React from 'react';
import { FiSun, FiSunset, FiMoon, FiClock, FiAlertCircle } from 'react-icons/fi';

export const TimeSlotPicker = ({
  slots = [],
  selectedTime,
  onSelectTime,
  isLoading = false,
  isFriday = false,
  language = 'ar',
}) => {
  const isAr = language === 'ar';

  if (isFriday) {
    return (
      <div className="time-slots-notice alert alert-warning border text-center p-4 rounded-3">
        <FiAlertCircle className="fs-3 mb-2 text-warning d-block mx-auto" />
        <h6 className="fw-bold mb-1">
          {isAr ? 'العيادة مغلقة أيام الجمعة' : 'Clinic Closed on Fridays'}
        </h6>
        <p className="small mb-0 text-muted">
          {isAr
            ? 'نستقبلكم طوال أيام الأسبوع من السبت إلى الخميس، من ١٠:٠٠ ص حتى ١٠:٠٠ م.'
            : 'We welcome you Saturday through Thursday, 10:00 AM to 10:00 PM.'}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="time-slots-loading text-center py-5">
        <div className="spinner-border text-primary spinner-border-sm mb-2" role="status">
          <span className="visually-hidden">Loading availability...</span>
        </div>
        <p className="small text-muted mb-0">
          {isAr ? 'جاري فحص المواعيد المتاحة لدى الأطباء...' : 'Checking dentist availability...'}
        </p>
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="time-slots-empty alert alert-light border text-center p-4 rounded-3">
        <FiClock className="fs-3 mb-2 text-muted d-block mx-auto" />
        <h6 className="fw-bold mb-1">
          {isAr ? 'لا توجد مواعيد متاحة في هذا اليوم' : 'No available slots for this date'}
        </h6>
        <p className="small mb-0 text-muted">
          {isAr
            ? 'تم حجز كافة المواعيد المتاحة أو اليوم خارج أوقات العمل. يرجى اختيار تاريخ آخر.'
            : 'All slots are fully booked or outside operating hours. Please pick another date.'}
        </p>
      </div>
    );
  }

  const morningSlots = slots.filter((s) => s.period === 'morning');
  const afternoonSlots = slots.filter((s) => s.period === 'afternoon');
  const eveningSlots = slots.filter((s) => s.period === 'evening');

  const renderSlotGroup = (titleAr, titleEn, icon, groupSlots) => {
    if (!groupSlots || groupSlots.length === 0) return null;

    return (
      <div className="slot-period-group mb-4">
        <div className="slot-period-header d-flex align-items-center gap-2 mb-2 pb-1 border-bottom">
          <span className="period-icon text-primary">{icon}</span>
          <span className="fw-bold small text-dark">{isAr ? titleAr : titleEn}</span>
        </div>

        <div className="slot-chips-grid">
          {groupSlots.map((slot) => {
            const isSelected = selectedTime === slot.time;
            const isDisabled = !slot.isAvailable;

            return (
              <button
                key={slot.time}
                type="button"
                disabled={isDisabled}
                onClick={() => onSelectTime(slot.time)}
                className={`slot-chip-btn ${isSelected ? 'selected' : ''} ${
                  isDisabled ? 'disabled' : ''
                }`}
                title={
                  isDisabled
                    ? (isAr ? 'هذا الموعد غير متاح' : 'Slot unavailable')
                    : undefined
                }
                aria-pressed={isSelected}
              >
                <span className="slot-time">{slot.time}</span>
                {isDisabled && (
                  <span className="slot-taken-badge">{isAr ? 'محجوز' : 'Taken'}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="time-slot-picker-wrapper" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <span className="small text-muted fw-bold">
          {isAr ? 'اختر الوقت المناسب لك:' : 'Choose your preferred time:'}
        </span>
        <span className="badge bg-light text-secondary border">
          {isAr ? 'بتوقيت القاهرة (Cairo Time)' : 'Cairo Time (Africa/Cairo)'}
        </span>
      </div>

      {renderSlotGroup('الفترة الصباحية (١٠:٠٠ ص - ١:٠٠ م)', 'Morning (10:00 AM - 1:00 PM)', <FiSun />, morningSlots)}
      {renderSlotGroup('فترة بعد الظهر (١:٠٠ م - ٥:٠٠ م)', 'Afternoon (1:00 PM - 5:00 PM)', <FiSunset />, afternoonSlots)}
      {renderSlotGroup('الفترة المسائية (٥:٠٠ م - ١٠:٠٠ م)', 'Evening (5:00 PM - 10:00 PM)', <FiMoon />, eveningSlots)}
    </div>
  );
};
