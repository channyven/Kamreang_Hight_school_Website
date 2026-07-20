"use server";

import { createServerClient } from "@/lib/supabase";
import { statisticsSchema, type StatisticsInput } from "@/schemas/validations";
import type { ActionResult, Statistics } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";

// ─── Admin list fetch ─────────────────────────────────────────
// Uses service-role client (bypasses RLS) so admin can see all rows.

export async function getAdminStatisticsList(): Promise<Statistics[]> {
  try { await requireAdmin(); } catch { return []; }
  const supabase = createServerClient();
  const { data } = await supabase
    .from("statistics")
    .select("*")
    .order("academic_year", { ascending: false });
  return (data ?? []) as Statistics[];
}

export async function getAdminStatisticsById(id: string): Promise<Statistics | null> {
  try { await requireAdmin(); } catch { return null; }
  const supabase = createServerClient();
  const { data } = await supabase
    .from("statistics")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data as Statistics | null;
}

// ─── CRUD Actions ──────────────────────────────────────────────

export async function createStatistics(
  data: StatisticsInput
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const parsed = statisticsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();

  // If setting as current, clear existing current flags on all rows first
  if (parsed.data.is_current) {
    await supabase.from("statistics").update({ is_current: false }).not("id", "is", null);
  }

  const { error } = await supabase.from("statistics").insert(parsed.data);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("statistics");
  return { success: true };
}

export async function updateStatistics(
  id: string,
  data: StatisticsInput
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const parsed = statisticsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();

  // If setting as current, clear existing current flags on other rows first
  if (parsed.data.is_current) {
    await supabase.from("statistics").update({ is_current: false }).neq("id", id);
  }

  const { error } = await supabase
    .from("statistics")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("statistics");
  return { success: true };
}

export async function setCurrentStatistics(
  id: string
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const supabase = createServerClient();

  // Clear current flag on all rows, then set on target
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

  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("statistics");
  return { success: true };
}

export async function deleteStatistics(id: string): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const supabase = createServerClient();
  const { error } = await supabase.from("statistics").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("statistics");
  return { success: true };
}
