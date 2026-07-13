"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { News } from "@/types";
import { formatShortDate, getLocalizedText, truncate } from "@/utils";

interface NewsSectionProps { news: News[]; }

export default function NewsSection({ news }: NewsSectionProps) {
  const t = useTranslations("news");
  const locale = useLocale();
  if (!news.length) return null;

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-8 h-px bg-school-gold-400/60" />
              <span className="block w-2 h-2 rounded-full bg-school-gold-500" />
              <span className="block w-8 h-px bg-school-gold-400/60" />
            </div>
            <span className="text-school-gold-500 font-semibold text-xs uppercase tracking-widest block mb-2">{t("title")}</span>
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight ${locale === "km" ? "font-khmer" : ""}`}>{t("subtitle")}</h2>
          </motion.div>
          <Button asChild variant="outline" className="hidden sm:flex border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all group">
            <Link href={`/${locale}/news`}>{t("view_all")}<ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" /></Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {news.map((item, i) => {
            const title = getLocalizedText(item.title_km, item.title_en, locale);
            const excerpt = getLocalizedText(item.excerpt_km, item.excerpt_en, locale);
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                  {item.featured_image ? (
                    <Image
                      src={item.featured_image}
                      alt={title}
                      fill
                      className="object-cover group-hover:scale-[1.04] transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized={item.featured_image.includes("google.com") || item.featured_image.includes("firebasestorage")}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-school-blue-800 to-school-blue-900 opacity-60" />
                  )}
                  {item.is_featured && <div className="absolute top-3 left-3"><Badge variant="warning">{t("featured")}</Badge></div>}
                  {item.category && <div className="absolute top-3 right-3"><Badge className="bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-white">{getLocalizedText(item.category.name_km, item.category.name_en, locale)}</Badge></div>}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatShortDate(item.publish_date ?? item.created_at, locale)}</span>
                  </div>
                  <h3 className={`font-semibold text-gray-900 text-base mb-2 line-clamp-2 ${locale === "km" ? "font-khmer" : ""}`}>{title}</h3>
                  {excerpt && <p className={`text-sm text-gray-500 line-clamp-2 mb-4 ${locale === "km" ? "font-khmer" : ""}`}>{truncate(excerpt, 120)}</p>}
                  <Link
                    href={`/${locale}/news/${item.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-school-blue-50 hover:bg-school-blue-800 text-school-blue-700 hover:text-white text-sm font-semibold transition-all duration-300 group"
                  >
                    <span>{t("read_more")}</span>
                    <span className="w-5 h-5 rounded-full bg-white/80 group-hover:bg-school-gold-400 flex items-center justify-center transition-all duration-300">
                      <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Button asChild variant="outline" className="border-gray-300 text-gray-700">
            <Link href={`/${locale}/news`}>{t("view_all")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
