import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n/LanguageContext';
import { CLINIC_DATA } from '../../data/clinic';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import ContactForm from '../../components/ContactForm/ContactForm';
import { FiMapPin, FiExternalLink, FiNavigation, FiClock, FiPhoneCall } from 'react-icons/fi';
import './Appointment.scss';

const Appointment = () => {
  const { t, language } = useTranslation();

  return (
    <section id="appointment-booking-section" className="appointment-map-section pt-100 pb-70">
      <div className="container">
        <SectionTitle
          subTitle={t('appointment.sectionSub')}
          title={t('appointment.sectionTitle')}
          description={t('appointment.sectionDesc')}
          align="center"
        />

        <div className="row g-5 align-items-stretch">
          {/* Column 1: Real Verified Google Map & Location Card */}
          <div className="col-lg-5 col-md-12">
            <motion.div
              className="clinic-location-map-card h-100 d-flex flex-column"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              {/* Interactive Real Google Maps Embed */}
              <div className="google-map-frame-box flex-grow-1 position-relative">
                <iframe
                  title="Hayaah Dental Clinic Cairo Map"
                  src={language === 'ar' ? CLINIC_DATA.googleMaps.embedUrl : CLINIC_DATA.googleMaps.embedUrlEn}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '340px' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>

                <div className="map-directions-floating">
                  <a
                    href={CLINIC_DATA.googleMaps.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-map-directions"
                  >
                    <FiNavigation />
                    <span>{t('common.getDirections')}</span>
                    <FiExternalLink />
                  </a>
                </div>
              </div>

              {/* Location Details Bottom Panel */}
              <div className="location-info-panel p-4">
                <div className="d-flex align-items-start gap-3 mb-3">
                  <div className="loc-icon-bubble">
                    <FiMapPin />
                  </div>
                  <div>
                    <h5 className="loc-title mb-1">
                      {language === 'ar' ? 'عنوان عيادة حياة' : 'Hayaah Dental Clinic Address'}
                    </h5>
                    <p className="loc-address mb-1">
                      {language === 'ar' ? CLINIC_DATA.address.ar : CLINIC_DATA.address.en}
                    </p>
                    <small className="loc-landmark text-muted">
                      {language === 'ar'
                        ? `علامة مميزة: ${CLINIC_DATA.address.landmarkAr}`
                        : `Landmark: ${CLINIC_DATA.address.landmarkEn}`}
                    </small>
                  </div>
                </div>

                <div className="row g-2 pt-3 border-top">
                  <div className="col-sm-6">
                    <div className="d-flex align-items-center gap-2">
                      <FiClock className="text-primary" />
                      <small className="fw-bold">
                        {language === 'ar' ? '١٠ ص - ١٠ م (الجمعة مغلق)' : '10 AM - 10 PM (Fri Closed)'}
                      </small>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="d-flex align-items-center gap-2">
                      <FiPhoneCall className="text-primary" />
                      <a href={CLINIC_DATA.phone.telLink} className="text-primary fw-bold text-decoration-none" dir="ltr">
                        {CLINIC_DATA.phone.display}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Column 2: Booking Form */}
          <div className="col-lg-7 col-md-12">
            <motion.div
              className="booking-form-container h-100"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Appointment;
