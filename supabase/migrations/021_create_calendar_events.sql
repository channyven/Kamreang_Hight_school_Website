-- ============================================================
-- School Calendar Module
-- ============================================================

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  description     TEXT,

  category        TEXT NOT NULL DEFAULT 'school_event',
  location        TEXT,
  organizer       TEXT,

  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  start_time      TEXT,
  end_time        TEXT,
  is_all_day      BOOLEAN NOT NULL DEFAULT false,

  is_recurring    BOOLEAN NOT NULL DEFAULT false,
  recurring_rule  JSONB, -- { frequency: "weekly"|"monthly"|"yearly", interval: 1, until: "2026-12-31", days: [1,3,5] }

  visibility      TEXT NOT NULL DEFAULT 'public',
  status          TEXT NOT NULL DEFAULT 'draft',
  color           TEXT,

  attachment_url  TEXT,

  -- For grade/department filtering
  grade_level     INTEGER,  -- 7-12 or null for all
  department      TEXT,

  is_featured     BOOLEAN NOT NULL DEFAULT false,

  created_by      UUID REFERENCES admin_users(id),
  updated_by      UUID REFERENCES admin_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_calendar_events_dates ON calendar_events(start_date, end_date);
CREATE INDEX idx_calendar_events_category ON calendar_events(category);
CREATE INDEX idx_calendar_events_status ON calendar_events(status);
CREATE INDEX idx_calendar_events_visibility ON calendar_events(visibility);

-- RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Admin (administrator) can do everything
CREATE POLICY "Admins can do anything on calendar_events" ON calendar_events
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.firebase_uid = auth.uid()::text
      AND admin_users.role = 'administrator'
    )
  );

-- Directors can read and update
CREATE POLICY "Directors can read and update calendar_events" ON calendar_events
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.firebase_uid = auth.uid()::text
      AND admin_users.role = 'director'
    )
  );

-- Editors can read (but not modify)
CREATE POLICY "Editors can read calendar_events" ON calendar_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.firebase_uid = auth.uid()::text
      AND admin_users.role = 'editor'
    )
  );

-- Public/anon can read published events
CREATE POLICY "Public can read published calendar_events" ON calendar_events
  FOR SELECT TO anon
  USING (status = 'published' AND visibility = 'public');

-- Audit trigger
CREATE TRIGGER calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed some sample events
INSERT INTO calendar_events (title, description, category, location, start_date, end_date, start_time, end_time, is_all_day, visibility, status, color, is_featured) VALUES
  (
    'Opening Ceremony 2025-2026',
    'Official opening ceremony for the new academic year 2025-2026.',
    'school_event', 'School Auditorium',
    '2025-10-01', '2025-10-01', '7:00 AM', '10:00 AM',
    false, 'public', 'published', '#2563eb', true
  ),
  (
    'Grade 12 National Exam',
    'National Baccalaureate examination for Grade 12 students.',
    'examination', 'Building A & B',
    '2026-08-01', '2026-08-15', '8:00 AM', '4:00 PM',
    false, 'public', 'published', '#dc2626', true
  ),
  (
    'School Sports Day',
    'Annual sports competition between houses.',
    'sports', 'School Playground',
    '2025-12-15', '2025-12-16', '7:00 AM', '5:00 PM',
    false, 'public', 'published', '#16a34a', false
  ),
  (
    'Khmer New Year',
    'School closed for Khmer New Year celebrations.',
    'holiday', NULL,
    '2026-04-13', '2026-04-16', NULL, NULL,
    true, 'public', 'published', '#f59e0b', false
  ),
  (
    'Parent-Teacher Meeting',
    'Semester 1 parent-teacher conference.',
    'parent_meeting', 'School Hall',
    '2025-12-05', '2025-12-05', '1:00 PM', '4:00 PM',
    false, 'public', 'published', '#8b5cf6', false
  ),
  (
    'Science Fair 2026',
    'Annual science project exhibition by students.',
    'club_activity', 'Science Building',
    '2026-02-20', '2026-02-21', '8:00 AM', '3:00 PM',
    false, 'public', 'published', '#06b6d4', false
  ),
  (
    'Staff Professional Development',
    'Teacher training workshop on modern teaching methods.',
    'workshop', 'Training Room',
    '2025-11-10', '2025-11-11', '8:00 AM', '12:00 PM',
    false, 'teachers', 'published', '#e91e63', false
  );