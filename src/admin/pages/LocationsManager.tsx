import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStorageService } from '../../services/storage';
import { ClinicHours } from '../../types';
import { Clock, MapPin, Save, Check, AlertCircle } from 'lucide-react';

export const LocationsManager: React.FC = () => {
  const { clinicInfo, refreshData } = useData();
  const { language } = useLanguage();
  const { role } = useAuth();
  const isAr = language === 'ar';
  const isViewer = role === 'viewer';

  const [hours, setHours] = useState<ClinicHours[]>(clinicInfo.regularHours);
  const [emergencyNoteAr, setEmergencyNoteAr] = useState(clinicInfo.emergencyHoursNote.ar);
  const [emergencyNoteEn, setEmergencyNoteEn] = useState(clinicInfo.emergencyHoursNote.en);
  const [phone, setPhone] = useState(clinicInfo.phone);
  const [whatsapp, setWhatsapp] = useState(clinicInfo.whatsapp);
  const [mapUrl, setMapUrl] = useState(clinicInfo.mapDirectionsUrl);
  const [successMsg, setSuccessMsg] = useState('');

  const handleHourChange = (index: number, field: keyof ClinicHours, value: any) => {
    setHours((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) return;
    const storage = getStorageService();
    await storage.updateClinicInfo({
      regularHours: hours,
      emergencyHoursNote: { ar: emergencyNoteAr, en: emergencyNoteEn },
      phone,
      whatsapp,
      mapDirectionsUrl: mapUrl,
    });
    await refreshData();
    setSuccessMsg(isAr ? 'تم حفظ مواعيد العمل وبيانات التواصل بنجاح!' : 'Hours and contact info saved!');
  };

  return (
    <div className="locations-manager-page">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <Clock className="text-primary" size={24} />
            <span>{isAr ? 'مواعيد العمل الرسمية والطوارئ والمقر' : 'Hours & Locations Manager'}</span>
          </h2>
          <p className="text-muted small mb-0">
            {isAr
              ? 'تعديل جدول ساعات العمل اليومية، مواعيد طوارئ الألم الحاد، ورابط اتجاهات خرائط جوجل.'
              : 'Configure clinic operating hours, emergency availability, and Google Maps direction link.'}
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success py-2 px-3 rounded-3 small d-flex align-items-center gap-2 mb-4">
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="row g-4">
          {/* Operating Hours Column */}
          <div className="col-lg-7">
            <div className="card rounded-4 border shadow-sm p-4 bg-white mb-4">
              <h5 className="h6 fw-bold mb-3 text-dark">{isAr ? 'جدول مواعيد العمل الأسبوعية:' : 'Weekly Schedule:'}</h5>

              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>{isAr ? 'اليوم' : 'Day'}</th>
                      <th>{isAr ? 'فتح' : 'Opens'}</th>
                      <th>{isAr ? 'إغلاق' : 'Closes'}</th>
                      <th>{isAr ? 'عطلة مغلق' : 'Closed'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hours.map((h, idx) => (
                      <tr key={idx}>
                        <td className="fw-semibold small">{isAr ? h.dayAr : h.dayEn}</td>
                        <td>
                          <input
                            type="time"
                            className="form-control form-control-sm"
                            value={h.open}
                            disabled={h.isClosed || isViewer}
                            onChange={(e) => handleHourChange(idx, 'open', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="time"
                            className="form-control form-control-sm"
                            value={h.close}
                            disabled={h.isClosed || isViewer}
                            onChange={(e) => handleHourChange(idx, 'close', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={Boolean(h.isClosed)}
                            disabled={isViewer}
                            onChange={(e) => handleHourChange(idx, 'isClosed', e.target.checked)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Contact Numbers & Emergency Column */}
          <div className="col-lg-5">
            <div className="card rounded-4 border shadow-sm p-4 bg-white mb-4">
              <h5 className="h6 fw-bold mb-3 text-dark">{isAr ? 'أرقام الاتصال والخرائط:' : 'Contact & Maps:'}</h5>

              <div className="mb-3">
                <label className="form-label small fw-bold">هاتف العيادة الأرضي (Cairo Landline):</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">رقم واتساب المباشر:</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  dir="ltr"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">رابط اتجاهات خرائط جوجل (Google Maps Link):</label>
                <input
                  type="url"
                  className="form-control form-control-sm"
                  dir="ltr"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">ملاحظة طوارئ الألم الحاد (عربي):</label>
                <textarea
                  rows={2}
                  className="form-control form-control-sm"
                  value={emergencyNoteAr}
                  onChange={(e) => setEmergencyNoteAr(e.target.value)}
                />
              </div>

              <div className="pt-3 border-top text-end">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm px-4 rounded-pill shadow-sm"
                  disabled={isViewer}
                >
                  <Save size={14} className="me-1" />
                  <span>{isAr ? 'حفظ المواعيد' : 'Save Hours'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
