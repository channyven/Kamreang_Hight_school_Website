"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Newspaper,
  TrendingUp,
  BellRing,
  Mail,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { News, NewsCategory } from "@/types";
import { getLocalizedText, formatShortDate } from "@/lib/utils";
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

function addFallbackImages(item: News, i: number): string {
  return item.featured_image || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
}

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

  // Sync URL with current filter state
  const syncUrl = useCallback(
    (slug: string, pageNum: number) => {
      const params = new URLSearchParams();
      if (slug) params.set("category", slug);
      if (pageNum > 1) params.set("page", String(pageNum));
      const query = params.toString();
      const newUrl = query ? `${pathname}?${query}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router],
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

  // Trending (top 4 by view_count)
  const trending = useMemo(() => {
    if (allNews.length < 2) return [];
    return [...allNews]
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, 4);
  }, [allNews]);

  const handleCategoryChange = (slug: string) => {
    setCategorySlug(slug);
    setPage(1); // reset to first page on category change
    syncUrl(slug, 1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    syncUrl(categorySlug, newPage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16">
      {/* ─── Content Section ─── */}
      <div className="container mx-auto px-4 py-10">
        {/* Category & Stats bar */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div className="flex-1 min-w-0">
            <CategoryFilters
              categories={categories}
              allCount={allNews.length}
              categoryCounts={categoryCounts}
              locale={locale}
              currentSlug={categorySlug}
              onCategoryChange={handleCategoryChange}
            />
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 shrink-0 pt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>
              {filtered.length}{" "}
              {locale === "km" ? "អត្ថបទ" : filtered.length === 1 ? "article" : "articles"}
            </span>
          </div>
        </div>

        {/* ─── Trending Section ─── */}
        {trending.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200/60">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">
                  {locale === "km" ? "ពេញនិយម" : "Trending"}
                </span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-orange-200 to-transparent" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {trending.map((item, i) => {
                const itemTitle = getLocalizedText(item.title_km, item.title_en, locale);
                const itemSlug = item.slug;
                const itemDate = item.publish_date ?? item.created_at;
                return (
                  <Link
                    key={item.id}
                    href={`/${locale}/news/${itemSlug}`}
                    className="group relative flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-50">
                      <img
                        src={addFallbackImages(item, i)}
                        alt={itemTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2 z-10 w-5 h-5 rounded-full bg-school-blue-800 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                        {i + 1}
                      </div>
                    </div>
                    <div className="p-2.5 sm:p-3 flex-1 flex flex-col">
                      <h4
                        className={`text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-school-blue-800 transition-colors ${
                          locale === "km" ? "font-khmer" : ""
                        }`}
                      >
                        {itemTitle}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-auto pt-1.5 text-[10px] text-gray-400">
                        <TrendingUp className="w-3 h-3" />
                        <span>{item.view_count}</span>
                        <span className="text-gray-200">•</span>
                        <span>{formatShortDate(itemDate, locale)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

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

        {/* ─── Newsletter CTA ─── */}
        {displayedNews.length > 0 && (
          <div className="mt-16 mb-12 relative overflow-hidden rounded-2xl bg-gradient-to-br from-school-blue-800 via-school-blue-700 to-school-blue-900 shadow-xl">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-school-gold-500/10" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
            <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
              className="absolute inset-0 w-full h-full opacity-[0.03]"
              style={{ backgroundSize: "60px 60px" }}
            >
              <defs>
                <pattern id="newsletter-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1.5" fill="white" />
                </pattern>
              </defs>
              <rect width="120" height="120" fill="url(#newsletter-dots)" />
            </svg>
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 p-8 sm:p-10 lg:p-12">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/10 text-school-gold-400 text-xs font-semibold">
                  <BellRing className="w-3.5 h-3.5" />
                  {locale === "km" ? "ជាវព័ត៌មាន" : "Stay Updated"}
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold text-white mb-2 ${locale === "km" ? "font-khmer" : ""}`}>
                  {locale === "km" ? "ទទួលបានព័ត៌មានថ្មីៗ" : "Never miss a story"}
                </h3>
                <p className={`text-white/70 text-sm max-w-md ${locale === "km" ? "font-khmer" : ""}`}>
                  {locale === "km"
                    ? "ចុះឈ្មោះដើម្បីទទួលបានព័ត៌មានថ្មីៗពីសាលាតាមអ៊ីមែល"
                    : "Subscribe to get the latest school news delivered to your inbox"}
                </p>
              </div>
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-none">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    placeholder={locale === "km" ? "អាសយដ្ឋានអ៊ីមែល" : "Enter your email"}
                    className="w-full lg:w-64 px-10 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-school-gold-400/50 focus:border-school-gold-400 transition-all"
                  />
                </div>
                <Button className="bg-school-gold-500 hover:bg-school-gold-400 text-school-blue-900 font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-school-gold-500/30 hover:shadow-xl hover:shadow-school-gold-500/40 transition-all shrink-0">
                  {locale === "km" ? "ជាវ" : "Subscribe"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Pagination ─── */}
        {totalPages > 1 && (
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              {/* Previous */}
              {currentPage > 1 ? (
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-school-blue-50 hover:text-school-blue-700 hover:border-school-blue-300 hover:shadow-sm text-sm font-medium transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">{locale === "km" ? "មុន" : "Prev"}</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-100 text-gray-300 text-sm font-medium cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">{locale === "km" ? "មុន" : "Prev"}</span>
                </span>
              )}

              {/* Page numbers */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
                        pageNum === currentPage
                          ? "bg-school-blue-800 text-white shadow-md shadow-school-blue-800/20 scale-105"
                          : "border border-gray-200 text-gray-600 hover:bg-school-blue-50 hover:text-school-blue-700 hover:border-school-blue-300 hover:shadow-sm"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next */}
              {currentPage < totalPages ? (
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-school-blue-50 hover:text-school-blue-700 hover:border-school-blue-300 hover:shadow-sm text-sm font-medium transition-all duration-200"
                >
                  <span className="hidden sm:inline">{locale === "km" ? "បន្ទាប់" : "Next"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-100 text-gray-300 text-sm font-medium cursor-not-allowed">
                  <span className="hidden sm:inline">{locale === "km" ? "បន្ទាប់" : "Next"}</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm">
              <span className="text-xs text-gray-400">
                {locale === "km"
                  ? `ទំព័រ ${currentPage} នៃ ${totalPages}`
                  : `Page ${currentPage} of ${totalPages}`}
              </span>
            </div>
          </div>
        )}
      </div>

      <BackToTop />
    </div>
  );
}
