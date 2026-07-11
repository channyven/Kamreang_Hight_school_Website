import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { getLocalizedText } from "@/lib/utils";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { getPublishedNews, getNewsCategories } from "@/lib/queries";
import type { News } from "@/types";
import NewsGridClient from "./NewsGridClient";

// Fallback images for news cards without a featured_image
const FALLBACK_IMAGES = [
  "/images/news/new1.png",
  "/images/news/new2.png",
  "/images/news/new4.png",
  "/images/news/new3.png",
  "/images/news/new5.png",
  "/images/news/new6.png",
];

function addFallbackImages(news: News[]): News[] {
  return news.map((item, i) => ({
    ...item,
    featured_image: item.featured_image || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
  }));
}

async function getNewsData() {
  const [news, categories] = await Promise.all([
    getPublishedNews(),
    getNewsCategories(),
  ]);
  return { news, categories };
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("news");
  return { title: t("title") };
}

interface NewsPageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const locale = await getLocale();
  const t = await getTranslations("news");
  const params = await searchParams;
  const categorySlug = params.category ?? "";

  const page = parseInt(params.page ?? "1");
  const pageSize = 9;

  const { news: allNews, categories } = await getNewsData();

  let filtered = allNews;
  if (categorySlug) {
    const cat = categories.find((c) => c.slug === categorySlug);
    if (cat) filtered = filtered.filter((n) => n.category_id === cat.id);
  }

  const count = filtered.length;
  const totalPages = Math.ceil(count / pageSize);
  const rawNews = filtered.slice((page - 1) * pageSize, page * pageSize);
  const news = addFallbackImages(rawNews);

  // Count news per category
  const categoryCounts = new Map<string, number>();
  categories.forEach((cat) => {
    const catNews = allNews.filter((n) => n.category_id === cat.id);
    categoryCounts.set(cat.id, catNews.length);
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16">
      {/* ─── Hero Section ─── (styled to match home page) */}
      <section className="relative h-[70vh] min-h-[500px] max-h-[700px] overflow-hidden">
        {/* Background image (matching home page) */}
        <Image
          src="/images/home/hero-campus-morning.png"
          alt="School campus"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />



        {/* Khmer decorative pattern overlay (same as home page) */}
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
          className="absolute inset-0 w-full h-full opacity-[0.04]"
          style={{ backgroundSize: "120px 120px" }}
        >
          <defs>
            <pattern id="khmer-tile" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <polygon points="30,4 56,30 30,56 4,30" stroke="white" strokeWidth="1.2" fill="none" />
              <polygon points="30,14 46,30 30,46 14,30" stroke="white" strokeWidth="0.8" fill="none" />
              <circle cx="30" cy="4" r="2" fill="white" />
              <circle cx="56" cy="30" r="2" fill="white" />
              <circle cx="30" cy="56" r="2" fill="white" />
              <circle cx="4" cy="30" r="2" fill="white" />
              <circle cx="30" cy="30" r="3" fill="white" />
              <line x1="30" y1="4" x2="30" y2="56" stroke="white" strokeWidth="0.4" opacity="0.5" />
              <line x1="4" y1="30" x2="56" y2="30" stroke="white" strokeWidth="0.4" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="120" height="120" fill="url(#khmer-tile)" />
        </svg>

        {/* Gold accent glowing orb */}
        <div className="absolute -top-24 -right-24 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(251,191,36,0.10) 0%, transparent 65%)" }} />

        {/* Dark overlays (matching home page) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              {/* Gold accent pill badge (matching home page style) */}
              <div
                className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mx-auto"
                style={{ color: "#fbbf24", background: "rgba(251,191,36,0.08)" }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className={locale === "km" ? "font-khmer" : ""}>{t("title")}</span>
              </div>

              {/* Khmer subtitle in gold (matching home page) */}
              <p
                className="text-lg md:text-xl mb-2 leading-relaxed tracking-wide font-khmer"
                style={{ color: "#fbbf24" }}
              >
                {locale === "km" ? "ព័ត៌មានថ្មីៗប្រចាំសាលា" : "ស្វាគមន៍មកកាន់ព័ត៌មានវិទ្យាល័យ"}
              </p>

              {/* English heading (matching home page) */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] mb-6 tracking-tight">
                {t("title")}
              </h1>

              {/* Gold accent divider line (matching home page) */}
              <div className="w-16 h-0.5 rounded-full mb-6 mx-auto" style={{ background: "#fbbf24" }} />

              {/* Subtitle */}
              <p
                className={`text-white/70 text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto ${
                  locale === "km" ? "font-khmer" : ""
                }`}
              >
                {t("subtitle")}
              </p>

              {/* Quick stats row */}
              <div className="flex flex-wrap items-center justify-center gap-6">
                <div className="flex items-center gap-2 text-white/60">
                  <Newspaper className="w-4 h-4" style={{ color: "#fbbf24" }} />
                  <span className="text-sm">
                    <strong className="text-white font-semibold">{allNews.length}</strong>
                    {" "}{locale === "km" ? "អត្ថបទ" : "articles"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <TrendingUp className="w-4 h-4" style={{ color: "#fbbf24" }} />
                  <span className="text-sm">
                    <strong className="text-white font-semibold">{categories.length}</strong>
                    {" "}{locale === "km" ? "ប្រភេទ" : "categories"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wavy bottom divider (matching home page) */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
          <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0 56L1440 56L1440 16C1200 48 960 60 720 44C480 28 240 0 0 16L0 56Z" fill="rgb(249 250 251)" />
          </svg>
        </div>
      </section>

      {/* ─── Content Section ─── */}
      <div className="container mx-auto px-4 py-10">
        {/* Category & Stats bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          {/* Category filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin -mx-4 px-4 sm:mx-0 sm:px-0">
            <Link
              href={`/${locale}/news`}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                !categorySlug
                  ? "bg-school-blue-800 text-white border-school-blue-800 shadow-sm shadow-school-blue-800/20"
                  : "bg-white text-gray-600 border-gray-200 hover:border-school-blue-300 hover:text-school-blue-700 hover:bg-school-blue-50/50"
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              {locale === "km" ? "ទាំងអស់" : "All"}
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                  !categorySlug
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {allNews.length}
              </span>
            </Link>
            {categories.map((cat) => {
              const catCount = categoryCounts.get(cat.id) ?? 0;
              const isActive = categorySlug === cat.slug;
              return (
                <Link
                  key={cat.id}
                  href={`/${locale}/news?category=${cat.slug}`}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                    isActive
                      ? "bg-school-blue-800 text-white border-school-blue-800 shadow-sm shadow-school-blue-800/20"
                      : "bg-white text-gray-600 border-gray-200 hover:border-school-blue-300 hover:text-school-blue-700 hover:bg-school-blue-50/50"
                  }`}
                >
                  {getLocalizedText(cat.name_km, cat.name_en, locale)}
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {catCount}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Results count */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>
              {count}{" "}
              {locale === "km" ? "អត្ថបទ" : count === 1 ? "article" : "articles"}
            </span>
          </div>
        </div>

        {/* ─── News Grid ─── */}
        {news.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Newspaper className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className={`text-xl font-semibold text-gray-600 mb-2 ${locale === "km" ? "font-khmer" : ""}`}>
              {t("no_results")}
            </h3>
            <p className={`text-sm text-gray-400 mb-6 ${locale === "km" ? "font-khmer" : ""}`}>
              {locale === "km"
                ? "សូមជ្រើសរើសប្រភេទផ្សេងទៀត"
                : "No news found for the selected category"}
            </p>
            <Button asChild variant="outline" className="border-gray-300 text-gray-600 hover:bg-gray-50">
              <Link href={`/${locale}/news`}>
                <ArrowRight className="w-4 h-4 mr-1.5" />
                {locale === "km" ? "មើលព័ត៌មានទាំងអស់" : "View all news"}
              </Link>
            </Button>
          </div>
        ) : (
          <NewsGridClient
            news={news}
            locale={locale}
            t={{
              read_more: t("read_more"),
              featured: t("featured"),
            }}
          />
        )}

        {/* ─── Pagination ─── */}
        {totalPages > 1 && (
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              {/* Previous */}
              {page > 1 ? (
                <Link
                  href={`/${locale}/news?page=${page - 1}${
                    categorySlug ? `&category=${categorySlug}` : ""
                  }`}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">{locale === "km" ? "មុន" : "Prev"}</span>
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="flex items-center gap-1.5 border-gray-100 text-gray-300 cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">{locale === "km" ? "មុន" : "Prev"}</span>
                </Button>
              )}

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (page <= 4) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = page - 3 + i;
                  }

                  return (
                    <Link
                      key={pageNum}
                      href={`/${locale}/news?page=${pageNum}${
                        categorySlug ? `&category=${categorySlug}` : ""
                      }`}
                      aria-label={`Page ${pageNum}`}
                    >
                      <Button
                        variant={pageNum === page ? "default" : "outline"}
                        size="sm"
                        className={`w-9 h-9 p-0 ${
                          pageNum === page
                            ? "bg-school-blue-800 hover:bg-school-blue-700 shadow-sm shadow-school-blue-800/20"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    </Link>
                  );
                })}
              </div>

              {/* Next */}
              {page < totalPages ? (
                <Link
                  href={`/${locale}/news?page=${page + 1}${
                    categorySlug ? `&category=${categorySlug}` : ""
                  }`}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                  >
                    <span className="hidden sm:inline">{locale === "km" ? "បន្ទាប់" : "Next"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="flex items-center gap-1.5 border-gray-100 text-gray-300 cursor-not-allowed"
                >
                  <span className="hidden sm:inline">{locale === "km" ? "បន្ទាប់" : "Next"}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Page info */}
            <span className="text-xs text-gray-400">
              {locale === "km"
                ? `ទំព័រ ${page} នៃ ${totalPages}`
                : `Page ${page} of ${totalPages}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
