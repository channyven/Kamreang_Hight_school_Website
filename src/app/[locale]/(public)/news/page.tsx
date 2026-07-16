import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Newspaper, Sparkles } from "lucide-react";
import { getPublishedNews, getNewsCategories } from "@/lib/queries";
import NewsContent from "./NewsContent";

export const revalidate = 60;

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
  const initialSlug = params.category ?? "";

  const { news: allNews, categories } = await getNewsData();

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* ─── Clean Minimal Hero ─── */}
      <section className="relative bg-gradient-to-br from-school-blue-900 via-school-blue-800 to-school-blue-700 overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg viewBox="0 0 400 300" className="w-full h-full">
            <defs>
              <pattern id="hero-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#hero-grid)" />
          </svg>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-16 sm:py-20 lg:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-hero-fade-in-1 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-school-gold-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span className={locale === "km" ? "font-khmer" : ""}>{t("title")}</span>
              </div>
            </div>

            <h1 className="animate-hero-fade-in-2 text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 tracking-tight">
              {t("title")}
            </h1>

            <p className={`animate-hero-fade-in-3 text-white/60 text-sm sm:text-base max-w-lg mx-auto ${locale === "km" ? "font-khmer" : ""}`}>
              {t("subtitle")}
            </p>

            <div className="animate-hero-fade-in-4 mt-6 flex items-center justify-center gap-4 text-xs text-white/40">
              <span className="flex items-center gap-1.5">
                <Newspaper className="w-3.5 h-3.5" />
                {allNews.length} {locale === "km" ? "អត្ថបទ" : "articles"}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="flex items-center gap-1.5">
                {categories.length} {locale === "km" ? "ប្រភេទ" : "categories"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Card Grid Content ─── */}
      <NewsContent
        allNews={allNews}
        categories={categories}
        locale={locale}
        t={{
          title: t("title"),
          subtitle: t("subtitle"),
          read_more: t("read_more"),
          featured: t("featured"),
          no_results: t("no_results"),
        }}
        initialSlug={initialSlug}
      />
    </div>
  );
}

async function getNewsData() {
  const [news, categories] = await Promise.all([
    getPublishedNews(),
    getNewsCategories(),
  ]);
  return { news, categories };
}
