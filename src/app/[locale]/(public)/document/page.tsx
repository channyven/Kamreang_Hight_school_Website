import { Suspense } from "react";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { getPublishedDocuments } from "@/lib/queries";
import { DOCUMENT_CATEGORIES } from "@/types";
import HeroSection from "@/components/public/documents/HeroSection";
import { CATEGORY_SLUG_MAP } from "@/lib/document-helpers";
import DocumentGrid from "@/components/public/documents/DocumentGrid";
import {
  FileText,
  GraduationCap,
  ClipboardList,
  ShieldCheck,
  Folder,
} from "lucide-react";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Documents" };
}

/** Icon mapping for each document category. */
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  report: <FileText className="w-4 h-4" />,
  result: <GraduationCap className="w-4 h-4" />,
  form: <ClipboardList className="w-4 h-4" />,
  policy: <ShieldCheck className="w-4 h-4" />,
  other: <Folder className="w-4 h-4" />,
};

interface DocumentsPageProps {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const locale = await getLocale();
  const params = await searchParams;
  const searchQuery = params.q ?? "";
  const categorySlug = params.category ?? "";

  // Fetch all published documents
  const allDocuments = await getPublishedDocuments();

  // Apply filters
  let filtered = allDocuments;
  if (categorySlug) {
    // Map URL param (e.g. "report") to database slug (e.g. "reports") using shared mapping
    const dbSlug = CATEGORY_SLUG_MAP[categorySlug as keyof typeof CATEGORY_SLUG_MAP] ?? categorySlug;
    filtered = filtered.filter((doc) => doc.category?.slug === dbSlug);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (doc) =>
        doc.title_km?.toLowerCase().includes(q) ||
        doc.title_en?.toLowerCase().includes(q)
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero section with search */}
      <HeroSection initialSearch={searchQuery} />

      <div className="container mx-auto px-4 py-10">
        {/* Category filter buttons */}
        <div className="flex flex-wrap gap-3 mb-10 justify-center">
          {/* "All" button */}
          <Link
            href={`/${locale}/document${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
              !categorySlug
                ? "bg-school-blue-800 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-300 hover:border-school-blue-400 hover:text-school-blue-700"
            }`}
          >
            <Folder className="w-4 h-4" />
            {locale === "km" ? "ទាំងអស់" : "All"}
          </Link>

          {DOCUMENT_CATEGORIES.map((cat) => {
            const isActive = categorySlug === cat.key;
            return (
              <Link
                key={cat.key}
                href={`/${locale}/document?category=${cat.key}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-school-blue-800 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-300 hover:border-school-blue-400 hover:text-school-blue-700"
                }`}
              >
                {CATEGORY_ICONS[cat.key] ?? <Folder className="w-4 h-4" />}
                {locale === "km" ? cat.labelKm : cat.labelEn}
              </Link>
            );
          })}
        </div>

        {/* Document grid */}
        <Suspense fallback={null}>
          <DocumentGrid documents={filtered} />
        </Suspense>

        {/* Pagination note for future */}
        {filtered.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-8">
            {locale === "km"
              ? `បង្ហាញ ${filtered.length} ឯកសារ`
              : `Showing ${filtered.length} document${filtered.length === 1 ? "" : "s"}`}
          </p>
        )}
      </div>
    </div>
  );
}
