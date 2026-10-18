import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { CLINIC_DATA } from '../../data/clinic';
import logoSvg from '../../assets/logo.svg';
import {
  FiPhoneCall,
  FiMapPin,
  FiClock,
  FiExternalLink,
  FiHeart,
  FiArrowUpRight,
  FiShield,
} from 'react-icons/fi';
import { FaFacebookF } from 'react-icons/fa';
import './Footer.scss';

const Footer = () => {
  const { t, language } = useTranslation();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.services'), path: '/services' },
    { name: t('nav.blogs'), path: '/blogs' },
    { name: t('nav.contact'), path: '/contact' },
  ];

  const topServices = [
    { name: language === 'ar' ? 'تنظيف وتلميع الأسنان' : 'Scaling & Polishing', path: '/services/scaling-polishing' },
    { name: language === 'ar' ? 'حشو الأسنان التجميلي' : 'Cosmetic Fillings', path: '/services/cosmetic-fillings' },
    { name: language === 'ar' ? 'علاج العصب والجذور' : 'Root Canal Treatment', path: '/services/root-canal' },
    { name: language === 'ar' ? 'زراعة الأسنان' : 'Dental Implants', path: '/services/dental-implants' },
    { name: language === 'ar' ? 'تقويم الأسنان' : 'Orthodontics', path: '/services/orthodontics' },
    { name: language === 'ar' ? 'ابتسامة هوليود وفينير' : 'Veneers & Smile Design', path: '/services/veneers' },
  ];

  return (
    <footer className="main-site-footer pt-100">
      <div className="container">
        {/* Upper Footer Grid */}
        <div className="row g-4 pb-5">
          {/* Column 1: Brand Info */}
          <div className="col-lg-4 col-md-6">
            <div className="footer-brand-block pe-lg-4">
              <Link to="/" className="footer-logo mb-3 d-inline-block">
                <img src={logoSvg} alt="Hayaah Dental Clinic" width="230" height="58" />
              </Link>

              <p className="footer-about-text">
                {t('footer.aboutText')}
              </p>

              <div className="footer-trust-badge d-inline-flex align-items-center gap-2 mb-4">
                <FiShield className="text-accent" />
                <span>{language === 'ar' ? 'مرخصة رسمياً وتعمل منذ عام ٢٠١٥' : 'Licensed clinic serving since 2015'}</span>
              </div>

              {/* Social Link */}
              <div className="footer-social-wrapper">
                <span className="social-label">{t('footer.facebookPage')}:</span>
                <a
                  href={CLINIC_DATA.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn facebook"
                  aria-label="Facebook Page"
                >
                  <FaFacebookF />
                  <span>Facebook / hayatdental</span>
                  <FiArrowUpRight />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="col-lg-2 col-md-6 col-6">
            <div className="footer-links-col">
              <h4 className="footer-heading">{t('common.quickLinks')}</h4>
              <ul className="footer-links-list list-unstyled">
                {quickLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 3: Top Services */}
          <div className="col-lg-3 col-md-6 col-6">
            <div className="footer-links-col">
              <h4 className="footer-heading">{t('nav.services')}</h4>
              <ul className="footer-links-list list-unstyled">
                {topServices.map((svc) => (
                  <li key={svc.path}>
                    <Link to={svc.path}>{svc.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 4: Contact & Verified Location */}
          <div className="col-lg-3 col-md-6">
            <div className="footer-contact-block">
              <h4 className="footer-heading">{t('footer.contactTitle')}</h4>

              <div className="contact-item d-flex gap-3 mb-3">
                <div className="contact-icon-bubble">
                  <FiPhoneCall />
                </div>
                <div>
                  <span className="contact-sub">{language === 'ar' ? 'رقم الهاتف المباشر' : 'Direct Phone Line'}</span>
                  <a href={CLINIC_DATA.phone.telLink} className="contact-val phone-link" dir="ltr">
                    {CLINIC_DATA.phone.display}
                  </a>
                </div>
              </div>

              <div className="contact-item d-flex gap-3 mb-3">
                <div className="contact-icon-bubble">
                  <FiClock />
                </div>
                <div>
                  <span className="contact-sub">{t('common.workingHoursTitle')}</span>
                  <span className="contact-val">
                    {language === 'ar' ? 'السبت - الخميس: ١٠:٠٠ ص - ١٠:٠٠ م' : 'Sat - Thu: 10:00 AM - 10:00 PM'}
                  </span>
                  <span className="contact-note text-danger d-block">
                    {language === 'ar' ? 'الجمعة: عطلة أسبوعية (مغلق)' : 'Friday: Weekly Holiday (Closed)'}
                  </span>
                </div>
              </div>

              <div className="contact-item d-flex gap-3 mb-3">
                <div className="contact-icon-bubble">
                  <FiMapPin />
                </div>
                <div>
                  <span className="contact-sub">{language === 'ar' ? 'العنوان' : 'Address'}</span>
                  <p className="contact-val address-text mb-1">
                    {language === 'ar' ? CLINIC_DATA.address.ar : CLINIC_DATA.address.en}
                  </p>
                  <small className="text-muted d-block mb-2">
                    {language === 'ar' ? `(${CLINIC_DATA.address.landmarkAr})` : `(${CLINIC_DATA.address.landmarkEn})`}
                  </small>
                  <a
                    href={CLINIC_DATA.googleMaps.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="directions-link d-inline-flex align-items-center gap-1"
                  >
                    <span>{t('common.getDirections')}</span>
                    <FiExternalLink />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="footer-bottom-bar border-top py-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <p className="copyright-text mb-0">
              &copy; 2015 - {currentYear} {language === 'ar' ? CLINIC_DATA.name.ar : CLINIC_DATA.name.en}. {t('common.allRightsReserved')}.
            </p>

            <div className="footer-bottom-links d-flex align-items-center gap-4">
              <span className="amenity-tag">
                <FiHeart className="text-danger" /> {language === 'ar' ? 'دورة مياه مجهزة للمرضى' : 'Restroom Available'}
              </span>
              <a
                href={CLINIC_DATA.googleMaps.businessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="google-rating-link d-flex align-items-center gap-1"
              >
                <span>⭐ 4.6 / 5 (27 Google Reviews)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
