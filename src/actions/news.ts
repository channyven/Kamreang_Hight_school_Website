"use server";

import { createServerClient } from "@/lib/supabase";
import { newsSchema, type NewsInput } from "@/schemas/validations";
import type { ActionResult, SessionUser } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth-guard";

// ─── Session helper ───────────────────────────────────────────

async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("__session")?.value;
    if (!token) return null;

    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    const payload = JSON.parse(
      Buffer.from(payloadBase64, "base64url").toString("utf-8")
    );
    const firebaseUid: string | undefined = payload.sub;
    if (!firebaseUid) return null;

    const supabase = createServerClient();
    const { data } = await supabase
      .from("admin_users")
      .select("*")
      .eq("firebase_uid", firebaseUid)
      .single();

    if (!data || !data.is_active) return null;
    return data as SessionUser;
  } catch {
    return null;
  }
}

// ─── Helpers ───────────────────────────────────────────────────

function sanitizeInput(
  data: NewsInput
): Record<string, unknown> {
  const record = { ...data } as Record<string, unknown>;
  for (const key of ["category_id", "featured_image", "publish_date"] as const) {
    if (record[key] === "") record[key] = null;
  }
  if (!Array.isArray(record.gallery_images)) {
    record.gallery_images = [];
  }
  if (data.status === "published" && (!data.publish_date || data.publish_date === "")) {
    record.publish_date = new Date().toISOString();
  }
  return record;
}

// ─── CRUD Actions ─────────────────────────────────────────────

export async function createNews(data: NewsInput): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const parsed = newsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const user = await getCurrentUser();
  const insertData = {
    ...sanitizeInput(parsed.data),
    created_by: user?.id ?? null,
    updated_by: user?.id ?? null,
  };

  const { error } = await supabase.from("news").insert(insertData);
  if (error) return { success: false, error: error.message };

  // Audit log
  if (user) {
    await supabase.from("admin_audit_logs").insert({
      user_id: user.id,
      user_email: user.email,
      action: "create",
      table_name: "news",
    });
  }

  revalidatePath("/[locale]/(public)/news", "page");
  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("news");
  return { success: true };
}

export async function updateNews(
  id: string,
  data: NewsInput
): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const parsed = newsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const user = await getCurrentUser();
  const updateData = {
    ...sanitizeInput(parsed.data),
    updated_at: new Date().toISOString(),
    updated_by: user?.id ?? null,
  };

  const { error } = await supabase
    .from("news")
    .update(updateData)
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  // Audit log
  if (user) {
    await supabase.from("admin_audit_logs").insert({
      user_id: user.id,
      user_email: user.email,
      action: "update",
      table_name: "news",
      record_id: id,
    });
  }

  revalidatePath("/[locale]/(public)/news", "page");
  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("news");
  return { success: true };
}

export async function deleteNews(id: string): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const supabase = createServerClient();
  const user = await getCurrentUser();

  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  // Audit log
  if (user) {
    await supabase.from("admin_audit_logs").insert({
      user_id: user.id,
      user_email: user.email,
      action: "delete",
      table_name: "news",
      record_id: id,
    });
  }

  revalidatePath("/[locale]/(public)/news", "page");
  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("news");
  return { success: true };
}
