/**
 * TEAM DATA — Medical Specialties
 * NOTE: As no doctor names were verified from public listings, we do NOT invent names.
 * Neutral role titles are used with clean medical avatar placeholders.
 * // TODO: replace with real doctor names, photos, and credentials when provided by clinic.
 */

import doctor1 from '../assets/about/team/1.png';
import doctor2 from '../assets/about/team/2.png';
import doctor3 from '../assets/about/team/3.png';
import doctor4 from '../assets/about/team/4.png';

export const TEAM_MEMBERS = [
  {
    id: "consultant-ortho",
    roleAr: "استشاري تقويم الأسنان والفكين",
    roleEn: "Orthodontics & Dentofacial Consultant",
    departmentAr: "قسم التقويم وتجميل الابتسامة",
    departmentEn: "Department of Orthodontics",
    bioAr: "متخصص في أحدث أساليب التقويم الشفاف والتقويم المعدني الدقيق لكافة الأعمار.",
    bioEn: "Specializing in advanced clear aligners and fixed biomechanics for adults & youth.",
    image: doctor1, // TODO: replace with real doctor photo
    placeholderNameAr: "استشاري تقويم الأسنان", // TODO: replace with real doctor name
    placeholderNameEn: "Orthodontics Consultant",
  },
  {
    id: "specialist-implants",
    roleAr: "أخصائي زراعة وجراحة الأسنان",
    roleEn: "Dental Implants & Oral Surgery Specialist",
    departmentAr: "قسم الجراحة والتعويضات الثابتة",
    departmentEn: "Department of Implantology",
    bioAr: "خبرة سريرية متقدمة في زراعة الأسنان والتعويضات السنية وفق المعايير الطبية المعتمدة.",
    bioEn: "Advanced proficiency in restorative implantology and gentle socket preservation.",
    image: doctor2, // TODO: replace with real doctor photo
    placeholderNameAr: "أخصائي زراعة الأسنان", // TODO: replace with real doctor name
    placeholderNameEn: "Implantology Specialist",
  },
  {
    id: "specialist-endo",
    roleAr: "أخصائي علاج الجذور وعصب الأسنان",
    roleEn: "Endodontics & Root Canal Specialist",
    departmentAr: "قسم المعالجة اللبية المجهرية",
    departmentEn: "Department of Endodontics",
    bioAr: "علاج القنوات الجذرية المعقدة بأحدث أجهزة الروتاري والتعقيم الميكروبي.",
    bioEn: "Specialized in micro-endodontic rotary canal disinfection and gentle single-visit therapy.",
    image: doctor3, // TODO: replace with real doctor photo
    placeholderNameAr: "أخصائي علاج الجذور", // TODO: replace with real doctor name
    placeholderNameEn: "Endodontics Specialist",
  },
  {
    id: "specialist-pediatric",
    roleAr: "أخصائية طب أسنان الأطفال وتجميل الأسنان",
    roleEn: "Pediatric & Aesthetic Dentistry Specialist",
    departmentAr: "قسم رعاية أسنان العائلة والأطفال",
    departmentEn: "Department of Pediatric Dentistry",
    bioAr: "خلق بيئة محببة للأطفال وعلاج تسوسات أسنان الحليب والوقاية بالفلورايد.",
    bioEn: "Dedicated to fear-free pediatric dental experiences and gentle restorative care.",
    image: doctor4, // TODO: replace with real doctor photo
    placeholderNameAr: "أخصائية أسنان الأطفال", // TODO: replace with real doctor name
    placeholderNameEn: "Pediatric Dentist",
  },
];
