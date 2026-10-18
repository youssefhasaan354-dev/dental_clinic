import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import FloatingActions from '../components/FloatingActions/FloatingActions';
import { useTranslation } from '../i18n/LanguageContext';
import { FiHome, FiCompass } from 'react-icons/fi';
import './NotFound.scss';

const NotFound = () => {
  const { language } = useTranslation();

  return (
    <main id="main-content" className="not-found-page-layout">
      <Navbar />

      <section className="not-found-content-section py-5 my-5 text-center">
        <div className="container">
          <div className="not-found-card p-5 max-w-600 mx-auto rounded-5 shadow-sm border bg-white">
            <span className="not-found-error-code">404</span>

            <h1 className="not-found-title mb-3">
              {language === 'ar' ? 'الصفحة غير موجودة' : 'Page Not Found'}
            </h1>

            <p className="not-found-desc mb-4 text-muted">
              {language === 'ar'
                ? 'عذراً، الرابط الذي تحاول الوصول إليه غير موجود أو تم نقله. يمكنك العودة للصفحة الرئيسية أو استعراض خدماتنا.'
                : 'The page you are looking for might have been moved or removed. You can return to our homepage or explore our services.'}
            </p>

            <div className="d-flex justify-content-center flex-wrap gap-3">
              <div className="theme-btn">
                <Link to="/">
                  <FiHome />
                  <span>{language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</span>
                </Link>
              </div>

              <div className="theme-btn theme-btn-outline">
                <Link to="/services">
                  <FiCompass />
                  <span>{language === 'ar' ? 'استعراض الخدمات' : 'View Services'}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingActions />
    </main>
  );
};

export default NotFound;
