import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n/LanguageContext';
import { FEATURES } from '../../data/features';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import { Reveal, Stagger, StaggerItem } from '../../components/Motion';
import { FiShield, FiUsers, FiLayers, FiSmile } from 'react-icons/fi';
import './Features.scss';

const renderFeatureIcon = (key) => {
  switch (key) {
    case 'shield':
      return <FiShield />;
    case 'users':
      return <FiUsers />;
    case 'layers':
      return <FiLayers />;
    case 'heart':
      return <FiSmile />;
    default:
      return <FiShield />;
  }
};

const Features = () => {
  const { t, language } = useTranslation();

  return (
    <section className="features-why-us-section pt-100 pb-70">
      <div className="container">
        <Reveal>
          <SectionTitle
            subTitle={t('features.sectionSub')}
            title={t('features.sectionTitle')}
            description={t('features.sectionDesc')}
            align="center"
          />
        </Reveal>

        <Stagger className="row g-4">
          {FEATURES.map((item) => (
            <StaggerItem key={item.id} className="col-lg-3 col-md-6">
              <motion.div
                className="feature-card-clean"
                whileHover={{ y: -6 }}
              >
                <div className="feature-card-top d-flex justify-content-between align-items-center mb-4">
                  <div className="feature-icon-bubble">
                    {renderFeatureIcon(item.iconKey)}
                  </div>
                  <span className="feature-num">{item.number}</span>
                </div>

                <h3 className="feature-title">
                  {language === 'ar' ? item.title.ar : item.title.en}
                </h3>

                <p className="feature-desc">
                  {language === 'ar' ? item.description.ar : item.description.en}
                </p>

                <div className="feature-metric-pill mt-auto pt-3">
                  <span>{language === 'ar' ? item.metric.ar : item.metric.en}</span>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
};

export default Features;
