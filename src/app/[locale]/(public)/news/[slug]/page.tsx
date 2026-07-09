import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { formatDate, getLocalizedText, stripHtml, truncate } from "@/lib/utils";
import { Calendar, Eye, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPublishedNews } from "@/lib/queries";
import ShareButton from "@/components/public/ShareButton";

interface NewsDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const allNews = await getPublishedNews();
  const item = allNews.find((n) => n.slug === slug);
  if (!item) return {};
  const title = locale === "km" ? (item.title_km ?? item.title_en) : (item.title_en ?? item.title_km);
  const description = truncate(stripHtml(locale === "km" ? (item.content_km ?? "") : (item.content_en ?? "")), 160);
  return {
    title,
    description,
    openGraph: {
      title: title ?? undefined,
      description: description ?? undefined,
      images: item.featured_image ? [item.featured_image] : [],
    },
  };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const locale = await getLocale();

  const allNews = await getPublishedNews();
  const news = allNews.find((n) => n.slug === slug && n.status === "published");
  if (!news) notFound();

  const title = getLocalizedText(news.title_km, news.title_en, locale);
  const content = getLocalizedText(news.content_km, news.content_en, locale);
  const categoryName = news.category
    ? getLocalizedText(news.category.name_km, news.category.name_en, locale)
    : null;

  const relatedData = allNews
    .filter((n) => n.status === "published" && n.category_id === news.category_id && n.id !== news.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Back */}
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
          <Link href={`/${locale}/news`}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            {locale === "km" ? "ត្រឡប់ទៅព័ត៌មាន" : "Back to News"}
          </Link>
        </Button>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {categoryName && <Badge className="bg-school-blue-800 text-white">{categoryName}</Badge>}
          {news.is_featured && <Badge variant="warning">{locale === "km" ? "ព័ត៌មានពិសេស" : "Featured"}</Badge>}
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            {formatDate(news.publish_date ?? news.created_at, locale)}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Eye className="w-4 h-4" />
            {news.view_count} {locale === "km" ? "ដង" : "views"}
          </div>
        </div>

        {/* Title */}
        <h1 className={`text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight ${locale === "km" ? "font-khmer" : ""}`}>
          {title}
        </h1>

        {/* Featured image */}
        {news.featured_image && (
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8 shadow-lg">
            <Image src={news.featured_image} alt={title} fill className="object-cover" priority />
          </div>
        )}

        {/* Content */}
        <article
          className={`prose max-w-none prose-lg prose-headings:text-school-blue-900 prose-a:text-school-blue-700 ${
            locale === "km" ? "prose-khmer font-khmer" : ""
          }`}
          dangerouslySetInnerHTML={{ __html: content ?? "" }}
        />

        {/* Share */}
        <div className="mt-10 pt-6 border-t flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {locale === "km" ? "ចែករំលែក:" : "Share:"}
          </p>
          <ShareButton locale={locale} /></div>

        {/* Related */}
        {relatedData && relatedData.length > 0 && (
          <div className="mt-12">
            <h2 className={`text-xl font-bold text-gray-900 mb-6 ${locale === "km" ? "font-khmer" : ""}`}>
              {locale === "km" ? "ព័ត៌មានពាក់ព័ន្ធ" : "Related News"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedData.map((item) => {
                const rTitle = getLocalizedText(item.title_km, item.title_en, locale);
                return (
                  <Link
                    key={item.id}
                    href={`/${locale}/news/${item.slug}`}
                    className="group block rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-[16/9] bg-gray-100">
                      {item.featured_image && (
                        <Image src={item.featured_image} alt={rTitle} fill className="object-cover group-hover:scale-105 transition-transform" />
                      )}
                    </div>
                    <div className="p-3">
                      <p className={`text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-school-blue-800 ${locale === "km" ? "font-khmer" : ""}`}>
                        {rTitle}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
