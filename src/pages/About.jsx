import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import AboutBanner from '../sections/AboutBanner/AboutBanner';
import Priority from '../sections/Priority/Priority';
import Safety from '../sections/Safety/Safety';
import Team from '../sections/Team/Team';
import Faq from '../sections/Faq/Faq';
import Appointment from '../sections/Appointment/Appointment';
import Footer from '../components/Footer/Footer';
import FloatingActions from '../components/FloatingActions/FloatingActions';
import PageMeta from '../components/PageMeta/PageMeta';
import { useTranslation } from '../i18n/LanguageContext';
import { getSiteUrl } from '../utils/siteUrl';

const About = () => {
  const { language } = useTranslation();
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
        name: isAr ? 'عن العيادة' : 'About Us',
        item: `${siteUrl}/about`,
      },
    ],
  };

  return (
    <main id="main-content" className="about-page-layout">
      <PageMeta
        title={{
          ar: 'عن العيادة وقصة الرعاية منذ 2015',
          en: 'About Clinic & Our Story Since 2015',
        }}
        description={{
          ar: 'تعرف على قصة عيادة حياة لطب الأسنان بمصر الجديدة، معايير مكافحة العدوى والتعقيم الفندقي، وفريق الأطباء المتخصص.',
          en: 'Learn about Hayaah Dental Clinic in Heliopolis, hospital-grade sterilization standards, and our specialized dental team.',
        }}
        canonicalPath="/about"
        schema={breadcrumbSchema}
      />
      <Navbar />
      <AboutBanner />
      <Priority />
      <Safety />
      <Team />
      <Faq limit={6} />
      <Appointment />
      <Footer />
      <FloatingActions />
    </main>
  );
};

export default About;
