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
import { CLINIC_RATING } from './clinic';
import { IMAGES } from './images';
import { ALL_IMAGE_SLOTS } from './imageSlots';

export const initialClinicInfo: ClinicInfo = {
  name: {
    ar: 'عيادة حياة لطب الأسنان',
    en: 'Hayaah Dental Clinic',
  },
  tagline: {
    ar: 'رعاية طبية هادئة ودقيقة لطب الأسنان بمصر الجديدة',
    en: 'Calm, precise dental care in Heliopolis, Cairo',
  },
  phone: '02 2635 5669',
  emergencyPhone: '02 2635 5669',
  whatsapp: '+20226355669',
  email: 'info@hayaahclinic.com',
  address: {
    ar: 'شارع فريد سميكة، مصر الجديدة، القاهرة، مصر',
    en: 'Fareed Semeika St., Heliopolis, Cairo, Egypt',
  },
  city: {
    ar: 'القاهرة',
    en: 'Cairo',
  },
  country: {
    ar: 'مصر',
    en: 'Egypt',
  },
  mapEmbedUrl: 'https://maps.google.com/maps?q=30.112729,31.336293&hl=ar&z=16&output=embed',
  mapDirectionsUrl: 'https://www.google.com/maps/search/?api=1&query=30.112729,31.336293',
  coordinates: {
    lat: 30.112729,
    lng: 31.336293,
  },
  regularHours: [
    { dayAr: 'السبت', dayEn: 'Saturday', open: '10:00', close: '22:00' },
    { dayAr: 'الأحد', dayEn: 'Sunday', open: '10:00', close: '22:00' },
    { dayAr: 'الاثنين', dayEn: 'Monday', open: '10:00', close: '22:00' },
    { dayAr: 'الثلاثاء', dayEn: 'Tuesday', open: '10:00', close: '22:00' },
    { dayAr: 'الأربعاء', dayEn: 'Wednesday', open: '10:00', close: '22:00' },
    { dayAr: 'الخميس', dayEn: 'Thursday', open: '10:00', close: '22:00' },
    { dayAr: 'الجمعة', dayEn: 'Friday', open: '', close: '', isClosed: true },
  ],
  emergencyHoursNote: {
    ar: 'في حالات الألم الحاد خلال أوقات العمل يرجى الاتصال مسبقاً لترتيب فحص فوري',
    en: 'For urgent pain during clinic hours, please call ahead for an immediate evaluation slot',
  },
  socialLinks: {
    facebook: 'https://facebook.com/hayaahdental',
    instagram: 'https://instagram.com/hayaahdental',
    whatsapp: 'https://wa.me/20226355669',
  },
  facilities: [
    { ar: 'تعقيم فندقي معتمد مطابق للمعايير الطبية', en: 'Hospital-grade autoclaving & sterilization' },
    { ar: 'أشعة رقمية منخفضة الإشعاع', en: 'Low-dose digital dental radiography' },
    { ar: 'سهولة الوصول وخدمة الكراسي المتحركة', en: 'Accessibility & wheelchair friendly' },
    { ar: 'منطقة انتظار هادئة مريحة', en: 'Calm, reassuring reception area' },
  ],
  disclaimer: {
    ar: 'المعلومات الواردة في هذا الموقع عامة للتوعية الصحية ولا تغني عن الفحص السريري المباشر لدى طبيب الأسنان.',
    en: 'Information on this website is for general educational purposes only and does not replace professional dental examination.',
  },
  emergencyNotice: {
    ar: 'في حالات الطوارئ الطبية التي تهدد الحياة يرجى التوجه فوراً لأقرب مستشفى أو الاتصال بهيئة الإسعاف المصرية على الرقم 123.',
    en: 'For life-threatening medical emergencies, please visit the nearest hospital emergency room or call the national ambulance at 123.',
  },
};

export const initialServices: ServiceItem[] = [
  {
    id: 'srv-checkup',
    slug: 'checkup-cleaning',
    title: { ar: 'الفحص الدوري وتنظيف الأسنان', en: 'Checkup & Professional Cleaning' },
    category: 'preventive',
    categoryAr: 'طب الأسنان الوقائي',
    shortDesc: {
      ar: 'فحص سريري دقيق وإزالة الجير والتصبغات بالموجات فوق الصوتية لحماية اللثة.',
      en: 'Detailed oral examination and ultrasonic plaque & tartar removal for healthy gums.',
    },
    fullDesc: {
      ar: 'يشمل الفحص الدوري الشامل تقييم صحة الأسنان واللثة وفحص الأنسجة الفموية بأجهزة دقيقة، مع تنظيف وتلميع لإزالة التكلسات الجيرية المسببة لالتهاب اللثة.',
      en: 'A comprehensive checkup assessing teeth, gums, and oral soft tissues, coupled with ultrasonic scaling and polishing to prevent periodontal disease.',
    },
    duration: { ar: '30 - 45 دقيقة', en: '30 - 45 mins' },
    startingPrice: null,
    isConfirmed: true,
    isVisible: true,
    order: 1,
    imageSlotId: 'slot-service-1',
    steps: [
      { step: 1, title: { ar: 'الفحص البصري والرقمي', en: 'Visual & Digital Check' }, desc: { ar: 'فحص كل سن وتصوير الأشعة إن لزم الأمر', en: 'Evaluating each tooth with digital X-rays if needed' } },
      { step: 2, title: { ar: 'إزالة التكلسات الجيرية', en: 'Ultrasonic Scaling' }, desc: { ar: 'استخدام موجات فوق صوتية لتنظيف اللثة برفق', en: 'Gentle ultrasonic vibration to remove calculus' } },
      { step: 3, title: { ar: 'تلميع الأسنان', en: 'Polishing' }, desc: { ar: 'إزالة التصبغات السطحية واستعادة النعومة', en: 'Removing surface stains and smoothing enamel' } },
    ],
    symptoms: [
      { ar: 'نزيف اللثة أثناء تنظيف الأسنان', en: 'Bleeding gums when brushing' },
      { ar: 'تراكم الجير أو اصفرار الأسنان', en: 'Visible tartar buildup or stains' },
      { ar: 'رائحة فم مزعجة مستمرة', en: 'Persistent breath odor' },
    ],
  },
  {
    id: 'srv-root-canal',
    slug: 'root-canal',
    title: { ar: 'علاج جذور الأسنان', en: 'Root Canal Therapy' },
    category: 'endodontics',
    categoryAr: 'علاج الجذور والعصب',
    shortDesc: {
      ar: 'تنظيف قنوات العصب الدقيقة بالأجهزة الآلية الدوارة وتطهيرها لتسكين الألم وإنقاذ السن.',
      en: 'Rotary instrumentation to clean, disinfect, and seal infected root canals to preserve natural teeth.',
    },
    fullDesc: {
      ar: 'عند وصول التسوس إلى لب السن وحدوث التهاب في العصب، نقوم بإجراء علاج الجذور باستخدام تقنيات قياس القنوات الإلكترونية ومبارد النيكل تيتانيوم لضمان أعلى درجات الدقة والراحة.',
      en: 'When tooth decay reaches the dental pulp causing acute pain, modern rotary endodontics and electronic apex locators ensure precise, comfortable cleaning and sealing.',
    },
    duration: { ar: 'جلسة إلى جلستين (45 - 60 دقيقة)', en: '1 - 2 sessions (45 - 60 mins)' },
    startingPrice: null,
    isConfirmed: true,
    isVisible: true,
    order: 2,
    imageSlotId: 'slot-service-2',
    steps: [
      { step: 1, title: { ar: 'التخدير الموضعي المريح', en: 'Gentle Local Anesthesia' }, desc: { ar: 'ضمان التخدير الكامل قبل بدء أي إجراء', en: 'Ensuring total comfort before beginning' } },
      { step: 2, title: { ar: 'تنظيف قنوات العصب وتطهيرها', en: 'Canal Cleaning & Disinfection' }, desc: { ar: 'إزالة الأنسجة المصابة وتعقيم القنوات بمحاليل طبية', en: 'Removing inflamed tissue and irrigating canals' } },
      { step: 3, title: { ar: 'حشو القنوات المحكم', en: 'Hermetic Canal Filling' }, desc: { ar: 'إغلاق القنوات لمنع عودة البكتيريا تمهيداً للتاج', en: 'Biocompatible sealing to protect tooth integrity' } },
    ],
    symptoms: [
      { ar: 'ألم نابض وشديد يزداد ليلاً', en: 'Throbbing dental pain worsening at night' },
      { ar: 'حساسية مفرطة ومستمرة تجاه الساخن والبارد', en: 'Prolonged sensitivity to hot or cold foods' },
      { ar: 'ألم عند العض أو الضغط على السن', en: 'Pain upon chewing or biting pressure' },
    ],
  },
  {
    id: 'srv-fillings',
    slug: 'composite-fillings',
    title: { ar: 'الحشوات التجميلية الملونة بلون السن', en: 'Tooth-Colored Composite Fillings' },
    category: 'restorative',
    categoryAr: 'الحشوات والترميم',
    shortDesc: {
      ar: 'ترميم تجاويف التسوس بمواد كومبوزيت مطابقة للون الطبيعي لمظهر جذاب وثبات متين.',
      en: 'Restoring decayed or broken teeth with natural-looking resin composite.',
    },
    fullDesc: {
      ar: 'نستخدم حشوات الكومبوزيت النانوية التي تندمج مع بنية السن الطبيعية وتحافظ على أكبر قدر ممكن من نسيج السن الأصلي وتدعم وظيفته الجمالية والمضغية.',
      en: 'Modern nanohybrid composite resins bond directly with tooth enamel and dentin, conserving natural structure while matching natural shades.',
    },
    duration: { ar: '30 - 45 دقيقة', en: '30 - 45 mins' },
    startingPrice: null,
    isConfirmed: true,
    isVisible: true,
    order: 3,
    imageSlotId: 'slot-service-3',
    steps: [
      { step: 1, title: { ar: 'إزالة التسوس بدقة', en: 'Conservative Decay Removal' }, desc: { ar: 'تنظيف المنطقة المصابة فقط مع الحفاظ على السن السليم', en: 'Preserving maximum sound tooth structure' } },
      { step: 2, title: { ar: 'وضع مادة الحشو والربط', en: 'Bonding & Layering' }, desc: { ar: 'بناء الحشوة بطبقات تدريجية بلون مطابق تماماً', en: 'Layering resin to mimic natural optical shades' } },
      { step: 3, title: { ar: 'التصلب بالضوء والتلميع', en: 'Light Curing & Polishing' }, desc: { ar: 'تثبيت الحشوة وضبط الإطباق لراحة المضغ', en: 'Photo-curing and fine-tuning bite alignment' } },
    ],
    symptoms: [
      { ar: 'وجود تجويف أو بقعة بنية على السن', en: 'Visible cavity or dark spot on tooth' },
      { ar: 'انكسار جزء صغير من السن أو حشوة قديمة', en: 'Chipped tooth edge or loose previous filling' },
      { ar: 'انزعاج خفيف عند تناول السكريات', en: 'Brief sensitivity to sweet foods' },
    ],
  },
  {
    id: 'srv-implants',
    slug: 'dental-implants',
    title: { ar: 'زراعة الأسنان', en: 'Dental Implants' },
    category: 'surgery',
    categoryAr: 'جراحة وزراعة الأسنان',
    shortDesc: {
      ar: 'تعويض الأسنان المفقودة بجذور تيتانيوم متوافقة حيوياً وتيجان خزفية ثابتة وطبيعية.',
      en: 'Replacing missing teeth with biocompatible titanium fixtures and custom ceramic crowns.',
    },
    fullDesc: {
      ar: 'تعد زراعة الأسنان الحل الدائم الأكثر محاكاة للأسنان الطبيعية. نقوم بتخطيط دقيق عبر الأشعة المقطعية ثلاثية الأبعاد (CBCT) لضمان وضع الزرعة في المكان الهندسي الأمثل لعظم الفك.',
      en: 'The closest functional replacement for natural teeth. Guided planning via 3D CBCT scans ensures optimal prosthetic positioning and long-term bone stability.',
    },
    duration: { ar: 'وفق خطة العلاج المعتمدة', en: 'Based on approved clinical protocol' },
    startingPrice: null,
    isConfirmed: true,
    isVisible: true,
    order: 4,
    imageSlotId: 'slot-service-4',
    steps: [
      { step: 1, title: { ar: 'التخطيط والأشعة المقطعية ثلاثية الأبعاد', en: '3D CBCT Scan & Planning' }, desc: { ar: 'دراسة كثافة عظام الفك وتحديد مقاسات الزرعة', en: 'Assessing bone volume and implant dimensions' } },
      { step: 2, title: { ar: 'وضع الغرسة السنية', en: 'Fixture Placement' }, desc: { ar: 'إجراء جراحي دقيق بتخدير موضعي مريح', en: 'Minimally invasive placement under local anesthesia' } },
      { step: 3, title: { ar: 'التركيبة النهائية التاجية', en: 'Prosthetic Crown Delivery' }, desc: { ar: 'تثبيت التاج الخزفي بعد التئام العظم', en: 'Fixing the porcelain/zirconia crown after osseointegration' } },
    ],
    symptoms: [
      { ar: 'فقدان سن أو أكثر وصعوبة المضغ', en: 'Missing teeth hindering chewing efficiency' },
      { ar: 'عدم الرغبة في برد الأسنان المجاورة لعمل جسر', en: 'Desire to avoid preparing adjacent healthy teeth' },
      { ar: 'عدم ثبات أطقم الأسنان المتحركة', en: 'Loose removable partial or full dentures' },
    ],
  },
  {
    id: 'srv-crowns',
    slug: 'crowns-bridges',
    title: { ar: 'تيجان وجسور الزركون والبورسلين', en: 'Zirconia & Ceramic Crowns & Bridges' },
    category: 'prosthodontics',
    categoryAr: 'التركيبات الثابتة',
    shortDesc: {
      ar: 'حماية الأسنان الضعيفة والمعالجة عصبياً بتيجان زركونيا عالية القوة والجمال.',
      en: 'Protecting weak or root-treated teeth with durable, natural-shade zirconia crowns.',
    },
    fullDesc: {
      ar: 'تصنع التيجان والجسور بدقة متناهية لحماية الأسنان من الكسر واستعادة وظيفة الإطباق والمظهر الطبيعي للابتسامة.',
      en: 'Engineered to restore broken or root-canal-treated teeth, providing structural support and harmonious aesthetics.',
    },
    duration: { ar: 'جلستان إلى 3 جلسات', en: '2 - 3 visits' },
    startingPrice: null,
    isConfirmed: true,
    isVisible: true,
    order: 5,
    imageSlotId: 'slot-service-1',
    steps: [
      { step: 1, title: { ar: 'تحضير السن وأخذ الطبعة', en: 'Tooth Preparation & Impression' }, desc: { ar: 'تهيئة السن بأقل قدر ممكن من البرد', en: 'Conservative tooth reduction and precise mold' } },
      { step: 2, title: { ar: 'التاج المؤقت', en: 'Provisional Crown' }, desc: { ar: 'حماية السن أثناء تجهيز التاج الدائم في المعمل', en: 'Protecting the prepared tooth during lab fabrication' } },
      { step: 3, title: { ar: 'التثبيت النهائي وضبط الإطباق', en: 'Final Cementation' }, desc: { ar: 'تثبيت التاج بمواد لاصقة طبية وضمان راحة العضة', en: 'Adhesive cementation with bite check' } },
    ],
    symptoms: [
      { ar: 'سن معالج عصبياً ومعرض للكسر', en: 'Endodontically treated tooth prone to fracture' },
      { ar: 'كسر كبير في تاج السن الطبيعي', en: 'Severe structural fracture of natural tooth' },
      { ar: 'فراغ ناتج عن خلع سن بين سنين سليمين', en: 'Gap from an extracted tooth between healthy teeth' },
    ],
  },
  {
    id: 'srv-orthodontics',
    slug: 'orthodontics',
    title: { ar: 'تقويم الأسنان وتعديل الإطباق', en: 'Orthodontics & Bite Correction' },
    category: 'orthodontics',
    categoryAr: 'تقويم الأسنان والفكين',
    shortDesc: {
      ar: 'تعديل تزاحم الأسنان وتصحيح العضة بالتقويم الثابت أو القوالب الشفافة.',
      en: 'Straightening crowded teeth and correcting bites with braces or clear aligners.',
    },
    fullDesc: {
      ar: 'يهدف تقويم الأسنان إلى تصحيح وضعيات الأسنان غير المنتظمة وعلاقة الفكين لتحسين المظهر وسهولة تنظيف الأسنان والوقاية من تآكل المفصل الصدغي.',
      en: 'Orthodontic therapy optimizes dental alignment and jaw relationships, facilitating better hygiene and jaw-joint harmony.',
    },
    duration: { ar: 'وفق خطة الحالة (عدة أشهر)', en: 'Based on case severity (several months)' },
    startingPrice: null,
    isConfirmed: true,
    isVisible: true,
    order: 6,
    imageSlotId: 'slot-service-2',
    steps: [
      { step: 1, title: { ar: 'دراسة القياسات والصور الشعاعية', en: 'Cephalometric Analysis & Study' }, desc: { ar: 'تحليل الصور وقياسات الفك لوضع خطة دقيقة', en: 'Comprehensive photographic and radiographic study' } },
      { step: 2, title: { ar: 'تركيب جهاز التقويم', en: 'Appliance Bonding' }, desc: { ar: 'تثبيت الحاصرات أو تسليم القوالب الشفافة', en: 'Fixing brackets or delivering first series of aligners' } },
      { step: 3, title: { ar: 'المتابعة الدورية والتثبيت', en: 'Periodic Activation & Retention' }, desc: { ar: 'شد وضبط دوري شهري ووضع مثبت نهائي للحفاظ على النتيجة', en: 'Regular adjustments and post-treatment retainer' } },
    ],
    symptoms: [
      { ar: 'تزاحم أو تراكب الأسنان فوق بعضها', en: 'Crowded, overlapping or crooked teeth' },
      { ar: 'فراغات واضحة بين الأسنان الأمامية', en: 'Visible gaps or spacing between teeth' },
      { ar: 'صعوبة الإطباق أو بروز في أحد الفكين', en: 'Bite misalignment, overbite or underbite' },
    ],
  },
];

export const initialDoctors: DoctorProfile[] = [
  {
    id: 'doc-1',
    name: { ar: 'فريق طب وجراحة الفم والأسنان', en: 'Oral & Dental Surgery Team' },
    title: { ar: 'أطباء أسنان معتمدون', en: 'Certified Dental Practitioners' },
    specialty: { ar: 'طب الأسنان العام وجراحة الفم', en: 'General Dentistry & Oral Surgery' },
    bio: {
      ar: 'فريق سريري متخصص يقدم رعاية دقيقة مبنية على البراهين الطبية والمعايير الصحية المعتمدة من نقابة أطباء الأسنان المصرية.',
      en: 'A dedicated clinical team delivering evidence-based, compassionate care following Egyptian Dental Syndicate standards.',
    },
    languages: ['العربية', 'English'],
    credentials: [
      { ar: 'بكالوريوس طب وجراحة الفم والأسنان - جامعات معتمدة بمصر', en: 'BDS Oral & Dental Surgery from accredited Egyptian universities' },
      { ar: 'أعضاء مسجلون بنقابة أطباء الأسنان المصرية', en: 'Registered members of the Egyptian Dental Syndicate' },
    ],
    photoUrl: '/images/team-placeholder.svg',
    isRealPhoto: false, // Rule 7: marked clearly as illustrative until clinic provides real doctor photos
    isVisible: true,
    order: 1,
  },
  {
    id: 'doc-2',
    name: { ar: 'استشاريو علاج الجذور والتركيبات', en: 'Endodontics & Prosthodontics Consultants' },
    title: { ar: 'أخصائيو علاج العصب والتركيبات الثابتة', en: 'Endodontic & Restorative Specialists' },
    specialty: { ar: 'علاج الجذور المجهري والتركيبات', en: 'Microscopic Endodontics & Fixed Prosthetics' },
    bio: {
      ar: 'تركيز دقيق على إنقاذ الأسنان الطبيعية وحمايتها بأحدث أجهزة قياس القنوات والمواد الخزفية الحيوية.',
      en: 'Focused on natural tooth preservation and structural longevity using precision rotary instrumentation.',
    },
    languages: ['العربية', 'English'],
    credentials: [
      { ar: 'دراسات عليا وتدريب تخصصي متقدم في علاج الجذور', en: 'Postgraduate specialized training in endodontics & restorative dentistry' },
    ],
    photoUrl: '/images/team-placeholder.svg',
    isRealPhoto: false,
    isVisible: true,
    order: 2,
  },
];

export const initialArticles: ArticleItem[] = [
  {
    id: 'art-1',
    slug: 'bleeding-gums-causes-and-care',
    title: {
      ar: 'نزيف اللثة: الأسباب الشائعة وخطوات العناية المنزلية الأولية',
      en: 'Bleeding Gums: Common Causes and Essential Home Care',
    },
    summary: {
      ar: 'دليل توعوي هادئ يوضح الفرق بين التهاب اللثة البسيط وأمراض الأنسجة الداعمة ومتى يجب استشارة الطبيب.',
      en: 'A calm, factual overview explaining early gingivitis versus periodontitis and when clinical evaluation is necessary.',
    },
    content: {
      ar: `نزيف اللثة أثناء تنظيف الأسنان بالفرشاة أو الخيط هو علامة سريرية شائعة تدل في الغالب على وجود التهاب لثوي مبكر نتيجة تراكم طبقة البلاك البكتيرية على حواف الأسنان.

أسباب شائعة لنزيف اللثة:
1. تراكم الجير والتكلسات حول عنق السن، مما يسبب تحسس الأنسجة المحيطة.
2. استخدام فرشاة أسنان ذات شعيرات خشنة أو الضغط العنيف أثناء التنظيف.
3. عدم انتظام استخدام خيط الأسنان الطبي لإزالة بقايا الطعام العالقة بين الأسنان.
4. بعض التغيرات الهرمونية أو تناول أدوية معينة تؤثر على سيولة الدم.

خطوات موصى بها:
- الاستمرار في تنظيف الأسنان برفق مرتين يومياً بفرشاة ناعمة.
- استخدام خيط الأسنان الطبي بحركة انسيابية دون جرح اللثة.
- زيارة عيادة الأسنان لإجراء جلسة تنظيف سريري بالموجات فوق الصوتية لإزالة الجير الصلب الذي لا يمكن إزالته بالفرشاة العادية.

تنبيه طبي: هذه المعلومات عامة للتوعية ولا تغني عن الفحص الإكلينيكي في العيادة لتحديد سبب النزيف بدقة.`,
      en: `Bleeding gums while brushing or flossing is a common clinical indication of early gingival inflammation caused by bacterial plaque accumulation along the gumline.

Common Contributing Factors:
1. Dental calculus (tartar) accumulation irritating periodontal tissues.
2. Hard-bristled toothbrushes or excessive brushing pressure.
3. Inconsistent use of dental floss to clear interdental debris.
4. Hormonal variations or medications affecting blood clotting.

Recommended Actions:
- Brush twice daily with a soft-bristled brush using gentle circular motions.
- Use interdental floss daily with care.
- Schedule a professional dental checkup for ultrasonic scaling to remove hardened tartar that brushing cannot clear.

Medical Disclaimer: This information is for educational purposes and cannot replace an in-person dental consultation.`,
    },
    authorDoctorName: {
      ar: 'فريق عيادة حياة لطب الأسنان',
      en: 'Hayaah Dental Clinic Medical Team',
    },
    publishDate: '2026-03-15',
    readTimeMinutes: 4,
    imageUrl: '/assets/blogs/1.png',
    isApprovedByDoctor: true,
    isVisible: true,
  },
  {
    id: 'art-2',
    slug: 'what-to-expect-root-canal',
    title: {
      ar: 'ماذا تتوقع خلال جلسة علاج جذور الأسنان (علاج العصب)؟',
      en: 'What to Expect During a Root Canal Treatment Visit',
    },
    summary: {
      ar: 'شرح مبسط وواقعي لمراحل جلسة علاج الجذور للتخفيف من التوتر وإزالة المفاهيم المغلوطة.',
      en: 'A clear, step-by-step factual breakdown of endodontic treatment to ease dental anxiety and dispel myths.',
    },
    content: {
      ar: `يعد علاج جذور الأسنان من أكثر الإجراءات التي تثير قلق المرضى نتيجة تصورات قديمة غير دقيقة. في طب الأسنان الحديث، يهدف علاج الجذور إلى إيقاف الألم وإنقاذ السن الطبيعي من الخلع.

خطوات الجلسة الأساسية:
1. التخدير الموضعي: يبدأ الطبيب بتخدير السن والمنطقة المحيطة به تماماً قبل بدء أي عمل.
2. العزل الطبي: يتم وضع حاجز مطاطي لحماية السن وتوفير بيئة عمل معقمة وجافة.
3. تنظيف القنوات: استخدام أدوات ميكانيكية دقيقة لتنظيف وتطهير قنوات العصب الدقيقة والتخلص من البكتيريا المسببة للالتهاب.
4. حشو القنوات: غلق القنوات بمادة طبية متوافقة حيوياً تمنع تسرب البكتيريا مستقبلاً.

بعد الجلسة:
من الطبيعي الشعور ببعض الانزعاج أو الحساسية الخفيفة لعدة أيام بعد الجلسة، ويصف الطبيب مسكنات خفيفة للسيطرة على ذلك. يوصى بحماية السن بتاج خزفي لتعويض فقدان بنيته الطبيعية.`,
      en: `Root canal treatment is often misunderstood due to outdated impressions. In modern clinical dentistry, endodontic therapy aims to relieve pain and prevent natural tooth loss.

Key Procedure Stages:
1. Local Anesthesia: The tooth and surrounding tissues are fully numbed prior to commencing care.
2. Isolation: A rubber dam is placed to ensure a clean, isolated environment.
3. Canal Instrumentation: Precision rotary instruments gently clean and disinfect the micro-canals.
4. Obturation: Biocompatible filling materials seal the root canals to prevent reinfection.

Post-Visit Expectations:
Mild soreness or pressure sensitivity for a few days following treatment is standard and managed with prescribed mild analgesics. Protecting the treated tooth with a permanent crown is usually recommended.`,
    },
    authorDoctorName: {
      ar: 'فريق عيادة حياة لطب الأسنان',
      en: 'Hayaah Dental Clinic Medical Team',
    },
    publishDate: '2026-03-20',
    readTimeMinutes: 5,
    imageUrl: '/assets/blogs/2.png',
    isApprovedByDoctor: true,
    isVisible: true,
  },
];

export const initialFaqs: FaqItem[] = [
  {
    id: 'faq-1',
    question: {
      ar: 'هل أحتاج لحجز موعد مسبق قبل الحضور للعيادة؟',
      en: 'Do I need an appointment before visiting the clinic?',
    },
    answer: {
      ar: 'نعم، يفضل دائماً حجز موعد مسبق لضمان عدم الانتظار وتخصيص الوقت الكافي للفحص السريري. وفي حالات الألم الحاد والطارئ يمكنكم الاتصال بنا مسبقاً لتوفير أقرب وقت ممكن.',
      en: 'Yes, scheduling an appointment is strongly recommended to minimize waiting times. In cases of acute pain, please call us directly so we can accommodate you as promptly as possible.',
    },
    category: 'appointments',
    isSample: true,
    isApproved: true,
    order: 1,
  },
  {
    id: 'faq-2',
    question: {
      ar: 'ما هي مواعيد العمل الرسمية للعيادة؟',
      en: 'What are the clinic official operating hours?',
    },
    answer: {
      ar: 'نستقبلكم من السبت إلى الخميس من الساعة 10:00 صباحاً وحتى 10:00 مساءً. العيادة مغلقة يوم الجمعة.',
      en: 'We welcome patients Saturday through Thursday from 10:00 AM to 10:00 PM. The clinic is closed on Fridays.',
    },
    category: 'general',
    isSample: false,
    isApproved: true,
    order: 2,
  },
  {
    id: 'faq-3',
    question: {
      ar: 'أعاني من توتر وخوف من زيارة طبيب الأسنان، كيف تساعدونني؟',
      en: 'I experience dental anxiety, how can you help me?',
    },
    answer: {
      ar: 'نحن نتفهم تماماً قلق الأسنان الشائع. يحرص أطباؤنا على شرح خطوات العلاج مسبقاً والبدء بتدرج هادئ، مع إمكانية التوقف في أي لحظة تشير فيها بيدك، وتوفير بيئة علاجية صبورة ومطمئنة.',
      en: 'We fully understand dental anxiety. Our clinical team takes time to explain every step beforehand, works at your pace with agreed stop signals, and maintains a reassuring, gentle atmosphere.',
    },
    category: 'care',
    isSample: true,
    isApproved: true,
    order: 3,
  },
  {
    id: 'faq-4',
    question: {
      ar: 'ما هي وسائل الدفع المقبولة في العيادة؟',
      en: 'What payment methods are accepted at the clinic?',
    },
    answer: {
      ar: 'نقبل الدفع النقدي والبطاقات الائتمانية والخصم المباشر (Visa / Mastercard) بالإضافة للمحافظ الإلكترونية المصرية (InstaPay / Vodafone Cash).',
      en: 'We accept cash, debit and credit cards (Visa / Mastercard), and Egyptian digital wallets (InstaPay / Vodafone Cash).',
    },
    category: 'payments',
    isSample: true,
    isApproved: true,
    order: 4,
  },
];

export const initialRatings: RatingData = {
  platform: 'Google Maps',
  score: CLINIC_RATING.score,
  maxScore: CLINIC_RATING.maxScore,
  reviewCount: CLINIC_RATING.reviewsCount,
  sourceUrl: 'https://www.google.com/maps/search/?api=1&query=30.112729,31.336293',
  isVerified: true,
};

export const initialSiteSettings: SiteSettings = {
  demoMode: true,
  showPrices: false, // Rule 11: hidden by default
  showBeforeAfter: false, // Rule 9: OFF by default
  showAnnouncement: false,
  announcementText: {
    ar: 'مرحباً بكم في عيادة حياة لطب الأسنان بمصر الجديدة',
    en: 'Welcome to Hayaah Dental Clinic in Heliopolis',
  },
  announcementType: 'info',
  primaryColor: '#0E5C2F',
  secondaryColor: '#7AC143',
  accentColor: '#EEF4F0',
  noindex: true, // Rule 3: noindex until go-live
  dataVersion: 1,
};

export const initialSections: SectionConfig[] = [
  { id: 'hero', nameAr: 'واجهة الموقع والبانر الرئيسي', nameEn: 'Hero Banner', isVisible: true, order: 1 },
  { id: 'trust-strip', nameAr: 'شريط الثقة والمؤشرات', nameEn: 'Trust Strip', isVisible: true, order: 2 },
  { id: 'services', nameAr: 'خدمات العيادة', nameEn: 'Services Section', isVisible: true, order: 3, navLabelAr: 'خدماتنا', navLabelEn: 'Services' },
  { id: 'team', nameAr: 'الفريق الطبي', nameEn: 'Medical Team', isVisible: true, order: 4, navLabelAr: 'أطباؤنا', navLabelEn: 'Doctors' },
  { id: 'experience', nameAr: 'ماذا تتوقع في زيارتك الأولى', nameEn: 'First Visit Experience', isVisible: true, order: 5 },
  { id: 'about', nameAr: 'عن العيادة ومعايير الأمان', nameEn: 'About & Sterilization', isVisible: true, order: 6, navLabelAr: 'عن العيادة', navLabelEn: 'About' },
  { id: 'gallery', nameAr: 'معرض صور العيادة', nameEn: 'Clinic Gallery', isVisible: true, order: 7, navLabelAr: 'جولة بالعيادة', navLabelEn: 'Gallery' },
  { id: 'before-after', nameAr: 'معرض الحالات السريرية (يتطلب موافقة)', nameEn: 'Clinical Cases (Requires Consent)', isVisible: false, order: 8 },
  { id: 'faq', nameAr: 'الأسئلة الشائعة', nameEn: 'FAQ', isVisible: true, order: 9, navLabelAr: 'الأسئلة الشائعة', navLabelEn: 'FAQ' },
  { id: 'articles', nameAr: 'المقالات والتوعية الطبية', nameEn: 'Health Education', isVisible: true, order: 10, navLabelAr: 'المقالات', navLabelEn: 'Articles' },
  { id: 'emergency', nameAr: 'طوارئ وألم الأسنان الحاد', nameEn: 'Emergency & Urgent Pain', isVisible: true, order: 11 },
  { id: 'appointment', nameAr: 'نموذج طلب حجز موعد', nameEn: 'Appointment Request Form', isVisible: true, order: 12, navLabelAr: 'طلب موعد', navLabelEn: 'Book' },
  { id: 'contact', nameAr: 'العنوان ومواعيد العمل والخريطة', nameEn: 'Contact & Location', isVisible: true, order: 13, navLabelAr: 'تواصل معنا', navLabelEn: 'Contact' },
];

export const initialImageSlots: ImageSlot[] = ALL_IMAGE_SLOTS;
