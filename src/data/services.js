/**
 * SERVICES DATA — 12 Dental Services
 * Generic, safe, standard dental procedures.
 * // TODO: confirm specific service list, pricing, and exact clinic procedures with clinic owner
 */

export const SERVICES = [
  {
    id: "scaling-polishing",
    slug: "scaling-polishing",
    category: "preventive",
    iconName: "Sparkles",
    title: {
      ar: "تنظيف وتلميع الأسنان",
      en: "Scaling & Polishing",
    },
    shortDesc: {
      ar: "إزالة الجير والتصبغات العميقة بالموجات فوق الصوتية لحماية اللثة واستعادة النقاء الطبيعي للأسنان.",
      en: "Ultrasonic tartar removal and deep stain polishing to protect gums and restore natural dental cleanliness.",
    },
    fullDesc: {
      ar: "جلسة تنظيف الأسنان الدورية وإزالة الرواسب الجيرية المتكلسة فوق وتحت خط اللثة باستخدام أحدث أجهزة الموجات فوق الصوتية اللطيفة، مع تلميع سطح المينا لحمايتها من تجمع البكتيريا ومنحك نفساً منعشاً ولثة صحية ووردية.",
      en: "Routine ultrasonic scaling to eliminate calcified tartar above and below the gumline, followed by enamel polishing to prevent plaque adherence and maintain healthy, fresh gums.",
    },
    duration: { ar: "٣٠ - ٤٥ دقيقة", en: "30 - 45 mins" },
    recommendedFrequency: { ar: "كل ٦ أشهر", en: "Every 6 months" },
    whoNeedsIt: {
      ar: [
        "نزيف اللثة أثناء تنظيف الأسنان بالفرشاة",
        "تراكم الاصفرار أو التكلسات الجيرية عند حواف الأسنان",
        "تغير رائحة الفم أو الشعور بخشونة على أسطح الأسنان",
        "المدخنون أو متناولو الشاي والقهوة بكثرة",
        "مرور أكثر من 6 أشهر على آخر زيارة تنظيف",
      ],
      en: [
        "Bleeding gums while brushing or flossing",
        "Visible tartar accumulation or yellowing around tooth margins",
        "Persistent bad breath or rough texture on teeth",
        "Frequent tea, coffee drinkers or smokers",
        "More than 6 months since your last professional cleaning",
      ],
    },
    procedureSteps: [
      {
        step: 1,
        titleAr: "الفحص الشامل وتقييم اللثة",
        titleEn: "Comprehensive Gum Assessment",
        descAr: "فحص دقيق لكافة الأسنان وقياس عمق جيوب اللثة لتحديد أماكن تراكم الجير.",
        descEn: "Thorough inspection of teeth and periodontal pockets to identify plaque deposits.",
      },
      {
        step: 2,
        titleAr: "إزالة التكلسات بالموجات الصوتية",
        titleEn: "Ultrasonic Calculus Removal",
        descAr: "استخدام رأس مائي موجي فائق الدقة لتفتيت الجير دون أي كشط أو ألم لمينا الأسنان.",
        descEn: "Gentle ultrasonic vibrations safely detach hardened tartar without harming enamel.",
      },
      {
        step: 3,
        titleAr: "تلميع المينا وإزالة التصبغات",
        titleEn: "Fine Prophy Polishing",
        descAr: "تلميع أسطح الأسنان بمعجون تلميع طبي ناعم لإزالة تصبغات القهوة والتدخين.",
        descEn: "Micro-fine paste application to smooth enamel and remove surface stains.",
      },
      {
        step: 4,
        titleAr: "إرشادات العناية اليومية والفلورايد",
        titleEn: "Protective Fluoride & Home Guidance",
        descAr: "تطبيق طبقة فلورايد مقوية وتوجيه المريض لطرق التنظيف المثالية في المنزل.",
        descEn: "Protective fluoride varnish application with personalized home hygiene recommendations.",
      },
    ],
    faqs: [
      {
        qAr: "هل تنظيف الجير يسبب ضعف أو تآكل الأسنان؟",
        qEn: "Does teeth cleaning weaken or erode dental enamel?",
        aAr: "إطلاقاً، أجهزة الموجات الصوتية الحديثة تعمل بالاهتزاز المائي اللطيف لتفتيت الجير الخارجي دون لمس نسيج السن نفسه، بل يحمي الأسنان من التخلخل والتسوس.",
        aEn: "Not at all. Modern ultrasonic scalers use gentle acoustic vibrations and water flow that dissolve foreign tartar without contacting or harming natural enamel.",
      },
      {
        qAr: "كم مرة يجب إجراء جلسة تنظيف الجير؟",
        qEn: "How often should professional scaling be performed?",
        aAr: "يوصى بإجرائها مرة كل 6 أشهر للحفاظ على سلامة اللثة ووقاية الأسنان من المضاعفات.",
        aEn: "Dentists universally recommend visiting for a preventive clean every 6 months.",
      },
    ],
  },
  {
    id: "cosmetic-fillings",
    slug: "cosmetic-fillings",
    category: "restorative",
    iconName: "ShieldCheck",
    title: {
      ar: "حشو الأسنان التجميلي",
      en: "Cosmetic Fillings",
    },
    shortDesc: {
      ar: "حشوات كمبوزيت ضوئية بلون الأسنان الطبيعي لترميم التسوس والكسور بصلابة فائقة ومظهر غير مرئي.",
      en: "Tooth-colored composite resin fillings to repair decay and micro-fractures with natural aesthetics.",
    },
    fullDesc: {
      ar: "ترميم الأسنان المتضررة من التسوس أو الشروخ باستخدام أجود أنواع الراتنج المركب (الكمبوزيت) المتطابق تماماً مع تدرج لون أسنانك الطبيعية، لإعادة بنية السن ووظيفته دون أن يلاحظ أحد وجود حشو.",
      en: "Restorative resin bonding seamlessly matched to your tooth shade, restoring structural strength and natural beauty after cavity treatment or minor chipping.",
    },
    duration: { ar: "٣٠ - ٥٠ دقيقة", en: "30 - 50 mins" },
    recommendedFrequency: { ar: "عند الحاجة", en: "As needed" },
    whoNeedsIt: {
      ar: [
        "ظهور بقع بنية أو سوداء أو حفر في الأسنان",
        "حساسية مفاجئة عند تناول الأطعمة السكرية أو الباردة",
        "كسر بسيط أو تآكل في حواف الأسنان الأمامية أو الخلفية",
        "الرغبة في استبدال الحشوات الفضية القديمة (الأملغم) بحشوات تجميلية",
      ],
      en: [
        "Visible dark spots or cavities on chewing surfaces",
        "Sudden sensitivity to sweets or cold beverages",
        "Minor chips or worn edges on front or back teeth",
        "Desire to replace old silver amalgam with tooth-colored fillings",
      ],
    },
    procedureSteps: [
      {
        step: 1,
        titleAr: "تخدير موضعي لطيف وتنظيف التسوس",
        titleEn: "Gentle Anesthesia & Decay Removal",
        descAr: "عزل السن وإزالة أنسجة التسوس بدقة مجهرية للحفاظ على أكبر قدر من السن السليم.",
        descEn: "Conservative isolation and decay removal preserving maximum healthy tooth structure.",
      },
      {
        step: 2,
        titleAr: "معالجة السطح بالربط الضوئي",
        titleEn: "Adhesive Etch & Prime Bonding",
        descAr: "تجهيز السن بمواد لاصقة مجهرية تضمن التحام الحشوة بقوة مع أنسجة السن.",
        descEn: "Specialized primer and adhesive bonding agent applied for microscopic retention.",
      },
      {
        step: 3,
        titleAr: "بناء الحشوة بطبقات فنية",
        titleEn: "Multi-Layer Composite Sculpting",
        descAr: "وضع طبقات الراتنج ومطابقتها مع تضاريس السن وتشليبها بالضوء الأزرق المصلب.",
        descEn: "Artistic sculpting of resin layers cured via specialized light polymerization.",
      },
      {
        step: 4,
        titleAr: "التنعيم وضبط العضة والتلميع",
        titleEn: "Occlusion Tuning & Final Polish",
        descAr: "فحص الإطباق لضمان راحة المضغ التامة وتلميع السطح حتى يماثل المينا الطبيعية.",
        descEn: "Bite adjustment and high-gloss polishing for zero friction and seamless feel.",
      },
    ],
    faqs: [
      {
        qAr: "كم تدوم الحشوة التجميلية؟",
        qEn: "How long do cosmetic composite fillings last?",
        aAr: "تدوم ما بين 7 إلى 10 سنوات وأكثر مع الحفاظ على نظافة الفم والفحص الدوري المنتظم.",
        aEn: "Typically 7 to 10+ years with proper oral hygiene and routine check-ups.",
      },
    ],
  },
  {
    id: "root-canal",
    slug: "root-canal",
    category: "restorative",
    iconName: "Activity",
    title: {
      ar: "علاج العصب والجذور",
      en: "Root Canal Treatment",
    },
    shortDesc: {
      ar: "إنقاذ الأسنان المصابة بالتهاب العصب العميق بأحدث أجهزة الروتاري الدقيقة وبتخدير موضعي لطيف.",
      en: "Precision rotary endodontic therapy to clean and seal infected root canals to preserve natural teeth.",
    },
    fullDesc: {
      ar: "إجراء علاجي متقدم يهدف للحفاظ على السن الطبيعي ومنع خلعه، من خلال تنظيف وتعقيم قنوات الجذور بدقة بالغة بأجهزة الروتاري الحديثة وحشوها بمواد متوافقة حيوياً تمنع عودة البكتيريا مجدداً.",
      en: "Advanced endodontic procedure aimed at preserving your natural tooth through mechanical and chemical rotary canal disinfection, sealed hermetically with bioceramics.",
    },
    duration: { ar: "جلسة إلى جلستين (٤٥-٦٠ دقيقة)", en: "1 - 2 visits (45-60 mins)" },
    recommendedFrequency: { ar: "إجراء علاجي محدد", en: "Treatment as needed" },
    whoNeedsIt: {
      ar: [
        "ألم نابض مستمر يوقظ من النوم أو يزداد عند الاستلقاء",
        "ألم حاد لا يزول بعد شرب السوائل الباردة أو الساخنة",
        "ألم شديد عند الضغط أو المضغ على السن",
        "ظهور انتفاخ أو دمل صغير في اللثة المجاورة لجذر السن",
        "تغير لون السن إلى الرمادي أو الداكن نتيجة صدمة قديمة",
      ],
      en: [
        "Persistent throbbing pain keeping you awake at night",
        "Prolonged acute sensitivity to hot or cold lingering for minutes",
        "Severe tenderness when biting or chewing food",
        "Swelling or small gum pimple adjacent to the tooth root",
        "Darkening/discoloration of a single tooth from past trauma",
      ],
    },
    procedureSteps: [
      {
        step: 1,
        titleAr: "التشخيص الدقيق والتخدير الكامل",
        titleEn: "Digital Imaging & Profound Anesthesia",
        descAr: "تحديد قنوات الجذر وأطوالها بدقة وتخدير المنطقة لضمان جلسة هادئة ومريحة تماماً.",
        descEn: "Canal length determination via electronic apex locators and comfortable local numbing.",
      },
      {
        step: 2,
        titleAr: "تنظيف وتعقيم القنوات بالروتاري",
        titleEn: "Rotary Canal Shaping & Disinfection",
        descAr: "استئصال العصب الملتهب وتطهير القنوات بمحاليل معقمة تقضي على كافة الميكروبات.",
        descEn: "Removal of inflamed pulp tissue and thorough chemical irrigation.",
      },
      {
        step: 3,
        titleAr: "الحشو الحراري المحكم للقنوات",
        titleEn: "Three-Dimensional Obturation",
        descAr: "ملء القنوات بمادة الجوتا بيركا المعقمة لسد الفراغات ومنع أي تسريب مستقبلي.",
        descEn: "Hermetic sealing with biocompatible gutta-percha preventing re-infection.",
      },
      {
        step: 4,
        titleAr: "إعادة بناء التاج وتجهيز الطربوش",
        titleEn: "Core Build-Up & Crown Prep",
        descAr: "تدعيم بنية السن بحشوة قوية وتهيئته لاستقبال تاج يحميه من الكسر.",
        descEn: "Structural reinforcement with post-and-core restoration followed by protective crown.",
      },
    ],
    faqs: [
      {
        qAr: "هل علاج العصب مؤلم؟",
        qEn: "Is root canal treatment painful?",
        aAr: "بفضل تقنيات التخدير الحديثة وأجهزة الروتاري الآلية، تتم الجلسة براحة تامة دون أي ألم يذكر.",
        aEn: "With modern local anesthetics and rotary instruments, patients report it feels no different than a standard filling.",
      },
    ],
  },
  {
    id: "teeth-whitening",
    slug: "teeth-whitening",
    category: "cosmetic",
    iconName: "Sun",
    title: {
      ar: "تبييض الأسنان الاحترافي",
      en: "Teeth Whitening",
    },
    shortDesc: {
      ar: "تفتيح لون الأسنان حتى ٨ درجات بأحدث تقنيات الليزر والضوء البارد بأمان تام للمينا.",
      en: "Safe in-office professional whitening brightening your smile up to 8 shades without enamel damage.",
    },
    fullDesc: {
      ar: "جلسة تبييض آمنة وسريعة بالعيادة تستغرق حوالي 45 دقيقة، نستخدم فيها جل تبييض معتمد عالمياً يتم تنشيطه بضوء مخصص لا يسبب حرارة، للحصول على ابتسامة بيضاء مشرقة ونتائج فورية ملموسة.",
      en: "Advanced in-office brightening utilizing enamel-safe medical bleaching gels accelerated by cold LED light, delivering dramatic, instant rejuvenation in under an hour.",
    },
    duration: { ar: "٤٥ - ٦٠ دقيقة", en: "45 - 60 mins" },
    recommendedFrequency: { ar: "سنوياً أو حسب نمط الحياة", en: "Yearly or as desired" },
    whoNeedsIt: {
      ar: [
        "اصفرار الأسنان الطبيعي أو مع التقدم في العمر",
        "تصبغات ناتجة عن القهوة والشاي والمشروبات الملونة",
        "الاستعداد لمناسبة خاصة أو زفاف",
        "الرغبة في تعزيز ثقتك بابتسامتك وإشراقة وجهك",
      ],
      en: [
        "Age-related tooth yellowing or natural dullness",
        "Deep stains from coffee, espresso, tea, or dietary tannins",
        "Pre-event smile preparation for weddings and public appearances",
        "Desire for an instant boost in personal and professional confidence",
      ],
    },
    procedureSteps: [
      {
        step: 1,
        titleAr: "فحص الأسنان وتحديد الدرجة الحالية",
        titleEn: "Shade Selection & Examination",
        descAr: "تسجيل درجة لون أسنانك الحالية بمقياس الدرجات ومناقشة الهدف المرجو.",
        descEn: "Current shade matching on a dental guide to calibrate realistic goals.",
      },
      {
        step: 2,
        titleAr: "عزل اللثة والشفايف بحاجز وقائي",
        titleEn: "Gingival Barrier Protection",
        descAr: "وضع حاجز سيليكوني واقٍ على اللثة لحمايتها من أي تلامس مع جل التبييض.",
        descEn: "Light-cured protective barrier applied to isolate gums and soft oral tissues.",
      },
      {
        step: 3,
        titleAr: "تطبيق الجل والتنشيط الضوئي",
        titleEn: "Bleaching Gel & Light Activation",
        descAr: "توزيع جل التبييض على الأسنان وتنشيطه بدورات متتالية من الضوء البارد.",
        descEn: "Three 15-minute cycles of professional gel activated by specialized LED accelerator.",
      },
      {
        step: 4,
        titleAr: "تطبيق مهدئ الحساسية والنتيجة النهائية",
        titleEn: "Desensitizing Balm & Reveal",
        descAr: "إزالة الجل ووضع مادة مهدئة للمينا، ومقارنة النتيجة الجديدة المبهرة.",
        descEn: "Anti-sensitivity mineralizing application and reveal of your radiant new shade.",
      },
    ],
    faqs: [
      {
        qAr: "هل يسبب التبييض حساسية دائمة للأسنان؟",
        qEn: "Does teeth whitening cause permanent tooth sensitivity?",
        aAr: "لا، قد يشعر بعض المرضى بحساسية خفيفة مؤقتة تزول خلال 24 إلى 48 ساعة فقط، ونستخدم مواد مهدئة تحد من ذلك تماماً.",
        aEn: "No. Any mild sensitivity is temporary and resolves within 24 to 48 hours. Post-treatment minerals ensure calm recovery.",
      },
    ],
  },
  {
    id: "crowns-bridges",
    slug: "crowns-bridges",
    category: "restorative",
    iconName: "Crown",
    title: {
      ar: "تركيبات وتيجان الأسنان (الزركون والإيماكس)",
      en: "Crowns & Bridges",
    },
    shortDesc: {
      ar: "تعويض الأسنان المفقودة وحماية الأسنان الضعيفة بتيجان الزركونيوم والإيماكس عالية الصلابة والجمال.",
      en: "High-strength Zirconia and E-max ceramic restorations to protect damaged teeth and replace missing units.",
    },
    fullDesc: {
      ar: "حلول تعويضية ثابتة تعيد للأسنان قوتها ووظيفتها في المضغ مع الحفاظ على شكلها الجمالي الطبيعي. نستخدم خامات الزركون والإيماكس الخالية من المعادن لتفادي أي تصبغ في اللثة وضمان استدامة تدوم لسنوات طويلة.",
      en: "Fixed prosthodontic solutions crafted from metal-free biocompatible monolithic zirconia or lithium disilicate (E-max), providing exceptional bite durability and lifelike translucency.",
    },
    duration: { ar: "جلستان (بينها عدة أيام)", en: "2 visits" },
    recommendedFrequency: { ar: "استدامة لسنوات طويلة", en: "Long-term restoration" },
    whoNeedsIt: {
      ar: [
        "الأسنان المعالجة عصبياً لمنع كسرها",
        "تآكل شديد في تاج السن يعجز الحشو العادي عن تعويضه",
        "فقدان سن أو أكثر مع الرغبة في تركيب جسر ثابت",
        "تكسر جزء كبير من السن نتيجة حادث أو صدمة",
      ],
      en: [
        "Root canal treated teeth needing fracture protection",
        "Heavily damaged or worn teeth unsuited for simple fillings",
        "One or more missing teeth requiring fixed bridge replacement",
        "Severe tooth cracking or aesthetic crown remodeling",
      ],
    },
    procedureSteps: [
      {
        step: 1,
        titleAr: "تحضير السن وأخذ المقاسات الدقيقة",
        titleEn: "Tooth Preparation & Digital Impressions",
        descAr: "برد دقيق للسن وأخذ قياسات مجهرية بالغة الدقة للمعمل المعتمد.",
        descEn: "Conservative axial reduction and high-precision dental impression capture.",
      },
      {
        step: 2,
        titleAr: "تركيب تاج مؤقت لحماية السن",
        titleEn: "Custom Temporary Crown",
        descAr: "وضع تاج مؤقت مريح يحافظ على وظيفة المضغ والجمال لحين تجهيز التاج النهائي.",
        descEn: "Placement of an interim provisional crown protecting sensitivity and aesthetics.",
      },
      {
        step: 3,
        titleAr: "صناعة التاج بتقنية الكاد كام (CAD/CAM)",
        titleEn: "CAD/CAM Precision Milling",
        descAr: "خراطة وتصميم التاج رقمياً بدقة الميكرون لتطابق إطباقك وتشريح أسنانك.",
        descEn: "Robotic zirconia or ceramic milling ensuring micron-perfect margins.",
      },
      {
        step: 4,
        titleAr: "التثبيت الدائم وضبط الإطباق",
        titleEn: "Permanent Cementation & Bite Fit",
        descAr: "تثبيت التاج بالإسمنت الراتنجي عالي الالتصاق والتحقق من راحة الإطباق التامة.",
        descEn: "Adhesive resin bonding and microscopic occlusion harmonization.",
      },
    ],
    faqs: [
      {
        qAr: "ما الفرق بين الزركون والإيماكس؟",
        qEn: "What is the difference between Zirconia and E-max?",
        aAr: "الزركون يتميز بصلابة فائقة تناسب الأضراس الخلفية وقوة المضغ، بينما الإيماكس يتميز بشفافية ضوئية تحاكي الأسنان الأمامية وتمنحها مظهراً جمالياً مبهراً.",
        aEn: "Zirconia offers maximum tensile strength ideal for posterior molars and bridges, while E-max provides unmatched translucency for anterior cosmetic teeth.",
      },
    ],
  },
  {
    id: "dental-implants",
    slug: "dental-implants",
    category: "surgery",
    iconName: "Anchor",
    title: {
      ar: "زراعة الأسنان",
      en: "Dental Implants",
    },
    shortDesc: {
      ar: "الحل التعويضي الأمثل للأسنان المفقودة بجذور تيتانيوم حيوية تندمج مع العظم بثبات وظيفي وجمالي.",
      en: "Biocompatible titanium fixture integration replacing missing tooth roots with biological stability.",
    },
    fullDesc: {
      ar: "زراعة الأسنان هي المعيار لتعويض الأسنان المفقودة دون الحاجة لنحت أو لمس الأسنان المجاورة السليمة. نعتمد غرسات تيتانيوم طبية عالمية تندمج حيوياً مع عظام الفك لتعيد لك متعة تناول طعامك براحة وابتسامة كاملة.",
      en: "The clinical standard for single and multiple tooth replacement without touching adjacent sound teeth. Biocompatible titanium fixtures osseointegrate directly into jawbone for strong chewing confidence.",
    },
    duration: { ar: "خطة متكاملة على مراحل", en: "Multi-stage planned treatment" },
    recommendedFrequency: { ar: "حل سريري متين وطويل الأمد", en: "Durable long-term clinical solution" },
    whoNeedsIt: {
      ar: [
        "فقدان سن واحد أو عدة أسنان والرغبة في تعويض ثابت",
        "صعوبة في مضغ الطعام أو ارتداء التركيبات المتحركة",
        "الرغبة في الحفاظ على كثافة عظام الفك من الضمور بعد الخلع",
        "تجنب برد أو نحت الأسنان الطبيعية المجاورة لعمل كوبري",
      ],
      en: [
        "Single or multiple missing teeth seeking a fixed, non-removable solution",
        "Discomfort or instability with traditional removable dentures",
        "Preventing jawbone resorption and facial contour collapse after tooth loss",
        "Avoiding the shaving down of adjacent healthy natural teeth",
      ],
    },
    procedureSteps: [
      {
        step: 1,
        titleAr: "الفحص التجسيمي والأشعة المقطعية (CBCT)",
        titleEn: "3D CBCT Scan & Planning",
        descAr: "تقييم كثافة العظم بدقة ثلاثية الأبعاد والتخطيط الرقمي المسبق لزاوية الزرعة.",
        descEn: "Three-dimensional bone density analysis and computerized surgical trajectory planning.",
      },
      {
        step: 2,
        titleAr: "وضع الغرسة بدون جراحة معقدة",
        titleEn: "Micro-Surgical Implant Placement",
        descAr: "تثبيت غرسة التيتانيوم بتخدير موضعي بسيط وبأقل تدخل جراحي ممكن.",
        descEn: "Gentle local anesthesia placement of sterile titanium implant into alveolar bone.",
      },
      {
        step: 3,
        titleAr: "مرحلة الاندماج العظمي (Osseointegration)",
        titleEn: "Osseointegration Healing Period",
        descAr: "فترة التئام هادئة تسمح للعظم الطبيعي بالالتفاف حول سطح الزرعة والاندماج التام معها.",
        descEn: "Cellular bone growth integration around the micro-textured titanium surface.",
      },
      {
        step: 4,
        titleAr: "تركيب الدعامة والتاج النهائي الزركوني",
        titleEn: "Custom Abutment & Final Crown",
        descAr: "تثبيت الدعامة وتركيب التاج النهائي المطابق لأسنانك تماماً في الشكل والوظيفة.",
        descEn: "Fixation of precision abutment and cementation/screw retention of custom crown.",
      },
    ],
    faqs: [
      {
        qAr: "هل نسبة نجاح زراعة الأسنان مرتفعة؟",
        qEn: "What is the success rate of dental implants?",
        aAr: "تتجاوز نسبة نجاح زراعة الأسنان عالمياً 96% عند الالتزام بتعليمات الطبيب والحفاظ على صحة الفم.",
        aEn: "Clinical studies demonstrate over 96-98% long-term success rates with proper maintenance.",
      },
    ],
  },
  {
    id: "orthodontics",
    slug: "orthodontics",
    category: "ortho",
    iconName: "Smile",
    title: {
      ar: "تقويم الأسنان (المعدني والشفاف)",
      en: "Orthodontics / Braces",
    },
    shortDesc: {
      ar: "تصحيح تزاحم الأسنان ومشاكل الإطباق بالتقويم المعدني أو القوالب الشفافة لابتسامة متناسقة.",
      en: "Correcting tooth crowding, spacing, and malocclusion via modern metal braces or clear aligners.",
    },
    fullDesc: {
      ar: "علاج متكامل لتعديل وضعية الأسنان وتنسيق إطباق الفكين، سواء للكبار أو المراهقين. نقدم خيارات التقويم المعدني الدقيق والتقويم الشفاف غير المرئي لتصحيح التزاحم والمسافات وضمان تناسق ملامح الوجه.",
      en: "Comprehensive orthodontic care treating dental crowding, bite discrepancies, and jaw alignment using low-profile metal brackets or virtually invisible clear aligner therapy.",
    },
    duration: { ar: "خطة علاجية ممتدة (زيارة شهرية)", en: "Monthly review visits" },
    recommendedFrequency: { ar: "متابعة دورية", en: "Regular follow-ups" },
    whoNeedsIt: {
      ar: [
        "تزاحم وتداخل الأسنان وصعوبة تنظيفها بالفرشاة",
        "وجود فراغات ومسافات واسعة بين الأسنان",
        "بروز الأسنان العلوية أو تراجع الفك السفلي",
        "العضة المفتوحة أو المعكوسة أو العميقة",
      ],
      en: [
        "Crowded, overlapping teeth that are difficult to floss properly",
        "Visible gaps or spaces between teeth",
        "Overbite, underbite, crossbite, or open bite misalignment",
        "Jaw alignment concerns impacting facial symmetry or speech",
      ],
    },
    procedureSteps: [
      {
        step: 1,
        titleAr: "دراسة الحالة والصور الإشعاعية",
        titleEn: "Diagnostic Records & Cephalometrics",
        descAr: "أخذ صور رقمية ومقاسات وأشعة بانوراما وسيفالومترية لتحليل مسار حركة الأسنان.",
        descEn: "Photographic protocol, panoramic x-rays, and lateral cephalometric tracing.",
      },
      {
        step: 2,
        titleAr: "خطة العلاج واختيار نوع التقويم",
        titleEn: "Personalized Treatment Planning",
        descAr: "تحديد أفضل خيار (تقويم معدني أو شفاف) والمدة المتوقعة للوصول إلى النتيجة المنشودة.",
        descEn: "Custom treatment roadmap outlining timeline, mechanics, and aligner staging.",
      },
      {
        step: 3,
        titleAr: "تركيب الأجهزة والمتابعات الشهرية",
        titleEn: "Appliance Bonding & Monthly Adjustments",
        descAr: "تثبيت الأقواس أو تسليم قوالب التقويم مع متابعة تقدم الحركة كل 4 أسابيع.",
        descEn: "Gentle bracket placement or aligner delivery with scheduled progress checks.",
      },
      {
        step: 4,
        titleAr: "إزالة التقويم وتثبيت النتيجة (Retainer)",
        titleEn: "Debonding & Long-Term Retention",
        descAr: "فصل التقويم وتركيب مثبت شفاف أو سلكي يضمن بقاء الأسنان في موقعها الجديد مدى الحياة.",
        descEn: "Bracket removal, high-gloss enamel polish, and custom retainer delivery.",
      },
    ],
    faqs: [
      {
        qAr: "هل التقويم مناسب للكبار أيضاً؟",
        qEn: "Is orthodontic treatment suitable for adults?",
        aAr: "نعم بالتأكيد! لا يوجد حد للعمر في تقويم الأسنان طالما أن اللثة والعظام بحالة صحية جيدة.",
        aEn: "Absolutely. Teeth can be moved at any age as long as periodontal bone and gum tissues are healthy.",
      },
    ],
  },
  {
    id: "veneers",
    slug: "veneers",
    category: "cosmetic",
    iconName: "Star",
    title: {
      ar: "ابتسامة هوليود وفينير الأسنان",
      en: "Veneers / Hollywood Smile",
    },
    shortDesc: {
      ar: "عدسات بورسلين فائقة الرقة لتعديل لون وشكل الأسنان ومنحك ابتسامة المشاهير المثالية بتناغم طبيعي.",
      en: "Ultra-thin porcelain ceramic veneers crafting custom Hollywood smiles with harmonious aesthetics.",
    },
    fullDesc: {
      ar: "تصميم ابتسامة مخصص يراعي أبعاد وجهك ولون بشرتك، من خلال قشور خزفية رقيقة تثبت على واجهة الأسنان الأمامية لتصحيح العيوب والتصبغات الشديدة والمسافات والحصول على مظهر متألق طبيعي يدوم طويلاً.",
      en: "Bespoke digital smile design crafting microscopically thin porcelain laminates bonded to the frontal enamel surface to reshape proportions, close diastemas, and illuminate your face.",
    },
    duration: { ar: "جلستان إلى ثلاث جلسات", en: "2 - 3 visits" },
    recommendedFrequency: { ar: "تجميلي مستدام", en: "Long-term cosmetic" },
    whoNeedsIt: {
      ar: [
        "تصبغات داخلية عميقة لا تستجيب للتبييض التقليدي",
        "تآكل وعدم انتظام أطوال الأسنان الأمامية",
        "مسافات صغيرة بين الأسنان الأمامية ترغب في إغلاقها فورياً",
        "الرغبة في ابتسامة ناصعة ومتناسقة كابتسامات المشاهير",
      ],
      en: [
        "Severe intrinsic staining resistant to standard bleaching",
        "Chipped, irregularly shaped, or worn incisal edges",
        "Diastemas and small gaps between anterior teeth",
        "Desire for a camera-ready, symmetrical, radiant smile",
      ],
    },
    procedureSteps: [
      {
        step: 1,
        titleAr: "تصميم الابتسامة ومحاكاة النتيجة (Mock-Up)",
        titleEn: "Digital Smile Design & Live Mock-Up",
        descAr: "دراسة ملامح الوجه وتجربة شكل الأسنان المقترحة في فمك قبل بدء أي خطوة.",
        descEn: "Aesthetic facial analysis and intraoral trial mock-up before tooth touch.",
      },
      {
        step: 2,
        titleAr: "تحضير مجهري طفيف للغاية للمينا",
        titleEn: "Minimal Micro-Enamel Preparation",
        descAr: "برد دقيق للغاية لا يتعدى أعشار المليمتر للحفاظ على حيوية المينا الطبيعية.",
        descEn: "Conservative sub-millimeter enamel preparation preserving vital tooth structure.",
      },
      {
        step: 3,
        titleAr: "تصنيع العدسات الخزفية بأعلى دقة",
        titleEn: "Master Lab Ceramic Fabrication",
        descAr: "نحت طبقات الخزف وتلوينها بدقة فائقة لتحاكي حيوية المينا الطبيعية وانعكاس الضوء.",
        descEn: "Artisan ceramic stratification mirroring natural internal light reflection.",
      },
      {
        step: 4,
        titleAr: "الالتصاق الدائم والتثبيت النهائي",
        titleEn: "Permanent Adhesive Lamination",
        descAr: "تثبيت العدسات بروابط كيميائية فائقة الصلابة ومراجعة النتيجة الخلابة.",
        descEn: "Precision light-cured adhesive resin bonding and final aesthetic check.",
      },
    ],
    faqs: [
      {
        qAr: "هل تتغير ألوان الفينير مع شرب القهوة؟",
        qEn: "Do porcelain veneers stain or discolor over time?",
        aAr: "قشور البورسلين الخزفية غير مسامية ومقاومة تماماً للتصبغات الناتجة عن القهوة والشاي والتدخين.",
        aEn: "High-grade glazed dental porcelain is non-porous and completely impervious to coffee, tea, and smoke stains.",
      },
    ],
  },
  {
    id: "pediatric-dentistry",
    slug: "pediatric-dentistry",
    category: "general",
    iconName: "Heart",
    title: {
      ar: "طب أسنان الأطفال",
      en: "Pediatric Dentistry",
    },
    shortDesc: {
      ar: "رعاية وقائية وعلاجية لطيفة ومحببة للأطفال في بيئة مريحة خالية من أي خوف أو قلق.",
      en: "Gentle, stress-free dental care tailored specifically for children in a warm, welcoming environment.",
    },
    fullDesc: {
      ar: "نقدم لأطفالك تجربة علاجية إيجابية تبني لديهم حب زيارة طبيب الأسنان. تشمل خدماتنا جلسات الفلورايد الوقائي، وسد الشقوق الميزابية لحماية الضروس من التسوس، وعلاج أسنان الحليب بأحدث الأساليب السلوكية اللطيفة.",
      en: "Positive, fear-free dentistry designed to create lifelong oral wellness habits for kids. Includes preventive fluoride, pit-and-fissure sealants, and gentle pulp therapy for milk teeth.",
    },
    duration: { ar: "٢٠ - ٤٠ دقيقة", en: "20 - 40 mins" },
    recommendedFrequency: { ar: "كل ٦ أشهر", en: "Every 6 months" },
    whoNeedsIt: {
      ar: [
        "الأطفال من عمر ظهور أول سن لبني وحتى سن المراهقة",
        "وقاية الأسنان الدائمة الحديثة من التسوس عبر الفلورايد والسيالنت",
        "تسوس أسنان الحليب أو آلام الأسنان الليلية لدى الطفل",
        "علاج العادات الفموية كمص الأصابع أو كز الأسنان",
      ],
      en: [
        "Children from eruption of the first milk tooth up to adolescence",
        "Cavity prevention on newly erupted molars via sealant barriers",
        "Treating primary tooth cavities and childhood toothaches gently",
        "Managing early oral habits such as thumb sucking or bruxism",
      ],
    },
    procedureSteps: [
      {
        step: 1,
        titleAr: "الترحيب الودود والتأقلم النفسي",
        titleEn: "Friendly Welcome & Tell-Show-Do",
        descAr: "كسب ثقة الطفل من خلال أسلوب (أخبره، أره، ثم ابدأ) في جو محفز ومرح.",
        descEn: "Playful introductory rapport-building overcoming anxiety using 'Tell-Show-Do'.",
      },
      {
        step: 2,
        titleAr: "الفحص اللطيف وتنظيف الأسنان",
        titleEn: "Gentle Exam & Child-Friendly Polish",
        descAr: "فحص الأسنان واللثة بنعومة وتلميع الأسنان بطعم الفراولة أو النعناع المحبب.",
        descEn: "Non-invasive check-up and flavored preventive cleaning.",
      },
      {
        step: 3,
        titleAr: "تطبيق الفلورايد وسدادات الشقوق (Sealants)",
        titleEn: "Fluoride Varnish & Protective Sealants",
        descAr: "تطبيق طبقة واقية عازلة لحماية شقوق الضروس من بقايا الطعام والبكتيريا.",
        descEn: "Gentle application of cavity-shielding pit sealants on chewing surfaces.",
      },
      {
        step: 4,
        titleAr: "مكافأة الشجاعة وتشجيع العناية المنزلية",
        titleEn: "Bravery Reward & Home Habit Coaching",
        descAr: "تقديم هدية تشجيعية للطفل وتدريب الوالدين على أسهل طرق تنظيف أسنان الصغار.",
        descEn: "Bravery reward gift and positive reinforcement coaching for parents at home.",
      },
    ],
    faqs: [
      {
        qAr: "متى يجب أن تكون أول زيارة للطفل لطبيب الأسنان؟",
        qEn: "When should a child have their very first dental visit?",
        aAr: "يوصى بزيارة طبيب الأسنان مع ظهور السن الأول أو بحلول عيد ميلاده الأول لبناء وقاية مبكرة.",
        aEn: "Pediatric associations recommend the first visit by age one or when the first primary tooth erupts.",
      },
    ],
  },
  {
    id: "gum-treatment",
    slug: "gum-treatment",
    category: "preventive",
    iconName: "Shield",
    title: {
      ar: "علاج اللثة ورائحة الفم",
      en: "Gum Treatment & Periodontics",
    },
    shortDesc: {
      ar: "علاج التهابات اللثة وانحسارها والجيوب العميقة بأحدث البروتوكولات الطبية لاستعادة ثبات الأسنان.",
      en: "Targeted periodontal therapies treating gingivitis, deep pocket infection, and bleeding.",
    },
    fullDesc: {
      ar: "برامج علاجية مخصصة للسيطرة على التهابات اللثة الحادة والمزمنة، وتنظيف الجيوب العميقة أسفل خط اللثة، لمنع تراجع العظم وحماية الأسنان من التخلخل والتساقط، مع علاج الأسباب الجذرية لرائحة الفم غير المرغوبة.",
      en: "Comprehensive periodontal protocols for resolving bleeding, chronic inflammation, and deep subgingival pockets to halt bone recession and stabilize teeth foundations.",
    },
    duration: { ar: "جلسة أو عدة جلسات مبرمجة", en: "1 - 3 targeted sessions" },
    recommendedFrequency: { ar: "متابعة دورية كل ٤-٦ أشهر", en: "Every 4 - 6 months" },
    whoNeedsIt: {
      ar: [
        "نزيف اللثة المستمر عند الأكل أو التفريش",
        "احمرار وتورم أو حكة في أنسجة اللثة",
        "انحسار اللثة وظهور جذور الأسنان مع حساسية شديدة",
        "وجود رائحة فم غير مستحبة ومستمرة لا تزول بالمعجون",
        "شعور بخلخلة أو حركة خفيفة في بعض الأسنان",
      ],
      en: [
        "Continuous gum bleeding during mastication or brushing",
        "Red, tender, or swollen gingival margins",
        "Gum recession exposing sensitive root surfaces",
        "Chronic halitosis (bad breath) unresponsive to regular mouthwash",
        "Feeling slight tooth mobility or altered chewing contact",
      ],
    },
    procedureSteps: [
      {
        step: 1,
        titleAr: "فحص الجيوب اللثوية والتشخيص الميكروبي",
        titleEn: "Periodontal Probing & Pocket Charting",
        descAr: "قياس عمق الجيوب حول كل سن وتحديد درجة الالتهاب بالأجهزة الدقيقة.",
        descEn: "Millimeter depth measurements around each tooth evaluating attachment level.",
      },
      {
        step: 2,
        titleAr: "التنظيف العميق وكشط الجذور (Root Planing)",
        titleEn: "Deep Scaling & Root Planing",
        descAr: "تنظيف وتعقيم أسطح الجذور تحت اللثة لإزالة السموم البكتيرية والتكلسات العميقة.",
        descEn: "Subgingival debridement smoothing rough cementum surfaces beneath gums.",
      },
      {
        step: 3,
        titleAr: "الري الموضعي بالمضادات الحيوية والمعقمات",
        titleEn: "Antimicrobial Pocket Irrigation",
        descAr: "غسيل الجيوب بمحاليل مطهرة تعيد التوازن الحيوي وتسرع التئام الأنسجة.",
        descEn: "Flushing pockets with antiseptic and bio-stabilizing solutions promoting healing.",
      },
      {
        step: 4,
        titleAr: "بروتوكول المتابعة والوقاية المنزلية",
        titleEn: "Maintenance Protocol & Review",
        descAr: "إعادة قياس الجيوب بعد عدة أسابيع للتأكد من التئام اللثة وثبات الأسنان التام.",
        descEn: "Post-healing re-evaluation ensuring pocket reduction and tissue firmness.",
      },
    ],
    faqs: [
      {
        qAr: "هل يمكن الشفاء من التهاب اللثة تماماً؟",
        qEn: "Can gingivitis be cured completely?",
        aAr: "نعم، إذا عولج الالتهاب في مراحله الأولى مع الالتزام بتعليمات الطبيب، تعود اللثة صحية ووردية تماماً.",
        aEn: "Yes, early-stage gingivitis is completely reversible with professional debridement and sound home hygiene.",
      },
    ],
  },
  {
    id: "extraction-surgery",
    slug: "extraction-surgery",
    category: "surgery",
    iconName: "Scissors",
    title: {
      ar: "خلع الأسنان وجراحة الفم الصغرى",
      en: "Extraction & Oral Surgery",
    },
    shortDesc: {
      ar: "خلع بسيط للأسنان التالفة وجراحة ضروس العقل المدفونة بأحدث أساليب التخدير الموضعي اللطيف.",
      en: "Atraumatic tooth extractions and surgical wisdom tooth removals with gentle local anesthesia.",
    },
    fullDesc: {
      ar: "إجراءات جراحية دقيقة لخلع الأسنان الميؤوس من علاجها أو ضروس العقل المطمورة جزئياً أو كلياً في عظام الفك، مع الحفاظ على عظام السن وتهيئتها للزراعة المستقبلية، باتباع أقصى معايير التعقيم والراحة.",
      en: "Precision atraumatic extraction procedures preserving socket bone architecture for future implants, alongside surgical extraction of impacted third molars with comfort-focused technique and clear aftercare.",
    },
    duration: { ar: "٢٠ - ٤٥ دقيقة", en: "20 - 45 mins" },
    recommendedFrequency: { ar: "إجراء جراحي محدد", en: "Surgical as needed" },
    whoNeedsIt: {
      ar: [
        "ضرس العقل المدفون المسبب لآلام الفك أو الصداع أو ضغط الأسنان",
        "الأسنان المتكسرة تحت مستوى اللثة التي لا يمكن ترميمها",
        "التسوس الشديد الواصل لعظام الجذر متجاوزاً إمكانية علاج العصب",
        "تجهيزات التقويم التي تتطلب خلعاً لتوفير مساحة لتعديل الأسنان",
      ],
      en: [
        "Impacted wisdom teeth causing jaw pain, recurrent pericoronitis, or crowding",
        "Severely fractured teeth extending subgingivally beyond repair",
        "Irreparable root decay where endodontic treatment is not feasible",
        "Prescribed orthodontic extractions to alleviate severe dental crowding",
      ],
    },
    procedureSteps: [
      {
        step: 1,
        titleAr: "التصوير الشعاعي وتقييم مسار العصب",
        titleEn: "Radiographic Nerve Pathway Mapping",
        descAr: "دراسة موقع الجذور وقربها من العصب الحسي لضمان أقصى درجات الأمان.",
        descEn: "Accurate mapping of tooth roots relative to inferior alveolar nerve structures.",
      },
      {
        step: 2,
        titleAr: "التخدير الموضعي الفعال وغير المؤلم",
        titleEn: "Deep Local Analgesia",
        descAr: "تطبيق جل موضعي مسبق ثم تخدير المنطقة بالكامل لضمان عدم الإحساس بأي ألم.",
        descEn: "Topical pre-numbing followed by complete neural block anesthesia.",
      },
      {
        step: 3,
        titleAr: "الخلع المحافظ على العظم (Atraumatic)",
        titleEn: "Atraumatic Bone-Preserving Extraction",
        descAr: "خلع السن برفق متناهٍ لتجنب أي ضرر لعظام الفك المحيطة وتسهيل الالتئام.",
        descEn: "Careful luxation utilizing micro-periotomes preserving cortical socket plates.",
      },
      {
        step: 4,
        titleAr: "تعقيم الجرح ووضع إرشادات ما بعد الخلع",
        titleEn: "Hemostasis & Post-Op Recovery Care",
        descAr: "تنظيف مكان الخلع ووضع شاش معقم وتزويد المريض بتعليمات الراحة وتناول المسكن.",
        descEn: "Sterile socket cleansing, gentle suture if needed, and clear post-op instructions.",
      },
    ],
    faqs: [
      {
        qAr: "كم يستغرق التعافي بعد خلع ضرس العقل؟",
        qEn: "How long does recovery take after wisdom tooth removal?",
        aAr: "يعود معظم المرضى لنشاطهم الطبيعي خلال يوم إلى يومين، ويلتئم الجرح تماماً خلال أسبوع بإذن الله.",
        aEn: "Most patients return to regular routine within 24-48 hours, with full soft tissue healing in 7 days.",
      },
    ],
  },
  {
    id: "dental-emergency",
    slug: "dental-emergency",
    category: "emergency",
    iconName: "PhoneCall",
    title: {
      ar: "طوارئ وإسعاف الأسنان",
      en: "Dental Emergency Care",
    },
    shortDesc: {
      ar: "استقبال الحالات الطارئة والآلام الحادة والكسور المفاجئة في أسرع وقت لتخفيف الألم الفوري.",
      en: "Rapid acute pain relief, trauma response, and emergency stabilization during clinic hours.",
    },
    fullDesc: {
      ar: "نكرس أولوية فورية للحالات العاجلة وآلام الأسنان الحادة المفاجئة، سواء الناتجة عن التهاب عصب متقدم أو كسر سن في حادث أو نزيف مفاجئ، لتقديم الإغاثة الطبية السريعة والسيطرة على الألم فور وصولك.",
      en: "Priority same-day emergency triage for acute dental agony, dental trauma, knocked-out teeth, or uncontrollable swelling, providing immediate pain relief and clinical stabilization.",
    },
    duration: { ar: "أولوية فورية", en: "Immediate priority" },
    recommendedFrequency: { ar: "عند الطوارئ", en: "Emergency basis" },
    whoNeedsIt: {
      ar: [
        "ألم أسنان لا يطاق لا يستجيب لأقوى المسكنات",
        "كسر سن أمامي مفاجئ أو سقوط سن بالكامل نتيجة صدمة",
        "انتفاخ مفاجئ في الوجه أو الخد مصحوب بارتفاع حرارة",
        "نزيف مستمر في اللثة بعد إجراء جراحي أو خلع",
        "سقوط حشو أو تاج أمامي يسبب ألماً أو إحراجاً شديداً",
      ],
      en: [
        "Excruciating, unmanageable toothache unresponsive to medication",
        "Knocked-out (avulsed) or severely broken tooth due to accident",
        "Rapid facial swelling or dental abscess accompanied by fever",
        "Persistent post-operative bleeding that does not stop with gauze",
        "Lost crown or filling exposing raw sensitive nerve in a visible tooth",
      ],
    },
    procedureSteps: [
      {
        step: 1,
        titleAr: "الاستقبال الفوري وتسكين الألم",
        titleEn: "Immediate Triage & Rapid Pain Relief",
        descAr: "تشخيص سريع لمصدر الألم وتقديم التدخل المسكن أو التخديري الموضعي فوراً.",
        descEn: "Urgent diagnostic check followed by immediate local anesthesia to stop pain.",
      },
      {
        step: 2,
        titleAr: "تصوير الأشعة وتحديد سبب الطارئ",
        titleEn: "Emergency Radiographic Assessment",
        descAr: "تصوير السن المصاب بدقة لمعرفة مدى تضرر العصب أو العظم أو الجذور.",
        descEn: "Targeted digital x-ray evaluating bone, root structure, or nerve involvement.",
      },
      {
        step: 3,
        titleAr: "الإجراء الإسعافي العاجل",
        titleEn: "Acute Stabilization Procedure",
        descAr: "فتح السن لتصريف الضغط أو تثبيت السن المتحرك أو وضع حشو مسكن مؤقت.",
        descEn: "Pulp extirpation, trauma splinting, or temporary soothing dressing placement.",
      },
      {
        step: 4,
        titleAr: "وصف الأدوية وتحديد موعد الاستكمال",
        titleEn: "Prescription & Definitive Appointment",
        descAr: "كتابة المسكن والمضاد الحيوي المناسب وترتيب موعد لاستكمال العلاج بهدوء.",
        descEn: "Tailored antibiotic/analgesic prescription and scheduled continuation visit.",
      },
    ],
    faqs: [
      {
        qAr: "ماذا أفعل إذا سقط سني بالكامل نتيجة صدمة؟",
        qEn: "What should I do if a tooth is completely knocked out?",
        aAr: "أمسك السن من التاج وليس الجذر، واشطفه بماء خفيف دون فرك، ثم ضعه في كأس حليب بارد وتوجه إلى العيادة فوراً خلال ساعة.",
        aEn: "Hold the tooth by its crown, never touch the root. Rinse gently without scrubbing, store it in cold milk, and visit the clinic within 60 minutes for potential re-implantation.",
      },
    ],
  },
];

export function getServiceBySlug(slug) {
  return SERVICES.find((s) => s.slug === slug) || SERVICES[0];
}
