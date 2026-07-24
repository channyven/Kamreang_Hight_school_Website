import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;

// ─── Contact Form ─────────────────────────────────────────────

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^[\d\s+\-()]+$/, "Invalid phone number")
    .optional()
    .or(z.literal(""))
    .refine((val) => val === "" || !val || val.length >= 8, "Phone number too short"),
  subject: z.string().min(3, "Subject is required").max(200),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000),
  // Honeypot field - should be empty
  website: z.string().max(0, "Spam detected").optional().or(z.literal("")),
});
export type ContactInput = z.infer<typeof contactSchema>;

// ─── News ─────────────────────────────────────────────────────

export const newsSchema = z.object({
  title_km: z.string().min(1, "Khmer title is required").max(500),
  title_en: z.string().min(1, "English title is required").max(500),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  content_km: z.string().optional(),
  content_en: z.string().optional(),
  excerpt_km: z.string().max(500).optional(),
  excerpt_en: z.string().max(500).optional(),
  // Accept any string (full URL or relative proxy path like /api/proxy-image?url=...)
  featured_image: z.string().optional().or(z.literal("")),
  gallery_images: z.array(z.string()).default([]),
  category_id: z.string().uuid().optional().or(z.literal("")),
  is_featured: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  publish_date: z.string().optional(),
});
export type NewsInput = z.infer<typeof newsSchema>;

// ─── Achievement ──────────────────────────────────────────────

export const achievementSchema = z.object({
  title_km: z.string().min(1, "Khmer title is required").max(500),
  title_en: z.string().min(1, "English title is required").max(500),
  description_km: z.string().optional(),
  description_en: z.string().optional(),
  achievement_type: z.enum(["academic", "sports", "arts", "community", "other"]).optional(),
  award_level: z.enum(["national", "provincial", "district", "school"]).optional(),
  achievement_date: z.string().optional(),
  participant_name: z.string().max(300).optional(),
  image_url: z.string().optional(),
  is_featured: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});
export type AchievementInput = z.infer<typeof achievementSchema>;

// ─── Statistics ───────────────────────────────────────────────

export const statisticsSchema = z.object({
  academic_year: z
    .string()
    .regex(/^\d{4}-\d{4}$/, "Format must be YYYY-YYYY (e.g. 2023-2024)"),
  total_students: z.coerce.number().int().min(0).optional(),
  total_teachers: z.coerce.number().int().min(0).optional(),
  total_classes: z.coerce.number().int().min(0).optional(),
  grade_a_students: z.coerce.number().int().min(0).optional(),
  graduation_rate: z.coerce.number().min(0).max(100).optional(),
  pass_rate: z.coerce.number().min(0).max(100).optional(),
  male_students: z.coerce.number().int().min(0).optional(),
  female_students: z.coerce.number().int().min(0).optional(),
  new_students: z.coerce.number().int().min(0).optional(),
  is_current: z.boolean().default(false),
  notes: z.string().max(1000).optional(),
});
export type StatisticsInput = z.infer<typeof statisticsSchema>;

// ─── Document ──────────────────────────────────────────────────

export const documentSchema = z.object({
  title_km: z.string().min(1, "Khmer title is required").max(500),
  title_en: z.string().min(1, "English title is required").max(500),
  description_km: z.string().max(1000).optional().or(z.literal("")),
  description_en: z.string().max(1000).optional().or(z.literal("")),
  file_url: z.string().url("Must be a valid URL").min(1, "File URL is required"),
  file_name: z.string().min(1, "File name is required").max(300),
  category: z.enum(["report", "result", "form", "policy", "other"]).default("other"),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});
export type DocumentInput = z.infer<typeof documentSchema>;

// ─── Report File ──────────────────────────────────────────────

export const reportFileSchema = z.object({
  title_km: z.string().min(1, "Khmer title is required").max(500),
  title_en: z.string().min(1, "English title is required").max(500),
  description_km: z.string().max(1000).optional().or(z.literal("")),
  description_en: z.string().max(1000).optional().or(z.literal("")),
  file_url: z.string().url("Must be a valid URL").min(1, "File URL is required"),
  file_name: z.string().min(1, "File name is required").max(300),
  category: z.enum(["report", "result", "form", "policy", "other"]).default("report"),
  academic_year: z.string().max(20).optional().or(z.literal("")),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});
export type ReportFileInput = z.infer<typeof reportFileSchema>;

// ─── Operations Report (annual, JSONB content) ───────────────

export const operationsReportSchema = z.object({
  academic_year: z
    .string()
    .regex(/^\d{4}-\d{4}$/, "Format must be YYYY-YYYY (e.g. 2024-2025)"),
  is_published: z.boolean().default(false),
  content: z.record(z.any()).default({}),
});
export type OperationsReportInput = z.infer<typeof operationsReportSchema>;

// ─── Teacher ──────────────────────────────────────────────────

export const teacherSchema = z.object({
  name_km: z.string().min(1, "Khmer name is required").max(200),
  name_en: z.string().min(1, "English name is required").max(200),
  subject_km: z.string().max(200).optional(),
  subject_en: z.string().max(200).optional(),
  department_km: z.string().max(200).optional(),
  department_en: z.string().max(200).optional(),
  qualification_km: z.string().max(300).optional(),
  qualification_en: z.string().max(300).optional(),
  photo_url: z.string().optional(),
  years_experience: z.coerce.number().int().min(0).optional(),
  grade_levels: z.array(z.coerce.number().int().min(7).max(12)).default([]),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).default(0),
});
export type TeacherInput = z.infer<typeof teacherSchema>;

// ─── Governance Item ──────────────────────────────────────────

export const governanceItemSchema = z.object({
  section: z.enum(["governance", "culture"]),
  icon: z.string().min(1, "Icon is required"),
  text_km: z.string().min(1, "Khmer text is required").max(500),
  text_en: z.string().min(1, "English text is required").max(500),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});
export type GovernanceItemInput = z.infer<typeof governanceItemSchema>;

// ─── User (Admin create/edit) ─────────────────────────────────

export const createUserSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(2).max(100),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["administrator", "director", "editor"]),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

// ─── Schedule ─────────────────────────────────────────────────

export const scheduleSchema = z.object({
  academic_year: z
    .string()
    .regex(/^\d{4}-\d{4}$/, "Format must be YYYY-YYYY (e.g. 2024-2025)"),
  first_semester_km: z.string().max(100).optional(),
  first_semester_en: z.string().max(100).optional(),
  first_semester_dates: z.string().max(100).optional(),
  second_semester_km: z.string().max(100).optional(),
  second_semester_en: z.string().max(100).optional(),
  second_semester_dates: z.string().max(100).optional(),
  daily_schedule: z.array(z.object({
    time: z.string(),
    name_km: z.string().optional(),
    name_en: z.string().optional(),
    mon_km: z.string().optional(),
    mon_en: z.string().optional(),
    tue_km: z.string().optional(),
    tue_en: z.string().optional(),
    wed_km: z.string().optional(),
    wed_en: z.string().optional(),
    thu_km: z.string().optional(),
    thu_en: z.string().optional(),
    fri_km: z.string().optional(),
    fri_en: z.string().optional(),
    sat_km: z.string().optional(),
    sat_en: z.string().optional(),
    mon_holiday: z.boolean().optional(),
    tue_holiday: z.boolean().optional(),
    wed_holiday: z.boolean().optional(),
    thu_holiday: z.boolean().optional(),
    fri_holiday: z.boolean().optional(),
    sat_holiday: z.boolean().optional(),
  })).optional(),
  important_dates: z.array(z.object({
    title_km: z.string().max(200).default(""),
    title_en: z.string().max(200).default(""),
    date_km: z.string().max(100).default(""),
    date_en: z.string().max(100).default(""),
  })).default([]),
  school_office_hours_km: z.string().max(100).optional(),
  school_office_hours_en: z.string().max(100).optional(),
  school_office_phone: z.string().max(50).optional(),
  academic_office_hours_km: z.string().max(100).optional(),
  academic_office_hours_en: z.string().max(100).optional(),
  academic_office_phone: z.string().max(50).optional(),
  contact_info_km: z.string().max(500).optional(),
  contact_info_en: z.string().max(500).optional(),
  is_current: z.boolean().default(false),
  notes: z.string().max(1000).optional(),
});
export type ScheduleInput = z.infer<typeof scheduleSchema>;

// ─── Calendar Event ──────────────────────────────────────────

export const calendarEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(2000).optional().or(z.literal("")),
  category: z.enum([
    "academic", "examination", "holiday", "school_event", "meeting",
    "sports", "club_activity", "workshop", "seminar", "graduation",
    "orientation", "parent_meeting", "field_trip", "announcement",
    "maintenance", "emergency",
  ]).default("school_event"),
  location: z.string().max(300).optional().or(z.literal("")),
  organizer: z.string().max(200).optional().or(z.literal("")),
  start_date: z.string().min(1, "Start date is required").regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  end_date: z.string().min(1, "End date is required").regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  start_time: z.string().max(20).optional().or(z.literal("")),
  end_time: z.string().max(20).optional().or(z.literal("")),
  is_all_day: z.boolean().default(false),
  is_recurring: z.boolean().default(false),
  recurring_rule: z.record(z.any()).optional(),
  visibility: z.enum(["public", "students", "teachers", "parents", "staff", "private"]).default("public"),
  status: z.enum(["draft", "published", "cancelled", "archived"]).default("draft"),
  color: z.string().max(20).optional().or(z.literal("")),
  attachment_url: z.string().max(1000).optional().or(z.literal("")),
  grade_level: z.coerce.number().int().min(7).max(12).optional(),
  department: z.string().max(200).optional().or(z.literal("")),
  is_featured: z.boolean().default(false),
});
export type CalendarEventInput = z.infer<typeof calendarEventSchema>;

export const updateUserSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  role: z.enum(["administrator", "director", "editor"]).optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
  is_active: z.boolean().optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
