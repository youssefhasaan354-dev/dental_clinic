import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStorageService } from '../../services/storage';
import {
  Inbox,
  Stethoscope,
  Users,
  Star,
  CheckSquare,
  Square,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  FileCheck,
  Globe,
  Camera,
} from 'lucide-react';

export const DashboardHome: React.FC = () => {
  const { services, doctors, settings, ratings, clinicInfo } = useData();
  const { language } = useLanguage();
  const { role } = useAuth();
  const [requestsCount, setRequestsCount] = useState(0);
  const [newRequestsCount, setNewRequestsCount] = useState(0);

  const isAr = language === 'ar';

  useEffect(() => {
    const fetchRequests = async () => {
      const storage = getStorageService();
      const reqs = await storage.getAppointmentRequests();
      setRequestsCount(reqs.length);
      setNewRequestsCount(reqs.filter((r) => r.status === 'new').length);
    };
    fetchRequests();
  }, []);

  // Go-Live Checklist state (persisted in localStorage)
  const CHECKLIST_KEY = 'hayaah_golive_checklist';
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(CHECKLIST_KEY);
      return saved
        ? JSON.parse(saved)
        : {
            logoConfirmed: false,
            realPhotosReplaced: false,
            doctorsApproved: false,
            servicesConfirmed: true,
            pricesConfirmedOrHidden: true,
            policiesReviewed: false,
            advertisingCompliant: false,
            ratingsVerified: true,
            noindexConfigured: true,
            domainConnected: false,
            whatsappTested: true,
          };
    } catch {
      return {};
    }
  });

  const toggleChecklistItem = (key: string) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(updated));
  };

  const checklistItems = [
    {
      key: 'logoConfirmed',
      labelAr: 'اعتماد الشعار الرسمي للعيادة واستبدال الشعار المؤقت',
      labelEn: 'Official clinic logo verified and updated',
      statusNote: 'مطلوب من المالك',
    },
    {
      key: 'realPhotosReplaced',
      labelAr: 'استبدال الصور التوضيحية (Sample) بصور حقيقية لمقر العيادة وغرف الكشف',
      labelEn: 'Replace illustrative sample photos with real premises photos',
      statusNote: 'مطلوب من المالك',
    },
    {
      key: 'doctorsApproved',
      labelAr: 'اعتماد أسماء وبيانات الأطباء الحقيقيين وأرقام القيد النقابي (بدون وجوه AI)',
      labelEn: 'Approve real doctors credentials, bios and real photos (no AI faces)',
      statusNote: 'مطلوب من المالك',
    },
    {
      key: 'servicesConfirmed',
      labelAr: 'تأكيد باقة الخدمات السريرية المقدمة فعلياً داخل العيادة',
      labelEn: 'Confirm clinical services actually performed at clinic',
      statusNote: 'مكتمل مبدئياً',
    },
    {
      key: 'pricesConfirmedOrHidden',
      labelAr: 'تأكيد أسعار الكشف "تبدأ من" أو إبقاؤها مخفية خلف مفتاح الأسعار العام',
      labelEn: 'Confirm "starting from" fees or keep hidden behind global toggle',
      statusNote: 'مضبوط على الإخفاء افتراضياً',
    },
    {
      key: 'policiesReviewed',
      labelAr: 'مراجعة واعتماد سياسة الخصوصية والشروط وإخلاء المسؤولية الطبية',
      labelEn: 'Review Privacy Policy, Terms and Medical Disclaimer',
      statusNote: 'مطلوب مراجعة المالك',
    },
    {
      key: 'advertisingCompliant',
      labelAr: 'تأكيد مالك العيادة على مطابقة الصياغة لقواعد الدعاية والإعلان الطبي بمصر',
      labelEn: 'Owner confirmation of compliance with Egyptian medical advertising regulations',
      statusNote: 'إلزامي قبل النشر',
    },
    {
      key: 'ratingsVerified',
      labelAr: 'ربط رابط خرائط Google Maps الرسمي للتقييمات الموثقة (4.6★)',
      labelEn: 'Link verified Google Maps business review URL',
      statusNote: 'مربوط ومفعل',
    },
    {
      key: 'noindexConfigured',
      labelAr: 'إبقاء وسم Noindex مفعلاً أثناء العرض التجريبي وإيقافه عند الإطلاق الرسمي',
      labelEn: 'Keep noindex active during demo pitch; enable index at go-live',
      statusNote: 'مفعل للأمان',
    },
    {
      key: 'whatsappTested',
      labelAr: 'اختبار رقم الاستقبال والواتساب المباشر والتأكد من استقبال الرسائل',
      labelEn: 'Test WhatsApp and direct phone click-to-call actions',
      statusNote: 'مختبر',
    },
  ];

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / checklistItems.length) * 100);

  return (
    <div className="admin-dashboard-home">
      {/* Page Title & Greeting */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1">
            {isAr ? 'لوحة تحكم عيادة حياة لطب الأسنان' : 'Hayaah Dental Clinic Dashboard'}
          </h2>
          <p className="text-muted small mb-0">
            {isAr
              ? 'مرحباً بك. يمكنك هنا إدارة المحتوى، متابعة حجوزات المرضى، واستيفاء قائمة الجاهزية للإطلاق.'
              : 'Welcome. Manage clinic content, monitor appointment requests, and track go-live readiness.'}
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Link to="/admin/requests" className="btn btn-primary btn-sm d-flex align-items-center gap-1 rounded-pill px-3 shadow-sm">
            <Inbox size={15} />
            <span>{isAr ? `الوارد (${newRequestsCount} جديد)` : `Inbox (${newRequestsCount} new)`}</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="p-3 rounded-4 bg-white border shadow-sm h-100 d-flex align-items-center gap-3">
            <div className="p-3 rounded-3 bg-light text-primary">
              <Inbox size={26} />
            </div>
            <div>
              <span className="text-muted small d-block">{isAr ? 'طلبات المواعيد الواردة' : 'Appointment Requests'}</span>
              <h3 className="h4 fw-bold text-dark mb-0">{requestsCount}</h3>
              <small className="text-success fw-semibold">
                {newRequestsCount} {isAr ? 'طلب جديد غير مقروء' : 'new unread'}
              </small>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="p-3 rounded-4 bg-white border shadow-sm h-100 d-flex align-items-center gap-3">
            <div className="p-3 rounded-3 bg-light text-info">
              <Stethoscope size={26} />
            </div>
            <div>
              <span className="text-muted small d-block">{isAr ? 'الخدمات الطبية النشطة' : 'Active Services'}</span>
              <h3 className="h4 fw-bold text-dark mb-0">{services.length}</h3>
              <small className="text-muted">
                {settings.showPrices ? (isAr ? 'عرض الأسعار: مفعّل' : 'Prices: Visible') : (isAr ? 'عرض الأسعار: مخفي' : 'Prices: Hidden')}
              </small>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="p-3 rounded-4 bg-white border shadow-sm h-100 d-flex align-items-center gap-3">
            <div className="p-3 rounded-3 bg-light text-success">
              <Users size={26} />
            </div>
            <div>
              <span className="text-muted small d-block">{isAr ? 'الكادر الطبي المقيد' : 'Doctors & Team'}</span>
              <h3 className="h4 fw-bold text-dark mb-0">{doctors.length}</h3>
              <small className="text-muted">
                {isAr ? 'نقابة أطباء الأسنان المصرية' : 'Syndicate registered'}
              </small>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="p-3 rounded-4 bg-white border shadow-sm h-100 d-flex align-items-center gap-3">
            <div className="p-3 rounded-3 bg-light text-warning">
              <Star size={26} />
            </div>
            <div>
              <span className="text-muted small d-block">{isAr ? 'تقييم خرائط Google' : 'Google Rating'}</span>
              <h3 className="h4 fw-bold text-dark mb-0">{ratings.score} ★</h3>
              <small className="text-muted">
                {ratings.reviewCount} {isAr ? 'مراجعة موثقة' : 'verified reviews'}
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Go-Live Checklist Card (Mandatory Golden Rule 6) */}
      <div className="card rounded-4 border shadow-sm overflow-hidden mb-4">
        <div className="card-header bg-white p-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <div className="d-flex align-items-center gap-2">
              <ShieldCheck className="text-success" size={22} />
              <h3 className="h5 fw-bold mb-0 text-dark">
                {isAr ? 'قائمة الجاهزية للإطلاق الرسمي (Go-Live Checklist)' : 'Go-Live Readiness Checklist'}
              </h3>
            </div>
            <p className="text-muted small mb-0 mt-1">
              {isAr
                ? 'وفقاً لمبادئ الأمانة الطبية: لا يتم إطلاق الموقع رسمياً إلا بعد استيفاء هذه البنود وتأكيدها من مالك العيادة.'
                : 'Medical ethics rules: the site must strictly verify these criteria before production go-live.'}
            </p>
          </div>

          <div className="text-end">
            <span className="badge bg-primary px-3 py-2 rounded-pill small">
              {completedCount} / {checklistItems.length} {isAr ? 'مكتمل' : 'completed'} ({progressPercent}%)
            </span>
          </div>
        </div>

        <div className="p-4 bg-white">
          <div className="progress mb-4" style={{ height: '8px' }}>
            <div
              className="progress-bar bg-success"
              role="progressbar"
              style={{ width: `${progressPercent}%` }}
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            ></div>
          </div>

          <div className="checklist-items-list d-flex flex-column gap-3">
            {checklistItems.map((item) => {
              const isChecked = Boolean(checklist[item.key]);

              return (
                <div
                  key={item.key}
                  className={`p-3 rounded-3 border d-flex align-items-center justify-content-between gap-3 ${
                    isChecked ? 'bg-light border-success-subtle' : 'bg-white'
                  }`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleChecklistItem(item.key)}
                >
                  <div className="d-flex align-items-center gap-3">
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none border-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleChecklistItem(item.key);
                      }}
                    >
                      {isChecked ? (
                        <CheckSquare className="text-success" size={20} />
                      ) : (
                        <Square className="text-muted" size={20} />
                      )}
                    </button>
                    <div>
                      <span className={`fw-semibold small ${isChecked ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>
                        {isAr ? item.labelAr : item.labelEn}
                      </span>
                    </div>
                  </div>

                  <span className="badge bg-light text-secondary border small">
                    {item.statusNote}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Launchpad & Instructions */}
      <div className="row g-3">
        <div className="col-md-6">
          <div className="p-4 rounded-4 bg-white border shadow-sm h-100">
            <h4 className="h6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <Camera size={18} className="text-primary" />
              <span>{isAr ? 'ميزة التعديل البصري المباشر (In-Place Edit)' : 'Visual In-Place Editing'}</span>
            </h4>
            <p className="text-muted small" style={{ lineHeight: '1.7' }}>
              {isAr
                ? 'بصفتك مسجلاً كمدير، يظهر زر كاميرا عائم فوق كل صورة على الموقع العام. يمكنك النقر عليه لاستبدال الصورة فوراً من جهازك، وضبط النص البديل (Alt Text) بالعربية والإنجليزية وتخزينها في قاعدة بيانات المتصفح دون قيود حجم.'
                : 'As an authenticated administrator, floating camera buttons appear directly on public page images allowing immediate in-place replacement and alt-text localization.'}
            </p>
            <Link to="/" target="_blank" className="btn btn-outline-primary btn-sm rounded-pill px-3">
              {isAr ? 'تجربة التعديل على الموقع العام ←' : 'Try on Public Site ←'}
            </Link>
          </div>
        </div>

        <div className="col-md-6">
          <div className="p-4 rounded-4 bg-white border shadow-sm h-100">
            <h4 className="h6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <Globe size={18} className="text-info" />
              <span>{isAr ? 'ربط السيرفر السحابي (Supabase Live Mode)' : 'Connecting Cloud Backend'}</span>
            </h4>
            <p className="text-muted small" style={{ lineHeight: '1.7' }}>
              {isAr
                ? 'يدعم النظام التبديل السلس للوضع الحي بمجرد تعيين VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في ملف البيئة أو في إعدادات استضافة Vercel، حيث يتم تفعيل قواعد بيانات Postgres وتخزين الملفات فوراً.'
                : 'The system switches seamlessly to live cloud mode once VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are specified in Vercel environment variables.'}
            </p>
            <Link to="/admin/versions" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
              {isAr ? 'إدارة النسخ الاحتياطية وسجلات النشاط' : 'Manage Snapshots & Audit Logs'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
