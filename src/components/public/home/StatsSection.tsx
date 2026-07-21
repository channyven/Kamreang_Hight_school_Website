"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Users, GraduationCap, BookOpen, Award, TrendingUp } from "lucide-react";
import type { Statistics } from "@/types";
import { formatNumber } from "@/utils";

// Single color throughout: navy (main/primary brand color) for every icon.
const STAT_ICONS = [
  { icon: Users, accent: "navy" },
  { icon: GraduationCap, accent: "navy" },
  { icon: BookOpen, accent: "navy" },
  { icon: Award, accent: "navy" },
  { icon: TrendingUp, accent: "navy" },
] as const;

const ACCENT_MAP: Record<string, { bg: string; text: string; ring: string }> = {
  navy:  { bg: "bg-school-blue-50",  text: "text-school-blue-700",  ring: "ring-school-blue-200/50" },
  gold:  { bg: "bg-school-gold-50",  text: "text-school-gold-700",  ring: "ring-school-gold-200/50" },
  gray:  { bg: "bg-gray-100",        text: "text-gray-600",         ring: "ring-gray-300/50" },
  green: { bg: "bg-school-green-50", text: "text-school-green-700", ring: "ring-school-green-200/50" },
};

function useCounter(target: number, active: boolean, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, active, duration]);
  return count;
}

function StatCard({ icon, label, value, suffix = "", delay = 0, accent: accentKey }: {
  icon: React.ReactNode; label: string; value: number; suffix?: string; delay?: number; accent: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const count = useCounter(value, inView);
  const locale = useLocale();
  const colors = ACCENT_MAP[accentKey] ?? ACCENT_MAP.navy;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="relative bg-white rounded-xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-default"
    >
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${colors.bg} mb-3 ring-1 ${colors.ring}`}>
        <span className={`w-5 h-5 ${colors.text}`}>{icon}</span>
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums tracking-tight">
        {formatNumber(count, locale)}
        {suffix && <span className="text-base sm:text-lg font-semibold text-gray-400 ml-0.5">{suffix}</span>}
      </p>
      <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-snug">{label}</p>
    </motion.div>
  );
}

function GenderCard({ male, female, total }: { male: number; female: number; total: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const locale = useLocale();
  const malePct = total > 0 ? (male / total) * 100 : 0;
  const femalePct = total > 0 ? (female / total) * 100 : 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
      className="bg-white rounded-xl p-5 sm:p-6 border border-gray-100 shadow-sm"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-school-blue-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-school-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">{locale === "km" ? "សិស្សតាមភេទ" : "Students by Gender"}</p>
            <p className="text-xs text-gray-400 tabular-nums">{formatNumber(total, locale)} {locale === "km" ? "នាក់" : "students"}</p>
          </div>
        </div>
      </div>
      <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={inView ? { width: `${malePct}%` } : {}} transition={{ duration: 1, delay: 0.35, ease: "easeOut" }} className="absolute inset-y-0 left-0 rounded-full bg-school-blue-500" />
        <motion.div initial={{ width: 0 }} animate={inView ? { width: `${femalePct}%` } : {}} transition={{ duration: 1, delay: 0.55, ease: "easeOut" }} className="absolute inset-y-0 right-0 rounded-full bg-school-gold-500" style={{ left: `${malePct}%` }} />
      </div>
      <div className="flex justify-between mt-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-school-blue-500 ring-1 ring-school-blue-200" />
          <span className="text-xs sm:text-sm text-gray-600">{locale === "km" ? "ប្រុស" : "Male"}</span>
          <span className="text-xs sm:text-sm font-semibold text-gray-900 tabular-nums">{formatNumber(male, locale)}<span className="text-gray-400 font-normal ml-1">({malePct.toFixed(1)}%)</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-school-gold-500 ring-1 ring-school-gold-200" />
          <span className="text-xs sm:text-sm text-gray-600">{locale === "km" ? "ស្រី" : "Female"}</span>
          <span className="text-xs sm:text-sm font-semibold text-gray-900 tabular-nums">{formatNumber(female, locale)}<span className="text-gray-400 font-normal ml-1">({femalePct.toFixed(1)}%)</span></span>
        </div>
      </div>
    </motion.div>
  );
}

interface StatsSectionProps { stats: Statistics | null; }

export default function StatsSection({ stats }: StatsSectionProps) {
  const t = useTranslations("stats");
  const locale = useLocale();
  if (!stats) return null;

  const values = [stats.total_students ?? 0, stats.total_teachers ?? 0, stats.total_classes ?? 0, stats.grade_a_students ?? 0, stats.graduation_rate ?? 0];
  const labels = [t("total_students"), t("total_teachers"), t("total_classes"), t("grade_a"), t("graduation_rate")];
  const suffixes = ["", "", "", "", "%"];

  return (
    <section className="py-16 sm:py-20 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:4rem_4rem]">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="text-center mb-12 sm:mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="block w-8 h-px bg-school-gold-400/60" />
            <span className="block w-2 h-2 rounded-full bg-school-gold-500" />
            <span className="block w-8 h-px bg-school-gold-400/60" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-school-blue-50 text-school-blue-700 text-xs font-semibold tracking-wide mb-3">
            {stats.academic_year}
          </span>
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight ${locale === "km" ? "font-khmer" : ""}`}>
            {t("subtitle")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {values.map((value, i) => {
            const IconComponent = STAT_ICONS[i].icon;
            return <StatCard key={labels[i]} icon={<IconComponent className="w-5 h-5" />} label={labels[i]} value={value} suffix={suffixes[i]} delay={i * 0.08} accent={STAT_ICONS[i].accent} />;
          })}
        </div>

        <div className="mt-6 sm:mt-8">
          <GenderCard male={stats.male_students ?? 0} female={stats.female_students ?? 0} total={stats.total_students ?? 0} />
        </div>
      </div>
    </section>
  );
}
