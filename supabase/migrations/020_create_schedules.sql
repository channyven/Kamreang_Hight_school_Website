-- ============================================================
-- Schedule Management System
-- ============================================================

-- Create function for updating updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create schedules table for academic schedule management
CREATE TABLE IF NOT EXISTS public.schedules (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academic_year   TEXT NOT NULL UNIQUE,   -- e.g. "2024-2025"
  
  -- Academic year info
  first_semester_km TEXT,
  first_semester_en TEXT,
  first_semester_dates TEXT,
  second_semester_km TEXT,
  second_semester_en TEXT,
  second_semester_dates TEXT,
  
  -- Daily schedule (JSONB array of periods)
  daily_schedule JSONB DEFAULT '[
    {"time": "7:00 - 7:50", "name_km": "ប្រជុំព្រឹក", "name_en": "Morning Assembly"},
    {"time": "8:00 - 8:50", "name_km": "ម៉ោងទី១", "name_en": "Period 1"},
    {"time": "9:00 - 9:50", "name_km": "ម៉ោងទី២", "name_en": "Period 2"},
    {"time": "10:00 - 10:50", "name_km": "ម៉ោងទី៣", "name_en": "Period 3"},
    {"time": "11:00 - 11:50", "name_km": "ម៉ោងទី៤", "name_en": "Period 4"},
    {"time": "12:00 - 13:00", "name_km": "ពេលសំរាកល្ងាច", "name_en": "Lunch Break"},
    {"time": "13:00 - 13:50", "name_km": "ម៉ោងទី៥", "name_en": "Period 5"},
    {"time": "14:00 - 14:50", "name_km": "ម៉ោងទី៦", "name_en": "Period 6"},
    {"time": "15:00 - 15:50", "name_km": "ម៉ោងទី៧", "name_en": "Period 7"},
    {"time": "16:00 - 17:00", "name_km": "សកម្មភាពបន្ថែម", "name_en": "Extra-curricular Activities"}
  ]'::jsonb,
  
  -- Important dates (JSONB array)
  important_dates JSONB DEFAULT '[]'::jsonb,
  
  -- Contact information
  school_office_hours_km TEXT,
  school_office_hours_en TEXT,
  school_office_phone TEXT,
  academic_office_hours_km TEXT,
  academic_office_hours_en TEXT,
  academic_office_phone TEXT,
  contact_info_km TEXT,
  contact_info_en TEXT,
  
  -- Status and metadata
  is_current      BOOLEAN NOT NULL DEFAULT false,
  notes            TEXT,
  created_by       UUID REFERENCES admin_users(id),
  updated_by       UUID REFERENCES admin_users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_schedules_academic_year ON schedules(academic_year);
CREATE INDEX idx_schedules_is_current ON schedules(is_current);

-- Ensure only one current schedule
CREATE UNIQUE INDEX idx_schedules_current ON schedules(is_current) WHERE is_current = true;

-- Add RLS policies
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Policy: Admin users can do everything
CREATE POLICY "Admins can do anything on schedules" ON schedules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.firebase_uid = auth.uid()::text
      AND admin_users.role = 'administrator'
    )
  );

-- Policy: Directors can read and update
CREATE POLICY "Directors can read and update schedules" ON schedules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.firebase_uid = auth.uid()::text
      AND admin_users.role = 'director'
    )
  );

-- Policy: Editors can read schedules
CREATE POLICY "Editors can read schedules" ON schedules
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.firebase_uid = auth.uid()::text
      AND admin_users.role = 'editor'
    )
  );

-- Policy: Public (anon) can read schedules for display on public site
CREATE POLICY "Public can read schedules" ON schedules
  FOR SELECT
  TO anon
  USING (true);

-- Insert default schedule data
INSERT INTO schedules (
  academic_year,
  first_semester_km,
  first_semester_en,
  first_semester_dates,
  second_semester_km,
  second_semester_en,
  second_semester_dates,
  important_dates,
  school_office_hours_km,
  school_office_hours_en,
  school_office_phone,
  academic_office_hours_km,
  academic_office_hours_en,
  academic_office_phone,
  contact_info_km,
  contact_info_en,
  is_current
) VALUES (
  '2024-2025',
  'ឆមាសទី១',
  'First Semester',
  'តុលា ២០២៤ - មករា ២០២ᅵ',
  'ឆមាសទី២',
  'Second Semester',
  'កុម្ភៈ ២០២ᅵ - កក្កដា ២០២ᅵ',
  '[
    {
      "title_km": "ប្រលងពាក់កណ្ដាលឆមាស",
      "title_en": "Mid-term Examinations",
      "date_km": "ខែធ្នូ ១៦-២០, ២០២៤",
      "date_en": "December 16-20, 2024"
    },
    {
      "title_km": "ប្រលងឆមាស",
      "title_en": "Final Examinations",
      "date_km": "ខែមករា ២០២ᅵ (មិនទាន់ច្បាស់លាស់)",
      "date_en": "January 2025 (Tentative)"
    },
    {
      "title_km": "ប្រលងជាតិថ្នាក់ទី៩",
      "title_en": "Grade 9 National Exam",
      "date_km": "ខែសីហា ២០២ᅵ",
      "date_en": "August 2025"
    },
    {
      "title_km": "ប្រលងជាតិថ្នាក់ទី១២",
      "title_en": "Grade 12 National Exam",
      "date_km": "ខែសីហា ២០២ᅵ",
      "date_en": "August 2025"
    }
  ]'::jsonb,
  'ច័ន្ទ-សុក្រ: ៧:០០ ព្រឹក - ៥:០០ ល្ងាច',
  'Mon-Fri: 7:00 AM - 5:00 PM',
  '+855 12 345 678',
  'ច័ន្ទ-សុក្រ: ៨:០០ ព្រឹក - ៤:០០ ល្ងាច',
  'Mon-Fri: 8:00 AM - 4:00 PM',
  '+855 12 345 679',
  'សម្រាប់ការផ្លាស់ប្តូរកាលវិភាគ ឬសំណួរ សូមទំនាក់ទំនងរដ្ឋបាលសាលា',
  'For schedule changes or inquiries, please contact the school administration.',
  true
);

-- Insert schedule for 2025-2026 academic year
INSERT INTO schedules (
  academic_year,
  first_semester_km,
  first_semester_en,
  first_semester_dates,
  second_semester_km,
  second_semester_en,
  second_semester_dates,
  important_dates,
  school_office_hours_km,
  school_office_hours_en,
  school_office_phone,
  academic_office_hours_km,
  academic_office_hours_en,
  academic_office_phone,
  contact_info_km,
  contact_info_en,
  is_current
) VALUES (
  '2025-2026',
  'ឆមាសទី១',
  'First Semester',
  'តុលា ២០២៥ - មករា ២០២៦',
  'ឆមាសទី២',
  'Second Semester',
  'កុម្ភៈ ២០២៦ - កក្កដា ២០២៦',
  '[
    {
      "title_km": "ប្រលងពាក់កណ្ដាលឆមាស",
      "title_en": "Mid-term Examinations",
      "date_km": "ខែធ្នូ ១៦-២០, ២០២៥",
      "date_en": "December 16-20, 2025"
    },
    {
      "title_km": "ប្រលងឆមាស",
      "title_en": "Final Examinations",
      "date_km": "ខែមករា ២០២៦ (មិនទាន់ច្បាស់លាស់)",
      "date_en": "January 2026 (Tentative)"
    },
    {
      "title_km": "ប្រលងជាតិថ្នាក់ទី៩",
      "title_en": "Grade 9 National Exam",
      "date_km": "ខែសីហា ២០២៦",
      "date_en": "August 2026"
    },
    {
      "title_km": "ប្រលងជាតិថ្នាក់ទី១២",
      "title_en": "Grade 12 National Exam",
      "date_km": "ខែសីហា ២០២៦",
      "date_en": "August 2026"
    }
  ]'::jsonb,
  'ច័ន្ទ-សុក្រ: ៧:០០ ព្រឹក - ៥:០០ ល្ងាច',
  'Mon-Fri: 7:00 AM - 5:00 PM',
  '+855 12 345 678',
  'ច័ន្ទ-សុក្រ: ៨:០០ ព្រឹក - ៤:០០ ល្ងាច',
  'Mon-Fri: 8:00 AM - 4:00 PM',
  '+855 12 345 679',
  'សម្រាប់ការផ្លាស់ប្តូរកាលវិភាគ ឬសំណួរ សូមទំនាក់ទំនងរដ្ឋបាលសាលា',
  'For schedule changes or inquiries, please contact the school administration.',
  false
);

-- Add audit trigger for schedules
CREATE TRIGGER schedules_updated_at
  BEFORE UPDATE ON schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
