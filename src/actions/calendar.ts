"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { createServerClient } from "@/lib/supabase";
import { calendarEventSchema, type CalendarEventInput } from "@/schemas/validations";
import type { ActionResult, SessionUser, CalendarEvent } from "@/types";

/**
 * Fetch calendar events within a date range (public)
 */
export async function getCalendarEvents(
  startDate: string,
  endDate: string
): Promise<CalendarEvent[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .gte("start_date", startDate)
    .lte("end_date", endDate)
    .in("status", ["published"])
    .order("start_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("[getCalendarEvents] query failed:", error);
    return [];
  }

  return (data ?? []) as CalendarEvent[];
}

/**
 * Fetch all calendar events (admin - includes all statuses)
 */
export async function getAllCalendarEvents(): Promise<CalendarEvent[]> {
  try { await requireAdmin(); } catch { return []; }
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .order("start_date", { ascending: false })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("[getAllCalendarEvents] query failed:", error);
    return [];
  }

  return (data ?? []) as CalendarEvent[];
}

/**
 * Fetch featured/upcoming events (public)
 */
export async function getFeaturedEvents(limit = 5): Promise<CalendarEvent[]> {
  const supabase = createServerClient();
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .gte("end_date", today)
    .eq("status", "published")
    .eq("visibility", "public")
    .order("start_date", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[getFeaturedEvents] query failed:", error);
    return [];
  }

  return (data ?? []) as CalendarEvent[];
}

/**
 * Fetch a single event by ID
 */
export async function getCalendarEventById(id: string): Promise<CalendarEvent | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[getCalendarEventById] query failed:", error);
    return null;
  }

  return data as CalendarEvent;
}

/**
 * Create a new calendar event (admin)
 */
export async function createCalendarEvent(data: CalendarEventInput): Promise<ActionResult<void>> {
  let user: SessionUser;
  try { user = await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }

  const parsed = calendarEventSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("calendar_events").insert({
    title: parsed.data.title,
    description: parsed.data.description || null,
    category: parsed.data.category,
    location: parsed.data.location || null,
    organizer: parsed.data.organizer || null,
    start_date: parsed.data.start_date,
    end_date: parsed.data.end_date,
    start_time: parsed.data.start_time || null,
    end_time: parsed.data.end_time || null,
    is_all_day: parsed.data.is_all_day,
    is_recurring: parsed.data.is_recurring,
    recurring_rule: parsed.data.recurring_rule || null,
    visibility: parsed.data.visibility,
    status: parsed.data.status,
    color: parsed.data.color || null,
    attachment_url: parsed.data.attachment_url || null,
    grade_level: parsed.data.grade_level || null,
    department: parsed.data.department || null,
    is_featured: parsed.data.is_featured,
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    console.error("[createCalendarEvent] insert failed:", error);
    return { success: false, error: error.message };
  }

  await supabase.from("admin_audit_logs").insert({
    user_id: user.id,
    user_email: user.email,
    action: "create",
    table_name: "calendar_events",
  });

  revalidatePath("/[locale]/(public)", "page");
  revalidatePath("/[locale]/(admin)/admin/calendar", "page");
  revalidateTag("calendar_events");
  return { success: true };
}

/**
 * Update an existing calendar event (admin)
 */
export async function updateCalendarEvent(
  id: string,
  data: CalendarEventInput
): Promise<ActionResult<void>> {
  let user: SessionUser;
  try { user = await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }

  const parsed = calendarEventSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("calendar_events")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      category: parsed.data.category,
      location: parsed.data.location || null,
      organizer: parsed.data.organizer || null,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date,
      start_time: parsed.data.start_time || null,
      end_time: parsed.data.end_time || null,
      is_all_day: parsed.data.is_all_day,
      is_recurring: parsed.data.is_recurring,
      recurring_rule: parsed.data.recurring_rule || null,
      visibility: parsed.data.visibility,
      status: parsed.data.status,
      color: parsed.data.color || null,
      attachment_url: parsed.data.attachment_url || null,
      grade_level: parsed.data.grade_level || null,
      department: parsed.data.department || null,
      is_featured: parsed.data.is_featured,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateCalendarEvent] update failed:", error);
    return { success: false, error: error.message };
  }

  await supabase.from("admin_audit_logs").insert({
    user_id: user.id,
    user_email: user.email,
    action: "update",
    table_name: "calendar_events",
    record_id: id,
  });

  revalidatePath("/[locale]/(public)", "page");
  revalidatePath("/[locale]/(admin)/admin/calendar", "page");
  revalidateTag("calendar_events");
  return { success: true };
}

/**
 * Duplicate a calendar event (admin)
 */
export async function duplicateCalendarEvent(id: string): Promise<ActionResult<void>> {
  let user: SessionUser;
  try { user = await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }

  const supabase = createServerClient();
  const original = await supabase.from("calendar_events").select("*").eq("id", id).single();
  if (original.error || !original.data) {
    return { success: false, error: "Event not found" };
  }

  const ev = original.data;
  const { error } = await supabase.from("calendar_events").insert({
    title: `${ev.title} (Copy)`,
    description: ev.description,
    category: ev.category,
    location: ev.location,
    organizer: ev.organizer,
    start_date: ev.start_date,
    end_date: ev.end_date,
    start_time: ev.start_time,
    end_time: ev.end_time,
    is_all_day: ev.is_all_day,
    is_recurring: ev.is_recurring,
    recurring_rule: ev.recurring_rule,
    visibility: ev.visibility,
    status: "draft",
    color: ev.color,
    attachment_url: ev.attachment_url,
    grade_level: ev.grade_level,
    department: ev.department,
    is_featured: false,
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    console.error("[duplicateCalendarEvent] failed:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/[locale]/(admin)/admin/calendar", "page");
  revalidateTag("calendar_events");
  return { success: true };
}

/**
 * Delete a calendar event (admin)
 */
export async function deleteCalendarEvent(id: string): Promise<ActionResult<void>> {
  let user: SessionUser;
  try { user = await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }

  const supabase = createServerClient();
  const { error } = await supabase.from("calendar_events").delete().eq("id", id);

  if (error) {
    console.error("[deleteCalendarEvent] delete failed:", error);
    return { success: false, error: error.message };
  }

  await supabase.from("admin_audit_logs").insert({
    user_id: user.id,
    user_email: user.email,
    action: "delete",
    table_name: "calendar_events",
    record_id: id,
  });

  revalidatePath("/[locale]/(public)", "page");
  revalidatePath("/[locale]/(admin)/admin/calendar", "page");
  revalidateTag("calendar_events");
  return { success: true };
}