import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n/LanguageContext';
import { CLINIC_DATA } from '../../data/clinic';
import { TESTIMONIALS } from '../../data/testimonials';
import { FaStar, FaStarHalfAlt, FaGoogle } from 'react-icons/fa';
import { FiExternalLink, FiCheckCircle } from 'react-icons/fi';
import SectionTitle from '../SectionTitle/SectionTitle';
import './RatingShowcase.scss';

const RatingShowcase = () => {
  const { t, language } = useTranslation();
  const hasRealReviews = TESTIMONIALS && TESTIMONIALS.length > 0;

  return (
    <section className="rating-showcase-section pt-100 pb-70">
      <div className="container">
        <SectionTitle
          subTitle={t('ratingShowcase.sectionSub')}
          title={t('ratingShowcase.sectionTitle')}
          align="center"
        />

        <div className="row justify-content-center">
          <div className="col-lg-10">
            <motion.div
              className="rating-hero-card glass-card text-center p-4 p-md-5"
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="google-badge-pill mb-3">
                <FaGoogle className="google-icon" />
                <span>Google Verified Business</span>
              </div>

              {/* Big Animated 4.6 ★ */}
              <div className="rating-big-number-row d-flex align-items-center justify-content-center gap-3 mb-2">
                <motion.span
                  className="rating-big-number"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                >
                  {CLINIC_DATA.rating.score}
                </motion.span>
                <div className="stars-column text-start">
                  <div className="stars-graphic d-flex gap-1 mb-1">
                    <FaStar className="star-filled" />
                    <FaStar className="star-filled" />
                    <FaStar className="star-filled" />
                    <FaStar className="star-filled" />
                    <FaStarHalfAlt className="star-filled" />
                  </div>
                  <span className="out-of-five">من 5.0 نجوم</span>
                </div>
              </div>

              <p className="rating-count-subtitle mb-4">
                {language === 'ar'
                  ? `بناءً على ${CLINIC_DATA.rating.reviewsCount} تقييماً موثقاً على خرائط Google`
                  : `Based on ${CLINIC_DATA.rating.reviewsCount} verified patient reviews on Google Maps`}
              </p>

              {/* Highlights tags */}
              <div className="rating-highlights-pills d-flex justify-content-center flex-wrap gap-2 mb-4">
                <span className="highlight-pill">
                  <FiCheckCircle className="text-success" />
                  <span>{language === 'ar' ? 'نظافة وتعقيم فندقي' : 'Pristine Sterilization'}</span>
                </span>
                <span className="highlight-pill">
                  <FiCheckCircle className="text-success" />
                  <span>{language === 'ar' ? 'أطباء متخصصون وودودون' : 'Gentle Specialized Staff'}</span>
                </span>
                <span className="highlight-pill">
                  <FiCheckCircle className="text-success" />
                  <span>{language === 'ar' ? 'التزام بالمواعيد' : 'Punctual Appointments'}</span>
                </span>
              </div>

              {/* Google Maps CTA Button */}
              <div className="theme-btn theme-btn-teal">
                <a
                  href={CLINIC_DATA.googleMaps.businessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-google-maps"
                >
                  <FaGoogle />
                  <span>{t('ratingShowcase.buttonText')}</span>
                  <FiExternalLink />
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Ready-to-fill slider if testimonials exist, hidden when array is empty */}
        {hasRealReviews && (
          <div className="testimonials-slider-block mt-5">
            <div className="row g-4">
              {TESTIMONIALS.map((item) => (
                <div key={item.id} className="col-md-4">
                  <div className="client-review-card p-4">
                    <p className="review-comment">"{language === 'ar' ? item.commentAr : item.commentEn}"</p>
                    <h5 className="reviewer-name">{item.name}</h5>
                    <small className="reviewer-service">{language === 'ar' ? item.serviceAr : item.serviceEn}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RatingShowcase;
