import { Suspense } from "react";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { getPublishedDocuments } from "@/lib/queries";
import { CATEGORY_SLUG_MAP } from "@/lib/document-helpers";
import DocumentsClient from "./DocumentsClient";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: locale === "km" ? "ឯកសារ" : "Documents" };
}

export default async function DocumentsPage() {
  // Fetch all published documents server-side (cached via unstable_cache)
  const allDocuments = await getPublishedDocuments();

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 pt-16" />}>
      <DocumentsClient
        documents={allDocuments}
        categorySlugMap={CATEGORY_SLUG_MAP}
      />
    </Suspense>
  );
}
