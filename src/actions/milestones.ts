"use server";

import { createServerClient } from "@/lib/supabase";
import type { ActionResult } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";

export async function getMilestones() {
  try { await requireAdmin(); } catch { return []; }
  const supabase = createServerClient();
  const { data } = await supabase
    .from("milestones")
    .select("*")
    .order("sort_order");
  return data ?? [];
}

export async function upsertMilestone(
  id: string | null,
  data: {
    year: string;
    title_km: string;
    title_en: string;
    description_km: string;
    description_en: string;
    image_url: string;
    caption_km: string;
    caption_en: string;
    color: string;
    sort_order: number;
    is_active: boolean;
  }
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const supabase = createServerClient();
  const payload = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  let error;
  if (id) {
    ({ error } = await supabase
      .from("milestones")
      .update(payload)
      .eq("id", id));
  } else {
    ({ error } = await supabase
      .from("milestones")
      .insert(payload));
  }

  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/about", "page");
  revalidateTag("milestones");
  return { success: true };
}

export async function deleteMilestone(
  id: string
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const supabase = createServerClient();
  const { error } = await supabase
    .from("milestones")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/about", "page");
  revalidateTag("milestones");
  return { success: true };
}
