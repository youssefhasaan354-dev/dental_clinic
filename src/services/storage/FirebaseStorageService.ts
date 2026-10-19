/**
 * Hayaah Dental Clinic - Firebase Production Storage Adapter
 * Implements IDataStorageService using Google Cloud Firestore.
 * Does NOT use Firebase Storage. Images are compressed client-side to WebP (max 200KB)
 * and stored as data URLs in Firestore documents.
 * Includes localStorage client-side caching (10-minute TTL) for public getters to reduce read operations.
 */

import { IDataStorageService } from './IDataStorageService';
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
  AppointmentRequest,
  AppointmentStatus,
  ActivityLog,
  VersionSnapshot,
  UserRole,
} from '../../types';
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
} from '../../data/initialData';
import { compressImageToWebP, MAX_CMS_IMAGE_SIZE_BYTES } from '../../utils/imageCompressor';
import { getFirebaseFirestore } from '../firebase/client';
import { getCachedData, setCachedData, invalidateCachedData } from '../../utils/firestoreCache';
import { stripUndefined } from '../../utils/stripUndefined';

export class FirebaseStorageService implements IDataStorageService {
  private initialized = false;

  private async getDB() {
    return getFirebaseFirestore();
  }

  isLiveMode(): boolean {
    return true;
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      const db = await this.getDB();
      const { doc, getDoc, setDoc } = await import('firebase/firestore');

      // Check if global site_settings doc exists; if not, seed initial clinic data
      const settingsSnap = await getDoc(doc(db, 'site_settings', 'global'));
      if (!settingsSnap.exists()) {
        await Promise.all([
          setDoc(doc(db, 'site_settings', 'global'), stripUndefined(initialSiteSettings)),
          setDoc(doc(db, 'clinic_info', 'global'), stripUndefined(initialClinicInfo)),
          setDoc(doc(db, 'sections', 'global'), { list: initialSections }),
          setDoc(doc(db, 'ratings', 'global'), stripUndefined(initialRatings)),
        ]);

        // Seed collections
        for (const s of initialServices) {
          await setDoc(doc(db, 'services', s.id), stripUndefined(s));
        }
        for (const d of initialDoctors) {
          await setDoc(doc(db, 'doctors', d.id), stripUndefined(d));
        }
        for (const a of initialArticles) {
          await setDoc(doc(db, 'articles', a.id), stripUndefined(a));
        }
        for (const f of initialFaqs) {
          await setDoc(doc(db, 'faqs', f.id), stripUndefined(f));
        }
        for (const slot of initialImageSlots) {
          await setDoc(doc(db, 'image_slots', slot.id), stripUndefined(slot));
        }

        invalidateCachedData();
      }
      this.initialized = true;
    } catch (err) {
      console.warn('[FirebaseStorageService] init seed error (might be permission limited for public users):', err);
      this.initialized = true;
    }
  }

  async resetDemoData(): Promise<void> {
    console.info('[FirebaseStorageService] resetDemoData is not applicable on live Firebase database.');
  }

  // --- Settings ---

  async getSettings(): Promise<SiteSettings> {
    const cached = getCachedData<SiteSettings>('site_settings');
    if (cached) return cached;

    const db = await this.getDB();
    const { doc, getDoc } = await import('firebase/firestore');
    const snap = await getDoc(doc(db, 'site_settings', 'global'));
    if (!snap.exists()) return initialSiteSettings;
    const data = snap.data() as SiteSettings;
    setCachedData('site_settings', data);
    return data;
  }

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const db = await this.getDB();
    const { doc, setDoc } = await import('firebase/firestore');
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    await setDoc(doc(db, 'site_settings', 'global'), stripUndefined(updated));
    invalidateCachedData('site_settings');
    return updated;
  }

  // --- Clinic Info ---

  async getClinicInfo(): Promise<ClinicInfo> {
    const cached = getCachedData<ClinicInfo>('clinic_info');
    if (cached) return cached;

    const db = await this.getDB();
    const { doc, getDoc } = await import('firebase/firestore');
    const snap = await getDoc(doc(db, 'clinic_info', 'global'));
    if (!snap.exists()) return initialClinicInfo;
    const data = snap.data() as ClinicInfo;
    setCachedData('clinic_info', data);
    return data;
  }

  async updateClinicInfo(info: Partial<ClinicInfo>): Promise<ClinicInfo> {
    const db = await this.getDB();
    const { doc, setDoc } = await import('firebase/firestore');
    const current = await this.getClinicInfo();
    const updated = { ...current, ...info };
    await setDoc(doc(db, 'clinic_info', 'global'), stripUndefined(updated));
    invalidateCachedData('clinic_info');
    return updated;
  }

  // --- Sections ---

  async getSections(): Promise<SectionConfig[]> {
    const cached = getCachedData<SectionConfig[]>('sections');
    if (cached) return cached;

    const db = await this.getDB();
    const { doc, getDoc } = await import('firebase/firestore');
    const snap = await getDoc(doc(db, 'sections', 'global'));
    if (!snap.exists()) return initialSections;
    const list = (snap.data() as { list: SectionConfig[] }).list || initialSections;
    setCachedData('sections', list);
    return list;
  }

  async updateSections(sections: SectionConfig[]): Promise<SectionConfig[]> {
    const db = await this.getDB();
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'sections', 'global'), { list: sections });
    invalidateCachedData('sections');
    return sections;
  }

  // --- Services ---

  async getServices(): Promise<ServiceItem[]> {
    const cached = getCachedData<ServiceItem[]>('services');
    if (cached) return cached;

    const db = await this.getDB();
    const { collection, getDocs } = await import('firebase/firestore');
    const snap = await getDocs(collection(db, 'services'));
    if (snap.empty) return initialServices;
    const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as ServiceItem));
    const sorted = list.sort((a, b) => (a.order || 0) - (b.order || 0));
    setCachedData('services', sorted);
    return sorted;
  }

  async saveService(service: ServiceItem): Promise<ServiceItem> {
    const db = await this.getDB();
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'services', service.id), stripUndefined(service));
    invalidateCachedData('services');
    return service;
  }

  async deleteService(id: string): Promise<void> {
    const db = await this.getDB();
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'services', id));
    invalidateCachedData('services');
  }

  async reorderServices(serviceIds: string[]): Promise<void> {
    const services = await this.getServices();
    for (let i = 0; i < serviceIds.length; i++) {
      const s = services.find((item) => item.id === serviceIds[i]);
      if (s) {
        await this.saveService({ ...s, order: i });
      }
    }
    invalidateCachedData('services');
  }

  // --- Doctors Profiles (CMS) ---

  async getDoctors(): Promise<DoctorProfile[]> {
    const cached = getCachedData<DoctorProfile[]>('doctors');
    if (cached) return cached;

    const db = await this.getDB();
    const { collection, getDocs } = await import('firebase/firestore');
    const snap = await getDocs(collection(db, 'doctors'));
    if (snap.empty) return initialDoctors;
    const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as DoctorProfile));
    const sorted = list.sort((a, b) => (a.order || 0) - (b.order || 0));
    setCachedData('doctors', sorted);
    return sorted;
  }

  async saveDoctor(doctor: DoctorProfile): Promise<DoctorProfile> {
    const db = await this.getDB();
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'doctors', doctor.id), stripUndefined(doctor));
    invalidateCachedData('doctors');
    invalidateCachedData('booking_doctors');
    return doctor;
  }

  async deleteDoctor(id: string): Promise<void> {
    const db = await this.getDB();
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'doctors', id));
    invalidateCachedData('doctors');
    invalidateCachedData('booking_doctors');
  }

  // --- Articles ---

  async getArticles(): Promise<ArticleItem[]> {
    const cached = getCachedData<ArticleItem[]>('articles');
    if (cached) return cached;

    const db = await this.getDB();
    const { collection, getDocs } = await import('firebase/firestore');
    const snap = await getDocs(collection(db, 'articles'));
    if (snap.empty) return initialArticles;
    const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as ArticleItem));
    const sorted = list.sort((a, b) => (b.publishDate || '').localeCompare(a.publishDate || ''));
    setCachedData('articles', sorted);
    return sorted;
  }

  async saveArticle(article: ArticleItem): Promise<ArticleItem> {
    const db = await this.getDB();
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'articles', article.id), stripUndefined(article));
    invalidateCachedData('articles');
    return article;
  }

  async deleteArticle(id: string): Promise<void> {
    const db = await this.getDB();
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'articles', id));
    invalidateCachedData('articles');
  }

  // --- FAQ ---

  async getFaqs(): Promise<FaqItem[]> {
    const cached = getCachedData<FaqItem[]>('faqs');
    if (cached) return cached;

    const db = await this.getDB();
    const { collection, getDocs } = await import('firebase/firestore');
    const snap = await getDocs(collection(db, 'faqs'));
    if (snap.empty) return initialFaqs;
    const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as FaqItem));
    const sorted = list.sort((a, b) => (a.order || 0) - (b.order || 0));
    setCachedData('faqs', sorted);
    return sorted;
  }

  async saveFaq(faq: FaqItem): Promise<FaqItem> {
    const db = await this.getDB();
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'faqs', faq.id), stripUndefined(faq));
    invalidateCachedData('faqs');
    return faq;
  }

  async deleteFaq(id: string): Promise<void> {
    const db = await this.getDB();
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'faqs', id));
    invalidateCachedData('faqs');
  }

  // --- Ratings ---

  async getRatings(): Promise<RatingData> {
    const cached = getCachedData<RatingData>('ratings');
    if (cached) return cached;

    const db = await this.getDB();
    const { doc, getDoc } = await import('firebase/firestore');
    const snap = await getDoc(doc(db, 'ratings', 'global'));
    if (!snap.exists()) return initialRatings;
    const data = snap.data() as RatingData;
    setCachedData('ratings', data);
    return data;
  }

  async updateRatings(ratings: Partial<RatingData>): Promise<RatingData> {
    const db = await this.getDB();
    const { doc, setDoc } = await import('firebase/firestore');
    const current = await this.getRatings();
    const updated = { ...current, ...ratings };
    await setDoc(doc(db, 'ratings', 'global'), stripUndefined(updated));
    invalidateCachedData('ratings');
    return updated;
  }

  // --- Image Slots & Media (WebP <= 200KB) ---

  async getImageSlots(): Promise<ImageSlot[]> {
    const cached = getCachedData<ImageSlot[]>('image_slots');
    if (cached) return cached;

    const db = await this.getDB();
    const { collection, getDocs } = await import('firebase/firestore');
    const snap = await getDocs(collection(db, 'image_slots'));
    if (snap.empty) return initialImageSlots;
    const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as ImageSlot));
    setCachedData('image_slots', list);
    return list;
  }

  async updateImageSlot(slotId: string, updates: Partial<ImageSlot>): Promise<ImageSlot> {
    const db = await this.getDB();
    const { doc, getDoc, updateDoc } = await import('firebase/firestore');
    const slotRef = doc(db, 'image_slots', slotId);
    const snap = await getDoc(slotRef);
    if (!snap.exists()) throw new Error(`Image slot ${slotId} not found`);

    const updated = { ...(snap.data() as ImageSlot), ...updates, id: slotId };
    await updateDoc(slotRef, stripUndefined(updates));
    invalidateCachedData('image_slots');
    return updated;
  }

  async uploadMedia(file: File, metadata?: { isAI?: boolean; isSample?: boolean }): Promise<string> {
    // Resize & compress client-side to WebP <= 200KB
    const webpDataUrl = await compressImageToWebP(file, {
      maxSizeBytes: MAX_CMS_IMAGE_SIZE_BYTES,
    });

    const db = await this.getDB();
    const { doc, setDoc } = await import('firebase/firestore');
    const mediaId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await setDoc(doc(db, 'media_files', mediaId), stripUndefined({
      id: mediaId,
      url: webpDataUrl,
      name: file.name,
      size: Math.round(webpDataUrl.length * 0.75),
      date: new Date().toISOString(),
      metadata: metadata || null,
    }));

    return webpDataUrl;
  }

  async getAllMediaFiles(): Promise<{ id: string; url: string; name: string; size: number; date: string }[]> {
    const db = await this.getDB();
    const { collection, getDocs } = await import('firebase/firestore');
    const snap = await getDocs(collection(db, 'media_files'));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        url: data.url,
        name: data.name,
        size: data.size || 0,
        date: data.date,
      };
    });
  }

  // --- Appointment Requests ---

  async getAppointmentRequests(): Promise<AppointmentRequest[]> {
    const db = await this.getDB();
    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    const snap = await getDocs(query(collection(db, 'appointment_requests'), orderBy('createdAt', 'desc')));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as AppointmentRequest));
  }

  async createAppointmentRequest(
    request: Omit<AppointmentRequest, 'id' | 'createdAt' | 'status' | 'isDemoSubmission'>
  ): Promise<AppointmentRequest> {
    const db = await this.getDB();
    const { collection, doc, setDoc } = await import('firebase/firestore');
    const newRef = doc(collection(db, 'appointment_requests'));
    const payload: AppointmentRequest = {
      ...request,
      id: newRef.id,
      createdAt: new Date().toISOString(),
      status: 'new',
      isDemoSubmission: false,
    };
    await setDoc(newRef, stripUndefined(payload));
    return payload;
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus, internalNotes?: string): Promise<void> {
    const db = await this.getDB();
    const { doc, updateDoc } = await import('firebase/firestore');
    const updates: any = {
      status,
      contactedAt: status === 'contacted' ? new Date().toISOString() : undefined,
    };
    if (internalNotes !== undefined) updates.internalNotes = internalNotes;
    await updateDoc(doc(db, 'appointment_requests', id), stripUndefined(updates));
  }

  async deleteAppointmentRequest(id: string): Promise<void> {
    const db = await this.getDB();
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'appointment_requests', id));
  }

  // --- Snapshots ---

  async createSnapshot(label: string, user: string): Promise<VersionSnapshot> {
    const db = await this.getDB();
    const { collection, doc, setDoc } = await import('firebase/firestore');
    const newRef = doc(collection(db, 'snapshots'));

    const snapshot: VersionSnapshot = {
      id: newRef.id,
      timestamp: new Date().toISOString(),
      label,
      createdBy: user,
      data: {
        clinic: await this.getClinicInfo(),
        services: await this.getServices(),
        doctors: await this.getDoctors(),
        articles: await this.getArticles(),
        faqs: await this.getFaqs(),
        ratings: await this.getRatings(),
        settings: await this.getSettings(),
        sections: await this.getSections(),
      },
    };

    await setDoc(newRef, stripUndefined(snapshot));
    return snapshot;
  }

  async getSnapshots(): Promise<VersionSnapshot[]> {
    const db = await this.getDB();
    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    const snap = await getDocs(query(collection(db, 'snapshots'), orderBy('timestamp', 'desc')));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as VersionSnapshot));
  }

  async restoreSnapshot(id: string): Promise<void> {
    const db = await this.getDB();
    const { doc, getDoc } = await import('firebase/firestore');
    const snap = await getDoc(doc(db, 'snapshots', id));
    if (!snap.exists()) throw new Error('Snapshot not found');

    const snapshot = snap.data() as VersionSnapshot;
    const { clinic, services, doctors, articles, faqs, ratings, settings, sections } = snapshot.data;

    if (clinic) await this.updateClinicInfo(clinic);
    if (settings) await this.updateSettings(settings);
    if (sections) await this.updateSections(sections);
    if (ratings) await this.updateRatings(ratings);

    if (services) {
      for (const s of services) {
        await this.saveService(s);
      }
    }
    if (doctors) {
      for (const d of doctors) {
        await this.saveDoctor(d);
      }
    }
    if (articles) {
      for (const a of articles) {
        await this.saveArticle(a);
      }
    }
    if (faqs) {
      for (const f of faqs) {
        await this.saveFaq(f);
      }
    }

    invalidateCachedData();
  }

  // --- Activity Logs ---

  async logActivity(role: UserRole, user: string, action: string, details: string): Promise<void> {
    try {
      const db = await this.getDB();
      const { collection, doc, setDoc } = await import('firebase/firestore');
      const newRef = doc(collection(db, 'activity_logs'));
      const log: ActivityLog = {
        id: newRef.id,
        timestamp: new Date().toISOString(),
        userRole: role,
        userName: user,
        action,
        details,
      };
      await setDoc(newRef, stripUndefined(log));
    } catch (err) {
      console.warn('Could not record activity log:', err);
    }
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    const db = await this.getDB();
    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    const snap = await getDocs(query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc')));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as ActivityLog));
  }
}
