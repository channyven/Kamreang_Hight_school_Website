"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Newspaper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { News, NewsCategory } from "@/types";
import BackToTop from "./BackToTop";
import CategoryFilters from "./CategoryFilters";
import NewsGridClient from "./NewsGridClient";

const PAGE_SIZE = 9;

const FALLBACK_IMAGES = [
  "/images/news/new1.png",
  "/images/news/new2.png",
  "/images/news/new4.png",
  "/images/news/new3.png",
  "/images/news/new5.png",
  "/images/news/new6.png",
];

interface NewsContentProps {
  allNews: News[];
  categories: NewsCategory[];
  locale: string;
  t: Record<string, string>;
  initialSlug: string;
}

export default function NewsContent({ allNews, categories, locale, t, initialSlug }: NewsContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [categorySlug, setCategorySlug] = useState(initialSlug);
  const [page, setPage] = useState(1);

  const syncUrl = useCallback(
    (slug: string, pageNum: number) => {
      const params = new URLSearchParams();
      if (slug) params.set("category", slug);
      if (pageNum > 1) params.set("page", String(pageNum));
      const query = params.toString();
      const newUrl = query ? `${pathname}?${query}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router]
  );

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    categories.forEach((cat) => {
      counts.set(cat.id, allNews.filter((n) => n.category_id === cat.id).length);
    });
    return counts;
  }, [allNews, categories]);

  // Filter by category
  const filtered = useMemo(() => {
    if (!categorySlug) return allNews;
    const cat = categories.find((c) => c.slug === categorySlug);
    if (!cat) return allNews;
    return allNews.filter((n) => n.category_id === cat.id);
  }, [allNews, categories, categorySlug]);

  // Paginate
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const paginatedNews = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Add fallback images
  const displayedNews = paginatedNews.map((item, i) => ({
    ...item,
    featured_image: item.featured_image || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
  }));

  const handleCategoryChange = (slug: string) => {
    setCategorySlug(slug);
    setPage(1);
    syncUrl(slug, 1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    syncUrl(categorySlug, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Compute visible page numbers for compact pagination
  const getVisiblePages = () => {
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    const pages: (number | "ellipsis")[] = [];
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("ellipsis");
    }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* ─── Category Filters ─── */}
        <div className="mb-8">
          <CategoryFilters
            categories={categories}
            allCount={allNews.length}
            categoryCounts={categoryCounts}
            locale={locale}
            currentSlug={categorySlug}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* ─── Results Count ─── */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {locale === "km"
              ? `បង្ហាញ ${displayedNews.length} ក្នុងចំណោម ${filtered.length} អត្ថបទ`
              : `Showing ${displayedNews.length} of ${filtered.length} articles`}
          </p>
          {categorySlug && (
            <button
              onClick={() => handleCategoryChange("")}
              className="text-sm text-school-blue-700 hover:text-school-blue-800 hover:underline transition-colors"
            >
              {locale === "km" ? "មើលទាំងអស់" : "View all"}
            </button>
          )}
        </div>

        {/* ─── News Grid ─── */}
        {displayedNews.length === 0 ? (
          <motion.div
            key={categorySlug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center py-20 px-4"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Newspaper className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className={`text-xl font-semibold text-gray-600 mb-2 ${locale === "km" ? "font-khmer" : ""}`}>
              {t.no_results || "No articles found"}
            </h3>
            <p className={`text-sm text-gray-400 mb-6 ${locale === "km" ? "font-khmer" : ""}`}>
              {locale === "km"
                ? "សូមជ្រើសរើសប្រភេទផ្សេងទៀត"
                : "No news found for the selected category"}
            </p>
            <Button asChild variant="outline" className="border-gray-300 text-gray-600 hover:bg-gray-50">
              <Link href={`/${locale}/news`}>
                <ChevronRight className="w-4 h-4 mr-1.5" />
                {locale === "km" ? "មើលព័ត៌មានទាំងអស់" : "View all news"}
              </Link>
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={categorySlug + "-" + currentPage}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <NewsGridClient
                news={displayedNews}
                locale={locale}
                t={{
                  read_more: t.read_more || "Read More",
                  featured: t.featured || "Featured",
                }}
              />
            </motion.div>
          </AnimatePresence>
        )}

        {/* ─── Pagination ─── */}
        {totalPages > 1 && (
          <div className="mt-12 mb-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-1.5">
              {/* Previous */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage > 1
                    ? "border border-gray-200 text-gray-600 hover:bg-school-blue-50 hover:text-school-blue-700 hover:border-school-blue-300"
                    : "border border-gray-100 text-gray-300 cursor-not-allowed"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{locale === "km" ? "មុន" : "Prev"}</span>
              </button>

              {/* Page numbers with ellipsis */}
              {getVisiblePages().map((pageNum, idx) =>
                pageNum === "ellipsis" ? (
                  <span key={`ellipsis-${idx}`} className="w-8 text-center text-gray-300 text-sm select-none">
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pageNum === currentPage
                        ? "bg-school-blue-800 text-white shadow-sm"
                        : "border border-gray-200 text-gray-600 hover:bg-school-blue-50 hover:text-school-blue-700 hover:border-school-blue-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              )}

              {/* Next */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage < totalPages
                    ? "border border-gray-200 text-gray-600 hover:bg-school-blue-50 hover:text-school-blue-700 hover:border-school-blue-300"
                    : "border border-gray-100 text-gray-300 cursor-not-allowed"
                }`}
              >
                <span className="hidden sm:inline">{locale === "km" ? "បន្ទាប់" : "Next"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              {locale === "km"
                ? `ទំព័រ ${currentPage} នៃ ${totalPages}`
                : `Page ${currentPage} of ${totalPages}`}
            </p>
          </div>
        )}
      </div>

      <BackToTop />
    </div>
  );
}
