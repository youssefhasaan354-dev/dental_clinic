# Hayaah Dental Clinic - Admin & Backend Setup Guide
# دليل تشغيل لوحة الإدارة وقاعدة البيانات السحابية (Firebase / Firestore)

---

## 1. نظرة عامة (Overview)
تم بناء المنصة بطبقة بيانات موحدة تدعم وضعين للتشغيل:

### أ) وضع العرض التجريبي (Demo Mode - الافتراضي)
- **آلية العمل:** يعمل الموقع بالكامل دون الحاجة لأي خادم خلفي أو قاعدة بيانات سحابية (Zero-Config).
- **تخزين البيانات:** النصوص والإعدادات وسجل التعديلات تُحفظ في `localStorage`، بينما تُحفظ صور المرضى والعيادة المرفوعة في قاعدة بيانات المتصفح `IndexedDB` لتفادي قيود الحجم.
- **تسجيل الدخول التجريبي:** دخول مباشر بنقرة واحدة من صفحة `/admin/login` بأربعة أدوار مختلفة:
  1. **مالك العيادة (Owner):** صلاحيات كاملة، قائمة الجاهزية للإطلاق، استعادة النسخ وإعادة الضبط.
  2. **مسؤول المحتوى (Content Editor):** تحرير الخدمات والمقالات والأسئلة الشائعة واستبدال الصور.
  3. **موظف الاستقبال (Receptionist):** مخصص حصرياً لصندوق طلبات المواعيد وتحديث الحالات والاتصال بالمرضى.
  4. **زائر تجريبي (Demo Viewer):** تصفح لوحة التحكم بوضع القراءة فقط دون تعديل.

---

## 2. التحويل إلى الوضع الحي (Live Production Mode مع Firebase)
عند الرغبة في ربط الموقع بقاعدة بيانات Firestore السحابية وتوثيق حقيقي عبر Firebase Auth:

### الخطوة 1: إنشاء مشروع Firebase جديد
1. اذهب إلى [Google Firebase Console](https://console.firebase.google.com) وأنشئ مشروعاً جديداً (مثلاً: `hayaah-dental`).
2. قم بتعطيل أو تمكين Google Analytics بحسب رغبتك.

### الخطوة 2: تفعيل قاعدة بيانات Cloud Firestore
1. من القائمة الجانبية في Firebase Console، اختر **Build -> Firestore Database**.
2. اضغط على **Create database**.
3. اختر وضع الإنتاج (**Start in production mode**).
4. اختر الموقع الجغرافي الأقرب للشرق الأوسط ومصر (مثلاً: `eur3` في أوروبا).

### الخطوة 3: تفعيل المصادقة (Firebase Authentication)
1. من القائمة الجانبية، اختر **Build -> Authentication**.
2. اضغط **Get started**.
3. في تبويب **Sign-in method**، فعّل خيار **Email/Password**.

### الخطوة 4: إنشاء مستخدم المشرف الأول وتحديد صلاحياته (First Admin Setup)
1. في تبويب **Users** داخل Authentication، اضغط **Add user**.
2. أدخل البريد الإلكتروني للمالك (مثلاً: `owner@hayaahclinic.com`) وكلمة مرور قوية.
3. انسخ المعرّف الفريد للمستخدم (**User UID**).
4. اذهب إلى **Firestore Database**، وأنشئ مجموعة باسم: `admins`.
5. أضف مستنداً جديداً بحيث يكون **Document ID** هو الـ `UID` المنسوخ بالضبط.
6. أضف الحقول التالية داخل المستند:
   - `role`: (string) بقيمة `"owner"`
   - `name`: (string) بقيمة `"د. مالك العيادة"`

> **ملاحظة أمنية هامة:** المنصة تطبق فحصاً صارماً في Firestore؛ أي مستخدم يسجل دخوله وليس لديه مستند في `admins/{uid}` بدور صالح (`owner`, `receptionist`, `editor`, `viewer`) سيتم رفض وصوله فوراً وتسجيل خروجه تلقائياً.

> **ملاحظة تشغيلية أساسية (تهيئة إعدادات الحجز):** بعد تسجيل دخول المالك لأول مرة، يرجى فتح صفحة إعدادات الحجز (**Booking Settings**) لمرة واحدة والضغط على حفظ (**Save**) لتأكيد حفظ إعدادات العيادة (`booking_settings/global`). / *After first owner login, open Booking Settings once and press Save.*

### الخطوة 5: نشر قواعد الأمان والفهارس (Security Rules & Indexes)
يمكنك نشر القواعد بإحدى طريقتين:

**الطريقة أ (عبر Firebase CLI):**
```bash
npm install -g firebase-tools
firebase login
firebase use --add  # اختر معرف مشروعك
firebase deploy --only firestore:rules,firestore:indexes
```

**الطريقة ب (نسخ ولصق عبر الكونسول):**
1. افتح تبويب **Rules** في Firestore، والصق محتوى ملف [firestore.rules](firestore.rules) واضغط **Publish**.
2. افتح تبويب **Indexes** في Firestore للتأكد من وجود فهارس الاستعلام المركبة الموضحة في [firestore.indexes.json](firestore.indexes.json).

### الخطوة 6: توصيل المتغيرات البيئية
من **Project Settings -> General** في Firebase Console، أنشئ تطبيق ويب (**Web App `</>`**) وانسخ بيانات الاتصال.
أضف المتغيرات الأربعة التالية في ملف `.env` محلياً وفي إعدادات استضافة **Vercel** (Environment Variables):

```bash
VITE_DEMO_MODE=false
VITE_SITE_URL=https://dentallclinic.vercel.app
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=hayaah-dental.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hayaah-dental
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
```

> **ملاحظة هامة:** وضع Firebase يتم تفعيله تلقائياً فقط عند توفر كافة المتغيرات الأربعة `VITE_FIREBASE_*`. في حال غياب أي متغير منها، يستمر التطبيق بالعمل في وضع Demo Mode الافتراضي.

### الخطوة 7: تفعيل حماية التطبيق Firebase App Check (اختياري / موصى به للإنتاج)
لحماية استعلامات Firestore من البوتات والهجمات العشوائية وحصرها على نطاق الموقع فقط:
1. **إنشاء مفاتيح reCAPTCHA (v3 أو Enterprise):**
   - **خيار reCAPTCHA v3 (الافتراضي):**
     - توجه إلى كونسول [Google reCAPTCHA](https://www.google.com/recaptcha/admin) وأنشئ مفتاحاً جديداً بنوع **reCAPTCHA v3**.
     - أضف نطاق العيادة (مثل `dentallclinic.vercel.app` و `localhost`).
     - انسخ مفتاح الموقع (**Site Key**) والمفتاح السري (**Secret Key**).
   - **خيار reCAPTCHA Enterprise (Fraud Defense):**
     - توجه إلى Google Cloud Console / reCAPTCHA Enterprise وأنشئ مفتاح موقع لنطاق التطبيق.
2. **تسجيل تطبيق الويب في Firebase Console (Register App):**
   - في كونسول Firebase، اذهب إلى القائمة الجانبية **Build -> App Check**.
   - في تبويب **Apps**، اختر تطبيق الويب الخاص بك واضغط **Register**.
   - **تنبيه هام:** يجب أن يتطابق نوع المزود المسجل هنا مع القيمة المحددة في المتغير `VITE_RECAPTCHA_PROVIDER`:
     - إذا اخترت **reCAPTCHA v3**، الصق المفتاح السري (**Secret Key**).
     - إذا اخترت **reCAPTCHA Enterprise** (أو Fraud Defense)، اختر مزود Enterprise واتبع خطوات الربط.
3. **توصيل مفاتيح App Check بالتطبيق:**
   - أضف المتغيرات التالية في إعدادات **Vercel** (أو ملف `.env`):
     ```bash
     VITE_RECAPTCHA_SITE_KEY=6Ld...site_key_here
     # اختياري: القيمة الافتراضية 'v3'، أو 'enterprise' عند استخدام reCAPTCHA Enterprise
     VITE_RECAPTCHA_PROVIDER=v3
     ```
   - **ملاحظة مطابقة المزود:** يجب أن تتطابق قيمة `VITE_RECAPTCHA_PROVIDER` (`v3` أو `enterprise`) تماماً مع ما تم تسجيله في:
     **Firebase Console > App Check > Apps (Fraud Defense / reCAPTCHA Enterprise vs reCAPTCHA v3)**.
   - عند توفر `VITE_RECAPTCHA_SITE_KEY` ووجود وضع Firebase قيد التشغيل:
     - إذا كانت القيمة `enterprise`، يقوم التطبيق تلقائياً عبر التحميل الديناميكي في `src/services/firebase/client.ts` باستيراد وتهيئة App Check عبر `ReCaptchaEnterpriseProvider`.
     - عدا ذلك (الافتراضي أو `v3`)، يتم استخدام `ReCaptchaV3Provider` كالسابق، مع تفعيل التحديث التلقائي للرموز (`isTokenAutoRefreshEnabled: true`).
     - في حال عدم تعيين `VITE_RECAPTCHA_SITE_KEY` أو إيقاف وضع Firebase، لا يتم تحميل أي حزم App Check نهائياً لضمان خفة التطبيق.
4. **المراقبة ثم الفرض الإلزامي (Monitor, then Enforce):**
   - في كونسول **App Check -> APIs**، راقب حركة استعلامات Firestore لبضعة أيام وتأكد من أن نسبة الطلبات الموثقة (**Verified requests**) تغطي الزوار الطبيعيين.
   - بعد الاطمئنان، اضغط على **Cloud Firestore** ثم اختر **Enforce** لغلق الباب نهائياً أمام أي طلب خارجي غير موثق.

---

## 3. آلية منع الحجز المزدوج وحماية خصوصية المرضى (Architecture)
1. **منع الحجز المزدوج دون SQL:**
   - تستخدم المنصة مجموعة `slots` بحيث يحمل كل حجز معرفاً حتمياً لكل فترة ٣٠ دقيقة: `${doctorId}_${YYYY-MM-DD}_${HHmm}`.
   - تتم عملية الحجز ومعاملات التعديل والإلغاء عبر معاملات ذرية `runTransaction` في Firestore تفحص خلو كافة الفترات قبل الإنشاء دفعة واحدة.
2. **فصل بيانات المرضى وبوابة المريض الذاتية:**
   - بيانات المرضى في `appointments/{id}` محجوبة بالكامل عن الاستعلامات العامة ومحصورة لكادر العيادة المصرح له فقط.
   - للمرضى، يتم توليد رمز أمان سري طويل `manageToken` (أكثر من 20 حرفاً عشوائياً مشفراً) يُخزن في `bookingLookup/{manageToken}` بدون رقم الهاتف الصريح. يتيح الرابط المباشر للمريض مراجعة أو تعديل أو إلغاء موعده دون حاجة لإنشاء حساب أو كلمة مرور.

---

## 4. هيكل مجموعات البيانات وفصل الجداول (Collections Architecture)
1. **فصل جدول مواعيد الأطباء عن المحتوى الترويجي (Doctor Schedules vs CMS Profiles):**
   - **`doctors/{doctorId}`:** مخصصة لبيانات الطبيب التعريفية في الموقع العام (الصورة، النبذة، المسمى المهني، الترتيب) ويحررها مسؤولو المحتوى والمالك (`editor`, `owner`).
   - **`doctor_schedules/{doctorId}`:** مجموعة جديدة مستقلة تماماً مخصصة لجدول حجز المواعيد وأيام وساعات العمل والاستراحات. يتم الربط بينهما تلقائياً بنفس المعرف `doctorId`. وتتم قراءتها علنياً لمعالج الحجز، وتعديلها حصرياً للمالك ومسؤول المحتوى.
   - يتم تهيئة `doctor_schedules` بالبيانات الأولية فقط إذا كانت المجموعة فارغة وكان المستخدم الحالي مالكاً (`owner`).
2. **التخزين المؤقت لتقليل قراءات Firestore (Client-Side Caching):**
   - تم تفعيل كاش ذكي محلي في المتصفح (`localStorage`) بمدة صلاحية ١٠ دقائق (TTL) للبيانات العامة (الإعدادات، معلومات العيادة، الخدمات، الأطباء، المقالات، التقييمات) لتقليص استهلاك حصة Firebase المجانية.
   - يتم تفريغ وتحديث الكاش تلقائياً وفورياً بمجرد قيام المشرف بأي عملية تعديل أو إضافة في لوحة التحكم.

---

## 5. اختبار قواعد الأمان السحابية (Security Rules Testing Checklist)

النظام مزود باختبارات مؤتمتة لقواعد الأمان تعمل عبر محاكي Firestore Emulator:
```bash
# تشغيل محاكي Firestore وإجراء الفحص الآلي لقواعد الأمان
npm run test:rules
```

### قائمة الفحص اليدوي لقواعد الأمان (Manual Security Rules Checklist):
| البند | السيناريو | النتيجة المتوقعة |
|---|---|---|
| **١. إلغاء المريض بالرابط** | مريض يحمل `manageToken` صالحاً يقوم بإلغاء موعده وتفريغ الفترات المحجوزة في معاملة واحدة | **نجاح (Allow)** وتتحول الحالة إلى `cancelled` وتحذف الـ slots |
| **٢. تعديل موعد المريض** | مريض يحمل `manageToken` يقوم بإعادة جدولة موعده إلى فترة شاغرة صالحة | **نجاح (Allow)** وتُنقل الـ slots وتحدث بيانات الحجز |
| **٣. محاولة تعديل دون رمز** | مستخدم مجهول يحاول تعديل مستند `appointments/{id}` أو تغيير اسم المريض أو ملاحظاته | **رفض تام (Permission Denied)** |
| **٤. تزوير فترات الحجز** | مستخدم مجهول يحاول حذف أو حجز مستند في `slots` لا يطابق الصيغة `${doctorId}_${date}_${HHmm}` أو بدون موعد متزامن | **رفض تام (Permission Denied)** |
| **٥. حجب الملاحظات الداخلية** | محاولة إنشاء حجز جديد في `appointments` يحتوي على الحقل الإداري `internalNotes` | **رفض تام (Permission Denied)** |
| **٦. سجلات النشاط الإداري** | محاولة إنشاء مستند في `activity_logs` من زائر غير مسجل في `admins` | **رفض تام (Permission Denied)**؛ مسموح فقط للكادر المسجل |
| **٧. حماية الصلاحيات** | محاولة حساب بدور `viewer` أو زائر تعديل جداول الأطباء `doctor_schedules` | **رفض تام (Permission Denied)**؛ مسموح فقط للـ `editor` والـ `owner` |

---

## 6. توصيات الأمان والحماية (Security Recommendations)
1. **عدم رفع أي ملفات سرية:** لا تقم برفع ملف `.env` إطلاقاً إلى مستودعات Git العامة؛ تم تضمين `.env` تلقائياً في ملف `.gitignore`.
2. **إدارة المشرفين:** لا يمكن تعديل وثائق `admins` من واجهة العميل إطلاقاً؛ تضاف الصلاحيات حصرياً عبر كونسول Firebase لضمان أعلى درجات الأمان.
3. **خطة الترقية المستقبلية:** يرجى العلم بأن استخدام `manageToken` هو الحل الأكثر أماناً على باقة Spark المجانية بدون خادم خلفي. للانتقال إلى نظام التحقق التام عبر الرسائل النصية القصيرة OTP، يمكن الترقية إلى باقة Blaze وتفعيل Firebase Cloud Functions.
