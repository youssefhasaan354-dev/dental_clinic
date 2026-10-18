import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStorageService } from '../../services/storage';
import { Type, Save, Check, AlertTriangle } from 'lucide-react';

export const TextsManager: React.FC = () => {
  const { clinicInfo, refreshData } = useData();
  const { language } = useLanguage();
  const { role } = useAuth();
  const isAr = language === 'ar';
  const isViewer = role === 'viewer';

  const [texts, setTexts] = useState({
    clinicNameAr: clinicInfo.name.ar,
    clinicNameEn: clinicInfo.name.en,
    taglineAr: clinicInfo.tagline.ar,
    taglineEn: clinicInfo.tagline.en,
    disclaimerAr: clinicInfo.disclaimer.ar,
    disclaimerEn: clinicInfo.disclaimer.en,
    emergencyNoticeAr: clinicInfo.emergencyNotice.ar,
    emergencyNoticeEn: clinicInfo.emergencyNotice.en,
    addressAr: clinicInfo.address.ar,
    addressEn: clinicInfo.address.en,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) {
      alert(isAr ? 'عفواً، لا يمكن الحفظ في وضع العرض فقط.' : 'Read-only mode.');
      return;
    }

    setIsSaving(true);
    setSuccessMsg('');

    try {
      const storage = getStorageService();
      await storage.updateClinicInfo({
        name: { ar: texts.clinicNameAr, en: texts.clinicNameEn },
        tagline: { ar: texts.taglineAr, en: texts.taglineEn },
        disclaimer: { ar: texts.disclaimerAr, en: texts.disclaimerEn },
        emergencyNotice: { ar: texts.emergencyNoticeAr, en: texts.emergencyNoticeEn },
        address: { ar: texts.addressAr, en: texts.addressEn },
      });

      await refreshData();
      setSuccessMsg(isAr ? 'تم حفظ النصوص ثنائية اللغة وتحديثها بنجاح!' : 'Texts saved successfully!');
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="texts-manager-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <Type className="text-primary" size={24} />
            <span>{isAr ? 'محرر النصوص المترجمة (AR + EN جنباً إلى جنب)' : 'Bilingual Texts Editor'}</span>
          </h2>
          <p className="text-muted small mb-0">
            {isAr
              ? 'تعديل كافة العبارات الرئيسية والرسائل التوعوية باللغتين العربية والإنجليزية مع تنبيهات الترجمة المفقودة.'
              : 'Side-by-side localization manager ensuring complete translation coverage.'}
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success py-2 px-3 rounded-3 small d-flex align-items-center gap-2 mb-4">
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="card rounded-4 border shadow-sm p-4 bg-white">
        {/* Clinic Name */}
        <div className="mb-4 pb-3 border-bottom">
          <label className="form-label fw-bold text-dark small mb-2">
            {isAr ? 'اسم العيادة الرسمي:' : 'Official Clinic Name:'}
          </label>
          <div className="row g-3">
            <div className="col-md-6">
              <span className="small text-muted d-block mb-1">اللغة العربية (RTL):</span>
              <input
                type="text"
                className="form-control form-control-sm"
                value={texts.clinicNameAr}
                onChange={(e) => setTexts({ ...texts, clinicNameAr: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <span className="small text-muted d-block mb-1">English (LTR):</span>
              <input
                type="text"
                className="form-control form-control-sm"
                dir="ltr"
                value={texts.clinicNameEn}
                onChange={(e) => setTexts({ ...texts, clinicNameEn: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="mb-4 pb-3 border-bottom">
          <label className="form-label fw-bold text-dark small mb-2">
            {isAr ? 'شعار العيادة والعبارة الترويجية (Tagline):' : 'Clinic Tagline:'}
          </label>
          <div className="row g-3">
            <div className="col-md-6">
              <span className="small text-muted d-block mb-1">العربية:</span>
              <textarea
                rows={2}
                className="form-control form-control-sm"
                value={texts.taglineAr}
                onChange={(e) => setTexts({ ...texts, taglineAr: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <span className="small text-muted d-block mb-1">English:</span>
              <textarea
                rows={2}
                className="form-control form-control-sm"
                dir="ltr"
                value={texts.taglineEn}
                onChange={(e) => setTexts({ ...texts, taglineEn: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="mb-4 pb-3 border-bottom">
          <label className="form-label fw-bold text-dark small mb-2">
            {isAr ? 'عنوان المقر والفرع:' : 'Clinic Address:'}
          </label>
          <div className="row g-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control form-control-sm"
                value={texts.addressAr}
                onChange={(e) => setTexts({ ...texts, addressAr: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control form-control-sm"
                dir="ltr"
                value={texts.addressEn}
                onChange={(e) => setTexts({ ...texts, addressEn: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Medical Disclaimer per Rule 13 */}
        <div className="mb-4 pb-3 border-bottom">
          <label className="form-label fw-bold text-dark small mb-2 d-flex align-items-center gap-1">
            <span>{isAr ? 'إخلاء المسؤولية الطبية بالموقع (Medical Disclaimer):' : 'Medical Disclaimer:'}</span>
            <span className="badge bg-warning text-dark small" style={{ fontSize: '0.68rem' }}>إلزامي</span>
          </label>
          <div className="row g-3">
            <div className="col-md-6">
              <textarea
                rows={2}
                className="form-control form-control-sm"
                value={texts.disclaimerAr}
                onChange={(e) => setTexts({ ...texts, disclaimerAr: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <textarea
                rows={2}
                className="form-control form-control-sm"
                dir="ltr"
                value={texts.disclaimerEn}
                onChange={(e) => setTexts({ ...texts, disclaimerEn: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        {/* National Emergency Directive per Rule 14 */}
        <div className="mb-4">
          <label className="form-label fw-bold text-dark small mb-2 d-flex align-items-center gap-1">
            <span>{isAr ? 'تنبيه الطوارئ الوطنية (National Emergency Ambulance 123):' : 'National Emergency Notice:'}</span>
            <span className="badge bg-danger small" style={{ fontSize: '0.68rem' }}>إلزامي</span>
          </label>
          <div className="row g-3">
            <div className="col-md-6">
              <textarea
                rows={2}
                className="form-control form-control-sm"
                value={texts.emergencyNoticeAr}
                onChange={(e) => setTexts({ ...texts, emergencyNoticeAr: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <textarea
                rows={2}
                className="form-control form-control-sm"
                dir="ltr"
                value={texts.emergencyNoticeEn}
                onChange={(e) => setTexts({ ...texts, emergencyNoticeEn: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end pt-3 border-top">
          <button
            type="submit"
            className="btn btn-primary btn-sm px-4 rounded-pill d-flex align-items-center gap-2 shadow-sm"
            disabled={isSaving || isViewer}
          >
            <Save size={15} />
            <span>{isSaving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ النصوص' : 'Save Texts')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
