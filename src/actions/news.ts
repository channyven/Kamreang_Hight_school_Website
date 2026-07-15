"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { createServerClient } from "@/lib/supabase";
import { NewsService, sanitizeInput } from "@/services/news.service";
import { AuditService } from "@/services/audit.service";
import { newsSchema, type NewsInput } from "@/schemas/validations";
import type { ActionResult, SessionUser, News } from "@/types";

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
  let user: SessionUser;
  try { user = await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }

  const parsed = newsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  let insertData: Record<string, unknown> = {
    ...sanitizeInput(parsed.data),
    created_by: user.id,
    updated_by: user.id,
  };

  // Attempt insert; if slug conflicts, retry with a suffixed slug
  const maxRetries = 10;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const { error } = await supabase.from("news").insert(insertData);

    if (!error) {
      // Audit log
      await supabase.from("admin_audit_logs").insert({
        user_id: user.id,
        user_email: user.email,
        action: "create",
        table_name: "news",
      });

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
  let user: SessionUser;
  try { user = await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }

  const parsed = newsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  let updateData: Record<string, unknown> = {
    ...sanitizeInput(parsed.data),
    updated_at: new Date().toISOString(),
    updated_by: user.id,
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
      await supabase.from("admin_audit_logs").insert({
        user_id: user.id,
        user_email: user.email,
        action: "update",
        table_name: "news",
        record_id: id,
      });

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
  let user: SessionUser;
  try { user = await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }

  const newsService = new NewsService();
  const auditService = new AuditService();

  const error = await newsService.remove(id);
  if (error) return { success: false, error };

  await auditService.log({
    userId: user.id,
    userEmail: user.email,
    action: "delete",
    tableName: "news",
    recordId: id,
  });

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
  try { await requireAdmin(); } catch { return []; }
  const supabase = createServerClient();
  const { data } = await supabase
    .from("news")
    .select("*, category:news_categories(*)")
    .order("created_at", { ascending: false });
  return (data ?? []) as News[];
}

/** Fetch a single news item by ID using the service role (bypasses RLS) */
export async function getAdminNewsById(id: string): Promise<News | null> {
  try { await requireAdmin(); } catch { return null; }
  const supabase = createServerClient();
  const { data } = await supabase
    .from("news")
    .select("*, category:news_categories(*)")
    .eq("id", id)
    .single();
  return data as News | null;
}
