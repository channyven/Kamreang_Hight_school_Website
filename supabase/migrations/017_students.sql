-- ============================================================
-- Student Management System
-- Migration 017: Students, Departments, and Classes tables
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE student_status AS ENUM ('active', 'inactive', 'graduated', 'suspended', 'transferred', 'expelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────
-- DEPARTMENTS / FACULTIES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS departments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_km     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  code        TEXT UNIQUE NOT NULL,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_departments_code ON departments (code);
CREATE INDEX IF NOT EXISTS idx_departments_active ON departments (is_active) WHERE is_active = true;

-- ─────────────────────────────────────────────────────────────
-- CLASSES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS classes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_km       TEXT NOT NULL,
  name_en       TEXT NOT NULL,
  code          TEXT UNIQUE NOT NULL,
  grade_level   INTEGER NOT NULL CHECK (grade_level BETWEEN 7 AND 12),
  section       TEXT,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  room          TEXT,
  capacity      INTEGER NOT NULL DEFAULT 45,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classes_code ON classes (code);
CREATE INDEX IF NOT EXISTS idx_classes_grade ON classes (grade_level);
CREATE INDEX IF NOT EXISTS idx_classes_department ON classes (department_id);
CREATE INDEX IF NOT EXISTS idx_classes_active ON classes (is_active) WHERE is_active = true;

-- ─────────────────────────────────────────────────────────────
-- STUDENTS (comprehensive)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS students (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id       TEXT UNIQUE NOT NULL,
  qr_code          TEXT,

  -- Identity
  photo            TEXT,
  khmer_first_name TEXT,
  khmer_last_name  TEXT,
  english_first_name TEXT NOT NULL,
  english_last_name  TEXT NOT NULL,
  gender           TEXT CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth    DATE,
  place_of_birth   TEXT,
  nationality      TEXT NOT NULL DEFAULT 'Khmer',

  -- Contact & Address
phone_number     VARCHAR(20),
email            VARCHAR(255),
street_address   TEXT,
province         VARCHAR(100),
district         VARCHAR(100),
commune          VARCHAR(100),
village          VARCHAR(100),

  -- Academic Placement
  faculty          TEXT,
  major            TEXT,
  academic_year    TEXT,
  class_name       TEXT,
  study_year       TEXT,
  semester         TEXT,
  gpa              NUMERIC(4,2),
  credits_earned   INTEGER,

  -- Status & Validity
  status           student_status NOT NULL DEFAULT 'active',
  card_issue_date  DATE,
  card_expiry_date DATE,

  -- Audit
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_id ON students (student_id);
CREATE INDEX IF NOT EXISTS idx_students_name ON students (english_last_name, english_first_name);
CREATE INDEX IF NOT EXISTS idx_students_faculty ON students (faculty);
CREATE INDEX IF NOT EXISTS idx_students_major ON students (major);
CREATE INDEX IF NOT EXISTS idx_students_status ON students (status);
CREATE INDEX IF NOT EXISTS idx_students_search ON students USING gin(
  to_tsvector('english',
    coalesce(english_first_name, '') || ' ' ||
    coalesce(english_last_name, '') || ' ' ||
    coalesce(khmer_first_name, '') || ' ' ||
    coalesce(khmer_last_name, '') || ' ' ||
    coalesce(student_id, '')
  )
);

-- ─────────────────────────────────────────────────────────────
-- TRIGGERS (updated_at)
-- ─────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS trg_departments_updated_at ON departments;
CREATE TRIGGER trg_departments_updated_at BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_classes_updated_at ON classes;
CREATE TRIGGER trg_classes_updated_at BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_students_updated_at ON students;
CREATE TRIGGER trg_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────

-- Service role full access
DROP POLICY IF EXISTS "Service role full access departments" ON departments;
CREATE POLICY "Service role full access departments" ON departments
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access classes" ON classes;
CREATE POLICY "Service role full access classes" ON classes
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access students" ON students;
CREATE POLICY "Service role full access students" ON students
  USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────
-- SEED DATA
-- ─────────────────────────────────────────────────────────────

-- Seed departments
INSERT INTO departments (name_km, name_en, code, description, sort_order) VALUES
  ('គណិតវិទ្យា', 'Mathematics', 'MATH', 'Mathematics department', 1),
  ('ភាសាខ្មែរ', 'Khmer Literature', 'KHM', 'Khmer language and literature department', 2),
  ('ភាសាអង់គ្លេស', 'English', 'ENG', 'English language department', 3),
  ('វិទ្យាសាស្ត្រ', 'Science', 'SCI', 'Science department', 4),
  ('សង្គមសិក្សា', 'Social Studies', 'SOC', 'Social studies department', 5),
  ('កីឡា', 'Physical Education', 'PE', 'Physical education and sports', 6)
ON CONFLICT (code) DO NOTHING;

-- Seed classes
INSERT INTO classes (name_km, name_en, code, grade_level, section, department_id, capacity)
SELECT
  'ថ្នាក់ទី ' || g || ' ក', 'Grade ' || g || ' A', 'G' || g || 'A', g, 'A', d.id, 45
FROM (SELECT unnest(ARRAY[7,8,9,10,11,12]) AS g) grades
CROSS JOIN (SELECT id FROM departments WHERE code = 'MATH' LIMIT 1) d
WHERE NOT EXISTS (SELECT 1 FROM classes WHERE code = 'G' || g || 'A')
UNION ALL
SELECT
  'ថ្នាក់ទី ' || g || ' ខ', 'Grade ' || g || ' B', 'G' || g || 'B', g, 'B', d.id, 45
FROM (SELECT unnest(ARRAY[7,8,9,10,11,12]) AS g) grades
CROSS JOIN (SELECT id FROM departments WHERE code = 'MATH' LIMIT 1) d
WHERE NOT EXISTS (SELECT 1 FROM classes WHERE code = 'G' || g || 'B');
