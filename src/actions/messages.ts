"use server";

import { createServerClient } from "@/lib/supabase";
import type { ActionResult, Message } from "@/types";
import { requireAdmin } from "@/lib/auth-guard";

export async function getMessages(params?: {
  status?: string;
}): Promise<Message[]> {
  try {
    const supabase = createServerClient();
    let query = supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (params?.status && params.status !== "all") {
      query = query.eq("status", params.status);
    }

    const { data } = await query;
    return (data ?? []) as Message[];
  } catch (error) {
    console.error("getMessages error:", error);
    return [];
  }
}

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
