import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ShieldCheck, Lock, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta/PageMeta';

export const PrivacyPolicy: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="privacy-page py-5" style={{ backgroundColor: '#f8fafc', minHeight: '80vh' }}>
      <PageMeta
        title={{
          ar: 'سياسة الخصوصية وحماية بيانات المرضى',
          en: 'Privacy & Patient Data Protection Policy',
        }}
        description={{
          ar: 'سياسة الخصوصية وسرية البيانات الصحية لمرضى عيادة حياة لطب الأسنان وضوابط الاحتفاظ بسجلات المواعيد.',
          en: 'Privacy policy and patient health data protection at Hayaah Dental Clinic.',
        }}
        canonicalPath="/privacy"
      />
      <div className="container" style={{ maxWidth: '860px' }}>
        <div className="mb-4">
          <Link to="/" className="text-decoration-none d-inline-flex align-items-center gap-1 fw-semibold text-primary">
            {isAr ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            <span>{isAr ? 'العودة للصفحة الرئيسية' : 'Back to Home'}</span>
          </Link>
        </div>

        <div className="bg-white rounded-4 shadow-sm p-4 p-md-5 border">
          <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
            <div
              className="p-3 rounded-circle"
              style={{ backgroundColor: '#e0f4f4', color: '#0c6674' }}
            >
              <ShieldCheck size={32} />
            </div>
            <div>
              <span className="badge bg-warning text-dark mb-1">
                {isAr ? 'نموذج تجريبي خاضع للمراجعة' : 'Sample - To be reviewed by clinic'}
              </span>
              <h1 className="h3 fw-bold mb-1 text-dark">
                {isAr ? 'سياسة الخصوصية وحماية بيانات المرضى' : 'Privacy & Patient Data Protection Policy'}
              </h1>
              <small className="text-muted">
                {isAr ? 'آخر تحديث: مارس 2026 • عيادة حياة لطب الأسنان' : 'Last Updated: March 2026 • Hayaah Dental Clinic'}
              </small>
            </div>
          </div>

          <div className="alert alert-info d-flex align-items-start gap-2 mb-4" role="alert">
            <Lock size={20} className="flex-shrink-0 mt-1" />
            <div className="small">
              {isAr ? (
                <>
                  <strong>مبدأ تقليل البيانات (Data Minimization):</strong> يلتزم الموقع بعدم جمع أي بيانات طبية أو سجلات مرضية أو صور شعاعية عبر الإنترنت. نموذج طلب الموعد مخصص فقط لتنسيق المواعيد المبدئية والتواصل البشري المباشر من موظف الاستقبال.
                </>
              ) : (
                <>
                  <strong>Data Minimization Principle:</strong> We do not collect medical history, diagnostic files, or X-rays via this website. The appointment request form is solely for scheduling coordination by reception staff.
                </>
              )}
            </div>
          </div>

          <div className="content-body" style={{ lineHeight: '1.8' }}>
            <h5 className="fw-bold mt-4 mb-2 text-dark">
              {isAr ? '1. البيانات التي يتم جمعها' : '1. Collected Information'}
            </h5>
            <p className="text-secondary">
              {isAr
                ? 'عند استخدامك لمحرك الحجز الإلكتروني أو نموذج التواصل، نقوم بجمع البيانات الأساسية اللازمة فقط لتنسيق الموعد الطبي: اسم المريض، رقم الهاتف المحمول، البريد الإلكتروني (اختياري لإرسال إشعار الموعد)، الخدمة المطلوبة، وملاحظات الزيارة العامة. يُطلب من المرضى عدم إرسال أي أسرار طبية سريرية عبر النموذج.'
                : 'When utilizing our booking system or contact form, we collect only the necessary contact information: patient name, mobile phone number, optional email address (for calendar invitations), chosen service, and general visit notes. Patients are advised not to submit sensitive diagnostic files online.'}
            </p>

            <h5 className="fw-bold mt-4 mb-2 text-dark">
              {isAr ? '2. الغرض من جمع البيانات' : '2. Purpose of Collection'}
            </h5>
            <p className="text-secondary">
              {isAr
                ? 'تُستخدم هذه البيانات حصرياً بواسطة كادر الاستقبال وإدارة عيادة حياة لطب الأسنان للتحقق من الموعد، ومنع التضارب في جداول الأطباء، وإرسال تفاصيل التذكير بالموعد عبر الهاتف أو تطبيق واتساب.'
                : 'This data is used exclusively by Hayaah Dental Clinic receptionists and management to schedule clinic appointments, prevent scheduling conflicts, and send visit confirmation notices via phone or WhatsApp.'}
            </p>

            <h5 className="fw-bold mt-4 mb-2 text-dark">
              {isAr ? '3. من يطلع على بياناتك؟' : '3. Access to Your Information'}
            </h5>
            <p className="text-secondary">
              {isAr
                ? 'لا يتم بيع أو تأجير أو مشاركة بيانات المرضى مع أي أطراف ثالثة أو شركات إعلانية. الوصول إلى بيانات المواعيد محصور لكادر العيادة المصرح له بموجب صلاحيات أمنية مشددة.'
                : 'Patient contact records are never sold, rented, or distributed to third-party marketing companies. Access is restricted to authorized clinic personnel via role-based security controls.'}
            </p>

            <h5 className="fw-bold mt-4 mb-2 text-dark">
              {isAr ? '4. مدة الاحتفاظ بالبيانات وسرية السجلات' : '4. Data Retention & Confidentiality'}
            </h5>
            <p className="text-secondary">
              {isAr
                ? 'يتم الاحتفاظ ببيانات الحجز الإلكتروني (الاسم، الهاتف، البريد) طوال فترة تنسيق ومتابعة الموعد، وتُحفظ السجلات بصورة مشفرة وآمنة لمدة مناسبة تتيح للمريض مراجعة أو تعديل أو إلغاء موعده برمز الأمان المخصص، وتُحذف دورياً أو بناءً على رغبة المريض عند تواصله مع إدارة العيادة.'
                : 'Booking records (name, phone, email) are securely retained during visit scheduling and follow-up. Records are encrypted and can be accessed or cancelled using the unique secure token, and are purged periodically or upon direct patient deletion request.'}
            </p>

            <h5 className="fw-bold mt-4 mb-2 text-dark">
              {isAr ? '5. المراجعة القانونية المعتمدة للعيادة' : '5. Legal Governance & Clinic Review'}
            </h5>
            <div className="p-3 bg-light rounded-3 border mb-3">
              <p className="mb-0 text-muted small">
                {isAr
                  ? 'هذه الصياغة الاسترشادية تخضع للمراجعة والتحديث الدوري من الإدارة والمستشار القانوني لعيادة حياة لطب الأسنان وفقاً للوائح وزارة الصحة وقوانين نقابة أطباء الأسنان المصرية وحماية البيانات الشخصية.'
                  : 'This policy represents standard healthcare operational guidelines and is subject to continuous review and tailoring by Hayaah Dental Clinic legal counsel in compliance with Egyptian health regulations.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
