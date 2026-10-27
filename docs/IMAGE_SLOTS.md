# Media & Image Slots Registry — Hayaah Dental Clinic

This document contains the complete audit and central inventory of all media slots across the website.
Every image, video, and media asset on public pages is addressable via a unique slot ID through `EditableMedia`.

| Slot ID | Where Used | Default Asset | Recommended Size | Aspect Ratio | Allow Video |
|---|---|---|---|---|---|
| `slot-logo` | Navbar (`Navbar.jsx`), Brand Loader (`BrandLoader.jsx`) | `/assets/logo.svg` | 220 × 55 px | 4:1 | No |
| `slot-footer-logo` | Footer (`Footer.jsx`) | `/assets/logo.svg` | 230 × 58 px | 4:1 | No |
| `slot-hero` | Hero Main Visual (`Banner.jsx`) | `/assets/banner/1.png` | 1080 × 1080 px | 1:1 or 16:9 (`1 / 1.05`) | **Yes** (Edge fade mask enabled by default: `edgeFade: true`) |
| `slot-home-hero-badge` | Hero Doctor Badge (`Banner.jsx`) | `/assets/banner/doctor.png` | 96 × 96 px | 1:1 | No |
| `slot-about-banner-1` | About Hero Suite (`AboutBanner.jsx`) | `/assets/about/banner/banner_1.png` | 600 × 450 px | 4:3 | **Yes** |
| `slot-about-banner-2` | About Hero Doctor (`AboutBanner.jsx`) | `/assets/about/banner/banner_2.png` | 600 × 450 px | 4:3 | **Yes** |
| `slot-about` | About & Priority Section (`Priority.jsx`) | `/assets/about/priority.png` | 800 × 600 px | 4:3 | **Yes** |
| `slot-home-expert` | Expert Care Section (`Expert.jsx`) | `/assets/expert.png` | 600 × 600 px | 1:1 | **Yes** |
| `slot-emergency` | Dental Emergency Section (`Emergency.jsx`) | `/assets/emergency.png` | 800 × 600 px | 4:3 | **Yes** |
| `slot-service-1` | Service Card: Scaling & Polishing (`Services.jsx`) | `/assets/service/1.png` | 120 × 120 px | 1:1 | **Yes** |
| `slot-service-2` | Service Card: Root Canal (`Services.jsx`) | `/assets/service/2.png` | 120 × 120 px | 1:1 | **Yes** |
| `slot-service-3` | Service Card: Veneers & Aesthetics (`Services.jsx`) | `/assets/service/3.png` | 120 × 120 px | 1:1 | **Yes** |
| `slot-service-4` | Service Card: Pediatric Dentistry (`Services.jsx`) | `/assets/service/4.png` | 120 × 120 px | 1:1 | **Yes** |
| `slot-service-detail-hero` | Service Detail Hero (`ServiceDetail.jsx`) | `/assets/servicePage/1.png` | 1200 × 675 px | 16:9 | **Yes** |
| `slot-gallery-1` | Clinic Visual Tour 1 (`Gallery.jsx`) | `/assets/servicePage/gallery/1.png` | 900 × 600 px | 3:2 | **Yes** |
| `slot-gallery-2` | Clinic Visual Tour 2 (`Gallery.jsx`) | `/assets/servicePage/gallery/2.png` | 900 × 600 px | 3:2 | **Yes** |
| `slot-gallery-3` | Clinic Visual Tour 3 (`Gallery.jsx`) | `/assets/servicePage/gallery/3.png` | 900 × 600 px | 3:2 | **Yes** |
| `slot-gallery-4` | Clinic Visual Tour 4 (`Gallery.jsx`) | `/assets/servicePage/gallery/4.png` | 900 × 600 px | 3:2 | **Yes** |
| `slot-gallery-5` | Clinic Visual Tour 5 (`Gallery.jsx`) | `/assets/servicePage/gallery/5.png` | 900 × 600 px | 3:2 | **Yes** |
| `slot-gallery-6` | Clinic Visual Tour 6 (`Gallery.jsx`) | `/assets/servicePage/gallery/6.png` | 900 × 600 px | 3:2 | **Yes** |
| `slot-beforeafter-before` | Before & After Comparison: Before (`BeforeAfter.jsx`) | `/assets/servicePage/gallery/1.png` | 900 × 600 px | 3:2 | No |
| `slot-beforeafter-after` | Before & After Comparison: After (`BeforeAfter.jsx`) | `/assets/servicePage/gallery/2.png` | 900 × 600 px | 3:2 | No |
| `slot-symptom-1` | Symptom Icon 1 (`Symptoms.jsx`) | `/assets/symptoms/1.png` | 80 × 80 px | 1:1 | No |
| `slot-symptom-2` | Symptom Icon 2 (`Symptoms.jsx`) | `/assets/symptoms/2.png` | 80 × 80 px | 1:1 | No |
| `slot-symptom-3` | Symptom Icon 3 (`Symptoms.jsx`) | `/assets/symptoms/3.png` | 80 × 80 px | 1:1 | No |
| `slot-symptom-4` | Symptom Icon 4 (`Symptoms.jsx`) | `/assets/symptoms/4.png` | 80 × 80 px | 1:1 | No |
| `slot-symptom-5` | Symptom Icon 5 (`Symptoms.jsx`) | `/assets/symptoms/5.png` | 80 × 80 px | 1:1 | No |
| `slot-doctor-doc-1` | Medical Team: Doc 1 (`Team.jsx`) | `/assets/about/team/1.png` | 300 × 300 px | 1:1 | No |
| `slot-doctor-doc-2` | Medical Team: Doc 2 (`Team.jsx`) | `/assets/about/team/2.png` | 300 × 300 px | 1:1 | No |
| `slot-doctor-consultant-ortho` | Medical Team: Ortho (`team.js`) | `/assets/about/team/1.png` | 300 × 300 px | 1:1 | No |
| `slot-doctor-specialist-implants` | Medical Team: Implants (`team.js`) | `/assets/about/team/2.png` | 300 × 300 px | 1:1 | No |
| `slot-doctor-specialist-endo` | Medical Team: Endo (`team.js`) | `/assets/about/team/3.png` | 300 × 300 px | 1:1 | No |
| `slot-doctor-specialist-pediatric` | Medical Team: Pediatric (`team.js`) | `/assets/about/team/4.png` | 300 × 300 px | 1:1 | No |
| `slot-article-1` | Article 1: Bleeding Gums (`SingleBlog.jsx`, `Blogs.jsx`) | `/assets/blogs/1.png` | 900 × 506 px | 16:9 | **Yes** |
| `slot-article-2` | Article 2: Hidden Decay (`SingleBlog.jsx`, `Blogs.jsx`) | `/assets/blogs/2.png` | 900 × 506 px | 16:9 | **Yes** |
| `slot-article-3` | Article 3: Clear Orthodontics (`SingleBlog.jsx`, `Blogs.jsx`) | `/assets/blogs/3.png` | 900 × 506 px | 16:9 | **Yes** |
| `slot-article-4` | Article 4: Safe Whitening (`SingleBlog.jsx`, `Blogs.jsx`) | `/assets/blogs/4.png` | 900 × 506 px | 16:9 | **Yes** |
| `slot-article-5` | Article 5: Pediatric Oral Care (`SingleBlog.jsx`, `Blogs.jsx`) | `/assets/blogs/5.png` | 900 × 506 px | 16:9 | **Yes** |
| `slot-article-6` | Article 6: Implants & Longevity (`SingleBlog.jsx`, `Blogs.jsx`) | `/assets/blogs/6.png` | 900 × 506 px | 16:9 | **Yes** |
| `slot-notfound` | 404 Page Illustration (`NotFound.jsx`) | `/assets/emergency.png` | 600 × 450 px | 4:3 | **Yes** |

### Additional Interactive Embeds (Audit Note)
- **Interactive Google Maps Embed**: Used in `src/sections/Appointment/Appointment.jsx` and `src/pages/ContactPage.jsx`. These are functional interactive navigation map iframes driven by `CLINIC_DATA.googleMaps.embedUrl`, rather than media/image slots.
