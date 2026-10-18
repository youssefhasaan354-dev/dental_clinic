import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n/LanguageContext';
import { IMAGES } from '../../data/images';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import BeforeAfter from '../../components/BeforeAfter/BeforeAfter';
import Lightbox from '../../components/Lightbox/Lightbox';
import { FiZoomIn } from 'react-icons/fi';
import './Gallery.scss';

const Gallery = () => {
  const { t, language } = useTranslation();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const galleryImages = IMAGES.serviceDetails.gallery;

  const openLightboxAt = (idx) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  return (
    <section className="smile-gallery-section pt-100 pb-70">
      <div className="container">
        <SectionTitle
          subTitle={t('gallery.sectionSub')}
          title={t('gallery.sectionTitle')}
          description={t('gallery.sectionDesc')}
          align="center"
        />

        {/* Featured Interactive Before / After Slider */}
        <div className="before-after-spotlight mb-5">
          <BeforeAfter
            beforeImg={galleryImages[0].src}
            afterImg={galleryImages[1].src}
          />
        </div>

        {/* Gallery Masonry / Grid */}
        <div className="row g-4">
          {galleryImages.map((img, idx) => (
            <div key={img.id} className="col-lg-4 col-md-6">
              <motion.div
                className="gallery-item-card"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                onClick={() => openLightboxAt(idx)}
                whileHover={{ y: -4 }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') openLightboxAt(idx);
                }}
                aria-label={language === 'ar' ? img.altAr : img.altEn}
              >
                <div className="gallery-thumb-wrapper">
                  <img
                    src={img.src}
                    alt={language === 'ar' ? img.altAr : img.altEn}
                    className="gallery-thumb-img"
                    loading="lazy"
                  />
                  <div className="gallery-hover-overlay">
                    <span className="zoom-btn">
                      <FiZoomIn />
                    </span>
                    <span className="overlay-caption">
                      {language === 'ar' ? img.altAr : img.altEn}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Accessible Fullscreen Lightbox */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={galleryImages}
        currentIndex={lightboxIndex}
        onIndexChange={setLightboxIndex}
      />
    </section>
  );
};

export default Gallery;
