"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Eye, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { News } from "@/types";
import { formatShortDate, getLocalizedText } from "@/lib/utils";

interface NewsGridClientProps {
  news: News[];
  locale: string;
  t: {
    read_more: string;
    featured: string;
  };
}

export default function NewsGridClient({ news, locale, t }: NewsGridClientProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {news.map((item, i) => {
        const title = getLocalizedText(item.title_km, item.title_en, locale);
        const excerpt = getLocalizedText(item.excerpt_km, item.excerpt_en, locale);
        const categoryName = item.category
          ? getLocalizedText(item.category.name_km, item.category.name_en, locale)
          : null;

        // Format date for the floating badge
        const pubDate = item.publish_date ?? item.created_at;
        const displayDate = formatShortDate(pubDate, locale);

        return (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: i * 0.08,
              ease: [0.25, 0.4, 0.25, 1],
            }}
            className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.2)] hover:-translate-y-2 transition-all duration-500"
          >
            {/* Image section */}
            <Link href={`/${locale}/news/${item.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-school-blue-50 via-gray-100 to-gray-50">
              {item.featured_image ? (
                <>
                  <Image
                    src={item.featured_image}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* Dark overlay on hover to show excerpt */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-school-blue-400"
                    >
                      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9" />
                      <path d="M18 14h-8" />
                      <path d="M15 18h-5" />
                      <path d="M10 6h8v4h-8V6Z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Floating date badge */}
              <div className="absolute top-3 left-3 z-10 flex flex-col items-center bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1 group-hover:translate-y-0">
                <Calendar className="w-3 h-3 text-school-blue-800 mb-0.5" />
                <span className="text-[10px] font-bold text-gray-700 whitespace-nowrap">{displayDate}</span>
              </div>

              {/* Category badge */}
              {categoryName && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-white/95 backdrop-blur-md text-school-blue-800 hover:bg-school-blue-800 hover:text-white border-0 shadow-sm text-[11px] font-semibold px-3 py-1 transition-all duration-300">
                    {categoryName}
                  </Badge>
                </div>
              )}

              {/* Featured gold ribbon */}
              {item.is_featured && (
                <div className="absolute -top-1 -left-8 z-10">
                  <div className="relative">
                    <div className="bg-gradient-to-r from-school-gold-500 to-school-gold-400 text-white text-[10px] font-bold uppercase tracking-wider px-10 py-1.5 shadow-lg shadow-school-gold-500/30 rotate-[-45deg] translate-y-4 -translate-x-3 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" />
                      {t.featured}
                    </div>
                  </div>
                </div>
              )}

              {/* Hover excerpt overlay */}
              {excerpt && (
                <div className="absolute inset-x-0 bottom-0 p-5 z-10 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
                  <p className={`text-sm text-white/90 leading-relaxed line-clamp-2 ${locale === "km" ? "font-khmer" : ""}`}>
                    {excerpt}
                  </p>
                </div>
              )}
            </Link>

            {/* Content section */}
            <div className="p-5">
              {/* Date */}
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2.5">
                <Calendar className="w-3.5 h-3.5 text-gray-300" />
                <span>
                  {formatShortDate(item.publish_date ?? item.created_at, locale)}
                </span>
              </div>

              {/* Title */}
              <h2
                className={`font-bold text-gray-900 text-[15px] sm:text-base leading-snug mb-2.5 line-clamp-2 group-hover:text-school-blue-800 transition-colors duration-200 ${
                  locale === "km" ? "font-khmer" : ""
                }`}
              >
                <Link href={`/${locale}/news/${item.slug}`}>
                  {title}
                </Link>
              </h2>

              {/* Excerpt */}
              {excerpt && (
                <p
                  className={`text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3.5 ${
                    locale === "km" ? "font-khmer" : ""
                  }`}
                >
                  {excerpt}
                </p>
              )}

              {/* Bottom row: views + read more */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Eye className="w-3.5 h-3.5 text-gray-300" />
                  <span>{item.view_count} {locale === "km" ? "ដង" : "views"}</span>
                </div>

                <Link
                  href={`/${locale}/news/${item.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-school-blue-700 group-hover:text-school-gold-500 transition-all duration-200"
                >
                  <span>{t.read_more}</span>
                  <span className="w-6 h-6 rounded-full bg-school-blue-50 group-hover:bg-school-gold-100 flex items-center justify-center transition-all duration-200">
                    <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </div>
            </div>

            {/* Bottom accent bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-school-blue-800 via-school-gold-500 to-school-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </motion.article>
        );
      })}
    </div>
  );
}
