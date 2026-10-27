import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n/LanguageContext';
import { CLINIC_DATA } from '../../data/clinic';
import { SERVICES } from '../../data/services';
import { FiAward, FiStar, FiShield, FiHeart } from 'react-icons/fi';
import { CountUp } from '../../components/Motion';
import './TrustStrip.scss';

const TrustStrip = () => {
  const { t, language } = useTranslation();

  const trustMetrics = [
    {
      icon: <FiAward />,
      number: (
        <>
          +<CountUp end={10} duration={2} />
        </>
      ),
      label: t('trust.years.label'),
    },
    {
      icon: <FiStar />,
      number: (
        <>
          <CountUp end={4.6} decimals={1} duration={2} /> ★
        </>
      ),
      label: t('trust.rating.label') + ` (${CLINIC_DATA.rating.reviewsCount})`,
    },
    {
      icon: <FiHeart />,
      number: <CountUp end={12} duration={2} />,
      label: t('trust.services.label'),
    },
    {
      icon: <FiShield />,
      number: 'Class-B',
      label: t('trust.hygiene.label'),
    },
  ];

  return (
    <div className="trust-strip-wrapper">
      <div className="container">
        {/* Metric Cards */}
        <div className="trust-metrics-grid row g-3 g-md-4 mb-4">
          {trustMetrics.map((m, idx) => (
            <div key={idx} className="col-lg-3 col-6">
              <motion.div
                className="trust-metric-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="metric-icon-box">{m.icon}</div>
                <div className="metric-text-box">
                  <div className="metric-number">{m.number}</div>
                  <div className="metric-label">{m.label}</div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Pausable Marquee Strip */}
      <div className="marquee-strip-container">
        <div className="marquee-track">
          {[...SERVICES, ...SERVICES].map((svc, i) => (
            <div key={i} className="marquee-item">
              <span className="marquee-dot">✦</span>
              <span className="marquee-text">
                {language === 'ar' ? svc.title.ar : svc.title.en}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustStrip;
