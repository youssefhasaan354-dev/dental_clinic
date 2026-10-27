import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStorageService } from '../../services/storage';
import { Palette, Check, AlertCircle, Eye, ShieldCheck, Sun } from 'lucide-react';

export const BrandingManager: React.FC = () => {
  const { settings, refreshData } = useData();
  const { language } = useLanguage();
  const { role } = useAuth();
  const isAr = language === 'ar';
  const isViewer = role === 'viewer';

  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor || '#0E5C2F');
  const [secondaryColor, setSecondaryColor] = useState(settings.secondaryColor || '#7AC143');
  const [accentColor, setAccentColor] = useState(settings.accentColor || '#EEF4F0');
  const [showPrices, setShowPrices] = useState(Boolean(settings.showPrices));
  const [showBeforeAfter, setShowBeforeAfter] = useState(Boolean(settings.showBeforeAfter));
  const [showAnnouncement, setShowAnnouncement] = useState(Boolean(settings.showAnnouncement));
  const [announcementAr, setAnnouncementAr] = useState(settings.announcementText?.ar || '');
  const [announcementEn, setAnnouncementEn] = useState(settings.announcementText?.en || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Simple WCAG Contrast Ratio Calculator
  const getLuminance = (hex: string) => {
    const rgb = hex.replace('#', '').match(/.{2}/g)?.map((x) => parseInt(x, 16) / 255) || [0, 0, 0];
    const a = rgb.map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  };

  const getContrastRatio = (hex1: string, hex2: string) => {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    return Math.round(ratio * 10) / 10;
  };

  const contrastWhite = getContrastRatio(primaryColor, '#ffffff');
  const isContrastPass = contrastWhite >= 4.5;

  const handleSave = async () => {
    if (isViewer) return;
    setIsSaving(true);
    setSuccessMsg('');

    try {
      const storage = getStorageService();
      await storage.updateSettings({
        primaryColor,
        secondaryColor,
        accentColor,
        showPrices,
        showBeforeAfter,
        showAnnouncement,
        announcementText: { ar: announcementAr, en: announcementEn },
      });

      // Update root css variables dynamically
      document.documentElement.style.setProperty('--primary-color', primaryColor);
      document.documentElement.style.setProperty('--secondary-color', secondaryColor);

      await refreshData();
      setSuccessMsg(isAr ? 'تم حفظ إعدادات الهوية والألوان والمفاتيح العامة بنجاح!' : 'Branding settings saved successfully!');
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="branding-manager-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <Palette className="text-primary" size={24} />
            <span>{isAr ? 'الهوية البصرية والألوان ومفاتيح العرض' : 'Branding & Feature Toggles'}</span>
          </h2>
          <p className="text-muted small mb-0">
            {isAr
              ? 'تخصيص لوحة الألوان مع مدقق التباين WCAG AA، ومفاتيح عرض الأسعار وحالات الحالات السريرية.'
              : 'Design system tokens, WCAG contrast verification, and critical clinical feature toggles.'}
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success py-2 px-3 rounded-3 small d-flex align-items-center gap-2 mb-4">
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="row g-4">
        {/* Colors & Tokens Column */}
        <div className="col-lg-6">
          <div className="card rounded-4 border shadow-sm p-4 bg-white mb-4">
            <h5 className="h6 fw-bold mb-3 text-dark">{isAr ? 'رموز الألوان الأساسية (Design Tokens):' : 'Color Tokens:'}</h5>

            {/* Primary Color */}
            <div className="mb-3">
              <label className="form-label small fw-bold d-flex justify-content-between">
                <span>{isAr ? 'اللون الأساسي (Primary Accent):' : 'Primary Color:'}</span>
                <code>{primaryColor}</code>
              </label>
              <div className="d-flex align-items-center gap-3">
                <input
                  type="color"
                  className="form-control form-control-color border-0"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div className="mb-3">
              <label className="form-label small fw-bold d-flex justify-content-between">
                <span>{isAr ? 'اللون الثانوي (Secondary Teal):' : 'Secondary Color:'}</span>
                <code>{secondaryColor}</code>
              </label>
              <div className="d-flex align-items-center gap-3">
                <input
                  type="color"
                  className="form-control form-control-color border-0"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                />
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                />
              </div>
            </div>

            {/* WCAG Contrast Checker Alert */}
            <div className={`p-3 rounded-3 border mb-3 ${isContrastPass ? 'bg-light border-success-subtle' : 'bg-warning-subtle border-warning'}`}>
              <div className="d-flex align-items-center justify-content-between mb-1">
                <strong className="small text-dark">
                  {isAr ? 'فحص تباين سهولة النفاذ (WCAG AA Contrast):' : 'WCAG AA Accessibility:'}
                </strong>
                <span className={`badge ${isContrastPass ? 'bg-success' : 'bg-danger'}`}>
                  {contrastWhite}:1 {isContrastPass ? 'Pass (مطابق للمعايير)' : 'Fail (ضعيف)'}
                </span>
              </div>
              <small className="text-muted d-block" style={{ fontSize: '0.78rem' }}>
                {isAr
                  ? 'يتطلب معيار WCAG 2.1 AA نسبة تباين لا تقل عن 4.5:1 للنصوص العادية مقابل الخلفية البيضاء لضمان راحة القراءة للمرضى.'
                  : 'WCAG AA requires a 4.5:1 contrast ratio against white background for readable typography.'}
              </small>
            </div>

            {/* Live Token Preview */}
            <div className="p-3 rounded-3 border bg-light">
              <span className="small text-muted d-block mb-2">{isAr ? 'معاينة حية للزر التفاعلي:' : 'Live Button Preview:'}</span>
              <button
                type="button"
                className="btn text-white w-100 rounded-pill py-2 shadow-sm fw-bold"
                style={{ backgroundColor: primaryColor }}
              >
                {isAr ? 'طلب موعد كشف في عيادة حياة' : 'Request Appointment Button'}
              </button>
            </div>
          </div>
        </div>

        {/* Feature Switches & Ethical Toggles Column */}
        <div className="col-lg-6">
          <div className="card rounded-4 border shadow-sm p-4 bg-white mb-4">
            <h5 className="h6 fw-bold mb-3 text-dark">{isAr ? 'مفاتيح القواعد الذهبية والشفافية الطبية:' : 'Golden Rules Toggles:'}</h5>

            {/* Price Visibility Switch per Rule 11 */}
            <div className="p-3 rounded-3 border bg-light mb-3">
              <div className="form-check form-switch mb-1">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showPricesSwitch"
                  checked={showPrices}
                  onChange={(e) => setShowPrices(e.target.checked)}
                />
                <label className="form-check-label fw-bold small" htmlFor="showPricesSwitch">
                  {isAr ? 'إظهار الأسعار الاسترشادية ("تبدأ من") على الموقع' : 'Show "Starting from" Indicative Fees'}
                </label>
              </div>
              <small className="text-muted d-block ps-4" style={{ fontSize: '0.76rem' }}>
                {isAr
                  ? 'وفقاً للقاعدة الذهبية 11: تكون الأسعار مخفية افتراضياً، وإذا تم تفعيلها تظهر بصيغة "تبدأ من" فقط مع إشعار بأن التكلفة النهائية تتحدد بالفحص.'
                  : 'Rule 11: hidden by default. If enabled, always formatted as "starting from" with doctor examination notice.'}
              </small>
            </div>

            {/* Before / After Gallery Switch per Rule 9 */}
            <div className="p-3 rounded-3 border bg-light mb-3">
              <div className="form-check form-switch mb-1">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showBeforeAfterSwitch"
                  checked={showBeforeAfter}
                  onChange={(e) => setShowBeforeAfter(e.target.checked)}
                />
                <label className="form-check-label fw-bold small" htmlFor="showBeforeAfterSwitch">
                  {isAr ? 'تفعيل معرض الحالات السريرية (Before & After)' : 'Enable Clinical Before & After Section'}
                </label>
              </div>
              <small className="text-muted d-block ps-4" style={{ fontSize: '0.76rem' }}>
                {isAr
                  ? 'وفقاً للقاعدة الذهبية 9: معطل افتراضياً ولا يُسمح بتفعيله إلا بوجود موافقة كتابية صريحة وموثقة من المرضى واعتماد الإدارة.'
                  : 'Rule 9: OFF by default. Strictly requires documented patient written consent and owner verification.'}
              </small>
            </div>

            {/* Announcement Banner */}
            <div className="p-3 rounded-3 border bg-light mb-3">
              <div className="form-check form-switch mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showAnnouncementSwitch"
                  checked={showAnnouncement}
                  onChange={(e) => setShowAnnouncement(e.target.checked)}
                />
                <label className="form-check-label fw-bold small" htmlFor="showAnnouncementSwitch">
                  {isAr ? 'تفعيل شريط الإعلانات والمواعيد الخاصة' : 'Enable Top Announcement Banner'}
                </label>
              </div>

              {showAnnouncement && (
                <div className="mt-2">
                  <input
                    type="text"
                    className="form-control form-control-sm mb-2"
                    placeholder="نص الإعلان (عربي) - مثل: مواعيد شهر رمضان المبارك"
                    value={announcementAr}
                    onChange={(e) => setAnnouncementAr(e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    dir="ltr"
                    placeholder="Announcement text (English)"
                    value={announcementEn}
                    onChange={(e) => setAnnouncementEn(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="pt-3 border-top text-end">
              <button
                type="button"
                className="btn btn-primary btn-sm px-4 rounded-pill shadow-sm"
                onClick={handleSave}
                disabled={isSaving || isViewer}
              >
                {isSaving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ إعدادات الهوية' : 'Save Settings')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
