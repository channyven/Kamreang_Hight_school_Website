// ─────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────

export type UserRole = "administrator" | "director" | "editor";
export type ContentStatus = "draft" | "published" | "archived";
export type AchievementType = "student" | "teacher" | "school";
export type AwardLevel = "national" | "provincial" | "district" | "school";
export type MessageStatus = "unread" | "read" | "replied" | "archived";
export type MediaType = "image" | "video" | "document";
export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "archive"
  | "login"
  | "logout";

// ─────────────────────────────────────────────────────────────
// Database Models
// ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  firebase_uid: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Statistics {
  id: string;
  academic_year: string;
  total_students: number;
  total_teachers: number;
  total_classes: number;
  grade_a_students?: number;
  graduation_rate?: number;
  pass_rate?: number;
  male_students?: number;
  female_students?: number;
  new_students?: number;
  is_current: boolean;
  notes?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface NewsCategory {
  id: string;
  name_km: string;
  name_en: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface News {
  id: string;
  title_km: string;
  title_en: string;
  slug: string;
  content_km?: string;
  content_en?: string;
  excerpt_km?: string;
  excerpt_en?: string;
  featured_image?: string;
  gallery_images?: string[];
  category_id?: string;
  is_featured: boolean;
  status: ContentStatus;
  publish_date?: string;
  view_count: number;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  // Joined
  category?: NewsCategory;
}

export interface Achievement {
  id: string;
  title_km: string;
  title_en: string;
  description_km?: string;
  description_en?: string;
  achievement_type?: string;
  award_level?: string;
  achievement_date?: string;
  participant_name?: string;
  image_url?: string;
  is_featured?: boolean;
  status: ContentStatus;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: MessageStatus;
  ip_address?: string;
  user_agent?: string;
  replied_by?: string;
  replied_at?: string;
  reply_text?: string;
  created_at: string;
  updated_at: string;
}

export interface AppDocument {
  id: string;
  title_km: string;
  title_en: string;
  description_km?: string;
  description_en?: string;
  file_url: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  category?: { name_km: string; name_en: string; slug: string };
  category_id?: string;
  download_count?: number;
  sort_order?: number;
  created_by?: string;
  updated_by?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type DocumentCategory = "report" | "result" | "form" | "policy" | "other";

export const DOCUMENT_CATEGORIES: { key: DocumentCategory; labelEn: string; labelKm: string }[] = [
  { key: "report", labelEn: "Report", labelKm: "របាយការណ៍" },
  { key: "result", labelEn: "Result", labelKm: "លទ្ធផល" },
  { key: "form", labelEn: "Form", labelKm: "បែបបទ" },
  { key: "policy", labelEn: "Policy", labelKm: "គោលនយោបាយ" },
  { key: "other", labelEn: "Other", labelKm: "ផ្សេងៗ" },
];

export type ReportFileCategory = "report" | "result" | "form" | "policy" | "other";

export const REPORT_FILE_CATEGORIES: { key: ReportFileCategory; labelEn: string; labelKm: string }[] = [
  { key: "report", labelEn: "Report", labelKm: "របាយការណ៍" },
  { key: "result", labelEn: "Result", labelKm: "លទ្ធផល" },
  { key: "form", labelEn: "Form", labelKm: "បែបបទ" },
  { key: "policy", labelEn: "Policy", labelKm: "គោលនយោបាយ" },
  { key: "other", labelEn: "Other", labelKm: "ផ្សេងៗ" },
];

/** A downloadable report file in the admin-managed library. */
export interface ReportFile {
  id: string;
  title_km: string;
  title_en: string;
  description_km?: string | null;
  description_en?: string | null;
  file_url: string;
  file_name: string;
  category: ReportFileCategory;
  academic_year?: string | null;
  sort_order: number;
  is_active: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

/** Academic schedule management interface */
export interface Schedule {
  id: string;
  academic_year: string;
  first_semester_km?: string;
  first_semester_en?: string;
  first_semester_dates?: string;
  second_semester_km?: string;
  second_semester_en?: string;
  second_semester_dates?: string;
  daily_schedule?: Record<string, unknown>;
  important_dates?: Record<string, unknown>;
  school_office_hours_km?: string;
  school_office_hours_en?: string;
  school_office_phone?: string;
  academic_office_hours_km?: string;
  academic_office_hours_en?: string;
  academic_office_phone?: string;
  contact_info_km?: string;
  contact_info_en?: string;
  is_current: boolean;
  notes?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

/** Important date structure for schedule */
export interface ImportantDate {
  title_km: string;
  title_en: string;
  date_km: string;
  date_en: string;
}

/** Daily schedule period structure with per-day subject support */
export interface SchedulePeriod {
  time: string;
  name_km?: string;
  name_en?: string;
  mon_km?: string;
  mon_en?: string;
  tue_km?: string;
  tue_en?: string;
  wed_km?: string;
  wed_en?: string;
  thu_km?: string;
  thu_en?: string;
  fri_km?: string;
  fri_en?: string;
  sat_km?: string;
  sat_en?: string;
  mon_holiday?: boolean;
  tue_holiday?: boolean;
  wed_holiday?: boolean;
  thu_holiday?: boolean;
  fri_holiday?: boolean;
  sat_holiday?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Calendar Types
// ─────────────────────────────────────────────────────────────

export type EventCategory =
  | "academic"
  | "examination"
  | "holiday"
  | "school_event"
  | "meeting"
  | "sports"
  | "club_activity"
  | "workshop"
  | "seminar"
  | "graduation"
  | "orientation"
  | "parent_meeting"
  | "field_trip"
  | "announcement"
  | "maintenance"
  | "emergency";

export type EventVisibility = "public" | "students" | "teachers" | "parents" | "staff" | "private";
export type EventStatus = "draft" | "published" | "cancelled" | "archived";

export interface CalendarEvent {
  id: string;
  title: string;
  title_km?: string;
  title_en?: string;
  description?: string;
  description_km?: string;
  description_en?: string;
  category: EventCategory;
  location?: string;
  organizer?: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  is_all_day: boolean;
  is_recurring: boolean;
  recurring_rule?: Record<string, unknown>;
  visibility: EventVisibility;
  status: EventStatus;
  color?: string;
  attachment_url?: string;
  grade_level?: number;
  department?: string;
  is_featured: boolean;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export const EVENT_CATEGORIES: { key: EventCategory; labelEn: string; labelKm: string; color: string }[] = [
  { key: "academic", labelEn: "Academic", labelKm: "សិក្សា", color: "#2563eb" },
  { key: "examination", labelEn: "Examination", labelKm: "ប្រលង", color: "#dc2626" },
  { key: "holiday", labelEn: "Holiday", labelKm: "ថ្ងៃឈប់សម្រាក", color: "#f59e0b" },
  { key: "school_event", labelEn: "School Event", labelKm: "ព្រឹត្តិការណ៍សាលា", color: "#16a34a" },
  { key: "meeting", labelEn: "Meeting", labelKm: "កិច្ចប្រជុំ", color: "#8b5cf6" },
  { key: "sports", labelEn: "Sports", labelKm: "កីឡា", color: "#06b6d4" },
  { key: "club_activity", labelEn: "Club Activity", labelKm: "សកម្មភាពក្លឹប", color: "#e91e63" },
  { key: "workshop", labelEn: "Workshop", labelKm: "សិក្ខាសាលា", color: "#f97316" },
  { key: "seminar", labelEn: "Seminar", labelKm: "សិក្ខាសាលា", color: "#14b8a6" },
  { key: "graduation", labelEn: "Graduation", labelKm: "បញ្ចប់ការសិក្សា", color: "#6366f1" },
  { key: "orientation", labelEn: "Orientation", labelKm: "តម្រង់ទិស", color: "#a855f7" },
  { key: "parent_meeting", labelEn: "Parent Meeting", labelKm: "កិច្ចប្រជុំមាតាបិតា", color: "#ec4899" },
  { key: "field_trip", labelEn: "Field Trip", labelKm: "ដំណើរកម្សាន្ត", color: "#22c55e" },
  { key: "announcement", labelEn: "Announcement", labelKm: "សេចក្ដីជូនដំណឹង", color: "#64748b" },
  { key: "maintenance", labelEn: "Maintenance", labelKm: "ថែទាំ", color: "#94a3b8" },
  { key: "emergency", labelEn: "Emergency", labelKm: "អាសន្ន", color: "#ef4444" },
];

export const EVENT_VISIBILITY_OPTIONS: { key: EventVisibility; labelEn: string; labelKm: string }[] = [
  { key: "public", labelEn: "Public", labelKm: "សាធារណៈ" },
  { key: "students", labelEn: "Students Only", labelKm: "សិស្សតែប៉ុណ្ណោះ" },
  { key: "teachers", labelEn: "Teachers Only", labelKm: "គ្រូតែប៉ុណ្ណោះ" },
  { key: "parents", labelEn: "Parents Only", labelKm: "មាតាបិតាតែប៉ុណ្ណោះ" },
  { key: "staff", labelEn: "Staff Only", labelKm: "បុគ្គលិកតែប៉ុណ្ណោះ" },
  { key: "private", labelEn: "Private", labelKm: "ឯកជន" },
];

export const EVENT_STATUS_OPTIONS: { key: EventStatus; labelEn: string; labelKm: string }[] = [
  { key: "draft", labelEn: "Draft", labelKm: "សេចក្តីព្រាង" },
  { key: "published", labelEn: "Published", labelKm: "បានផ្សព្វផ្សាយ" },
  { key: "cancelled", labelEn: "Cancelled", labelKm: "បានបោះបង់" },
  { key: "archived", labelEn: "Archived", labelKm: "បានរក្សាទុក" },
];

/** Shape of the editable annual Operations Report content (JSONB). */
export interface OperationsReportContent {
  general?: {
    principal_km?: string;
    principal_en?: string;
    total_staff?: number;
    total_students?: number;
    total_classes?: number;
    land_area_sqm?: number;
    established_year?: number;
    summary_km?: string;
    summary_en?: string;
  };
  teaching_hours?: {
    weekly_hours?: number;
    notes_km?: string;
    notes_en?: string;
  };
  regular_testing?: {
    monthly_tests_km?: string;
    monthly_tests_en?: string;
    semester_tests_km?: string;
    semester_tests_en?: string;
    notes_km?: string;
    notes_en?: string;
  };
  planning?: {
    school_improvement_plan_km?: string;
    school_improvement_plan_en?: string;
    teacher_development_plan_km?: string;
    teacher_development_plan_en?: string;
    student_support_plan_km?: string;
    student_support_plan_en?: string;
  };
  agreements?: {
    teacher_contracts_km?: string;
    teacher_contracts_en?: string;
    community_partnerships_km?: string;
    community_partnerships_en?: string;
  };
  self_assessment?: {
    model_school_standard_km?: string;
    model_school_standard_en?: string;
    last_assessment_date_km?: string;
    last_assessment_date_en?: string;
    score?: number;
    max_score?: number;
  };
  awards?: {
    awards?: { title_km: string; title_en: string; year: number }[];
  };
  timetables?: {
    grade7_km?: string;
    grade7_en?: string;
    grade8_km?: string;
    grade8_en?: string;
    grade9_km?: string;
    grade9_en?: string;
    grade10_km?: string;
    grade10_en?: string;
    grade11_km?: string;
    grade11_en?: string;
    grade12_km?: string;
    grade12_en?: string;
  };
  student_stats?: {
    items?: { label_km: string; label_en: string; value: number; suffix?: string }[];
    notes_km?: string;
    notes_en?: string;
  };
  feeder_schools?: {
    schools?: { name_km: string; name_en: string; student_count: number }[];
  };
  academic_results?: {
    grade9_pass_rate?: number;
    grade12_pass_rate?: number;
    top_students?: { name: string; score: number }[];
  };
  staff_status?: { label_km: string; label_en: string; count: number }[];
  facilities?: {
    items?: { label_km: string; label_en: string; detail_km: string; detail_en: string }[];
    textbook_status?: { subject_km: string; subject_en: string; student_ratio: number }[];
    notes_km?: string;
    notes_en?: string;
  };
  budget?: {
    currency?: string;
    total_budget?: number;
    community_support?: number;
    expenditure?: { label_km: string; label_en: string; amount: number }[];
    remaining_balance?: number;
    notes_km?: string;
    notes_en?: string;
  };
  challenges?: { title_km: string; title_en: string; detail_km: string; detail_en: string }[];
  future_direction?: { km: string; en: string }[];
}

export interface SchoolReport {
  id: string;
  academic_year: string;
  content: OperationsReportContent;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  table_name: string;
  record_id?: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface Leadership {
  id: string;
  name_km: string;
  name_en: string;
  title_km?: string;
  title_en?: string;
  position_km?: string;
  position_en?: string;
  bio_km?: string;
  bio_en?: string;
  photo_url?: string;
  phone?: string;
  gender?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  year: string;
  title_km: string;
  title_en: string;
  description_km?: string;
  description_en?: string;
  image_url?: string;
  caption_km?: string;
  caption_en?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SchoolInfo {
  id: string;
  section: string;
  title_km?: string;
  title_en?: string;
  content_km?: string;
  content_en?: string;
  sort_order: number;
  updated_by?: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  name_km: string;
  name_en: string;
  subject_km?: string;
  subject_en?: string;
  department_km?: string;
  department_en?: string;
  qualification_km?: string;
  qualification_en?: string;
  photo_url?: string;
  phone?: string;
  gender?: string;
  years_experience?: number;
  grade_levels?: number[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type GovernanceSection = "governance" | "culture";

export interface GovernanceItem {
  id: string;
  section: GovernanceSection;
  icon: string;
  text_km: string;
  text_en: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HeroSlide {
  id: string;
  title_km: string;
  title_en: string;
  subtitle_km?: string;
  subtitle_en?: string;
  image_url?: string;
  gradient?: string;
  cta_primary_km?: string;
  cta_primary_en?: string;
  cta_secondary_km?: string;
  cta_secondary_en?: string;
  cta_primary_href?: string;
  cta_secondary_href?: string;
  sort_order: number;
  is_active: boolean;
}

export interface OrgNodeData {
  id: string;
  name_km: string;
  name_en: string;
  description_km?: string;
  description_en?: string;
  icon?: string; // Lucide icon name string
  tier: "root" | "vice" | "head" | "leaf";
  children?: OrgNodeData[];
}

// ─────────────────────────────────────────────────────────────
// API Response Types
// ─────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─────────────────────────────────────────────────────────────
// Form Types
// ─────────────────────────────────────────────────────────────

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// ─────────────────────────────────────────────────────────────
// Session / Auth Types
// ─────────────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  firebase_uid: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  is_active: boolean;
}

export interface RolePermissions {
  canManageUsers: boolean;
  canManageSettings: boolean;
  canManageStatistics: boolean;
  canPublish: boolean;
  canDelete: boolean;
  canViewAuditLogs: boolean;
  canManageAchievements: boolean;
  canManageNews: boolean;
  canManageMessages: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  administrator: {
    canManageUsers: true,
    canManageSettings: true,
    canManageStatistics: true,
    canPublish: true,
    canDelete: true,
    canViewAuditLogs: true,
    canManageAchievements: true,
    canManageNews: true,
    canManageMessages: true,
  },
  director: {
    canManageUsers: false,
    canManageSettings: false,
    canManageStatistics: true,
    canPublish: true,
    canDelete: false,
    canViewAuditLogs: false,
    canManageAchievements: true,
    canManageNews: true,
    canManageMessages: true,
  },
  editor: {
    canManageUsers: false,
    canManageSettings: false,
    canManageStatistics: false,
    canPublish: false,
    canDelete: false,
    canViewAuditLogs: false,
    canManageAchievements: false,
    canManageNews: true,
    canManageMessages: false,
  },
};
