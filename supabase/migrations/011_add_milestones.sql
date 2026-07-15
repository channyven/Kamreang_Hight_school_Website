-- Create milestones table for About page management
CREATE TABLE milestones (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year          TEXT NOT NULL,
  title_km      TEXT NOT NULL,
  title_en      TEXT NOT NULL,
  description_km TEXT,
  description_en TEXT,
  image_url     TEXT,
  caption_km    TEXT,
  caption_en    TEXT,
  color         TEXT NOT NULL DEFAULT '#1e3a8a',
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_milestones_sort ON milestones (sort_order);
CREATE INDEX idx_milestones_active ON milestones (is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Public can read active milestones
CREATE POLICY "Public can read active milestones" ON milestones
  FOR SELECT USING (is_active = true);

-- Service role full access
CREATE POLICY "Service role full access milestones" ON milestones
  USING (auth.role() = 'service_role');

-- Auto-update updated_at trigger
CREATE TRIGGER trg_milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert default milestones from the existing hardcoded data
INSERT INTO milestones (year, title_km, title_en, description_km, description_en, image_url, caption_km, caption_en, color, sort_order, is_active) VALUES
(
  '2000',
  'បង្កើតសាលា',
  'School Founded',
  'វិទ្យាល័យកំរៀង ត្រូវបានបង្កើតឡើងតាមគំនិតផ្ដួចផ្ដើមរបស់លោក សុខ គង់ អភិបាលស្រុកកំរៀង និងលោក នូប ធឿន ប្រធានការិយាល័យអប់រំ យុវជន និងកីឡាស្រុកកំរៀង រួមជាមួយអាជ្ញាធរមូលដ្ឋាន។',
  'Kamrieng High School was founded through the initiative of the Kamrieng district governor and district education office, together with local authorities, to bring secondary education to this rural community.',
  '/images/about/school%20founding.jpg',
  'ការបង្កើតសាលា',
  'School Founding',
  '#1e3a8a',
  1,
  true
),
(
  '2022',
  'ទទួលស្គាល់ជា "សាលាល្អ"',
  'Recognized as a "Best School"',
  'ក្រសួងអប់រំ យុវជន និងកីឡា បានទទួលស្គាល់វិទ្យាល័យកំរៀងជា "សាលាល្អ" ។',
  'The Ministry of Education, Youth and Sport formally recognized Kamrieng High School as a "Best School" (សាលាល្អ).',
  '/images/about/Best%20School%20Award.png',
  'ពានរង្វាន់សាលាល្អ',
  'Best School Award',
  '#f59e0b',
  2,
  true
),
(
  '2024–2025',
  'ការកើនឡើងនៃចំនួនសិស្ស',
  'Growing Enrollment',
  'បច្ចុប្បន្នសាលាមានសិស្សចំនួន ២,១២៦ នាក់ ក្នុង ៤២ ថ្នាក់ ចាប់ពីថ្នាក់ទី ៧ ដល់ទី ១២ ដឹកនាំដោយគ្រូចំនួន ៥១ នាក់។',
  'The school now serves 2,126 students across 42 classes, Grade 7 through 12, guided by 51 teaching staff.',
  '/images/about/Enrollment%20Growth.png',
  'កំណើនសិស្ស',
  'Enrollment Growth',
  '#1e3a8a',
  3,
  true
);
