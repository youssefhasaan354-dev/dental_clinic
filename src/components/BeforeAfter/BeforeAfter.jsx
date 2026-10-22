import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { IMAGES } from '../../data/images';
import EditableMedia from '../VisualEdit/EditableMedia';
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
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  const bLabel = beforeLabel || (language === 'ar' ? 'قبل العلاج' : 'Before');
  const aLabel = afterLabel || (language === 'ar' ? 'بعد العلاج' : 'After');

  // Keep before image exactly aligned with container width across all viewports
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();

    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

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

  // Keyboard navigation for WCAG 2.2 AA accessibility
  const handleKeyDown = (e) => {
    const STEP = 5;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderPosition((prev) => Math.max(0, prev - STEP));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPosition((prev) => Math.min(100, prev + STEP));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSliderPosition(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSliderPosition(100);
    }
  };

  return (
    <div
      className="before-after-wrapper"
      ref={containerRef}
      style={{ '--ba-width': containerWidth ? `${containerWidth}px` : '100%' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
    >
      {/* After Image (Background) */}
      <EditableMedia
        slotId="slot-beforeafter-after"
        defaultSrc={afterImg}
        alt={{ ar: 'بعد علاج الأسنان', en: 'After dental treatment' }}
        className="ba-image ba-image-after"
        loading="lazy"
      />
      <span className="ba-badge badge-after">{aLabel}</span>

      {/* Before Image (Clipped Overlay) */}
      <div
        className="ba-clipped-container"
        style={{ width: `${sliderPosition}%` }}
      >
        <EditableMedia
          slotId="slot-beforeafter-before"
          defaultSrc={beforeImg}
          alt={{ ar: 'قبل علاج الأسنان', en: 'Before dental treatment' }}
          className="ba-image ba-image-before"
          loading="lazy"
        />
        <span className="ba-badge badge-before">{bLabel}</span>
      </div>

      {/* Draggable Divider Handle with Accessible Slider Role */}
      <div
        className="ba-divider-handle"
        style={{ left: `${sliderPosition}%` }}
        role="slider"
        tabIndex={0}
        aria-valuenow={Math.round(sliderPosition)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={language === 'ar' ? 'شريط المقارنة قبل وبعد' : 'Before and after comparison slider'}
        onKeyDown={handleKeyDown}
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
