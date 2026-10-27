import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../i18n/LanguageContext';
import { CLINIC_DATA } from '../../data/clinic';
import OpenBadge from '../OpenBadge/OpenBadge';
import logoSvg from '../../assets/logo.svg';
import EditableMedia from '../VisualEdit/EditableMedia';
import { FiPhoneCall, FiCalendar, FiGlobe, FiMenu, FiX, FiClock } from 'react-icons/fi';
import './Navbar.scss';

const Navbar = () => {
  const { t, language, toggleLanguage } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.services'), path: '/services' },
    { name: t('nav.blogs'), path: '/blogs' },
    { name: t('nav.contact'), path: '/contact' },
  ];

  return (
    <>
      {/* Top Utility Bar */}
      <div className="top-utility-bar">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3">
              <OpenBadge showDetails={false} />
              <span className="utility-hours d-none d-md-inline-flex align-items-center gap-1">
                <FiClock className="text-primary-color" />
                <span>{language === 'ar' ? 'السبت - الخميس: ١٠:٠٠ ص - ١٠:٠٠ م' : 'Sat - Thu: 10:00 AM - 10:00 PM'}</span>
              </span>
            </div>

            <div className="d-flex align-items-center gap-3">
              <a
                href={CLINIC_DATA.phone.telLink}
                className="utility-phone d-flex align-items-center gap-2"
                aria-label="Call clinic directly"
              >
                <FiPhoneCall className="phone-icon-pulse" />
                <span className="phone-num" dir="ltr">{CLINIC_DATA.phone.display}</span>
              </a>

              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="lang-switcher-btn"
                title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
              >
                <FiGlobe />
                <span>{language === 'ar' ? 'English' : 'العربية'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header className={`main-nav-header ${isScrolled ? 'is-sticky' : ''}`}>
        <div className="container">
          <nav className="d-flex align-items-center justify-content-between">
            {/* Logo */}
            <Link to="/" className="navbar-brand-logo" aria-label="Hayaah Dental Clinic Home">
              <EditableMedia
                slotId="slot-logo"
                defaultSrc={logoSvg}
                alt={{ ar: 'شعار عيادة حياة للأسنان', en: 'Hayaah Dental Clinic Logo' }}
                width={220}
                height={55}
                inline
              />
            </Link>

            {/* Desktop Navigation Links */}
            <ul className="desktop-nav-menu d-none d-lg-flex align-items-center mb-0 list-unstyled">
              {navLinks.map((link) => (
                <li key={link.path} className="nav-item">
                  <NavLink
                    to={link.path}
                    className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}
                    end={link.path === '/'}
                  >
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Desktop CTAs */}
            <div className="d-none d-lg-flex align-items-center gap-3">
              <a
                href={CLINIC_DATA.phone.telLink}
                className="btn-call-emergency"
                title={t('nav.emergencyCall')}
              >
                <FiPhoneCall />
                <span>{t('nav.emergencyCall')}</span>
              </a>

              <div className="theme-btn">
                <Link to="/contact">
                  <FiCalendar />
                  <span>{t('nav.bookAppointment')}</span>
                </Link>
              </div>
            </div>

            {/* Mobile Actions: Language + Toggle */}
            <div className="d-flex d-lg-none align-items-center gap-2">
              <button
                type="button"
                onClick={toggleLanguage}
                className="lang-btn-mobile"
                aria-label="Toggle language"
              >
                {language === 'ar' ? 'EN' : 'عربي'}
              </button>

              <button
                type="button"
                className="mobile-toggler-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <FiX size={26} /> : <FiMenu size={26} />}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="mobile-drawer-overlay"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="container py-4">
                <ul className="mobile-nav-list list-unstyled mb-4">
                  {navLinks.map((link, idx) => (
                    <motion.li
                      key={link.path}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <NavLink
                        to={link.path}
                        className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                        end={link.path === '/'}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.name}
                      </NavLink>
                    </motion.li>
                  ))}
                </ul>

                <div className="mobile-drawer-actions d-flex flex-column gap-3">
                  <Link
                    to="/contact"
                    className="btn-drawer-book"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiCalendar />
                    <span>{t('nav.bookAppointment')}</span>
                  </Link>

                  <a
                    href={CLINIC_DATA.phone.telLink}
                    className="btn-drawer-phone"
                  >
                    <FiPhoneCall />
                    <span dir="ltr">{CLINIC_DATA.phone.display}</span>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Navbar;
