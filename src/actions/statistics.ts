"use server";

import { createServerClient } from "@/lib/supabase";
import { statisticsSchema, type StatisticsInput } from "@/schemas/validations";
import type { ActionResult, Statistics } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";

// ─── Auth guard helper ────────────────────────────────────────
async function guardAdmin() {
  try { return await requireAdmin(); } catch { throw new Error("Unauthorized"); }
}

function unauthResult(): ActionResult<void> {
  return { success: false, error: "Unauthorized" };
}

// ─── Admin data fetchers ──────────────────────────────────────
// Uses service-role client (bypasses RLS) so admin can see all rows.

export async function getAdminStatisticsList(): Promise<Statistics[]> {
  try { await guardAdmin(); } catch { return []; }
  const supabase = createServerClient();
  const { data } = await supabase
    .from("statistics")
    .select("*")
    .order("academic_year", { ascending: false });
  return (data ?? []) as Statistics[];
}

export async function getAdminStatisticsById(id: string): Promise<Statistics | null> {
  try { await guardAdmin(); } catch { return null; }
  const supabase = createServerClient();
  const { data } = await supabase
    .from("statistics")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data as Statistics | null;
}

// ─── Helpers ───────────────────────────────────────────────────

/** Clear the `is_current` flag on all statistics rows except the one with the given id (or all rows if no id is given). */
async function clearCurrentFlag(exceptId?: string) {
  const supabase = createServerClient();
  if (exceptId) {
    await supabase.from("statistics").update({ is_current: false }).neq("id", exceptId);
  } else {
    await supabase.from("statistics").update({ is_current: false }).not("id", "is", null);
  }
}

function revalidateAll() {
  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("statistics");
}

// ─── CRUD Actions ──────────────────────────────────────────────

export async function createStatistics(data: StatisticsInput): Promise<ActionResult<void>> {
  try { await guardAdmin(); } catch { return unauthResult(); }

  const parsed = statisticsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }
  if (parsed.data.is_current) await clearCurrentFlag();

  const supabase = createServerClient();
  const { error } = await supabase.from("statistics").insert(parsed.data);
  if (error) return { success: false, error: error.message };

  revalidateAll();
  return { success: true };
}

export async function updateStatistics(id: string, data: StatisticsInput): Promise<ActionResult<void>> {
  try { await guardAdmin(); } catch { return unauthResult(); }

  const parsed = statisticsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }
  if (parsed.data.is_current) await clearCurrentFlag(id);

  const supabase = createServerClient();
  const { error } = await supabase
    .from("statistics")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidateAll();
  return { success: true };
}

export async function setCurrentStatistics(id: string): Promise<ActionResult<void>> {
  try { await guardAdmin(); } catch { return unauthResult(); }

  const supabase = createServerClient();
  const { error: clearError } = await supabase
    .from("statistics")
    .update({ is_current: false })
    .neq("id", id);
  if (clearError) return { success: false, error: clearError.message };

  const { error } = await supabase
    .from("statistics")
    .update({ is_current: true })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidateAll();
  return { success: true };
}

export async function deleteStatistics(id: string): Promise<ActionResult<void>> {
  try { await guardAdmin(); } catch { return unauthResult(); }

  const supabase = createServerClient();
  const { error } = await supabase.from("statistics").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidateAll();
  return { success: true };
}
