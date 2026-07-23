"use server";

import { createServerClient } from "@/lib/supabase";
import type { AppDocument, DocumentCategory, ActionResult } from "@/types";
import { documentSchema, type DocumentInput } from "@/schemas/validations";
import { ensureDocumentCategory, CATEGORY_SLUG_MAP, SLUG_TO_CATEGORY_KEY } from "@/lib/document-helpers";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { logError } from "@/lib/error-logger";
import { REPORT_FILE_CATEGORIES, type ReportFileCategory } from "@/types";

/** A document category as returned to the client */
export interface DocumentCategoryOption {
  key: string;
  labelEn: string;
  labelKm: string;
}

/**
 * Fetch all document categories.
 * Now uses the hardcoded list from REPORT_FILE_CATEGORIES for consistency.
 */
export async function getDocumentCategories(): Promise<DocumentCategoryOption[]> {
  return REPORT_FILE_CATEGORIES.map((c) => ({
    key: c.key,
    labelEn: c.labelEn,
    labelKm: c.labelKm,
  }));
}

/**
 * Fetch a single document by ID from report_files.
 */
export async function getDocumentById(id: string): Promise<AppDocument | null> {
  try { await requireAdmin(); } catch { return null; }
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("report_files")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    logError(error, { tags: ["documents", "byId"], severity: "medium", id });
    return null;
  }

  const file = data;
  return {
    id: file.id,
    title_km: file.title_km,
    title_en: file.title_en,
    description_km: file.description_km,
    description_en: file.description_en,
    file_url: file.file_url,
    file_name: file.file_name,
    category: {
      slug: file.category,
      name_km:
        REPORT_FILE_CATEGORIES.find((c) => c.key === file.category)
          ?.labelKm ?? file.category,
      name_en:
        REPORT_FILE_CATEGORIES.find((c) => c.key === file.category)
          ?.labelEn ?? file.category,
    },
    is_active: file.is_active,
    sort_order: file.sort_order,
    created_at: file.created_at,
    updated_at: file.updated_at,
  } as AppDocument;
}

/**
 * Fetch all documents (admin), optionally filtered by category and search.
 * Now queries the `report_files` table.
 */
export async function getDocuments(params?: {
  category?: DocumentCategory | "all";
  search?: string;
}): Promise<AppDocument[]> {
  try { await requireAdmin(); } catch { return []; }
  const supabase = createServerClient();
  let query = supabase
    .from("report_files")
    .select("*")
    .order("created_at", { ascending: false });

  if (params?.category && params.category !== "all") {
    query = query.eq("category", params.category);
  }

  const { data, error } = await query;
  if (error) {
    logError(error, { tags: ["documents", "list"], severity: "medium", params });
    return [];
  }

  let documents = (data ?? []).map((file: any) => ({
    id: file.id,
    title_km: file.title_km,
    title_en: file.title_en,
    description_km: file.description_km,
    description_en: file.description_en,
    file_url: file.file_url,
    file_name: file.file_name,
    category: {
      slug: file.category,
      name_km:
        REPORT_FILE_CATEGORIES.find((c) => c.key === file.category)
          ?.labelKm ?? file.category,
      name_en:
        REPORT_FILE_CATEGORIES.find((c) => c.key === file.category)
          ?.labelEn ?? file.category,
    },
    is_active: file.is_active,
    sort_order: file.sort_order,
    created_at: file.created_at,
    updated_at: file.updated_at,
  })) as AppDocument[];

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
 * Create a new document record in the `report_files` table.
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

  const { error } = await supabase.from("report_files").insert({
    title_km: parsed.data.title_km,
    title_en: parsed.data.title_en,
    description_km: parsed.data.description_km || null,
    description_en: parsed.data.description_en || null,
    file_url: parsed.data.file_url,
    file_name: parsed.data.file_name,
    category: parsed.data.category,
    sort_order: parsed.data.sort_order,
    is_active: parsed.data.is_active,
  });

  if (error) {
    logError(error, { tags: ["documents", "create"], severity: "high" });
    return { success: false, error: error.message };
  }
  revalidatePath("/[locale]/(public)", "page");
  revalidatePath("/[locale]/(admin)/admin/documents", "page");
  revalidateTag("documents");
  return { success: true };
}

/**
 * Update an existing document in the `report_files` table.
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

  const { error } = await supabase
    .from("report_files")
    .update({
      title_km: parsed.data.title_km,
      title_en: parsed.data.title_en,
      description_km: parsed.data.description_km || null,
      description_en: parsed.data.description_en || null,
      file_url: parsed.data.file_url,
      file_name: parsed.data.file_name,
      category: parsed.data.category,
      is_active: parsed.data.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    logError(error, { tags: ["documents", "update"], severity: "high", id });
    return { success: false, error: error.message };
  }
  revalidatePath("/[locale]/(public)", "page");
  revalidatePath("/[locale]/(admin)/admin/documents", "page");
  revalidateTag("documents");
  return { success: true };
}

/**
 * Delete a document from the `report_files` table by ID.
 */
export async function deleteDocument(
  id: string
): Promise<ActionResult> {
  try { await requireAdmin(); } catch { return { success: false, error: "Unauthorized" }; }
  const supabase = createServerClient();
  const { error } = await supabase.from("report_files").delete().eq("id", id);

  if (error) {
    logError(error, { tags: ["documents", "delete"], severity: "high", id });
    return { success: false, error: error.message };
  }
  revalidatePath("/[locale]/(public)", "page");
  revalidatePath("/[locale]/(admin)/admin/documents", "page");
  revalidateTag("documents");
  return { success: true };
}
