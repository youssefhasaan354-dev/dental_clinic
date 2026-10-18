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

export interface IDataStorageService {
  // Initialization & System
  init(): Promise<void>;
  isLiveMode(): boolean;
  resetDemoData(): Promise<void>;

  // Settings & Configuration
  getSettings(): Promise<SiteSettings>;
  updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings>;

  // Clinic Info
  getClinicInfo(): Promise<ClinicInfo>;
  updateClinicInfo(info: Partial<ClinicInfo>): Promise<ClinicInfo>;

  // Sections Manager
  getSections(): Promise<SectionConfig[]>;
  updateSections(sections: SectionConfig[]): Promise<SectionConfig[]>;

  // Services
  getServices(): Promise<ServiceItem[]>;
  saveService(service: ServiceItem): Promise<ServiceItem>;
  deleteService(id: string): Promise<void>;
  reorderServices(serviceIds: string[]): Promise<void>;

  // Doctors / Team
  getDoctors(): Promise<DoctorProfile[]>;
  saveDoctor(doctor: DoctorProfile): Promise<DoctorProfile>;
  deleteDoctor(id: string): Promise<void>;

  // Educational Articles
  getArticles(): Promise<ArticleItem[]>;
  saveArticle(article: ArticleItem): Promise<ArticleItem>;
  deleteArticle(id: string): Promise<void>;

  // FAQ
  getFaqs(): Promise<FaqItem[]>;
  saveFaq(faq: FaqItem): Promise<FaqItem>;
  deleteFaq(id: string): Promise<void>;

  // Ratings
  getRatings(): Promise<RatingData>;
  updateRatings(ratings: Partial<RatingData>): Promise<RatingData>;

  // Image Slot Registry & Media
  getImageSlots(): Promise<ImageSlot[]>;
  updateImageSlot(slotId: string, updates: Partial<ImageSlot>): Promise<ImageSlot>;
  uploadMedia(file: File, metadata?: { isAI?: boolean; isSample?: boolean }): Promise<string>;
  getAllMediaFiles(): Promise<{ id: string; url: string; name: string; size: number; date: string }[]>;

  // Appointment Requests Inbox
  getAppointmentRequests(): Promise<AppointmentRequest[]>;
  createAppointmentRequest(request: Omit<AppointmentRequest, 'id' | 'createdAt' | 'status' | 'isDemoSubmission'>): Promise<AppointmentRequest>;
  updateAppointmentStatus(id: string, status: AppointmentStatus, internalNotes?: string): Promise<void>;
  deleteAppointmentRequest(id: string): Promise<void>;

  // Snapshots & Versioning
  createSnapshot(label: string, user: string): Promise<VersionSnapshot>;
  getSnapshots(): Promise<VersionSnapshot[]>;
  restoreSnapshot(id: string): Promise<void>;

  // Activity Logs
  logActivity(role: UserRole, user: string, action: string, details: string): Promise<void>;
  getActivityLogs(): Promise<ActivityLog[]>;
}
