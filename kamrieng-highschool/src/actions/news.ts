"use server";

import { createServerClient } from "@/lib/supabase";
import { newsSchema, type NewsInput } from "@/lib/validations";
import type { ActionResult } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";

export async function createNews(data: NewsInput): Promise<ActionResult<void>> {
  const parsed = newsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("news").insert(parsed.data);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/news", "page");
  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("news");
  return { success: true };
}

export async function updateNews(
  id: string,
  data: NewsInput
): Promise<ActionResult<void>> {
  const parsed = newsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("news")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/news", "page");
  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("news");
  return { success: true };
}

export async function deleteNews(id: string): Promise<ActionResult<void>> {
  const supabase = createServerClient();
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/news", "page");
  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("news");
  return { success: true };
}
