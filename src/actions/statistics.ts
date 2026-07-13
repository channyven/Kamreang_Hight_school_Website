"use server";

import { createServerClient } from "@/lib/supabase";
import { statisticsSchema, type StatisticsInput } from "@/schemas/validations";
import type { ActionResult } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";

export async function createStatistics(
  data: StatisticsInput
): Promise<ActionResult<void>> {
  const parsed = statisticsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
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
  const parsed = statisticsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
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
  const supabase = createServerClient();
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
  const supabase = createServerClient();
  const { error } = await supabase.from("statistics").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("statistics");
  return { success: true };
}
