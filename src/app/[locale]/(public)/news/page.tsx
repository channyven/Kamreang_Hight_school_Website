import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatShortDate, formatNumber, getLocalizedText, truncate } from "@/lib/utils";
import { Calendar, ArrowRight, Search, X } from "lucide-react";
import { getPublishedNews, getNewsCategories } from "@/lib/queries";
import type { News } from "@/types";

async function getNewsData() {
  const [news, categories] = await Promise.all([
    getPublishedNews(),
    getNewsCategories(),
  ]);
  return { news, categories };
}

function matchesSearch(item: News, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const haystack = [
    item.title_km,
    item.title_en,
    item.excerpt_km,
    item.excerpt_en,
    item.content_km,
    item.content_en,
  ].filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(q);
}

function buildQuery(params: {
  locale: string;
  page?: number;
  category?: string;
  q?: string;
}): string {
  const sp = new URLSearchParams();
  if (params.category) sp.set("category", params.category);
  if (params.q) sp.set("q", params.q);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return `/${params.locale}/news${qs ? `?${qs}` : ""}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("news");
  return { title: t("title") };
}

interface NewsPageProps {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const locale = await getLocale();
  const t = await getTranslations("news");
  const params = await searchParams;
  const categorySlug = params.category ?? "";
  const query = params.q ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const pageSize = 9;

  const { news: allNews, categories } = await getNewsData();

  let filtered = allNews;
  if (categorySlug) {
    const cat = categories.find((c) => c.slug === categorySlug);
    if (cat) filtered = filtered.filter((n) => n.category_id === cat.id);
  }
  if (query) {
    filtered = filtered.filter((n) => matchesSearch(n, query));
  }

  const count = filtered.length;
  const totalPages = Math.ceil(count / pageSize);
  const safePage = Math.min(page, totalPages || 1);
  const news = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <div className="gradient-school text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className={`text-4xl font-bold mb-3 ${locale === "km" ? "font-khmer" : ""}`}>
            {t("title")}
          </h1>
          <p className={`text-school-blue-100 ${locale === "km" ? "font-khmer" : ""}`}>
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Controls row: search + category filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 flex-1">
            <Link href={buildQuery({ locale, q: query })}>
              <Badge
                variant={!categorySlug ? "default" : "outline"}
                className="cursor-pointer hover:bg-school-blue-800 hover:text-white transition-colors py-1.5 px-3"
              >
                {t("categories")} ({count})
              </Badge>
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={buildQuery({ locale, category: cat.slug, q: query })}
              >
                <Badge
                  variant={categorySlug === cat.slug ? "default" : "outline"}
                  className="cursor-pointer hover:bg-school-blue-800 hover:text-white transition-colors py-1.5 px-3"
                >
                  {getLocalizedText(cat.name_km, cat.name_en, locale)}
                </Badge>
              </Link>
            ))}
          </div>

          {/* Search form */}
          <form
            action={`/${locale}/news`}
            method="GET"
            role="search"
            className="relative flex items-center shrink-0 w-full sm:w-64"
          >
            {categorySlug && (
              <input type="hidden" name="category" value={categorySlug} />
            )}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              name="q"
              type="search"
              defaultValue={query}
              placeholder={t("search")}
              aria-label={locale === "km" ? "ស្វែងរកព័ត៌មាន" : "Search news"}
              className="pl-9 pr-9 h-10 rounded-xl bg-white border-gray-200 text-sm"
            />
            {query && (
              <Link
                href={buildQuery({ locale, category: categorySlug })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </Link>
            )}
          </form>
        </div>

        {/* Search summary */}
        {query && (
          <p className="text-sm text-gray-500 mb-6">
            {locale === "km"
              ? `បានរកឃើញ ${formatNumber(count, locale)} លទ្ធផល សម្រាប់ "${query}"`
              : `Found ${count} result${count === 1 ? "" : "s"} for "${query}"`}
          </p>
        )}

        {/* Grid / No results */}
        {news.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className={`text-lg font-medium mb-1 ${locale === "km" ? "font-khmer" : ""}`}>
              {t("no_results")}
            </p>
            {query && (
              <p className={`text-sm ${locale === "km" ? "font-khmer" : ""}`}>
                {locale === "km"
                  ? `សូមព្យាយាមស្វែងរកពាក្យផ្សេងទៀត`
                  : `Try searching with different keywords`}
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => {
              const title = getLocalizedText(item.title_km, item.title_en, locale);
              const excerpt = getLocalizedText(item.excerpt_km, item.excerpt_en, locale);
              const categoryName = item.category
                ? getLocalizedText(item.category.name_km, item.category.name_en, locale)
                : null;

              return (
                <article
                  key={item.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                    {item.featured_image ? (
                      <Image
                        src={item.featured_image}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 gradient-school opacity-60" />
                    )}
                    {categoryName && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-school-blue-800 text-white">{categoryName}</Badge>
                      </div>
                    )}
                    {item.is_featured && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="warning">{t("featured")}</Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatShortDate(item.publish_date ?? item.created_at, locale)}
                    </div>
                    <h2 className={`font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-school-blue-800 transition-colors ${locale === "km" ? "font-khmer" : ""}`}>
                      {title}
                    </h2>
                    {excerpt && (
                      <p className={`text-sm text-gray-500 line-clamp-3 mb-4 ${locale === "km" ? "font-khmer" : ""}`}>
                        {truncate(excerpt, 150)}
                      </p>
                    )}
                    <Link
                      href={`/${locale}/news/${item.slug}`}
                      className="inline-flex items-center text-sm font-medium text-school-blue-800 hover:gap-2 gap-1 transition-all"
                    >
                      {t("read_more")} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={buildQuery({ locale, page: p, category: categorySlug, q: query })}
              >
                <Button
                  variant={p === safePage ? "default" : "outline"}
                  size="sm"
                  className={p === safePage ? "bg-school-blue-800" : ""}
                >
                  {p}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}