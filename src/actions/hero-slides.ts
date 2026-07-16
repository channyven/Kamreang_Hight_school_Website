"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { createServerClient } from "@/lib/supabase";
import type { ActionResult, SessionUser, HeroSlide } from "@/types";

// ─── Types ────────────────────────────────────────────────────

export interface HeroSlideInput {
  title_km: string;
  title_en: string;
  subtitle_km?: string;
  subtitle_en?: string;
  image_url?: string;
  gradient?: string;
  cta_primary_km?: string;
  cta_primary_en?: string;
  cta_secondary_km?: string;
  cta_secondary_en?: string;
  cta_primary_href?: string;
  cta_secondary_href?: string;
  sort_order: number;
  is_active: boolean;
}

// ─── CRUD Actions ─────────────────────────────────────────────

export async function createHeroSlide(data: HeroSlideInput): Promise<ActionResult<void>> {
  let user: SessionUser;
  try { user = await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }

  if (!data.title_km || !data.title_en) {
    return { success: false, error: "Title (both Khmer and English) is required" };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("hero_slides").insert({
    ...data,
    sort_order: data.sort_order ?? 99,
    is_active: data.is_active ?? true,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Audit log
  await supabase.from("admin_audit_logs").insert({
    user_id: user.id,
    user_email: user.email,
    action: "create",
    table_name: "hero_slides",
  });

  revalidatePath("/", "layout");
  revalidateTag("hero_slides");
  return { success: true };
}

export async function updateHeroSlide(
  id: string,
  data: HeroSlideInput
): Promise<ActionResult<void>> {
  let user: SessionUser;
  try { user = await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }

  if (!data.title_km || !data.title_en) {
    return { success: false, error: "Title (both Khmer and English) is required" };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("hero_slides")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  // Audit log
  await supabase.from("admin_audit_logs").insert({
    user_id: user.id,
    user_email: user.email,
    action: "update",
    table_name: "hero_slides",
    record_id: id,
  });

  revalidatePath("/", "layout");
  revalidateTag("hero_slides");
  return { success: true };
}

export async function deleteHeroSlide(id: string): Promise<ActionResult<void>> {
  let user: SessionUser;
  try { user = await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }

  const supabase = createServerClient();
  const { error } = await supabase.from("hero_slides").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  // Audit log
  await supabase.from("admin_audit_logs").insert({
    user_id: user.id,
    user_email: user.email,
    action: "delete",
    table_name: "hero_slides",
    record_id: id,
  });

  revalidatePath("/", "layout");
  revalidateTag("hero_slides");
  return { success: true };
}

export async function reorderHeroSlides(
  orderedIds: string[]
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }

  const supabase = createServerClient();
  const updates = orderedIds.map((id, index) => ({
    id,
    sort_order: index + 1,
    updated_at: new Date().toISOString(),
  }));

  // Update each slide's sort_order
  for (const update of updates) {
    const { error } = await supabase
      .from("hero_slides")
      .update({ sort_order: update.sort_order, updated_at: update.updated_at })
      .eq("id", update.id);

    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  revalidateTag("hero_slides");
  return { success: true };
}

// ─── Admin fetch (service role bypasses RLS) ─────────────────

export async function getAdminHeroSlides(): Promise<HeroSlide[]> {
  try { await requireAdmin(); } catch { return []; }
  const supabase = createServerClient();
  const { data } = await supabase
    .from("hero_slides")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data ?? []) as HeroSlide[];
}

export async function getAdminHeroSlideById(id: string): Promise<HeroSlide | null> {
  try { await requireAdmin(); } catch { return null; }
  const supabase = createServerClient();
  const { data } = await supabase
    .from("hero_slides")
    .select("*")
    .eq("id", id)
    .single();
  return data as HeroSlide | null;
}

/** Toggle active status */
export async function toggleHeroSlideActive(
  id: string,
  isActive: boolean
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const supabase = createServerClient();
  const { error } = await supabase
    .from("hero_slides")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/", "layout");
  revalidateTag("hero_slides");
  return { success: true };
}
