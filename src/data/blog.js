/**
 * BLOG DATA — Educational Dental Care Articles
 * Original, medically conservative educational content (AR + EN).
 * // TODO: review by clinic before publishing.
 */

import blog1 from '../assets/blogs/1.png';
import blog2 from '../assets/blogs/2.png';
import blog3 from '../assets/blogs/3.png';
import blog4 from '../assets/blogs/4.png';
import blog5 from '../assets/blogs/5.png';
import blog6 from '../assets/blogs/6.png';

export const BLOG_POSTS = [
  {
    id: "brushing-technique",
    slug: "correct-brushing-technique",
    category: { ar: "وقاية وعناية", en: "Oral Hygiene" },
    title: {
      ar: "الطريقة الصحيحة لتنظيف الأسنان بالفرشاة والخيط الطبي",
      en: "The Gold Standard for Brushing & Flossing Your Teeth",
    },
    excerpt: {
      ar: "تعرف على الطريقة المعتمدة من أطباء الأسنان لتنظيف الأسنان بفاعلية دون تجريح اللثة أو كشط طبقة المينا.",
      en: "Learn the dentist-recommended technique to clean teeth effectively without damaging delicate gums or enamel.",
    },
    readingTime: { ar: "٣ دقائق قراءة", en: "3 min read" },
    date: { ar: "١٢ أكتوبر ٢٠٢٤", en: "Oct 12, 2024" },
    image: blog1,
    content: {
      ar: `
### لماذا لا تكفي الطريقة التقليدية السريعة؟
يعتقد الكثيرون أن تنظيف الأسنان بقوة وبحركات أفقية عنيفة يمنح نظافة أكبر، لكن الحقيقة الطبية تؤكد أن الفرك الأفقي القوي قد يؤدي مع الوقت إلى انحسار اللثة وكشف جذور الأسنان الحساسة وتآكل عنق السن.

### قاعدة الدقيقتين وزاوية 45 درجة
1. **الزاوية المثالية:** ضع شعيرات فرشاة الأسنان بزاوية 45 درجة باتجاه خط اللثة.
2. **الحركة الدائرية اللطيفة:** نظف بحركات دائرية اهتزازية قصيرة، بحيث تتحرك الفرشاة من اللثة باتجاه حافة السن (من الوردي إلى الأبيض).
3. **تنظيف أسطح المضغ:** نظف الأسطح العريضة للأضراس بحركات خفيفة للأمام والخلف.
4. **الأسطح الداخلية:** لا تهمل الأسطح الداخلية للأسنان الأمامية العلوية والسفلية، وجّه الفرشاة رأسياً واستخدم ضربات لطيفة إلى الخارج.
5. **تنظيف اللسان:** تنظيف سطح اللسان بلطف بالفرشاة أو بمكشطة اللسان يزيل كميات كبيرة من بكتيريا الفم ويحافظ على رائحة الفم منعشة.

### أهمية الخيط الطبي اليومي
فرشاة الأسنان تصل فقط إلى 60% من أسطح الأسنان، بينما تظل الفراغات الضيقة بين الأسنان بيئة خصبة لتراكم البلاك والتسوس الخفي. استخدام الخيط المائي أو الخيط الطبي الشمعي مرة واحدة يومياً قبل النوم يحمي اللثة من الالتهابات العميقة.
      `,
      en: `
### Why Aggressive Brushing Harms More Than It Helps
Many people believe that vigorous, horizontal scrubbing yields cleaner teeth. In reality, aggressive brushing can cause permanent gum recession, root surface exposure, and severe tooth sensitivity.

### The 2-Minute, 45-Degree Technique
1. **The Crucial Angle:** Angle the bristles at 45 degrees towards the gumline.
2. **Gentle Circular Motion:** Use short, vibrating circular strokes moving from pink gum tissue toward the white crown.
3. **Chewing Surfaces:** Brush the occlusal surfaces of molars with gentle back-and-forth passes.
4. **Inner Surfaces:** Do not neglect inner surfaces of front teeth; tilt the brush vertically and make several gentle up-and-down strokes.
5. **Tongue Hygiene:** Gently brush the tongue to eliminate oral sulfur-producing bacteria.

### The Indispensable Role of Dental Floss
Toothbrushes reach only about 60% of tooth surfaces. The interdental spaces remain vulnerable to hidden plaque and interproximal cavities. Daily flossing before bedtime protects periodontal health.
      `,
    },
  },
  {
    id: "when-to-see-dentist",
    slug: "when-to-visit-dentist",
    category: { ar: "صحة الفم", en: "Dental Health" },
    title: {
      ar: "علامات تحذيرية تستدعي زيارة طبيب الأسنان فوراً",
      en: "Critical Warning Signs You Should Never Ignore",
    },
    excerpt: {
      ar: "لا تنتظر حتى يصبح الألم لا يطاق. علامات مبكرة تخبرك أن أسنانك بحاجة لفحص متخصص قبل تفاقم المشكلة.",
      en: "Do not wait until the pain becomes unbearable. Early signals that mean you need a timely professional check-up.",
    },
    readingTime: { ar: "٤ دقائق قراءة", en: "4 min read" },
    date: { ar: "٢٨ سبتمبر ٢٠٢٤", en: "Sep 28, 2024" },
    image: blog2,
    content: {
      ar: `
### لا تجعل الألم هو دليلك الوحيد
من الأخطاء الشائعة تأجيل زيارة عيادة الأسنان حتى ظهور ألم شديد. غالباً ما يبدأ تسوس الأسنان وأمراض اللثة بصمت تام ودون أدنى ألم في المراحل الأولى التي يسهل علاجها بتكلفة وجهد بسيطين.

### أهم 5 علامات تستدعي الفحص الفوري:
1. **نزيف اللثة عند التفريش:** اللثة الصحية السليمة لا تنزف أبداً. النزيف علامة مؤكدة على وجود التهاب جيري يتطلب جلسة تنظيف.
2. **الحساسية المفاجئة للحرارة أو البرودة:** الشعور بلسعة حادة مستمرة بعد المشروبات الساخنة أو الباردة يشير إلى انكشاف العاج أو تسوس متقدم.
3. **تغير رائحة الفم أو مذاق غير مستحب:** استمرار الرائحة غير المرغوبة رغم التفريش قد يعود لوجود جيب لثوي عميق أو ضرس متسوس خلفي.
4. **ألم أو طقطقة في مفصل الفك:** الشعور بألم عند فتح الفم أو أثناء المضغ أو الصداع الصباحي قد يكون علامة على صرير الأسنان الليلي.
5. **خشونة أو كسر بسيط في حافة السن:** تكسر جزء صغير يسهل تجمع الأطعمة وقد يتسع سريعاً إذا لم يُرمم بحشوة تجميلية.
      `,
      en: `
### Do Not Let Pain Be Your Only Guide
One of the most frequent misconceptions is postponing dental appointments until acute agony arrives. Cavities and gum disease develop silently in their earliest stages, when treatment is simple and conservative.

### 5 Critical Indicators for a Check-Up:
1. **Bleeding Gums:** Healthy gums never bleed. Persistent bleeding is a direct sign of gingival inflammation.
2. **Lingering Temperature Sensitivity:** Sharp twinges lingering after hot soup or iced water signal dentin exposure or deep decay.
3. **Chronic Bad Breath or Taste:** Halitosis resisting normal brushing frequently indicates bacterial pockets.
4. **TMJ Clicking or Morning Jaw Ache:** Discomfort or clicking sounds when chewing may stem from nocturnal teeth grinding (bruxism).
5. **Rough Edges or Chipped Enamel:** Even minor enamel fractures create food traps that rapidly enlarge if left unrestored.
      `,
    },
  },
  {
    id: "whitening-myths",
    slug: "teeth-whitening-facts-and-myths",
    category: { ar: "تجميل الأسنان", en: "Aesthetic Dentistry" },
    title: {
      ar: "حقائق وخرافات شائعة حول تبييض الأسنان بالعيادة والمنزل",
      en: "Teeth Whitening Myths vs. Medical Realities",
    },
    excerpt: {
      ar: "هل الفحم والليمون يبيضان الأسنان حقاً؟ وما هو الفارق العلمي بين التبييض الطبي والوصفات المنزلية الضارة؟",
      en: "Does lemon or charcoal truly whiten teeth safely? What science reveals about professional vs. home remedies.",
    },
    readingTime: { ar: "٤ دقائق قراءة", en: "4 min read" },
    date: { ar: "١٥ سبتمبر ٢٠٢٤", en: "Sep 15, 2024" },
    image: blog3,
    content: {
      ar: `
### الخرافة الأولى: الفحم النشط والليمون يبيضان الأسنان بأمان
**الحقيقة الطبية:** الوصفات الشائعة مثل فرك الأسنان ببيكربونات الصوديوم أو الليمون أو بودرة الفحم تزيل جزءاً من التصبغات عبر كشط طبقة المينا الخارجية! هذا الكشط يؤدي إلى ترقق المينا وظهور طبقة العاج الصفراء تحتها، مما يجعل الأسنان أكثر اصفراراً وحساسية على المدى الطويل.

### الخرافة الثانية: التبييض الطبي بالعيادة يضعف بنية الأسنان
**الحقيقة الطبية:** أجهزة التبييض المعتمدة والجل الطبي المستخدم في العيادة يعملان على تفكيك جزيئات التصبغ العميقة كيميائياً بالأكسجين النشط دون أي تأثير على البنية البلورية للمينا.

### نصائح للحفاظ على بياض الابتسامة:
- شرب الماء مباشرة بعد القهوة أو الشاي للمساعدة في تقليل تراكم الصبغات.
- استخدام الشفاط (Straw) عند تناول المشروبات الغازية أو العصائر الملونة.
- الالتزام بجلسة تنظيف الجير والتلميع كل 6 أشهر لإزالة الرواسب السطحية أولاً بأول.
      `,
      en: `
### Myth 1: Charcoal & Lemon Safely Whiten Teeth
**Medical Reality:** Abrasive DIY hacks like baking soda, lemon juice, or coarse charcoal whiten teeth temporarily by scratching away protective enamel. Once thin enamel erodes, yellow dentin beneath becomes visible, worsening discoloration permanently.

### Myth 2: In-Clinic Whitening Damages Tooth Structure
**Medical Reality:** Regulated dental whitening gels penetrate enamel micro-pores to oxidize chromogenic pigments chemically without altering the mineral crystalline structure of the tooth.

### Pro-Tips to Prolong Your White Smile:
- Rinse with water promptly after consuming espresso, black tea, or red sauces.
- Use reusable straws when sipping acidic or colored beverages.
- Keep up with bi-annual scaling and polishing visits.
      `,
    },
  },
  {
    id: "children-teeth-care",
    slug: "caring-for-children-teeth",
    category: { ar: "أسنان الأطفال", en: "Pediatric Care" },
    title: {
      ar: "دليل الآباء للعناية بأسنان الأطفال منذ سن الرضاعة",
      en: "The Parents' Guide to Lifelong Pediatric Dental Health",
    },
    excerpt: {
      ar: "كيف تحمي أسنان طفلك اللبنية من التسوس المبكر وتصنع له تجربة مريحة وممتعة عند زيارة الطبيب.",
      en: "How to safeguard primary milk teeth from early decay and ensure stress-free visits to the dental clinic.",
    },
    readingTime: { ar: "٣ دقائق قراءة", en: "3 min read" },
    date: { ar: "٠٢ سبتمبر ٢٠٢٤", en: "Sep 02, 2024" },
    image: blog4,
    content: {
      ar: `
### لماذا تعتبر أسنان الحليب مهمة جداً؟
يعتقد البعض أن أسنان الحليب ليست مهمة لأنها ستتبدل في النهاية. هذا مفهوم خاطئ للغاية، فأسنان الحليب مسؤولة عن:
- القدرة على مضغ الطعام والتغذية السليمة لنمو الطفل.
- النطق الصحيح وتطور مخارج الحروف.
- الحفاظ على المسافات الدقيقة لظهور الأسنان الدائمة دون تزاحم.

### متى نبدأ تنظيف فم الرضيع؟
حتى قبل ظهور الأسنان، يوصى بمسح لثة الرضيع بقطعة شاش مبللة بماء فاتر بعد الرضاعة. ومع بزوغ أول سن (حوالي 6 أشهر)، استخدم فرشاة ناعمة مخصصة للرضع مع مسحة دقيقة للغاية من معجون أسنان الأطفال.

### احذر تسوس زجاجة الرضاعة
نوم الطفل وفي فمه زجاجة الحليب أو العصائر المحلاة يعرض أسنانه للأحماض والسكريات طوال ساعات الليل، وهو السبب الأول لتسوس الأسنان الأمامية المبكر.
      `,
      en: `
### Why Milk Teeth Matter More Than You Think
It is tempting to view baby teeth as temporary placeholders. However, primary teeth are foundational for:
- Proper chewing efficiency and child nutrition.
- Clear speech and consonant pronunciation development.
- Guiding permanent adult teeth into straight alignment.

### Starting Oral Care from Infancy
Even before teeth appear, gently wipe infant gums with sterile damp gauze. With the first tooth emergence, adopt an ultra-soft infant brush and a smear of age-appropriate toothpaste.

### Beware of Baby Bottle Cavities
Putting a toddler to bed with a bottle containing milk or juice bathes teeth in sugars all night, causing aggressive early childhood caries.
      `,
    },
  },
  {
    id: "dental-emergency-guide",
    slug: "what-to-do-in-dental-emergency",
    category: { ar: "إسعافات أولية", en: "Emergency Dental" },
    title: {
      ar: "الإسعافات الأولية لحالات طوارئ وكسور الأسنان",
      en: "First Aid for Dental Emergencies & Tooth Trauma",
    },
    excerpt: {
      ar: "خطوات حاسمة وسريعة تنقذ سنك في حال السقوط الكامل أو الكسر المفاجئ قبل الوصول إلى العيادة.",
      en: "Crucial, immediate actions to save a knocked-out or fractured tooth before reaching the clinic.",
    },
    readingTime: { ar: "٣ دقائق قراءة", en: "3 min read" },
    date: { ar: "١٨ أغسطس ٢٠٢٤", en: "Aug 18, 2024" },
    image: blog5,
    content: {
      ar: `
### التصرف السليم في اللحظات الأولى يصنع الفارق
الحوادث المفاجئة والسقوط قد يعرضان الأسنان لكسر مفاجئ أو خروج كامل من عظم الفك. إليك الخطوات الطبية السليمة للتعامل مع الموقف:

### 1. في حال سقوط السن بالكامل (Avulsion):
- **امسك السن من التاج الأبيض فقط:** إياك ولمس جذر السن لتفادي إتلاف الألياف الحيوية الدقيقة.
- **اشطف السن بلطف:** إذا كان متسخاً، مرره تحت ماء بارد جارٍ لثوانٍ معدودة دون فركه أو استخدام صابون.
- **حفظ السن في الحليب البارد:** ضع السن في كأس حليب بارد أو داخل الفم بجانب الخد إن كان المريض بالغاً وواعياً.
- **التوجه فوراً للعيادة:** الساعات الأولى (خاصة أول 60 دقيقة) تتيح فرصة هائلة لإعادة تثبيت السن واندماجه مجدداً!

### 2. في حال كسر جزء من السن:
- اجمع الأجزاء المكسورة واحفظها في علبة نظيفة بقطرات ماء أو حليب.
- مضمض الفم بماء دافئ للتخلص من أي شوائب، وضع كمادة باردة على الخد لتقليل الانتفاخ.
      `,
      en: `
### Minutes Count When Trauma Strikes
Sports accidents and unexpected falls can fracture or fully avulse a tooth. Following proper clinical protocols immediately gives the best chance of saving the natural tooth.

### 1. Completely Knocked-Out (Avulsed) Tooth:
- **Hold by the Crown Only:** Never touch the delicate root cells.
- **Gentle Rinse:** If soiled, briefly rinse under cool water without scrubbing.
- **Store in Cold Milk:** Milk provides the ideal pH balance and osmolality to preserve periodontal ligament cells.
- **Seek Emergency Care Immediately:** Re-implantation within 60 minutes yields maximum clinical success.

### 2. Fractured or Chipped Tooth:
- Retrieve broken fragments and preserve them moist.
- Rinse the mouth with warm water and apply an external cold pack to minimize soft tissue swelling.
      `,
    },
  },
  {
    id: "after-implant-care",
    slug: "caring-for-dental-implants",
    category: { ar: "زراعة الأسنان", en: "Implantology" },
    title: {
      ar: "إرشادات ما بعد زراعة الأسنان لضمان استدامة الغرسات مدى الحياة",
      en: "Post-Operative Care for Long-Lasting Dental Implants",
    },
    excerpt: {
      ar: "كيف تحافظ على غرسات التيتانيوم وتمنع التهاب الأنسجة المحيطة بالزرعة لتتمتع بابتسامة قوية لسنوات طويلة.",
      en: "Essential hygiene practices to safeguard titanium implants from peri-implantitis for life.",
    },
    readingTime: { ar: "٤ دقائق قراءة", en: "4 min read" },
    date: { ar: "٠٥ أغسطس ٢٠٢٤", en: "Aug 05, 2024" },
    image: blog6,
    content: {
      ar: `
### زراعة الأسنان: استثمار دائم لابتسامتك
تتميز زراعة الأسنان بمعدلات استقرار عالية وموثوقية سريرية عالمياً، لكن استدامة هذا النجاح تعتمد بشكل جوهري على نظافة الفم الدورية والالتزام بالتعليمات الطبية.

### إرشادات الأيام الأولى بعد الجراحة:
1. **الراحة وتجنب المجهود البدني:** تجنب التمارين الشاقة أو الانحناء في أول 48 ساعة.
2. **الكمادات الباردة:** ضع كمادات باردة خارج الخد لدقائق متقطعة للمساعدة في منع التورم.
3. **الأطعمة اللينة:** تناول الأطعمة الدافئة واللينة (كالزبادي والشوربة) وابتعد عن الأطعمة الصلبة أو الحارة جداً.
4. **تجنب التدخين:** التدخين يقلل من تدفق الدم للثة ويعد العدو الأول لالتئام عظام الزراعة.

### العناية طويلة الأجل:
الزرعة كأي سن طبيعي تحتاج إلى تنظيف يومي بالفرشاة الناعمة واستخدام الخيط المائي لمنع تجمع البلاك على حواف التاج الزركوني، مع فحص دوري كل 6 أشهر بالعيادة.
      `,
      en: `
### Safeguarding Your Lifelong Dental Investment
Dental implants offer high clinical predictability and long-term stability. Protecting your investment requires disciplined oral hygiene to avoid peri-implant bacterial infections.

### Immediate Post-Surgical Phase:
1. **Rest:** Avoid vigorous exercise or strenuous activities for the initial 48 hours.
2. **Cold Compresses:** Apply intermittent external ice packs to minimize localized swelling.
3. **Soft Dietary Protocol:** Opt for gentle, nutrient-rich foods at room temperature.
4. **Strict Smoking Cessation:** Nicotine restricts micro-vascular perfusion, significantly hindering bone integration.

### Long-Term Maintenance:
Clean daily around the implant crown using soft-bristled brushes and interdental floss or water irrigators, supported by routine six-month professional maintenance checks.
      `,
    },
  },
];

export function getBlogPostBySlug(slug) {
  return BLOG_POSTS.find((p) => p.slug === slug) || BLOG_POSTS[0];
}
