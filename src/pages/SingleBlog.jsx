import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import FloatingActions from '../components/FloatingActions/FloatingActions';
import ScrollProgress from '../components/ScrollProgress/ScrollProgress';
import { getBlogPostBySlug, BLOG_POSTS } from '../data/blog';
import { useTranslation } from '../i18n/LanguageContext';
import {
  FiClock,
  FiCalendar,
  FiShare2,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiArrowLeft,
  FiArrowRight,
} from 'react-icons/fi';
import { FaFacebookF, FaWhatsapp, FaTwitter } from 'react-icons/fa';
import './SingleBlog.scss';

const SingleBlog = () => {
  const { url } = useParams();
  const { language, t } = useTranslation();
  const post = getBlogPostBySlug(url);
  const [copied, setCopied] = useState(false);

  const ArrowIcon = language === 'ar' ? FiArrowLeft : FiArrowRight;
  const ChevronIcon = language === 'ar' ? FiChevronLeft : FiChevronRight;

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [url]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareTitle = language === 'ar' ? post.title.ar : post.title.en;
  const currentUrl = encodeURIComponent(window.location.href);

  return (
    <main id="main-content" className="single-blog-page-layout">
      <ScrollProgress />
      <Navbar />

      <article className="single-article-container py-5">
        <div className="container">
          {/* Breadcrumbs */}
          <nav className="detail-breadcrumbs mb-4" aria-label="Breadcrumb">
            <Link to="/">{t('nav.home')}</Link>
            <ChevronIcon className="breadcrumb-separator" />
            <Link to="/blogs">{t('nav.blogs')}</Link>
            <ChevronIcon className="breadcrumb-separator" />
            <span className="current-crumb">
              {language === 'ar' ? post.category.ar : post.category.en}
            </span>
          </nav>

          <div className="row justify-content-center">
            <div className="col-lg-9">
              {/* Category & Title */}
              <div className="article-header text-center mb-4">
                <span className="article-cat-badge mb-3 d-inline-block">
                  {language === 'ar' ? post.category.ar : post.category.en}
                </span>

                <h1 className="article-main-heading mb-3">
                  {language === 'ar' ? post.title.ar : post.title.en}
                </h1>

                <div className="article-meta-info d-flex justify-content-center align-items-center gap-4 flex-wrap text-muted">
                  <span className="d-flex align-items-center gap-1">
                    <FiCalendar /> {language === 'ar' ? post.date.ar : post.date.en}
                  </span>
                  <span className="d-flex align-items-center gap-1">
                    <FiClock /> {language === 'ar' ? post.readingTime.ar : post.readingTime.en}
                  </span>
                  <span className="d-flex align-items-center gap-1 text-success fw-bold">
                    <FiCheckCircle />
                    {language === 'ar' ? 'مراجعة طبية معتمدة' : 'Medically Reviewed'}
                  </span>
                </div>
              </div>

              {/* Featured Image */}
              <div className="article-featured-image-box mb-5">
                <img
                  src={post.image}
                  alt={shareTitle}
                  className="article-hero-img"
                  width="900"
                  height="480"
                />
              </div>

              {/* Article Markdown/Rich Body */}
              <div className="article-body-content mb-5">
                {/* Lead Summary */}
                <div className="article-lead-box p-4 rounded-4 mb-4">
                  <p className="lead-text-p mb-0">
                    {language === 'ar' ? post.excerpt.ar : post.excerpt.en}
                  </p>
                </div>

                {/* Rendered content paragraphs */}
                <div className="markdown-prose">
                  {(language === 'ar' ? post.content.ar : post.content.en)
                    .split('\n\n')
                    .map((paragraph, index) => {
                      if (paragraph.startsWith('### ')) {
                        return (
                          <h3 key={index} className="prose-heading-3 mt-4 mb-3">
                            {paragraph.replace('### ', '')}
                          </h3>
                        );
                      }
                      if (paragraph.startsWith('1. ') || paragraph.startsWith('- ')) {
                        const lines = paragraph.split('\n');
                        return (
                          <ul key={index} className="prose-list my-3">
                            {lines.map((line, lIdx) => (
                              <li key={lIdx}>{line.replace(/^(\d+\.\s|\-\s)/, '')}</li>
                            ))}
                          </ul>
                        );
                      }
                      return (
                        <p key={index} className="prose-paragraph mb-3">
                          {paragraph}
                        </p>
                      );
                    })}
                </div>

                {/* Medically Reviewed Disclaimer */}
                <div className="medical-review-disclaimer p-3 rounded-3 mt-4 d-flex align-items-center gap-3">
                  <FiCheckCircle className="disclaimer-icon text-primary fs-3" />
                  <div>
                    <strong className="d-block text-dark">
                      {language === 'ar'
                        ? 'إخلاء مسؤولية طبي وتوعوي'
                        : 'Medical Information Disclaimer'}
                    </strong>
                    <small className="text-muted">
                      {language === 'ar'
                        ? 'هذا المقال للتوعية والتثقيف الصحي العام ولا يغني عن استشارة طبيب الأسنان المختص لتشخيص حالتك بدقة.'
                        : 'This article is for general educational purposes and does not replace individualized diagnosis by a qualified dentist.'}
                    </small>
                  </div>
                </div>
              </div>

              {/* Share Bar */}
              <div className="article-share-bar p-3 rounded-4 border d-flex justify-content-between align-items-center flex-wrap gap-3 mb-5">
                <span className="fw-bold d-flex align-items-center gap-2">
                  <FiShare2 /> {t('common.shareArticle')}
                </span>

                <div className="share-buttons-group d-flex align-items-center gap-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-social-btn whatsapp"
                    title="Share on WhatsApp"
                  >
                    <FaWhatsapp />
                  </a>

                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-social-btn facebook"
                    title="Share on Facebook"
                  >
                    <FaFacebookF />
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="share-copy-btn"
                  >
                    {copied ? (
                      <>
                        <FiCheck className="text-success" />
                        <span>{t('common.copiedToClipboard')}</span>
                      </>
                    ) : (
                      <span>{language === 'ar' ? 'نسخ الرابط' : 'Copy Link'}</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Inline Booking Callout */}
              <div className="article-booking-callout p-4 p-md-5 rounded-4 text-center my-5">
                <h3 className="fw-bold mb-2">
                  {language === 'ar'
                    ? 'هل لديك أي استفسار أو ترغب في فحص أسنانك؟'
                    : 'Have Questions or Need an Examination?'}
                </h3>
                <p className="text-muted mb-4 max-w-500 mx-auto">
                  {language === 'ar'
                    ? 'فريق عيادة حياة لطب الأسنان يسعد باستقبالك وتقديم أفضل النصائح والعلاجات المناسبة لابتسامتك.'
                    : 'Our clinical team is always ready to assist you with transparent advice and comfortable dental care.'}
                </p>
                <div className="theme-btn">
                  <Link to="/contact">
                    <span>{t('nav.bookAppointment')}</span>
                  </Link>
                </div>
              </div>

              {/* Related Posts */}
              <div className="related-articles-section mt-5">
                <h3 className="section-subheading mb-4">
                  {language === 'ar' ? 'مقالات طبية أخرى ذات صلة' : 'Related Educational Articles'}
                </h3>

                <div className="row g-4">
                  {relatedPosts.map((rPost) => (
                    <div key={rPost.id} className="col-md-4">
                      <div className="related-blog-card p-3 rounded-4 border bg-white h-100 d-flex flex-column">
                        <Link to={`/blog/${rPost.slug}`}>
                          <img
                            src={rPost.image}
                            alt={language === 'ar' ? rPost.title.ar : rPost.title.en}
                            className="rounded-3 w-100 mb-3"
                            style={{ height: '140px', objectFit: 'cover' }}
                          />
                        </Link>
                        <h5 className="fw-bold fs-6 mb-2">
                          <Link to={`/blog/${rPost.slug}`} className="text-dark text-decoration-none">
                            {language === 'ar' ? rPost.title.ar : rPost.title.en}
                          </Link>
                        </h5>
                        <div className="mt-auto pt-2">
                          <Link to={`/blog/${rPost.slug}`} className="text-primary fw-bold small text-decoration-none d-flex align-items-center gap-1">
                            <span>{t('common.readMore')}</span>
                            <ArrowIcon />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <Footer />
      <FloatingActions />
    </main>
  );
};

export default SingleBlog;
