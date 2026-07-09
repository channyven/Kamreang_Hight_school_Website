import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getLocalizedText, formatShortDate } from "@/lib/utils";
import { Trophy, Star } from "lucide-react";
import { getPublishedAchievements } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("achievements");
  return { title: t("title") };
}

const LEVEL_COLORS: Record<string, string> = {
  national: "bg-red-100 text-red-700 border-red-200",
  provincial: "bg-orange-100 text-orange-700 border-orange-200",
  district: "bg-blue-100 text-blue-700 border-blue-200",
  school: "bg-green-100 text-green-700 border-green-200",
};

interface AchievementsPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function AchievementsPage({ searchParams }: AchievementsPageProps) {
  const locale = await getLocale();
  const t = await getTranslations("achievements");
  const params = await searchParams;
  const selectedType = params.type ?? "";

  let achievements = await getPublishedAchievements();
  if (selectedType) {
    achievements = achievements.filter((a) => a.achievement_type === selectedType);
  }

  const types = [
    { key: "student", label: t("student") },
    { key: "teacher", label: t("teacher") },
    { key: "school", label: t("school") },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <div className="gradient-school text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className={`text-4xl font-bold mb-3 ${locale === "km" ? "font-khmer" : ""}`}>
            {t("title")}
          </h1>
          <p className={`text-school-blue-100 ${locale === "km" ? "font-khmer" : ""}`}>
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Type filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <a href={`/${locale}/achievements`}>
            <span
              className={`inline-block cursor-pointer px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                !selectedType
                  ? "bg-school-blue-800 text-white border-school-blue-800"
                  : "border-gray-300 text-gray-600 hover:border-school-blue-800 hover:text-school-blue-800"
              }`}
            >
              {locale === "km" ? "ទាំងអស់" : "All"}
            </span>
          </a>
          {types.map((type) => (
            <a key={type.key} href={`/${locale}/achievements?type=${type.key}`}>
              <span
                className={`inline-block cursor-pointer px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  selectedType === type.key
                    ? "bg-school-blue-800 text-white border-school-blue-800"
                    : "border-gray-300 text-gray-600 hover:border-school-blue-800 hover:text-school-blue-800"
                }`}
              >
                {type.label}
              </span>
            </a>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((item) => {
            const title = getLocalizedText(item.title_km, item.title_en, locale);
            const desc = getLocalizedText(item.description_km, item.description_en, locale);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-school-gold-100 flex items-center justify-center shrink-0">
                    <Trophy className="w-7 h-7 text-school-gold-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {item.award_level && (
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                            LEVEL_COLORS[item.award_level] ?? "bg-gray-100 text-gray-600 border-gray-200"
                          }`}
                        >
                          {t(item.award_level as "national" | "provincial" | "district" | "school_level")}
                        </span>
                      )}
                      {item.achievement_type && (
                        <span className="text-xs text-gray-400 capitalize">
                          {t(item.achievement_type as "student" | "teacher" | "school")}
                        </span>
                      )}
                    </div>
                    <h3
                      className={`font-semibold text-gray-900 text-sm leading-snug mb-1 ${locale === "km" ? "font-khmer" : ""}`}
                    >
                      {title}
                    </h3>
                    {item.participant_name && (
                      <p className="text-xs text-school-blue-700 font-medium mb-1">
                        {item.participant_name}
                      </p>
                    )}
                    {desc && (
                      <p
                        className={`text-xs text-gray-500 line-clamp-2 ${locale === "km" ? "font-khmer" : ""}`}
                      >
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
              </div>
            );
          })}
        </div>

        {achievements.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p>{locale === "km" ? "មិនមានលទ្ធផល" : "No achievements found"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
