import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useData } from '../../context/DataContext';
import { ImageSlotOverlay } from './ImageSlotOverlay';
import {
  optimizeImageUrl,
  optimizeVideoUrl,
  buildImageSrcSet,
  buildCloudinaryVideoPoster,
  parseVideoEmbedUrl,
  isDirectVideoUrl,
} from '../../utils/mediaUrl';
import { Play } from 'lucide-react';
import './EditableMedia.scss';

export interface EditableMediaProps {
  slotId: string;
  defaultSrc?: string;
  alt?: { ar: string; en: string } | string;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  loading?: 'lazy' | 'eager';
  as?: 'media' | 'background';
  inline?: boolean;
  priority?: boolean;
  controls?: boolean;
  disableOverlay?: boolean;
  fallback?: React.ReactNode;
  posterOnly?: boolean;
}

export const EditableMedia: React.FC<EditableMediaProps> = ({
  slotId,
  defaultSrc = '',
  alt,
  className = '',
  style = {},
  width,
  height,
  loading = 'lazy',
  as = 'media',
  inline = false,
  priority = false,
  controls: propControls,
  disableOverlay = false,
  fallback,
  posterOnly = false,
}) => {
  const { language } = useLanguage();
  const { getImageSlot } = useData();
  const isAr = language === 'ar';

  const slot = getImageSlot(slotId);
  const currentUrl = slot?.currentUrl || defaultSrc;

  // Resolve localized alt text
  const resolvedAlt = useMemo(() => {
    if (slot?.altText) {
      return isAr ? slot.altText.ar : slot.altText.en;
    }
    if (typeof alt === 'string') return alt;
    if (alt && typeof alt === 'object') {
      return isAr ? alt.ar : alt.en;
    }
    return '';
  }, [slot, alt, isAr]);

  // Determine mediaType (strict check: allowVideo=false or posterOnly forces image)
  const isVideoAllowed = !posterOnly && slot?.allowVideo !== false;
  const embedParse = useMemo(() => parseVideoEmbedUrl(currentUrl), [currentUrl]);

  const mediaType: 'image' | 'video' | 'embed' = useMemo(() => {
    if (posterOnly || !isVideoAllowed) return 'image';
    if (slot?.mediaType) {
      if (slot.mediaType === 'video' || slot.mediaType === 'embed') {
        return slot.mediaType;
      }
      return 'image';
    }
    if (isDirectVideoUrl(currentUrl)) return 'video';
    if (embedParse.isAllowed && (embedParse.provider === 'youtube' || embedParse.provider === 'vimeo')) {
      return 'embed';
    }
    return 'image';
  }, [posterOnly, isVideoAllowed, slot?.mediaType, currentUrl, embedParse]);

  // Embed Click-to-Play Facade state
  const [isEmbedPlaying, setIsEmbedPlaying] = useState(false);

  // Video autoplay & visibility IntersectionObserver
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isHero = priority || slotId === 'slot-hero';

  useEffect(() => {
    if (mediaType !== 'video' || !videoRef.current) return;

    const videoEl = videoRef.current;

    // Check accessibility & bandwidth constraints
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
    const saveData = nav?.connection?.saveData === true;

    const slotAutoplay = slot?.autoplay ?? true;
    const canAutoplay = slotAutoplay && !prefersReducedMotion && !saveData;

    // IntersectionObserver to play only while visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (canAutoplay) {
              const playPromise = videoEl.play();
              if (playPromise !== undefined) {
                playPromise.catch(() => {
                  // Autoplay blocked by browser policy
                });
              }
            }
          } else {
            videoEl.pause();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(videoEl);

    return () => {
      observer.disconnect();
    };
  }, [mediaType, slot?.autoplay]);

  // Compute focal point and zoom
  const focalPoint = slot?.focalPoint || 'center center';
  const zoom = slot?.zoom || 1;

  // Common inner media style
  const innerMediaStyle: React.CSSProperties = {
    ...style,
    objectPosition: focalPoint,
    transform: zoom !== 1 ? `scale(${zoom})` : undefined,
    transformOrigin: focalPoint,
  };

  // Convert aspect ratio string e.g. "16:9" or "4:3" if provided and no explicit height
  const containerAspectRatio = slot?.aspectRatio
    ? slot.aspectRatio.replace(':', '/')
    : undefined;

  // 1. Render Video
  if (mediaType === 'video') {
    const posterUrl =
      slot?.posterUrl ||
      buildCloudinaryVideoPoster(currentUrl) ||
      defaultSrc;

    const optimizedVideo = optimizeVideoUrl(currentUrl);
    const loop = slot?.loop ?? true;
    const muted = slot?.muted ?? true;
    const videoControls = typeof propControls === 'boolean' ? propControls : (slot?.controls ?? false);

    const videoNode = (
      <video
        ref={videoRef}
        src={optimizedVideo}
        poster={posterUrl || undefined}
        muted={muted}
        playsInline
        loop={loop}
        controls={videoControls}
        preload={isHero ? 'metadata' : 'none'}
        aria-label={resolvedAlt || 'Video playback'}
        className={`editable-media-video ${className}`}
        style={{
          width: width || '100%',
          height: height || (as === 'background' ? '100%' : 'auto'),
          objectFit: 'cover',
          aspectRatio: containerAspectRatio,
          ...innerMediaStyle,
        }}
      />
    );

    const content = as === 'background' ? (
      <div className="editable-media-bg-wrap position-absolute top-0 start-0 w-100 h-100 overflow-hidden">
        {videoNode}
      </div>
    ) : (
      videoNode
    );

    if (disableOverlay) {
      return content;
    }

    return (
      <ImageSlotOverlay
        slotId={slotId}
        inline={inline}
        initialSlotProps={{
          defaultUrl: defaultSrc,
          altText: typeof alt === 'object' ? alt : { ar: String(alt || ''), en: String(alt || '') },
          aspectRatio: slot?.aspectRatio || '16:9',
          allowVideo: true,
        }}
      >
        {content}
      </ImageSlotOverlay>
    );
  }

  // 2. Render Privacy-Friendly Embed (YouTube / Vimeo) with Click-to-Play Facade
  if (mediaType === 'embed' && embedParse.isAllowed) {
    const posterThumbnail =
      slot?.posterUrl ||
      embedParse.posterUrl ||
      defaultSrc;

    const facadeNode = isEmbedPlaying ? (
      <iframe
        src={embedParse.embedUrl || ''}
        title={resolvedAlt || 'Video Embed'}
        className={`editable-media-iframe ${className}`}
        style={{
          width: width || '100%',
          height: height || '100%',
          minHeight: '220px',
          border: 0,
          aspectRatio: containerAspectRatio || '16/9',
          ...style,
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    ) : (
      <div
        className={`editable-media-facade position-relative overflow-hidden ${className}`}
        style={{
          width: width || '100%',
          height: height || (as === 'background' ? '100%' : 'auto'),
          aspectRatio: containerAspectRatio || '16/9',
          ...style,
        }}
      >
        {posterThumbnail ? (
          <img
            src={posterThumbnail}
            alt={resolvedAlt}
            className="w-100 h-100"
            style={{ objectFit: 'cover', ...innerMediaStyle }}
            loading={loading}
          />
        ) : (
          <div className="w-100 h-100 bg-dark" />
        )}
        <button
          type="button"
          className="facade-play-btn position-absolute top-50 start-50 translate-middle btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center"
          onClick={() => setIsEmbedPlaying(true)}
          aria-label={isAr ? 'تشغيل الفيديو' : 'Play video'}
          style={{ width: '64px', height: '64px', zIndex: 2 }}
        >
          <Play size={28} fill="currentColor" />
        </button>
      </div>
    );

    if (disableOverlay) {
      return facadeNode;
    }

    return (
      <ImageSlotOverlay
        slotId={slotId}
        inline={inline}
        initialSlotProps={{
          defaultUrl: defaultSrc,
          altText: typeof alt === 'object' ? alt : { ar: String(alt || ''), en: String(alt || '') },
          aspectRatio: slot?.aspectRatio || '16:9',
          allowVideo: true,
        }}
      >
        {facadeNode}
      </ImageSlotOverlay>
    );
  }

  // 3. Render Image (Default)
  if (!currentUrl && fallback) {
    if (disableOverlay) {
      return <>{fallback}</>;
    }
    return (
      <ImageSlotOverlay
        slotId={slotId}
        inline={inline}
        initialSlotProps={{
          defaultUrl: defaultSrc,
          altText: typeof alt === 'object' ? alt : { ar: String(alt || ''), en: String(alt || '') },
          aspectRatio: slot?.aspectRatio || '1:1',
          allowVideo: isVideoAllowed,
        }}
      >
        {fallback}
      </ImageSlotOverlay>
    );
  }

  const effectiveImageUrl = posterOnly
    ? (slot?.posterUrl || (slot?.mediaType === 'video' || isDirectVideoUrl(currentUrl) ? buildCloudinaryVideoPoster(currentUrl) : '') || embedParse.posterUrl || defaultSrc)
    : currentUrl;

  const numericWidth = typeof width === 'number' ? width : undefined;
  const optimizedSrc = optimizeImageUrl(effectiveImageUrl, { width: numericWidth });
  const srcSet = buildImageSrcSet(effectiveImageUrl);

  const imgElement = (
    <img
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={srcSet ? '(max-width: 768px) 100vw, 800px' : undefined}
      alt={resolvedAlt}
      width={width}
      height={height}
      loading={isHero ? 'eager' : loading}
      fetchPriority={isHero ? 'high' : undefined}
      className={`editable-media-img ${className}`}
      style={{
        width: as === 'background' ? '100%' : width,
        height: as === 'background' ? '100%' : height,
        objectFit: as === 'background' ? 'cover' : undefined,
        ...innerMediaStyle,
      }}
    />
  );

  const finalImageContent = as === 'background' ? (
    <div className="editable-media-bg-wrap position-absolute top-0 start-0 w-100 h-100 overflow-hidden">
      {imgElement}
    </div>
  ) : (
    imgElement
  );

  if (disableOverlay) {
    return finalImageContent;
  }

  return (
    <ImageSlotOverlay
      slotId={slotId}
      inline={inline}
      initialSlotProps={{
        defaultUrl: defaultSrc,
        altText: typeof alt === 'object' ? alt : { ar: String(alt || ''), en: String(alt || '') },
        aspectRatio: slot?.aspectRatio || '16:9',
        allowVideo: isVideoAllowed,
      }}
    >
      {finalImageContent}
    </ImageSlotOverlay>
  );
};

// Compatibility export
export { EditableMedia as EditableImage };
export default EditableMedia;
