"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { newsSchema, type NewsInput } from "@/schemas/validations";
import type { ActionResult, SessionUser } from "@/types";
import { NewsService, AuditService } from "@/services";

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

    const { createServerClient } = await import("@/lib/supabase");
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

export async function createNews(data: NewsInput): Promise<ActionResult<void>> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }

  const parsed = newsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const newsService = new NewsService();
  const auditService = new AuditService();
  const user = await getCurrentUser();

  const error = await newsService.create(parsed.data, user?.id);
  if (error) return { success: false, error };

  if (user) {
    await auditService.log({
      userId: user.id,
      userEmail: user.email,
      action: "create",
      tableName: "news",
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

  const newsService = new NewsService();
  const auditService = new AuditService();
  const user = await getCurrentUser();

  const error = await newsService.update(id, parsed.data, user?.id);
  if (error) return { success: false, error };

  if (user) {
    await auditService.log({
      userId: user.id,
      userEmail: user.email,
      action: "update",
      tableName: "news",
      recordId: id,
    });
  }

  revalidatePath("/[locale]/(public)/news", "page");
  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("news");
  return { success: true };
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

  revalidatePath("/[locale]/(public)/news", "page");
  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("news");
  return { success: true };
}
