-- ============================================================================
-- 019_seed_school_reports.sql
-- Seed the Operations Report content (JSONB) + a few sample report files.
-- Idempotent: only inserts when the target rows are absent.
-- ============================================================================

-- ─── 1. Operations Report content for 2024-2025 ─────────────────────────────

UPDATE public.school_reports
SET
  content = jsonb_build_object(
    'general', jsonb_build_object(
      'principal_km', 'លោកគ្រូប្រធាន សឿង វណ្ណៈ',
      'principal_en', 'Mr. Suong Vanna, Principal',
      'total_staff', 68,
      'total_students', 1842,
      'total_classes', 42,
      'land_area_sqm', 21253,
      'established_year', 2000,
      'summary_km', 'វិទ្យាល័យកំរៀងគឺជាសាលារៀនមធ្យមសិក្សាសាធើរណៈ ស្ថិតនៅស្រុកកំរៀង ខេត្តបាត់ដំបង ដែលបម្រើសហគមន៍ជនបទតាំងពីឆ្នាំ ២០០០។ សាលារៀនផ្តល់ការអប់រំប្រកបដោយគុណភាពសម្រាប់សិស្សគ្រប់រូប។',
      'summary_en', 'Kamrieng High School is a public secondary school in Kamrieng district, Battambang province, serving the rural community since 2000. The school is committed to providing quality education for every student.'
    ),
    'teaching_hours', jsonb_build_object(
      'weekly_hours', 28,
      'notes_km', 'ម៉ោងសិក្សាប្រចាំសប្តាហ៍មានចំនួន ២៨ ម៉ោង ដោយមានម៉ោងសកម្មភាព និងកីឡានៅពេលរសៀល។',
      'notes_en', 'The weekly teaching load is 28 hours, including afternoon activity and sports periods.'
    ),
    'student_stats', jsonb_build_object(
      'items', jsonb_build_array(
        jsonb_build_object('label_km', 'សិស្សសរុប', 'label_en', 'Total Students', 'value', 1842, 'suffix', ''),
        jsonb_build_object('label_km', 'សិស្សប្រឡងជាប់ BAC II', 'label_en', 'BAC II Pass', 'value', 96, 'suffix', '%'),
        jsonb_build_object('label_km', 'សិស្សប្រុស', 'label_en', 'Male Students', 'value', 941, 'suffix', ''),
        jsonb_build_object('label_km', 'សិស្សស្រី', 'label_en', 'Female Students', 'value', 901, 'suffix', ''),
        jsonb_build_object('label_km', 'ថ្នាក់រៀន', 'label_en', 'Classes', 'value', 42, 'suffix', ''),
        jsonb_build_object('label_km', 'សិស្សថ្មី', 'label_en', 'New Students', 'value', 312, 'suffix', '')
      ),
      'notes_km', 'ស្ថិតិសិស្សសម្រាប់ឆ្នាំសិក្សា ២០២៤-២០២៥ ដែលបង្ហាញពីអត្រាអញ្ញាបកម្មកើនឡើងជារៀងរាល់ឆ្នាំ។',
      'notes_en', 'Student statistics for the 2024-2025 academic year, showing steady year-on-year improvement.'
    ),
    'staff_status', jsonb_build_array(
      jsonb_build_object('label_km', 'គ្រូបង្រៀន', 'label_en', 'Teachers', 'count', 56),
      jsonb_build_object('label_km', 'បុគ្គលិករដ្ឋបាល', 'label_en', 'Admin Staff', 'count', 8),
      jsonb_build_object('label_km', 'អ្នករក្សាសន្តិសុខ', 'label_en', 'Support Staff', 'count', 4)
    ),
    'facilities', jsonb_build_object(
      'items', jsonb_build_array(
        jsonb_build_object('label_km', 'បន្ទប់រៀន', 'label_en', 'Classrooms', 'detail_km', 'ចំនួន ៤៥ បន្ទប់', 'detail_en', '45 classrooms'),
        jsonb_build_object('label_km', 'បន្ទប់ពិសោធន៍', 'label_en', 'Science Labs', 'detail_km', 'មន្ទីរពិសោធន៍វិទ្យាសាស្ត្រ ៣', 'detail_en', '3 science laboratories'),
        jsonb_build_object('label_km', 'បណ្ណាល័យ', 'label_en', 'Library', 'detail_km', 'មានសៀវភៅជាង ៥ ០០០ ក្បាល', 'detail_en', 'Library with 5,000+ books'),
        jsonb_build_object('label_km', 'អគារកុំព្យូទ័រ', 'label_en', 'Computer Lab', 'detail_km', 'មន្ទីរកុំព្យូទ័រ ២ មានម៉ាស៊ីន ៦០', 'detail_en', '2 computer labs with 60 machines'),
        jsonb_build_object('label_km', 'ទីលានកីឡា', 'label_en', 'Sports Ground', 'detail_km', 'ទីលានបាល់ទាត់ និងបាល់ទៅ', 'detail_en', 'Football and volleyball fields')
      ),
      'notes_km', 'ហេដ្ឋារចនាសម្ព័ន្ធសាលារៀនត្រូវបានពង្រីកជាបន្តបន្ទាប់ដើម្បីគាំទ្រសិស្សកើនឡើង។',
      'notes_en', 'School facilities have been expanded progressively to support the growing student population.'
    ),
    'budget', jsonb_build_object(
      'currency', 'USD',
      'items', jsonb_build_array(
        jsonb_build_object('label_km', 'ប្រាក់ខែបុគ្គលិក', 'label_en', 'Staff Salaries', 'amount', 142000),
        jsonb_build_object('label_km', 'សម្ភារៈអប់រំ', 'label_en', 'Educational Materials', 'amount', 28000),
        jsonb_build_object('label_km', 'ថែទាំ និងជួសជុល', 'label_en', 'Maintenance', 'amount', 18000),
        jsonb_build_object('label_km', 'សកម្មភាពសិស្ស', 'label_en', 'Student Activities', 'amount', 9000)
      ),
      'notes_km', 'ថវិកាប្រចាំឆ្នាំមានប្រភពចម្បងពីរដ្ឋាភិបាល និងការបរិច្ចាគរបស់អ្នកគាំទ្រ។',
      'notes_en', 'The annual budget is primarily funded by the government and community donations.'
    ),
    'challenges', jsonb_build_array(
      jsonb_build_object('title_km', 'កង្វះគ្រូបង្រៀន', 'title_en', 'Teacher Shortage', 'detail_km', 'ការខ្វះគ្រូបង្រៀនមុខវិជ្ជាវិទ្យាសាស្ត្រ និងភាសាបរទេស។', 'detail_en', 'Shortage of teachers in science subjects and foreign languages.'),
      jsonb_build_object('title_km', 'ហេដ្ឋារចនាសម្ព័ន្ធចាស់', 'title_en', 'Aging Facilities', 'detail_km', 'អគារមួយចំនួនត្រូវការជួសជុល និងធ្វើទំនើបកម្ម។', 'detail_en', 'Several buildings require repair and modernisation.'),
      jsonb_build_object('title_km', 'ឧបករណ៍បច្ចេកវិទ្យា', 'title_en', 'Technology Access', 'detail_km', 'ការធានាការចូលប្រើបច្ចេកវិទ្យាសម្រាប់សិស្សទាំងអស់។', 'detail_en', 'Ensuring equitable access to technology for all students.')
    ),
    'future_direction', jsonb_build_array(
      jsonb_build_object('km', 'ពង្រីកមុខវិជ្ចាសិក្សាជំនាញបច្ចេកវិទ្យា និងភាសាបរទេស។', 'en', 'Expand STEM and foreign-language programmes.'),
      jsonb_build_object('km', 'ធ្វើទំនើបកម្មហេដ្ឋារចនាសម្ព័ន្ធ និងបន្ទបំពាក់ឌីជីថល។', 'en', 'Modernise facilities and digital equipment.'),
      jsonb_build_object('km', 'ពង្រឹងភាពជាដៃគូជាមួយសហគមន៍ និងអង្គការក្រៅរដ្ឋាភិបាល។', 'en', 'Strengthen partnerships with the community and NGOs.'),
      jsonb_build_object('km', 'លើកកម្ពស់គុណភាពអប់រំតាមរយៈការបណ្តុះបណ្តាលគ្រូ។', 'en', 'Improve education quality through teacher training.')
    )
  ),
  is_published = true,
  updated_at = now()
WHERE academic_year = '2024-2025';

-- ─── 2. Sample report files ────────────────────────────────────────────────

INSERT INTO public.report_files (title_km, title_en, description_km, description_en, file_url, file_name, category, academic_year, sort_order, is_active)
SELECT * FROM (VALUES
  (
    'របាយការណ៍ប្រចាំឆ្នាំ ២០២៤-២០២៥',
    'Annual School Report 2024-2025',
    'របាយការណ៍ប្រតិបត្តិការប្រចាំឆ្នាំរបស់សាលា។',
    'The school''s annual operations report.',
    'https://example.com/reports/annual-2024-2025.pdf',
    'annual-2024-2025.pdf',
    'report',
    '2024-2025',
    1,
    true
  ),
  (
    'លទ្ធផលប្រឡង BAC II ២០២៤',
    'BAC II Examination Results 2024',
    'លទ្ធផលប្រឡងសញ្ញាបត្រមធ្យមសិក្សាទុតិយភូមិ ឆ្នាំ ២០២៤។',
    'Baccalaureate examination results for 2024.',
    'https://example.com/reports/bac2-results-2024.pdf',
    'bac2-results-2024.pdf',
    'result',
    '2023-2024',
    2,
    true
  ),
  (
    'ទម្រង់ចុះឈ្មោះសិស្សថ្មី',
    'New Student Registration Form',
    'ទម្រង់ស្នើសុំចុះឈ្មោះសម្រាប់សិស្សថ្មី។',
    'Application form for new student enrolment.',
    'https://example.com/reports/registration-form.pdf',
    'registration-form.pdf',
    'form',
    NULL,
    3,
    true
  ),
  (
    'គោលការណ៍វិន័យសិស្ស',
    'Student Code of Conduct Policy',
    'គោលការណ៍ និងវិន័យសម្រាប់សិស្ស។',
    'School policy and discipline guidelines for students.',
    'https://example.com/reports/code-of-conduct.pdf',
    'code-of-conduct.pdf',
    'policy',
    NULL,
    4,
    true
  )
) AS seed(title_km, title_en, description_km, description_en, file_url, file_name, category, academic_year, sort_order, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM public.report_files WHERE file_name = seed.file_name
);
