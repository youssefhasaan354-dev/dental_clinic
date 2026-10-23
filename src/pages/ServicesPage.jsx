import React, { useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import FloatingActions from '../components/FloatingActions/FloatingActions';
import ScrollProgress from '../components/ScrollProgress/ScrollProgress';
import Services from '../sections/Services/Services';
import Appointment from '../sections/Appointment/Appointment';
import Faq from '../sections/Faq/Faq';
import PageMeta from '../components/PageMeta/PageMeta';
import { useTranslation } from '../i18n/LanguageContext';
import { getSiteUrl } from '../utils/siteUrl';
import { motion } from 'framer-motion';
import { FiShield, FiCheckCircle } from 'react-icons/fi';
import './ServicesPage.scss';

const ServicesPage = () => {
  const { t, language } = useTranslation();
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
        name: isAr ? 'الخدمات' : 'Services',
        item: `${siteUrl}/services`,
      },
    ],
  };

  return (
    <main id="main-content" className="services-page-layout">
      <PageMeta
        title={{
          ar: 'خدمات طب وجراحة الأسنان التخصصية',
          en: 'Specialty Dental Care Services',
        }}
        description={{
          ar: 'دليل خدمات عيادة حياة لطب الأسنان بمصر الجديدة: تنظيف وتلميع، زراعة الأسنان، تقويم شفاف، حشو تجميلي، علاج الجذور، وطب أسنان الأطفال.',
          en: 'Hayaah Dental Clinic services: teeth cleaning, implants, clear aligners, cosmetic fillings, root canals, and pediatric dentistry.',
        }}
        canonicalPath="/services"
        schema={breadcrumbSchema}
      />
      <ScrollProgress />
      <Navbar />

      {/* Services Page Header Banner */}
      <section className="services-header-banner section-bg section-common my-4 py-5 text-center">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-700 mx-auto"
          >
            <div className="d-inline-flex align-items-center gap-2 catalog-badge mb-3">
              <FiShield />
              <span>{language === 'ar' ? '١٢ تخصصاً علاجياً وتجميلياً' : '12 Specialized Dental Disciplines'}</span>
            </div>

            <h1 className="services-hero-h1 mb-3">
              {language === 'ar'
                ? 'دليلك الشامل لخدمات طب وجراحة الأسنان'
                : 'Comprehensive Specialty Dental Services'}
            </h1>

            <p className="services-hero-lead mb-4">
              {language === 'ar'
                ? 'نقدم في عيادة حياة رعاية فموية تخصصية متكاملة لجميع أفراد الأسرة، بأحدث التقنيات وأجود الخامات الطبية المعتمدة لصحة أسنانك.'
                : 'From routine preventative cleanings to advanced dental implants, orthodontics, and smile design, our team provides evidence-based care tailored to your comfort.'}
            </p>

            <div className="d-flex justify-content-center flex-wrap gap-4 text-start">
              <div className="d-flex align-items-center gap-2">
                <FiCheckCircle className="text-success" />
                <span className="fw-bold small">{language === 'ar' ? 'تخدير موضعي لطيف وهادئ' : 'Gentle Local Anesthesia'}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <FiCheckCircle className="text-success" />
                <span className="fw-bold small">{language === 'ar' ? 'خامات زركون وإيماكس معتمدة' : 'Certified Bio-Materials'}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <FiCheckCircle className="text-success" />
                <span className="fw-bold small">{language === 'ar' ? 'تعقيم فندقي معتمد' : 'Hospital-Grade Sterilization'}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Complete 12 Services Catalog */}
      <Services limit={12} showAllBtn={false} />

      {/* Patient FAQs */}
      <Faq limit={6} />

      {/* Booking with Map */}
      <Appointment />

      <Footer />
      <FloatingActions />
    </main>
  );
};

export default ServicesPage;
