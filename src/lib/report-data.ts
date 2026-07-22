
import type { Locale } from "@/i18n/config";
import type {
  SchoolReport as DbSchoolReport,
  OperationsReportContent,
} from "@/types";

// --- INTERFACES ---

export interface LocalizedText {
  km: string;
  en: string;
}

export interface ReportGeneralInfo {
  academicYear: LocalizedText;
  principal: LocalizedText;
  totalStaff: number;
  totalStudents: number;
  totalClasses: number;
  landAreaSqm: number;
  establishedYear: number;
  summary: LocalizedText;
}

export interface TeachingHours {
  weeklyHours: number;
  dailySchedule: { period: LocalizedText; time: string }[];
  notes: LocalizedText;
}

export interface RegularTesting {
  monthlyTests: LocalizedText;
  semesterTests: LocalizedText;
  notes: LocalizedText;
}

export interface Planning {
  schoolImprovementPlan: LocalizedText;
  teacherDevelopmentPlan: LocalizedText;
  studentSupportPlan: LocalizedText;
}

export interface Agreements {
  teacherContracts: LocalizedText;
  communityPartnerships: LocalizedText;
}

export interface SelfAssessment {
  modelSchoolStandard: LocalizedText;
  lastAssessmentDate: LocalizedText;
  score: number;
  maxScore: number;
}

export interface Awards {
  awards: { title: LocalizedText; year: number }[];
}

export interface Timetables {
  grade7: LocalizedText;
  grade8: LocalizedText;
  grade9: LocalizedText;
  grade10: LocalizedText;
  grade11: LocalizedText;
  grade12: LocalizedText;
}

export interface StudentStatItem {
  label: LocalizedText;
  value: number;
  suffix?: string;
}

export interface StudentStats {
  items: StudentStatItem[];
  notes: LocalizedText;
}

export interface FeederSchools {
  schools: { name: LocalizedText; studentCount: number }[];
}

export interface AcademicResults {
  grade9PassRate: number;
  grade12PassRate: number;
  topStudents: { name: string; score: number }[];
}

export interface StaffStatusItem {
  label: LocalizedText;
  count: number;
  color: string;
}

export interface FacilitiesSection {
  items: { label: LocalizedText; detail: LocalizedText }[];
  textbookStatus: { subject: LocalizedText; studentRatio: number }[];
  notes: LocalizedText;
}

export interface BudgetSection {
  currency: string;
  totalBudget: number;
  communitySupport: number;
  expenditure: { label: LocalizedText; amount: number }[];
  remainingBalance: number;
  notes: LocalizedText;
}

export interface ChallengeItem {
  title: LocalizedText;
  detail: LocalizedText;
}

export interface ReportSection {
  id: string;
  title: LocalizedText;
  icon: string;
}

export interface SchoolReport {
  general: ReportGeneralInfo;
  teachingHours: TeachingHours;
  regularTesting: RegularTesting;
  planning: Planning;
  agreements: Agreements;
  selfAssessment: SelfAssessment;
  awards: Awards;
  timetables: Timetables;
  studentStats: StudentStats;
  feederSchools: FeederSchools;
  academicResults: AcademicResults;
  staffStatus: StaffStatusItem[];
  facilities: FacilitiesSection;
  budget: BudgetSection;
  challenges: ChallengeItem[];
  futureDirection: LocalizedText[];
}

// --- REPORT SECTIONS (for navigation) ---

export const reportSections: ReportSection[] = [
  { id: "general", title: { km: "ព័ត៌មានទូទៅរបស់សាលា", en: "General School Information" }, icon: "Info" },
  { id: "teachingHours", title: { km: "ម៉ោងបង្រៀន", en: "Teaching Hours" }, icon: "Clock" },
  { id: "regularTesting", title: { km: "ការប្រលងប្រចាំ", en: "Regular Testing" }, icon: "ClipboardCheck" },
  { id: "planning", title: { km: "ផែនការសាលា គ្រូ និងសិស្ស", en: "School, Teacher & Student Planning" }, icon: "Book" },
  { id: "agreements", title: { km: "កិច្ចព្រមព្រៀងការងារប្រចាំឆ្នាំ", en: "Annual Work Agreements" }, icon: "FileText" },
  { id: "selfAssessment", title: { km: "ការវាយតម្លៃខ្លួនឯង — ស្តង់ដាសាលាគំរូ", en: "Self-Assessment — Model School Standards" }, icon: "Award" },
  { id: "awards", title: { km: "រង្វាន់ និងការទទួលស្គាល់", en: "Awards & Recognitions" }, icon: "Trophy" },
  { id: "timetables", title: { km: "កាលវិភាគម៉ោងបង្រៀនតាមកម្រិតថ្នាក់", en: "Teaching-Hour Timetables by Grade" }, icon: "Calendar" },
  { id: "studentStats", title: { km: "ស្ថិតិសិស្ស", en: "Student Statistics" }, icon: "Users" },
  { id: "feederSchools", title: { km: "សាលាបឋមសិក្សាបន្ត", en: "Feeder Schools" }, icon: "Building" },
  { id: "academicResults", title: { km: "លទ្ធផលសិក្សា", en: "Academic Results" }, icon: "BarChart2" },
  { id: "staffStatus", title: { km: "ស្ថានភាពបុគ្គលិកបង្រៀន", en: "Teaching Staff Status" }, icon: "UserCheck" },
  { id: "textbookStatus", title: { km: "ស្ថានភាពសៀវភៅសិក្សា", en: "Textbook Status" }, icon: "BookOpen" },
  { id: "budget", title: { km: "ថវិកាប្រតិបត្តិ និងការគាំទ្រពីសហគមន៍", en: "Operating Budget & Community Support" }, icon: "Wallet" },
  { id: "challenges", title: { km: "បញ្ហាប្រឈមបច្ចុប្បន្ន", en: "Current Challenges" }, icon: "AlertTriangle" },
  { id: "futureDirection", title: { km: "ទិសដៅអនាគត", en: "Future Direction" }, icon: "Rocket" },
];

// --- MOCK DATA ---

export const schoolReport: SchoolReport = {
  general: {
    academicYear: { km: "ឆ្នាំសិក្សា ២០២៣-២០២៤", en: "Academic Year 2023-2024" },
    principal: { km: "លោកគ្រូប្រធាន សឿង វណ្ណៈ", en: "Mr. Suong Vanna, Principal" },
    totalStaff: 68,
    totalStudents: 1842,
    totalClasses: 42,
    landAreaSqm: 21253,
    establishedYear: 2000,
    summary: {
      km: "វិទ្យាល័យកំរៀងគឺជាសាលារៀនមធ្យមសិក្សាសាធើរណៈ ស្ថិតនៅស្រុកកំរៀង ខេត្តបាត់ដំបង ដែលបម្រើសហគមន៍ជនបទតាំងពីឆ្នាំ ២០០០។ សាលារៀនផ្តល់ការអប់រំប្រកបដោយគុណភាពសម្រាប់សិស្សគ្រប់រូប។",
      en: "Kamrieng High School is a public secondary school in Kamrieng district, Battambang province, serving the rural community since 2000. The school is committed to providing quality education for every student.",
    },
  },
  teachingHours: {
    weeklyHours: 28,
    dailySchedule: [
        { period: { km: "ម៉ោងទី ១-២", en: "Period 1-2" }, time: "07:30 – 09:10" },
        { period: { km: "ម៉ោងទី ៣-៤", en: "Period 3-4" }, time: "09:20 – 11:00" },
        { period: { km: "ពេលវេលាពេលថ្ងៃត្រង់", en: "Lunch Break" }, time: "11:00 – 13:00" },
        { period: { km: "ម៉ោងទី ៥-៦", en: "Period 5-6" }, time: "13:00 – 14:40" },
        { period: { km: "ម៉ោងសកម្មភាព", en: "Activity Period" }, time: "14:50 – 15:40" },
    ],
    notes: {
      km: "ម៉ោងសិក្សាប្រចាំសប្តាហ៍មានចំនួន ២៨ ម៉ោង ដោយមានម៉ោងសកម្មភាព និងកីឡានៅពេលរសៀល។",
      en: "The weekly teaching load is 28 hours, including afternoon activity and sports periods.",
    },
  },
  regularTesting: {
    monthlyTests: { km: "រៀងរាល់ចុងខែ", en: "End of every month" },
    semesterTests: { km: "ពីរដងក្នុងមួយឆ្នាំ (ខែមករា និងខែមិថុនា)", en: "Twice a year (January and June)" },
    notes: {
      km: "ការធ្វើតេស្តទៀងទាត់ធានាបាននូវការវាយតម្លៃជាបន្តបន្ទាប់នៃវឌ្ឍនភាពរបស់សិស្ស។",
      en: "Regular testing ensures continuous assessment of student progress.",
    },
  },
  planning: {
    schoolImprovementPlan: { km: "ផែនការកែលម្អសាលារៀនផ្តោតលើការអភិវឌ្ឍហេដ្ឋារចនាសម្ព័ន្ធ និងគុណភាពអប់រំ។", en: "School improvement plan focuses on infrastructure and quality of education." },
    teacherDevelopmentPlan: { km: "ផែនការអភិវឌ្ឍន៍គ្រូបង្រៀនរួមមានវគ្គបណ្តុះបណ្តាល និងសិក្ខាសាលា។", en: "Teacher development plan includes training and workshops." },
    studentSupportPlan: { km: "ផែនការគាំទ្រសិស្សរួមមានការប្រឹក្សា និងកម្មវិធីសិក្សាបន្ថែម។", en: "Student support plan includes counseling and extra-curricular programs." },
  },
  agreements: {
    teacherContracts: { km: "កិច្ចព្រមព្រៀងការងារប្រចាំឆ្នាំត្រូវបានចុះហត្ថលេខាដោយគ្រូបង្រៀនទាំងអស់។", en: "Annual work agreements are signed by all teachers." },
    communityPartnerships: { km: "ភាពជាដៃគូជាមួយអង្គការមិនមែនរដ្ឋាភិបាលក្នុងស្រុក និងអាជីវកម្មសម្រាប់កម្មវិធីអប់រំ។", en: "Partnerships with local NGOs and businesses for educational programs." },
  },
  selfAssessment: {
    modelSchoolStandard: { km: "ផ្អែកលើស្តង់ដារសាលារៀនគំរូរបស់ក្រសួងអប់រំ យុវជន និងកីឡា។", en: "Based on Ministry of Education, Youth and Sport's model school standards." },
    lastAssessmentDate: { km: "ខែកក្កដា ឆ្នាំ២០២៣", en: "July 2023" },
    score: 85,
    maxScore: 100,
  },
  awards: {
    awards: [
      { title: { km: "សាលារៀនឆ្នើមប្រចាំខេត្ត", en: "Outstanding School of the Province" }, year: 2022 },
      { title: { km: "រង្វាន់បរិស្ថានបៃតង", en: "Green Environment Award" }, year: 2021 },
    ],
  },
  timetables: {
    grade7: { km: "អាចទាញយកបាន", en: "Available for Download" },
    grade8: { km: "អាចទាញយកបាន", en: "Available for Download" },
    grade9: { km: "អាចទាញយកបាន", en: "Available for Download" },
    grade10: { km: "អាចទាញយកបាន", en: "Available for Download" },
    grade11: { km: "អាចទាញយកបាន", en: "Available for Download" },
    grade12: { km: "អាចទាញយកបាន", en: "Available for Download" },
  },
  studentStats: {
    items: [
        { label: { km: "សិស្សសរុប", en: "Total Students" }, value: 1842 },
        { label: { km: "សិស្សប្រឡងជាប់ BAC II", en: "BAC II Pass" }, value: 96, suffix: "%" },
        { label: { km: "សិស្សប្រុស", en: "Male Students" }, value: 941 },
        { label: { km: "សិស្សស្រី", en: "Female Students" }, value: 901 },
        { label: { km: "ថ្នាក់រៀន", en: "Classes" }, value: 42 },
        { label: { km: "សិស្សថ្មី", en: "New Students" }, value: 312 },
    ],
    notes: {
      km: "ស្ថិតិសិស្សសម្រាប់ឆ្នាំសិក្សា ២០២៤-២០២៥ ដែលបង្ហាញពីអត្រាអញ្ញាបកម្មកើនឡើងជារៀងរាល់ឆ្នាំ។",
      en: "Student statistics for the 2024-2025 academic year, showing a steady year-on-year improvement in enrolment and pass rates.",
    },
  },
  feederSchools: {
    schools: [
      { name: { km: "សាលាបឋមសិក្សាកំរៀង", en: "Kamrieng Primary School" }, studentCount: 250 },
      { name: { km: "សាលាបឋមសិក្សាអូរដា", en: "O'da Primary School" }, studentCount: 150 },
      { name: { km: "សាលាបឋមសិក្សាបឹងរាំង", en: "Boeng Rang Primary School" }, studentCount: 100 },
    ],
  },
  academicResults: {
    grade9PassRate: 98.5,
    grade12PassRate: 96,
    topStudents: [
      { name: "Sokun David", score: 99.5 },
      { name: "Chan Lina", score: 99.2 },
    ],
  },
  staffStatus: [
    { label: { km: "គ្រូបង្រៀន", en: "Teachers" }, count: 56, color: "bg-blue-100 text-blue-700" },
    { label: { km: "បុគ្គលិករដ្ឋបាល", en: "Admin Staff" }, count: 8, color: "bg-violet-100 text-violet-700" },
    { label: { km: "អ្នករក្សាសន្តិសុខ", en: "Support Staff" }, count: 4, color: "bg-emerald-100 text-emerald-700" },
  ],
  facilities: {
    items: [
      {
        label: { km: "បន្ទប់រៀន", en: "Classrooms" },
        detail: { km: "ចំនួន ៤៥ បន្ទប់", en: "45 classrooms" },
      },
      {
        label: { km: "បន្ទប់ពិសោធន៍", en: "Science Labs" },
        detail: { km: "មន្ទីរពិសោធន៍វិទ្យាសាស្ត្រ ៣", en: "3 science laboratories" },
      },
      {
        label: { km: "បណ្ណាល័យ", en: "Library" },
        detail: { km: "បណ្ណាល័យមានសៀវភៅជាង ៥ ០០០ ក្បាល", en: "Library with 5,000+ books" },
      },
      {
        label: { km: "អគារកុំព្យូទ័រ", en: "Computer Lab" },
        detail: { km: "មន្ទីរកុំព្យូទ័រ ២ មានម៉ាស៊ីន ៦០", en: "2 computer labs with 60 machines" },
      },
      {
        label: { km: "ទីលានកីឡា", en: "Sports Ground" },
        detail: { km: "ទីលានបាល់ទាត់ និងបាល់ទះ", en: "Football and volleyball fields" },
      },
    ],
    textbookStatus: [
      { subject: { km: "គណិតវិទ្យា", en: "Mathematics" }, studentRatio: 1.2 },
      { subject: { km: "ភាសាខ្មែរ", en: "Khmer Language" }, studentRatio: 1 },
      { subject: { km: "រូបវិទ្យា", en: "Physics" }, studentRatio: 1.5 },
    ],
    notes: {
      km: "ហេដ្ឋារចនាសម្ព័ន្ធសាលារៀនត្រូវបានពង្រីកជាបន្តបន្ទាប់ដើម្បីគាំទ្រដល់ចំនួនសិស្សកើនឡើង។",
      en: "School facilities have been expanded progressively to support the growing student population.",
    },
  },
  budget: {
    currency: "USD",
    totalBudget: 200000,
    communitySupport: 25000,
    expenditure: [
      { label: { km: "ប្រាក់ខែបុគ្គលិក", en: "Staff Salaries" }, amount: 142000 },
      { label: { km: "សម្ភារៈអប់រំ", en: "Educational Materials" }, amount: 28000 },
      { label: { km: "ថែទាំ និងជួសជុល", en: "Maintenance" }, amount: 18000 },
      { label: { km: "សកម្មភាពសិស្ស", en: "Student Activities" }, amount: 9000 },
    ],
    remainingBalance: 28000,
    notes: {
      km: "ថវិកាប្រចាំឆ្នាំមានប្រភពចម្បងពីរដ្ឋាភិបាល និងការបរិច្ចាគរបស់អ្នកគាំទ្រ។",
      en: "The annual budget is primarily funded by the government and community donations.",
    },
  },
  challenges: [
    {
      title: { km: "កង្វះគ្រូបង្រៀន", en: "Teacher Shortage" },
      detail: {
        km: "ការខ្វះគ្រូបង្រៀនមុខវិជ្ជាវិទ្យាសាស្ត្រ និងភាសាបរទេស។",
        en: "Shortage of teachers in science subjects and foreign languages.",
      },
    },
    {
      title: { km: "ហេដ្ឋារចនាសម្ព័ន្ធចាស់", en: "Aging Facilities" },
      detail: {
        km: "អគារមួយចំនួនត្រូវការជួសជុល និងធ្វើទំនើបកម្ម។",
        en: "Several buildings require repair and modernisation.",
      },
    },
    {
      title: { km: "ឧបករណ៍បច្ចេកវិទ្យា", en: "Technology Access" },
      detail: {
        km: "ការធានាការចូលប្រើបច្ចេកវិទ្យាសម្រាប់សិស្សទាំងអស់។",
        en: "Ensuring equitable access to technology for all students.",
      },
    },
  ],
  futureDirection: [
    {
      km: "ពង្រីកមុខវិជ្ចាសិក្សាជំនាញបច្ចេកវិទ្យា និងភាសាបរទេស។",
      en: "Expand STEM and foreign-language programmes.",
    },
    {
      km: "ធ្វើទំនើបកម្មហេដ្ឋារចនាសម្ព័ន្ធ និងបន្ទបំពាក់ឌីជីថល។",
      en: "Modernise facilities and digital equipment.",
    },
    {
      km: "ពង្រឹងភាពជាដៃគូជាមួយសហគមន៍ និងអង្គការក្រៅរដ្ឋាភិបាល។",
      en: "Strengthen partnerships with the community and NGOs.",
    },
    {
      km: "លើកកម្ពស់គុណភាពអប់រំតាមរយៈការបណ្តុះបណ្តាលគ្រូ។",
      en: "Improve education quality through teacher training.",
    },
  ],
};

export function localize(
  text: LocalizedText | undefined,
  locale: Locale
): string {
  if (!text) return "";
  return locale === "km" ? text.km : text.en;
}

// ─── Helpers for the DB-to-UI mapper ──────────────────────────

/** Create a LocalizedText from a pair of string values (or undefined). */
function lt(km?: string | null, en?: string | null): LocalizedText {
  return { km: km ?? "", en: en ?? "" };
}

/** Default colour cycle for staff-status cards. */
const STAFF_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

/**
 * Transform a raw database operations-report row (snake_case, flat fields inside
 * the JSONB `content` column) into the UI-facing SchoolReport shape (camelCase,
 * LocalizedText objects).
 *
 * Returns `null` when the input is nullish, so callers can show a fallback UI.
 */
export function dbToUiSchoolReport(
  dbReport: DbSchoolReport | null | undefined
): SchoolReport | null {
  if (!dbReport) return null;

  const c: OperationsReportContent = dbReport.content ?? {};

  // Build the academic-year label from the row-level field
  const ayLabel: LocalizedText = {
    km: `ឆ្នាំសិក្សា ${dbReport.academic_year}`,
    en: `Academic Year ${dbReport.academic_year}`,
  };

  return {
    // ── General ────────────────────────────────────────────────
    general: {
      academicYear: ayLabel,
      principal: lt(
        c.general?.principal_km,
        c.general?.principal_en,
      ),
      totalStaff: c.general?.total_staff ?? 0,
      totalStudents: c.general?.total_students ?? 0,
      totalClasses: c.general?.total_classes ?? 0,
      landAreaSqm: c.general?.land_area_sqm ?? 0,
      establishedYear: c.general?.established_year ?? 0,
      summary: lt(c.general?.summary_km, c.general?.summary_en),
    },

    // ── Teaching Hours ─────────────────────────────────────────
    teachingHours: {
      weeklyHours: c.teaching_hours?.weekly_hours ?? 0,
      // dailySchedule is not stored in the DB yet — default to empty
      dailySchedule: [],
      notes: lt(c.teaching_hours?.notes_km, c.teaching_hours?.notes_en),
    },

    // ── Regular Testing ────────────────────────────────────────
    regularTesting: {
      monthlyTests: lt(
        c.regular_testing?.monthly_tests_km,
        c.regular_testing?.monthly_tests_en,
      ),
      semesterTests: lt(
        c.regular_testing?.semester_tests_km,
        c.regular_testing?.semester_tests_en,
      ),
      notes: lt(c.regular_testing?.notes_km, c.regular_testing?.notes_en),
    },

    // ── Planning ───────────────────────────────────────────────
    planning: {
      schoolImprovementPlan: lt(
        c.planning?.school_improvement_plan_km,
        c.planning?.school_improvement_plan_en,
      ),
      teacherDevelopmentPlan: lt(
        c.planning?.teacher_development_plan_km,
        c.planning?.teacher_development_plan_en,
      ),
      studentSupportPlan: lt(
        c.planning?.student_support_plan_km,
        c.planning?.student_support_plan_en,
      ),
    },

    // ── Agreements ─────────────────────────────────────────────
    agreements: {
      teacherContracts: lt(
        c.agreements?.teacher_contracts_km,
        c.agreements?.teacher_contracts_en,
      ),
      communityPartnerships: lt(
        c.agreements?.community_partnerships_km,
        c.agreements?.community_partnerships_en,
      ),
    },

    // ── Self-Assessment ────────────────────────────────────────
    selfAssessment: {
      modelSchoolStandard: lt(
        c.self_assessment?.model_school_standard_km,
        c.self_assessment?.model_school_standard_en,
      ),
      lastAssessmentDate: lt(
        c.self_assessment?.last_assessment_date_km,
        c.self_assessment?.last_assessment_date_en,
      ),
      score: c.self_assessment?.score ?? 0,
      maxScore: c.self_assessment?.max_score ?? 0,
    },

    // ── Awards ─────────────────────────────────────────────────
    awards: {
      awards: (c.awards?.awards ?? []).map((a) => ({
        title: lt(a.title_km, a.title_en),
        year: a.year,
      })),
    },

    // ── Timetables ─────────────────────────────────────────────
    timetables: {
      grade7: lt(c.timetables?.grade7_km, c.timetables?.grade7_en),
      grade8: lt(c.timetables?.grade8_km, c.timetables?.grade8_en),
      grade9: lt(c.timetables?.grade9_km, c.timetables?.grade9_en),
      grade10: lt(c.timetables?.grade10_km, c.timetables?.grade10_en),
      grade11: lt(c.timetables?.grade11_km, c.timetables?.grade11_en),
      grade12: lt(c.timetables?.grade12_km, c.timetables?.grade12_en),
    },

    // ── Student Statistics ─────────────────────────────────────
    studentStats: {
      items: (c.student_stats?.items ?? []).map((item) => ({
        label: lt(item.label_km, item.label_en),
        value: item.value,
        suffix: item.suffix,
      })),
      notes: lt(c.student_stats?.notes_km, c.student_stats?.notes_en),
    },

    // ── Feeder Schools ─────────────────────────────────────────
    feederSchools: {
      schools: (c.feeder_schools?.schools ?? []).map((s) => ({
        name: lt(s.name_km, s.name_en),
        studentCount: s.student_count,
      })),
    },

    // ── Academic Results ───────────────────────────────────────
    academicResults: {
      grade9PassRate: c.academic_results?.grade9_pass_rate ?? 0,
      grade12PassRate: c.academic_results?.grade12_pass_rate ?? 0,
      topStudents: (c.academic_results?.top_students ?? []).map((s) => ({
        name: s.name,
        score: s.score,
      })),
    },

    // ── Staff Status ───────────────────────────────────────────
    staffStatus: (c.staff_status ?? []).map((s, i) => ({
      label: lt(s.label_km, s.label_en),
      count: s.count,
      color: STAFF_COLORS[i % STAFF_COLORS.length],
    })),

    // ── Facilities & Textbook ──────────────────────────────────
    facilities: {
      items: (c.facilities?.items ?? []).map((item) => ({
        label: lt(item.label_km, item.label_en),
        detail: lt(item.detail_km, item.detail_en),
      })),
      textbookStatus: (c.facilities?.textbook_status ?? []).map((t) => ({
        subject: lt(t.subject_km, t.subject_en),
        studentRatio: t.student_ratio,
      })),
      notes: lt(c.facilities?.notes_km, c.facilities?.notes_en),
    },

    // ── Budget ─────────────────────────────────────────────────
    budget: {
      currency: c.budget?.currency ?? "USD",
      totalBudget: c.budget?.total_budget ?? 0,
      communitySupport: c.budget?.community_support ?? 0,
      // The DB seed uses `budget.items` but the UI expects `budget.expenditure`.
      // Check both keys, preferring `expenditure`.
      expenditure: (c.budget?.expenditure ?? (c.budget as any)?.items ?? []).map(
        (item: any) => ({
          label: lt(item.label_km, item.label_en),
          amount: item.amount,
        }),
      ),
      remainingBalance: c.budget?.remaining_balance ?? 0,
      notes: lt(c.budget?.notes_km, c.budget?.notes_en),
    },

    // ── Challenges ─────────────────────────────────────────────
    challenges: (c.challenges ?? []).map((ch) => ({
      title: lt(ch.title_km, ch.title_en),
      detail: lt(ch.detail_km, ch.detail_en),
    })),

    // ── Future Direction ───────────────────────────────────────
    futureDirection: (c.future_direction ?? []).map((fd) => ({
      km: fd.km ?? "",
      en: fd.en ?? "",
    })),
  };
}
