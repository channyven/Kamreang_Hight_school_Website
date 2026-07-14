"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { createServerClient } from "@/lib/supabase";
import { NewsService } from "@/services/news.service";
import { AuditService } from "@/services/audit.service";
import { newsSchema, type NewsInput } from "@/schemas/validations";
import type { ActionResult, SessionUser, News } from "@/types";

// ─── Session helper ───────────────────────────────────────────
// Decodes the Firebase ID token stored in the httpOnly __session
// cookie (set by /api/auth/session) to extract the firebase_uid,
// then looks up the corresponding admin_users record.
// This does NOT verify the JWT signature; validation is delegated
// to Firebase Auth at token-creation time and the httpOnly cookie
// is inaccessible to XSS.

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

/** Transform empty strings to null so Supabase doesn't reject them */
function sanitizeInput(
  data: NewsInput
): Record<string, unknown> {
  const record = { ...data } as Record<string, unknown>;
  for (const key of ["category_id", "featured_image", "publish_date"] as const) {
    if (record[key] === "") record[key] = null;
  }
  // Ensure gallery_images is always an array
  if (!Array.isArray(record.gallery_images)) {
    record.gallery_images = [];
  }
  // Auto-set publish_date to now if status is published and no date was provided
  if (data.status === "published" && (!data.publish_date || data.publish_date === "")) {
    record.publish_date = new Date().toISOString();
  }
  return record;
}

// ─── CRUD Actions ─────────────────────────────────────────────

/** Postgres unique-violation error code */
const PG_UNIQUE_VIOLATION = "23505";

/** Regex for a trailing slug counter, e.g. "-3" at the end of "my-article-3" */
const SLUG_COUNTER_RE = /-(\d+)$/;

/**
 * Build the next unique slug by incrementing a trailing counter.
 * e.g. "my-article"   → "my-article-1"
 *      "my-article-3" → "my-article-4"
 */
function nextSlug(current: string): string {
  const match = current.match(SLUG_COUNTER_RE);
  const nextNum = match ? parseInt(match[1], 10) + 1 : 1;
  return current.replace(SLUG_COUNTER_RE, "") + `-${nextNum}`;
}

/**
 * Return true when the error is a unique-constraint violation on `news.slug`.
 * Checks both the standard Postgres error code and a fallback string match
 * for older Supabase clients that wrap the error differently.
 */
function isSlugConflict(error: { code?: string; message: string }): boolean {
  return (
    error.code === PG_UNIQUE_VIOLATION ||
    error.message.includes("news_slug_key") ||
    error.message.includes("duplicate key")
  );
}

export async function createNews(data: NewsInput): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }

  const parsed = newsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const user = await getCurrentUser();
  let insertData: Record<string, unknown> = {
    ...sanitizeInput(parsed.data),
    created_by: user?.id ?? null,
    updated_by: user?.id ?? null,
  };

  // Attempt insert; if slug conflicts, retry with a suffixed slug
  const maxRetries = 10;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const { error } = await supabase.from("news").insert(insertData);

    if (!error) {
      // Audit log
      if (user) {
        await supabase.from("admin_audit_logs").insert({
          user_id: user.id,
          user_email: user.email,
          action: "create",
          table_name: "news",
        });
      }

      revalidatePath("/[locale]/news", "page");
      revalidatePath("/", "layout");
      revalidateTag("news");
      return { success: true };
    }

    // If it's not a unique constraint violation on slug, bail out immediately
    if (!isSlugConflict(error)) {
      return { success: false, error: error.message };
    }

    // Append a counter to the slug and retry
    insertData = { ...insertData, slug: nextSlug((insertData.slug as string) || "article") };
  }

  return { success: false, error: "Failed to create article — slug is taken even after several attempts. Please try a different title." };
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
  let updateData: Record<string, unknown> = {
    ...sanitizeInput(parsed.data),
    updated_at: new Date().toISOString(),
    updated_by: user?.id ?? null,
  };

  // Attempt update; if slug conflicts, retry with a suffixed slug
  const maxRetries = 10;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const { error } = await supabase
      .from("news")
      .update(updateData)
      .eq("id", id);

    if (!error) {
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

      revalidatePath("/[locale]/news", "page");
      revalidatePath("/", "layout");
      revalidateTag("news");
      return { success: true };
    }

    // If it's not a unique constraint violation on slug, bail out immediately
    if (!isSlugConflict(error)) {
      return { success: false, error: error.message };
    }

    // Append a counter to the slug and retry
    updateData = { ...updateData, slug: nextSlug((updateData.slug as string) || "article") };
  }

  return { success: false, error: "Failed to update article — slug is taken. Please try a different slug." };
}

export async function deleteNews(id: string): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }

  const newsService = new NewsService();
  const auditService = new AuditService();
  const user = await getCurrentUser();

  const error = await newsService.remove(id);
  if (error) return { success: false, error };

  if (user) {
    await auditService.log({
      userId: user.id,
      userEmail: user.email,
      action: "delete",
      tableName: "news",
      recordId: id,
    });
  }

  revalidatePath("/[locale]/news", "page");
  revalidatePath("/", "layout");
  revalidateTag("news");
  return { success: true };
}

// ─── Admin list fetch ───────────────────────────────────────────
// The admin news list page cannot use the browser supabase client
// directly because RLS restricts anon keys to only published news.
// This server action uses the service role to fetch all articles.

export async function getAdminNewsList(): Promise<News[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("news")
      .select("*, category:news_categories(*)")
      .order("created_at", { ascending: false });
    return (data ?? []) as News[];
  } catch {
    return [];
  }
}

/** Fetch a single news item by ID using the service role (bypasses RLS) */
export async function getAdminNewsById(id: string): Promise<News | null> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("news")
      .select("*, category:news_categories(*)")
      .eq("id", id)
      .single();
    return data as News | null;
  } catch {
    return null;
  }
}
