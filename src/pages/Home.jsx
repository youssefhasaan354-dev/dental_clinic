import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import Banner from '../sections/Banner/Banner';
import TrustStrip from '../sections/TrustStrip/TrustStrip';
import Services from '../sections/Services/Services';
import Emergency from '../sections/Emergency/Emergency';
import Features from '../sections/Features/Features';
import Expert from '../sections/Expert/Expert';
import ProcessTimeline from '../components/ProcessTimeline/ProcessTimeline';
import Team from '../sections/Team/Team';
import RatingShowcase from '../components/RatingShowcase/RatingShowcase';
import Gallery from '../sections/Gallery/Gallery';
import Blogs from '../sections/Blogs/Blogs';
import Faq from '../sections/Faq/Faq';
import Appointment from '../sections/Appointment/Appointment';
import Footer from '../components/Footer/Footer';
import FloatingActions from '../components/FloatingActions/FloatingActions';
import PageMeta from '../components/PageMeta/PageMeta';
import { FAQS } from '../data/faq';
import { useTranslation } from '../i18n/LanguageContext';

const Home = () => {
  const { language } = useTranslation();

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.slice(0, 6).map((item) => ({
      '@type': 'Question',
      name: item.q[language] || item.q.ar,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a[language] || item.a.ar,
      },
    })),
  };

  return (
    <main id="main-content" className="home-page-layout">
      <PageMeta
        title={{
          ar: 'عيادة حياة لطب الأسنان | القاهرة، مصر الجديدة',
          en: 'Hayaah Dental Clinic | Heliopolis, Cairo',
        }}
        description={{
          ar: 'عيادة حياة لطب الأسنان بمصر الجديدة، شارع فريد سميكة. رعاية دقيقة وهادئة، تعقيم معتمد وأشعة رقمية. احجز موعدك الآن.',
          en: 'Hayaah Dental Clinic in Heliopolis, Cairo. Gentle and precise dental care, certified sterilization and digital imaging. Book your visit today.',
        }}
        canonicalPath="/"
        schema={faqSchema}
      />
      <Navbar />
      <Banner />
      <TrustStrip />
      <Services limit={8} showAllBtn={true} />
      <Emergency />
      <Features />
      <Expert />
      <ProcessTimeline />
      <Team />
      <RatingShowcase />
      <Gallery />
      <Blogs limit={3} showAllBtn={true} />
      <Faq limit={6} />
      <Appointment />
      <Footer />
      <FloatingActions />
    </main>
  );
};

export default Home;
