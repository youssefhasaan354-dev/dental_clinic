import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation, useLanguage } from '../../i18n/LanguageContext';
import { SERVICES, getServiceBySlug } from '../../data/services';
import { CLINIC_DATA } from '../../data/clinic';
import { trackEvent } from '../../utils/analytics';
import {
  FiHelpCircle,
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiCalendar,
  FiRotateCcw,
  FiAlertTriangle,
  FiX,
  FiCompass,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import './SmartServiceSelector.scss';

export const SmartServiceSelector = ({ onClose, isOpen = false }) => {
  const { language } = useTranslation();
  const navigate = useNavigate();
  const isAr = language === 'ar';

  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({
    concern: '',
    duration: '',
    goal: '',
  });

  const concerns = [
    {
      id: 'pain',
      ar: 'ألم حاد أو مفاجئ في الضرس / حساسية مؤلمة',
      en: 'Sharp tooth pain or severe temperature sensitivity',
      recommendedSlug: 'root-canal',
    },
    {
      id: 'cleaning',
      ar: 'تراكم جير أو تصبغات أو نزيف عند تفريش اللثة',
      en: 'Tartar buildup, yellowing, or bleeding gums',
      recommendedSlug: 'scaling-polishing',
    },
    {
      id: 'missing',
      ar: 'سن مفقود أو مخلوع وأرغب في تعويضه بشكل دائم',
      en: 'Missing tooth requiring a permanent implant replacement',
      recommendedSlug: 'dental-implants',
    },
    {
      id: 'whitening',
      ar: 'اصفرار الأسنان ورغبة في ابتسامة ناصعة وجذابة',
      en: 'Yellowish teeth and seeking professional whitening',
      recommendedSlug: 'teeth-whitening',
    },
    {
      id: 'misaligned',
      ar: 'تزاحم الأسنان أو اعوجاج أو مشاكل في إطباق الفكين',
      en: 'Misaligned, crowded teeth or bite issues',
      recommendedSlug: 'orthodontics',
    },
    {
      id: 'cavity',
      ar: 'تسوس ظاهر أو حشو تالف يحتاج ترميماً تجميلياً',
      en: 'Visible dental cavity or chipped tooth needing restoration',
      recommendedSlug: 'cosmetic-fillings',
    },
    {
      id: 'child',
      ar: 'رعاية أسنان الأطفال والوقاية من التسوس المبكر',
      en: 'Pediatric care and baby teeth preventive health',
      recommendedSlug: 'pediatric-dentistry',
    },
    {
      id: 'checkup',
      ar: 'فحص واطمئنان دوري شامل دون وجود ألم محدد',
      en: 'General preventive routine checkup & consultation',
      recommendedSlug: 'checkup-cleaning',
    },
  ];

  const durations = [
    {
      id: 'recent',
      ar: 'منذ أقل من ٤٨ ساعة (أمر طارئ أو مفاجئ)',
      en: 'Less than 48 hours (acute or sudden)',
    },
    {
      id: 'weeks',
      ar: 'منذ عدة أسابيع أو يأتي ويذهب بشكل متقطع',
      en: 'Several weeks or intermittently recurring',
    },
    {
      id: 'planned',
      ar: 'استشارة اختيارية مخططة بدون ألم عاجل',
      en: 'Elective consultation without acute discomfort',
    },
  ];

  const goals = [
    {
      id: 'relief',
      ar: 'تسكين الألم والتخلص من الانزعاج بأسرع وقت',
      en: 'Immediate pain relief and comfort restoration',
    },
    {
      id: 'plan',
      ar: 'تشخيص طبي شامل وخطة علاجية واضحة ومدروسة',
      en: 'Thorough diagnosis with a structured treatment plan',
    },
    {
      id: 'beauty',
      ar: 'تحسين المظهر الخارجي وتجميل الابتسامة بثقة',
      en: 'Enhance smile aesthetics and natural confidence',
    },
  ];

  const handleSelectConcern = (concernId) => {
    setAnswers((prev) => ({ ...prev, concern: concernId }));
    setCurrentStep(2);
  };

  const handleSelectDuration = (durationId) => {
    setAnswers((prev) => ({ ...prev, duration: durationId }));
    setCurrentStep(3);
  };

  const handleSelectGoal = (goalId) => {
    setAnswers((prev) => ({ ...prev, goal: goalId }));
    setCurrentStep(4); // Results step
    trackEvent('triage_completed', {
      concern: answers.concern,
      goal: goalId,
    });
  };

  const handleReset = () => {
    setAnswers({ concern: '', duration: '', goal: '' });
    setCurrentStep(1);
  };

  // Determine recommended service
  const selectedConcernObj = concerns.find((c) => c.id === answers.concern);
  const recommendedSlug = selectedConcernObj ? selectedConcernObj.recommendedSlug : 'checkup-cleaning';
  const serviceObj = getServiceBySlug(recommendedSlug) || SERVICES[0];

  const handleProceedBooking = () => {
    trackEvent('triage_booking_click', { serviceId: serviceObj.id });
    if (onClose) onClose();
    navigate(`/contact?service=${serviceObj.id}`);
    setTimeout(() => {
      const el = document.getElementById('booking-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 120);
  };

  if (!isOpen) return null;

  return (
    <div className="smart-triage-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <motion.div
        className="smart-triage-card p-4 p-md-5 rounded-5 bg-white shadow-lg position-relative"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <button
          type="button"
          className="triage-close-btn btn-close-modal"
          onClick={onClose}
          aria-label={isAr ? 'إغلاق' : 'Close'}
        >
          <FiX />
        </button>

        {/* Modal Header */}
        <div className="triage-header text-center mb-4">
          <div className="triage-icon-badge mx-auto mb-2">
            <FiCompass />
          </div>
          <h3 className="fw-bold mb-1">
            {isAr ? 'دليلك لاختيار الخدمة المناسبة' : 'Smart Service Selector'}
          </h3>
          <p className="text-muted small mb-0">
            {isAr
              ? 'أجب عن ٣ أسئلة بسيطة لمساعدتك في توجيه موعدك للقسم الأنسب'
              : 'Answer 3 simple questions to guide your booking to the right dental specialist'}
          </p>

          {/* Progress dots */}
          <div className="d-flex justify-content-center gap-2 mt-3">
            {[1, 2, 3, 4].map((s) => (
              <span
                key={s}
                className={`progress-dot ${currentStep === s ? 'active' : ''} ${currentStep > s ? 'completed' : ''}`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Main Concern */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: isAr ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isAr ? -20 : 20 }}
              className="triage-pane"
            >
              <h5 className="fw-bold mb-3 text-center text-primary">
                {isAr ? '١. ما هي الشكوى أو الدافع الأساسي لزيارتك؟' : '1. What is your primary dental concern?'}
              </h5>
              <div className="d-flex flex-column gap-2 mb-3">
                {concerns.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="triage-option-btn text-start p-3 rounded-4 border bg-light d-flex align-items-center justify-content-between"
                    onClick={() => handleSelectConcern(c.id)}
                  >
                    <span className="small fw-semibold text-dark">{isAr ? c.ar : c.en}</span>
                    <span className="select-arrow text-primary">
                      {isAr ? <FiArrowLeft /> : <FiArrowRight />}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Duration */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: isAr ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isAr ? -20 : 20 }}
              className="triage-pane"
            >
              <h5 className="fw-bold mb-3 text-center text-primary">
                {isAr ? '٢. منذ متى تشعر بهذه الحالة تقريباً؟' : '2. How long have you experienced this?'}
              </h5>
              <div className="d-flex flex-column gap-2 mb-3">
                {durations.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className="triage-option-btn text-start p-3 rounded-4 border bg-light d-flex align-items-center justify-content-between"
                    onClick={() => handleSelectDuration(d.id)}
                  >
                    <span className="small fw-semibold text-dark">{isAr ? d.ar : d.en}</span>
                    <span className="select-arrow text-primary">
                      {isAr ? <FiArrowLeft /> : <FiArrowRight />}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-link text-muted small p-0 mt-2"
                onClick={() => setCurrentStep(1)}
              >
                {isAr ? '← الرجوع للسؤال السابق' : '← Back to previous question'}
              </button>
            </motion.div>
          )}

          {/* STEP 3: Goal */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: isAr ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isAr ? -20 : 20 }}
              className="triage-pane"
            >
              <h5 className="fw-bold mb-3 text-center text-primary">
                {isAr ? '٣. ما أولويتك القصوى في هذه الزيارة؟' : '3. What is your highest priority for this visit?'}
              </h5>
              <div className="d-flex flex-column gap-2 mb-3">
                {goals.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className="triage-option-btn text-start p-3 rounded-4 border bg-light d-flex align-items-center justify-content-between"
                    onClick={() => handleSelectGoal(g.id)}
                  >
                    <span className="small fw-semibold text-dark">{isAr ? g.ar : g.en}</span>
                    <span className="select-arrow text-primary">
                      {isAr ? <FiArrowLeft /> : <FiArrowRight />}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-link text-muted small p-0 mt-2"
                onClick={() => setCurrentStep(2)}
              >
                {isAr ? '← الرجوع للسؤال السابق' : '← Back to previous question'}
              </button>
            </motion.div>
          )}

          {/* STEP 4: Results & Recommendation */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="triage-pane text-center"
            >
              <div className="recommendation-result-box p-4 rounded-4 bg-light border mb-3 text-start">
                <span className="badge bg-primary text-white rounded-pill px-3 py-1 mb-2">
                  {isAr ? 'الخدمة المقترحة استرشادياً' : 'Suggested Service'}
                </span>
                <h4 className="fw-bold text-dark mb-1">
                  {isAr ? serviceObj.title.ar : serviceObj.title.en}
                </h4>
                <p className="small text-muted mb-2">
                  {isAr ? serviceObj.shortDesc.ar : serviceObj.shortDesc.en}
                </p>
                {serviceObj.duration && (
                  <small className="text-secondary fw-semibold">
                    {isAr ? `مدة الجلسة التقديرية: ${serviceObj.duration.ar}` : `Estimated Duration: ${serviceObj.duration.en}`}
                  </small>
                )}
              </div>

              {/* Strict Medical Disclaimer */}
              <div className="alert alert-warning border text-start p-3 rounded-4 mb-4" role="alert">
                <div className="d-flex align-items-start gap-2">
                  <FiAlertTriangle className="text-warning flex-shrink-0 mt-1" />
                  <span className="small" style={{ fontSize: '0.82rem' }}>
                    {isAr
                      ? 'تنبيه طبي: هذا التوجيه إرشادي عام لمساعدتك في حجز الموعد الأنسب، ولا يمثل تشخيصاً طبياً نهائياً أو بديلاً عن الفحص السريري المباشر لطبيب الأسنان داخل العيادة.'
                      : 'Clinical Notice: This triage is an advisory guide to assist your scheduling choice and does not constitute a formal diagnosis or replace in-clinic professional evaluation.'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4 py-2 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleProceedBooking}
                >
                  <FiCalendar />
                  <span>{isAr ? 'احجز موعداً لهذه الخدمة' : 'Book for this Service'}</span>
                </button>

                <a
                  href={CLINIC_DATA.whatsapp.getChatUrl(
                    isAr
                      ? `مرحباً، أجريت اختبار توجيه الخدمات بالعيادة وأود الاستفسار عن: ${serviceObj.title.ar}`
                      : `Hello, I took your service guide and would like to inquire about: ${serviceObj.title.en}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-success rounded-pill px-3 py-2 d-flex align-items-center justify-content-center gap-2"
                >
                  <FaWhatsapp />
                  <span>{isAr ? 'استشارة واتساب' : 'WhatsApp'}</span>
                </a>

                <button
                  type="button"
                  className="btn btn-light border rounded-pill px-3 py-2 d-flex align-items-center justify-content-center gap-2 text-muted"
                  onClick={handleReset}
                >
                  <FiRotateCcw />
                  <span>{isAr ? 'إعادة' : 'Reset'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SmartServiceSelector;
