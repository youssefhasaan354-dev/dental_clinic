/**
 * MEDIA & CLOUDINARY URL UTILITIES
 * Pure helpers for Cloudinary image/video optimizations, responsive srcsets,
 * and secure privacy-friendly YouTube/Vimeo embed parsing.
 */

/**
 * Optimizes a Cloudinary image URL by injecting auto-format, auto-quality,
 * and optional width constraint. Other URLs remain untouched.
 */
export function optimizeImageUrl(
  url: string | undefined | null,
  options?: { width?: number }
): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Only transform Cloudinary URLs
  if (!trimmed.includes('res.cloudinary.com') || !trimmed.includes('/image/upload/')) {
    return trimmed;
  }

  const transform = options?.width
    ? `f_auto,q_auto,w_${Math.round(options.width)}`
    : 'f_auto,q_auto';

  // Prevent duplicate injections
  if (trimmed.includes(transform)) {
    return trimmed;
  }

  return trimmed.replace('/image/upload/', `/image/upload/${transform}/`);
}

/**
 * Generates an image srcset string for responsive loading from Cloudinary.
 * If not Cloudinary, returns undefined so browser uses standard src.
 */
export function buildImageSrcSet(
  url: string | undefined | null,
  widths: number[] = [400, 800, 1200]
): string | undefined {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) {
    return undefined;
  }
  return widths.map((w) => `${optimizeImageUrl(url, { width: w })} ${w}w`).join(', ');
}

/**
 * Optimizes a Cloudinary video URL by injecting auto-format and auto-quality.
 * Non-Cloudinary URLs remain untouched.
 */
export function optimizeVideoUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  if (!trimmed.includes('res.cloudinary.com') || !trimmed.includes('/video/upload/')) {
    return trimmed;
  }

  const transform = 'f_auto,q_auto';
  if (trimmed.includes(transform)) {
    return trimmed;
  }

  return trimmed.replace('/video/upload/', `/video/upload/${transform}/`);
}

/**
 * Automatically builds a video poster frame URL from a Cloudinary video URL (first frame: so_0 as jpg).
 */
export function buildCloudinaryVideoPoster(url: string | undefined | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed.includes('res.cloudinary.com') || !trimmed.includes('/video/upload/')) {
    return null;
  }
  // Replace /video/upload/ with /video/upload/so_0/ and replace extension with .jpg
  return trimmed
    .replace('/video/upload/', '/video/upload/so_0/')
    .replace(/\.(mp4|webm|mov|mkv)(\?.*)?$/i, '.jpg$2');
}

export interface ParsedMediaEmbed {
  isAllowed: boolean;
  provider: 'youtube' | 'vimeo' | 'direct' | null;
  embedUrl: string | null;
  videoId: string | null;
  posterUrl?: string;
  errorMessage?: string;
}

/**
 * Validates and converts YouTube or Vimeo URLs into secure, privacy-friendly embed URLs.
 * Rejects non-https, arbitrary websites, scripts, or non-whitelisted iframes.
 */
export function parseVideoEmbedUrl(rawUrl: string | undefined | null): ParsedMediaEmbed {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      isAllowed: false,
      provider: null,
      embedUrl: null,
      videoId: null,
    };
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return {
      isAllowed: false,
      provider: null,
      embedUrl: null,
      videoId: null,
    };
  }

  // Security check: Must be https protocol only (or local blob in demo)
  if (!trimmed.startsWith('https://') && !trimmed.startsWith('blob:')) {
    return {
      isAllowed: false,
      provider: null,
      embedUrl: null,
      videoId: null,
      errorMessage: 'Only secure https URLs are accepted.',
    };
  }

  // 1. YouTube matching
  // Patterns:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://www.youtube-nocookie.com/embed/VIDEO_ID
  // - https://www.youtube.com/shorts/VIDEO_ID
  const ytRegex =
    /^https:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtube-nocookie\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&].*)?$/;

  const ytMatch = trimmed.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      isAllowed: true,
      provider: 'youtube',
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`,
      posterUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  // 2. Vimeo matching
  // Patterns:
  // - https://vimeo.com/VIDEO_ID
  // - https://www.vimeo.com/VIDEO_ID
  // - https://player.vimeo.com/video/VIDEO_ID
  const vimeoRegex =
    /^https:\/\/(?:www\.)?(?:player\.)?vimeo\.com\/(?:video\/)?([0-9]+)(?:[?&].*)?$/;

  const vimeoMatch = trimmed.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      isAllowed: true,
      provider: 'vimeo',
      videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1`,
    };
  }

  // 3. Direct video file (.mp4 or .webm)
  const isDirectVideo =
    trimmed.startsWith('blob:') ||
    /\.(mp4|webm)(\?.*)?$/i.test(trimmed);

  if (isDirectVideo) {
    return {
      isAllowed: true,
      provider: 'direct',
      videoId: null,
      embedUrl: trimmed,
    };
  }

  // Any other URL pattern is rejected for safety
  return {
    isAllowed: false,
    provider: null,
    embedUrl: null,
    videoId: null,
    errorMessage: 'Invalid media URL. Please provide a valid YouTube, Vimeo, or direct https mp4/webm link.',
  };
}

/**
 * Checks if a URL points to a direct video file or blob.
 */
export function isDirectVideoUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  return (
    trimmed.startsWith('blob:') ||
    trimmed.endsWith('.mp4') ||
    trimmed.endsWith('.webm') ||
    trimmed.includes('.mp4?') ||
    trimmed.includes('.webm?')
  );
}
