-- ============================================================
-- Donate Page: manageable "Why Donate" purpose cards
-- (previously hardcoded in the public donate page). Only
-- active cards are shown to the public.
-- ============================================================

CREATE TABLE IF NOT EXISTS donation_purposes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  icon       TEXT NOT NULL DEFAULT 'BookOpen',
  title_km   TEXT NOT NULL,
  title_en   TEXT NOT NULL,
  desc_km    TEXT,
  desc_en    TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donation_purposes_active ON donation_purposes (is_active) WHERE is_active = true;

DROP TRIGGER IF EXISTS trg_donation_purposes_updated_at ON donation_purposes;
CREATE TRIGGER trg_donation_purposes_updated_at BEFORE UPDATE ON donation_purposes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE donation_purposes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active donation purposes" ON donation_purposes;
CREATE POLICY "Public can read active donation purposes" ON donation_purposes
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access donation_purposes" ON donation_purposes;
CREATE POLICY "Service role full access donation_purposes" ON donation_purposes
  USING (auth.role() = 'service_role');

-- Seed with the cards currently hardcoded on the public donate page
INSERT INTO donation_purposes (icon, title_km, title_en, desc_km, desc_en, sort_order) VALUES
  ('BookOpen', 'បណ្ណាល័យ និងសៀវភៅ', 'Library & Books', 'ជួយយើងពង្រីកបណ្ណាល័យជាមួយសៀវភៅ និងសម្ភារៈសិក្សាទំនើប', 'Help us expand our library with modern textbooks and learning materials.', 1),
  ('Laptop', 'បច្ចេកវិទ្យា និងមន្ទីរពិសោធន៍', 'Technology & Labs', 'គាំទ្រការធ្វើឱ្យប្រសើរឡើងនូវបន្ទប់កុំព្យូទ័រ និងមន្ទីរពិទ្យាសាស្ត្រ', 'Support the upgrade of computer labs and science facilities.', 2),
  ('GraduationCap', 'អាហារូបករណ៍សិស្ស', 'Student Scholarships', 'ផ្តល់អាហារូបករណ៍ដល់សិស្សមានទេព្យកោសល្យដែលខ្វះខាតហិរញ្ញវត្ថុ', 'Provide scholarships for talented students with financial need.', 3),
  ('School', 'ហេដ្ឋារចនាសម្ព័ន្ធសាលា', 'School Infrastructure', 'ផ្តល់មូលនិធិសម្រាប់ការជួសជុលថ្នាក់រៀន និងការធ្វើឱ្យប្រសើរឡើងនូវបរិវេណ', 'Fund classroom renovations and campus improvements.', 4)
ON CONFLICT DO NOTHING;
