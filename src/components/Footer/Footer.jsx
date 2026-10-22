import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, useLanguage } from '../../i18n/LanguageContext';
import { useData } from '../../context/DataContext';
import logoSvg from '../../assets/logo.svg';
import EditableMedia from '../VisualEdit/EditableMedia';
import {
  FiPhoneCall,
  FiMapPin,
  FiClock,
  FiExternalLink,
  FiShield,
  FiInfo,
} from 'react-icons/fi';
import { FaFacebookF } from 'react-icons/fa';
import { CLINIC_RATING } from '../../data/clinic';
import './Footer.scss';

const Footer = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { clinicInfo, services } = useData();
  const currentYear = new Date().getFullYear();

  const isAr = language === 'ar';

  const quickLinks = [
    { name: isAr ? 'الرئيسية' : 'Home', path: '/' },
    { name: isAr ? 'عن العيادة' : 'About', path: '/about' },
    { name: isAr ? 'خدماتنا' : 'Services', path: '/services' },
    { name: isAr ? 'المقالات والتوعية' : 'Health Articles', path: '/blogs' },
    { name: isAr ? 'طلب موعد والتواصل' : 'Book & Contact', path: '/contact' },
    { name: isAr ? 'سياسة الخصوصية' : 'Privacy Policy', path: '/privacy' },
    { name: isAr ? 'الشروط والأحكام' : 'Terms & Disclaimer', path: '/terms' },
  ];

  const topServices = services.slice(0, 6);

  const phoneDisplay = clinicInfo?.phone || '02 2635 5669';
  const telLink = `tel:${phoneDisplay.replace(/\s+/g, '')}`;

  return (
    <footer className="main-site-footer pt-100">
      <div className="container">
        {/* Upper Footer Grid */}
        <div className="row g-4 pb-5">
          {/* Column 1: Brand Info */}
          <div className="col-lg-4 col-md-6">
            <div className="footer-brand-block pe-lg-4">
              <Link to="/" className="footer-logo mb-3 d-inline-block">
                <EditableMedia
                  slotId="slot-footer-logo"
                  defaultSrc={logoSvg}
                  alt={{ ar: 'شعار عيادة حياة للأسنان', en: 'Hayaah Dental Clinic Logo' }}
                  width={230}
                  height={58}
                  inline
                />
              </Link>

              <p className="footer-about-text">
                {isAr
                  ? (clinicInfo?.tagline?.ar || 'عيادة حياة لطب الأسنان - رعاية دقيقة مبنية على البراهين الطبية وأحدث بروتوكولات التعقيم.')
                  : (clinicInfo?.tagline?.en || 'Hayaah Dental Clinic - Evidence-based dentistry with certified sterilization protocols.')}
              </p>

              <div className="footer-trust-badge d-inline-flex align-items-center gap-2 mb-4">
                <FiShield className="text-accent" />
                <span>
                  {isAr
                    ? 'مرخصة رسمياً ومقيدة بنقابة أطباء الأسنان المصرية'
                    : 'Licensed clinic registered with Egyptian Dental Syndicate'}
                </span>
              </div>

              {/* Social Link */}
              <div className="footer-social-wrapper">
                <a
                  href={clinicInfo?.socialLinks?.facebook || 'https://facebook.com/hayaahdental'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn facebook d-inline-flex align-items-center gap-2"
                  aria-label="Facebook Page"
                >
                  <FaFacebookF />
                  <span>صفحة العيادة على فيسبوك</span>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="col-lg-2 col-md-6 col-6">
            <div className="footer-links-col">
              <h4 className="footer-heading">{isAr ? 'روابط سريعة' : 'Quick Links'}</h4>
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
              <h4 className="footer-heading">{isAr ? 'خدماتنا السريرية' : 'Clinical Services'}</h4>
              <ul className="footer-links-list list-unstyled">
                {topServices.map((svc) => (
                  <li key={svc.id}>
                    <Link to={`/services/${svc.slug}`}>
                      {isAr ? svc.title.ar : svc.title.en}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 4: Contact & Verified Location */}
          <div className="col-lg-3 col-md-6">
            <div className="footer-contact-block">
              <h4 className="footer-heading">{isAr ? 'بيانات التواصل والمقر' : 'Contact & Location'}</h4>

              <div className="contact-item d-flex gap-3 mb-3">
                <div className="contact-icon-bubble">
                  <FiPhoneCall />
                </div>
                <div>
                  <span className="contact-sub">{isAr ? 'هاتف العيادة' : 'Phone'}</span>
                  <a href={telLink} className="contact-val phone-link" dir="ltr">
                    {phoneDisplay}
                  </a>
                </div>
              </div>

              <div className="contact-item d-flex gap-3 mb-3">
                <div className="contact-icon-bubble">
                  <FiClock />
                </div>
                <div>
                  <span className="contact-sub">{isAr ? 'ساعات العمل الرسمية' : 'Clinic Hours'}</span>
                  <span className="contact-val">
                    {isAr ? 'السبت - الخميس: ١٠:٠٠ ص - ١٠:٠٠ م' : 'Sat - Thu: 10:00 AM - 10:00 PM'}
                  </span>
                  <span className="contact-note text-danger d-block">
                    {isAr ? 'الجمعة: عطلة أسبوعية' : 'Friday: Weekly Holiday'}
                  </span>
                </div>
              </div>

              <div className="contact-item d-flex gap-3 mb-3">
                <div className="contact-icon-bubble">
                  <FiMapPin />
                </div>
                <div>
                  <span className="contact-sub">{isAr ? 'العنوان' : 'Address'}</span>
                  <p className="contact-val address-text mb-1">
                    {isAr ? clinicInfo?.address?.ar : clinicInfo?.address?.en}
                  </p>
                  <a
                    href={clinicInfo?.mapDirectionsUrl || 'https://www.google.com/maps/search/?api=1&query=30.112729,31.336293'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="directions-link d-inline-flex align-items-center gap-1"
                  >
                    <span>{isAr ? 'الاتجاهات على الخريطة' : 'Get Directions'}</span>
                    <FiExternalLink />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Disclaimer Banner per Golden Rule 13 */}
        <div className="footer-medical-disclaimer p-3 rounded-3 mb-4 bg-light border text-secondary" style={{ fontSize: '0.82rem', lineHeight: '1.6' }}>
          <div className="d-flex align-items-start gap-2">
            <FiInfo className="text-primary flex-shrink-0 mt-1" />
            <div>
              <strong>{isAr ? 'إخلاء مسؤولية طبية:' : 'Medical Disclaimer:'}</strong>{' '}
              {isAr
                ? (clinicInfo?.disclaimer?.ar || 'المعلومات الواردة في هذا الموقع عامة للتوعية الصحية ولا تغني عن الفحص الطبي السريري المباشر لدى طبيب الأسنان.')
                : (clinicInfo?.disclaimer?.en || 'Information on this website is for general educational purposes only and does not replace a direct clinical dental examination.')}
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="footer-bottom-bar border-top py-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <p className="copyright-text mb-0">
              &copy; 2015 - {currentYear} {isAr ? clinicInfo?.name?.ar : clinicInfo?.name?.en}. {isAr ? 'كافة الحقوق محفوظة.' : 'All rights reserved.'}
            </p>

            <div className="footer-bottom-links d-flex align-items-center gap-3">
              <Link to="/privacy" className="text-muted text-decoration-none small">
                {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </Link>
              <span className="text-muted">•</span>
              <Link to="/terms" className="text-muted text-decoration-none small">
                {isAr ? 'الشروط والأحكام' : 'Terms of Use'}
              </Link>
              <span className="text-muted">•</span>
              <a
                href={clinicInfo?.mapDirectionsUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="google-rating-link d-flex align-items-center gap-1 text-decoration-none text-muted small"
              >
                <span>⭐ {isAr ? `${CLINIC_RATING.scoreDisplayAr} / ٥ (${CLINIC_RATING.reviewsCountAr} تقييم)` : `${CLINIC_RATING.scoreDisplay} / 5 (${CLINIC_RATING.reviewsCount} Google Reviews)`}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
