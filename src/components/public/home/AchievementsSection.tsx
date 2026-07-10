"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, Trophy, Medal, Award, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Achievement } from "@/types";
import { getLocalizedText, formatShortDate } from "@/lib/utils";

// ─── Level Badge Config ────────────────────────────────────────
const LEVEL_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  national:   { bg: "bg-red-50",    text: "text-red-700",   icon: <Award className="w-3.5 h-3.5" /> },
  provincial: { bg: "bg-amber-50",  text: "text-amber-700", icon: <Medal className="w-3.5 h-3.5" /> },
  district:   { bg: "bg-blue-50",   text: "text-blue-700",  icon: <Medal className="w-3.5 h-3.5" /> },
  school:     { bg: "bg-emerald-50",text: "text-emerald-700",icon: <Star className="w-3.5 h-3.5" /> },
};

// ─── Achievement Card ──────────────────────────────────────────
function AchievementCard({ item, index, locale }: { item: Achievement; index: number; locale: string }) {
  const t = useTranslations("achievements");
  const title = getLocalizedText(item.title_km, item.title_en, locale);
  const desc = getLocalizedText(item.description_km, item.description_en, locale);
  const levelStyle = LEVEL_STYLES[item.award_level ?? ""] ?? LEVEL_STYLES.school;
  const typeLabel = t(item.achievement_type as "student" | "teacher" | "school");

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      className="group relative bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300 cursor-default"
    >
      {/* Top row: icon + badges */}
      <div className="flex items-start justify-between gap-3 mb-3">
        {/* Trophy icon */}
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 ring-1 ring-amber-200/50 transition-transform duration-300 group-hover:scale-110 group-hover:ring-2">
          <Trophy className="w-5 h-5 text-amber-600" />
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {/* Award level badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${levelStyle.bg} ${levelStyle.text}`}
          >
            {levelStyle.icon}
            {item.award_level && t(item.award_level as "national" | "provincial" | "district" | "school_level")}
          </span>
          {/* Type badge */}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-medium">
            {typeLabel}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3
        className={`font-semibold text-gray-900 text-sm leading-snug mb-1.5 group-hover:text-amber-600 transition-colors ${
          locale === "km" ? "font-khmer" : ""
        }`}
      >
        {title}
      </h3>

      {/* Description */}
      {desc && (
        <p
          className={`text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-2 ${
            locale === "km" ? "font-khmer" : ""
          }`}
        >
          {desc}
        </p>
      )}

      {/* Date footer */}
      {item.achievement_date && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-50">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-400">{formatShortDate(item.achievement_date, locale)}</span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────

interface AchievementsSectionProps {
  achievements: Achievement[];
}

export default function AchievementsSection({ achievements }: AchievementsSectionProps) {
  const t = useTranslations("achievements");
  const locale = useLocale();

  if (!achievements.length) return null;

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* ─── Header ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12"
        >
          <div>
            {/* Gold accent bar */}
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-8 h-px bg-school-gold-400/60" />
              <span className="block w-2 h-2 rounded-full bg-school-gold-500" />
              <span className="block w-8 h-px bg-school-gold-400/60" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold tracking-wide mb-2">
              {t("title")}
            </span>
            <h2
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mt-2 ${
                locale === "km" ? "font-khmer" : ""
              }`}
            >
              {t("subtitle")}
            </h2>
          </div>

          <Button asChild variant="outline" className="hidden sm:flex border-amber-600 text-amber-700 hover:bg-amber-50 shrink-0">
            <Link href={`/${locale}/achievements`}>
              {t("view_all")}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
        </motion.div>

        {/* ─── Grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {achievements.map((item, i) => (
            <AchievementCard key={item.id} item={item} index={i} locale={locale} />
          ))}
        </div>

        {/* Mobile view all */}
        <div className="text-center mt-8 sm:hidden">
          <Button asChild variant="outline" className="border-amber-600 text-amber-700">
            <Link href={`/${locale}/achievements`}>{t("view_all")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
