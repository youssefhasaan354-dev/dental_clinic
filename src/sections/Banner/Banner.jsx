import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n/LanguageContext';
import { CLINIC_DATA } from '../../data/clinic';
import { IMAGES } from '../../data/images';
import OpenBadge from '../../components/OpenBadge/OpenBadge';
import { FiCalendar, FiPhoneCall, FiStar, FiShield, FiArrowDown } from 'react-icons/fi';
import './Banner.scss';

const Banner = () => {
  const { t, language } = useTranslation();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    // Subtle cursor glow coordinates relative to hero
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section
      className="section-bg section-common banner-section"
      onMouseMove={handleMouseMove}
    >
      {/* Interactive Cursor Glow (Desktop Only) */}
      <div
        className="hero-cursor-glow d-none d-lg-block"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
        }}
      />

      <div className="container position-relative z-2">
        <div className="row align-items-center g-5 py-5">
          {/* Column 1: Hero Text & CTAs */}
          <div className="col-lg-6">
            <motion.div
              className="banner-text-block"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Live Status Badge */}
              <div className="mb-3 d-flex align-items-center gap-2 flex-wrap">
                <OpenBadge showDetails={true} />
                <span className="since-badge">
                  <FiShield /> {language === 'ar' ? 'منذ عام ٢٠١٥' : 'Since 2015'}
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="hero-main-title">
                {t('hero.titleMain')}{' '}
                <span className="text-gradient-purple">
                  {t('hero.titleHighlight')}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="hero-lead-text">
                {t('hero.subtitle')}
              </p>

              {/* CTAs */}
              <div className="hero-cta-group d-flex align-items-center flex-wrap gap-3 mt-4">
                <div className="theme-btn">
                  <Link to="/contact">
                    <FiCalendar />
                    <span>{t('hero.ctaPrimary')}</span>
                  </Link>
                </div>

                <a
                  href={CLINIC_DATA.phone.telLink}
                  className="banner-call-btn"
                >
                  <div className="call-icon-pulse">
                    <FiPhoneCall />
                  </div>
                  <div className="call-info">
                    <span className="call-tag">{t('hero.emergencyTag')}</span>
                    <strong className="call-number" dir="ltr">{CLINIC_DATA.phone.display}</strong>
                  </div>
                </a>
              </div>

              {/* Verified Mini Rating Pill */}
              <div className="hero-verified-bar mt-4 d-inline-flex align-items-center gap-2">
                <div className="stars-mini d-flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="star-gold" />
                  ))}
                </div>
                <span className="rating-text">
                  <strong>4.6 ★</strong> {language === 'ar' ? '(٢٧ تقييماً على خرائط Google)' : '(27 Google Reviews)'}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Column 2: Doctor Illustration & Parallax Shapes */}
          <div className="col-lg-6">
            <motion.div
              className="banner-img-area position-relative"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Doctor Main Image with layered backdrop */}
              <div className="banner-img-wrapper">
                <img
                  src={IMAGES.hero.model}
                  alt="Hayaah Dental Clinic Medical Team"
                  className="main-hero-img"
                  width="540"
                  height="580"
                />
              </div>

              {/* Floating Verified Rating Badge */}
              <motion.div
                className="floating-info-card glass-card"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="badge-avatar">
                    <img src={IMAGES.hero.doctorBadge} alt="Doctor" />
                  </div>
                  <div className="badge-text">
                    <h6 className="badge-title">{t('hero.doctorBadgeTitle')}</h6>
                    <small className="badge-sub">{t('hero.doctorBadgeSub')}</small>
                  </div>
                </div>
              </motion.div>

              {/* Decorative Parallax Shapes */}
              <div className="shapes-container">
                <motion.img
                  src={IMAGES.hero.shape1}
                  alt="Decorative shape"
                  className="shape shape-1"
                  animate={{ y: [0, 12, 0], rotate: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                />
                <motion.img
                  src={IMAGES.hero.shape2}
                  alt="Decorative shape"
                  className="shape shape-2"
                  animate={{ y: [0, -14, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1 }}
                />
                <motion.img
                  src={IMAGES.hero.shape3}
                  alt="Decorative shape"
                  className="shape shape-3"
                  animate={{ x: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 0.5 }}
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Subtle Scroll Down Prompt */}
        <div className="scroll-prompt text-center pb-3">
          <a href="#services-section" aria-label="Scroll down to services">
            <FiArrowDown className="scroll-arrow-bounce" />
          </a>
        </div>
      </div>

      {/* Background Vector Pattern */}
      <img
        src={IMAGES.hero.pattern}
        alt="Background pattern"
        className="banner-pattern-bg"
      />
    </section>
  );
};

export default Banner;
