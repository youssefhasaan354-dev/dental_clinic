import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IDataStorageService } from './IDataStorageService';
import { DemoStorageService } from './DemoStorageService';
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

export class SupabaseStorageService implements IDataStorageService {
  private client: SupabaseClient | null = null;
  private fallback: DemoStorageService;

  constructor() {
    this.fallback = new DemoStorageService();
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (url && key) {
      try {
        this.client = createClient(url, key);
      } catch (err) {
        console.warn('Supabase initialization failed, falling back to demo storage:', err);
      }
    }
  }

  isLiveMode(): boolean {
    return this.client !== null;
  }

  async init(): Promise<void> {
    if (!this.client) {
      return this.fallback.init();
    }
  }

  async resetDemoData(): Promise<void> {
    return this.fallback.resetDemoData();
  }

  // Settings
  async getSettings(): Promise<SiteSettings> {
    if (!this.client) return this.fallback.getSettings();
    const { data, error } = await this.client.from('site_settings').select('*').single();
    if (error || !data) return this.fallback.getSettings();
    return data;
  }

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    if (!this.client) return this.fallback.updateSettings(settings);
    const { data } = await this.client.from('site_settings').update(settings).eq('id', 1).select().single();
    return data || this.fallback.updateSettings(settings);
  }

  // Clinic Info
  async getClinicInfo(): Promise<ClinicInfo> {
    if (!this.client) return this.fallback.getClinicInfo();
    const { data } = await this.client.from('clinic_info').select('*').single();
    return data || this.fallback.getClinicInfo();
  }

  async updateClinicInfo(info: Partial<ClinicInfo>): Promise<ClinicInfo> {
    if (!this.client) return this.fallback.updateClinicInfo(info);
    const { data } = await this.client.from('clinic_info').update(info).eq('id', 1).select().single();
    return data || this.fallback.updateClinicInfo(info);
  }

  // Sections
  async getSections(): Promise<SectionConfig[]> {
    if (!this.client) return this.fallback.getSections();
    const { data } = await this.client.from('sections').select('*').order('order');
    return data || this.fallback.getSections();
  }

  async updateSections(sections: SectionConfig[]): Promise<SectionConfig[]> {
    if (!this.client) return this.fallback.updateSections(sections);
    await this.client.from('sections').upsert(sections);
    return sections;
  }

  // Services
  async getServices(): Promise<ServiceItem[]> {
    if (!this.client) return this.fallback.getServices();
    const { data } = await this.client.from('services').select('*').order('order');
    return data || this.fallback.getServices();
  }

  async saveService(service: ServiceItem): Promise<ServiceItem> {
    if (!this.client) return this.fallback.saveService(service);
    const { data } = await this.client.from('services').upsert(service).select().single();
    return data || this.fallback.saveService(service);
  }

  async deleteService(id: string): Promise<void> {
    if (!this.client) return this.fallback.deleteService(id);
    await this.client.from('services').delete().eq('id', id);
  }

  async reorderServices(serviceIds: string[]): Promise<void> {
    return this.fallback.reorderServices(serviceIds);
  }

  // Doctors
  async getDoctors(): Promise<DoctorProfile[]> {
    if (!this.client) return this.fallback.getDoctors();
    const { data } = await this.client.from('doctors').select('*').order('order');
    return data || this.fallback.getDoctors();
  }

  async saveDoctor(doctor: DoctorProfile): Promise<DoctorProfile> {
    if (!this.client) return this.fallback.saveDoctor(doctor);
    const { data } = await this.client.from('doctors').upsert(doctor).select().single();
    return data || this.fallback.saveDoctor(doctor);
  }

  async deleteDoctor(id: string): Promise<void> {
    if (!this.client) return this.fallback.deleteDoctor(id);
    await this.client.from('doctors').delete().eq('id', id);
  }

  // Articles
  async getArticles(): Promise<ArticleItem[]> {
    if (!this.client) return this.fallback.getArticles();
    const { data } = await this.client.from('articles').select('*').order('publishDate', { ascending: false });
    return data || this.fallback.getArticles();
  }

  async saveArticle(article: ArticleItem): Promise<ArticleItem> {
    if (!this.client) return this.fallback.saveArticle(article);
    const { data } = await this.client.from('articles').upsert(article).select().single();
    return data || this.fallback.saveArticle(article);
  }

  async deleteArticle(id: string): Promise<void> {
    if (!this.client) return this.fallback.deleteArticle(id);
    await this.client.from('articles').delete().eq('id', id);
  }

  // FAQ
  async getFaqs(): Promise<FaqItem[]> {
    if (!this.client) return this.fallback.getFaqs();
    const { data } = await this.client.from('faqs').select('*').order('order');
    return data || this.fallback.getFaqs();
  }

  async saveFaq(faq: FaqItem): Promise<FaqItem> {
    if (!this.client) return this.fallback.saveFaq(faq);
    const { data } = await this.client.from('faqs').upsert(faq).select().single();
    return data || this.fallback.saveFaq(faq);
  }

  async deleteFaq(id: string): Promise<void> {
    if (!this.client) return this.fallback.deleteFaq(id);
    await this.client.from('faqs').delete().eq('id', id);
  }

  // Ratings
  async getRatings(): Promise<RatingData> {
    if (!this.client) return this.fallback.getRatings();
    const { data } = await this.client.from('ratings').select('*').single();
    return data || this.fallback.getRatings();
  }

  async updateRatings(ratings: Partial<RatingData>): Promise<RatingData> {
    if (!this.client) return this.fallback.updateRatings(ratings);
    const { data } = await this.client.from('ratings').update(ratings).eq('id', 1).select().single();
    return data || this.fallback.updateRatings(ratings);
  }

  // Image Slots
  async getImageSlots(): Promise<ImageSlot[]> {
    if (!this.client) return this.fallback.getImageSlots();
    const { data } = await this.client.from('image_slots').select('*');
    return data || this.fallback.getImageSlots();
  }

  async updateImageSlot(slotId: string, updates: Partial<ImageSlot>): Promise<ImageSlot> {
    if (!this.client) return this.fallback.updateImageSlot(slotId, updates);
    const { data } = await this.client.from('image_slots').update(updates).eq('id', slotId).select().single();
    return data || this.fallback.updateImageSlot(slotId, updates);
  }

  async uploadMedia(file: File, metadata?: { isAI?: boolean; isSample?: boolean }): Promise<string> {
    if (!this.client) return this.fallback.uploadMedia(file, metadata);
    const fileExt = file.name.split('.').pop();
    const filePath = `uploads/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const { error } = await this.client.storage.from('clinic-media').upload(filePath, file);
    if (error) {
      return this.fallback.uploadMedia(file, metadata);
    }
    const { data } = this.client.storage.from('clinic-media').getPublicUrl(filePath);
    return data.publicUrl;
  }

  async getAllMediaFiles(): Promise<{ id: string; url: string; name: string; size: number; date: string }[]> {
    return this.fallback.getAllMediaFiles();
  }

  // Appointment Requests
  async getAppointmentRequests(): Promise<AppointmentRequest[]> {
    if (!this.client) return this.fallback.getAppointmentRequests();
    const { data } = await this.client.from('appointment_requests').select('*').order('createdAt', { ascending: false });
    return data || this.fallback.getAppointmentRequests();
  }

  async createAppointmentRequest(
    request: Omit<AppointmentRequest, 'id' | 'createdAt' | 'status' | 'isDemoSubmission'>
  ): Promise<AppointmentRequest> {
    if (!this.client) return this.fallback.createAppointmentRequest(request);
    const { data } = await this.client.from('appointment_requests').insert({
      ...request,
      status: 'new',
      isDemoSubmission: false,
    }).select().single();
    return data || this.fallback.createAppointmentRequest(request);
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus, internalNotes?: string): Promise<void> {
    if (!this.client) return this.fallback.updateAppointmentStatus(id, status, internalNotes);
    await this.client.from('appointment_requests').update({
      status,
      internalNotes,
      contactedAt: status === 'contacted' ? new Date().toISOString() : undefined,
    }).eq('id', id);
  }

  async deleteAppointmentRequest(id: string): Promise<void> {
    if (!this.client) return this.fallback.deleteAppointmentRequest(id);
    await this.client.from('appointment_requests').delete().eq('id', id);
  }

  // Snapshots
  async createSnapshot(label: string, user: string): Promise<VersionSnapshot> {
    return this.fallback.createSnapshot(label, user);
  }

  async getSnapshots(): Promise<VersionSnapshot[]> {
    return this.fallback.getSnapshots();
  }

  async restoreSnapshot(id: string): Promise<void> {
    return this.fallback.restoreSnapshot(id);
  }

  // Activity Logs
  async logActivity(role: UserRole, user: string, action: string, details: string): Promise<void> {
    return this.fallback.logActivity(role, user, action, details);
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    return this.fallback.getActivityLogs();
  }
}
