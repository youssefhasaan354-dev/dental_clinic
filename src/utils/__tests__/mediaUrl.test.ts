import { describe, it, expect } from 'vitest';
import {
  optimizeImageUrl,
  optimizeVideoUrl,
  buildCloudinaryVideoPoster,
  parseVideoEmbedUrl,
  isDirectVideoUrl,
} from '../mediaUrl';

describe('mediaUrl utility suite', () => {
  describe('optimizeImageUrl', () => {
    it('returns empty string for falsy input', () => {
      expect(optimizeImageUrl(undefined)).toBe('');
      expect(optimizeImageUrl(null)).toBe('');
      expect(optimizeImageUrl('')).toBe('');
    });

    it('leaves non-Cloudinary URLs completely untouched', () => {
      const local = '/assets/banner/1.png';
      expect(optimizeImageUrl(local)).toBe(local);

      const unsplash = 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format';
      expect(optimizeImageUrl(unsplash)).toBe(unsplash);
    });

    it('injects f_auto,q_auto into Cloudinary image URL', () => {
      const cld = 'https://res.cloudinary.com/hayaah/image/upload/v12345/hero.jpg';
      const expected = 'https://res.cloudinary.com/hayaah/image/upload/f_auto,q_auto/v12345/hero.jpg';
      expect(optimizeImageUrl(cld)).toBe(expected);
    });

    it('injects f_auto,q_auto,w_<width> when width is specified', () => {
      const cld = 'https://res.cloudinary.com/hayaah/image/upload/v12345/hero.jpg';
      const expected = 'https://res.cloudinary.com/hayaah/image/upload/f_auto,q_auto,w_800/v12345/hero.jpg';
      expect(optimizeImageUrl(cld, { width: 800 })).toBe(expected);
    });

    it('does not duplicate transformations if already present', () => {
      const already = 'https://res.cloudinary.com/hayaah/image/upload/f_auto,q_auto,w_800/v12345/hero.jpg';
      expect(optimizeImageUrl(already, { width: 800 })).toBe(already);
    });
  });

  describe('optimizeVideoUrl', () => {
    it('returns empty string for falsy input', () => {
      expect(optimizeVideoUrl(undefined)).toBe('');
      expect(optimizeVideoUrl('')).toBe('');
    });

    it('leaves non-Cloudinary URLs completely untouched', () => {
      const mp4 = 'https://cdn.example.com/videos/clinic-tour.mp4';
      expect(optimizeVideoUrl(mp4)).toBe(mp4);
    });

    it('injects f_auto,q_auto into Cloudinary video URL', () => {
      const cld = 'https://res.cloudinary.com/hayaah/video/upload/v12345/clinic.mp4';
      const expected = 'https://res.cloudinary.com/hayaah/video/upload/f_auto,q_auto/v12345/clinic.mp4';
      expect(optimizeVideoUrl(cld)).toBe(expected);
    });
  });

  describe('buildCloudinaryVideoPoster', () => {
    it('generates so_0 jpg frame poster for Cloudinary videos', () => {
      const cld = 'https://res.cloudinary.com/hayaah/video/upload/v12345/clinic.mp4';
      const expected = 'https://res.cloudinary.com/hayaah/video/upload/so_0/v12345/clinic.jpg';
      expect(buildCloudinaryVideoPoster(cld)).toBe(expected);
    });

    it('returns null for non-Cloudinary video URLs', () => {
      expect(buildCloudinaryVideoPoster('https://example.com/video.mp4')).toBeNull();
    });
  });

  describe('parseVideoEmbedUrl', () => {
    it('parses standard YouTube URLs into privacy-friendly youtube-nocookie embed', () => {
      const urls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtube.com/watch?v=dQw4w9WgXcQ&t=10s',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://www.youtube.com/shorts/dQw4w9WgXcQ',
        'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      ];

      for (const u of urls) {
        const parsed = parseVideoEmbedUrl(u);
        expect(parsed.isAllowed).toBe(true);
        expect(parsed.provider).toBe('youtube');
        expect(parsed.videoId).toBe('dQw4w9WgXcQ');
        expect(parsed.embedUrl).toContain('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
        expect(parsed.posterUrl).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
      }
    });

    it('parses Vimeo URLs into player.vimeo.com embed', () => {
      const urls = [
        'https://vimeo.com/76979871',
        'https://www.vimeo.com/76979871',
        'https://player.vimeo.com/video/76979871',
      ];

      for (const u of urls) {
        const parsed = parseVideoEmbedUrl(u);
        expect(parsed.isAllowed).toBe(true);
        expect(parsed.provider).toBe('vimeo');
        expect(parsed.videoId).toBe('76979871');
        expect(parsed.embedUrl).toBe('https://player.vimeo.com/video/76979871?autoplay=1');
      }
    });

    it('detects direct https mp4 and webm videos', () => {
      const mp4 = 'https://cdn.example.com/videos/clinic.mp4';
      const parsedMp4 = parseVideoEmbedUrl(mp4);
      expect(parsedMp4.isAllowed).toBe(true);
      expect(parsedMp4.provider).toBe('direct');
      expect(parsedMp4.embedUrl).toBe(mp4);

      const webm = 'https://cdn.example.com/videos/clinic.webm';
      const parsedWebm = parseVideoEmbedUrl(webm);
      expect(parsedWebm.isAllowed).toBe(true);
      expect(parsedWebm.provider).toBe('direct');
    });

    it('strictly REJECTS non-https URLs', () => {
      const httpYt = 'http://www.youtube.com/watch?v=dQw4w9WgXcQ';
      expect(parseVideoEmbedUrl(httpYt).isAllowed).toBe(false);

      const httpVideo = 'http://cdn.example.com/video.mp4';
      expect(parseVideoEmbedUrl(httpVideo).isAllowed).toBe(false);
    });

    it('strictly REJECTS arbitrary non-whitelisted websites and javascript URIs', () => {
      const malicious = [
        'javascript:alert(1)',
        'https://attacker.com/malicious-iframe',
        'https://tiktok.com/@user/video/12345',
        'https://facebook.com/watch/?v=12345',
        'https://randomsite.org/embed',
      ];

      for (const m of malicious) {
        const parsed = parseVideoEmbedUrl(m);
        expect(parsed.isAllowed).toBe(false);
        expect(parsed.embedUrl).toBeNull();
      }
    });
  });

  describe('isDirectVideoUrl', () => {
    it('identifies direct video formats', () => {
      expect(isDirectVideoUrl('https://example.com/vid.mp4')).toBe(true);
      expect(isDirectVideoUrl('https://example.com/vid.webm')).toBe(true);
      expect(isDirectVideoUrl('blob:http://localhost:5173/uuid')).toBe(true);
      expect(isDirectVideoUrl('https://example.com/image.png')).toBe(false);
    });
  });
});
