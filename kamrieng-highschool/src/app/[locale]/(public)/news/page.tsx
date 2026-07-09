import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatShortDate, getLocalizedText, truncate } from "@/lib/utils";
import { Calendar, ArrowRight, Search } from "lucide-react";
import { getPublishedNews, getNewsCategories } from "@/lib/queries";

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
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
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
  const news = filtered.slice((page - 1) * pageSize, page * pageSize);

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
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link href={`/${locale}/news`}>
            <Badge
              variant={!categorySlug ? "default" : "outline"}
              className="cursor-pointer hover:bg-school-blue-800 hover:text-white transition-colors py-1.5 px-3"
            >
              {t("categories")} ({count ?? 0})
            </Badge>
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/${locale}/news?category=${cat.slug}`}>
              <Badge
                variant={categorySlug === cat.slug ? "default" : "outline"}
                className="cursor-pointer hover:bg-school-blue-800 hover:text-white transition-colors py-1.5 px-3"
              >
                {getLocalizedText(cat.name_km, cat.name_en, locale)}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Grid */}
        {news.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className={locale === "km" ? "font-khmer" : ""}>{t("no_results")}</p>
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
                href={`/${locale}/news?page=${p}${categorySlug ? `&category=${categorySlug}` : ""}`}
              >
                <Button
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  className={p === page ? "bg-school-blue-800" : ""}
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
