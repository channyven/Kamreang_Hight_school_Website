"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Users, GraduationCap, BookOpen, Award, TrendingUp } from "lucide-react";
import type { Statistics } from "@/types";
import { formatNumber } from "@/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  delay?: number;
  color: string;
}

function useCounter(target: number, active: boolean, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, active, duration]);

  return count;
}

function StatCard({ icon, label, value, suffix = "", delay = 0, color }: StatCardProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const count = useCounter(value, inView);
  const locale = useLocale();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
    >
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-900 counter-value tabular-nums">
        {formatNumber(count, locale)}
        {suffix}
      </p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </motion.div>
  );
}

interface StatsSectionProps {
  stats: Statistics | null;
}

export default function StatsSection({ stats }: StatsSectionProps) {
  const t = useTranslations("stats");
  const locale = useLocale();

  if (!stats) return null;

  const cards: StatCardProps[] = [
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      label: t("total_students"),
      value: stats.total_students ?? 0,
      color: "bg-blue-100",
      delay: 0,
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-green-600" />,
      label: t("total_teachers"),
      value: stats.total_teachers ?? 0,
      color: "bg-green-100",
      delay: 0.1,
    },
    {
      icon: <BookOpen className="w-6 h-6 text-purple-600" />,
      label: t("total_classes"),
      value: stats.total_classes ?? 0,
      color: "bg-purple-100",
      delay: 0.2,
    },
    {
      icon: <Award className="w-6 h-6 text-yellow-600" />,
      label: t("grade_a"),
      value: stats.grade_a_students ?? 0,
      color: "bg-yellow-100",
      delay: 0.3,
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-red-600" />,
      label: t("graduation_rate"),
      value: stats.graduation_rate ?? 0,
      suffix: "%",
      color: "bg-red-100",
      delay: 0.4,
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-school-gold-500 font-semibold text-sm uppercase tracking-wider">
            {stats.academic_year}
          </span>
          <h2 className={`text-3xl font-bold text-gray-900 mt-2 ${locale === "km" ? "font-khmer" : ""}`}>
            {t("subtitle")}
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {cards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {/* Gender breakdown bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 bg-white rounded-2xl p-6 shadow-md border border-gray-100"
        >
          <p className="text-sm font-medium text-gray-600 mb-3">
            {locale === "km" ? "សិស្សតាមភេទ" : "Students by Gender"}
          </p>
          <div className="flex rounded-full overflow-hidden h-4">
            <div
              className="bg-blue-500 transition-all duration-1000"
              style={{
                width: `${((stats.male_students ?? 0) / (stats.total_students ?? 1)) * 100}%`,
              }}
            />
            <div
              className="bg-pink-400 transition-all duration-1000"
              style={{
                width: `${((stats.female_students ?? 0) / (stats.total_students ?? 1)) * 100}%`,
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              {locale === "km" ? "ប្រុស" : "Male"} ({formatNumber(stats.male_students ?? 0, locale)})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-pink-400 inline-block" />
              {locale === "km" ? "ស្រី" : "Female"} ({formatNumber(stats.female_students ?? 0, locale)})
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
