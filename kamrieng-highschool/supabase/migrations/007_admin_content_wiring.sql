-- ============================================================
-- Admin Content Wiring: Leadership positions, Teachers table,
-- and seed data for News / Achievements so public pages have
-- real content to display once wired to Supabase.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- LEADERSHIP: add position_km/position_en (admin UI already
-- edits these fields; backfill from existing title_km/title_en)
-- ─────────────────────────────────────────────────────────────

ALTER TABLE leadership ADD COLUMN IF NOT EXISTS position_km TEXT;
ALTER TABLE leadership ADD COLUMN IF NOT EXISTS position_en TEXT;

UPDATE leadership SET position_km = title_km WHERE position_km IS NULL;
UPDATE leadership SET position_en = title_en WHERE position_en IS NULL;

-- ─────────────────────────────────────────────────────────────
-- TEACHERS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS teachers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_km          TEXT NOT NULL,
  name_en          TEXT NOT NULL,
  subject_km       TEXT,
  subject_en       TEXT,
  department_km    TEXT,
  department_en    TEXT,
  qualification_km TEXT,
  qualification_en TEXT,
  photo_url        TEXT,
  years_experience INTEGER,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teachers_active ON teachers (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_teachers_sort ON teachers (sort_order);

DROP TRIGGER IF EXISTS trg_teachers_updated_at ON teachers;
CREATE TRIGGER trg_teachers_updated_at BEFORE UPDATE ON teachers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active teachers" ON teachers;
CREATE POLICY "Public can read active teachers" ON teachers
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access teachers" ON teachers;
CREATE POLICY "Service role full access teachers" ON teachers
  USING (auth.role() = 'service_role');

INSERT INTO teachers (name_km, name_en, subject_km, subject_en, department_km, department_en, qualification_km, qualification_en, photo_url, years_experience, sort_order) VALUES
  ('ស្រី វិបុល', 'Srey Vipol', 'ភាសាខ្មែរ', 'Khmer Literature', 'ផ្នែកភាសាខ្មែរ', 'Khmer Language', 'បរិញ្ញាបត្រ អក្សរសាស្ត្រ', 'B.A. in Khmer Literature', '/images/about/teacher-srey-vipol.png', 18, 1),
  ('ចាន់ ស្រីពេជ្រ', 'Chan Srey Pech', 'អក្សរសិល្ប៍ខ្មែរ', 'Classical Khmer Poetry', 'ផ្នែកភាសាខ្មែរ', 'Khmer Language', 'បរិញ្ញាបត្រ អក្សរសាស្ត្រ', 'B.A. in Arts', '/images/about/teacher-chan-srey-pech.png', 12, 2),
  ('ហេង ច័ន្ទដារ៉ា', 'Heng Chandara', 'គណិតវិទ្យា', 'Advanced Mathematics', 'ផ្នែកគណិតវិទ្យា', 'Mathematics', 'អនុបណ្ឌិត គណិតវិទ្យា', 'M.Sc. Mathematics', '/images/about/teacher-heng-chandara.png', 22, 3),
  ('នួន សុភ័ក្ត្រ', 'Nuon Sopheak', 'គណិតវិទ្យា / ស្ថិតិ', 'Mathematics & Statistics', 'ផ្នែកគណិតវិទ្យា', 'Mathematics', 'បរិញ្ញាបត្រ គណិតវិទ្យា', 'B.Sc. Mathematics', '/images/about/teacher-nuon-sopheak.png', 9, 4),
  ('ម៉ម ស្រីលក្ខណ៍', 'Mom Srey Leak', 'គីមីវិទ្យា', 'Chemistry', 'ផ្នែកវិទ្យាសាស្ត្រ', 'Sciences', 'បរិញ្ញាបត្រ គីមីវិទ្យា', 'B.Sc. Chemistry', '/images/about/teacher-mom-srey-leak.png', 14, 5),
  ('ប៉ែន វិទូ', 'Pen Vitou', 'រូបវិទ្យា', 'Physics', 'ផ្នែកវិទ្យាសាស្ត្រ', 'Sciences', 'អនុបណ្ឌិត រូបវិទ្យា', 'M.Sc. Physics', '/images/about/teacher-pen-vitou.png', 16, 6),
  ('លី ដានី', 'Ly Dany', 'ជីវវិទ្យា', 'Biology', 'ផ្នែកវិទ្យាសាស្ត្រ', 'Sciences', 'បរិញ្ញាបត្រ ជីវវិទ្យា', 'B.Sc. Biology', '/images/about/teacher-ly-dany.png', 7, 7),
  ('ទូច សុម៉ាលី', 'Touch Somaly', 'ប្រវត្តិវិទ្យា', 'History', 'ផ្នែកសង្គមវិទ្យា', 'Social Studies', 'បរិញ្ញាបត្រ ប្រវត្តិ', 'B.A. History', '/images/about/teacher-touch-somaly.png', 20, 8),
  ('ហ៊ុន រតនៈ', 'Hun Ratanak', 'ភូមិវិទ្យា / សេដ្ឋកិច្ច', 'Geography & Economics', 'ផ្នែកសង្គមវិទ្យា', 'Social Studies', 'បរិញ្ញាបត្រ ភូមិវិទ្យា', 'B.A. Geography', '/images/about/teacher-hun-ratanak.png', 11, 9),
  ('ស៊ុន ស្រីមុំ', 'Sun Srey Mom', 'ភាសាអង់គ្លេស', 'English Language', 'ផ្នែកភាសាបរទេស', 'Foreign Languages', 'អនុបណ្ឌិត ភាសាអង់គ្លេស', 'M.A. English Education', '/images/about/teacher-sun-srey-mom.png', 15, 10),
  ('ណុប ចន្ទ័ណែ', 'Nob Channey', 'ភាសាបារាំង', 'French Language', 'ផ្នែកភាសាបរទេស', 'Foreign Languages', 'បរិញ្ញាបត្រ ភាសាបារាំង', 'B.A. French', '/images/about/teacher-nob-channey.png', 8, 11),
  ('ឈួ ម៉ានិត', 'Chhour Manith', 'អប់រំកាយ', 'Physical Education', 'ផ្នែកកីឡា', 'Physical Education', 'បរិញ្ញាបត្រ អប់រំកាយ', 'B.Sc. Physical Education', '/images/about/teacher-chhour-manith.png', 10, 12),
  ('ស្រ័ព្ទ ម៉ារ៉ា', 'Sreap Mara', 'សិល្បៈ / តន្ត្រី', 'Arts & Music', 'ផ្នែកសិល្បៈ', 'Arts', 'បរិញ្ញាបត្រ សិល្បៈ', 'B.A. Fine Arts', '/images/about/teacher-sreap-mara.png', 6, 13),
  ('វ៉ាន់ ស្រីណា', 'Van Srina', 'បច្ចេកវិទ្យា / គណនា', 'ICT & Computer Science', 'ផ្នែកបច្ចេកវិទ្យា', 'Technology', 'បរិញ្ញាបត្រ វិទ្យាសាស្ត្រ​កុំព្យូទ័រ', 'B.Sc. Computer Science', '/images/about/teacher-van-srina.png', 5, 14)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- NEWS: add a Sports category and seed published articles
-- ─────────────────────────────────────────────────────────────

INSERT INTO news_categories (name_km, name_en, slug, sort_order) VALUES
  ('កីឡា', 'Sports', 'sports', 6)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO news (title_km, title_en, slug, excerpt_km, excerpt_en, content_km, content_en, is_featured, status, publish_date, view_count, category_id) VALUES
  ('វិទ្យាល័យជោគជ័យក្នុងការប្រឡងជាតិ', 'School Achieves Outstanding National Exam Results', 'national-exam-results-2025',
   'សិស្សថ្នាក់ទី១២ ចំនួន ៩៦% បានឆ្លងការប្រឡង BAC II ជាមួយនឹងលទ្ធផលល្អ', '96% of Grade 12 students passed the national BAC II examination with excellent results this year.',
   '<p>សិស្សថ្នាក់ទី១២ ចំនួន ៩៦% បានឆ្លងការប្រឡង BAC II ជាមួយនឹងលទ្ធផលល្អ។ ស្ថិតក្នុងនោះ មានសិស្ស ៣១២ នាក់ ទទួលបានថ្នាក់ A។ ជោគជ័យនេះ គឺជាលទ្ធផលនៃការខិតខំប្រឹងប្រែង របស់សិស្ស គ្រូ និងអាណាព្យាបាល។</p>',
   '<p>A total of 96% of Grade 12 students passed the national BAC II examination with outstanding results. Among them, 312 students received Grade A honors. This achievement reflects the dedication of students, teachers, and parents alike.</p>',
   true, 'published', '2025-06-10T00:00:00Z', 1240, (SELECT id FROM news_categories WHERE slug = 'announcements')),

  ('ពិធីបុណ្យរំលឹកខួបកំណើតសាលា', 'School Anniversary Celebration', 'school-anniversary-2025',
   'ពិធីប្រារព្ធខួបកំណើតលើកទី ៤០ នៃវិទ្យាល័យ', 'The school celebrates its 40th anniversary with a grand ceremony attended by students, parents and distinguished guests.',
   '<p>ពិធីប្រារព្ធខួបកំណើតលើកទី ៤០ នៃវិទ្យាល័យ ត្រូវបានរៀបចំដ៏អ៊ីចឹងទ្រង់ទ្រាយ ជាមួយប្រជុំ​ ២០០០ នាក់។</p>',
   '<p>The school''s 40th anniversary was celebrated grandly with more than 2,000 attendees including students, parents, alumni, and government representatives. The event featured performances, awards, and a historical exhibition.</p>',
   false, 'published', '2025-05-20T00:00:00Z', 890, (SELECT id FROM news_categories WHERE slug = 'events')),

  ('សិស្សឈ្នះអូឡាំពិចគណិតអន្តរជាតិ', 'Students Win International Math Olympiad', 'math-olympiad-win-2025',
   'សិស្ស ៤ នាក់ ពីវិទ្យាល័យ ទទួលបានមេដាយមាសសៀងហៃ', 'Four students from our school won gold medals at the international mathematics olympiad held in Shanghai.',
   '<p>សិស្ស ៤ នាក់ ពីវិទ្យាល័យ ទទួលបានមេដាយមាសសៀងហៃ។ ជំនាញគណិតវិទ្យាខ្ពស់ ត្រូវបានបង្ហាញ ដ៏ច្បាស់លាស់ ។</p>',
   '<p>Four students from our school brought home gold medals from the International Mathematical Olympiad held in Shanghai, China. This remarkable achievement places our school among the top institutions in Southeast Asia for mathematics education.</p>',
   true, 'published', '2025-04-15T00:00:00Z', 2100, (SELECT id FROM news_categories WHERE slug = 'academic')),

  ('ការប្រកួតបាល់ទាត់អន្តរវិទ្យាល័យ', 'Inter-School Football Championship', 'football-championship-2025',
   'ក្រុមបាល់ទាត់វិទ្យាល័យ ឈ្នះចំណាត់ថ្នាក់ទី១ ក្នុងការប្រកួតខេត្ត', 'Our school football team wins first place in the provincial inter-school championship tournament.',
   '<p>ក្រុមបាល់ទាត់វិទ្យាល័យ ឈ្នះចំណាត់ថ្នាក់ទី១ ក្នុងការប្រកួតខេត្ត ។</p>',
   '<p>Our school''s football team clinched first place in the provincial inter-school championship, defeating 12 other schools. The team demonstrated exceptional teamwork and skill throughout the tournament.</p>',
   false, 'published', '2025-03-22T00:00:00Z', 670, (SELECT id FROM news_categories WHERE slug = 'sports')),

  ('ទស្សនកិច្ចសិក្សា ទៅប្រទេសជប៉ុន', 'Educational Study Tour to Japan', 'japan-study-tour-2025',
   'សិស្ស ៣០ នាក់ ចូលរួមក្នុងកម្មវិធីផ្លាស់ប្ដូរ វប្បធម៌ ជប៉ុន–កម្ពុជា', '30 outstanding students participated in the Japan–Cambodia cultural exchange program in Tokyo.',
   '<p>សិស្ស ៣០ នាក់ ចូលរួមក្នុងកម្មវិធីផ្លាស់ប្ដូរ វប្បធម៌ ជប៉ុន–កម្ពុជា ។</p>',
   '<p>30 outstanding students participated in the Japan–Cambodia cultural and educational exchange program in Tokyo. They visited universities, technology companies, and cultural landmarks, enriching their global perspective.</p>',
   false, 'published', '2025-02-10T00:00:00Z', 540, (SELECT id FROM news_categories WHERE slug = 'events')),

  ('ចាប់ផ្ដើមឆ្នាំសិក្សា ២០២៥–២០២៦', 'New Academic Year 2025–2026 Opening', 'new-academic-year-2025-2026',
   'វិទ្យាល័យ ស្វាគមន៍សិស្សចូលថ្មី ១៨៧ នាក់ ទៅក្នុងឆ្នាំសិក្សាថ្មី', 'The school welcomes 187 new students at the opening ceremony of the 2025–2026 academic year.',
   '<p>ឆ្នាំសិក្សា ២០២៥–២០២៦ ត្រូវបានចាប់ផ្ដើមជាផ្លូវការ ជាមួយនឹងពិធីស្វាគមន៍ ។</p>',
   '<p>The 2025–2026 academic year officially kicked off with a welcoming ceremony for 187 new students. The school''s principal delivered an inspiring speech encouraging excellence and character-building throughout the year.</p>',
   false, 'published', '2025-01-07T00:00:00Z', 420, (SELECT id FROM news_categories WHERE slug = 'announcements')),

  ('ការប្រឡងពាក់កណ្ដាលឆ្នាំ', 'Mid-Year Examination Schedule Released', 'mid-year-exam-schedule',
   'ប្រព័ន្ធការប្រឡងពាក់កណ្ដាលឆ្នាំ ២០២៥ ត្រូវបានប្រកាស', 'The mid-year examination schedule for all grades has been officially announced.',
   '<p>ការប្រឡងពាក់កណ្ដាលឆ្នាំ ២០២៥ ត្រូវបានប្រកាស ។</p>',
   '<p>The examination schedule for the mid-year assessments has been published. All students are reminded to collect their admission cards from the administrative office before the examination week.</p>',
   false, 'published', '2024-12-15T00:00:00Z', 780, (SELECT id FROM news_categories WHERE slug = 'announcements')),

  ('ពិធីប្រគល់វិញ្ញាបនប័ត្រ', 'Graduation Ceremony 2024', 'graduation-ceremony-2024',
   'ពិធីប្រគល់វិញ្ញាបនប័ត្រសិស្សបញ្ចប់ការសិក្សា ឆ្នាំ ២០២៤', 'The 2024 graduation ceremony honours students who completed their high school education.',
   '<p>ពិធីប្រគល់វិញ្ញាបនប័ត្រ ២០២៤ ។</p>',
   '<p>The 2024 graduation ceremony was held in the school auditorium. Over 300 graduates received their diplomas in the presence of their families and school staff. The valedictorian delivered an emotional and inspiring speech.</p>',
   false, 'published', '2024-11-20T00:00:00Z', 1560, (SELECT id FROM news_categories WHERE slug = 'events')),

  ('ផ្ទះសៀវភៅស្ដីអំពីការអប់រំ', 'New Science Lab Equipment Installed', 'new-science-lab-equipment',
   'មន្ទីរពិសោធន៍វិទ្យាសាស្ត្រ ទទួលបានបរិក្ខារថ្មី ពីអ្នកឧបត្ថម្ភ', 'The science laboratory receives new state-of-the-art equipment donated by a generous benefactor.',
   '<p>មន្ទីរពិសោធន៍វិទ្យាសាស្ត្រ ទទួលបានបរិក្ខារថ្មី ។</p>',
   '<p>Thanks to a generous donation, the school''s science laboratory has been fully equipped with modern apparatus for chemistry, biology, and physics experiments. This upgrade will greatly enhance the learning experience for all science students.</p>',
   false, 'published', '2024-10-05T00:00:00Z', 340, (SELECT id FROM news_categories WHERE slug = 'academic'))
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- ACHIEVEMENTS: seed published records
-- ─────────────────────────────────────────────────────────────

INSERT INTO achievements (title_km, title_en, description_km, description_en, achievement_type, award_level, achievement_date, participant_name, is_featured, status) VALUES
  ('មេដាយមាស ប្រឡងគណិតអន្តរជាតិ', 'Gold Medal – International Math Olympiad', 'សិស្ស ស្រេង ដានី ទទួលបានមេដាយមាស ក្នុងការប្រឡងគណិតអន្តរជាតិ', 'Student Seng Dany won the gold medal at the International Mathematical Olympiad held in Shanghai.', 'student', 'national', '2025-04-15', 'Seng Dany', true, 'published'),
  ('ពានរង្វាន់ វិទ្យាល័យឆ្នើម ២០២៥', 'Best School Award 2025', 'វិទ្យាល័យ ទទួលបានពានរង្វាន់ វិទ្យាល័យឆ្នើម ថ្នាក់ខេត្ត', 'Our school was recognized as the Best High School at the provincial level for academic excellence.', 'school', 'provincial', '2025-03-10', NULL, true, 'published'),
  ('ពានរង្វាន់ គ្រូបង្រៀនឆ្នើម', 'Outstanding Teacher Award', 'គ្រូ ចាន់ សុភា ទទួលបានពានរង្វាន់ គ្រូបង្រៀនឆ្នើម ថ្នាក់ជាតិ', 'Teacher Chan Sophea received the national Outstanding Teacher Award for innovative teaching methods.', 'teacher', 'national', '2025-02-20', 'Chan Sophea', false, 'published'),
  ('ឈ្នះជើងឯក ការប្រកួតស្ទើរខេត្ត', 'Provincial Football Champions', 'ក្រុមបាល់ទាត់ ឈ្នះជើងឯក ការប្រកួតខេត្ត', 'The school football team won the provincial championship, defeating 12 other schools.', 'school', 'provincial', '2025-03-22', NULL, false, 'published'),
  ('ទី ១ ការប្រឡងភូមិវិទ្យា', '1st Place – Geography Olympiad', 'សិស្ស ហួន ស្រីនាង ទទួលបានទី ១ ក្នុងការប្រឡងភូមិវិទ្យា ថ្នាក់ខេត្ត', 'Student Houn Srey Neang achieved first place in the provincial geography olympiad.', 'student', 'provincial', '2024-12-10', 'Houn Srey Neang', false, 'published'),
  ('ទទួលបានអាហារូបករណ៍ UN', 'UN Scholarship Recipients', 'សិស្ស ៣ នាក់ ទទួលបានអាហារូបករណ៍ UN សម្រាប់ការសិក្សានៅបរទេស', 'Three students received UN scholarships to pursue higher education abroad.', 'student', 'national', '2024-11-05', NULL, false, 'published');
