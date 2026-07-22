"use server";

import { createServerClient } from "@/lib/supabase";
import type { AppDocument, DocumentCategory, ActionResult } from "@/types";
import { documentSchema, type DocumentInput } from "@/schemas/validations";
import { ensureDocumentCategory, CATEGORY_SLUG_MAP, SLUG_TO_CATEGORY_KEY } from "@/lib/document-helpers";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";

/** A document category as returned to the client */
export interface DocumentCategoryOption {
  key: string;
  labelEn: string;
  labelKm: string;
}

/**
 * Fetch all document categories from the database.
 * Falls back to the hardcoded list if the DB query fails.
 */
export async function getDocumentCategories(): Promise<DocumentCategoryOption[]> {
  try {
    await requireAdmin();
  } catch {
    return [];
  }
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("download_categories")
    .select("slug, name_km, name_en")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.error("Failed to fetch document categories:", error);
  }

  if (data && data.length > 0) {
    return data.map((cat: { slug: string; name_km: string; name_en: string }) => ({
      key: SLUG_TO_CATEGORY_KEY[cat.slug] ?? cat.slug,
      labelEn: cat.name_en,
      labelKm: cat.name_km,
    }));
  }

  return [
    { key: "report", labelEn: "Report", labelKm: "របាយការណ៍" },
    { key: "result", labelEn: "Result", labelKm: "លទ្ធផល" },
    { key: "form", labelEn: "Form", labelKm: "បែបបទ" },
    { key: "policy", labelEn: "Policy", labelKm: "គោលនយោបាយ" },
    { key: "other", labelEn: "Other", labelKm: "ផ្សេងៗ" },
  ];
}

/**
 * Fetch a single document by ID.
 */
export async function getDocumentById(id: string): Promise<AppDocument | null> {
  try { await requireAdmin(); } catch { return null; }
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
  try { await requireAdmin(); } catch { return []; }
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
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
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
    sort_order: parsed.data.sort_order,
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
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
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
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
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
