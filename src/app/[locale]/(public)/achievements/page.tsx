import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Trophy } from "lucide-react";
import { getPublishedAchievements } from "@/lib/queries";
import AchievementsContent from "./AchievementsContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("achievements");
  return { title: t("title") };
}

export default async function AchievementsPage() {
  const locale = await getLocale();
  const t = await getTranslations("achievements");

  const achievements = await getPublishedAchievements();

  const translations: Record<string, string> = {
    student: t("student"),
    teacher: t("teacher"),
    school: t("school"),
    national: t("national"),
    provincial: t("provincial"),
    district: t("district"),
    school_level: t("school_level"),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Hero ─── */}
      <section className="relative bg-gradient-to-br from-school-blue-900 to-school-blue-700 overflow-hidden">
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.04]">
          <svg viewBox="0 0 400 300" className="w-full h-full">
            <defs>
              <pattern id="ach-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="12" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#ach-dots)" />
          </svg>
        </div>

        <div className="relative z-10 container mx-auto px-6 pt-28 pb-16 sm:pt-32 sm:pb-20">
          <div className="max-w-xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mb-6">
              <Trophy className="w-6 h-6 text-white/80" />
            </div>

            <h1
              className={`text-3xl sm:text-4xl font-bold text-white leading-snug mb-3 tracking-tight ${
                locale === "km" ? "font-khmer" : ""
              }`}
            >
              {t("title")}
            </h1>

            <p
              className={`text-white/50 text-sm sm:text-base max-w-md mx-auto ${
                locale === "km" ? "font-khmer" : ""
              }`}
            >
              {t("subtitle")}
            </p>

            <p className="mt-5 text-xs text-white/30">
              {achievements.length} {locale === "km" ? "សមិទ្ធផល" : "achievements"}
            </p>
          </div>
        </div>
      </section>

      {/* ─── Content ─── */}
      <AchievementsContent achievements={achievements} translations={translations} />
    </div>
  );
}
