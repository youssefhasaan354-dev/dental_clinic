import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n/LanguageContext';
import { IMAGES } from '../../data/images';
import EditableMedia from '../../components/VisualEdit/EditableMedia';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import { FiCheckCircle, FiCalendar } from 'react-icons/fi';
import './Priority.scss';

const Priority = () => {
  const { language } = useTranslation();

  const valuesList = [
    {
      titleAr: 'الصدق والأمانة الطبية',
      titleEn: 'Clinical Integrity',
      descAr: 'لا نوصي بأي إجراء علاجي إلا إذا كان ضرورياً ومفيداً لصحة أسنانك على المدى البعيد.',
      descEn: 'We prescribe only evidence-based, medically necessary treatments safeguarding your dental health.',
    },
    {
      titleAr: 'تجارب علاجية هادئة ولطيفة',
      titleEn: 'Gentle Clinical Care',
      descAr: 'استخدام أحدث أساليب التخدير الموضعي اللطيف لمساعدتك على تخطي أي خوف مسبق من عيادات الأسنان.',
      descEn: 'Gentle, modern numbing and an empathetic approach designed to alleviate dental anxiety.',
    },
    {
      titleAr: 'احترام وقت المريض',
      titleEn: 'Strict Punctuality',
      descAr: 'مواعيد محددة بدقة لتفادي الانتظار غير المبرر وتقدير قيمة وقتك ووقت عائلتك.',
      descEn: 'Scheduled appointments honoring your time without frustrating lounge delays.',
    },
  ];

  return (
    <section className="priority-values-section section-common py-5 my-5">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <motion.div
              className="priority-img-box text-center"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <EditableMedia
                slotId="slot-about"
                defaultSrc={IMAGES.sections.priority}
                alt={{ ar: 'أنت أولويتنا الأولى - عيادة حياة لطب الأسنان', en: 'Patient First Philosophy - Hayaah Dental Clinic' }}
                className="priority-main-img"
                width={560}
                height={420}
              />
            </motion.div>
          </div>

          <div className="col-lg-6">
            <motion.div
              className="priority-text-block"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <SectionTitle
                subTitle={language === 'ar' ? 'قيمنا ورسالتنا' : 'Our Mission & Values'}
                title={
                  language === 'ar'
                    ? 'أنت أولويتنا الأولى.. اليوم ودائماً'
                    : 'You Are Our Utmost Priority.. Every Day'
                }
                align="start"
                className="mb-4"
              />

              <div className="values-stack">
                {valuesList.map((val, idx) => (
                  <div key={idx} className="value-card-item d-flex gap-3 mb-4">
                    <div className="value-check-icon">
                      <FiCheckCircle />
                    </div>
                    <div>
                      <h4 className="value-item-title">
                        {language === 'ar' ? val.titleAr : val.titleEn}
                      </h4>
                      <p className="value-item-desc mb-0">
                        {language === 'ar' ? val.descAr : val.descEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="theme-btn mt-3">
                <Link to="/contact">
                  <FiCalendar />
                  <span>{language === 'ar' ? 'حجز موعد كشف واستشارة' : 'Book a Consultation'}</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Priority;
