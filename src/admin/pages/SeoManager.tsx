import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStorageService } from '../../services/storage';
import { Search, Globe, Code, ShieldAlert, Check, Copy } from 'lucide-react';

export const SeoManager: React.FC = () => {
  const { clinicInfo, doctors, settings, refreshData } = useData();
  const { language } = useLanguage();
  const { role } = useAuth();
  const isAr = language === 'ar';
  const isViewer = role === 'viewer';

  const [noindex, setNoindex] = useState(Boolean(settings.noindex));
  const [siteUrl, setSiteUrl] = useState(import.meta.env.VITE_SITE_URL || 'https://dentallclinic.vercel.app');
  const [copiedJson, setCopiedJson] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Generate Real Schema.org JSON-LD (Dentist + Physicians)
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: clinicInfo.name.ar,
    alternateName: clinicInfo.name.en,
    url: siteUrl,
    logo: `${siteUrl}/assets/logo.svg`,
    image: `${siteUrl}/assets/banner/1.png`,
    telephone: clinicInfo.phone,
    priceRange: '$$',
    medicalSpecialty: 'Dentistry',
    address: {
      '@type': 'PostalAddress',
      streetAddress: clinicInfo.address.ar,
      addressLocality: 'Heliopolis',
      addressRegion: 'Cairo',
      addressCountry: 'EG',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: clinicInfo.coordinates.lat,
      longitude: clinicInfo.coordinates.lng,
    },
    openingHoursSpecification: clinicInfo.regularHours
      .filter((h) => !h.isClosed)
      .map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.dayEn,
        opens: h.open,
        closes: h.close,
      })),
    sameAs: [
      clinicInfo.socialLinks.facebook,
      clinicInfo.socialLinks.instagram,
      clinicInfo.mapDirectionsUrl,
    ].filter(Boolean),
    employee: doctors.map((doc) => ({
      '@type': 'Physician',
      name: doc.name.ar,
      medicalSpecialty: doc.specialty.ar,
    })),
  };

  const jsonLdString = JSON.stringify(jsonLdData, null, 2);

  const handleCopyJsonLd = () => {
    navigator.clipboard.writeText(jsonLdString);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleSaveSeo = async () => {
    if (isViewer) return;
    const storage = getStorageService();
    await storage.updateSettings({ noindex });
    await refreshData();
    setSuccessMsg(isAr ? 'تم حفظ إعدادات محركات البحث ووسم Noindex بنجاح!' : 'SEO settings saved!');
  };

  return (
    <div className="seo-manager-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <Search className="text-primary" size={24} />
            <span>{isAr ? 'محركات البحث (SEO) والبيانات المنظمة (JSON-LD)' : 'SEO & Structured Data'}</span>
          </h2>
          <p className="text-muted small mb-0">
            {isAr
              ? 'ضبط وسم الحجب المؤقت Noindex، وتوليد كود Schema.org المعتمد طبياً لعيادات الأسنان وفق المعايير العالمية.'
              : 'Configure search engine indexing, Open Graph tags, and Schema.org Dentist JSON-LD.'}
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success py-2 px-3 rounded-3 small d-flex align-items-center gap-2 mb-4">
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Noindex Safeguard Toggle per Golden Rule 3 */}
      <div className={`p-4 rounded-4 border shadow-sm mb-4 ${noindex ? 'bg-warning-subtle border-warning' : 'bg-success-subtle border-success'}`}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <ShieldAlert size={28} className={noindex ? 'text-warning' : 'text-success'} />
            <div>
              <h5 className="h6 fw-bold mb-1 text-dark">
                {isAr ? 'وسم حجب الفهرسة (Noindex / Nofollow):' : 'Indexation Safeguard:'}
              </h5>
              <p className="text-muted small mb-0">
                {noindex
                  ? (isAr
                    ? 'الموقع محجوب حالياً عن جوجل ومحركات البحث (موصى به أثناء فترة العرض لمالك العيادة قبل الإطلاق).'
                    : 'Search engines are currently disallowed from indexing this demo (recommended prior to launch).')
                  : (isAr
                    ? 'الموقع مفتوح للفهرسة الرسمية والأرشفة على جوجل ومحركات البحث.'
                    : 'The site is open for production search engine indexing.')}
              </p>
            </div>
          </div>

          <div className="form-check form-switch fs-5">
            <input
              className="form-check-input"
              type="checkbox"
              id="noindexSwitch"
              checked={noindex}
              onChange={(e) => setNoindex(e.target.checked)}
              disabled={isViewer}
            />
          </div>
        </div>

        <div className="text-end mt-3 pt-2 border-top">
          <button
            type="button"
            className="btn btn-primary btn-sm rounded-pill px-4"
            onClick={handleSaveSeo}
            disabled={isViewer}
          >
            {isAr ? 'حفظ إعدادات الفهرسة' : 'Save Indexing Setting'}
          </button>
        </div>
      </div>

      {/* Structured Data JSON-LD Box */}
      <div className="card rounded-4 border shadow-sm p-4 bg-white mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <Code className="text-primary" size={20} />
            <h5 className="h6 fw-bold mb-0 text-dark">
              {isAr ? 'كود البيانات المنظمة المعتمد (Schema.org / Dentist):' : 'Structured Data (JSON-LD):'}
            </h5>
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 rounded-pill px-3"
            onClick={handleCopyJsonLd}
          >
            <Copy size={14} />
            <span>{copiedJson ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الكود' : 'Copy Code')}</span>
          </button>
        </div>

        <p className="text-muted small mb-3">
          {isAr
            ? 'يتم حقن هذا الكود تلقائياً في رأس صفحات الموقع لتغذية محرك بحث Google ببيانات العيادة ومواعيد العمل والأطباء المعتمدين.'
            : 'Automatically injected into head tags to provide search engines with verified clinic and physician metadata.'}
        </p>

        <pre
          className="p-3 bg-dark text-light rounded-3 small overflow-x-auto mb-0"
          dir="ltr"
          style={{ fontSize: '0.78rem', maxHeight: '350px' }}
        >
          {jsonLdString}
        </pre>
      </div>
    </div>
  );
};
