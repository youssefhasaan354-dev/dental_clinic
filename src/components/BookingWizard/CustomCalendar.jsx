import React, { useState, useMemo } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isBefore,
  isAfter,
  addDays,
} from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';
import { getCairoNow, formatCairoDate } from '../../services/booking/slotEngine';

export const CustomCalendar = ({
  selectedDate,
  onSelectDate,
  language = 'ar',
  minDate,
  maxAdvanceDays = 60,
}) => {
  const isAr = language === 'ar';
  const cairoToday = useMemo(() => getCairoNow(), []);
  const todayStr = useMemo(() => formatCairoDate(cairoToday), [cairoToday]);

  // Current calendar view month
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) {
      const [y, m, d] = selectedDate.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return cairoToday;
  });

  const minAllowedDate = useMemo(() => {
    if (minDate) return new Date(minDate);
    const d = new Date(todayStr);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [minDate, todayStr]);

  const maxAllowedDate = useMemo(() => {
    return addDays(minAllowedDate, maxAdvanceDays);
  }, [minAllowedDate, maxAdvanceDays]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    // In Egypt/Arab world, week starts on Saturday (weekStartsOn: 6)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 6 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 6 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const handlePrevMonth = () => {
    const prev = subMonths(currentMonth, 1);
    if (!isBefore(endOfMonth(prev), minAllowedDate)) {
      setCurrentMonth(prev);
    }
  };

  const handleNextMonth = () => {
    const next = addMonths(currentMonth, 1);
    if (!isAfter(startOfMonth(next), maxAllowedDate)) {
      setCurrentMonth(next);
    }
  };

  const weekDayLabels = isAr
    ? ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة']
    : ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  return (
    <div className="custom-calendar-container" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Calendar Header with Navigation */}
      <div className="calendar-header d-flex align-items-center justify-content-between mb-3 px-2">
        <h5 className="calendar-month-title m-0 fw-bold d-flex align-items-center gap-2">
          <FiCalendar className="text-primary" />
          <span>
            {format(currentMonth, 'MMMM yyyy', { locale: isAr ? arSA : enUS })}
          </span>
        </h5>

        <div className="calendar-nav-buttons d-flex gap-2">
          <button
            type="button"
            className="btn-cal-nav"
            onClick={isAr ? handleNextMonth : handlePrevMonth}
            aria-label={isAr ? 'الشهر التالي' : 'Previous month'}
          >
            {isAr ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
          <button
            type="button"
            className="btn-cal-nav"
            onClick={isAr ? handlePrevMonth : handleNextMonth}
            aria-label={isAr ? 'الشهر السابق' : 'Next month'}
          >
            {isAr ? <FiChevronLeft /> : <FiChevronRight />}
          </button>
        </div>
      </div>

      {/* Weekday Names Header */}
      <div className="calendar-grid-weekdays mb-2">
        {weekDayLabels.map((dayName, idx) => (
          <div
            key={dayName}
            className={`calendar-weekday-cell ${idx === 6 ? 'friday-col' : ''}`}
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="calendar-grid-days">
        {calendarDays.map((dayDate) => {
          const dateStr = format(dayDate, 'yyyy-MM-dd');
          const isFriday = dayDate.getDay() === 5;
          const isCurrentMonth = isSameMonth(dayDate, currentMonth);
          const isPast = isBefore(dayDate, minAllowedDate);
          const isBeyondMax = isAfter(dayDate, maxAllowedDate);
          const isSelected = selectedDate === dateStr;
          const isToday = isSameDay(dayDate, cairoToday);

          const isDisabled = !isCurrentMonth || isPast || isBeyondMax || isFriday;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectDate(dateStr)}
              className={`calendar-day-cell ${isSelected ? 'selected' : ''} ${
                isToday ? 'today' : ''
              } ${isFriday ? 'friday-closed' : ''} ${
                !isCurrentMonth ? 'other-month' : ''
              }`}
              title={
                isFriday
                  ? (isAr ? 'العيادة مغلقة أيام الجمعة' : 'Clinic closed on Fridays')
                  : undefined
              }
              aria-label={`${dateStr} ${isFriday ? (isAr ? 'مغلق' : 'Closed') : ''}`}
              aria-pressed={isSelected}
            >
              <span className="day-number">{format(dayDate, 'd')}</span>
              {isFriday && isCurrentMonth && (
                <span className="closed-indicator">{isAr ? 'مغلق' : 'Closed'}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Calendar Legend */}
      <div className="calendar-legend d-flex flex-wrap align-items-center justify-content-between mt-3 pt-2 border-top small text-muted">
        <div className="d-flex align-items-center gap-2">
          <span className="legend-dot legend-available"></span>
          <span>{isAr ? 'أيام متاحة للحجز' : 'Available days'}</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="legend-dot legend-friday"></span>
          <span>{isAr ? 'الجمعة عطلة العيادة' : 'Friday closed'}</span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <span className="badge bg-light text-dark border">
            {isAr ? 'بتوقيت القاهرة' : 'Cairo Time'}
          </span>
        </div>
      </div>
    </div>
  );
};
