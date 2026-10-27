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
import { getImageSlotById } from '../../data/imageSlots';
import { isFirebaseConfigured } from '../../services/firebase/client';
import './EditableMedia.scss';

export interface EditableMediaProps {
  slotId: string;
  defaultSrc?: string;
  alt?: { ar: string; en: string } | string;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  aspectRatio?: string;
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
  aspectRatio: propAspectRatio,
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
  const { getImageSlot, imageSlotsReady } = useData();
  const isAr = language === 'ar';

  const isHero = priority || slotId === 'slot-hero';
  const isFirebaseMode = isFirebaseConfigured();
  const isWaitingSlots = isFirebaseMode && imageSlotsReady === false;

  const slot = getImageSlot(slotId);
  const currentUrl = slot?.currentUrl || defaultSrc;
  const isEdgeFade = Boolean(slot?.edgeFade ?? (slotId === 'slot-hero'));

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const maskStyle: React.CSSProperties = isEdgeFade
    ? {
        WebkitMaskImage: 'radial-gradient(ellipse 50% 52% at 50% 50%, #000000 70%, transparent 100%)',
        maskImage: 'radial-gradient(ellipse 50% 52% at 50% 50%, #000000 70%, transparent 100%)',
      }
    : {};

  // Resolve aspect ratio (prop, style, or slot.aspectRatio)
  const baseSlot = slot || getImageSlotById(slotId);
  const slotAspectRatio = slot?.aspectRatio || baseSlot?.aspectRatio;
  const rawAspectRatio =
    propAspectRatio ||
    (style?.aspectRatio as string | undefined) ||
    slotAspectRatio;

  const resolvedAspectRatio = rawAspectRatio
    ? rawAspectRatio.replace(':', '/')
    : (typeof width === 'number' && typeof height === 'number' ? `${width} / ${height}` : undefined);

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

  useEffect(() => {
    if (mediaType !== 'video' || !videoRef.current) return;

    const videoEl = videoRef.current;

    // Check accessibility & bandwidth constraints
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
  }, [mediaType, slot?.autoplay, prefersReducedMotion]);

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
  const containerAspectRatio = resolvedAspectRatio;

  // If Firebase mode and slots are not ready yet, render placeholder with slot aspect-ratio
  // to avoid flashing default media and prevent layout shifts.
  if (isWaitingSlots) {
    const skeletonNode = (
      <div
        className={`editable-media-skeleton ${isEdgeFade ? 'editable-media-edge-fade' : ''} ${className}`}
        aria-hidden="true"
        style={{
          display: inline ? 'inline-block' : 'block',
          width: width !== undefined
            ? (typeof width === 'number' ? `${width}px` : width)
            : (as === 'background' ? '100%' : (inline ? undefined : '100%')),
          maxWidth: '100%',
          height: height !== undefined && !resolvedAspectRatio
            ? (typeof height === 'number' ? `${height}px` : height)
            : (as === 'background' ? '100%' : 'auto'),
          aspectRatio: resolvedAspectRatio,
          minHeight: !resolvedAspectRatio && !height ? '120px' : undefined,
          ...maskStyle,
          ...style,
        }}
      />
    );

    if (as === 'background') {
      return (
        <div className="editable-media-bg-wrap position-absolute top-0 start-0 w-100 h-100 overflow-hidden">
          {skeletonNode}
        </div>
      );
    }

    return skeletonNode;
  }

  // 1. Render Video
  if (mediaType === 'video') {
    const posterUrl =
      slot?.posterUrl ||
      buildCloudinaryVideoPoster(currentUrl) ||
      defaultSrc;

    // Requirement 1.4: prefers-reduced-motion: stop video and show poster with same mask
    if (prefersReducedMotion && posterUrl) {
      const reducedPosterNode = (
        <img
          src={posterUrl}
          alt={resolvedAlt}
          width={width}
          height={height}
          loading={isHero ? 'eager' : loading}
          {...({ fetchpriority: isHero ? 'high' : undefined } as any)}
          decoding="async"
          className={`editable-media-img ${isEdgeFade ? 'editable-media-edge-fade' : ''} ${className}`}
          style={{
            width: width || (as === 'background' ? '100%' : '100%'),
            height: height || (as === 'background' ? '100%' : 'auto'),
            objectFit: 'cover',
            objectPosition: '50% 50%',
            aspectRatio: containerAspectRatio,
            ...innerMediaStyle,
            ...maskStyle,
            ...style,
          }}
        />
      );

      const posterContent = as === 'background' ? (
        <div className="editable-media-bg-wrap position-absolute top-0 start-0 w-100 h-100 overflow-hidden">
          {reducedPosterNode}
        </div>
      ) : (
        reducedPosterNode
      );

      if (disableOverlay) return posterContent;
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
          {posterContent}
        </ImageSlotOverlay>
      );
    }

    // Requirement 2.1: Do not apply optimizeVideoUrl on Hero or edgeFade media
    const shouldSkipVideoOptimize = isHero || isEdgeFade;
    const finalVideoUrl = shouldSkipVideoOptimize ? currentUrl : optimizeVideoUrl(currentUrl);

    const loop = slot?.loop ?? true;
    const muted = slot?.muted ?? true;
    const videoControls = typeof propControls === 'boolean' ? propControls : (slot?.controls ?? false);

    const videoNode = (
      <video
        ref={videoRef}
        src={finalVideoUrl}
        poster={posterUrl || undefined}
        muted={muted}
        playsInline
        loop={loop}
        autoPlay={isHero ? true : undefined}
        controls={videoControls}
        preload={isHero ? 'auto' : 'none'}
        aria-label={resolvedAlt || 'Video playback'}
        className={`editable-media-video ${isEdgeFade ? 'editable-media-edge-fade' : ''} ${className}`}
        style={{
          width: width || '100%',
          height: height || (as === 'background' ? '100%' : 'auto'),
          objectFit: 'cover',
          objectPosition: '50% 50%',
          aspectRatio: containerAspectRatio,
          ...innerMediaStyle,
          ...maskStyle,
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
            decoding="async"
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
      {...({ fetchpriority: isHero ? 'high' : undefined } as any)}
      decoding="async"
      className={`editable-media-img ${isEdgeFade ? 'editable-media-edge-fade' : ''} ${className}`}
      style={{
        width: as === 'background' ? '100%' : undefined,
        height: as === 'background' ? '100%' : undefined,
        objectFit: as === 'background' ? 'cover' : undefined,
        ...innerMediaStyle,
        ...maskStyle,
        ...style,
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
