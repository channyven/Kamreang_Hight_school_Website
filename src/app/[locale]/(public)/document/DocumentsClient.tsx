"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  ArrowRight,
  FileText,
  GraduationCap,
  ClipboardList,
  ShieldCheck,
  Folder,
  FolderOpen,
} from "lucide-react";
import type { AppDocument } from "@/types";
import { DOCUMENT_CATEGORIES } from "@/types";
import DocumentCard from "@/components/public/documents/DocumentCard";

interface DocumentsClientProps {
  /** All published documents fetched server-side. */
  documents: AppDocument[];
  /** Mapping from DocumentCategory to DB slug. */
  categorySlugMap: Record<string, string>;
}

/** Icon for each document category key. */
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  report: <FileText className="w-4 h-4" />,
  result: <GraduationCap className="w-4 h-4" />,
  form: <ClipboardList className="w-4 h-4" />,
  policy: <ShieldCheck className="w-4 h-4" />,
  other: <Folder className="w-4 h-4" />,
};

export default function DocumentsClient({
  documents,
  categorySlugMap,
}: DocumentsClientProps) {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial state from URL
  const urlCategory = searchParams.get("category") ?? "";
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);

  // Ref to track the debounce timer so we can cancel it before explicit navigation
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Sync search input when URL changes (e.g. browser back/forward)
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // ─── Debounced URL sync ─────────────────────────────────────
  // Updates the URL search param when the user stops typing for 300ms.
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (urlCategory) params.set("category", urlCategory);
      const qs = params.toString();
      router.replace(`/${locale}/document${qs ? `?${qs}` : ""}`, { scroll: false });
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, urlCategory, locale, router]);

  // ─── Filter documents (uses live query, no page reload needed) ─
  const hasActiveFilters = query.trim() !== "" || urlCategory !== "";

  const filtered = useMemo(() => {
    let result = documents;

    // Category filter
    if (urlCategory) {
      const dbSlug =
        categorySlugMap[urlCategory as keyof typeof categorySlugMap] ??
        urlCategory;
      result = result.filter((doc) => doc.category?.slug === dbSlug);
    }

    // Live search filter (instant, uses local state)
    const liveQuery = query.trim();
    if (liveQuery) {
      const q = liveQuery.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.title_km?.toLowerCase().includes(q) ||
          doc.title_en?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [documents, urlCategory, query, categorySlugMap]);

  // ─── Navigation helpers ──────────────────────────────────────
  const navigate = (q: string, category: string) => {
    // Cancel any pending debounced URL update before explicit navigation
    clearTimeout(debounceRef.current);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    const qs = params.toString();
    router.push(`/${locale}/document${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(query.trim(), urlCategory);
  };

  const handleCategoryChange = (category: string) => {
    navigate(query.trim(), category === urlCategory ? "" : category);
  };

  const clearFilters = () => {
    setQuery("");
    navigate("", "");
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* ─── Hero section with search ─────────────────────── */}
      <section className="bg-gradient-to-r from-[#0b2f63] to-[#1d4f91] py-20 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-school-gold-500 text-lg md:text-xl font-khmer mb-2"
          >
            ឯកសារសាលារៀន
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white font-bold text-5xl md:text-6xl lg:text-7xl mb-3 tracking-tight"
          >
            Documents
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-white/80 text-base md:text-lg max-w-xl mx-auto mb-8"
          >
            {locale === "km"
              ? "ទាញយកឯកសារផ្លូវការ របាយការណ៍ និងបែបបទរបស់សាលា"
              : "Download official school documents, reports, and forms"}
          </motion.p>

          {/* Search bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onSubmit={handleSearch}
            className="flex items-center max-w-[500px] mx-auto bg-white rounded-full shadow-lg h-[52px] overflow-hidden"
          >
            <div className="flex items-center flex-1 px-5 gap-3">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  locale === "km"
                    ? "ស្វែងរកឯកសារតាមចំណងជើង..."
                    : "Search documents by title..."
                }
                className="flex-1 h-full outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="w-[52px] h-[52px] bg-school-gold-500 hover:bg-school-gold-600 active:scale-95 transition-all duration-200 flex items-center justify-center shrink-0"
            >
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
          </motion.form>
        </div>
      </section>

      {/* ─── Filters & Results ────────────────────────────── */}
      <div className="container mx-auto px-4 py-10">
        {/* Category filter buttons */}
        <div className="flex flex-wrap gap-3 mb-10 justify-center">
          {/* "All" button */}
          <button
            onClick={() => handleCategoryChange("")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
              !urlCategory
                ? "bg-school-blue-800 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-300 hover:border-school-blue-400 hover:text-school-blue-700"
            }`}
          >
            <Folder className="w-4 h-4" />
            {locale === "km" ? "ទាំងអស់" : "All"}
          </button>

          {DOCUMENT_CATEGORIES.map((cat) => {
            const isActive = urlCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => handleCategoryChange(cat.key)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-school-blue-800 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-300 hover:border-school-blue-400 hover:text-school-blue-700"
                }`}
              >
                {CATEGORY_ICONS[cat.key] ?? <Folder className="w-4 h-4" />}
                {locale === "km" ? cat.labelKm : cat.labelEn}
              </button>
            );
          })}
        </div>

        {/* Results */}
        {filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((doc, index) => (
                <DocumentCard key={doc.id} document={doc} index={index} />
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-8">
              {locale === "km"
                ? `បង្ហាញ ${filtered.length} ឯកសារ`
                : `Showing ${filtered.length} document${
                    filtered.length === 1 ? "" : "s"
                  }`}
            </p>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
              <FolderOpen className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-400 mb-2">
              {locale === "km"
                ? "មិនមានឯកសារទេ"
                : "No documents available"}
            </h3>
            <p className="text-sm text-gray-300 max-w-xs">
              {locale === "km"
                ? hasActiveFilters
                  ? "សូមសាកល្បងស្វែងរកពាក្យផ្សេងទៀត ឬជ្រើសរើសប្រភេទផ្សេង"
                  : "បច្ចុប្បន្នមិនមានឯកសារសម្រាប់បង្ហាញទេ"
                : hasActiveFilters
                ? "Try a different search term or select a different category."
                : "There are currently no documents to display."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 text-sm text-school-blue-800 hover:text-school-blue-900 font-medium underline underline-offset-2 transition-colors"
              >
                {locale === "km" ? "សម្អាតតម្រង" : "Clear filters"}
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}


