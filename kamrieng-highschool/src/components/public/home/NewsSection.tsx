"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { News } from "@/types";
import { formatShortDate, getLocalizedText, truncate } from "@/lib/utils";

interface NewsSectionProps {
  news: News[];
}

function NewsCard({ item, locale, index }: { item: News; locale: string; index: number }) {
  const t = useTranslations("news");
  const title = getLocalizedText(item.title_km, item.title_en, locale);
  const excerpt = getLocalizedText(item.excerpt_km, item.excerpt_en, locale);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        {item.featured_image ? (
          <Image
            src={item.featured_image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 gradient-school opacity-50" />
        )}
        {item.is_featured && (
          <div className="absolute top-3 left-3">
            <Badge variant="warning">{t("featured")}</Badge>
          </div>
        )}
        {item.category && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-school-blue-800 text-white">
              {getLocalizedText(item.category.name_km, item.category.name_en, locale)}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatShortDate(item.publish_date ?? item.created_at, locale)}</span>
        </div>

        <h3 className={`font-semibold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-school-blue-800 transition-colors ${locale === "km" ? "font-khmer" : ""}`}>
          {title}
        </h3>

        {excerpt && (
          <p className={`text-sm text-gray-500 line-clamp-2 mb-4 ${locale === "km" ? "font-khmer" : ""}`}>
            {truncate(excerpt, 120)}
          </p>
        )}

        <Link
          href={`/${locale}/news/${item.slug}`}
          className="inline-flex items-center text-sm font-medium text-school-blue-800 hover:text-school-blue-900 gap-1 group/link"
        >
          {t("read_more")}
          <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.article>
  );
}

export default function NewsSection({ news }: NewsSectionProps) {
  const t = useTranslations("news");
  const locale = useLocale();

  if (!news.length) return null;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-school-gold-500 font-semibold text-sm uppercase tracking-wider">
              {t("title")}
            </span>
            <h2 className={`text-3xl font-bold text-gray-900 mt-1 ${locale === "km" ? "font-khmer" : ""}`}>
              {t("subtitle")}
            </h2>
          </motion.div>
          <Button asChild variant="outline" className="hidden sm:flex border-school-blue-800 text-school-blue-800 hover:bg-school-blue-50">
            <Link href={`/${locale}/news`}>
              {t("view_all")}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item, i) => (
            <NewsCard key={item.id} item={item} locale={locale} index={i} />
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Button asChild variant="outline" className="border-school-blue-800 text-school-blue-800">
            <Link href={`/${locale}/news`}>{t("view_all")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
