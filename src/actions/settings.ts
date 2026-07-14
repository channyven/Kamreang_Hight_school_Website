"use server";

import { createServerClient } from "@/lib/supabase";
import type { ActionResult } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";

export async function upsertSetting(
  key: string,
  value: string,
  description?: string
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const supabase = createServerClient();
  const { error } = await supabase
    .from("settings")
    .upsert(
      { key, value, description, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("settings");
  return { success: true };
}

export async function upsertSchoolInfo(
  section: string,
  contentKm: string,
  contentEn: string
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const supabase = createServerClient();
  const { error } = await supabase
    .from("school_info")
    .upsert(
      {
        section,
        content_km: contentKm,
        content_en: contentEn,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "section" }
    );
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/about", "page");
  revalidateTag("school_info");
  return { success: true };
}

export async function updateLeadership(
  id: string,
  data: {
    name_km: string;
    name_en: string;
    position_km: string;
    position_en: string;
    bio_km?: string;
    bio_en?: string;
    photo_url?: string;
    sort_order: number;
    is_active: boolean;
  }
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const supabase = createServerClient();
  const { error } = await supabase
    .from("leadership")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/about", "page");
  revalidateTag("leadership");
  return { success: true };
}
