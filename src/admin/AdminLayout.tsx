import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useData } from '../context/DataContext';
import {
  LayoutDashboard,
  Inbox,
  Stethoscope,
  Users,
  Image as ImageIcon,
  Type,
  Layers,
  BookOpen,
  HelpCircle,
  Clock,
  Star,
  Palette,
  Search,
  QrCode,
  History,
  LogOut,
  ExternalLink,
  Globe,
  Camera,
  RotateCcw,
  Menu,
  X,
  ShieldAlert,
  UserCheck,
  Settings as SettingsIcon,
} from 'lucide-react';
import PageMeta from '../components/PageMeta/PageMeta';

export const AdminLayout: React.FC = () => {
  const { user, role, logout, isVisualEditActive, setVisualEditActive } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const { resetDemoData } = useData();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isAr = language === 'ar';

  const isReceptionist = role === 'receptionist';
  const isOwner = role === 'owner';

  const navItems = [
    {
      to: '/admin',
      labelAr: 'لوحة المؤشرات',
      labelEn: 'Dashboard Overview',
      icon: LayoutDashboard,
      allowed: ['owner', 'editor', 'viewer'],
    },
    {
      to: '/admin/requests',
      labelAr: 'المواعيد والحجوزات',
      labelEn: 'Appointments & Booking',
      icon: Inbox,
      allowed: ['owner', 'receptionist', 'viewer'],
      badge: 'مباشر',
    },
    {
      to: '/admin/patients',
      labelAr: 'سجل المرضى',
      labelEn: 'Patients Directory',
      icon: UserCheck,
      allowed: ['owner', 'receptionist', 'viewer'],
    },
    {
      to: '/admin/booking-settings',
      labelAr: 'إعدادات وقواعد الحجز',
      labelEn: 'Booking Engine Rules',
      icon: SettingsIcon,
      allowed: ['owner', 'viewer'],
    },
    {
      to: '/admin/services',
      labelAr: 'الخدمات الطبية',
      labelEn: 'Services Manager',
      icon: Stethoscope,
      allowed: ['owner', 'editor', 'viewer'],
    },
    {
      to: '/admin/doctors',
      labelAr: 'أطباء العيادة',
      labelEn: 'Doctors / Team',
      icon: Users,
      allowed: ['owner', 'editor', 'viewer'],
    },
    {
      to: '/admin/images',
      labelAr: 'مكتبة ومواضع الصور',
      labelEn: 'Image Slots & Media',
      icon: ImageIcon,
      allowed: ['owner', 'editor', 'viewer'],
    },
    {
      to: '/admin/texts',
      labelAr: 'محرر النصوص المترجمة',
      labelEn: 'Bilingual Texts',
      icon: Type,
      allowed: ['owner', 'editor', 'viewer'],
    },
    {
      to: '/admin/sections',
      labelAr: 'ترتيب وإظهار الأقسام',
      labelEn: 'Sections Manager',
      icon: Layers,
      allowed: ['owner', 'editor', 'viewer'],
    },
    {
      to: '/admin/articles',
      labelAr: 'المقالات والتوعية الطبية',
      labelEn: 'Articles & Education',
      icon: BookOpen,
      allowed: ['owner', 'editor', 'viewer'],
    },
    {
      to: '/admin/faq',
      labelAr: 'الأسئلة الشائعة',
      labelEn: 'FAQ Manager',
      icon: HelpCircle,
      allowed: ['owner', 'editor', 'viewer'],
    },
    {
      to: '/admin/locations',
      labelAr: 'المواعيد والمقر',
      labelEn: 'Hours & Location',
      icon: Clock,
      allowed: ['owner', 'editor', 'viewer'],
    },
    {
      to: '/admin/ratings',
      labelAr: 'التقييمات والمراجعات',
      labelEn: 'Ratings Manager',
      icon: Star,
      allowed: ['owner', 'viewer'],
    },
    {
      to: '/admin/branding',
      labelAr: 'الهوية والألوان (WCAG)',
      labelEn: 'Branding & Tokens',
      icon: Palette,
      allowed: ['owner', 'viewer'],
    },
    {
      to: '/admin/seo',
      labelAr: 'محركات البحث (SEO)',
      labelEn: 'SEO & Structured Data',
      icon: Search,
      allowed: ['owner', 'viewer'],
    },
    {
      to: '/admin/qr',
      labelAr: 'مولد رموز QR للاستقبال',
      labelEn: 'Reception QR Generator',
      icon: QrCode,
      allowed: ['owner', 'receptionist', 'editor', 'viewer'],
    },
    {
      to: '/admin/versions',
      labelAr: 'النسخ الاحتياطية وسجل التدقيق',
      labelEn: 'Snapshots & Audit Log',
      icon: History,
      allowed: ['owner', 'viewer'],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    role ? item.allowed.includes(role) : true
  );

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleResetData = async () => {
    if (window.confirm(isAr ? 'هل أنت متأكد من رغبتك في إعادة ضبط بيانات العرض التجريبي إلى القيم الأصلية؟' : 'Are you sure you want to reset all demo data to default?')) {
      await resetDemoData();
      alert(isAr ? 'تمت إعادة ضبط البيانات بنجاح.' : 'Demo data reset successfully.');
    }
  };

  return (
    <div className="admin-app-container d-flex flex-column min-vh-100" style={{ backgroundColor: '#f8fafc', color: '#1e293b' }}>
      <PageMeta
        title={{ ar: 'لوحة إدارة العيادة', en: 'Clinic Admin Portal' }}
        canonicalPath="/admin"
        noindex={true}
      />
      {/* Persistent Demo Warning Banner */}
      <div
        className="px-3 py-1 bg-dark text-white d-flex align-items-center justify-content-between small"
        style={{ fontSize: '0.78rem', zIndex: 1040 }}
      >
        <div className="d-flex align-items-center gap-2">
          <ShieldAlert size={14} className="text-warning" />
          <span>
            {isAr
              ? 'وضع العرض التجريبي (Demo Mode) — كافة البيانات والصور تُحفظ محلياً في متصفحك (IndexedDB + LocalStorage)'
              : 'Demo Mode Active — all edits and media stored locally in your browser'}
          </span>
        </div>
        <div className="d-flex align-items-center gap-3">
          {isOwner && (
            <button
              type="button"
              className="btn btn-outline-warning btn-xs py-0 px-2 text-white"
              style={{ fontSize: '0.72rem' }}
              onClick={handleResetData}
            >
              <RotateCcw size={11} className="me-1" />
              {isAr ? 'إعادة ضبط البيانات الأصلية' : 'Reset Demo Data'}
            </button>
          )}
        </div>
      </div>

      <div className="d-flex flex-grow-1 position-relative">
        {/* Sidebar */}
        <aside
          className={`admin-sidebar bg-white border-end d-flex flex-column ${
            mobileSidebarOpen ? 'd-flex position-fixed start-0 top-0 bottom-0 z-3 shadow' : 'd-none d-lg-flex'
          }`}
          style={{ width: '270px', minHeight: '100%', flexShrink: 0 }}
        >
          {/* Sidebar Header */}
          <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
            <div>
              <h5 className="mb-0 fw-bold text-primary" style={{ fontSize: '1.05rem' }}>
                {isAr ? 'عيادة حياة لطب الأسنان' : 'Hayaah Dental Clinic'}
              </h5>
              <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                {isAr ? 'لوحة التحكم الإدارية' : 'Administrative Dashboard'}
              </small>
            </div>
            {mobileSidebarOpen && (
              <button
                type="button"
                className="btn btn-sm btn-link p-0 text-muted d-lg-none d-flex align-items-center justify-content-center"
                style={{ width: '44px', height: '44px', minWidth: '44px', minHeight: '44px' }}
                aria-label={isAr ? 'إغلاق القائمة' : 'Close menu'}
                onClick={() => setMobileSidebarOpen(false)}
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="p-3 bg-light border-bottom">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <strong className="d-block small text-dark">{user?.name}</strong>
                <span className="badge bg-primary text-white" style={{ fontSize: '0.68rem' }}>
                  {role?.toUpperCase()}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm p-1 rounded-circle"
                onClick={handleLogout}
                title={isAr ? 'تسجيل الخروج' : 'Logout'}
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>

          {/* Nav Items List */}
          <div className="p-2 flex-grow-1 overflow-y-auto">
            <nav className="nav flex-column gap-1">
              {filteredNavItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/admin'}
                    className={({ isActive }) =>
                      `nav-link d-flex align-items-center justify-content-between px-3 py-2 rounded-3 text-decoration-none small transition ${
                        isActive
                          ? 'bg-primary text-white fw-bold shadow-sm'
                          : 'text-secondary hover-bg-light'
                      }`
                    }
                    onClick={() => setMobileSidebarOpen(false)}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <IconComponent size={17} />
                      <span>{isAr ? item.labelAr : item.labelEn}</span>
                    </div>
                    {item.badge && (
                      <span className="badge bg-warning text-dark" style={{ fontSize: '0.65rem' }}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Quick Exit to Public Site */}
          <div className="p-3 border-top mt-auto bg-light">
            <Link
              to="/"
              target="_blank"
              className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
            >
              <ExternalLink size={14} />
              <span>{isAr ? 'معاينة الموقع العام' : 'Preview Public Site'}</span>
            </Link>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay Backdrop */}
        {mobileSidebarOpen && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
            style={{ zIndex: 2 }}
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main Workspace */}
        <div className="flex-grow-1 d-flex flex-column overflow-hidden">
          {/* Top Navbar */}
          <header className="bg-white border-bottom px-3 py-2 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-lg-none d-flex align-items-center justify-content-center p-0"
                style={{ width: '44px', height: '44px', minWidth: '44px', minHeight: '44px' }}
                aria-label={isAr ? 'فتح القائمة الجانبية' : 'Open menu'}
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu size={20} />
              </button>
              <span className="text-muted small d-none d-md-inline">
                {isAr ? 'نظام إدارة العيادة • فريد سميكة، مصر الجديدة' : 'Clinic CMS • Heliopolis, Cairo'}
              </span>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                onClick={() => setVisualEditActive(!isVisualEditActive)}
                className={`btn btn-sm d-flex align-items-center gap-1 rounded-pill px-3 ${
                  isVisualEditActive ? 'btn-success text-white' : 'btn-outline-secondary'
                }`}
                style={{ fontSize: '0.78rem' }}
                title="تفعيل/تعطيل زر تعديل الصور السريع على الموقع العام"
              >
                <Camera size={14} />
                <span>{isAr ? (isVisualEditActive ? 'التعديل البصري: مفعّل' : 'التعديل البصري: معطّل') : 'Visual Edit'}</span>
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                onClick={toggleLanguage}
                style={{ fontSize: '0.78rem' }}
              >
                <Globe size={14} />
                <span>{isAr ? 'English' : 'العربية'}</span>
              </button>
            </div>
          </header>

          {/* Workspace Body */}
          <main className="flex-grow-1 p-3 p-md-4 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
