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
import { saveMediaBlob, getAllMedia, clearAllMedia } from './mediaDB';

const STORAGE_PREFIX = 'hayaah_v1_';

export class DemoStorageService implements IDataStorageService {
  private initialized = false;

  private getKey(name: string): string {
    return `${STORAGE_PREFIX}${name}`;
  }

  private getItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(this.getKey(key));
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(value));
    } catch (e) {
      console.warn(`LocalStorage write error for ${key}:`, e);
    }
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    // Check if initial seeding has already been performed
    const hasData = localStorage.getItem(this.getKey('settings'));
    if (!hasData) {
      this.setItem('settings', initialSiteSettings);
      this.setItem('clinic', initialClinicInfo);
      this.setItem('services', initialServices);
      this.setItem('doctors', initialDoctors);
      this.setItem('articles', initialArticles);
      this.setItem('faqs', initialFaqs);
      this.setItem('ratings', initialRatings);
      this.setItem('sections', initialSections);
      this.setItem('imageSlots', initialImageSlots);
      this.setItem('requests', []);
      this.setItem('snapshots', []);
      this.setItem('logs', [
        {
          id: 'log-init',
          timestamp: new Date().toISOString(),
          userRole: 'owner',
          userName: 'System',
          action: 'System Initialized',
          details: 'Initialized demo storage with verified Hayaah Clinic seed data.',
        },
      ]);
    }
    this.initialized = true;
  }

  isLiveMode(): boolean {
    return false;
  }

  async resetDemoData(): Promise<void> {
    const keysToRemove = [
      'settings',
      'clinic',
      'services',
      'doctors',
      'articles',
      'faqs',
      'ratings',
      'sections',
      'imageSlots',
      'requests',
      'snapshots',
      'logs',
    ];
    keysToRemove.forEach((k) => localStorage.removeItem(this.getKey(k)));
    await clearAllMedia();
    this.initialized = false;
    await this.init();
  }

  // Settings
  async getSettings(): Promise<SiteSettings> {
    await this.init();
    return this.getItem('settings', initialSiteSettings);
  }

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    this.setItem('settings', updated);
    return updated;
  }

  // Clinic Info
  async getClinicInfo(): Promise<ClinicInfo> {
    await this.init();
    return this.getItem('clinic', initialClinicInfo);
  }

  async updateClinicInfo(info: Partial<ClinicInfo>): Promise<ClinicInfo> {
    const current = await this.getClinicInfo();
    const updated = { ...current, ...info };
    this.setItem('clinic', updated);
    return updated;
  }

  // Sections
  async getSections(): Promise<SectionConfig[]> {
    await this.init();
    const sections = this.getItem('sections', initialSections);
    return sections.sort((a, b) => a.order - b.order);
  }

  async updateSections(sections: SectionConfig[]): Promise<SectionConfig[]> {
    this.setItem('sections', sections);
    return sections;
  }

  // Services
  async getServices(): Promise<ServiceItem[]> {
    await this.init();
    const services = this.getItem('services', initialServices);
    return services.sort((a, b) => a.order - b.order);
  }

  async saveService(service: ServiceItem): Promise<ServiceItem> {
    const services = await this.getServices();
    const index = services.findIndex((s) => s.id === service.id);
    if (index >= 0) {
      services[index] = service;
    } else {
      services.push(service);
    }
    this.setItem('services', services);
    return service;
  }

  async deleteService(id: string): Promise<void> {
    const services = await this.getServices();
    this.setItem('services', services.filter((s) => s.id !== id));
  }

  async reorderServices(serviceIds: string[]): Promise<void> {
    const services = await this.getServices();
    const ordered = serviceIds
      .map((id, index) => {
        const item = services.find((s) => s.id === id);
        return item ? { ...item, order: index + 1 } : null;
      })
      .filter((s): s is ServiceItem => s !== null);
    this.setItem('services', ordered);
  }

  // Doctors
  async getDoctors(): Promise<DoctorProfile[]> {
    await this.init();
    const doctors = this.getItem('doctors', initialDoctors);
    return doctors.sort((a, b) => a.order - b.order);
  }

  async saveDoctor(doctor: DoctorProfile): Promise<DoctorProfile> {
    const doctors = await this.getDoctors();
    const index = doctors.findIndex((d) => d.id === doctor.id);
    if (index >= 0) {
      doctors[index] = doctor;
    } else {
      doctors.push(doctor);
    }
    this.setItem('doctors', doctors);
    return doctor;
  }

  async deleteDoctor(id: string): Promise<void> {
    const doctors = await this.getDoctors();
    this.setItem('doctors', doctors.filter((d) => d.id !== id));
  }

  // Articles
  async getArticles(): Promise<ArticleItem[]> {
    await this.init();
    return this.getItem('articles', initialArticles);
  }

  async saveArticle(article: ArticleItem): Promise<ArticleItem> {
    const articles = await this.getArticles();
    const index = articles.findIndex((a) => a.id === article.id);
    if (index >= 0) {
      articles[index] = article;
    } else {
      articles.push(article);
    }
    this.setItem('articles', articles);
    return article;
  }

  async deleteArticle(id: string): Promise<void> {
    const articles = await this.getArticles();
    this.setItem('articles', articles.filter((a) => a.id !== id));
  }

  // FAQ
  async getFaqs(): Promise<FaqItem[]> {
    await this.init();
    const faqs = this.getItem('faqs', initialFaqs);
    return faqs.sort((a, b) => a.order - b.order);
  }

  async saveFaq(faq: FaqItem): Promise<FaqItem> {
    const faqs = await this.getFaqs();
    const index = faqs.findIndex((f) => f.id === faq.id);
    if (index >= 0) {
      faqs[index] = faq;
    } else {
      faqs.push(faq);
    }
    this.setItem('faqs', faqs);
    return faq;
  }

  async deleteFaq(id: string): Promise<void> {
    const faqs = await this.getFaqs();
    this.setItem('faqs', faqs.filter((f) => f.id !== id));
  }

  // Ratings
  async getRatings(): Promise<RatingData> {
    await this.init();
    return this.getItem('ratings', initialRatings);
  }

  async updateRatings(ratings: Partial<RatingData>): Promise<RatingData> {
    const current = await this.getRatings();
    const updated = { ...current, ...ratings };
    this.setItem('ratings', updated);
    return updated;
  }

  // Image Slot Registry & Media
  async getImageSlots(): Promise<ImageSlot[]> {
    await this.init();
    return this.getItem('imageSlots', initialImageSlots);
  }

  async updateImageSlot(slotId: string, updates: Partial<ImageSlot>): Promise<ImageSlot> {
    const slots = await this.getImageSlots();
    const index = slots.findIndex((s) => s.id === slotId);
    if (index >= 0) {
      slots[index] = { ...slots[index], ...updates };
      this.setItem('imageSlots', slots);
      return slots[index];
    }
    throw new Error(`Image slot ${slotId} not found`);
  }

  async uploadMedia(file: File, metadata?: { isAI?: boolean; isSample?: boolean }): Promise<string> {
    const { url } = await saveMediaBlob(file, file.name, metadata);
    return url;
  }

  async getAllMediaFiles(): Promise<{ id: string; url: string; name: string; size: number; date: string }[]> {
    return getAllMedia();
  }

  // Appointment Requests Inbox
  async getAppointmentRequests(): Promise<AppointmentRequest[]> {
    await this.init();
    return this.getItem('requests', []);
  }

  async createAppointmentRequest(
    request: Omit<AppointmentRequest, 'id' | 'createdAt' | 'status' | 'isDemoSubmission'>
  ): Promise<AppointmentRequest> {
    const requests = await this.getAppointmentRequests();
    const newRequest: AppointmentRequest = {
      ...request,
      id: 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      status: 'new',
      isDemoSubmission: true,
    };
    requests.unshift(newRequest);
    this.setItem('requests', requests);
    return newRequest;
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus, internalNotes?: string): Promise<void> {
    const requests = await this.getAppointmentRequests();
    const target = requests.find((r) => r.id === id);
    if (target) {
      target.status = status;
      if (internalNotes !== undefined) {
        target.internalNotes = internalNotes;
      }
      if (status === 'contacted' && !target.contactedAt) {
        target.contactedAt = new Date().toISOString();
      }
      this.setItem('requests', requests);
    }
  }

  async deleteAppointmentRequest(id: string): Promise<void> {
    const requests = await this.getAppointmentRequests();
    this.setItem('requests', requests.filter((r) => r.id !== id));
  }

  // Snapshots & Versioning
  async createSnapshot(label: string, user: string): Promise<VersionSnapshot> {
    const snapshots = await this.getSnapshots();
    const snapshot: VersionSnapshot = {
      id: 'snap_' + Date.now(),
      timestamp: new Date().toISOString(),
      label,
      createdBy: user,
      data: {
        clinic: await this.getClinicInfo(),
        services: await this.getServices(),
        doctors: await this.getDoctors(),
        articles: await this.getArticles(),
        faqs: await this.getFaqs(),
        settings: await this.getSettings(),
        sections: await this.getSections(),
        imageSlots: await this.getImageSlots(),
      },
    };
    snapshots.unshift(snapshot);
    // Keep maximum 20 snapshots
    const trimmed = snapshots.slice(0, 20);
    this.setItem('snapshots', trimmed);
    return snapshot;
  }

  async getSnapshots(): Promise<VersionSnapshot[]> {
    await this.init();
    return this.getItem('snapshots', []);
  }

  async restoreSnapshot(id: string): Promise<void> {
    const snapshots = await this.getSnapshots();
    const target = snapshots.find((s) => s.id === id);
    if (!target) throw new Error(`Snapshot ${id} not found`);

    this.setItem('clinic', target.data.clinic);
    this.setItem('services', target.data.services);
    this.setItem('doctors', target.data.doctors);
    this.setItem('articles', target.data.articles);
    this.setItem('faqs', target.data.faqs);
    this.setItem('settings', target.data.settings);
    this.setItem('sections', target.data.sections);
    this.setItem('imageSlots', target.data.imageSlots);
  }

  // Activity Logs
  async logActivity(role: UserRole, user: string, action: string, details: string): Promise<void> {
    const logs = await this.getActivityLogs();
    const entry: ActivityLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      userRole: role,
      userName: user,
      action,
      details,
    };
    logs.unshift(entry);
    this.setItem('logs', logs.slice(0, 100)); // Keep latest 100 entries
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    await this.init();
    return this.getItem('logs', []);
  }
}
