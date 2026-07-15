"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";
import {
  Trophy,
  Calendar,
  Users,
  GraduationCap,
  School,
  SearchX,
} from "lucide-react";
import { cn, getLocalizedText, formatShortDate, convertGoogleDriveUrl } from "@/utils";
import type { Achievement } from "@/types";

// ─── Level tag colors ─────────────────────────────────────────

const LEVEL_STYLES: Record<string, string> = {
  national:    "bg-red-100 text-red-700",
  provincial:  "bg-orange-100 text-orange-700",
  district:    "bg-blue-100 text-blue-700",
  school:      "bg-emerald-100 text-emerald-700",
};
const LEVEL_FALLBACK = "bg-gray-100 text-gray-600";

// ─── Type icon mapping ────────────────────────────────────────

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  student: GraduationCap,
  teacher: Users,
  school: School,
};

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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
      {/* ─── Stats summary ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 -mt-7 relative z-10">
        <StatBox icon={Trophy} value={counts.all} label={locale === "km" ? "សរុប" : "Total"} />
        <StatBox icon={GraduationCap} value={counts.student} label={locale === "km" ? "សិស្ស" : "Students"} />
        <StatBox icon={Users} value={counts.teacher} label={locale === "km" ? "គ្រូ" : "Teachers"} />
        <StatBox icon={School} value={counts.school} label={locale === "km" ? "សាលា" : "School"} />
      </div>

      {/* ─── Filter pills ─── */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {(["all", "student", "teacher", "school"] as const).map((type) => {
          const Icon = type === "all" ? Trophy : TYPE_ICONS[type];
          const isActive = selectedType === type;
          return (
            <button
              key={type}
              onClick={() => handleFilter(type)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
                isActive
                  ? "bg-school-blue-800 text-white border-school-blue-800"
                  : "bg-white text-gray-500 border-gray-200 hover:border-school-blue-300 hover:text-school-blue-700",
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {type === "all" ? (locale === "km" ? "ទាំងអស់" : "All") : t(type)}
              <span
                className={cn(
                  "ml-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full",
                  isActive ? "bg-white/20" : "bg-gray-100 text-gray-400",
                )}
              >
                {counts[type]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Grid ─── */}
      {filtered.length > 0 ? (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
                  className="group bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                >
                  {/* Image or Trophy icon */}
                  {item.image_url ? (
                    <div className="relative w-full h-32 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-xl bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={convertGoogleDriveUrl(item.image_url)}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-school-blue-50 flex items-center justify-center mb-3 group-hover:bg-school-blue-100 transition-colors">
                      <Trophy className="w-5 h-5 text-school-blue-600" />
                    </div>
                  )}

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
                      "font-semibold text-gray-900 text-sm leading-snug mb-1",
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
                        "text-xs text-gray-400 leading-relaxed line-clamp-2 mb-3 flex-1",
                        locale === "km" ? "font-khmer" : "",
                      )}
                    >
                      {desc}
                    </p>
                  )}

                  {/* Date */}
                  {item.achievement_date && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 pt-2 border-t border-gray-50 mt-auto">
                      <Calendar className="w-3 h-3" />
                      {formatShortDate(item.achievement_date, locale)}
                    </div>
                  )}
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
          <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
            <SearchX className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-sm text-gray-400">
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

function StatBox({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-school-blue-50 flex items-center justify-center shrink-0">
        <Icon className="w-[18px] h-[18px] text-school-blue-600" />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 leading-none tabular-nums">{value}</p>
        <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
