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

---

## 3. آلية منع الحجز المزدوج وحماية خصوصية المرضى (Architecture)
1. **منع الحجز المزدوج دون SQL:**
   - تستخدم المنصة مجموعة `slots` بحيث يحمل كل حجز معرفاً حتمياً لكل فترة ٣٠ دقيقة: `${doctorId}_${YYYY-MM-DD}_${HHmm}`.
   - تتم عملية الحجز ومعاملات التعديل والإلغاء عبر معاملات ذرية `runTransaction` في Firestore تفحص خلو كافة الفترات قبل الإنشاء دفعة واحدة.
2. **فصل بيانات المرضى وبوابة المريض الذاتية:**
   - بيانات المرضى في `appointments/{id}` محجوبة بالكامل عن الاستعلامات العامة ومحصورة لكادر العيادة المصرح له فقط.
   - للمرضى، يتم توليد رمز أمان سري طويل `manageToken` (أكثر من 20 حرفاً عشوائياً مشفراً) يُخزن في `bookingLookup/{manageToken}` بدون رقم الهاتف الصريح. يتيح الرابط المباشر للمريض مراجعة أو تعديل أو إلغاء موعده دون حاجة لإنشاء حساب أو كلمة مرور.

---

## 4. توصيات الأمان والحماية (Security Recommendations)
1. **عدم رفع أي ملفات سرية:** لا تقم برفع ملف `.env` إطلاقاً إلى مستودعات Git العامة؛ تم تضمين `.env` تلقائياً في ملف `.gitignore`.
2. **إدارة المشرفين:** لا يمكن تعديل وثائق `admins` من واجهة العميل إطلاقاً؛ تضاف الصلاحيات حصرياً عبر كونسول Firebase لضمان أعلى درجات الأمان.
3. **خطة الترقية المستقبلية:** يرجى العلم بأن استخدام `manageToken` هو الحل الأكثر أماناً على باقة Spark المجانية بدون خادم خلفي. للانتقال إلى نظام التحقق التام عبر الرسائل النصية القصيرة OTP، يمكن الترقية إلى باقة Blaze وتفعيل Firebase Cloud Functions.
