import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n/LanguageContext';
import { BLOG_POSTS } from '../../data/blog';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import { FiClock, FiCalendar, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import './Blogs.scss';

const Blogs = ({ limit = 3, showAllBtn = true }) => {
  const { t, language } = useTranslation();
  const displayedPosts = limit ? BLOG_POSTS.slice(0, limit) : BLOG_POSTS;
  const ArrowIcon = language === 'ar' ? FiArrowLeft : FiArrowRight;

  return (
    <section className="blogs-preview-section pt-100 pb-70">
      <div className="container">
        <SectionTitle
          subTitle={t('blog.sectionSub')}
          title={t('blog.sectionTitle')}
          description={t('blog.sectionDesc')}
          align="center"
        />

        <div className="row g-4">
          {displayedPosts.map((post, idx) => (
            <div key={post.id} className="col-lg-4 col-md-6">
              <motion.article
                className="blog-card-modern"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <div className="blog-thumb-box">
                  <Link to={`/blog/${post.slug}`}>
                    <img
                      src={post.image}
                      alt={language === 'ar' ? post.title.ar : post.title.en}
                      className="blog-post-img"
                      loading="lazy"
                    />
                  </Link>
                  <span className="blog-category-badge">
                    {language === 'ar' ? post.category.ar : post.category.en}
                  </span>
                </div>

                <div className="blog-body p-4 d-flex flex-column flex-grow-1">
                  <div className="blog-meta-row d-flex align-items-center gap-3 mb-2">
                    <span className="meta-item">
                      <FiCalendar /> {language === 'ar' ? post.date.ar : post.date.en}
                    </span>
                    <span className="meta-item">
                      <FiClock /> {language === 'ar' ? post.readingTime.ar : post.readingTime.en}
                    </span>
                  </div>

                  <h3 className="blog-card-title mb-2">
                    <Link to={`/blog/${post.slug}`}>
                      {language === 'ar' ? post.title.ar : post.title.en}
                    </Link>
                  </h3>

                  <p className="blog-card-excerpt mb-4">
                    {language === 'ar' ? post.excerpt.ar : post.excerpt.en}
                  </p>

                  <div className="blog-card-footer mt-auto pt-3 border-top">
                    <Link to={`/blog/${post.slug}`} className="read-more-link">
                      <span>{t('common.readMore')}</span>
                      <ArrowIcon className="read-more-arrow" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            </div>
          ))}
        </div>

        {showAllBtn && (
          <div className="text-center mt-5">
            <div className="theme-btn theme-btn-outline">
              <Link to="/blogs">
                <span>{t('common.viewAllBlogs')}</span>
                <ArrowIcon />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Blogs;
