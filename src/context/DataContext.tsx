import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ClinicInfo,
  ServiceItem,
  DoctorProfile,
  ArticleItem,
  FaqItem,
  RatingData,
  SiteSettings,
  SectionConfig,
  ImageSlot,
} from '../types';
import { getStorageService } from '../services/storage';
import {
  initialClinicInfo,
  initialServices,
  initialDoctors,
  initialArticles,
  initialFaqs,
  initialRatings,
  initialSiteSettings,
  initialSections,
  initialImageSlots,
} from '../data/initialData';

import { isFirebaseConfigured } from '../services/firebase/client';
import { getCachedData } from '../utils/firestoreCache';

interface DataContextType {
  clinicInfo: ClinicInfo;
  settings: SiteSettings;
  services: ServiceItem[];
  doctors: DoctorProfile[];
  articles: ArticleItem[];
  faqs: FaqItem[];
  ratings: RatingData;
  sections: SectionConfig[];
  imageSlots: ImageSlot[];
  imageSlotsReady: boolean;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  getImageSlot: (slotId: string) => ImageSlot | undefined;
  updateImageSlot: (slotId: string, updates: Partial<ImageSlot>) => Promise<void>;
  editingSlot: ImageSlot | null;
  setEditingSlot: (slot: ImageSlot | null) => void;
  resetDemoData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isFirebase = isFirebaseConfigured();
  const cachedSlots = isFirebase ? getCachedData<ImageSlot[]>('site_images') : null;
  const hasValidCache = Boolean(cachedSlots && Array.isArray(cachedSlots) && cachedSlots.length > 0);

  const [clinicInfo, setClinicInfo] = useState<ClinicInfo>(initialClinicInfo);
  const [settings, setSettings] = useState<SiteSettings>(initialSiteSettings);
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [doctors, setDoctors] = useState<DoctorProfile[]>(initialDoctors);
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles);
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs);
  const [ratings, setRatings] = useState<RatingData>(initialRatings);
  const [sections, setSections] = useState<SectionConfig[]>(initialSections);
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>(() => {
    if (!isFirebase) {
      return initialImageSlots;
    }
    if (hasValidCache && cachedSlots) {
      return cachedSlots;
    }
    return [];
  });
  const [imageSlotsReady, setImageSlotsReady] = useState<boolean>(() => {
    if (!isFirebase) {
      return true;
    }
    return hasValidCache;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingSlot, setEditingSlot] = useState<ImageSlot | null>(null);

  const refreshData = useCallback(async () => {
    try {
      const storage = getStorageService();
      await storage.init();
      const [
        loadedSettings,
        loadedClinic,
        loadedServices,
        loadedDoctors,
        loadedArticles,
        loadedFaqs,
        loadedRatings,
        loadedSections,
        loadedSlots,
      ] = await Promise.all([
        storage.getSettings(),
        storage.getClinicInfo(),
        storage.getServices(),
        storage.getDoctors(),
        storage.getArticles(),
        storage.getFaqs(),
        storage.getRatings(),
        storage.getSections(),
        storage.getImageSlots(),
      ]);

      setSettings(loadedSettings);
      setClinicInfo(loadedClinic);
      setServices(loadedServices);
      setDoctors(loadedDoctors);
      setArticles(loadedArticles);
      setFaqs(loadedFaqs);
      setRatings(loadedRatings);
      setSections(loadedSections);
      setImageSlots(loadedSlots);
    } catch (err) {
      console.error('Error refreshing clinic data:', err);
      // Fallback to initial slots on failure so slots are never empty
      setImageSlots((prev) => (prev.length === 0 ? initialImageSlots : prev));
    } finally {
      setIsLoading(false);
      setImageSlotsReady(true);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const getImageSlot = useCallback(
    (slotId: string): ImageSlot | undefined => {
      return imageSlots.find((s) => s.id === slotId);
    },
    [imageSlots]
  );

  const updateImageSlot = useCallback(
    async (slotId: string, updates: Partial<ImageSlot>) => {
      const storage = getStorageService();
      const updated = await storage.updateImageSlot(slotId, updates);
      setImageSlots((prev) => prev.map((s) => (s.id === slotId ? updated : s)));
    },
    []
  );

  const resetDemoData = useCallback(async () => {
    setIsLoading(true);
    const storage = getStorageService();
    await storage.resetDemoData();
    await refreshData();
  }, [refreshData]);

  return (
    <DataContext.Provider
      value={{
        clinicInfo,
        settings,
        services,
        doctors,
        articles,
        faqs,
        ratings,
        sections,
        imageSlots,
        imageSlotsReady,
        isLoading,
        refreshData,
        getImageSlot,
        updateImageSlot,
        editingSlot,
        setEditingSlot,
        resetDemoData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
