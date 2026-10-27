// Hayaah Dental Clinic - Global TypeScript Type Definitions

export type Language = 'ar' | 'en';

export type UserRole = 'owner' | 'editor' | 'receptionist' | 'viewer';

export interface BilingualText {
  ar: string;
  en: string;
}

export interface ClinicHours {
  dayAr: string;
  dayEn: string;
  open: string;
  close: string;
  isClosed?: boolean;
}

export interface ClinicInfo {
  name: BilingualText;
  tagline: BilingualText;
  phone: string;
  emergencyPhone: string;
  whatsapp: string;
  email: string;
  address: BilingualText;
  city: BilingualText;
  country: BilingualText;
  mapEmbedUrl: string;
  mapDirectionsUrl: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  regularHours: ClinicHours[];
  emergencyHoursNote: BilingualText;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
  };
  facilities: BilingualText[];
  disclaimer: BilingualText;
  emergencyNotice: BilingualText;
}

export interface ServiceStep {
  step: number;
  title: BilingualText;
  desc: BilingualText;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: BilingualText;
  category: string;
  categoryAr: string;
  shortDesc: BilingualText;
  fullDesc: BilingualText;
  duration?: BilingualText;
  startingPrice?: number | null;
  currency?: string;
  isConfirmed: boolean;
  isVisible: boolean;
  order: number;
  imageSlotId?: string;
  steps: ServiceStep[];
  symptoms: BilingualText[];
}

export interface DoctorProfile {
  id: string;
  name: BilingualText;
  title: BilingualText;
  specialty: BilingualText;
  bio: BilingualText;
  languages: string[];
  credentials: BilingualText[];
  syndicateNumber?: string;
  photoUrl: string;
  isRealPhoto: boolean;
  isVisible: boolean;
  order: number;
}

export interface ArticleItem {
  id: string;
  slug: string;
  title: BilingualText;
  summary: BilingualText;
  content: BilingualText;
  authorDoctorName: BilingualText;
  publishDate: string;
  readTimeMinutes: number;
  imageSlotId?: string;
  imageUrl?: string;
  isApprovedByDoctor: boolean;
  isVisible: boolean;
}

export interface FaqItem {
  id: string;
  question: BilingualText;
  answer: BilingualText;
  category: string;
  isSample: boolean;
  isApproved: boolean;
  order: number;
}

export interface RatingData {
  platform: string;
  score: number;
  maxScore: number;
  reviewCount: number;
  sourceUrl: string;
  isVerified: boolean;
}

export type AppointmentStatus =
  | 'new'
  | 'contacted'
  | 'booked'
  | 'completed'
  | 'no_show'
  | 'cancelled';

export interface AppointmentRequest {
  id: string;
  createdAt: string;
  patientName: string;
  patientPhone: string;
  preferredDate: string;
  preferredTime: string;
  serviceId: string;
  serviceName: string;
  notes?: string;
  status: AppointmentStatus;
  internalNotes?: string;
  contactedAt?: string;
  isDemoSubmission: boolean;
}

export type MediaType = 'image' | 'video' | 'embed';

export interface ImageSlot {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  section: string;
  page?: string;
  currentUrl: string;
  defaultUrl: string;
  altText: BilingualText;
  caption?: BilingualText;
  isAI: boolean;
  isSample: boolean;
  aspectRatio: string;
  recommendedSize?: string;
  allowVideo?: boolean;
  mediaType?: MediaType;
  posterUrl?: string;
  focalPoint?: string;
  zoom?: number;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  edgeFade?: boolean;
  updatedAt?: string;
}

export interface SectionConfig {
  id: string;
  nameAr: string;
  nameEn: string;
  isVisible: boolean;
  order: number;
  navLabelAr?: string;
  navLabelEn?: string;
}

export interface SiteSettings {
  demoMode: boolean;
  showPrices: boolean;
  showBeforeAfter: boolean;
  showAnnouncement: boolean;
  announcementText: BilingualText;
  announcementType: 'info' | 'warning' | 'holiday';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  noindex: boolean;
  dataVersion: number;
  lastPublishedAt?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userRole: UserRole;
  userName: string;
  action: string;
  details: string;
}

export interface VersionSnapshot {
  id: string;
  timestamp: string;
  label: string;
  createdBy: string;
  data: {
    clinic: ClinicInfo;
    services: ServiceItem[];
    doctors: DoctorProfile[];
    articles: ArticleItem[];
    faqs: FaqItem[];
    ratings?: RatingData;
    settings: SiteSettings;
    sections: SectionConfig[];
    imageSlots: ImageSlot[];
  };
}
