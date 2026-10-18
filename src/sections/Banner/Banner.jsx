import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation, useLanguage } from '../../i18n/LanguageContext';
import { useData } from '../../context/DataContext';
import { ImageSlotOverlay } from '../../components/VisualEdit/ImageSlotOverlay';
import { FiCalendar, FiPhoneCall, FiStar, FiShield, FiArrowDown } from 'react-icons/fi';
import OpenBadge from '../../components/OpenBadge/OpenBadge';
import { CLINIC_RATING } from '../../data/clinic';
import './Banner.scss';

const Banner = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { clinicInfo, getImageSlot } = useData();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const isAr = language === 'ar';
  const heroSlot = getImageSlot('slot-hero');
  const heroImgUrl = heroSlot?.currentUrl || '/assets/banner/1.png';

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const phoneDisplay = clinicInfo?.phone || '02 2635 5669';
  const telLink = `tel:${phoneDisplay.replace(/\s+/g, '')}`;

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
                  <FiShield /> {isAr ? 'شارع فريد سميكة • مصر الجديدة' : 'Heliopolis, Cairo'}
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="hero-main-title">
                {isAr ? (
                  <>
                    رعاية طبية هادئة ودقيقة لطب الأسنان في{' '}
                    <span className="text-gradient-purple">مصر الجديدة</span>
                  </>
                ) : (
                  <>
                    Calm, Precise Dental Care in{' '}
                    <span className="text-gradient-purple">Heliopolis, Cairo</span>
                  </>
                )}
              </h1>

              {/* Subtitle */}
              <p className="hero-lead-text">
                {isAr
                  ? (clinicInfo?.tagline?.ar || 'نهج علاجي لطيف، أجهزة تعقيم معتمدة، وأولوية تامة لراحتك وصحة أسنانك الطبيعية.')
                  : (clinicInfo?.tagline?.en || 'Gentle clinical approach, certified sterilization, and utmost dedication to your natural teeth.')}
              </p>

              {/* CTAs */}
              <div className="hero-cta-group d-flex align-items-center flex-wrap gap-3 mt-4">
                <div className="theme-btn">
                  <Link to="/contact">
                    <FiCalendar />
                    <span>{isAr ? 'طلب موعد كشف' : 'Request Appointment'}</span>
                  </Link>
                </div>

                <a
                  href={telLink}
                  className="banner-call-btn"
                >
                  <div className="call-icon-pulse">
                    <FiPhoneCall />
                  </div>
                  <div className="call-info">
                    <span className="call-tag">{isAr ? 'الاتصال المباشر' : 'Direct Call'}</span>
                    <strong className="call-number" dir="ltr">{phoneDisplay}</strong>
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
                  <strong>{isAr ? CLINIC_RATING.scoreDisplayAr : CLINIC_RATING.scoreDisplay} ★</strong> {isAr ? `(${CLINIC_RATING.reviewsCountAr} تقييماً موثقاً على خرائط Google)` : `(${CLINIC_RATING.reviewsCount} Verified Reviews on Google Maps)`}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Column 2: Visual Hero Area */}
          <div className="col-lg-6">
            <motion.div
              className="banner-img-area position-relative"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="banner-img-wrapper">
                <ImageSlotOverlay slotId="slot-hero">
                  <img
                    src={heroImgUrl}
                    alt={isAr ? heroSlot?.altText?.ar || 'عيادة حياة لطب الأسنان' : heroSlot?.altText?.en || 'Hayaah Dental Clinic'}
                    className="main-hero-img"
                    width="540"
                    height="580"
                    style={{ objectFit: 'cover', borderRadius: '24px' }}
                  />
                </ImageSlotOverlay>
              </div>

              {/* Floating Verified Rating Badge */}
              <motion.div
                className="floating-info-card glass-card"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="badge-avatar">
                    <img src="/assets/banner/doctor.png" alt="Doctor" />
                  </div>
                  <div className="badge-text">
                    <h6 className="badge-title">
                      {isAr ? 'فريق طبي معتمد' : 'Certified Clinical Team'}
                    </h6>
                    <small className="badge-sub">
                      {isAr ? 'نقابة أطباء الأسنان المصرية' : 'Egyptian Dental Syndicate'}
                    </small>
                  </div>
                </div>
              </motion.div>
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
    </section>
  );
};

export default Banner;
