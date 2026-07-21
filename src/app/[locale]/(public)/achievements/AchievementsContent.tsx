"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";import { Trophy,
  Calendar,
  Users,
  GraduationCap,
  School,
  SearchX,
} from "lucide-react";
import Link from "next/link";
import { cn, getLocalizedText, formatShortDate, convertGoogleDriveUrl } from "@/utils";
import type { Achievement } from "@/types";

// ─── Level tag colors ─────────────────────────────────────────
// Brand guide: navy, gold, gray, and (sparingly) green only.

const LEVEL_STYLES: Record<string, string> = {
  national:    "bg-school-blue-50 text-school-blue-700",
  provincial:  "bg-school-gold-50 text-school-gold-800",
  district:    "bg-school-gray-100 text-school-gray-700",
  school:      "bg-school-gold-50 text-school-gold-700",
};
const LEVEL_FALLBACK = "bg-school-gray-100 text-school-gray-600";

// ─── Types ────────────────────────────────────────────────────

interface Props {
  achievements: Achievement[];
  translations: Record<string, string>;
}

// ─── Component ────────────────────────────────────────────────

export default function AchievementsContent({ achievements, translations }: Props) {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>(
    searchParams.get("type") ?? "all",
  );

  const filtered = useMemo(() => {
    if (selectedType === "all") return achievements;
    return achievements.filter((a) => a.achievement_type === selectedType);
  }, [achievements, selectedType]);

  const counts = useMemo(
    () => ({
      all: achievements.length,
      student: achievements.filter((a) => a.achievement_type === "student").length,
      teacher: achievements.filter((a) => a.achievement_type === "teacher").length,
      school: achievements.filter((a) => a.achievement_type === "school").length,
    }),
    [achievements],
  );

  const handleFilter = useCallback(
    (type: string) => {
      setSelectedType(type);
      const p = new URLSearchParams(searchParams.toString());
      if (type === "all") p.delete("type");
      else p.set("type", type);
      const qs = p.toString();
      router.replace(qs ? `?${qs}` : window.location.pathname, { scroll: false });
    },
    [router, searchParams],
  );

  const t = (key: string) => translations[key] ?? key;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* ─── Stats summary ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 -mt-7 relative z-10 items-stretch">
        <StatBox icon={Trophy} value={counts.all} label={locale === "km" ? "សរុប" : "Total"} accent="navy" />
        <StatBox icon={GraduationCap} value={counts.student} label={locale === "km" ? "សិស្ស" : "Students"} accent="navy" />
        <StatBox icon={Users} value={counts.teacher} label={locale === "km" ? "គ្រូ" : "Teachers"} accent="navy" />
        <StatBox icon={School} value={counts.school} label={locale === "km" ? "សាលា" : "School"} accent="navy" />
      </div>

      {/* ─── Filter pills ─── */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {(["all", "student", "teacher", "school"] as const).map((type) => {
          const isActive = selectedType === type;
          return (
            <button
              key={type}
              onClick={() => handleFilter(type)}
              className="relative shrink-0 focus:outline-none"
            >
              <span
                className={cn(
                  "relative inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer",
                  isActive
                    ? "text-white"
                    : "text-school-gray-600 hover:text-school-blue-700 hover:bg-school-blue-50/80 border border-transparent hover:border-school-blue-200",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeAchievementFilter"
                    className="absolute inset-0 rounded-xl bg-school-blue-800 shadow-md shadow-school-blue-800/20"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {type === "all" ? (locale === "km" ? "ទាំងអស់" : "All") : t(type)}
                </span>
                <span
                  className={cn(
                    "relative z-10 text-[10px] px-1.5 py-0.5 rounded-full",
                    isActive ? "bg-white/20 text-white" : "bg-school-gray-100 text-school-gray-500",
                  )}
                >
                  {counts[type]}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Grid ─── */}
      {filtered.length > 0 ? (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => {
              const title = getLocalizedText(item.title_km, item.title_en, locale);
              const desc = getLocalizedText(item.description_km, item.description_en, locale);

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35, delay: i * 0.035, ease: "easeOut" }}
                >
                  <Link
                    href={`/${locale}/achievements/${item.id}`}
                    className="group block bg-white rounded-xl border border-school-gray-200 hover:border-school-blue-200 hover:shadow-md hover:shadow-school-blue-800/5 hover:-translate-y-0.5 transition-all duration-300 flex flex-col overflow-hidden"
                  >
                    {/* Image or Trophy icon */}
                    {item.image_url ? (
                      <div className="relative w-full h-40 bg-school-gray-100 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={convertGoogleDriveUrl(item.image_url)}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="relative w-full h-40 bg-gradient-to-br from-school-blue-50 via-white to-school-gold-50 flex items-center justify-center shrink-0 group-hover:from-school-blue-100 group-hover:to-school-gold-100 transition-all duration-500">
                        <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center shadow-sm ring-1 ring-school-blue-100/50">
                          <Trophy className="w-6 h-6 text-school-blue-400" />
                        </div>
                      </div>
                    )}

                    <div className="p-5 pt-4 flex flex-col flex-1">
                      {/* Level tag */}
                      {item.award_level && (
                        <span
                          className={cn(
                            "inline-block self-start px-2 py-0.5 rounded text-[11px] font-medium mb-2",
                            LEVEL_STYLES[item.award_level] ?? LEVEL_FALLBACK,
                          )}
                        >
                          {t(item.award_level === "school" ? "school_level" : item.award_level)}
                        </span>
                      )}

                      {/* Title */}
                      <h3
                        className={cn(
                          "font-semibold text-gray-900 text-sm leading-snug mb-1 group-hover:text-school-blue-800 transition-colors",
                          locale === "km" ? "font-khmer" : "",
                        )}
                      >
                        {title}
                      </h3>

                      {/* Participant */}
                      {item.participant_name && (
                        <p className="text-xs text-school-blue-600/70 font-medium mb-1">
                          {item.participant_name}
                        </p>
                      )}

                      {/* Description */}
                      {desc && (
                        <p
                        className={cn(
                          "text-xs text-school-gray-400 leading-relaxed line-clamp-2 mb-3 flex-1",
                            locale === "km" ? "font-khmer" : "",
                          )}
                        >
                          {desc}
                        </p>
                      )}

                      {/* Date */}
                      {item.achievement_date && (
                        <div className="flex items-center gap-1.5 text-[11px] text-school-gray-400 pt-2 border-t border-school-gray-100 mt-auto">
                          <Calendar className="w-3 h-3" />
                          {formatShortDate(item.achievement_date, locale)}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-school-gray-100 flex items-center justify-center mb-4">
            <SearchX className="w-8 h-8 text-school-gray-300" />
          </div>
          <p className="text-sm text-school-gray-400">
            {locale === "km"
              ? "មិនទាន់មានសមិទ្ធផលនៅឡើយទេ"
              : "No achievements to show yet."}
          </p>
        </motion.div>
      )}

      {/* Bottom spacer */}
      <div className="h-16" />
    </div>
  );
}

// ─── Stat box ─────────────────────────────────────────────────
// Brand guide: navy, gold, gray, and (sparingly) green only.

const STAT_ACCENTS = {
  navy:  { bg: "bg-school-blue-50",    text: "text-school-blue-700" },
  gold:  { bg: "bg-school-gold-50",    text: "text-school-gold-700" },
  gray:  { bg: "bg-school-gray-100",   text: "text-school-gray-600" },
  green: { bg: "bg-school-gold-50",    text: "text-school-gold-700" },
} as const;

function StatBox({
  icon: Icon,
  value,
  label,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  accent: keyof typeof STAT_ACCENTS;
}) {
  const colors = STAT_ACCENTS[accent];
  return (
    <div className="group h-full flex flex-col items-center text-center bg-white rounded-2xl border border-school-gray-200 shadow-[0_10px_30px_-15px_rgba(44,42,122,0.12)] hover:shadow-[0_16px_40px_-15px_rgba(44,42,122,0.18)] hover:-translate-y-1 transition-all duration-300 p-5 pt-6">
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110",
          colors.bg,
        )}
      >
        <Icon className={cn("w-6 h-6", colors.text)} />
      </div>
      <p className="text-2xl font-bold text-school-blue-900 leading-none tabular-nums">{value}</p>
      <p className="text-xs text-school-gray-500 mt-1.5 font-medium">{label}</p>
    </div>
  );
}
