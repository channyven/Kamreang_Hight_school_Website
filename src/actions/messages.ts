"use server";

import { createServerClient } from "@/lib/supabase";
import type { ActionResult } from "@/types";
import { requireAdmin } from "@/lib/auth-guard";

export async function markMessageRead(id: string): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const supabase = createServerClient();
  const { error } = await supabase
    .from("messages")
    .update({ status: "read" })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function markMessageReplied(
  id: string
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const supabase = createServerClient();
  const { error } = await supabase
    .from("messages")
    .update({ status: "replied" })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteMessage(id: string): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const supabase = createServerClient();
  const { error } = await supabase.from("messages").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
