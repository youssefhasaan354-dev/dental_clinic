import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Shield, Edit3, Eye, PhoneCall, ArrowRight, ArrowLeft, Lock, Mail, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';

export const AdminLogin: React.FC = () => {
  const { loginAsDemoUser, loginWithEmail, isAuthenticated, role, isFirebaseMode, authError, clearAuthError } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  // Demo mode state
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner');

  // Email/password form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isAr = language === 'ar';

  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'receptionist') {
        navigate('/admin/requests');
      } else {
        navigate('/admin');
      }
    }
  }, [isAuthenticated, role, navigate]);

  const rolesList: {
    role: UserRole;
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
    icon: any;
    color: string;
  }[] = [
    {
      role: 'owner',
      titleAr: 'د. مالك العيادة (Owner)',
      titleEn: 'Clinic Owner (Full Admin)',
      descAr: 'صلاحيات كاملة: تعديل الخدمات، الأسعار، الهوية البصرية، قائمة الإطلاق، وإدارة النسخ الاحتياطية.',
      descEn: 'Full permissions: services, pricing, branding, go-live checklist, and version restoration.',
      icon: Shield,
      color: '#0c6674',
    },
    {
      role: 'editor',
      titleAr: 'مسؤول المحتوى (Content Editor)',
      titleEn: 'Content Editor',
      descAr: 'إدارة وتعديل النصوص، الخدمات الطبية، المقالات، الأسئلة الشائعة واستبدال الصور.',
      descEn: 'Manage medical services, educational articles, FAQs, bilingual texts, and image slots.',
      icon: Edit3,
      color: '#2ca49a',
    },
    {
      role: 'receptionist',
      titleAr: 'موظف الاستقبال (Receptionist)',
      titleEn: 'Receptionist',
      descAr: 'مخصص حصرياً لإدارة طلبات حجز المواعيد: تحديث الحالات، الملاحظات الداخلية، الاتصال بالمرضى وتصدير Excel.',
      descEn: 'Dedicated to appointment requests inbox: status updates, internal notes, patient calls, and Excel export.',
      icon: PhoneCall,
      color: '#3b82f6',
    },
    {
      role: 'viewer',
      titleAr: 'زائر تجريبي (Demo Viewer)',
      titleEn: 'Demo Viewer (Read-Only)',
      descAr: 'استعراض لوحة التحكم والإحصائيات بوضع القراءة فقط دون إمكانية حفظ أو تغيير البيانات.',
      descEn: 'Browse the admin dashboard in read-only mode to inspect architecture and reports.',
      icon: Eye,
      color: '#64748b',
    },
  ];

  const handleDemoRoleLogin = async (roleToUse: UserRole) => {
    setIsLoggingIn(true);
    setLocalError(null);
    clearAuthError();
    try {
      await loginAsDemoUser(roleToUse);
      if (roleToUse === 'receptionist') {
        navigate('/admin/requests');
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setLocalError(isAr ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter email and password');
      return;
    }

    setIsLoggingIn(true);
    setLocalError(null);
    clearAuthError();

    const res = await loginWithEmail(email, password);
    setIsLoggingIn(false);

    if (!res.success) {
      setLocalError(res.error || (isAr ? 'فشل تسجيل الدخول' : 'Login failed'));
    }
  };

  const displayedError = localError || authError;

  return (
    <div
      className="admin-login-wrapper min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{ backgroundColor: '#f0fdfa' }}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '640px', width: '100%' }}>
        <div className="p-4 p-md-5 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <span className="badge bg-light text-primary border px-3 py-2 rounded-pill fw-semibold">
              {isAr ? 'بوابة إدارة عيادة حياة لطب الأسنان' : 'Hayaah Dental Admin Portal'}
            </span>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-pill px-3"
              onClick={toggleLanguage}
            >
              {isAr ? 'English' : 'العربية'}
            </button>
          </div>

          <h2 className="fw-bold mb-2 text-dark h4">
            {isAr ? 'تسجيل دخول لوحة الإدارة' : 'Clinic Staff Login'}
          </h2>
          <p className="text-muted small mb-3">
            {isFirebaseMode
              ? (isAr ? 'وضع الإنتاج المباشر (Firebase) - يرجى تسجيل الدخول بحساب المشرف المصرح له' : 'Firebase Production Mode Active - Enter your authorized clinic staff credentials')
              : (isAr ? 'لوحة إدارة ومتابعة حجوزات عيادة حياة لطب الأسنان (الوضع التجريبي الافتراضي)' : 'Hayaah Dental Management Portal (Default Demo Mode)')}
          </p>

          {/* Error Banner */}
          {displayedError && (
            <div className="alert alert-danger d-flex align-items-start gap-2 mb-4 p-3 rounded-3 small">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-danger" />
              <span className="text-danger fw-semibold">{displayedError}</span>
            </div>
          )}

          {isFirebaseMode ? (
            /* ================= FIREBASE PRODUCTION MODE LOGIN FORM ================= */
            <form onSubmit={handleEmailPasswordSubmit} className="d-flex flex-column gap-3 mb-4">
              <div>
                <label className="form-label small fw-bold text-dark">
                  {isAr ? 'البريد الإلكتروني للمشرف *' : 'Staff Admin Email *'}
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <Mail size={16} className="text-muted" />
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0"
                    placeholder="doctor@hayaahclinic.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label small fw-bold text-dark">
                  {isAr ? 'كلمة المرور *' : 'Password *'}
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <Lock size={16} className="text-muted" />
                  </span>
                  <input
                    type="password"
                    className="form-control border-start-0"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-light rounded-3 border small text-muted">
                <span className="fw-semibold text-dark d-block mb-1">
                  {isAr ? 'ملاحظة الأمان والصلاحيات:' : 'Security & Permissions Notice:'}
                </span>
                {isAr
                  ? 'يتم التحقق من الحساب عبر Firebase Auth والتحقق الصارم من وثيقة الصلاحيات في Firestore (admins/{uid}). الحسابات غير المسجلة في وثيقة المشرفين لن يُسمح لها بالدخول.'
                  : 'Authentication is handled via Firebase Auth with strict role verification in Firestore (admins/{uid}). Unassigned accounts will be denied entry.'}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 mt-2"
                disabled={isLoggingIn}
              >
                <span>{isLoggingIn ? (isAr ? 'جاري التحقق...' : 'Authenticating...') : (isAr ? 'تسجيل الدخول' : 'Sign In')}</span>
                {isAr ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </button>
            </form>
          ) : (
            /* ================= DEMO MODE (PRESERVED EXACTLY AS BEFORE) ================= */
            <>
              {/* Demo Credentials Box */}
              <div className="alert alert-info border-info-subtle d-flex flex-column gap-1 mb-4 p-3 rounded-3 small">
                <div className="d-flex align-items-center gap-2 fw-bold text-primary">
                  <Shield size={16} />
                  <span>{isAr ? 'بيانات الحساب التجريبي المسبقة (Demo Credentials):' : 'Pre-configured Demo Credentials:'}</span>
                </div>
                <div className="d-flex flex-wrap gap-3 mt-1">
                  <div>
                    <span className="text-muted">{isAr ? 'البريد:' : 'Email:'} </span>
                    <code className="text-dark bg-white px-2 py-0.5 rounded border">admin@hayaah.demo</code>
                  </div>
                  <div>
                    <span className="text-muted">{isAr ? 'كلمة المرور:' : 'Password:'} </span>
                    <code className="text-dark bg-white px-2 py-0.5 rounded border">demo1234</code>
                  </div>
                </div>
              </div>

              <p className="text-muted small mb-3 fw-bold">
                {isAr
                  ? 'اختر الدور التجريبي المطلوب للدخول الفوري بنقرة واحدة:'
                  : 'Or select a demo role for immediate one-click entry:'}
              </p>

              <div className="role-selector-list d-flex flex-column gap-3 mb-4">
                {rolesList.map((r) => {
                  const IconComp = r.icon;
                  const isSelected = selectedRole === r.role;

                  return (
                    <div
                      key={r.role}
                      className={`p-3 rounded-3 border role-card cursor-pointer transition ${
                        isSelected ? 'border-primary bg-light shadow-sm' : 'bg-white'
                      }`}
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onClick={() => setSelectedRole(r.role)}
                    >
                      <div className="d-flex align-items-start gap-3">
                        <div
                          className="p-2 rounded-3 text-white flex-shrink-0"
                          style={{ backgroundColor: r.color }}
                        >
                          <IconComp size={22} />
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <strong className="text-dark small">
                              {isAr ? r.titleAr : r.titleEn}
                            </strong>
                            <input
                              type="radio"
                              name="roleRadio"
                              checked={isSelected}
                              onChange={() => setSelectedRole(r.role)}
                              className="form-check-input"
                            />
                          </div>
                          <p className="text-muted small mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
                            {isAr ? r.descAr : r.descEn}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                onClick={() => handleDemoRoleLogin(selectedRole)}
                disabled={isLoggingIn}
              >
                <span>{isLoggingIn ? (isAr ? 'جاري الدخول...' : 'Logging in...') : (isAr ? 'الدخول كـ ' + rolesList.find(r => r.role === selectedRole)?.titleAr : 'Enter as ' + selectedRole)}</span>
                {isAr ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </button>
            </>
          )}

          <div className="text-center mt-4 pt-3 border-top">
            <button
              type="button"
              className="btn btn-link text-decoration-none text-muted small p-0"
              onClick={() => navigate('/')}
            >
              {isAr ? '← العودة للموقع الرئيسي للعيادة' : '← Return to Clinic Public Site'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
