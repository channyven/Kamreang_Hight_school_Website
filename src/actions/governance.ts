"use server";

import { createServerClient } from "@/lib/supabase";
import { governanceItemSchema, type GovernanceItemInput } from "@/schemas/validations";
import type { ActionResult, GovernanceItem } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";

// Admin reads go through the service-role client because RLS on
// governance_items only allows the anon role to see is_active = true rows
// (see 009_governance_items.sql) — the browser `supabase` client would
// silently hide inactive items from the admin list/edit pages otherwise.

export async function getAllGovernanceItems(): Promise<GovernanceItem[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("governance_items")
    .select("*")
    .order("section")
    .order("sort_order");
  return (data ?? []) as GovernanceItem[];
}

export async function getGovernanceItemById(id: string): Promise<GovernanceItem | null> {
  const supabase = createServerClient();
  const { data } = await supabase.from("governance_items").select("*").eq("id", id).maybeSingle();
  return data as GovernanceItem | null;
}

export async function createGovernanceItem(
  data: GovernanceItemInput
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const parsed = governanceItemSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("governance_items").insert(parsed.data);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/governance", "page");
  revalidateTag("governance_items");
  return { success: true };
}

export async function updateGovernanceItem(
  id: string,
  data: GovernanceItemInput
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const parsed = governanceItemSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("governance_items")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/governance", "page");
  revalidateTag("governance_items");
  return { success: true };
}

export async function deleteGovernanceItem(id: string): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const supabase = createServerClient();
  const { error } = await supabase.from("governance_items").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/governance", "page");
  revalidateTag("governance_items");
  return { success: true };
}
