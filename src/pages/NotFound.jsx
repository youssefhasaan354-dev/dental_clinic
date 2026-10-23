import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import FloatingActions from '../components/FloatingActions/FloatingActions';
import EditableMedia from '../components/VisualEdit/EditableMedia';
import PageMeta from '../components/PageMeta/PageMeta';
import { useTranslation } from '../i18n/LanguageContext';
import { FiHome, FiCompass, FiCalendar } from 'react-icons/fi';
import './NotFound.scss';

const NotFound = () => {
  const { language } = useTranslation();

  return (
    <main id="main-content" className="not-found-page-layout">
      <PageMeta
        title={{ ar: 'الصفحة غير موجودة (404)', en: '404 - Page Not Found' }}
        description={{
          ar: 'عذراً، الصفحة التي تبحث عنها غير موجودة في موقع عيادة حياة لطب الأسنان.',
          en: 'Sorry, the requested page was not found at Hayaah Dental Clinic.',
        }}
        canonicalPath="/404"
        noindex={true}
      />
      <Navbar />

      <section className="not-found-content-section py-5 my-5 text-center">
        <div className="container">
          <div className="not-found-card p-5 max-w-600 mx-auto rounded-5 shadow-sm border bg-white">
            <div className="not-found-media mb-3">
              <EditableMedia
                slotId="slot-notfound"
                defaultSrc=""
                alt={{ ar: 'الصفحة غير موجودة', en: 'Page Not Found' }}
                width={200}
                height={200}
                style={{ objectFit: 'contain' }}
                inline
              />
            </div>
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

              <div className="theme-btn">
                <Link to="/contact">
                  <FiCalendar />
                  <span>{language === 'ar' ? 'حجز موعد كشف' : 'Book Appointment'}</span>
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
