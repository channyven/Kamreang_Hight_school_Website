-- ============================================================
-- Student Management System
-- Migration 017: Students, Departments, and Classes
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

DO $$ BEGIN
    CREATE TYPE student_status AS ENUM (
        'active',
        'inactive',
        'graduated',
        'suspended',
        'transferred',
        'expelled'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- DEPARTMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    name_km TEXT NOT NULL,
    name_en TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,

    description TEXT,

    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CLASSES
-- ============================================================

CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    name_km TEXT NOT NULL,
    name_en TEXT NOT NULL,

    code TEXT UNIQUE NOT NULL,

    grade_level INTEGER NOT NULL CHECK (grade_level BETWEEN 7 AND 12),

    section TEXT,

    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,

    room TEXT,

    capacity INTEGER DEFAULT 45,

    sort_order INTEGER DEFAULT 0,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STUDENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS students (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    ------------------------------------------------------------
    -- Student Information
    ------------------------------------------------------------

    student_id TEXT UNIQUE NOT NULL,

    qr_token UUID DEFAULT uuid_generate_v4() UNIQUE,

    qr_code TEXT,

    photo_url TEXT,

    ------------------------------------------------------------
    -- Names
    ------------------------------------------------------------

    khmer_first_name TEXT,
    khmer_last_name TEXT,

    english_first_name TEXT NOT NULL,
    english_last_name TEXT NOT NULL,

    ------------------------------------------------------------
    -- Personal Information
    ------------------------------------------------------------

    gender TEXT CHECK (
        gender IN ('male','female','other')
    ),

    date_of_birth DATE,

    place_of_birth TEXT,

    nationality TEXT DEFAULT 'Khmer',

    blood_group VARCHAR(5),

    religion TEXT,

    ------------------------------------------------------------
    -- Parent Information
    ------------------------------------------------------------

    father_name TEXT,

    father_phone VARCHAR(20),

    mother_name TEXT,

    mother_phone VARCHAR(20),

    guardian_name TEXT,

    guardian_phone VARCHAR(20),

    guardian_relationship TEXT,

    ------------------------------------------------------------
    -- Emergency Contact
    ------------------------------------------------------------

    emergency_contact_name TEXT,

    emergency_contact_phone VARCHAR(20),

    emergency_contact_relationship TEXT,

    ------------------------------------------------------------
    -- Contact
    ------------------------------------------------------------

    phone_number VARCHAR(20),

    email VARCHAR(255) UNIQUE,

    ------------------------------------------------------------
    -- Address
    ------------------------------------------------------------

    street_address TEXT,

    village VARCHAR(100),

    commune VARCHAR(100),

    district VARCHAR(100),

    province VARCHAR(100),

    ------------------------------------------------------------
    -- Academic Information
    ------------------------------------------------------------

    department_id UUID
        REFERENCES departments(id)
        ON DELETE SET NULL,

    class_id UUID
        REFERENCES classes(id)
        ON DELETE SET NULL,

    faculty TEXT,

    major TEXT,

    academic_year TEXT,

    study_year TEXT,

    semester TEXT,

    batch TEXT,

    gpa NUMERIC(4,2),

    credits_earned INTEGER DEFAULT 0,

    admission_date DATE,

    graduation_date DATE,

    ------------------------------------------------------------
    -- Student Card
    ------------------------------------------------------------

    card_number TEXT UNIQUE,

    card_issue_date DATE,

    card_expiry_date DATE,

    ------------------------------------------------------------
    -- Status
    ------------------------------------------------------------

    status student_status DEFAULT 'active',

    ------------------------------------------------------------
    -- Audit
    ------------------------------------------------------------

    created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,

    updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_students_student_id
ON students(student_id);

CREATE INDEX IF NOT EXISTS idx_students_status
ON students(status);

CREATE INDEX IF NOT EXISTS idx_students_department
ON students(department_id);

CREATE INDEX IF NOT EXISTS idx_students_class
ON students(class_id);

CREATE INDEX IF NOT EXISTS idx_students_batch
ON students(batch);

CREATE INDEX IF NOT EXISTS idx_students_search
ON students
USING gin(
    to_tsvector(
        'english',
        coalesce(english_first_name,'') || ' ' ||
        coalesce(english_last_name,'') || ' ' ||
        coalesce(khmer_first_name,'') || ' ' ||
        coalesce(khmer_last_name,'') || ' ' ||
        coalesce(student_id,'')
    )
);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS trg_departments_updated_at ON departments;

CREATE TRIGGER trg_departments_updated_at
BEFORE UPDATE ON departments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_classes_updated_at ON classes;

CREATE TRIGGER trg_classes_updated_at
BEFORE UPDATE ON classes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_students_updated_at ON students;

CREATE TRIGGER trg_students_updated_at
BEFORE UPDATE ON students
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ENABLE RLS
-- ============================================================

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SERVICE ROLE POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Service role departments" ON departments;

CREATE POLICY "Service role departments"
ON departments
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role classes" ON classes;

CREATE POLICY "Service role classes"
ON classes
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role students" ON students;

CREATE POLICY "Service role students"
ON students
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');