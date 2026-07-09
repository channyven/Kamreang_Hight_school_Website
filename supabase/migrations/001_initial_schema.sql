-- ============================================================
-- High School Website Management System
-- Initial Schema Migration
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('administrator', 'director', 'editor');
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE achievement_type AS ENUM ('student', 'teacher', 'school');
CREATE TYPE award_level AS ENUM ('national', 'provincial', 'district', 'school');
CREATE TYPE message_status AS ENUM ('unread', 'read', 'replied', 'archived');
CREATE TYPE media_type AS ENUM ('image', 'video', 'document');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'publish', 'archive', 'login', 'logout');

-- ─────────────────────────────────────────────────────────────
-- ADMIN USERS
-- (named admin_users, not users, to avoid colliding with other
-- apps sharing this Supabase project)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE admin_users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid  TEXT UNIQUE NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  full_name     TEXT NOT NULL,
  avatar_url    TEXT,
  role          user_role NOT NULL DEFAULT 'editor',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_users_firebase_uid ON admin_users (firebase_uid);
CREATE INDEX idx_admin_users_email ON admin_users (email);
CREATE INDEX idx_admin_users_role ON admin_users (role);

-- ─────────────────────────────────────────────────────────────
-- SETTINGS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE settings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT UNIQUE NOT NULL,
  value       JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  updated_by  UUID REFERENCES admin_users(id),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
  ('school_info', '{
    "name_km": "វិទ្យាល័យភ្នំពេញ",
    "name_en": "Phnom Penh High School",
    "address_km": "ភ្នំពេញ, កម្ពុជា",
    "address_en": "Phnom Penh, Cambodia",
    "phone": "+855 23 000 000",
    "email": "info@school.edu.kh",
    "map_embed_url": "",
    "facebook_url": "",
    "youtube_url": "",
    "telegram_url": ""
  }', 'School contact and social information'),
  ('homepage', '{
    "hero_title_km": "ស្វាគមន៍មកកាន់វិទ្យាល័យភ្នំពេញ",
    "hero_title_en": "Welcome to Phnom Penh High School",
    "hero_subtitle_km": "កន្លែងអប់រំដ៏ល្អបំផុត",
    "hero_subtitle_en": "The finest place of education",
    "hero_image_url": "",
    "school_logo_url": ""
  }', 'Homepage hero configuration'),
  ('contact', '{
    "working_hours_km": "ច័ន្ទ - សុក្រ: ម៉ោង ៧:០០ - ១១:០០, ១៤:០០ - ១៧:០០",
    "working_hours_en": "Mon - Fri: 7:00 - 11:00, 14:00 - 17:00"
  }', 'Contact page settings');

-- ─────────────────────────────────────────────────────────────
-- SCHOOL INFORMATION
-- ─────────────────────────────────────────────────────────────

CREATE TABLE school_info (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section     TEXT NOT NULL,            -- 'history','vision','mission','values'
  title_km    TEXT,
  title_en    TEXT,
  content_km  TEXT,
  content_en  TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  updated_by  UUID REFERENCES admin_users(id),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE leadership (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_km     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  title_km    TEXT NOT NULL,
  title_en    TEXT NOT NULL,
  bio_km      TEXT,
  bio_en      TEXT,
  photo_url   TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- STATISTICS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE statistics (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academic_year   TEXT NOT NULL UNIQUE,   -- e.g. "2023-2024"
  total_students  INTEGER NOT NULL DEFAULT 0,
  total_teachers  INTEGER NOT NULL DEFAULT 0,
  total_classes   INTEGER NOT NULL DEFAULT 0,
  grade_a_students INTEGER NOT NULL DEFAULT 0,
  graduation_rate  NUMERIC(5,2) NOT NULL DEFAULT 0,  -- percentage
  pass_rate       NUMERIC(5,2),
  male_students   INTEGER NOT NULL DEFAULT 0,
  female_students INTEGER NOT NULL DEFAULT 0,
  new_students    INTEGER,
  is_current      BOOLEAN NOT NULL DEFAULT false,
  notes           TEXT,
  created_by      UUID REFERENCES admin_users(id),
  updated_by      UUID REFERENCES admin_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_statistics_academic_year ON statistics (academic_year);
CREATE INDEX idx_statistics_is_current ON statistics (is_current);

-- Ensure only one current statistics record
CREATE UNIQUE INDEX idx_statistics_current ON statistics (is_current) WHERE is_current = true;

-- ─────────────────────────────────────────────────────────────
-- NEWS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE news_categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_km    TEXT NOT NULL,
  name_en    TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE news (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_km        TEXT NOT NULL,
  title_en        TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  content_km      TEXT,
  content_en      TEXT,
  excerpt_km      TEXT,
  excerpt_en      TEXT,
  featured_image  TEXT,
  category_id     UUID REFERENCES news_categories(id) ON DELETE SET NULL,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  status          content_status NOT NULL DEFAULT 'draft',
  publish_date    TIMESTAMPTZ,
  view_count      INTEGER NOT NULL DEFAULT 0,
  created_by      UUID REFERENCES admin_users(id),
  updated_by      UUID REFERENCES admin_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_news_slug ON news (slug);
CREATE INDEX idx_news_status ON news (status);
CREATE INDEX idx_news_category ON news (category_id);
CREATE INDEX idx_news_publish_date ON news (publish_date DESC);
CREATE INDEX idx_news_featured ON news (is_featured) WHERE is_featured = true;
-- Full-text search index
CREATE INDEX idx_news_search ON news USING gin(
  to_tsvector('english', coalesce(title_en, '') || ' ' || coalesce(excerpt_en, ''))
);

-- ─────────────────────────────────────────────────────────────
-- ACTIVITIES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE activity_categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_km    TEXT NOT NULL,
  name_en    TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  color      TEXT DEFAULT '#1e3a8a',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE activities (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_km        TEXT NOT NULL,
  title_en        TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description_km  TEXT,
  description_en  TEXT,
  category_id     UUID REFERENCES activity_categories(id) ON DELETE SET NULL,
  activity_date   DATE,
  location_km     TEXT,
  location_en     TEXT,
  featured_image  TEXT,
  images          TEXT[] DEFAULT '{}',
  video_url       TEXT,
  status          content_status NOT NULL DEFAULT 'draft',
  view_count      INTEGER NOT NULL DEFAULT 0,
  created_by      UUID REFERENCES admin_users(id),
  updated_by      UUID REFERENCES admin_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activities_slug ON activities (slug);
CREATE INDEX idx_activities_status ON activities (status);
CREATE INDEX idx_activities_category ON activities (category_id);
CREATE INDEX idx_activities_date ON activities (activity_date DESC);

-- ─────────────────────────────────────────────────────────────
-- ACHIEVEMENTS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE achievements (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_km         TEXT NOT NULL,
  title_en         TEXT NOT NULL,
  description_km   TEXT,
  description_en   TEXT,
  achievement_type achievement_type NOT NULL DEFAULT 'student',
  award_level      award_level NOT NULL DEFAULT 'school',
  achievement_date DATE,
  participant_name TEXT,
  image_url        TEXT,
  is_featured      BOOLEAN NOT NULL DEFAULT false,
  status           content_status NOT NULL DEFAULT 'draft',
  created_by       UUID REFERENCES admin_users(id),
  updated_by       UUID REFERENCES admin_users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_achievements_type ON achievements (achievement_type);
CREATE INDEX idx_achievements_status ON achievements (status);
CREATE INDEX idx_achievements_date ON achievements (achievement_date DESC);

-- ─────────────────────────────────────────────────────────────
-- GALLERY
-- ─────────────────────────────────────────────────────────────

CREATE TABLE galleries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_km        TEXT NOT NULL,
  title_en        TEXT NOT NULL,
  description_km  TEXT,
  description_en  TEXT,
  cover_image     TEXT,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  status          content_status NOT NULL DEFAULT 'draft',
  created_by      UUID REFERENCES admin_users(id),
  updated_by      UUID REFERENCES admin_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE media (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id   UUID REFERENCES galleries(id) ON DELETE CASCADE,
  title_km     TEXT,
  title_en     TEXT,
  url          TEXT NOT NULL,
  thumbnail    TEXT,
  media_type   media_type NOT NULL DEFAULT 'image',
  file_size    INTEGER,
  width        INTEGER,
  height       INTEGER,
  duration     INTEGER,  -- seconds for video
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_featured  BOOLEAN NOT NULL DEFAULT false,
  created_by   UUID REFERENCES admin_users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_gallery ON media (gallery_id);
CREATE INDEX idx_media_type ON media (media_type);
CREATE INDEX idx_media_featured ON media (is_featured) WHERE is_featured = true;

-- ─────────────────────────────────────────────────────────────
-- DOWNLOADS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE download_categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_km    TEXT NOT NULL,
  name_en    TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  icon       TEXT DEFAULT 'file',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE downloads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_km        TEXT NOT NULL,
  title_en        TEXT NOT NULL,
  description_km  TEXT,
  description_en  TEXT,
  file_url        TEXT NOT NULL,
  file_name       TEXT NOT NULL,
  file_size       INTEGER,
  file_type       TEXT,
  category_id     UUID REFERENCES download_categories(id) ON DELETE SET NULL,
  download_count  INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_by      UUID REFERENCES admin_users(id),
  updated_by      UUID REFERENCES admin_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_downloads_category ON downloads (category_id);
CREATE INDEX idx_downloads_active ON downloads (is_active) WHERE is_active = true;

-- ─────────────────────────────────────────────────────────────
-- MESSAGES (Contact Form)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      message_status NOT NULL DEFAULT 'unread',
  ip_address  TEXT,
  user_agent  TEXT,
  replied_by  UUID REFERENCES admin_users(id),
  replied_at  TIMESTAMPTZ,
  reply_text  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_status ON messages (status);
CREATE INDEX idx_messages_created ON messages (created_at DESC);
CREATE INDEX idx_messages_email ON messages (email);

-- ─────────────────────────────────────────────────────────────
-- NOTICE BOARD
-- ─────────────────────────────────────────────────────────────

CREATE TABLE notices (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_km    TEXT NOT NULL,
  title_en    TEXT NOT NULL,
  content_km  TEXT,
  content_en  TEXT,
  notice_type TEXT NOT NULL DEFAULT 'general',  -- general, exam, event, urgent
  start_date  DATE,
  end_date    DATE,
  is_pinned   BOOLEAN NOT NULL DEFAULT false,
  status      content_status NOT NULL DEFAULT 'draft',
  created_by  UUID REFERENCES admin_users(id),
  updated_by  UUID REFERENCES admin_users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notices_status ON notices (status);
CREATE INDEX idx_notices_dates ON notices (start_date, end_date);
CREATE INDEX idx_notices_pinned ON notices (is_pinned) WHERE is_pinned = true;

-- ─────────────────────────────────────────────────────────────
-- ADMIN AUDIT LOGS
-- (named admin_audit_logs, not audit_logs, to avoid colliding
-- with other apps sharing this Supabase project)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE admin_audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  user_email  TEXT,
  action      audit_action NOT NULL,
  table_name  TEXT NOT NULL,
  record_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_audit_user ON admin_audit_logs (user_id);
CREATE INDEX idx_admin_audit_table ON admin_audit_logs (table_name);
CREATE INDEX idx_admin_audit_created ON admin_audit_logs (created_at DESC);
CREATE INDEX idx_admin_audit_record ON admin_audit_logs (table_name, record_id);

-- ─────────────────────────────────────────────────────────────
-- FUNCTIONS & TRIGGERS
-- ─────────────────────────────────────────────────────────────

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all relevant tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'admin_users', 'statistics', 'news', 'activities', 'achievements',
    'galleries', 'downloads', 'messages', 'notices', 'leadership', 'school_info'
  ] LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t, t
    );
  END LOOP;
END $$;

-- Auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Increment download count
CREATE OR REPLACE FUNCTION increment_download_count(download_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE downloads SET download_count = download_count + 1 WHERE id = download_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment view count
CREATE OR REPLACE FUNCTION increment_view_count(p_table TEXT, p_id UUID)
RETURNS VOID AS $$
BEGIN
  IF p_table = 'news' THEN
    UPDATE news SET view_count = view_count + 1 WHERE id = p_id;
  ELSIF p_table = 'activities' THEN
    UPDATE activities SET view_count = view_count + 1 WHERE id = p_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE leadership ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Public read for published content
CREATE POLICY "Public can read published news" ON news
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can read published activities" ON activities
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can read published achievements" ON achievements
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can read published galleries" ON galleries
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can read gallery media" ON media
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM galleries g WHERE g.id = gallery_id AND g.status = 'published')
  );

CREATE POLICY "Public can read active downloads" ON downloads
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active notices" ON notices
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can read news categories" ON news_categories
  FOR SELECT USING (true);

CREATE POLICY "Public can read activity categories" ON activity_categories
  FOR SELECT USING (true);

CREATE POLICY "Public can read download categories" ON download_categories
  FOR SELECT USING (true);

CREATE POLICY "Public can read leadership" ON leadership
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read school info" ON school_info
  FOR SELECT USING (true);

CREATE POLICY "Public can read statistics" ON statistics
  FOR SELECT USING (true);

CREATE POLICY "Public can read settings" ON settings
  FOR SELECT USING (true);

-- Service role full access (for server-side operations)
CREATE POLICY "Service role full access admin_users" ON admin_users
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access settings" ON settings
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access messages" ON messages
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access news" ON news
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access activities" ON activities
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access achievements" ON achievements
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access galleries" ON galleries
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access media" ON media
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access downloads" ON downloads
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access notices" ON notices
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access admin_audit_logs" ON admin_audit_logs
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access leadership" ON leadership
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access school_info" ON school_info
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access statistics" ON statistics
  USING (auth.role() = 'service_role');

CREATE POLICY "Public insert messages" ON messages
  FOR INSERT WITH CHECK (true);
