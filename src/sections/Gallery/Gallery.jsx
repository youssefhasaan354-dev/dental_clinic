import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation, useLanguage } from '../../i18n/LanguageContext';
import { useData } from '../../context/DataContext';
import { IMAGES } from '../../data/images';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import BeforeAfter from '../../components/BeforeAfter/BeforeAfter';
import Lightbox from '../../components/Lightbox/Lightbox';
import EditableMedia from '../../components/VisualEdit/EditableMedia';
import { Reveal } from '../../components/Motion';
import { FiZoomIn, FiShield } from 'react-icons/fi';
import './Gallery.scss';

const Gallery = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { settings, getImageSlot } = useData();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const isAr = language === 'ar';
  const galleryImages = IMAGES.serviceDetails.gallery.map((img, idx) => {
    const slotId = `slot-gallery-${idx + 1}`;
    const slot = getImageSlot(slotId);
    return {
      ...img,
      slotId,
      src: slot?.currentUrl || img.src,
      altAr: slot?.altText?.ar || img.altAr,
      altEn: slot?.altText?.en || img.altEn,
    };
  });

  const openLightboxAt = (idx) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  return (
    <section className="smile-gallery-section pt-100 pb-70">
      <div className="container">
        <Reveal>
          <SectionTitle
            subTitle={isAr ? 'جولة مصورة' : 'Visual Tour'}
            title={isAr ? 'أجواء عيادة حياة لطب الأسنان' : 'Inside Hayaah Dental Clinic'}
            description={
              isAr
                ? 'بيئة هادئة ومريحة، غرف علاج مجهزة بأحدث أجهزة التعقيم والأشعة الرقمية، لضمان أعلى معايير الأمان الصحي.'
                : 'A serene clinic atmosphere equipped with certified sterilization and low-dose digital imaging.'
            }
            align="center"
          />
        </Reveal>

        {/* Golden Rule 9: Before/After Spotlight is OFF by default. Only rendered if clinic approved and patient consent verified in admin */}
        {settings.showBeforeAfter && (
          <motion.div
            className="before-after-spotlight mb-5 p-4 rounded-4 bg-light border"
            initial={{ clipPath: 'inset(10% 0% 10% 0% round 24px)', opacity: 0 }}
            whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 24px)', opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="d-flex align-items-center gap-2 mb-3">
              <FiShield className="text-success" />
              <span className="badge bg-success">
                {isAr ? 'حالة سريرية موثقة بموافقة المريض الكتابية' : 'Documented clinical case with patient consent'}
              </span>
            </div>
            <BeforeAfter
              beforeImg={galleryImages[0].src}
              afterImg={galleryImages[1].src}
            />
          </motion.div>
        )}

        {/* Clinic Environment Gallery Grid */}
        <div className="row g-4">
          {galleryImages.map((img, idx) => (
            <div key={img.id} className="col-lg-4 col-md-6">
              <motion.div
                className="gallery-item-card position-relative overflow-hidden rounded-4 shadow-sm"
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
                aria-label={isAr ? img.altAr : img.altEn}
              >
                <div className="gallery-thumb-wrapper">
                  <EditableMedia
                    slotId={img.slotId}
                    defaultSrc={img.src}
                    alt={{ ar: img.altAr, en: img.altEn }}
                    className="gallery-thumb-img w-100"
                    loading="lazy"
                    style={{ height: '240px', objectFit: 'cover' }}
                  />
                  <div className="gallery-hover-overlay d-flex flex-column align-items-center justify-content-center text-white">
                    <span className="zoom-btn mb-2">
                      <FiZoomIn size={22} />
                    </span>
                    <span className="overlay-caption px-3 text-center small fw-semibold">
                      {isAr ? img.altAr : img.altEn}
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
