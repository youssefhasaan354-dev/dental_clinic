import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n/LanguageContext';
import { IMAGES } from '../../data/images';
import EditableMedia from '../../components/VisualEdit/EditableMedia';
import { CLINIC_DATA } from '../../data/clinic';
import { FiCalendar, FiShield, FiHeart } from 'react-icons/fi';
import './AboutBanner.scss';

const AboutBanner = () => {
  const { language } = useTranslation();

  return (
    <section className="about-banner-section section-bg section-common my-4 py-5">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <motion.div
              className="about-banner-text"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="d-inline-flex align-items-center gap-2 about-badge mb-3">
                <FiShield />
                <span>
                  {language === 'ar' ? 'تأسست عام ٢٠١٥ • النزهة ومصر الجديدة' : 'Founded in 2015 • El Nozha, Cairo'}
                </span>
              </div>

              <h1 className="about-hero-title mb-3">
                {language === 'ar'
                  ? 'رعاية طبية نابعة من القلب.. لأكثر من ١٠ سنوات'
                  : 'Healthcare from the Heart.. Over a Decade of Trusted Smiles'}
              </h1>

              <p className="about-hero-p mb-4">
                {language === 'ar'
                  ? 'منذ انطلاق عيادة حياة لطب الأسنان في عام 2015، ونحن نضع راحة المريض وسلامته في صلب رسالتنا اليومية. نجمع بين أحدث ما توصل إليه العلم في طب وتجميل الأسنان، مع لمسة إنسانية هادئة تجعل زيارتك تجربة مريحة وممتعة.'
                  : 'Since our establishment in 2015, Hayaah Dental Clinic has placed patient well-being and clinical precision at the center of our daily mission. We fuse world-class technological dentistry with warm, transparent care.'}
              </p>

              <div className="about-metrics-row d-flex gap-4 mb-4">
                <div>
                  <h3 className="m-num">+١٠</h3>
                  <span className="m-label">{language === 'ar' ? 'سنوات من الخبرة' : 'Years of Experience'}</span>
                </div>
                <div>
                  <h3 className="m-num">{language === 'ar' ? CLINIC_DATA.rating.scoreDisplayAr : CLINIC_DATA.rating.scoreDisplay} ★</h3>
                  <span className="m-label">{language === 'ar' ? 'تقييم خرائط Google' : 'Google Rating'}</span>
                </div>
                <div>
                  <h3 className="m-num">١٢+</h3>
                  <span className="m-label">{language === 'ar' ? 'تخصصاً علاجياً' : 'Specialties'}</span>
                </div>
              </div>

              <div className="theme-btn">
                <Link to="/contact">
                  <FiCalendar />
                  <span>{language === 'ar' ? 'احجز استشارتك الآن' : 'Book a Consultation'}</span>
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="col-lg-6">
            <motion.div
              className="about-banner-img-box text-center position-relative"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
            >
              <div className="d-flex gap-3 justify-content-center">
                <EditableMedia
                  slotId="slot-about-banner-1"
                  defaultSrc={IMAGES.about.banner1}
                  alt={{ ar: 'عيادة حياة لطب الأسنان - العيادة والأجهزة', en: 'Hayaah Clinic Suite' }}
                  className="banner-img-1"
                  width={280}
                  height={380}
                />
                <EditableMedia
                  slotId="slot-about-banner-2"
                  defaultSrc={IMAGES.about.banner2}
                  alt={{ ar: 'طبيب الأسنان أثناء الفحص الطبي', en: 'Doctor at Work' }}
                  className="banner-img-2"
                  width={280}
                  height={380}
                />
              </div>

              <div className="about-floating-trust glass-card">
                <FiHeart className="text-danger" />
                <span>{language === 'ar' ? 'بيئة علاجية خالية من القلق' : 'Calm & Fear-Free Care'}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutBanner;
