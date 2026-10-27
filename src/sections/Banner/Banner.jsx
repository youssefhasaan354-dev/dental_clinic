import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useTranslation, useLanguage } from '../../i18n/LanguageContext';
import { useData } from '../../context/DataContext';
import EditableMedia from '../../components/VisualEdit/EditableMedia';
import { FiCalendar, FiPhoneCall, FiStar, FiShield, FiArrowDown } from 'react-icons/fi';
import OpenBadge from '../../components/OpenBadge/OpenBadge';
import { CLINIC_RATING } from '../../data/clinic';
import heroModelImg from '../../assets/banner/1.png';
import './Banner.scss';

const Banner = () => {
  const { language } = useLanguage();
  const { clinicInfo } = useData();
  const prefersReduced = useReducedMotion();
  const isAr = language === 'ar';

  const containerRef = useRef(null);

  // Apple-style scroll-driven transforms
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Parallax and fade transforms for scroll
  const textY = useTransform(scrollYProgress, [0, 0.7], prefersReduced ? [0, 0] : [0, -60]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], prefersReduced ? [1, 1] : [1, 0]);
  const toothY = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] : [0, 90]);
  const toothScale = useTransform(scrollYProgress, [0, 1], prefersReduced ? [1, 1] : [1, 1.1]);
  const arrowOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  // Subtle interactive cursor glow
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Magnetic effect for Direct Call button on desktop
  const [callMagnetic, setCallMagnetic] = useState({ x: 0, y: 0 });
  const handleCallMouseMove = (e) => {
    if (prefersReduced || (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches)) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setCallMagnetic({
      x: (e.clientX - centerX) * 0.22,
      y: (e.clientY - centerY) * 0.22,
    });
  };
  const handleCallMouseLeave = () => {
    setCallMagnetic({ x: 0, y: 0 });
  };

  const phoneDisplay = clinicInfo?.phone || '02 2635 5669';
  const telLink = `tel:${phoneDisplay.replace(/\s+/g, '')}`;

  // Word-by-word mask reveal data
  const headlineWords = isAr
    ? [
        { text: 'رعاية' },
        { text: 'طبية' },
        { text: 'هادئة' },
        { text: 'ودقيقة' },
        { text: 'لطب' },
        { text: 'الأسنان' },
        { text: 'في' },
        { text: 'مصر الجديدة', isHighlight: true },
      ]
    : [
        { text: 'Calm,' },
        { text: 'Precise' },
        { text: 'Dental' },
        { text: 'Care' },
        { text: 'in' },
        { text: 'Heliopolis, Cairo', isHighlight: true },
      ];

  return (
    <div ref={containerRef} className="banner-sticky-wrapper">
      <section
        className="section-bg section-common banner-section"
        onMouseMove={handleMouseMove}
      >
        {/* Pearl & Aurora Ambient Lighting Layers */}
        <div className="banner-aurora-bg" aria-hidden="true">
          <div className="aurora-orb aurora-orb-1" />
          <div className="aurora-orb aurora-orb-2" />
          <div className="aurora-orb aurora-orb-3" />
          <div className="aurora-orb aurora-orb-4" />
          <div className="aurora-grain" />
        </div>

        {/* Interactive Cursor Glow (Desktop Only) */}
        <div
          className="hero-cursor-glow d-none d-lg-block"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
          }}
          aria-hidden="true"
        />

        <div className="container position-relative z-2">
          <div className="row align-items-center g-5 py-lg-4 py-3">
            {/* Column 1: Hero Text & CTAs with Apple-style Staggered Reveal */}
            <div className="col-lg-6">
              <motion.div
                className="banner-text-block"
                style={{
                  y: textY,
                  opacity: textOpacity,
                }}
              >
                {/* Live Status & Clinic Location Badges */}
                <motion.div
                  className="mb-3 d-flex align-items-center gap-2 flex-wrap"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <OpenBadge showDetails={true} />
                  <span className="since-badge">
                    <FiShield /> {isAr ? 'شارع فريد سميكة • مصر الجديدة' : 'Farid Semeka St • Heliopolis'}
                  </span>
                </motion.div>

                {/* Main Headline with Word-by-Word Mask Reveal */}
                <h1 className="hero-main-title">
                  {headlineWords.map((w, idx) => (
                    <span key={idx} className="hero-word-wrapper">
                      <motion.span
                        className={`hero-word-inner ${w.isHighlight ? 'hero-gradient-text' : ''}`}
                        initial={{ y: '110%', opacity: 0 }}
                        animate={{ y: '0%', opacity: 1 }}
                        transition={{
                          duration: 0.65,
                          delay: prefersReduced ? 0 : 0.12 + idx * 0.05,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        {w.text}
                      </motion.span>
                      {' '}
                    </span>
                  ))}
                </h1>

                {/* Subtitle */}
                <motion.p
                  className="hero-lead-text"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: prefersReduced ? 0 : 0.55,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {isAr
                    ? (clinicInfo?.tagline?.ar || 'نهج علاجي لطيف، أجهزة تعقيم معتمدة، وأولوية تامة لراحتك وصحة أسنانك الطبيعية.')
                    : (clinicInfo?.tagline?.en || 'Gentle clinical approach, certified sterilization, and utmost dedication to your natural teeth.')}
                </motion.p>

                {/* CTAs */}
                <motion.div
                  className="hero-cta-group d-flex align-items-center flex-wrap gap-3 mt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: prefersReduced ? 0 : 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Link to="/contact" className="hero-book-btn">
                    <FiCalendar className="cta-icon" />
                    <span>{isAr ? 'طلب موعد كشف' : 'Request Appointment'}</span>
                  </Link>

                  <motion.a
                    href={telLink}
                    className="hero-call-btn"
                    onMouseMove={handleCallMouseMove}
                    onMouseLeave={handleCallMouseLeave}
                    animate={{ x: callMagnetic.x, y: callMagnetic.y }}
                    transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                    aria-label={isAr ? `الاتصال المباشر: ${phoneDisplay}` : `Direct Call: ${phoneDisplay}`}
                  >
                    <div className="call-icon-pulse">
                      <FiPhoneCall />
                    </div>
                    <div className="call-info">
                      <span className="call-tag">{isAr ? 'الاتصال المباشر' : 'Direct Call'}</span>
                      <strong className="call-number" dir="ltr">{phoneDisplay}</strong>
                    </div>
                  </motion.a>
                </motion.div>

                {/* Verified Mini Rating Pill */}
                <motion.div
                  className="hero-verified-bar mt-4 d-inline-flex align-items-center gap-2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: prefersReduced ? 0 : 0.85,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className="stars-mini d-flex gap-1" aria-hidden="true">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className="star-gold" />
                    ))}
                  </div>
                  <span className="rating-text">
                    <strong>{isAr ? CLINIC_RATING.scoreDisplayAr : CLINIC_RATING.scoreDisplay} ★</strong> {isAr ? `(${CLINIC_RATING.reviewsCountAr} تقييماً موثقاً على خرائط Google)` : `(${CLINIC_RATING.reviewsCount} Verified Reviews on Google Maps)`}
                  </span>
                </motion.div>
              </motion.div>
            </div>

            {/* Column 2: Visual Hero Area (Apple Scroll-Linked 3D Tooth Model) */}
            <div className="col-lg-6">
              <motion.div
                className="banner-img-area position-relative"
                style={{
                  y: toothY,
                  scale: toothScale,
                }}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.9,
                  delay: prefersReduced ? 0 : 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {/* Decorative Subtle Ambient Ring */}
                <div className="hero-ambient-ring" aria-hidden="true" />

                {/* Seamless Tooth Media Container */}
                <div className="banner-img-wrapper">
                  <EditableMedia
                    slotId="slot-hero"
                    defaultSrc={heroModelImg}
                    alt={{ ar: 'عيادة حياة لطب الأسنان - مجسم ثلاثي الأبعاد لصحة الأسنان', en: 'Hayaah Dental Clinic - 3D Tooth Model' }}
                    className="main-hero-img"
                    width={540}
                    height={567}
                    aspectRatio="1 / 1.05"
                    isHero
                  />
                  {/* Soft CSS Elliptical Shadow Under Tooth */}
                  <div className="hero-tooth-shadow" aria-hidden="true" />
                </div>

                {/* Floating Glass Card 1: Certified Clinical Team (Outside masked element) */}
                <motion.div
                  className="hero-floating-card floating-card-doctor"
                  initial={{ opacity: 0, y: 25, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: prefersReduced ? 0 : 0.95,
                    duration: 0.65,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{ y: -4 }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="card-icon-pill">
                      <FiShield className="icon-shield" />
                    </div>
                    <div className="card-text-block">
                      <h6 className="card-title">
                        {isAr ? 'فريق طبي معتمد' : 'Certified Clinical Team'}
                      </h6>
                      <small className="card-subtitle">
                        {isAr ? 'نقابة أطباء الأسنان المصرية' : 'Egyptian Dental Syndicate'}
                      </small>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Glass Card 2: 4.6★ Google Rating (Outside masked element) */}
                <motion.div
                  className="hero-floating-card floating-card-rating"
                  initial={{ opacity: 0, y: -20, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: prefersReduced ? 0 : 1.1,
                    duration: 0.65,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{ y: -4 }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <div className="rating-pill-badge">
                      <FiStar className="star-gold" />
                      <span className="rating-pill-number">
                        {isAr ? CLINIC_RATING.scoreDisplayAr : CLINIC_RATING.scoreDisplay}
                      </span>
                    </div>
                    <div className="card-text-block">
                      <h6 className="card-title">
                        {isAr ? 'تقييم Google' : 'Google Rating'}
                      </h6>
                      <small className="card-subtitle">
                        {isAr
                          ? `${CLINIC_RATING.reviewsCountAr} تقييماً موثقاً`
                          : `${CLINIC_RATING.reviewsCount} Verified Reviews`}
                      </small>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Subtle Scroll Down Prompt (Fades out smoothly on scroll) */}
          <motion.div
            className="scroll-prompt text-center pb-2 pt-2"
            style={{ opacity: arrowOpacity }}
          >
            <a
              href="#services-section"
              className="scroll-prompt-link"
              aria-label={isAr ? 'انتقل إلى أقسام الخدمات' : 'Scroll down to services'}
            >
              <FiArrowDown className="scroll-arrow-bounce" />
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Banner;
