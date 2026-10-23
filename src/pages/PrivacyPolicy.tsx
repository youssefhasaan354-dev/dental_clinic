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
                ? 'عند استخدامك لنموذج طلب الموعد عبر الموقع، نطلب فقط: الاسم الكامل، رقم الهاتف المحمول، اليوم والوقت المفضل للزيارة، والخدمة المطلوبة. يُطلب من الزوار بوضوح عدم إرسال أي تفاصيل طبية دقيقة عبر الحقل الاختياري.'
                : 'When utilizing our appointment request form, we collect only: full name, mobile telephone number, preferred day/time of visit, and selected service category. Patients are explicitly advised not to submit sensitive clinical details in the optional note.'}
            </p>

            <h5 className="fw-bold mt-4 mb-2 text-dark">
              {isAr ? '2. الغرض من جمع البيانات' : '2. Purpose of Collection'}
            </h5>
            <p className="text-secondary">
              {isAr
                ? 'تُستخدم هذه البيانات حصرياً بواسطة موظف الاستقبال في عيادة حياة لطب الأسنان للاتصال بكم هاتفياً أو عبر تطبيق واتساب لتأكيد توفر الطبيب وتثبيت موعد الزيارة.'
                : 'This information is used strictly by Hayaah Dental Clinic receptionists to contact you via telephone or WhatsApp to verify dentist availability and confirm your actual appointment.'}
            </p>

            <h5 className="fw-bold mt-4 mb-2 text-dark">
              {isAr ? '3. من يطلع على بياناتك؟' : '3. Access to Your Information'}
            </h5>
            <p className="text-secondary">
              {isAr
                ? 'لا يتم بيع أو مشاركة بياناتك مع أي طرف ثالث أو منصات إعلانية أو تتبعية. يطلع على طلبات الحجز حصرياً موظفو الاستقبال وإدارة العيادة المصرح لهم بنظام أمني مقيد.'
                : 'Your contact details are never sold, rented, or shared with third-party advertisers or tracking platforms. Only authorized clinic receptionists have secure access to incoming appointment requests.'}
            </p>

            <h5 className="fw-bold mt-4 mb-2 text-dark">
              {isAr ? '4. مدة الاحتفاظ بالبيانات وحق الحذف' : '4. Data Retention & Deletion Rights'}
            </h5>
            <p className="text-secondary">
              {isAr
                ? 'يتم الاحتفاظ بطلبات الحجز المبدئية لفترة مؤقتة حتى إتمام الزيارة أو إلغائها، وتُحذف دورياً من سجلات الاستقبال بعد 60 يوماً. يحق لأي مريض طلب حذف بيانات اتصاله فوراً بالاتصال بإدارة العيادة.'
                : 'Scheduling requests are temporarily retained until the visit concludes and are purged after 60 days. Any patient may request immediate deletion of their record by calling our clinic desk directly.'}
            </p>

            <h5 className="fw-bold mt-4 mb-2 text-dark">
              {isAr ? '5. تنبيه بشأن طبيعة الطلب' : '5. Notice on Appointment Status'}
            </h5>
            <div className="p-3 bg-light rounded-3 border">
              <p className="mb-0 text-dark fw-semibold">
                {isAr
                  ? 'إرسال النموذج عبر هذا الموقع يُعد طلباً أولياً للموعد وليس حجزاً مؤكداً. لا يُعتبر الحجز نهائياً إلا بعد تواصل موظف الاستقبال معكم وتأكيد الموعد رسمياً.'
                  : 'Submitting a form via this website constitutes an initial inquiry, not a confirmed booking. Your appointment is finalized only after our receptionist contacts you directly to confirm.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
