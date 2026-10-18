import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n/LanguageContext';
import SectionTitle from '../SectionTitle/SectionTitle';
import { FiCalendar, FiSearch, FiSmile, FiShield } from 'react-icons/fi';
import './ProcessTimeline.scss';

const ProcessTimeline = () => {
  const { t } = useTranslation();

  const steps = [
    {
      number: '01',
      icon: <FiCalendar />,
      title: t('timeline.step1Title'),
      desc: t('timeline.step1Desc'),
    },
    {
      number: '02',
      icon: <FiSearch />,
      title: t('timeline.step2Title'),
      desc: t('timeline.step2Desc'),
    },
    {
      number: '03',
      icon: <FiShield />,
      title: t('timeline.step3Title'),
      desc: t('timeline.step3Desc'),
    },
    {
      number: '04',
      icon: <FiSmile />,
      title: t('timeline.step4Title'),
      desc: t('timeline.step4Desc'),
    },
  ];

  return (
    <section className="process-timeline-section pt-100 pb-70">
      <div className="container">
        <SectionTitle
          subTitle={t('timeline.sectionSub')}
          title={t('timeline.sectionTitle')}
          description={t('timeline.sectionDesc')}
          align="center"
        />

        <div className="timeline-cards-grid row g-4">
          {steps.map((step, idx) => (
            <div key={step.number} className="col-lg-3 col-md-6">
              <motion.div
                className="timeline-step-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                whileHover={{ y: -6 }}
              >
                <div className="step-header d-flex justify-content-between align-items-center mb-3">
                  <div className="step-icon-box">{step.icon}</div>
                  <span className="step-number-tag">{step.number}</span>
                </div>

                <h4 className="step-card-title">{step.title}</h4>
                <p className="step-card-desc">{step.desc}</p>

                {/* Connecting arrow indicator for desktop */}
                {idx < steps.length - 1 && (
                  <div className="step-connector d-none d-lg-block">
                    <span className="connector-dot"></span>
                  </div>
                )}
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessTimeline;
