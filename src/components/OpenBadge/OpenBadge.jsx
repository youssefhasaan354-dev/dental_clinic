import React, { useState, useEffect } from 'react';
import { getCairoClinicStatus } from '../../data/clinic';
import { useTranslation } from '../../i18n/LanguageContext';
import { FiClock } from 'react-icons/fi';
import './OpenBadge.scss';

const OpenBadge = ({ showDetails = true, className = '' }) => {
  const { language } = useTranslation();
  const [status, setStatus] = useState(getCairoClinicStatus);

  useEffect(() => {
    // Re-check Cairo time every minute
    const interval = setInterval(() => {
      setStatus(getCairoClinicStatus());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const isOpen = status.isOpen;
  const statusLabel = isOpen
    ? (language === 'ar' ? 'مفتوح الآن' : 'Open Now')
    : (language === 'ar' ? 'مغلق الآن' : 'Closed Now');

  const detailText = language === 'ar' ? status.nextOpeningTextAr : status.nextOpeningTextEn;

  return (
    <div className={`open-badge-container ${isOpen ? 'is-open' : 'is-closed'} ${className}`}>
      <span className="pulse-indicator">
        <span className="pulse-ring"></span>
        <span className="pulse-dot"></span>
      </span>
      <span className="badge-label">{statusLabel}</span>
      {showDetails && (
        <span className="badge-detail">
          <FiClock className="badge-icon" />
          <span>{detailText}</span>
        </span>
      )}
    </div>
  );
};

export default OpenBadge;
