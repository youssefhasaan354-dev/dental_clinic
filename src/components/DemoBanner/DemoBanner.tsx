import React, { useState } from 'react';
import { Info, X, ShieldAlert, Settings } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export const DemoBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const { language } = useLanguage();
  const { isAuthenticated, user, isVisualEditActive, setVisualEditActive } = useAuth();

  if (isDismissed) return null;

  return (
    <div
      className="demo-preview-banner py-2 px-3 text-white d-flex align-items-center justify-content-between position-relative"
      style={{
        backgroundColor: '#073b43',
        borderBottom: '1px solid rgba(255,255,255,0.15)',
        fontSize: '0.82rem',
        zIndex: 1050,
      }}
    >
      <div className="container-fluid d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-warning text-dark fw-bold px-2 py-1">
            {language === 'ar' ? 'معاينة تجريبية' : 'Demo Preview'}
          </span>
          <span>
            {language === 'ar'
              ? 'المحتوى والصور لأغراض العرض التوضيحي لمالك العيادة • النماذج تعمل في وضع التجربة وتُحفظ محلياً'
              : 'Illustrative preview demo for clinic review • Forms operate in demo mode and save locally'}
          </span>
        </div>

        <div className="d-flex align-items-center gap-3">
          {isAuthenticated ? (
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-light text-dark">
                {user?.name} ({user?.role})
              </span>
              <button
                type="button"
                className={`btn btn-xs py-0 px-2 rounded ${
                  isVisualEditActive ? 'btn-success text-white' : 'btn-outline-light'
                }`}
                style={{ fontSize: '0.75rem' }}
                onClick={() => setVisualEditActive(!isVisualEditActive)}
              >
                {language === 'ar'
                  ? isVisualEditActive
                    ? 'وضع تعديل الصور: مفعّل'
                    : 'وضع تعديل الصور: معطّل'
                  : isVisualEditActive
                  ? 'Visual Edit: ON'
                  : 'Visual Edit: OFF'}
              </button>
              <Link to="/admin" className="btn btn-outline-light btn-xs py-0 px-2" style={{ fontSize: '0.75rem' }}>
                <Settings size={12} className="me-1" />
                {language === 'ar' ? 'لوحة الإدارة' : 'Admin'}
              </Link>
            </div>
          ) : (
            <Link to="/admin/login" className="text-warning text-decoration-none fw-semibold">
              {language === 'ar' ? 'تسجيل دخول الإدارة (Admin Demo)' : 'Admin Demo Login'}
            </Link>
          )}

          <button
            type="button"
            className="btn btn-link text-white p-0 ms-2"
            onClick={() => setIsDismissed(true)}
            title={language === 'ar' ? 'إغلاق الإشعار' : 'Dismiss banner'}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
