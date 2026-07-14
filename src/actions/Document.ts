"use server";

import { createServerClient } from "@/lib/supabase";
import type { AppDocument, DocumentCategory, ActionResult } from "@/types";
import { documentSchema, type DocumentInput } from "@/schemas/validations";
import { ensureDocumentCategory, CATEGORY_SLUG_MAP } from "@/lib/document-helpers";
import { revalidatePath } from "next/cache";

/**
 * Fetch a single document by ID.
 */
export async function getDocumentById(id: string): Promise<AppDocument | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("downloads")
    .select("*, category:download_categories(name_km, name_en, slug)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Get document by ID error:", error);
    return null;
  }

  return data as unknown as AppDocument;
}

/**
 * Fetch all documents (admin), optionally filtered by category and search.
 * Uses the existing `downloads` table with a JOIN to `download_categories`.
 */
export async function getDocuments(params?: {
  category?: DocumentCategory | "all";
  search?: string;
}): Promise<AppDocument[]> {
  const supabase = createServerClient();
  let query = supabase
    .from("downloads")
    .select("*, category:download_categories(name_km, name_en, slug)")
    .order("created_at", { ascending: false });

  if (params?.category && params.category !== "all") {
    // Look up the category ID by slug first, then filter by category_id directly.
    // This is more reliable than filtering on the joined resource.
    const catSlug = CATEGORY_SLUG_MAP[params.category] ?? "other-documents";
    const { data: cat } = await supabase
      .from("download_categories")
      .select("id")
      .eq("slug", catSlug)
      .maybeSingle();

    if (cat) {
      query = query.eq("category_id", cat.id);
    }
  }

  const { data, error } = await query;
  if (error) {
    console.error("Get documents error:", error);
    return [];
  }
  let documents = (data ?? []) as unknown as AppDocument[];

  if (params?.search) {
    const q = params.search.toLowerCase();
    documents = documents.filter(
      (doc) =>
        doc.title_km?.toLowerCase().includes(q) ||
        doc.title_en?.toLowerCase().includes(q)
    );
  }

  return documents;
}

/**
 * Create a new document record in the existing `downloads` table.
 */
export async function createDocument(
  data: DocumentInput
): Promise<ActionResult<void>> {
  const parsed = documentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();

  // Ensure the download_category exists and get its ID
  const categoryId = await ensureDocumentCategory(parsed.data.category);
  if (!categoryId) {
    return { success: false, error: "Failed to resolve document category" };
  }

  const { error } = await supabase.from("downloads").insert({
    title_km: parsed.data.title_km,
    title_en: parsed.data.title_en,
    description_km: parsed.data.description_km || null,
    description_en: parsed.data.description_en || null,
    file_url: parsed.data.file_url,
    file_name: parsed.data.file_name,
    category_id: categoryId,
    is_active: parsed.data.is_active,
  });

  if (error) {
    console.error("Create document error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/[locale]/(public)", "page");
  revalidatePath("/[locale]/(admin)/admin/documents", "page");
  return { success: true };
}

/**
 * Update an existing document in the `downloads` table.
 */
export async function updateDocument(
  id: string,
  data: DocumentInput
): Promise<ActionResult<void>> {
  const parsed = documentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();

  // Ensure the download_category exists and get its ID
  const categoryId = await ensureDocumentCategory(parsed.data.category);
  if (!categoryId) {
    return { success: false, error: "Failed to resolve document category" };
  }

  const { error } = await supabase
    .from("downloads")
    .update({
      title_km: parsed.data.title_km,
      title_en: parsed.data.title_en,
      description_km: parsed.data.description_km || null,
      description_en: parsed.data.description_en || null,
      file_url: parsed.data.file_url,
      file_name: parsed.data.file_name,
      category_id: categoryId,
      is_active: parsed.data.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Update document error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/[locale]/(public)", "page");
  revalidatePath("/[locale]/(admin)/admin/documents", "page");
  return { success: true };
}

/**
 * Delete a document from the `downloads` table by ID.
 */
export async function deleteDocument(
  id: string
): Promise<ActionResult> {
  const supabase = createServerClient();
  const { error } = await supabase.from("downloads").delete().eq("id", id);

  if (error) {
    console.error("Delete document error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/[locale]/(public)", "page");
  revalidatePath("/[locale]/(admin)/admin/documents", "page");
  return { success: true };
}
