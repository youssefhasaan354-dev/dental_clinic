import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n/LanguageContext';
import { IMAGES } from '../../data/images';
import EditableMedia from '../../components/VisualEdit/EditableMedia';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import { FiAlertCircle, FiCheck } from 'react-icons/fi';
import './Symptoms.scss';

const Symptoms = ({
  symptomsList = null,
  title = null,
  subTitle = null,
  description = null,
}) => {
  const { language } = useTranslation();

  const defaultSymptoms = [
    {
      icon: IMAGES.symptoms[0],
      titleAr: 'ألم مستمر أو نابض',
      titleEn: 'Spontaneous Throbbing Pain',
      descAr: 'ألم مفاجئ دون تناول طعام أو شراب يزداد عند الاستلقاء.',
      descEn: 'Sudden spontaneous pain occurring even without food or drink.',
    },
    {
      icon: IMAGES.symptoms[1],
      titleAr: 'تغير لون السن',
      titleEn: 'Tooth Discoloration',
      descAr: 'تغير لون السن إلى الرمادي أو الداكن نتيجة إصابة أو تسوس داخلي.',
      descEn: 'Darkening or greyish discoloration from trauma or internal nerve issue.',
    },
    {
      icon: IMAGES.symptoms[2],
      titleAr: 'ألم يوقظك ليلاً',
      titleEn: 'Night-Time Aches',
      descAr: 'ألم حاد في الأسنان يمنع النوم المريح ويتطلب تدخلاً عاجلاً.',
      descEn: 'Sharp dental ache interrupting deep sleep requiring timely care.',
    },
    {
      icon: IMAGES.symptoms[3],
      titleAr: 'نزيف أو حساسية اللثة',
      titleEn: 'Gum Tenderness & Bleeding',
      descAr: 'نزيف عند تفريش الأسنان أو تورم طفيف في حواف اللثة.',
      descEn: 'Bleeding upon brushing or localized tenderness along gum margins.',
    },
    {
      icon: IMAGES.symptoms[4],
      titleAr: 'حساسية شديدة للمشروبات',
      titleEn: 'Extreme Thermal Sensitivity',
      descAr: 'لسعة ألم ممتدة لدقائق بعد المشروبات المثلجة أو الشاي الساخن.',
      descEn: 'Lingering sharp twinges after cold drinks or hot beverages.',
    },
  ];

  return (
    <section className="symptoms-section section-common pt-100 pb-70">
      <div className="container">
        <SectionTitle
          subTitle={subTitle || (language === 'ar' ? 'متى يجب أن تزورنا؟' : 'When Should You Visit?')}
          title={
            title ||
            (language === 'ar'
              ? 'علامات ومؤشرات تدل على حاجتك للكشف السريع'
              : 'Symptoms & Indicators Requiring Professional Care')
          }
          description={
            description ||
            (language === 'ar'
              ? 'الكشف المبكر عن هذه العلامات يوفر عليك الكثير من الوقت والجهد ويحمي أسنانك الطبيعية.'
              : 'Early attention to these signs preserves your natural smile and prevents complications.')
          }
          align="center"
        />

        {symptomsList ? (
          // Custom list of symptoms passed from single service page
          <div className="row g-3 justify-content-center">
            {symptomsList.map((sym, idx) => (
              <div key={idx} className="col-lg-6">
                <motion.div
                  className="symptom-pill-card d-flex align-items-center gap-3 p-3"
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <div className="symptom-dot">
                    <FiAlertCircle />
                  </div>
                  <span className="symptom-text">{sym}</span>
                </motion.div>
              </div>
            ))}
          </div>
        ) : (
          // Default 5 symptoms with icons
          <div className="row g-4 justify-content-center">
            {defaultSymptoms.map((sym, idx) => (
              <div key={idx} className="col-lg-4 col-md-6">
                <motion.div
                  className="symptom-card-box p-4 text-center h-100"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  whileHover={{ y: -6 }}
                >
                  <div className="symptom-icon-box mb-3">
                    <EditableMedia
                      slotId={`slot-symptom-${idx + 1}`}
                      defaultSrc={sym.icon}
                      alt={{ ar: sym.titleAr, en: sym.titleEn }}
                      width={64}
                      height={64}
                      inline
                    />
                  </div>
                  <h4 className="symptom-card-title mb-2">
                    {language === 'ar' ? sym.titleAr : sym.titleEn}
                  </h4>
                  <p className="symptom-card-desc mb-0">
                    {language === 'ar' ? sym.descAr : sym.descEn}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Symptoms;
