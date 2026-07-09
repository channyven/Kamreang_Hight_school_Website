"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Achievement } from "@/types";
import { getLocalizedText, formatShortDate } from "@/lib/utils";

const LEVEL_COLORS: Record<string, string> = {
  national: "bg-red-100 text-red-700",
  provincial: "bg-orange-100 text-orange-700",
  district: "bg-blue-100 text-blue-700",
  school: "bg-green-100 text-green-700",
};

interface AchievementsSectionProps {
  achievements: Achievement[];
}

export default function AchievementsSection({ achievements }: AchievementsSectionProps) {
  const t = useTranslations("achievements");
  const locale = useLocale();

  if (!achievements.length) return null;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
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
          <Button asChild variant="outline" className="hidden sm:flex border-school-blue-800 text-school-blue-800">
            <Link href={`/${locale}/achievements`}>
              {t("view_all")} <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((item, i) => {
            const title = getLocalizedText(item.title_km, item.title_en, locale);
            const desc = getLocalizedText(item.description_km, item.description_en, locale);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-school-gold-100 flex items-center justify-center shrink-0">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={title}
                        width={56}
                        height={56}
                        className="rounded-xl object-cover"
                      />
                    ) : (
                      <Trophy className="w-7 h-7 text-school-gold-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          LEVEL_COLORS[item.award_level ?? ""] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.award_level && t(item.award_level as "national" | "provincial" | "district" | "school_level")}
                      </span>
                      <span className="text-xs text-gray-400 capitalize">
                        {t(item.achievement_type as "student" | "teacher" | "school")}
                      </span>
                    </div>
                    <h3 className={`font-semibold text-gray-900 text-sm leading-snug mb-1 group-hover:text-school-blue-800 transition-colors ${locale === "km" ? "font-khmer" : ""}`}>
                      {title}
                    </h3>
                    {desc && (
                      <p className={`text-xs text-gray-500 line-clamp-2 ${locale === "km" ? "font-khmer" : ""}`}>
                        {desc}
                      </p>
                    )}
                    {item.achievement_date && (
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {formatShortDate(item.achievement_date, locale)}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
