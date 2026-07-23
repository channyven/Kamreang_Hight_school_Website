"use server";

import { createServerClient } from "@/lib/supabase";
import type {
  ReportFile,
  ReportFileCategory,
  SchoolReport,
  OperationsReportContent,
  ActionResult,
} from "@/types";
import {
  reportFileSchema,
  operationsReportSchema,
  type ReportFileInput,
  type OperationsReportInput,
} from "@/schemas/validations";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { logError } from "@/lib/error-logger";

const REPORT_REVALIDATE = [
  "/[locale]/(admin)/admin/reports",
  "/[locale]/(public)/report",
];

/** Revalidate both the route paths and the cached query tag. */
function revalidateReports() {
  REPORT_REVALIDATE.forEach((p) => revalidatePath(p, "page"));
  revalidateTag("school_reports");
}

// ─── Report Files (library) ──────────────────────────────────

export async function getReportFiles(params?: {
  category?: ReportFileCategory | "all";
  search?: string;
}): Promise<ReportFile[]> {
  try {
    await requireAdmin();
  } catch {
    return [];
  }
  const supabase = createServerClient();
  let query = supabase
    .from("report_files")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (params?.category && params.category !== "all") {
    query = query.eq("category", params.category);
  }

  const { data, error } = await query;
  if (error) {
    logError(error, { tags: ["reports", "files", "list"], severity: "medium", params });
    return [];
  }

  let files = (data ?? []) as ReportFile[];
  if (params?.search) {
    const q = params.search.toLowerCase();
    files = files.filter(
      (f) =>
        f.title_km?.toLowerCase().includes(q) ||
        f.title_en?.toLowerCase().includes(q)
    );
  }
  return files;
}

export async function getReportFileById(id: string): Promise<ReportFile | null> {
  try {
    await requireAdmin();
  } catch {
    return null;
  }
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("report_files")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    logError(error, { tags: ["reports", "files", "byId"], severity: "medium", id });
    return null;
  }
  return data as ReportFile;
}

export async function createReportFile(
  data: ReportFileInput
): Promise<ActionResult<void>> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }
  const parsed = reportFileSchema.safeParse(data);
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
    academic_year: parsed.data.academic_year || null,
    sort_order: parsed.data.sort_order,
    is_active: parsed.data.is_active,
  });

  if (error) {
    logError(error, { tags: ["reports", "files", "create"], severity: "high" });
    return { success: false, error: error.message };
  }

  revalidateReports();
  return { success: true };
}

export async function updateReportFile(
  id: string,
  data: ReportFileInput
): Promise<ActionResult<void>> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }
  const parsed = reportFileSchema.safeParse(data);
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
      academic_year: parsed.data.academic_year || null,
      sort_order: parsed.data.sort_order,
      is_active: parsed.data.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    logError(error, { tags: ["reports", "files", "update"], severity: "high", id });
    return { success: false, error: error.message };
  }

  revalidateReports();
  return { success: true };
}

export async function deleteReportFile(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }
  const supabase = createServerClient();
  const { error } = await supabase.from("report_files").delete().eq("id", id);

  if (error) {
    logError(error, { tags: ["reports", "files", "delete"], severity: "high", id });
    return { success: false, error: error.message };
  }

  revalidateReports();
  return { success: true };
}

// ─── Operations Report (annual, JSONB) ──────────────────────

export async function getOperationsReport(
  academicYear?: string
): Promise<SchoolReport | null> {
  try {
    await requireAdmin();
  } catch {
    return null;
  }
  const supabase = createServerClient();

  let query = supabase
    .from("school_reports")
    .select("*")
    .order("academic_year", { ascending: false });

  if (academicYear) {
    query = query.eq("academic_year", academicYear);
  }

  const { data, error } = await query.limit(1).maybeSingle();
  if (error) {
    logError(error, { tags: ["reports", "operations", "get"], severity: "medium", academicYear });
    return null;
  }
  return data as SchoolReport | null;
}

export async function getAllOperationsReports(): Promise<SchoolReport[]> {
  try {
    await requireAdmin();
  } catch {
    return [];
  }
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("school_reports")
    .select("*")
    .order("academic_year", { ascending: false });

  if (error) {
    logError(error, { tags: ["reports", "operations", "list"], severity: "medium" });
    return [];
  }
  return (data ?? []) as SchoolReport[];
}

/**
 * Insert or update the operations report for a given academic year.
 * The full section content is stored in the JSONB `content` column.
 */
export async function upsertOperationsReport(
  data: OperationsReportInput
): Promise<ActionResult<void>> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }
  const parsed = operationsReportSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("school_reports").upsert(
    {
      academic_year: parsed.data.academic_year,
      content: parsed.data.content as OperationsReportContent,
      is_published: parsed.data.is_published,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "academic_year" }
  );

  if (error) {
    logError(error, { tags: ["reports", "operations", "upsert"], severity: "high" });
    return { success: false, error: error.message };
  }

  revalidateReports();
  return { success: true };
}
