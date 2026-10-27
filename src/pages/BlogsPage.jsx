import React, { useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import FloatingActions from '../components/FloatingActions/FloatingActions';
import SectionTitle from '../components/SectionTitle/SectionTitle';
import Blogs from '../sections/Blogs/Blogs';
import PageMeta from '../components/PageMeta/PageMeta';
import { useTranslation } from '../i18n/LanguageContext';
import { getSiteUrl } from '../utils/siteUrl';
import { BLOG_POSTS } from '../data/blog';
import { motion } from 'framer-motion';
import { FiBookOpen } from 'react-icons/fi';
import './BlogsPage.scss';

const BlogsPage = () => {
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
        name: isAr ? 'المقالات الطبية' : 'Blog Articles',
        item: `${siteUrl}/blogs`,
      },
    ],
  };

  return (
    <main id="main-content" className="blogs-page-layout">
      <PageMeta
        title={{
          ar: 'المقالات والتوعية الطبية لصحة الفم والأسنان',
          en: 'Oral Health & Dental Care Articles',
        }}
        description={{
          ar: 'مقالات طبية تعليمية وإرشادات موثوقة من أطباء عيادة حياة لطب الأسنان للعناية بالأسنان وحماية اللثة وتجميل الابتسامة.',
          en: 'Educational dental health guides and care recommendations written by Hayaah Dental Clinic practitioners.',
        }}
        canonicalPath="/blogs"
        schema={breadcrumbSchema}
      />
      <Navbar />

      {/* Header Banner */}
      <section className="blogs-header-banner section-bg section-common my-4 py-5 text-center">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-700 mx-auto"
          >
            <div className="d-inline-flex align-items-center gap-2 blog-badge mb-3">
              <FiBookOpen />
              <span>{language === 'ar' ? 'التوعية وصحة الفم' : 'Oral Health Education'}</span>
            </div>

            <h1 className="blogs-hero-h1 mb-3">
              {language === 'ar'
                ? 'المقالات والتوعية الطبية لصحة فمك وأسنانك'
                : 'Evidence-Based Dental Health Articles'}
            </h1>

            <p className="blogs-hero-lead mb-0">
              {language === 'ar'
                ? 'مقالات طبية تعليمية مبسطة كتبها أطباؤنا لتقديم نصائح موثوقة لحماية ابتسامتك وابتسامة أطفالك.'
                : 'Educational dental guides and care recommendations written by our clinical practitioners.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* All Blog Posts */}
      <Blogs limit={6} showAllBtn={false} />

      <Footer />
      <FloatingActions />
    </main>
  );
};

export default BlogsPage;
