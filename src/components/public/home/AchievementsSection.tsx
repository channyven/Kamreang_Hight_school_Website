"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, Trophy, Medal, Award, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Achievement } from "@/types";
import { getLocalizedText, formatShortDate, convertGoogleDriveUrl } from "@/utils";

// Brand guide: navy, gold, gray, and (sparingly) green only — no red/violet/cyan/rose/orange.
const LEVEL_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  national:   { bg: "bg-school-blue-50 border-school-blue-200", text: "text-school-blue-700", icon: <Award className="w-3.5 h-3.5" /> },
  provincial: { bg: "bg-school-gold-50 border-school-gold-200", text: "text-school-gold-800", icon: <Medal className="w-3.5 h-3.5" /> },
  district:   { bg: "bg-gray-100 border-gray-300",              text: "text-gray-700",        icon: <Medal className="w-3.5 h-3.5" /> },
  school:     { bg: "bg-school-green-50 border-school-green-200", text: "text-school-green-800", icon: <Star className="w-3.5 h-3.5" /> },
};

const TYPE_COLORS: Record<string, string> = {
  student: "bg-school-gold-50 text-school-gold-800",
  teacher: "bg-school-blue-50 text-school-blue-700",
  school: "bg-gray-100 text-gray-700",
};
const DEFAULT_TYPE_COLOR = "bg-gray-50 text-gray-600";

interface AchievementsSectionProps { achievements: Achievement[]; }

export default function AchievementsSection({ achievements }: AchievementsSectionProps) {
  const t = useTranslations("achievements");
  const locale = useLocale();
  if (!achievements.length) return null;

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-8 h-px bg-school-gold-400/60" />
              <span className="block w-2 h-2 rounded-full bg-school-gold-500" />
              <span className="block w-8 h-px bg-school-gold-400/60" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-school-gold-50 text-school-gold-800 text-xs font-semibold tracking-wide mb-2">{t("title")}</span>
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mt-1 ${locale === "km" ? "font-khmer" : ""}`}>{t("subtitle")}</h2>
          </div>
          <Button asChild variant="outline" className="hidden sm:flex border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all group">
            <Link href={`/${locale}/achievements`}>{t("view_all")}<ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" /></Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {achievements.map((item, i) => {
            const title = getLocalizedText(item.title_km, item.title_en, locale);
            const desc = getLocalizedText(item.description_km, item.description_en, locale);
            const levelStyle = LEVEL_STYLES[item.award_level ?? ""] ?? LEVEL_STYLES.school;
            const typeLabel = t(item.achievement_type as "student" | "teacher" | "school");
            const typeColor = (item.achievement_type && TYPE_COLORS[item.achievement_type]) ?? DEFAULT_TYPE_COLOR;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
                className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-default flex flex-col overflow-hidden"
              >
                {/* Image or Trophy icon */}
                {item.image_url ? (
                  <div className="relative w-full h-40 bg-gray-50 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={convertGoogleDriveUrl(item.image_url)}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-40 bg-gradient-to-br from-school-gold-50 via-white to-school-gold-100 flex items-center justify-center shrink-0 group-hover:from-school-gold-100 group-hover:to-school-gold-200 transition-all duration-500">
                    <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center shadow-sm ring-1 ring-school-gold-200/50">
                      <Trophy className="w-6 h-6 text-school-gold-600" />
                    </div>
                  </div>
                )}

                <div className="p-5 pt-4 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    {item.award_level && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${levelStyle.bg} ${levelStyle.text}`}>
                        {levelStyle.icon}{t(item.award_level as "national" | "provincial" | "district" | "school_level")}
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border border-transparent ${typeColor}`}>{typeLabel}</span>
                  </div>
                  <h3 className={`font-semibold text-gray-900 text-sm leading-snug mb-1.5 ${locale === "km" ? "font-khmer" : ""}`}>{title}</h3>
                  {desc && <p className={`text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-2 ${locale === "km" ? "font-khmer" : ""}`}>{desc}</p>}
                  {item.achievement_date && (
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-50">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-400">{formatShortDate(item.achievement_date, locale)}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Button asChild variant="outline" className="border-gray-300 text-gray-700">
            <Link href={`/${locale}/achievements`}>{t("view_all")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
