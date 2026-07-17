import type { Locale } from "@/i18n/config";

/**
 * Structured content for the School Operations Report page.
 *
 * This mirrors the project's existing convention of keeping seed/reference
 * content in a typed local module (see `lib/mock-data.ts`) until it is moved
 * into Supabase. All fields are localized (km/en). To later source this from a
 * database, replace `getSchoolReport()` with a `queries.ts` lookup that falls
 * back to this module — the section components below consume the same shape.
 */

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

export interface StudentStatItem {
  label: LocalizedText;
  value: number;
  suffix?: string;
}

export interface StudentStats {
  items: StudentStatItem[];
  notes: LocalizedText;
}

export interface StaffStatusItem {
  label: LocalizedText;
  count: number;
  color: string;
}

export interface FacilitiesSection {
  items: { label: LocalizedText; detail: LocalizedText }[];
  notes: LocalizedText;
}

export interface BudgetSection {
  currency: string;
  items: { label: LocalizedText; amount: number }[];
  notes: LocalizedText;
}

export interface ChallengeItem {
  title: LocalizedText;
  detail: LocalizedText;
}

export interface ReportSection {
  id: string;
  title: LocalizedText;
  icon: string; // lucide icon name resolved in the client
}

export interface SchoolReport {
  general: ReportGeneralInfo;
  teachingHours: TeachingHours;
  studentStats: StudentStats;
  staffStatus: StaffStatusItem[];
  facilities: FacilitiesSection;
  budget: BudgetSection;
  challenges: ChallengeItem[];
  futureDirection: LocalizedText[];
}

export const reportSections: ReportSection[] = [
  { id: "general", title: { km: "ព័ត៌មានទូទៅ", en: "General Information" }, icon: "Info" },
  { id: "teaching", title: { km: "ម៉ោងសិក្សា", en: "Teaching Hours" }, icon: "Clock" },
  { id: "students", title: { km: "ស្ថិតិសិស្ស", en: "Student Statistics" }, icon: "Users" },
  { id: "staff", title: { km: "ស្ថានភាពបុគ្គលិក", en: "Staff Status" }, icon: "UserCheck" },
  { id: "facilities", title: { km: "ហេដ្ឋារចនាសម្ព័ន្ធ", en: "Facilities" }, icon: "Building2" },
  { id: "budget", title: { km: "ថវិកា", en: "Budget" }, icon: "Wallet" },
  { id: "challenges", title: { km: "បញ្ហាប្រឈម", en: "Challenges" }, icon: "AlertTriangle" },
  { id: "future", title: { km: "ទិសដៅអនាគត", en: "Future Direction" }, icon: "Rocket" },
];

export const schoolReport: SchoolReport = {
  general: {
    academicYear: { km: "ឆ្នាំសិក្សា ២០២៤-២០២៥", en: "Academic Year 2024-2025" },
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
    notes: {
      km: "ហេដ្ឋារចនាសម្ព័ន្ធសាលារៀនត្រូវបានពង្រីកជាបន្តបន្ទាប់ដើម្បីគាំទ្រដល់ចំនួនសិស្សកើនឡើង។",
      en: "School facilities have been expanded progressively to support the growing student population.",
    },
  },
  budget: {
    currency: "USD",
    items: [
      { label: { km: "ប្រាក់ខែបុគ្គលិក", en: "Staff Salaries" }, amount: 142000 },
      { label: { km: "សម្ភារៈអប់រំ", en: "Educational Materials" }, amount: 28000 },
      { label: { km: "ថែទាំ និងជួសជុល", en: "Maintenance" }, amount: 18000 },
      { label: { km: "សកម្មភាពសិស្ស", en: "Student Activities" }, amount: 9000 },
    ],
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

/** Resolve a localized field for the active locale. */
export function localize(
  text: LocalizedText | undefined,
  locale: Locale
): string {
  if (!text) return "";
  return locale === "km" ? text.km : text.en;
}

// ─── DB → frontend mapping ──────────────────────────────────
//
// The admin stores the operations report as `OperationsReportContent`
// (flat km/en keys, numeric primitives). The public section components
// consume the richer `SchoolReport` shape (LocalizedText objects, plus a
// `dailySchedule` that isn't edited in admin). This mapper converts the DB
// content into the frontend shape, layering DB values over the local
// `schoolReport` fallback so any missing field still renders.

import type { OperationsReportContent, SchoolReport as DbSchoolReport } from "@/types";

export function mapDbReportToFrontend(
  db: DbSchoolReport
): SchoolReport {
  const c: OperationsReportContent = db.content ?? {};
  const base = schoolReport;

  return {
    general: {
      academicYear: { km: db.academic_year, en: db.academic_year },
      principal: {
        km: c.general?.principal_km ?? base.general.principal.km,
        en: c.general?.principal_en ?? base.general.principal.en,
      },
      totalStaff: c.general?.total_staff ?? base.general.totalStaff,
      totalStudents: c.general?.total_students ?? base.general.totalStudents,
      totalClasses: c.general?.total_classes ?? base.general.totalClasses,
      landAreaSqm: c.general?.land_area_sqm ?? base.general.landAreaSqm,
      establishedYear: c.general?.established_year ?? base.general.establishedYear,
      summary: {
        km: c.general?.summary_km ?? base.general.summary.km,
        en: c.general?.summary_en ?? base.general.summary.en,
      },
    },
    teachingHours: {
      weeklyHours: c.teaching_hours?.weekly_hours ?? base.teachingHours.weeklyHours,
      dailySchedule: base.teachingHours.dailySchedule,
      notes: {
        km: c.teaching_hours?.notes_km ?? base.teachingHours.notes.km,
        en: c.teaching_hours?.notes_en ?? base.teachingHours.notes.en,
      },
    },
    studentStats: {
      items:
        c.student_stats?.items?.map((i) => ({
          label: { km: i.label_km, en: i.label_en },
          value: i.value,
          suffix: i.suffix,
        })) ?? base.studentStats.items,
      notes: {
        km: c.student_stats?.notes_km ?? base.studentStats.notes.km,
        en: c.student_stats?.notes_en ?? base.studentStats.notes.en,
      },
    },
    staffStatus:
      c.staff_status?.map((s) => ({
        label: { km: s.label_km, en: s.label_en },
        count: s.count,
        color: "bg-blue-100 text-blue-700",
      })) ?? base.staffStatus,
    facilities: {
      items:
        c.facilities?.items?.map((i) => ({
          label: { km: i.label_km, en: i.label_en },
          detail: { km: i.detail_km, en: i.detail_en },
        })) ?? base.facilities.items,
      notes: {
        km: c.facilities?.notes_km ?? base.facilities.notes.km,
        en: c.facilities?.notes_en ?? base.facilities.notes.en,
      },
    },
    budget: {
      currency: c.budget?.currency ?? base.budget.currency,
      items:
        c.budget?.items?.map((i) => ({
          label: { km: i.label_km, en: i.label_en },
          amount: i.amount,
        })) ?? base.budget.items,
      notes: {
        km: c.budget?.notes_km ?? base.budget.notes.km,
        en: c.budget?.notes_en ?? base.budget.notes.en,
      },
    },
    challenges:
      c.challenges?.map((ch) => ({
        title: { km: ch.title_km, en: ch.title_en },
        detail: { km: ch.detail_km, en: ch.detail_en },
      })) ?? base.challenges,
    futureDirection:
      c.future_direction?.map((f) => ({ km: f.km, en: f.en })) ??
      base.futureDirection,
  };
}
