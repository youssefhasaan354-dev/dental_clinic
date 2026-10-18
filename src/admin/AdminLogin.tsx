import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Shield, UserCheck, Edit3, Eye, PhoneCall, ArrowRight, ArrowLeft } from 'lucide-react';
import { UserRole } from '../types';

export const AdminLogin: React.FC = () => {
  const { loginAsDemoUser, isAuthenticated } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const isAr = language === 'ar';

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

  const handleLogin = async (roleToUse: UserRole) => {
    setIsLoggingIn(true);
    await loginAsDemoUser(roleToUse);
    setIsLoggingIn(false);
    if (roleToUse === 'receptionist') {
      navigate('/admin/requests');
    } else {
      navigate('/admin');
    }
  };

  return (
    <div
      className="admin-login-wrapper min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{ backgroundColor: '#f0fdfa' }}
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
            {isAr
              ? 'لوحة إدارة ومتابعة حجوزات عيادة حياة لطب الأسنان'
              : 'Management and appointment tracking portal for Hayaah Dental Clinic'}
          </p>

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
            onClick={() => handleLogin(selectedRole)}
            disabled={isLoggingIn}
          >
            <span>{isLoggingIn ? (isAr ? 'جاري الدخول...' : 'Logging in...') : (isAr ? 'الدخول كـ ' + rolesList.find(r => r.role === selectedRole)?.titleAr : 'Enter as ' + selectedRole)}</span>
            {isAr ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
          </button>

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
