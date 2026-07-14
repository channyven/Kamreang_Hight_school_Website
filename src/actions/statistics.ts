"use server";

import { createServerClient } from "@/lib/supabase";
import { statisticsSchema, type StatisticsInput } from "@/schemas/validations";
import type { ActionResult } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";

export async function createStatistics(
  data: StatisticsInput
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const parsed = statisticsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();

  // If setting as current, clear existing current flags first
  if (parsed.data.is_current) {
    await supabase.from("statistics").update({ is_current: false }).neq("id", "00000000-0000-0000-0000-000000000000");
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

  // If setting as current, clear existing current flags first
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
