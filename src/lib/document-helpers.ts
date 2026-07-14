import { createServerClient } from "@/lib/supabase";
import type { DocumentCategory } from "@/types";

/**
 * Map our string categories to download_category slugs.
 * Exported for reuse across actions and pages.
 */
export const CATEGORY_SLUG_MAP: Record<DocumentCategory, string> = {
  report: "reports",
  result: "exam-results",
  form: "registration-forms",
  policy: "school-policies",
  other: "other-documents",
};

/** Map our string categories to download_category names (English). */
const CATEGORY_NAME_MAP: Record<DocumentCategory, { name_km: string; name_en: string }> = {
  report: { name_km: "របាយការណ៍", name_en: "Reports" },
  result: { name_km: "លទ្ធផលប្រឡង", name_en: "Exam Results" },
  form: { name_km: "បែបបទ", name_en: "Forms" },
  policy: { name_km: "គោលនយោបាយ", name_en: "Policies" },
  other: { name_km: "ឯកសារផ្សេងៗ", name_en: "Other" },
};

/**
 * Ensure a download_category row exists for the given category.
 * Returns the category UUID.
 */
export async function ensureDocumentCategory(category: DocumentCategory): Promise<string | null> {
  const supabase = createServerClient();
  const slug = CATEGORY_SLUG_MAP[category];

  // Try to find existing category by slug
  const { data: existing } = await supabase
    .from("download_categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) return existing.id;

  // Create new category
  const names = CATEGORY_NAME_MAP[category];
  const { data: created, error } = await supabase
    .from("download_categories")
    .insert({
      name_km: names.name_km,
      name_en: names.name_en,
      slug,
      icon: "file",
      sort_order: Object.keys(CATEGORY_SLUG_MAP).indexOf(category) + 1,
    })
    .select("id")
    .single();

  if (error || !created) {
    console.error("Failed to create document category:", error);
    return null;
  }

  return created.id;
}
