import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStorageService } from '../../services/storage';
import { Star, ShieldCheck, ExternalLink, Save, Check, AlertTriangle } from 'lucide-react';

export const RatingsManager: React.FC = () => {
  const { ratings, refreshData } = useData();
  const { language } = useLanguage();
  const { role } = useAuth();
  const isAr = language === 'ar';
  const isViewer = role === 'viewer';

  const [platform, setPlatform] = useState(ratings.platform);
  const [score, setScore] = useState(ratings.score);
  const [reviewCount, setReviewCount] = useState(ratings.reviewCount);
  const [sourceUrl, setSourceUrl] = useState(ratings.sourceUrl);
  const [isVerified, setIsVerified] = useState(Boolean(ratings.isVerified));
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) return;
    const storage = getStorageService();
    await storage.updateRatings({
      platform,
      score,
      reviewCount,
      sourceUrl,
      isVerified,
    });
    await refreshData();
    setSuccessMsg(isAr ? 'تم حفظ بيانات التقييمات بنجاح!' : 'Ratings updated successfully!');
  };

  return (
    <div className="ratings-manager-page">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <Star className="text-warning" size={24} />
            <span>{isAr ? 'إدارة التقييمات والمراجعات الموثقة' : 'Ratings & Reviews Manager'}</span>
          </h2>
          <p className="text-muted small mb-0">
            {isAr
              ? 'وفقاً للقاعدة الذهبية 10: يُمنع اختلاق آراء أو شهادات مزيفة؛ يُعرض فقط التقييم الرقمي الحقيقي مع رابط المصدر.'
              : 'Rule 10: only genuine ratings with verified external link (Google Maps) allowed; no fabricated reviews.'}
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success py-2 px-3 rounded-3 small d-flex align-items-center gap-2 mb-4">
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="card rounded-4 border shadow-sm p-4 bg-white" style={{ maxWidth: '640px' }}>
        <div className="mb-3">
          <label className="form-label small fw-bold">المنصة ومصدر التقييم:</label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            disabled={isViewer}
          />
        </div>

        <div className="row g-3 mb-3">
          <div className="col-6">
            <label className="form-label small fw-bold">التقييم الرقمي (من 5.0):</label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="5"
              className="form-control form-control-sm"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              disabled={isViewer}
            />
          </div>
          <div className="col-6">
            <label className="form-label small fw-bold">عدد المراجعات المسجلة:</label>
            <input
              type="number"
              min="0"
              className="form-control form-control-sm"
              value={reviewCount}
              onChange={(e) => setReviewCount(Number(e.target.value))}
              disabled={isViewer}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-bold">رابط صفحة المراجعات على Google Maps:</label>
          <input
            type="url"
            className="form-control form-control-sm"
            dir="ltr"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            disabled={isViewer}
          />
        </div>

        <div className="form-check mb-4">
          <input
            className="form-check-input"
            type="checkbox"
            id="verifiedCheck"
            checked={isVerified}
            onChange={(e) => setIsVerified(e.target.checked)}
            disabled={isViewer}
          />
          <label className="form-check-label small" htmlFor="verifiedCheck">
            تم التحقق من صحة التقييم ومطابقته لصفحة العيادة الرسمية (Verified)
          </label>
        </div>

        <div className="pt-3 border-top text-end">
          <button
            type="submit"
            className="btn btn-primary btn-sm px-4 rounded-pill shadow-sm"
            disabled={isViewer}
          >
            <Save size={14} className="me-1" />
            <span>{isAr ? 'حفظ التقييم' : 'Save Rating'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
