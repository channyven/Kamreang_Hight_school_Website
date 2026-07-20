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
    .regex(/^[\d\s+\-()]*$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  subject: z.string().min(3, "Subject is required").max(200),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000),
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
  achievement_type: z.enum(["student", "teacher", "school"]).optional(),
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

// ─── Teacher ──────────────────────────────────────────────────

export const teacherSchema = z.object({
  name_km: z.string().min(1, "Khmer name is required").max(200),
  name_en: z.string().max(200).optional().or(z.literal("")),
  subject_km: z.string().max(200).optional(),
  subject_en: z.string().max(200).optional(),
  department_km: z.string().max(200).optional(),
  department_en: z.string().max(200).optional(),
  qualification_km: z.string().max(300).optional(),
  qualification_en: z.string().max(300).optional(),
  photo_url: z.string().optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
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

// ─── Bank Account (Donate page) ───────────────────────────────

export const bankAccountSchema = z.object({
  bank_name_km: z.string().min(1, "Khmer bank name is required").max(200),
  bank_name_en: z.string().min(1, "English bank name is required").max(200),
  account_name_km: z.string().min(1, "Khmer account name is required").max(200),
  account_name_en: z.string().min(1, "English account name is required").max(200),
  account_number: z.string().min(1, "Account number is required").max(50),
  currency: z.string().max(50).default("USD / KHR"),
  logo_color: z.string().max(20).default("#00376f"),
  logo_url: z.string().max(2000).optional(),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});
export type BankAccountInput = z.infer<typeof bankAccountSchema>;

// ─── Donation Purpose ("Why Donate" card) ─────────────────────

export const donationPurposeSchema = z.object({
  icon: z.string().min(1, "Icon is required").max(20),
  title_km: z.string().min(1, "Khmer title is required").max(200),
  title_en: z.string().min(1, "English title is required").max(200),
  desc_km: z.string().max(500).optional(),
  desc_en: z.string().max(500).optional(),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});
export type DonationPurposeInput = z.infer<typeof donationPurposeSchema>;

// ─── Donation QR code (Donate page) ───────────────────────────

export const donateQrUrlSchema = z
  .string()
  .trim()
  .min(1, "QR code image is required")
  .max(2000, "URL is too long")
  .url("Invalid image URL")
  .refine((u) => u.startsWith("http://") || u.startsWith("https://"), {
    message: "URL must start with http:// or https://",
  });

export const donationQrSchema = z.object({
  label_km: z.string().max(200).optional(),
  label_en: z.string().max(200).optional(),
  image_url: donateQrUrlSchema,
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});
export type DonationQrInput = z.infer<typeof donationQrSchema>;

// ─── User (Admin create/edit) ─────────────────────────────────

export const createUserSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(2).max(100),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["administrator", "director", "editor"]),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  role: z.enum(["administrator", "director", "editor"]).optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
  is_active: z.boolean().optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
