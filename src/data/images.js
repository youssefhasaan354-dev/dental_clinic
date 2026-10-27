/**
 * CENTRAL IMAGE REGISTRY
 * All visual assets across the application are imported and exported from this file.
 * To swap any photo or illustration with a client-supplied high-res photo,
 * simply change the import path here in one single line.
 */

// Hero & Brand
import doctorBanner from '../assets/banner/doctor.webp';
import bannerHeroModel from '../assets/banner/1.webp';
import bannerPattern from '../assets/banner/pattern_02.webp';
import bannerShapeDots from '../assets/banner/pattern.png'; // keep tiny png
import shapeOne from '../assets/banner/vector_01.webp';
import shapeTwo from '../assets/banner/vector_02.webp';
import shapeThree from '../assets/banner/vector_03.webp';

// Features & About
import priorityImage from '../assets/about/priority.webp';
import expertImage from '../assets/expert.webp';
import emergencyImage from '../assets/emergency.webp';

// About Banners
import aboutBanner1 from '../assets/about/banner/banner_1.webp';
import aboutBanner2 from '../assets/about/banner/banner_2.webp';

// Service Page & Gallery
import servicePageHero from '../assets/servicePage/1.webp';
import gallery1 from '../assets/servicePage/gallery/1.webp';
import gallery2 from '../assets/servicePage/gallery/2.webp';
import gallery3 from '../assets/servicePage/gallery/3.webp';
import gallery4 from '../assets/servicePage/gallery/4.webp';
import gallery5 from '../assets/servicePage/gallery/5.webp';
import gallery6 from '../assets/servicePage/gallery/6.webp';

// Symptoms
import symptom1 from '../assets/symptoms/1.webp';
import symptom2 from '../assets/symptoms/2.webp';
import symptom3 from '../assets/symptoms/3.webp';
import symptom4 from '../assets/symptoms/4.webp';
import symptom5 from '../assets/symptoms/5.webp';

// Team
import team1 from '../assets/about/team/1.webp';
import team2 from '../assets/about/team/2.webp';
import team3 from '../assets/about/team/3.webp';
import team4 from '../assets/about/team/4.webp';

// Blogs
import blog1 from '../assets/blogs/1.webp';
import blog2 from '../assets/blogs/2.webp';
import blog3 from '../assets/blogs/3.webp';
import blog4 from '../assets/blogs/4.webp';
import blog5 from '../assets/blogs/5.webp';
import blog6 from '../assets/blogs/6.webp';

// Services Icons
import serviceIcon1 from '../assets/service/1.webp';
import serviceIcon2 from '../assets/service/2.webp';
import serviceIcon3 from '../assets/service/3.webp';
import serviceIcon4 from '../assets/service/4.webp';

export const IMAGES = {
  // Hero
  hero: {
    model: bannerHeroModel,
    doctorBadge: doctorBanner,
    pattern: bannerPattern,
    dots: bannerShapeDots,
    shape1: shapeOne,
    shape2: shapeTwo,
    shape3: shapeThree,
  },

  // Sections
  sections: {
    priority: priorityImage,
    expert: expertImage,
    emergency: emergencyImage,
  },

  // About
  about: {
    banner1: aboutBanner1,
    banner2: aboutBanner2,
    team: [team1, team2, team3, team4],
  },

  // Service details & gallery
  serviceDetails: {
    hero: servicePageHero,
    gallery: [
      { id: 1, src: gallery1, altAr: "ابتسامة ناصعة بعد التبييض", altEn: "Bright smile after whitening" },
      { id: 2, src: gallery2, altAr: "تركيب فينير وتجميل الأسنان", altEn: "Veneers and cosmetic dentistry" },
      { id: 3, src: gallery3, altAr: "تقويم أسنان شفاف متناسق", altEn: "Aligned clear orthodontics" },
      { id: 4, src: gallery4, altAr: "حشو تجميلي مطابق للمينا", altEn: "Natural composite filling" },
      { id: 5, src: gallery5, altAr: "تاج زركوني عالي الدقة", altEn: "Precision zirconia crown" },
      { id: 6, src: gallery6, altAr: "رعاية أسنان الأطفال والابتسامة الصحية", altEn: "Pediatric dental care" },
    ],
  },

  // Symptoms
  symptoms: [symptom1, symptom2, symptom3, symptom4, symptom5],

  // Blogs
  blogs: [blog1, blog2, blog3, blog4, blog5, blog6],

  // Services
  services: [serviceIcon1, serviceIcon2, serviceIcon3, serviceIcon4],
};
