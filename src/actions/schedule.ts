"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { createServerClient } from "@/lib/supabase";
import { scheduleSchema, type ScheduleInput } from "@/schemas/validations";
import type { ActionResult, SessionUser, Schedule } from "@/types";

/**
 * Fetch all schedules (admin)
 */
export async function getSchedules(): Promise<Schedule[]> {
  try { await requireAdmin(); } catch { return []; }
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .order("academic_year", { ascending: false });

  if (error) {
    console.error("[getSchedules] Supabase query failed:", error);
    return [];
  }

  return (data ?? []) as Schedule[];
}

/**
 * Fetch a single schedule by ID
 */
export async function getScheduleById(id: string): Promise<Schedule | null> {
  try { await requireAdmin(); } catch { return null; }
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[getScheduleById] Supabase query failed:", error);
    return null;
  }

  return data as Schedule;
}

/**
 * Fetch current schedule (public)
 */
export async function getCurrentSchedule(): Promise<Schedule | null> {
  const supabase = createServerClient();

  // Try the schedule explicitly marked as current first
  const { data: current, error: currErr } = await supabase
    .from("schedules")
    .select("*")
    .eq("is_current", true)
    .maybeSingle();

  if (currErr) {
    console.error("[getCurrentSchedule] Supabase query failed:", currErr);
    return null;
  }

  if (current) return current as Schedule;

  // Fallback: return the latest schedule by academic year
  const { data: latest, error: latErr } = await supabase
    .from("schedules")
    .select("*")
    .order("academic_year", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latErr) {
    console.error("[getCurrentSchedule] Fallback query failed:", latErr);
    return null;
  }

  return (latest ?? null) as Schedule | null;
}

/**
 * Create a new schedule
 */
export async function createSchedule(data: ScheduleInput): Promise<ActionResult<void>> {
  let user: SessionUser;
  try { user = await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }

  const parsed = scheduleSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();

  // If setting as current, unset other current schedules
  if (parsed.data.is_current) {
    await supabase.from("schedules").update({ is_current: false }).neq("id", "00000000-0000-0000-0000-000000000000");
  }

  const { error } = await supabase.from("schedules").insert({
    academic_year: parsed.data.academic_year,
    first_semester_km: parsed.data.first_semester_km,
    first_semester_en: parsed.data.first_semester_en,
    first_semester_dates: parsed.data.first_semester_dates,
    second_semester_km: parsed.data.second_semester_km,
    second_semester_en: parsed.data.second_semester_en,
    second_semester_dates: parsed.data.second_semester_dates,
    daily_schedule: parsed.data.daily_schedule,
    important_dates: parsed.data.important_dates,
    school_office_hours_km: parsed.data.school_office_hours_km,
    school_office_hours_en: parsed.data.school_office_hours_en,
    school_office_phone: parsed.data.school_office_phone,
    academic_office_hours_km: parsed.data.academic_office_hours_km,
    academic_office_hours_en: parsed.data.academic_office_hours_en,
    academic_office_phone: parsed.data.academic_office_phone,
    contact_info_km: parsed.data.contact_info_km,
    contact_info_en: parsed.data.contact_info_en,
    is_current: parsed.data.is_current,
    notes: parsed.data.notes,
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    console.error("[createSchedule] Supabase insert failed:", error);
    return { success: false, error: error.message };
  }

  // Audit log
  await supabase.from("admin_audit_logs").insert({
    user_id: user.id,
    user_email: user.email,
    action: "create",
    table_name: "schedules",
  });

  revalidatePath("/[locale]/(public)", "page");
  revalidatePath("/[locale]/(admin)/admin/schedules", "page");
  revalidateTag("schedules");
  return { success: true };
}

/**
 * Update an existing schedule
 */
export async function updateSchedule(
  id: string,
  data: ScheduleInput
): Promise<ActionResult<void>> {
  let user: SessionUser;
  try { user = await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }

  const parsed = scheduleSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();

  // If setting as current, unset other current schedules
  if (parsed.data.is_current) {
    await supabase.from("schedules").update({ is_current: false }).neq("id", id);
  }

  const { error } = await supabase
    .from("schedules")
    .update({
      academic_year: parsed.data.academic_year,
      first_semester_km: parsed.data.first_semester_km,
      first_semester_en: parsed.data.first_semester_en,
      first_semester_dates: parsed.data.first_semester_dates,
      second_semester_km: parsed.data.second_semester_km,
      second_semester_en: parsed.data.second_semester_en,
      second_semester_dates: parsed.data.second_semester_dates,
      daily_schedule: parsed.data.daily_schedule,
      important_dates: parsed.data.important_dates,
      school_office_hours_km: parsed.data.school_office_hours_km,
      school_office_hours_en: parsed.data.school_office_hours_en,
      school_office_phone: parsed.data.school_office_phone,
      academic_office_hours_km: parsed.data.academic_office_hours_km,
      academic_office_hours_en: parsed.data.academic_office_hours_en,
      academic_office_phone: parsed.data.academic_office_phone,
      contact_info_km: parsed.data.contact_info_km,
      contact_info_en: parsed.data.contact_info_en,
      is_current: parsed.data.is_current,
      notes: parsed.data.notes,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateSchedule] Supabase update failed:", error);
    return { success: false, error: error.message };
  }

  // Audit log
  await supabase.from("admin_audit_logs").insert({
    user_id: user.id,
    user_email: user.email,
    action: "update",
    table_name: "schedules",
    record_id: id,
  });

  revalidatePath("/[locale]/(public)", "page");
  revalidatePath("/[locale]/(admin)/admin/schedules", "page");
  revalidateTag("schedules");
  return { success: true };
}

/**
 * Delete a schedule
 */
export async function deleteSchedule(id: string): Promise<ActionResult<void>> {
  let user: SessionUser;
  try { user = await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }

  const supabase = createServerClient();
  const { error } = await supabase.from("schedules").delete().eq("id", id);

  if (error) {
    console.error("[deleteSchedule] Supabase delete failed:", error);
    return { success: false, error: error.message };
  }

  // Audit log
  await supabase.from("admin_audit_logs").insert({
    user_id: user.id,
    user_email: user.email,
    action: "delete",
    table_name: "schedules",
    record_id: id,
  });

  revalidatePath("/[locale]/(public)", "page");
  revalidatePath("/[locale]/(admin)/admin/schedules", "page");
  revalidateTag("schedules");
  return { success: true };
}