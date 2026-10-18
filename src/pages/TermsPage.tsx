import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { FileText, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsPage: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="terms-page py-5" style={{ backgroundColor: '#f8fafc', minHeight: '80vh' }}>
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
              <FileText size={32} />
            </div>
            <div>
              <span className="badge bg-warning text-dark mb-1">
                {isAr ? 'نموذج تجريبي خاضع للمراجعة' : 'Sample - To be reviewed by clinic'}
              </span>
              <h1 className="h3 fw-bold mb-1 text-dark">
                {isAr ? 'الشروط والأحكام الطبية والقانونية' : 'Terms & Medical Disclaimer'}
              </h1>
              <small className="text-muted">
                {isAr ? 'عيادة حياة لطب الأسنان • القاهرة' : 'Hayaah Dental Clinic • Cairo'}
              </small>
            </div>
          </div>

          <div className="content-body" style={{ lineHeight: '1.8' }}>
            <h5 className="fw-bold mt-4 mb-2 text-dark">
              {isAr ? '1. إخلاء المسؤولية الطبية' : '1. Clinical Medical Disclaimer'}
            </h5>
            <p className="text-secondary">
              {isAr
                ? 'كافة المواد والمقالات التوعوية المنشورة على هذا الموقع هي لأغراض الإرشاد والتثقيف الصحي العام فقط، ولا تشكل بأي حال من الأحوال تشخيصاً طبياً أو وصفة علاجية لحالة فردية بعينها، ولا يمكن أن تحل محل الفحص الإكلينيكي المباشر داخل العيادة.'
                : 'All educational materials and articles published on this website are intended solely for general public health guidance. They do not constitute formal medical diagnosis or individualized prescription and cannot replace an in-person clinical oral examination.'}
            </p>

            <h5 className="fw-bold mt-4 mb-2 text-dark">
              {isAr ? '2. طبيعة حجز المواعيد' : '2. Appointment Scheduling Nature'}
            </h5>
            <p className="text-secondary">
              {isAr
                ? 'تقديم طلب عبر نموذج الموقع لا يمثل حجزاً قطعياً ملزماً حتى يتم التواصل معك من قِبل العيادة وتحديد الموعد الدقيق مع الطبيب المعالج وفق جداول العمل المتاحة.'
                : 'Submitting a form inquiry does not constitute a guaranteed binding appointment until acknowledged and confirmed by clinic staff according to real-time doctor availability.'}
            </p>

            <h5 className="fw-bold mt-4 mb-2 text-dark">
              {isAr ? '3. سياسة التكاليف والأسعار' : '3. Fees & Pricing Transparency'}
            </h5>
            <p className="text-secondary">
              {isAr
                ? 'أي تكاليف مذكورة استرشادية هي مؤشرات تقديرية تبدأ من قيمة معينة ("تبدأ من")، وتتحدد التكلفة الدقيقة والخطة العلاجية النهائية بعد الكشف الطبي المباشر وتحديد احتياجات الحالة والأشعة المطلوبة.'
                : 'Any indicative fees referenced are baseline starting figures. The final treatment plan and definitive financial estimate are determined exclusively following clinical evaluation and necessary radiographs.'}
            </p>

            <h5 className="fw-bold mt-4 mb-2 text-dark">
              {isAr ? '4. حالات الطوارئ الحادة' : '4. Acute Medical Emergencies'}
            </h5>
            <div className="alert alert-warning d-flex align-items-start gap-2" role="alert">
              <AlertCircle size={20} className="flex-shrink-0 mt-1" />
              <div className="small">
                {isAr
                  ? 'هذا الموقع الإلكتروني ليس منصة لخدمات الطوارئ الفورية أو الحالات الحرجة المهددة للحياة. في حالات النزيف الحاد أو صدمات الفك الشديدة يرجى التوجه فوراً لأقرب مستشفى أو الاتصال برقم الإسعاف 123.'
                  : 'This website is not a channel for real-time life-threatening emergency response. For acute dental trauma, severe facial swelling, or uncontrolled hemorrhage, seek immediate hospital emergency care or call ambulance 123.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
