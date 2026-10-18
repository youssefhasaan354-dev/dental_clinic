import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  getBookingService,
  BookingSettings,
  DEFAULT_BOOKING_SETTINGS,
} from '../../services/booking';
import {
  Settings,
  Save,
  RotateCcw,
  Clock,
  Calendar,
  Phone,
  MessageSquare,
  Shield,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

export const BookingSettingsManager: React.FC = () => {
  const { language } = useLanguage();
  const { role } = useAuth();
  const isAr = language === 'ar';
  const isViewer = role === 'viewer';

  const bookingService = useMemo(() => getBookingService(), []);

  const [settings, setSettings] = useState<BookingSettings>(DEFAULT_BOOKING_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await bookingService.getSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [bookingService]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) {
      alert(isAr ? 'عفواً، وضع العرض فقط لا يملك صلاحية تعديل الإعدادات.' : 'Read-only mode.');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await bookingService.updateSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update settings:', err);
      alert(isAr ? 'حدث خطأ أثناء حفظ الإعدادات' : 'Error updating settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDemoData = async () => {
    if (isViewer) return;
    if (
      window.confirm(
        isAr
          ? 'تأكيد إعادة تعيين كافة بيانات المواعيد والأطباء والإعدادات التجريبية؟'
          : 'Confirm resetting all demo appointments, doctors, and settings?'
      )
    ) {
      await bookingService.resetDemoData();
      const fresh = await bookingService.getSettings();
      setSettings(fresh);
      alert(isAr ? 'تم إعادة ضبط البيانات التجريبية بنجاح.' : 'Demo data reset successfully.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-5 text-center text-muted">
        <div className="spinner-border spinner-border-sm text-primary me-2" />
        <span>{isAr ? 'جاري تحميل الإعدادات...' : 'Loading settings...'}</span>
      </div>
    );
  }

  return (
    <div className="admin-booking-settings p-3 p-md-4" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
            <Settings className="text-primary" />
            <span>{isAr ? 'إعدادات وقواعد محرك الحجز' : 'Booking Engine & Clinic Rules'}</span>
          </h3>
          <p className="text-muted small m-0">
            {isAr
              ? 'تخصيص مدة الفترات، أوقات العمل، مهلة الإلغاء، وأرقام وقوالب إشعارات الواتساب'
              : 'Customize slot durations, working hours, cancellation window & notification templates'}
          </p>
        </div>

        {bookingService.isDemo && (
          <button
            type="button"
            className="btn btn-outline-danger btn-sm rounded-pill d-flex align-items-center gap-1"
            onClick={handleResetDemoData}
            disabled={isViewer}
          >
            <RotateCcw size={14} />
            <span>{isAr ? 'إعادة ضبط البيانات التجريبية' : 'Reset Demo Seed'}</span>
          </button>
        )}
      </div>

      {saveSuccess && (
        <div className="alert alert-success d-flex align-items-center gap-2 p-3 rounded-4 mb-4">
          <CheckCircle size={18} />
          <span>{isAr ? 'تم حفظ كافة الإعدادات بنجاح!' : 'Settings updated successfully!'}</span>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="row g-4">
          {/* Card 1: Slot Engine Rules */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                <Clock className="text-primary" size={20} />
                <span>{isAr ? 'قواعد المواعيد والفترات الزمنية' : 'Slot & Scheduling Rules'}</span>
              </h5>

              <div className="row g-3">
                {/* Default Slot Duration */}
                <div className="col-sm-6">
                  <label className="form-label small fw-bold">
                    {isAr ? 'المدة الافتراضية للكشف (دقيقة):' : 'Default Slot Duration (mins):'}
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={settings.slotDurationMinutes}
                    onChange={(e) =>
                      setSettings({ ...settings, slotDurationMinutes: Number(e.target.value) })
                    }
                  >
                    <option value={15}>15 {isAr ? 'دقيقة' : 'mins'}</option>
                    <option value={30}>30 {isAr ? 'دقيقة (الافتراضي)' : 'mins (Default)'}</option>
                    <option value={45}>45 {isAr ? 'دقيقة' : 'mins'}</option>
                    <option value={60}>60 {isAr ? 'دقيقة' : 'mins'}</option>
                  </select>
                </div>

                {/* Min Notice Hours (Same Day Booking) */}
                <div className="col-sm-6">
                  <label className="form-label small fw-bold">
                    {isAr ? 'مهلة الحجز في نفس اليوم (ساعات):' : 'Min Notice for Same-Day (hours):'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    className="form-control form-control-sm"
                    value={settings.minNoticeHours}
                    onChange={(e) =>
                      setSettings({ ...settings, minNoticeHours: Number(e.target.value) })
                    }
                  />
                  <small className="text-muted d-block mt-1">
                    {isAr ? 'مثال: ساعتان قبل أقرب موعد متاح' : 'e.g. 2 hours before earliest slot'}
                  </small>
                </div>

                {/* Max Advance Booking Days */}
                <div className="col-sm-6">
                  <label className="form-label small fw-bold">
                    {isAr ? 'أقصى حجز مسبق (أيام):' : 'Max Advance Booking (days):'}
                  </label>
                  <input
                    type="number"
                    min={7}
                    max={180}
                    className="form-control form-control-sm"
                    value={settings.maxAdvanceDays}
                    onChange={(e) =>
                      setSettings({ ...settings, maxAdvanceDays: Number(e.target.value) })
                    }
                  />
                </div>

                {/* Cancellation Window */}
                <div className="col-sm-6">
                  <label className="form-label small fw-bold">
                    {isAr ? 'مهلة إلغاء الموعد (ساعات):' : 'Cancellation Window (hours):'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={48}
                    className="form-control form-control-sm"
                    value={settings.cancellationWindowHours}
                    onChange={(e) =>
                      setSettings({ ...settings, cancellationWindowHours: Number(e.target.value) })
                    }
                  />
                  <small className="text-muted d-block mt-1">
                    {isAr ? 'لا يمكن للمريض الإلغاء قبل أقل من هذا الحد' : 'No cancellation within this window'}
                  </small>
                </div>

                {/* Auto Confirm Toggle */}
                <div className="col-12 mt-3 pt-3 border-top">
                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      id="autoConfirmSwitch"
                      className="form-check-input"
                      checked={settings.autoConfirm}
                      onChange={(e) => setSettings({ ...settings, autoConfirm: e.target.checked })}
                    />
                    <label htmlFor="autoConfirmSwitch" className="form-check-label fw-bold small text-dark">
                      {isAr
                        ? 'تأكيد الحجوزات تلقائياً فور تسجيل المريض'
                        : 'Auto-confirm appointments immediately'}
                    </label>
                  </div>
                  <small className="text-muted d-block">
                    {isAr
                      ? 'عند التعطيل، تبدأ الحجوزات كـ "قيد التأكيد" حتى يتصل موظف الاستقبال بالمريض.'
                      : 'When disabled, bookings start as Pending until verified by receptionist.'}
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Operating Hours & Timezone */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                <Calendar className="text-primary" size={20} />
                <span>{isAr ? 'ساعات العمل الرسمية والنطاق الزمني' : 'Operating Hours & Timezone'}</span>
              </h5>

              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-bold">
                    {isAr ? 'وقت بدء العمل اليومي:' : 'Daily Open Time:'}
                  </label>
                  <input
                    type="time"
                    className="form-control form-control-sm"
                    value={settings.openTime}
                    onChange={(e) => setSettings({ ...settings, openTime: e.target.value })}
                  />
                </div>

                <div className="col-sm-6">
                  <label className="form-label small fw-bold">
                    {isAr ? 'وقت إغلاق العيادة:' : 'Daily Close Time:'}
                  </label>
                  <input
                    type="time"
                    className="form-control form-control-sm"
                    value={settings.closeTime}
                    onChange={(e) => setSettings({ ...settings, closeTime: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold">{isAr ? 'المنطقة الزمنية المعتمدة:' : 'Timezone:'}</label>
                  <input
                    type="text"
                    disabled
                    className="form-control form-control-sm bg-light"
                    value={settings.timezone}
                  />
                  <small className="text-muted d-block mt-1">
                    {isAr
                      ? 'ثابتة على Africa/Cairo لضمان حساب التوقيت بدقة بغض النظر عن موقع الزائر'
                      : 'Fixed to Africa/Cairo to prevent visitor device timezone skew'}
                  </small>
                </div>

                <div className="col-12">
                  <div className="p-3 bg-light rounded-3 border small">
                    <strong>{isAr ? 'أيام العمل الرسمية:' : 'Working Days:'}</strong>
                    <span className="d-block text-muted mt-1">
                      {isAr
                        ? 'السبت، الأحد، الإثنين، الثلاثاء، الأربعاء، الخميس (الجمعة عطلة أسبوعية مغلقة)'
                        : 'Saturday through Thursday (Friday closed)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Contact & WhatsApp Templates */}
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                <MessageSquare className="text-primary" size={20} />
                <span>{isAr ? 'قوالب وأرقام تواصل الواتساب' : 'WhatsApp Contact & Message Templates'}</span>
              </h5>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">
                    {isAr ? 'رقم هاتف العيادة:' : 'Clinic Phone:'}
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={settings.clinicPhone}
                    onChange={(e) => setSettings({ ...settings, clinicPhone: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">
                    {isAr ? 'رقم واتساب العيادة لاستقبال التأكيدات:' : 'Clinic WhatsApp Number:'}
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    dir="ltr"
                    value={settings.clinicWhatsapp}
                    onChange={(e) => setSettings({ ...settings, clinicWhatsapp: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">
                    {isAr ? 'قالب رسالة التأكيد (عربي):' : 'Confirmation Template (Arabic):'}
                  </label>
                  <textarea
                    rows={3}
                    className="form-control form-control-sm"
                    value={settings.notificationTemplates.whatsappAr}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notificationTemplates: {
                          ...settings.notificationTemplates,
                          whatsappAr: e.target.value,
                        },
                      })
                    }
                  />
                  <small className="text-muted d-block mt-1">
                    {isAr ? 'المتغيرات: {name}, {date}, {time}, {code}' : 'Variables: {name}, {date}, {time}, {code}'}
                  </small>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">
                    {isAr ? 'قالب رسالة التأكيد (English):' : 'Confirmation Template (English):'}
                  </label>
                  <textarea
                    rows={3}
                    className="form-control form-control-sm"
                    dir="ltr"
                    value={settings.notificationTemplates.whatsappEn}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notificationTemplates: {
                          ...settings.notificationTemplates,
                          whatsappEn: e.target.value,
                        },
                      })
                    }
                  />
                  <small className="text-muted d-block mt-1">Variables: {'{name}, {date}, {time}, {code}'}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="d-flex justify-content-end mt-4">
          <button
            type="submit"
            className="btn btn-primary px-5 py-2.5 rounded-pill shadow-sm d-flex align-items-center gap-2"
            disabled={isSaving || isViewer}
          >
            {isSaving ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" />
                <span>{isAr ? 'جاري الحفظ...' : 'Saving...'}</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>{isAr ? 'حفظ إعدادات الحجز' : 'Save Booking Settings'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingSettingsManager;
