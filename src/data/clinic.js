/**
 * VERIFIED CLINIC DATA — Hayaah Dental Clinic (عيادة حياة لطب الأسنان)
 * All verified facts are preserved exactly as provided.
 * Contact & reservation numbers can be updated here.
 */

export const CLINIC_DATA = {
  name: {
    ar: "عيادة حياة لطب الأسنان",
    en: "Hayaah Dental Clinic",
  },
  tagline: {
    ar: "ابتسامتك تستحق أرقى مستويات الرعاية والاهتمام",
    en: "Entrust your smile to excellence & specialized care",
  },
  established: 2015,
  yearsOfExperience: new Date().getFullYear() - 2015, // +10 years
  
  phone: {
    raw: "0226355669",
    international: "+20226355669",
    display: "02 2635 5669",
    telLink: "tel:+20226355669",
  },

  // WhatsApp configuration - defaulted to Egyptian international format
  // Can be overridden via VITE_CLINIC_WHATSAPP environment variable
  whatsapp: {
    number: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLINIC_WHATSAPP) || '20226355669',
    display: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLINIC_WHATSAPP) ? import.meta.env.VITE_CLINIC_WHATSAPP : '02 2635 5669',
    getChatUrl: (message = '') => {
      const cleanNumber = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLINIC_WHATSAPP) || '20226355669';
      const encodedMsg = encodeURIComponent(message);
      return `https://wa.me/${cleanNumber}${encodedMsg ? `?text=${encodedMsg}` : ''}`;
    },
  },

  address: {
    en: "17 Fareed Semeika St., Al Matar, El Nozha, Cairo 11599, Egypt",
    ar: "١٧ شارع فريد سميكة، المطار، النزهة، القاهرة 11599",
    landmarkAr: "الألف مسكن، مصر الجديدة، أمام نادي الشمس",
    landmarkEn: "El Alf Maskan, Heliopolis, in front of El Shams Club",
  },

  coordinates: {
    lat: 30.112729,
    lng: 31.336293,
  },

  googleMaps: {
    businessUrl: "https://www.google.com/maps/?cid=12440508066475554795",
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=30.112729,31.336293",
    // Embed centred specifically on verified coordinates
    embedUrl: "https://maps.google.com/maps?q=30.112729,31.336293&hl=ar&z=16&output=embed",
    embedUrlEn: "https://maps.google.com/maps?q=30.112729,31.336293&hl=en&z=16&output=embed",
  },

  social: {
    facebook: "https://www.facebook.com/hayatdental/",
  },

  // TODO: verify against the real Google Maps rating before launch
  rating: {
    score: 4.6,
    scoreDisplay: "4.6",
    scoreDisplayAr: "٤.٦",
    maxScore: 5.0,
    reviewsCount: 27,
    reviewsCountAr: "٢٧",
    source: "Google Maps Reviews",
  },

  amenities: {
    ar: ["دورة مياه مجهزة", "صالة انتظار مريحة ومكيفة", "تعقيم فندقي متكامل", "خدمة طوارئ"],
    en: ["Restroom available", "Air-conditioned waiting lounge", "Full sterilization suite", "Emergency care"],
  },

  // Working Hours (Saturday–Thursday: 10:00 AM – 10:00 PM, Friday: Closed)
  hours: [
    { dayAr: "السبت", dayEn: "Saturday", open: "10:00 AM", close: "10:00 PM", openHour: 10, closeHour: 22, isClosed: false },
    { dayAr: "الأحد", dayEn: "Sunday", open: "10:00 AM", close: "10:00 PM", openHour: 10, closeHour: 22, isClosed: false },
    { dayAr: "الإثنين", dayEn: "Monday", open: "10:00 AM", close: "10:00 PM", openHour: 10, closeHour: 22, isClosed: false },
    { dayAr: "الثلاثاء", dayEn: "Tuesday", open: "10:00 AM", close: "10:00 PM", openHour: 10, closeHour: 22, isClosed: false },
    { dayAr: "الأربعاء", dayEn: "Wednesday", open: "10:00 AM", close: "10:00 PM", openHour: 10, closeHour: 22, isClosed: false },
    { dayAr: "الخميس", dayEn: "Thursday", open: "10:00 AM", close: "10:00 PM", openHour: 10, closeHour: 22, isClosed: false },
    { dayAr: "الجمعة", dayEn: "Friday", open: "مغلق", close: "مغلق", openHour: 0, closeHour: 0, isClosed: true },
  ],
};

/**
 * Computes live clinic open/closed status according to Cairo local time (Africa/Cairo)
 */
export function getCairoClinicStatus() {
  try {
    // Format current time in Africa/Cairo timezone
    const nowCairo = new Date();
    const cairoFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Africa/Cairo",
      hour12: false,
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
    });

    const parts = cairoFormatter.formatToParts(nowCairo);
    let weekday = "";
    let hour = 0;
    let minute = 0;

    for (const p of parts) {
      if (p.type === "weekday") weekday = p.value;
      if (p.type === "hour") hour = parseInt(p.value, 10) % 24;
      if (p.type === "minute") minute = parseInt(p.value, 10);
    }

    // Friday in Cairo = closed
    const isFriday = weekday.startsWith("Fri");
    const currentDecimalHour = hour + minute / 60;

    // Open 10:00 to 22:00
    const isOpen = !isFriday && currentDecimalHour >= 10 && currentDecimalHour < 22;

    let nextOpeningTextAr = "";
    let nextOpeningTextEn = "";

    if (isOpen) {
      nextOpeningTextAr = `يغلق اليوم الساعة 10:00 مساءً`;
      nextOpeningTextEn = `Closes today at 10:00 PM`;
    } else if (isFriday) {
      nextOpeningTextAr = `مغلق اليوم (الجمعة) — يفتح السبت 10:00 صباحاً`;
      nextOpeningTextEn = `Closed today (Friday) — Opens Saturday 10:00 AM`;
    } else if (currentDecimalHour < 10) {
      nextOpeningTextAr = `يفتح اليوم الساعة 10:00 صباحاً`;
      nextOpeningTextEn = `Opens today at 10:00 AM`;
    } else {
      nextOpeningTextAr = `يفتح غداً الساعة 10:00 صباحاً`;
      nextOpeningTextEn = `Opens tomorrow at 10:00 AM`;
    }

    return {
      isOpen,
      isFriday,
      hour,
      minute,
      nextOpeningTextAr,
      nextOpeningTextEn,
    };
  } catch (e) {
    // Fallback if Intl timezone fails
    return {
      isOpen: true,
      isFriday: false,
      hour: 12,
      minute: 0,
      nextOpeningTextAr: "مفتوح حتى 10:00 مساءً",
      nextOpeningTextEn: "Open until 10:00 PM",
    };
  }
}

// TODO: verify against the real Google Maps rating before launch
export const CLINIC_RATING = CLINIC_DATA.rating;
