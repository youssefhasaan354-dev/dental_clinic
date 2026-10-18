import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../i18n/LanguageContext';
import { CLINIC_DATA } from '../../data/clinic';
import { FiPhoneCall, FiArrowUp, FiMapPin, FiCalendar } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './FloatingActions.scss';

const FloatingActions = () => {
  const { language, t } = useTranslation();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const defaultWhatsAppMsg = language === 'ar'
    ? 'السلام عليكم، أود الاستفسار عن حجز موعد كشف في عيادة حياة لطب الأسنان.'
    : 'Hello, I would like to inquire about booking a dental consultation at Hayaah Dental Clinic.';

  return (
    <>
      {/* Desktop Floating Action Buttons (Corner) */}
      <div className="floating-actions-desktop d-none d-md-flex flex-column align-items-center gap-3">
        {/* Back to top button */}
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              type="button"
              className="float-btn btn-back-to-top"
              onClick={scrollToTop}
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              title={language === 'ar' ? 'العودة للأعلى' : 'Back to top'}
              aria-label="Back to top"
            >
              <FiArrowUp />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Direct Call Button */}
        <motion.a
          href={CLINIC_DATA.phone.telLink}
          className="float-btn btn-float-call"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          title={language === 'ar' ? `اتصل بنا: ${CLINIC_DATA.phone.display}` : `Call: ${CLINIC_DATA.phone.display}`}
          aria-label="Call clinic directly"
        >
          <FiPhoneCall />
          <span className="tooltip-label">{CLINIC_DATA.phone.display}</span>
        </motion.a>

        {/* WhatsApp Button */}
        <motion.a
          href={CLINIC_DATA.whatsapp.getChatUrl(defaultWhatsAppMsg)}
          target="_blank"
          rel="noopener noreferrer"
          className="float-btn btn-float-whatsapp"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title={language === 'ar' ? 'محادثة واتساب' : 'Chat on WhatsApp'}
          aria-label="Chat on WhatsApp"
        >
          <span className="pulse-whatsapp"></span>
          <FaWhatsapp />
          <span className="tooltip-label">{language === 'ar' ? 'واتساب العيادة' : 'WhatsApp'}</span>
        </motion.a>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="mobile-sticky-bottom-bar d-flex d-md-none">
        <a
          href={CLINIC_DATA.phone.telLink}
          className="sticky-item call-item"
        >
          <FiPhoneCall />
          <span>{language === 'ar' ? 'اتصال' : 'Call'}</span>
        </a>

        <a
          href={CLINIC_DATA.whatsapp.getChatUrl(defaultWhatsAppMsg)}
          target="_blank"
          rel="noopener noreferrer"
          className="sticky-item whatsapp-item"
        >
          <FaWhatsapp />
          <span>{language === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
        </a>

        <Link
          to="/contact"
          className="sticky-item book-item"
        >
          <FiCalendar />
          <span>{language === 'ar' ? 'حجز موعد' : 'Book'}</span>
        </Link>

        <a
          href={CLINIC_DATA.googleMaps.directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="sticky-item directions-item"
        >
          <FiMapPin />
          <span>{language === 'ar' ? 'الاتجاهات' : 'Directions'}</span>
        </a>
      </div>
    </>
  );
};

export default FloatingActions;
