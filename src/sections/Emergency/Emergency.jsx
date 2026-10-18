import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n/LanguageContext';
import { CLINIC_DATA } from '../../data/clinic';
import { IMAGES } from '../../data/images';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import { FiPhoneCall, FiAlertCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import './Emergency.scss';

const Emergency = () => {
  const { t, language } = useTranslation();

  const emergencyWhatsAppMsg = language === 'ar'
    ? 'مرحباً، لدي حالة طوارئ أسنان عاجلة وأحتاج مساعدة سريعة.'
    : 'Hello, I have an urgent dental emergency and need immediate assistance.';

  return (
    <section className="emergency-section section-common py-5 my-5">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <motion.div
              className="emergency-img-wrapper"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src={IMAGES.sections.emergency}
                alt="Dental Emergency Care"
                className="emergency-image"
                width="500"
                height="450"
              />
            </motion.div>
          </div>

          <div className="col-lg-6">
            <motion.div
              className="emergency-text-content"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="emergency-alert-tag d-inline-flex align-items-center gap-2 mb-3">
                <FiAlertCircle />
                <span>{t('emergency.subTitle')}</span>
              </div>

              <h2 className="emergency-heading">
                {t('emergency.title')}
              </h2>

              <p className="emergency-description">
                {t('emergency.desc')}
              </p>

              <div className="emergency-actions d-flex flex-wrap gap-3 mt-4">
                <a
                  href={CLINIC_DATA.phone.telLink}
                  className="btn-emergency-call"
                >
                  <FiPhoneCall className="icon-ring" />
                  <span>{t('emergency.callNow')}: {CLINIC_DATA.phone.display}</span>
                </a>

                <a
                  href={CLINIC_DATA.whatsapp.getChatUrl(emergencyWhatsAppMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-emergency-whatsapp"
                >
                  <FaWhatsapp />
                  <span>{language === 'ar' ? 'واتساب الطوارئ' : 'Emergency WhatsApp'}</span>
                </a>
              </div>

              <p className="emergency-hours-note mt-3">
                <small>{t('emergency.availableNote')}</small>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Emergency;
