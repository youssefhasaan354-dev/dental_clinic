import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { IMAGES } from '../../data/images';
import './BeforeAfter.scss';

const BeforeAfter = ({
  beforeImg = IMAGES.serviceDetails.gallery[0].src,
  afterImg = IMAGES.serviceDetails.gallery[1].src,
  beforeLabel,
  afterLabel,
}) => {
  const { language, t } = useTranslation();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const bLabel = beforeLabel || (language === 'ar' ? 'قبل العلاج' : 'Before');
  const aLabel = afterLabel || (language === 'ar' ? 'بعد العلاج' : 'After');

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (!e.touches[0]) return;
    handleMove(e.touches[0].clientX);
  };

  return (
    <div
      className="before-after-wrapper"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
    >
      {/* After Image (Background) */}
      <img
        src={afterImg}
        alt="After dental treatment"
        className="ba-image ba-image-after"
        loading="lazy"
      />
      <span className="ba-badge badge-after">{aLabel}</span>

      {/* Before Image (Clipped Overlay) */}
      <div
        className="ba-clipped-container"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeImg}
          alt="Before dental treatment"
          className="ba-image ba-image-before"
          loading="lazy"
        />
        <span className="ba-badge badge-before">{bLabel}</span>
      </div>

      {/* Draggable Divider Handle */}
      <div
        className="ba-divider-handle"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={() => setIsDragging(true)}
      >
        <div className="handle-line"></div>
        <div className="handle-circle">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" transform="rotate(180 12 12)" />
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
          </svg>
        </div>
        <div className="handle-line"></div>
      </div>

      <div className="ba-instruction">
        <span>{t('gallery.dragPrompt')}</span>
      </div>
    </div>
  );
};

export default BeforeAfter;
