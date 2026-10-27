import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import FloatingActions from '../components/FloatingActions/FloatingActions';
import SectionTitle from '../components/SectionTitle/SectionTitle';
import ContactForm from '../components/ContactForm/ContactForm';
import OpenBadge from '../components/OpenBadge/OpenBadge';
import { CLINIC_DATA } from '../data/clinic';
import { useTranslation } from '../i18n/LanguageContext';
import {
  FiPhoneCall,
  FiMapPin,
  FiClock,
  FiNavigation,
  FiExternalLink,
  FiHeart,
  FiCheck,
} from 'react-icons/fi';
import { FaWhatsapp, FaFacebookF } from 'react-icons/fa';
import PageMeta from '../components/PageMeta/PageMeta';
import { getSiteUrl } from '../utils/siteUrl';
import './ContactPage.scss';

const ContactPage = () => {
  const { language, t } = useTranslation();
  const siteUrl = getSiteUrl();
  const isAr = language === 'ar';

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: isAr ? 'الرئيسية' : 'Home',
        item: `${siteUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: isAr ? 'الاتصال بنا' : 'Contact Us',
        item: `${siteUrl}/contact`,
      },
    ],
  };

  // Determine current day in Cairo to highlight in working hours table
  const cairoDayIndex = (() => {
    try {
      const cairoDate = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Africa/Cairo',
        weekday: 'short',
      });
      const day = formatter.format(cairoDate);
      if (day.startsWith('Sat')) return 0;
      if (day.startsWith('Sun')) return 1;
      if (day.startsWith('Mon')) return 2;
      if (day.startsWith('Tue')) return 3;
      if (day.startsWith('Wed')) return 4;
      if (day.startsWith('Thu')) return 5;
      if (day.startsWith('Fri')) return 6;
      return 0;
    } catch (e) {
      return 0;
    }
  })();

  return (
    <main id="main-content" className="contact-page-layout">
      <PageMeta
        title={{
          ar: 'اتصل بنا ومقر العيادة بمصر الجديدة',
          en: 'Contact Us & Clinic Location in Heliopolis',
        }}
        description={{
          ar: 'تواصل مع عيادة حياة لطب الأسنان بمصر الجديدة، شارع فريد سميكة. أرقام الهاتف، موقع الخريطة التفاعلي، ومواعيد العمل السبت للخميس.',
          en: 'Contact Hayaah Dental Clinic in Heliopolis, Cairo. Phone numbers, interactive map navigation, and working hours.',
        }}
        canonicalPath="/contact"
        schema={breadcrumbSchema}
      />
      <Navbar />

      {/* Header Banner */}
      <section className="contact-header-banner section-bg section-common my-4 py-5 text-center">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-700 mx-auto"
          >
            <div className="mb-3 d-flex justify-content-center">
              <OpenBadge showDetails={true} />
            </div>

            <h1 className="contact-hero-h1 mb-3">
              {language === 'ar'
                ? 'تواصل معنا وحجز موعد كشف واستشارة'
                : 'Contact Us & Schedule Your Visit'}
            </h1>

            <p className="contact-hero-lead mb-0">
              {language === 'ar'
                ? 'يسعدنا استقبالك في عيادتنا بالنزهة ومصر الجديدة. فريقنا الطبي في انتظارك لتوفير أرقى رعاية سنية لابتسامتك.'
                : 'We are delighted to welcome you to our Heliopolis clinic. Our dental team is here to answer your questions and book your visit.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards & Live Hours Table */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4 mb-5">
            {/* Phone Card */}
            <div className="col-lg-4 col-md-6">
              <div className="contact-method-card p-4 rounded-4 border bg-white h-100 d-flex flex-column">
                <div className="method-icon-bubble mb-3">
                  <FiPhoneCall />
                </div>
                <h4 className="fw-bold mb-1">{language === 'ar' ? 'الهاتف المباشر' : 'Direct Phone Line'}</h4>
                <p className="text-muted small mb-3">
                  {language === 'ar' ? 'متاح طوال ساعات العمل الرسمية' : 'Available during working hours'}
                </p>
                <a href={CLINIC_DATA.phone.telLink} className="phone-display-big mt-auto" dir="ltr">
                  {CLINIC_DATA.phone.display}
                </a>
              </div>
            </div>

            {/* WhatsApp Card */}
            <div className="col-lg-4 col-md-6">
              <div className="contact-method-card p-4 rounded-4 border bg-white h-100 d-flex flex-column">
                <div className="method-icon-bubble whatsapp-bubble mb-3">
                  <FaWhatsapp />
                </div>
                <h4 className="fw-bold mb-1">{language === 'ar' ? 'محادثة واتساب' : 'WhatsApp Chat'}</h4>
                <p className="text-muted small mb-3">
                  {language === 'ar' ? 'تنسيق سريع للمواعيد والاستفسارات' : 'Quick scheduling and questions'}
                </p>
                <a
                  href={CLINIC_DATA.whatsapp.getChatUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-display-link mt-auto d-inline-flex align-items-center gap-2"
                >
                  <span>{language === 'ar' ? 'بدء محادثة واتساب الآن' : 'Start WhatsApp Chat'}</span>
                  <FiExternalLink />
                </a>
              </div>
            </div>

            {/* Address Card */}
            <div className="col-lg-4 col-md-12">
              <div className="contact-method-card p-4 rounded-4 border bg-white h-100 d-flex flex-column">
                <div className="method-icon-bubble mb-3">
                  <FiMapPin />
                </div>
                <h4 className="fw-bold mb-1">{language === 'ar' ? 'موقع العيادة' : 'Clinic Location'}</h4>
                <p className="mb-1 text-dark fw-bold small">
                  {language === 'ar' ? CLINIC_DATA.address.ar : CLINIC_DATA.address.en}
                </p>
                <small className="text-muted d-block mb-3">
                  {language === 'ar'
                    ? `(${CLINIC_DATA.address.landmarkAr})`
                    : `(${CLINIC_DATA.address.landmarkEn})`}
                </small>
                <a
                  href={CLINIC_DATA.googleMaps.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="directions-btn-link mt-auto d-inline-flex align-items-center gap-2"
                >
                  <FiNavigation />
                  <span>{t('common.getDirections')}</span>
                  <FiExternalLink />
                </a>
              </div>
            </div>
          </div>

          {/* Working Hours Table & Booking Form Side by Side */}
          <div className="row g-5 align-items-stretch">
            {/* Column 1: Working Hours Table with TODAY HIGHLIGHTED */}
            <div className="col-lg-5">
              <div className="working-hours-card p-4 p-md-5 rounded-4 bg-white border shadow-sm h-100 d-flex flex-column">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h3 className="fw-bold mb-0 d-flex align-items-center gap-2">
                    <FiClock className="text-primary" />
                    <span>{t('common.workingHoursTitle')}</span>
                  </h3>
                  <span className="cairo-tz-badge">Cairo (GMT+2)</span>
                </div>

                <div className="hours-table-wrapper flex-grow-1">
                  <table className="table hours-styled-table mb-0">
                    <tbody>
                      {CLINIC_DATA.hours.map((h, idx) => {
                        const isToday = idx === cairoDayIndex;
                        return (
                          <tr key={idx} className={isToday ? 'row-today-active' : ''}>
                            <td className="day-name">
                              {language === 'ar' ? h.dayAr : h.dayEn}
                              {isToday && (
                                <span className="today-badge ms-2">
                                  {language === 'ar' ? 'اليوم' : 'Today'}
                                </span>
                              )}
                            </td>
                            <td className="day-hours text-end">
                              {h.isClosed ? (
                                <span className="badge-closed-tag">
                                  {language === 'ar' ? 'مغلق (عطلة)' : 'Closed'}
                                </span>
                              ) : (
                                <span className="badge-open-hours">
                                  {language === 'ar' ? '١٠:٠٠ ص - ١٠:٠٠ م' : '10:00 AM - 10:00 PM'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="amenities-footer-box p-3 rounded-3 mt-4 bg-light border">
                  <div className="d-flex align-items-center gap-2 text-dark fw-bold small mb-1">
                    <FiHeart className="text-danger" />
                    <span>{language === 'ar' ? 'مرافق وخدمات العيادة:' : 'Clinic Amenities:'}</span>
                  </div>
                  <ul className="list-unstyled mb-0 d-flex flex-wrap gap-2">
                    {CLINIC_DATA.amenities[language].map((am, i) => (
                      <li key={i} className="badge bg-white text-dark border py-2 px-3">
                        <FiCheck className="text-success me-1" /> {am}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Column 2: Booking Form */}
            <div className="col-lg-7">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Google Map Section */}
      <section className="contact-map-embed-section py-4">
        <div className="container">
          <SectionTitle
            subTitle={language === 'ar' ? 'الموقع الجغرافي' : 'Interactive Map'}
            title={language === 'ar' ? 'خريطة الوصول إلى عيادة حياة' : 'How to Reach Hayaah Dental Clinic'}
            align="center"
          />

          <div className="map-large-wrapper rounded-4 overflow-hidden border shadow-sm">
            <iframe
              title="Hayaah Clinic Map Navigation"
              src={language === 'ar' ? CLINIC_DATA.googleMaps.embedUrl : CLINIC_DATA.googleMaps.embedUrlEn}
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingActions />
    </main>
  );
};

export default ContactPage;
