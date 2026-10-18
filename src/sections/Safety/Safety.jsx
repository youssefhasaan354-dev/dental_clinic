import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n/LanguageContext';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import { FiShield, FiCheckCircle, FiPackage, FiRefreshCw, FiLock } from 'react-icons/fi';
import './Safety.scss';

const Safety = () => {
  const { language } = useTranslation();

  const safetyFeatures = [
    {
      icon: <FiLock />,
      titleAr: 'تعقيم أوتوكلاف فئة B (Class B Autoclave)',
      titleEn: 'Class-B Vacuum Autoclave',
      descAr: 'استخدام أعلى مواصفات التعقيم الحراري الفراغي المعتمد بالمستشفيات للقضاء على البكتيريا والجراثيم وفق المعايير الطبية.',
      descEn: 'Hospital-grade pressurized fractionated vacuum sterilization eliminating bacterial spores and microbes per infection standards.',
    },
    {
      icon: <FiPackage />,
      titleAr: 'أدوات فردية معقمة تُفتح أمامك',
      titleEn: 'Single-Use Sealed Pouches',
      descAr: 'تغليف كل مجموعة أدوات في أكياس معقمة مختومة مع مؤشر كيميائي متغير اللون تُفتح أمام المريض مباشرة.',
      descEn: 'Every clinical instrument set is vacuum-sealed in sterile pouches with chemical indicator strips opened in front of you.',
    },
    {
      icon: <FiRefreshCw />,
      titleAr: 'تطهير شامل لكرسي الأسنان والأسطح',
      titleEn: 'Multi-Surface Protocol Disinfection',
      descAr: 'تطهير كيميائي فوري للكرسي ومقابض الأجهزة وأنابيب المياه المقطرة بعد كل جلسة وقبل دخول المريض التالي.',
      descEn: 'Strict wipe-down disinfection of the dental chair, light handles, and waterlines between every patient visit.',
    },
    {
      icon: <FiShield />,
      titleAr: 'فلاتر هواء وبيئة فندقية نقية',
      titleEn: 'Pure Clean Clinical Airflow',
      descAr: 'تهوية وتكييف مركزي مجهز بفلاتر تنقية الهواء لضمان هواء نظيف وخالٍ من الرذاذ والروائح الطبية المزعجة.',
      descEn: 'Climate-controlled air purification reducing ambient bio-aerosols for a fresh, welcoming clinic environment.',
    },
  ];

  return (
    <section className="safety-sterilization-section section-bg section-common pt-100 pb-70 my-5">
      <div className="container">
        <SectionTitle
          subTitle={language === 'ar' ? 'التعقيم ومكافحة العدوى' : 'Safety & Infection Control'}
          title={
            language === 'ar'
              ? 'سلامتك وصحتك أولويتنا المطلقة في كل خطوة'
              : 'Your Safety & Health: Our Uncompromising Priority'
          }
          description={
            language === 'ar'
              ? 'نطبق أدق المعايير الطبية الدولية لمكافحة العدوى، ونوفر بيئة علاجية فندقية فائقة النظافة والأمان.'
              : 'We strictly implement international infection control protocols ensuring verified sterile instruments and peace of mind.'
          }
          align="center"
        />

        {/* Safety Features Grid replacing the old YouTube iframe */}
        <div className="row g-4 justify-content-center">
          {safetyFeatures.map((feat, idx) => (
            <div key={idx} className="col-lg-6 col-md-6">
              <motion.div
                className="safety-feature-card d-flex align-items-start gap-4 p-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="safety-icon-bubble">
                  {feat.icon}
                </div>
                <div className="safety-text-box">
                  <h4 className="safety-card-title">
                    {language === 'ar' ? feat.titleAr : feat.titleEn}
                  </h4>
                  <p className="safety-card-desc">
                    {language === 'ar' ? feat.descAr : feat.descEn}
                  </p>
                  <div className="d-flex align-items-center gap-1 text-success fw-bold small mt-2">
                    <FiCheckCircle />
                    <span>{language === 'ar' ? 'معايير تعقيم معتمدة وطبقاً للبروتوكولات' : 'Hospital-Grade Certified Standard'}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Safety;
