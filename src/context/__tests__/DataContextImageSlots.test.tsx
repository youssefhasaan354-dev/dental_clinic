import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DataProvider, useData } from '../DataContext';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { EditableMedia } from '../../components/VisualEdit/EditableMedia';
import { initialImageSlots } from '../../data/initialData';
import * as firebaseClient from '../../services/firebase/client';
import * as firestoreCache from '../../utils/firestoreCache';
import * as storageIndex from '../../services/storage';
import { ImageSlot } from '../../types';

describe('DataContext & EditableMedia - No Default Flash Suite', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    vi.restoreAllMocks();
    mockStorage = {};
    const localStorageMock = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
      key: (i: number) => Object.keys(mockStorage)[i] || null,
      get length() {
        return Object.keys(mockStorage).length;
      },
    };

    (global as any).window = {
      localStorage: localStorageMock,
    };
    (global as any).localStorage = localStorageMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (global as any).window;
    delete (global as any).localStorage;
  });

  describe('1. DataContext initialization & imageSlotsReady state', () => {
    it('in Demo mode, imageSlots starts with initialImageSlots and imageSlotsReady is true', () => {
      vi.spyOn(firebaseClient, 'isFirebaseConfigured').mockReturnValue(false);

      let contextVal: any = null;
      function TestConsumer() {
        contextVal = useData();
        return <div>Ready: {String(contextVal.imageSlotsReady)}</div>;
      }

      renderToStaticMarkup(
        <DataProvider>
          <TestConsumer />
        </DataProvider>
      );

      expect(contextVal.imageSlotsReady).toBe(true);
      expect(contextVal.imageSlots).toEqual(initialImageSlots);
    });

    it('in Firebase mode without cache, imageSlots starts empty and imageSlotsReady is false', () => {
      vi.spyOn(firebaseClient, 'isFirebaseConfigured').mockReturnValue(true);
      vi.spyOn(firestoreCache, 'getCachedData').mockReturnValue(null);

      let contextVal: any = null;
      function TestConsumer() {
        contextVal = useData();
        return <div>Ready: {String(contextVal.imageSlotsReady)}</div>;
      }

      renderToStaticMarkup(
        <DataProvider>
          <TestConsumer />
        </DataProvider>
      );

      expect(contextVal.imageSlotsReady).toBe(false);
      expect(contextVal.imageSlots).toEqual([]);
    });

    it('in Firebase mode WITH valid cache, imageSlots loads synchronously and imageSlotsReady is true', () => {
      vi.spyOn(firebaseClient, 'isFirebaseConfigured').mockReturnValue(true);

      const fakeCachedSlots: ImageSlot[] = [
        {
          ...initialImageSlots[0],
          currentUrl: 'https://cdn.example.com/cached-logo.webp',
        },
      ];
      vi.spyOn(firestoreCache, 'getCachedData').mockReturnValue(fakeCachedSlots);

      let contextVal: any = null;
      function TestConsumer() {
        contextVal = useData();
        return <div>Ready: {String(contextVal.imageSlotsReady)}</div>;
      }

      renderToStaticMarkup(
        <DataProvider>
          <TestConsumer />
        </DataProvider>
      );

      expect(contextVal.imageSlotsReady).toBe(true);
      expect(contextVal.imageSlots).toEqual(fakeCachedSlots);
      expect(contextVal.getImageSlot(initialImageSlots[0].id)?.currentUrl).toBe('https://cdn.example.com/cached-logo.webp');
    });

    it('refreshData calls storage.getImageSlots and completes in finally', async () => {
      vi.spyOn(firebaseClient, 'isFirebaseConfigured').mockReturnValue(true);
      vi.spyOn(firestoreCache, 'getCachedData').mockReturnValue(null);

      const mockSlots: ImageSlot[] = [
        {
          ...initialImageSlots[0],
          currentUrl: 'https://res.cloudinary.com/demo/image/loaded.webp',
        },
      ];

      const mockStorage = {
        init: vi.fn().mockResolvedValue(undefined),
        getSettings: vi.fn().mockResolvedValue({}),
        getClinicInfo: vi.fn().mockResolvedValue({}),
        getServices: vi.fn().mockResolvedValue([]),
        getDoctors: vi.fn().mockResolvedValue([]),
        getArticles: vi.fn().mockResolvedValue([]),
        getFaqs: vi.fn().mockResolvedValue([]),
        getRatings: vi.fn().mockResolvedValue({}),
        getSections: vi.fn().mockResolvedValue([]),
        getImageSlots: vi.fn().mockResolvedValue(mockSlots),
      };
      vi.spyOn(storageIndex, 'getStorageService').mockReturnValue(mockStorage as any);

      let contextVal: any = null;
      function TestConsumer() {
        contextVal = useData();
        return null;
      }

      renderToStaticMarkup(
        <DataProvider>
          <TestConsumer />
        </DataProvider>
      );

      expect(contextVal.imageSlotsReady).toBe(false);
      expect(contextVal.imageSlots).toEqual([]);

      await contextVal.refreshData();
      expect(mockStorage.getImageSlots).toHaveBeenCalled();
    });
  });

  describe('2. EditableMedia rendering behavior', () => {
    it('in Firebase mode with imageSlotsReady=false, renders skeleton placeholder with aspect ratio and no <img> or <video>', () => {
      vi.spyOn(firebaseClient, 'isFirebaseConfigured').mockReturnValue(true);
      vi.spyOn(firestoreCache, 'getCachedData').mockReturnValue(null);

      const html = renderToStaticMarkup(
        <LanguageProvider>
          <DataProvider>
            <EditableMedia
              slotId="slot-hero"
              defaultSrc="/assets/banner/1.png"
              className="main-hero-img"
              width={540}
              height={580}
              style={{ borderRadius: '24px' }}
              disableOverlay
            />
          </DataProvider>
        </LanguageProvider>
      );

      // Must render skeleton placeholder
      expect(html).toContain('editable-media-skeleton');
      expect(html).toContain('main-hero-img');
      expect(html).toContain('aspect-ratio:16/9');
      // Must NOT render <img> or <video> or defaultSrc
      expect(html).not.toContain('<img');
      expect(html).not.toContain('<video');
      expect(html).not.toContain('/assets/banner/1.png');
    });

    it('in Firebase mode with imageSlotsReady=true, renders overridden media and not defaultSrc', () => {
      vi.spyOn(firebaseClient, 'isFirebaseConfigured').mockReturnValue(true);

      const fakeCachedSlots: ImageSlot[] = [
        {
          id: 'slot-hero',
          name: 'Hero',
          nameAr: 'Hero',
          nameEn: 'Hero',
          section: 'hero',
          defaultUrl: '/assets/banner/1.png',
          currentUrl: 'https://res.cloudinary.com/demo/image/upload/custom-hero.webp',
          aspectRatio: '16:9',
          isAI: false,
          isSample: false,
          allowVideo: true,
          mediaType: 'image',
        },
      ];
      vi.spyOn(firestoreCache, 'getCachedData').mockReturnValue(fakeCachedSlots);

      const html = renderToStaticMarkup(
        <LanguageProvider>
          <DataProvider>
            <EditableMedia
              slotId="slot-hero"
              defaultSrc="/assets/banner/1.png"
              className="main-hero-img"
              width={540}
              height={580}
              disableOverlay
            />
          </DataProvider>
        </LanguageProvider>
      );

      // Must render <img> with the override URL
      expect(html).toContain('<img');
      expect(html).toContain('custom-hero.webp');
      expect(html).not.toContain('editable-media-skeleton');
    });

    it('in Firebase mode with imageSlotsReady=true and video override, renders <video> with poster and no default image', () => {
      vi.spyOn(firebaseClient, 'isFirebaseConfigured').mockReturnValue(true);

      const fakeCachedSlots: ImageSlot[] = [
        {
          id: 'slot-hero',
          name: 'Hero',
          nameAr: 'Hero',
          nameEn: 'Hero',
          section: 'hero',
          defaultUrl: '/assets/banner/1.png',
          currentUrl: 'https://res.cloudinary.com/demo/video/upload/hero-video.mp4',
          posterUrl: 'https://res.cloudinary.com/demo/video/upload/hero-poster.jpg',
          aspectRatio: '16:9',
          isAI: false,
          isSample: false,
          allowVideo: true,
          mediaType: 'video',
        },
      ];
      vi.spyOn(firestoreCache, 'getCachedData').mockReturnValue(fakeCachedSlots);

      const html = renderToStaticMarkup(
        <LanguageProvider>
          <DataProvider>
            <EditableMedia
              slotId="slot-hero"
              defaultSrc="/assets/banner/1.png"
              className="main-hero-img"
              width={540}
              height={580}
              disableOverlay
            />
          </DataProvider>
        </LanguageProvider>
      );

      // Must render <video> with the override video and poster
      expect(html).toContain('<video');
      expect(html).toContain('hero-video.mp4');
      expect(html).toContain('hero-poster.jpg');
      expect(html).not.toContain('editable-media-skeleton');
      expect(html).not.toContain('/assets/banner/1.png');
    });

    it('in Demo mode, renders default media immediately without skeleton', () => {
      vi.spyOn(firebaseClient, 'isFirebaseConfigured').mockReturnValue(false);

      const html = renderToStaticMarkup(
        <LanguageProvider>
          <DataProvider>
            <EditableMedia
              slotId="slot-hero"
              defaultSrc="/assets/banner/1.png"
              className="main-hero-img"
              width={540}
              height={580}
              disableOverlay
            />
          </DataProvider>
        </LanguageProvider>
      );

      expect(html).toContain('<img');
      expect(html).toContain('/assets/banner/1.png');
      expect(html).not.toContain('editable-media-skeleton');
    });
  });
});
