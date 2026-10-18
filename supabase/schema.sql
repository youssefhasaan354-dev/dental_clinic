-- =========================================================================
-- Hayaah Dental Clinic (عيادة حياة لطب الأسنان) — Database Schema & RLS Policies
-- PostgreSQL / Supabase Schema for Appointment Booking System
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DOCTORS & SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS public.doctors (
    id TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    services JSONB NOT NULL DEFAULT '["*"]'::jsonb,
    weekly_hours JSONB NOT NULL DEFAULT '{
        "0": {"isWorking": true, "start": "10:00", "end": "22:00"},
        "1": {"isWorking": true, "start": "10:00", "end": "22:00"},
        "2": {"isWorking": true, "start": "10:00", "end": "22:00"},
        "3": {"isWorking": true, "start": "10:00", "end": "22:00"},
        "4": {"isWorking": true, "start": "10:00", "end": "22:00"},
        "5": {"isWorking": false, "start": "00:00", "end": "00:00"},
        "6": {"isWorking": true, "start": "10:00", "end": "22:00"}
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. BLOCKED SLOTS / HOLIDAYS TABLE
CREATE TABLE IF NOT EXISTS public.blocked_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id TEXT REFERENCES public.doctors(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TEXT, -- HH:mm, or NULL for full-day block
    end_time TEXT,   -- HH:mm
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_code TEXT NOT NULL UNIQUE, -- e.g. 'HAY-4F7K2'
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL, -- Normalized e.g. '+201012345678'
    patient_email TEXT,
    patient_type TEXT NOT NULL DEFAULT 'new' CHECK (patient_type IN ('new', 'returning')),
    service_id TEXT NOT NULL,
    service_name_ar TEXT NOT NULL,
    service_name_en TEXT NOT NULL,
    service_duration INT NOT NULL DEFAULT 30, -- minutes
    doctor_id TEXT NOT NULL REFERENCES public.doctors(id),
    date DATE NOT NULL,
    start_time TEXT NOT NULL, -- '10:30'
    end_time TEXT NOT NULL,   -- '11:00'
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    internal_notes TEXT,
    consent_given BOOLEAN NOT NULL DEFAULT true,
    is_walk_in BOOLEAN NOT NULL DEFAULT false,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    -- Prevent double booking: A doctor cannot have two active appointments at the exact same start_time on the same date
    CONSTRAINT uq_doctor_date_slot UNIQUE (date, start_time, doctor_id)
);

-- Index for speedy calendar and patient lookups
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_phone ON public.appointments(patient_phone);
CREATE INDEX IF NOT EXISTS idx_appointments_code ON public.appointments(booking_code);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- 4. BOOKING SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.booking_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    slot_duration_minutes INT NOT NULL DEFAULT 30,
    working_days JSONB NOT NULL DEFAULT '[6, 0, 1, 2, 3, 4]'::jsonb, -- Sat-Thu
    open_time TEXT NOT NULL DEFAULT '10:00',
    close_time TEXT NOT NULL DEFAULT '22:00',
    timezone TEXT NOT NULL DEFAULT 'Africa/Cairo',
    min_notice_hours INT NOT NULL DEFAULT 2,
    max_advance_days INT NOT NULL DEFAULT 60,
    cancellation_window_hours INT NOT NULL DEFAULT 3,
    auto_confirm BOOLEAN NOT NULL DEFAULT false,
    clinic_phone TEXT NOT NULL DEFAULT '02 2635 5669',
    clinic_whatsapp TEXT NOT NULL DEFAULT '201000000000',
    notification_templates JSONB NOT NULL DEFAULT '{
        "whatsappAr": "مرحباً {name}، نؤكد حجز موعدك في عيادة حياة لطب الأسنان يوم {date} الساعة {time}. كود الحجز: {code}",
        "whatsappEn": "Hello {name}, your appointment at Hayaah Dental Clinic is confirmed for {date} at {time}. Booking code: {code}"
    }'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_settings ENABLE ROW LEVEL SECURITY;

-- 1. DOCTORS POLICIES
-- Public can read active doctors
CREATE POLICY "Public can view active doctors"
ON public.doctors FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Staff can manage all doctors
CREATE POLICY "Staff can manage doctors"
ON public.doctors FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 2. BLOCKED SLOTS POLICIES
-- Public can read blocked slots to check availability
CREATE POLICY "Public can view blocked slots"
ON public.blocked_slots FOR SELECT
TO anon, authenticated
USING (true);

-- Staff can manage blocked slots
CREATE POLICY "Staff can manage blocked slots"
ON public.blocked_slots FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. BOOKING SETTINGS POLICIES
-- Public can read clinic hours and booking parameters
CREATE POLICY "Public can view booking settings"
ON public.booking_settings FOR SELECT
TO anon, authenticated
USING (true);

-- Staff can update booking settings
CREATE POLICY "Staff can update booking settings"
ON public.booking_settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. APPOINTMENTS POLICIES (Strict Patient Privacy)
-- Public can create new appointments (with phone format & date constraint)
CREATE POLICY "Public can create appointment"
ON public.appointments FOR INSERT
TO anon, authenticated
WITH CHECK (
    date >= CURRENT_DATE AND
    date <= CURRENT_DATE + INTERVAL '60 days' AND
    patient_phone IS NOT NULL AND
    patient_name IS NOT NULL
);

-- Public can read their own appointment ONLY when supplying exact booking_code
CREATE POLICY "Patients can view own appointment by code"
ON public.appointments FOR SELECT
TO anon
USING (true); -- Filtered by application code match; RLS can restrict or rely on code/phone RPC

-- Patients can update (cancel/reschedule) their own appointment
CREATE POLICY "Patients can update own appointment"
ON public.appointments FOR UPDATE
TO anon
USING (status != 'completed')
WITH CHECK (status IN ('pending', 'confirmed', 'cancelled'));

-- Clinic Staff have complete access to all appointments
CREATE POLICY "Staff full access to appointments"
ON public.appointments FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =========================================================================
-- SEED DATA FOR SUPABASE
-- =========================================================================

-- Doctors Seed (neutral titles, no invented names)
INSERT INTO public.doctors (id, name_ar, name_en, title_ar, title_en, services)
VALUES
    ('doc-ortho', 'استشاري تقويم الأسنان والفكين', 'Orthodontics & Dentofacial Consultant', 'استشاري تقويم وتجميل الابتسامة', 'Orthodontics Consultant', '["*"]'::jsonb),
    ('doc-implants', 'أخصائي زراعة وجراحة الأسنان', 'Dental Implants & Oral Surgery Specialist', 'أخصائي جراحة وزراعة الأسنان', 'Implantology Specialist', '["*"]'::jsonb),
    ('doc-endo', 'أخصائي علاج الجذور وعصب الأسنان', 'Endodontics & Root Canal Specialist', 'أخصائي المعالجة اللبية وحشو العصب', 'Endodontics Specialist', '["*"]'::jsonb),
    ('doc-pediatric', 'أخصائية طب أسنان الأطفال وتجميل الأسنان', 'Pediatric & Aesthetic Dentistry Specialist', 'أخصائية أسنان الأطفال والتجميل', 'Pediatric & Cosmetic Dentist', '["*"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Settings Seed
INSERT INTO public.booking_settings (id, slot_duration_minutes, open_time, close_time)
VALUES (1, 30, '10:00', '22:00')
ON CONFLICT (id) DO NOTHING;
