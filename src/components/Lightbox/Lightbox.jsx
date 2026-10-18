import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useTranslation } from '../../i18n/LanguageContext';
import './Lightbox.scss';

const Lightbox = ({ isOpen, onClose, images, currentIndex, onIndexChange }) => {
  const { language } = useTranslation();

  const handleNext = useCallback(() => {
    onIndexChange((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, onIndexChange]);

  const handlePrev = useCallback(() => {
    onIndexChange((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, onIndexChange]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') language === 'ar' ? handlePrev() : handleNext();
      if (e.key === 'ArrowLeft') language === 'ar' ? handleNext() : handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose, language]);

  if (!isOpen || !images || !images[currentIndex]) return null;

  const currentItem = images[currentIndex];
  const caption = language === 'ar' ? currentItem.altAr : currentItem.altEn;

  return (
    <AnimatePresence>
      <motion.div
        className="custom-lightbox-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="lightbox-content-wrapper" onClick={(e) => e.stopPropagation()}>
          {/* Close button */}
          <button
            type="button"
            className="lightbox-btn-close"
            onClick={onClose}
            aria-label="Close lightbox"
          >
            <FiX size={26} />
          </button>

          {/* Previous image */}
          <button
            type="button"
            className="lightbox-btn-nav btn-prev"
            onClick={handlePrev}
            aria-label="Previous image"
          >
            <FiChevronLeft size={30} />
          </button>

          {/* Active Image */}
          <motion.div
            key={currentIndex}
            className="lightbox-image-box"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <img src={currentItem.src} alt={caption} />
            {caption && <div className="lightbox-caption">{caption}</div>}
          </motion.div>

          {/* Next image */}
          <button
            type="button"
            className="lightbox-btn-nav btn-next"
            onClick={handleNext}
            aria-label="Next image"
          >
            <FiChevronRight size={30} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Lightbox;
