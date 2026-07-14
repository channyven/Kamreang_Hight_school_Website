"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { News } from "@/types";
import { formatShortDate, getLocalizedText } from "@/utils";

interface NewsGridClientProps {
  news: News[];
  locale: string;
  t: {
    read_more: string;
    featured: string;
  };
}

export default function NewsGridClient({ news, locale, t }: NewsGridClientProps) {
  if (!news.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {news.map((item, i) => {
        const title = getLocalizedText(item.title_km, item.title_en, locale);
        const excerpt = getLocalizedText(item.excerpt_km, item.excerpt_en, locale);
        const categoryName = item.category
          ? getLocalizedText(item.category.name_km, item.category.name_en, locale)
          : null;

        const displayDate = formatShortDate(
          item.publish_date ?? item.created_at,
          locale
        );

        return (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: i * 0.06,
              ease: "easeOut",
            }}
            className="group bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            {/* Image */}
            <Link
              href={`/${locale}/news/${item.slug}`}
              className="block relative aspect-[16/9] overflow-hidden bg-gray-100"
            >
              {item.featured_image ? (
                <Image
                  src={item.featured_image}
                  alt={title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  unoptimized={
                    item.featured_image.includes("google.com") ||
                    item.featured_image.includes("firebasestorage")
                  }
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-school-blue-100 to-school-blue-50 flex items-center justify-center">
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
                    className="text-school-blue-300"
                  >
                    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9" />
                    <path d="M18 14h-8" />
                    <path d="M15 18h-5" />
                    <path d="M10 6h8v4h-8V6Z" />
                  </svg>
                </div>
              )}

              {/* Category badge */}
              {categoryName && (
                <div className="absolute top-3 left-3 z-10">
                  <Badge className="bg-white/90 backdrop-blur-sm text-school-blue-800 border-0 shadow-sm text-[10px] font-semibold px-2 py-0.5">
                    {categoryName}
                  </Badge>
                </div>
              )}
            </Link>

            {/* Content */}
            <div className="p-3 sm:p-4">
              {/* Date */}
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1.5">
                <Calendar className="w-3 h-3 text-gray-300" />
                <span>{displayDate}</span>
              </div>

              {/* Title */}
              <h2
                className={`font-semibold text-gray-900 text-sm leading-snug mb-1.5 line-clamp-2 group-hover:text-school-blue-800 transition-colors ${
                  locale === "km" ? "font-khmer" : ""
                }`}
              >
                <Link href={`/${locale}/news/${item.slug}`}>{title}</Link>
              </h2>

              {/* Excerpt */}
              {excerpt && (
                <p
                  className={`text-[13px] text-gray-500 leading-relaxed line-clamp-2 mb-2.5 ${
                    locale === "km" ? "font-khmer" : ""
                  }`}
                >
                  {excerpt}
                </p>
              )}

              {/* Bottom row */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-50">
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                  <Eye className="w-3 h-3 text-gray-300" />
                  <span>
                    {item.view_count} {locale === "km" ? "ដង" : "views"}
                  </span>
                </div>

                <Link
                  href={`/${locale}/news/${item.slug}`}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-school-blue-700 hover:text-school-blue-800 transition-colors group/link"
                >
                  <span>{t.read_more}</span>
                  <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
