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
   '<p>វិទ្យាល័យកំរៀងត្រូវបានបង្កើតឡើងក្នុងឆ្នាំ ២០០០ តាមគំនិតផ្ដួចផ្ដើមរបស់លោក សុខ គង់ អភិបាលស្រុកកំរៀង និងលោក នូប ធឿន ប្រធានការិយាល័យអប់រំ យុវជន និងកីឡាស្រុកកំរៀង រួមជាមួយអាជ្ញាធរមូលដ្ឋាននៃស្រុកកំរៀង។ សាលាស្ថិតនៅលើផ្ទៃដី ២១,២៥៣ ម៉ែត្រការ៉េ ក្នុងភូមិអូរដា ឃុំអូរដា ស្រុកកំរៀង ខេត្តបាត់ដំបង ជិតព្រំដែនខេត្តប៉ៃលិន។</p><p>បច្ចុប្បន្នបរិវេណសាលារួមមាន អគារសិក្សាចំនួន ៥ (៥០ បន្ទប់) អគាររដ្ឋបាល និងអគារស្នាក់នៅសម្រាប់គ្រូ និងសិស្ស បម្រើដល់ថ្នាក់ទី ៧ ដល់ទី ១២។ បេសកកម្មរបស់យើងគឺពង្រីកលទ្ធភាពទទួលបានការអប់រំប្រកបដោយគុណភាពសម្រាប់កុមារនៃសហគមន៍ជនបទនេះ កសាងចំណេះដឹង និងធនធានមនុស្សដែលសិស្សរបស់យើងត្រូវការសម្រាប់អនាគតរបស់ពួកគេ ស្របតាមយុទ្ធសាស្ត្រអប់រំជាតិរបស់រាជរដ្ឋាភិបាល។</p>',
   '<p>Kamrieng High School was established in 2000, through the vision and initiative of Mr. Sok Kong, Governor of Kamrieng District, and Mr. Nub Thoeun, Head of the Kamrieng District Office of Education, Youth and Sport, together with the local authorities of Kamrieng district. The school sits on 21,253 m² of land in Ou Da village, Ou Da commune, Kamrieng district, Battambang province, near the border with Pailin province.</p><p>Today the campus includes five classroom buildings (50 classrooms), an administration building, and a dormitory for teachers and students, serving Grade 7 through Grade 12. Our mission is to expand access to quality education for the children of this rural community, building the knowledge and human resources our students need for their future, in line with the government&#x27;s national education strategy.</p>',
   1),
  ('vision',
   'ចក្ខុវិស័យ',
   'Our Vision',
   '<p>វិទ្យាល័យកំរៀងនឹងក្លាយជាសាលាគំរូក្នុងការបណ្តុះបណ្តាលធនធានមនុស្សប្រកបដោយគុណភាព សមធម៌ និងបរិយាប័ន្ន។</p>',
   '<p>Kamrieng High School will become a model school in cultivating human resources with quality, equity, and inclusiveness.</p>',
   2),
  ('mission',
   'បេសកកម្ម',
   'Our Mission',
   '<p>គ្រប់គ្រង និងដឹកនាំការបង្រៀន និងរៀន ហើយសហការបានល្អជាមួយភាគីពាក់ព័ន្ធទាំងអស់ ដើម្បីអភិវឌ្ឍវិទ្យាល័យកំរៀងឱ្យក្លាយជាសាលាគំរូ។</p>',
   '<p>Manage and lead teaching and learning, and cooperate well with all relevant stakeholders in order to develop Kamrieng High School into a model school.</p>',
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
