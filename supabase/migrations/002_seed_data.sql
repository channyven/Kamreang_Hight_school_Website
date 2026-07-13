-- ============================================================
-- Seed Data
-- ============================================================

-- ─── News Categories ─────────────────────────────────────────
INSERT INTO news_categories (name_km, name_en, slug, sort_order) VALUES
  ('ព័ត៌មានក្រសួង', 'Ministry News', 'ministry-news', 1),
  ('ព័ត៌មានសាលា', 'School News', 'school-news', 2),
  ('សេចក្តីប្រកាស', 'Announcements', 'announcements', 3),
  ('ព្រឹត្តិការណ៍', 'Events', 'events', 4),
  ('ឱកាសសិក្សា', 'Academic Opportunities', 'academic', 5);

-- ─── Activity Categories ─────────────────────────────────────
INSERT INTO activity_categories (name_km, name_en, slug, color, sort_order) VALUES
  ('ការប្រកួតបញ្ញា', 'Academic Competition', 'academic-competition', '#1e3a8a', 1),
  ('សកម្មភាពកីឡា', 'Sports Activities', 'sports', '#16a34a', 2),
  ('សិល្បៈ និង វប្បធម៌', 'Arts & Culture', 'arts-culture', '#7c3aed', 3),
  ('សេវាសង្គម', 'Community Service', 'community-service', '#ea580c', 4),
  ('ដំណើរទស្សនកិច្ច', 'Field Trips', 'field-trips', '#0891b2', 5),
  ('ពិធីប្រគល់វិញ្ញាបនប័ត្រ', 'Graduation', 'graduation', '#f59e0b', 6);

-- ─── Download Categories ─────────────────────────────────────
INSERT INTO download_categories (name_km, name_en, slug, icon, sort_order) VALUES
  ('បែបបទចុះឈ្មោះ', 'Registration Forms', 'registration', 'file-text', 1),
  ('គោលនយោបាយសាលា', 'School Policies', 'policies', 'shield', 2),
  ('កាលវិភាគសិក្សា', 'Academic Calendar', 'calendar', 'calendar', 3),
  ('ឯកសារផ្លូវការ', 'Official Documents', 'official', 'file', 4),
  ('ឯកសារប្រលង', 'Exam Documents', 'exams', 'clipboard', 5);

-- ─── School Information ───────────────────────────────────────
INSERT INTO school_info (section, title_km, title_en, content_km, content_en, sort_order) VALUES
  ('history',
   'ប្រវត្តិសាលា',
   'School History',
   'វិទ្យាល័យកំរៀង ត្រូវបានបង្កើតឡើងក្នុងឆ្នាំ ១៩៦០ ហើយបានក្លាយជាសាលាល្អឥតខ្ចោះមួយ...',
   'Kamrieng High School was established in 1960 and has become one of the leading educational institutions...',
   1),
  ('vision',
   'ចក្ខុវិស័យ',
   'Vision',
   'ក្លាយជាសាលាឆ្នើមមួយ ដែលផលិតនូវសិស្សានុសិស្សសម្បូរជំនាញ...',
   'To become an excellent school that produces highly skilled and knowledgeable students...',
   2),
  ('mission',
   'បេសកកម្ម',
   'Mission',
   'ផ្តល់នូវការអប់រំប្រកបដោយគុណភាព ក្នុងបរិយាកាសសិក្សាដ៏ល្អ...',
   'Provide quality education in a conducive learning environment that nurtures intellectual growth...',
   3),
  ('values',
   'គុណតម្លៃស្នូល',
   'Core Values',
   'ខ្ញុំជឿជាក់លើ: ភាពស្មោះត្រង់, ការខិតខំ, ភាពថ្លៃថ្នូរ, ការគោរពគ្នាទៅវិញទៅមក',
   'We believe in: Integrity, Excellence, Dignity, Mutual Respect',
   4);

-- ─── Current Statistics ───────────────────────────────────────
INSERT INTO statistics (
  academic_year, total_students, total_teachers, total_classes,
  grade_a_students, graduation_rate, male_students, female_students, is_current
) VALUES
  ('2023-2024', 2850, 95, 64, 320, 94.5, 1380, 1470, true),
  ('2022-2023', 2720, 90, 60, 290, 93.2, 1310, 1410, false),
  ('2021-2022', 2600, 87, 58, 270, 92.0, 1260, 1340, false),
  ('2020-2021', 2480, 84, 56, 245, 91.5, 1200, 1280, false),
  ('2019-2020', 2350, 80, 54, 220, 90.8, 1140, 1210, false);

-- ─── Sample Leadership ────────────────────────────────────────
INSERT INTO leadership (name_km, name_en, title_km, title_en, sort_order) VALUES
  (' លោក ចន្ទ សុភ័ក្ត្រ', 'Chan Sopheak', 'នាយកវិទ្យាល័យ', 'School Principal', 1),
  ('លោក គឹម សារ៉ែ', 'Kim Sarey', 'នាយករងទី ១', '1st Vice Principal', 2),
  ('លោកស្រី នូ វណ្ណៈ', 'Nou Vanna', 'នាយករងទី ២', '2nd Vice Principal', 3),
  ('លោក ប៉ូ ចន្ទ', 'Po Chan', 'ប្រធានដេប៉ាតឺម៉ង់គណិតវិទ្យា', 'Head of Mathematics Dept.', 4),
  ('លោកស្រី ហ៊ន ណារ', 'Houn Nar', 'ប្រធានដេប៉ាតឺម៉ង់ភាសាខ្មែរ', 'Head of Khmer Language Dept.', 5),
  ('លោក ចា ណារ', 'Cha Nar', 'ប្រធានដេប៉ាតឺម៉ង់វិទ្យាសាស្ត្រ', 'Head of Science Dept.', 6);
