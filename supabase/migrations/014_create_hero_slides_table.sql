-- ============================================================
-- Hero Slides Table
-- Manages slides for the homepage hero slideshow
-- ============================================================

CREATE TABLE hero_slides (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_km          TEXT NOT NULL,
  title_en          TEXT NOT NULL,
  subtitle_km       TEXT,
  subtitle_en       TEXT,
  image_url         TEXT,
  gradient          TEXT,
  cta_primary_km    TEXT,
  cta_primary_en    TEXT,
  cta_secondary_km  TEXT,
  cta_secondary_en  TEXT,
  cta_primary_href    TEXT DEFAULT '/contact',
  cta_secondary_href  TEXT DEFAULT '/about',
  sort_order        INTEGER NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing
CREATE INDEX idx_hero_slides_sort ON hero_slides (sort_order);
CREATE INDEX idx_hero_slides_active ON hero_slides (is_active) WHERE is_active = true;

-- RLS
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Public can read active slides
CREATE POLICY "Public can read active hero slides" ON hero_slides
  FOR SELECT USING (is_active = true);

-- Service role has full access
CREATE POLICY "Service role full access hero_slides" ON hero_slides
  USING (auth.role() = 'service_role');

-- Auto-update trigger
CREATE TRIGGER trg_hero_slides_updated_at
  BEFORE UPDATE ON hero_slides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed some default slides
INSERT INTO hero_slides (title_km, title_en, subtitle_km, subtitle_en, image_url, gradient, cta_primary_km, cta_primary_en, cta_secondary_km, cta_secondary_en, cta_primary_href, cta_secondary_href, sort_order, is_active) VALUES
(
  'សូមស្វាគមន៍មកកាន់វិទ្យាល័យកំរៀង',
  'Welcome to Kamrieng High School',
  'ផ្ដល់ការអប់រំ ប្រកបដោយ គុណភាព វប្បធម៌ និងនវានុវត្ត ដើម្បីអ្នកដឹកនាំ ពេលអនាគត',
  'Empowering the next generation of Cambodian leaders through academic rigor, cultural integrity, and innovative learning.',
  NULL,
  'linear-gradient(135deg, #0d1b38 0%, #1e3a8a 55%, #1e3066 100%)',
  'ចុះឈ្មោះ',
  'Enroll Now',
  'មើលព័ត៌មានបន្ថែម',
  'View Prospectus',
  '/contact',
  '/about',
  1,
  true
),
(
  'ឆ្នើមខាងការសិក្សា',
  'Academic Excellence',
  'សិស្ស ៩៦% ជោគជ័យ ក្នុងការប្រឡង BAC II ជាមួយ គ្រូបង្រៀន ដ៏ជំនាញ',
  '96% of our students pass the national BAC II examination with distinction, guided by our experienced and dedicated faculty.',
  NULL,
  'linear-gradient(135deg, #0f2957 0%, #1e4e8c 60%, #1e40af 100%)',
  'ព័ត៌មានបន្ថែម',
  'Our Results',
  'ទំនាក់ទំនង',
  'Contact Us',
  '/achievements',
  '/contact',
  2,
  true
),
(
  'ព្រឹត្តិការណ៍ និងសកម្មភាព',
  'Vibrant School Life',
  'សាលារៀននៃ ការរីកលូតលាស់ ។ ព្រឹត្តិការណ៍ ដ៏ចម្រុះ ថ្ងៃ គ្រប់ ។',
  'Beyond academics, our school fosters creativity, sportsmanship, and community spirit through year-round events and activities.',
  NULL,
  'linear-gradient(135deg, #0a3d62 0%, #1a6b8a 50%, #0d8abe 100%)',
  'ព័ត៌មាន',
  'Latest News',
  'ស្វែងយល់បន្ថែម',
  'Learn More',
  '/news',
  '/about',
  3,
  true
),
(
  'ជោគជ័យ ដ៏ក្លៀវក្លា',
  'Celebrating Achievement',
  'ពានរង្វាន់ ជាតិ ខេត្ត ជិត ១០ ក្នុងមួយឆ្នាំ ។ សំណើចរ័ ។',
  'Our students and faculty consistently earn national and international recognition for excellence in academics, arts, and sports.',
  NULL,
  'linear-gradient(135deg, #1a1a3e 0%, #2d2d7a 50%, #4a47a3 100%)',
  'ពានរង្វាន់',
  'Our Achievements',
  'ព័ត៌មាន',
  'Latest News',
  '/achievements',
  '/news',
  4,
  true
),
(
  'ថ្ងៃស្អែក ចាប់ផ្ដើម នៅ ថ្ងៃ នេះ',
  'Your Future Starts Here',
  'ចូលរួម ជាមួយ គ្រួសារ វិទ្យាល័យ ដ៏ជោគជ័យ ។ ផ្ទេរ ការ ចុះ ឈ្មោះ ឥឡូវ នេះ ។',
  'Join our school community and take the first step toward a bright future. Admissions for the 2025–2026 academic year are now open.',
  NULL,
  'linear-gradient(135deg, #0d1c2f 0%, #1e3a8a 45%, #1565c0 100%)',
  'ដាក់ ពាក្យ ឥឡូវ',
  'Apply Now',
  'ទូរស័ព្ទ មក យើង',
  'Call Us',
  '/contact',
  '/contact',
  5,
  true
);
