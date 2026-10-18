import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n/LanguageContext';
import { SERVICES } from '../../data/services';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import {
  FiArrowLeft,
  FiArrowRight,
  FiStar,
  FiShield,
  FiActivity,
  FiSun,
  FiSmile,
  FiScissors,
  FiPhoneCall,
  FiLayers,
} from 'react-icons/fi';
import './Services.scss';

// Map icon names to dynamic React Icons
const renderServiceIcon = (iconName) => {
  switch (iconName) {
    case 'Sparkles':
      return <FiStar />;
    case 'ShieldCheck':
    case 'Shield':
      return <FiShield />;
    case 'Activity':
      return <FiActivity />;
    case 'Sun':
      return <FiSun />;
    case 'Crown':
    case 'Anchor':
      return <FiLayers />;
    case 'Smile':
    case 'Star':
    case 'Heart':
      return <FiSmile />;
    case 'Scissors':
      return <FiScissors />;
    case 'PhoneCall':
      return <FiPhoneCall />;
    default:
      return <FiStar />;
  }
};

const Services = ({ limit = 8, showAllBtn = true }) => {
  const { t, language } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredServices = SERVICES.filter((s) => {
    if (activeFilter === 'all') return true;
    return s.category === activeFilter;
  });

  const displayedServices = limit ? filteredServices.slice(0, limit) : filteredServices;
  const ArrowIcon = language === 'ar' ? FiArrowLeft : FiArrowRight;

  return (
    <section id="services-section" className="services-section pt-100 pb-70">
      <div className="container">
        <SectionTitle
          subTitle={t('services.sectionSub')}
          title={t('services.sectionTitle')}
          description={t('services.sectionDesc')}
          align="center"
        />

        {/* Filter Chips */}
        <div className="service-filters-row d-flex justify-content-center flex-wrap gap-2 mb-5">
          <button
            type="button"
            className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            {t('services.filterAll')}
          </button>
          <button
            type="button"
            className={`filter-chip ${activeFilter === 'preventive' ? 'active' : ''}`}
            onClick={() => setActiveFilter('preventive')}
          >
            {t('services.filterPreventive')}
          </button>
          <button
            type="button"
            className={`filter-chip ${activeFilter === 'restorative' ? 'active' : ''}`}
            onClick={() => setActiveFilter('restorative')}
          >
            {t('services.filterRestorative')}
          </button>
          <button
            type="button"
            className={`filter-chip ${activeFilter === 'cosmetic' ? 'active' : ''}`}
            onClick={() => setActiveFilter('cosmetic')}
          >
            {t('services.filterCosmetic')}
          </button>
          <button
            type="button"
            className={`filter-chip ${activeFilter === 'ortho' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ortho')}
          >
            {t('services.filterOrtho')}
          </button>
          <button
            type="button"
            className={`filter-chip ${activeFilter === 'surgery' ? 'active' : ''}`}
            onClick={() => setActiveFilter('surgery')}
          >
            {t('services.filterSurgery')}
          </button>
        </div>

        {/* Services Grid */}
        <div className="row g-4">
          {displayedServices.map((service, index) => (
            <div key={service.id} className="col-lg-3 col-md-6">
              <motion.div
                className="service-card-premium"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -8 }}
              >
                <div className="service-icon-wrapper">
                  <div className="service-icon-box">
                    {renderServiceIcon(service.iconName)}
                  </div>
                </div>

                <h3 className="service-title">
                  <Link to={`/services/${service.slug}`}>
                    {language === 'ar' ? service.title.ar : service.title.en}
                  </Link>
                </h3>

                <p className="service-desc">
                  {language === 'ar' ? service.shortDesc.ar : service.shortDesc.en}
                </p>

                <div className="service-footer-cta mt-auto pt-3">
                  <Link to={`/services/${service.slug}`} className="service-arrow-link">
                    <span>{language === 'ar' ? 'التفاصيل والحجز' : 'View Details'}</span>
                    <ArrowIcon className="arrow-icon-shift" />
                  </Link>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        {showAllBtn && (
          <div className="text-center mt-5">
            <div className="theme-btn theme-btn-outline">
              <Link to="/services">
                <span>{t('common.viewAllServices')}</span>
                <ArrowIcon />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;
