# Hayaah Dental Clinic - Admin & Backend Setup Guide
# دليل تشغيل لوحة الإدارة وقاعدة البيانات السحابية

---

## 1. نظرة عامة (Overview)
تم بناء المنصة بطبقة بيانات موحدة تدعم وضعين للتشغيل:

### أ) وضع العرض التجريبي (Demo Mode - الافتراضي)
- **آلية العمل:** يعمل الموقع بالكامل دون الحاجة لأي خادم خلفي أو قاعدة بيانات سحابية.
- **تخزين البيانات:** النصوص والإعدادات وسجل التعديلات تُحفظ في `localStorage`، بينما تُحفظ صور المرضى والعيادة المرفوعة في قاعدة بيانات المتصفح `IndexedDB` لتفادي قيود الحجم.
- **تسجيل الدخول التجريبي:** دخول مباشر بنقرة واحدة من صفحة `/admin/login` بأربعة أدوار مختلفة:
  1. **مالك العيادة (Owner):** صلاحيات كاملة، قائمة الجاهزية للإطلاق، استعادة النسخ وإعادة الضبط.
  2. **مسؤول المحتوى (Content Editor):** تحرير الخدمات والمقالات والأسئلة الشائعة واستبدال الصور.
  3. **موظف الاستقبال (Receptionist):** مخصص حصرياً لصندوق طلبات المواعيد وتحديث الحالات والاتصال بالمرضى.
  4. **زائر تجريبي (Demo Viewer):** تصفح لوحة التحكم بوضع القراءة فقط دون تعديل.

---

## 2. التحويل إلى الوضع الحي (Live Mode مع Supabase)
عند الرغبة في ربط الموقع بقاعدة بيانات Postgres وتخزين سحابي مع توثيق حقيقي:

### الخطوة 1: إنشاء مشروع Supabase مجاني
1. اذهب إلى [https://supabase.com](https://supabase.com) وأنشئ حساباً جديداً.
2. انقر على **New Project** واختر اسم المشروع (مثلاً: `hayaah-dental`).
3. اختر منطقة الاستضافة الأقرب لمصر (مثل Frankfurt أو London).

### الخطوة 2: تشغيل كود إنشاء الجداول وتأمين الصلاحيات (SQL Schema)
افتح **SQL Editor** داخل لوحة Supabase والصق الكود التالي واضغط **Run**:

```sql
-- 1. جدول إعدادات الموقع
CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  demo_mode BOOLEAN DEFAULT false,
  show_prices BOOLEAN DEFAULT false,
  show_before_after BOOLEAN DEFAULT false,
  show_announcement BOOLEAN DEFAULT false,
  announcement_text JSONB,
  primary_color TEXT DEFAULT '#0c6674',
  secondary_color TEXT DEFAULT '#2ca49a',
  noindex BOOLEAN DEFAULT true,
  data_version INT DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. جدول بيانات العيادة ومواعيد العمل
CREATE TABLE IF NOT EXISTS clinic_info (
  id INT PRIMARY KEY DEFAULT 1,
  name JSONB NOT NULL,
  tagline JSONB NOT NULL,
  phone TEXT NOT NULL,
  emergency_phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  address JSONB NOT NULL,
  map_directions_url TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  regular_hours JSONB NOT NULL,
  disclaimer JSONB NOT NULL,
  emergency_notice JSONB NOT NULL
);

-- 3. جدول طلبات حجز المواعيد
CREATE TABLE IF NOT EXISTS appointment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  preferred_date TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'new',
  internal_notes TEXT,
  contacted_at TIMESTAMP WITH TIME ZONE,
  is_demo_submission BOOLEAN DEFAULT false
);

-- 4. جدول الخدمات السريرية
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title JSONB NOT NULL,
  category TEXT NOT NULL,
  short_desc JSONB NOT NULL,
  full_desc JSONB,
  duration JSONB,
  starting_price NUMERIC,
  is_confirmed BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  "order" INT DEFAULT 1
);

-- 5. جدول كادر الأطباء
CREATE TABLE IF NOT EXISTS doctors (
  id TEXT PRIMARY KEY,
  name JSONB NOT NULL,
  title JSONB NOT NULL,
  specialty JSONB NOT NULL,
  bio JSONB NOT NULL,
  languages TEXT[],
  credentials JSONB[],
  photo_url TEXT,
  is_real_photo BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  "order" INT DEFAULT 1
);

-- تأمين حماية البيانات (Row Level Security - RLS)
ALTER TABLE appointment_requests ENABLE ROW LEVEL SECURITY;

-- السماح للجمهور بإرسال طلب الموعد فقط
CREATE POLICY "Public can insert appointment requests"
  ON appointment_requests FOR INSERT
  WITH CHECK (true);

-- منع قراءة الطلبات إلا للموظفين المسجلين
CREATE POLICY "Only authenticated staff can view appointment requests"
  ON appointment_requests FOR SELECT
  USING (auth.role() = 'authenticated');

-- السماح للموظفين بتحديث حالات الملاحظات
CREATE POLICY "Only authenticated staff can update appointment requests"
  ON appointment_requests FOR UPDATE
  USING (auth.role() = 'authenticated');
```

### الخطوة 3: إنشاء مستودع تخزين الصور (Storage Bucket)
1. في لوحة تحكم Supabase، ادخل على **Storage**.
2. أنشئ مستودعاً جديداً باسم: `clinic-media`.
3. اضبط خيار **Public bucket** على مفعّل (Enabled).

### الخطوة 4: توصيل المتغيرات البيئية
في ملف البيئة `.env` محلياً أو في إعدادات استضافة Vercel:
```bash
VITE_DEMO_MODE=false
VITE_SITE_URL=https://hayaah-dental.vercel.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

---

## 3. توصيات الأمان والحماية (Security Recommendations)
1. **تفعيل التحقق بخطوتين (MFA / 2FA):** نوصي مالك العيادة بشدة بتفعيل المصادقة الثنائية عبر تطبيق Google Authenticator على حساب Supabase والبريد الإلكتروني للعيادة.
2. **عدم رفع أي ملفات سرية:** لا تقم برفع ملف `.env` إطلاقاً إلى مستودعات Git العامة؛ تم تضمين `.env` تلقائياً في ملف `.gitignore`.
3. **حماية بيانات المرضى:** لا يتم إرسال أو تسجيل أي معلومات طبية أو تشخيصية في النموذج وفقاً لمعايير تقليل البيانات (Data Minimization).

---

## 4. خطوات النشر على Vercel (Deployment)
1. اربط مستودع GitHub بحسابك على [Vercel](https://vercel.com).
2. اختر إطار العمل: **Vite**.
3. أضف المتغير البيئي `VITE_SITE_URL` مع رابط النطاق الخاص بك.
4. اضغط **Deploy**.
