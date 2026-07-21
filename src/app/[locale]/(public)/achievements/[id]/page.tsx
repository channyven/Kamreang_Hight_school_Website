import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import {
  Trophy,
  Calendar,
  GraduationCap,
  Users,
  School,
  User,
  ArrowLeft,
  ChevronRight,
  Medal,
  Star,
  Share2,
  Quote,
  FileText,
  Award,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getPublishedAchievementById, getPublishedAchievements } from "@/lib/queries";
import { getLocalizedText, formatDate, convertGoogleDriveUrl } from "@/utils";
import ShareButton from "@/components/public/ShareButton";

export const revalidate = 60;

// ─── Brand-aligned theme per achievement type ─────────────────
// Brand guide: navy (primary), gold (accent), gray, green (sparingly)

const TYPE_THEME: Record<string, { accent: string; light: string }> = {
  student: {
    accent: "bg-school-blue-800 text-white",
    light: "bg-school-blue-50 border-school-blue-200",
  },
  teacher: {
    accent: "bg-school-gold-500 text-white",
    light: "bg-school-gold-50 border-school-gold-200",
  },
  school: {
    accent: "bg-school-gray-800 text-white",
    light: "bg-school-gray-100 border-school-gray-300",
  },
};

const DEFAULT_THEME = {
  accent: "bg-school-blue-800 text-white",
  light: "bg-school-blue-50 border-school-blue-200",
};

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  student: GraduationCap,
  teacher: Users,
  school: School,
};

const TYPE_LABELS: Record<string, { en: string; km: string }> = {
  student: { en: "Student", km: "សិស្ស" },
  teacher: { en: "Teacher", km: "គ្រូ" },
  school: { en: "School", km: "សាលា" },
};

// ─── Level badges — brand palette ─────────────────────────────
const LEVEL_STYLES: Record<string, string> = {
  national:    "bg-school-blue-50 text-school-blue-700 border-school-blue-200",
  provincial:  "bg-school-gold-50 text-school-gold-800 border-school-gold-200",
  district:    "bg-school-gray-100 text-school-gray-700 border-school-gray-300",
  school:      "bg-school-gold-50 text-school-gold-700 border-school-gold-200",
};
const LEVEL_FALLBACK = "bg-school-gray-100 text-school-gray-600 border-school-gray-200";

interface AchievementDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({
  params,
}: AchievementDetailPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const item = await getPublishedAchievementById(id);
  if (!item) return {};
  const title = getLocalizedText(item.title_km, item.title_en, locale);
  return { title };
}

export default async function AchievementDetailPage({
  params,
}: AchievementDetailPageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const t = await getTranslations("achievements");

  const achievement = await getPublishedAchievementById(id);
  if (!achievement) notFound();

  const title = getLocalizedText(achievement.title_km, achievement.title_en, locale);
  const description = getLocalizedText(
    achievement.description_km,
    achievement.description_en,
    locale,
  );

  const achievementType = achievement.achievement_type ?? "";
  const theme = achievementType ? TYPE_THEME[achievementType] ?? DEFAULT_THEME : DEFAULT_THEME;
  const TypeIcon = achievementType ? TYPE_ICONS[achievementType] ?? Trophy : Trophy;
  const typeLabel = achievementType
    ? TYPE_LABELS[achievementType]?.[locale === "km" ? "km" : "en"] ?? achievementType
    : null;

  const allAchievements = await getPublishedAchievements();
  const related = allAchievements
    .filter((a) => a.id !== achievement.id && a.achievement_type === achievement.achievement_type)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* ─── HERO SECTION ─── */}
      <section className="relative bg-gradient-to-br from-school-blue-900 via-school-blue-800 to-school-blue-700 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0">
          {/* Subtle dot pattern (same as news page) */}
          <div className="absolute inset-0 opacity-[0.04]">
            <svg viewBox="0 0 400 300" className="w-full h-full">
              <defs>
                <pattern id="ach-detail-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="12" cy="12" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="400" height="300" fill="url(#ach-detail-dots)" />
            </svg>
          </div>

          {/* Gradient orbs */}
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-school-gold-500/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-school-blue-500/10 blur-3xl" />

          {/* Floating trophy */}
          <div className="absolute right-10 top-1/3 opacity-[0.04] hidden lg:block">
            <Trophy className="w-64 h-64 text-white" />
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-6 pt-28 pb-16 sm:pt-36 sm:pb-20">
          <div className="max-w-4xl mx-auto">
            {/* Back button */}
            <Link
              href={`/${locale}/achievements`}
              className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              {locale === "km" ? "ត្រឡប់ទៅសមិទ្ធផល" : "Back to Achievements"}
            </Link>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              {/* Type badge */}
              {achievementType && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${theme.accent} shadow-lg`}>
                  <TypeIcon className="w-3.5 h-3.5" />
                  {typeLabel}
                </span>
              )}

              {/* Level badge */}
              {achievement.award_level && (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${
                    LEVEL_STYLES[achievement.award_level] ?? LEVEL_FALLBACK
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  {t(
                    achievement.award_level === "school"
                      ? "school_level"
                      : achievement.award_level,
                  )}
                </span>
              )}

              {/* Featured badge */}
              {achievement.is_featured && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-school-gold-400 text-school-gold-900 shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {locale === "km" ? "ពិសេស" : "Featured"}
                </span>
              )}
            </div>

            {/* Title */}
            <h1
              className={`text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-6 ${
                locale === "km" ? "font-khmer" : ""
              }`}
            >
              {title}
            </h1>

            {/* Date & Participant row */}
            <div className="flex flex-wrap items-center gap-4">
              {achievement.achievement_date && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <Calendar className="w-4 h-4 text-school-gold-300" />
                  <span className="text-sm font-medium text-white/90">
                    {formatDate(achievement.achievement_date, locale)}
                  </span>
                </div>
              )}
              {achievement.participant_name && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <User className="w-4 h-4 text-school-gold-300" />
                  <span className="text-sm font-medium text-white/90">
                    {achievement.participant_name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT ─── */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl -mt-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ═══ Left — Main Content ═══ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            {achievement.image_url && (
              <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] rounded-2xl overflow-hidden shadow-xl bg-school-gray-100">
                <Image
                  src={convertGoogleDriveUrl(achievement.image_url)}
                  alt={title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 700px"
                  className="object-cover"
                  priority
                  unoptimized={
                    achievement.image_url.includes("google.com") ||
                    achievement.image_url.includes("firebasestorage") ||
                    false
                  }
                />
              </div>
            )}

            {/* Description Card */}
            <div className="bg-white rounded-2xl border border-school-gray-200 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-school-blue-50 flex items-center justify-center">
                  <Quote className="w-5 h-5 text-school-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-school-blue-900">
                    {locale === "km" ? "អំពីសមិទ្ធផល" : "About This Achievement"}
                  </h2>
                  <p className="text-xs text-school-gray-400">
                    {locale === "km" ? "ព័ត៌មានលម្អិត" : "Detailed information"}
                  </p>
                </div>
              </div>

              {description ? (
                <div className="prose max-w-none prose-gray prose-sm sm:prose-base leading-relaxed">
                  {description.split("\n").map((paragraph, i) => (
                    <p
                      key={i}
                      className={`text-school-gray-700 leading-relaxed mb-4 last:mb-0 ${
                        locale === "km" ? "font-khmer" : ""
                      }`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-school-gray-100 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-school-gray-300" />
                  </div>
                  <p className="text-sm text-school-gray-400 italic">
                    {locale === "km"
                      ? "មិនមានការពិពណ៌នាទេ។"
                      : "No description provided."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ═══ Right — Sidebar ═══ */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-white rounded-2xl border border-school-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 bg-school-blue-800 flex items-center gap-2.5">
                <Trophy className="w-4 h-4 text-school-gold-300" />
                <h3 className="text-sm font-semibold text-white">
                  {locale === "km" ? "ព័ត៌មានសង្ខេប" : "Quick Info"}
                </h3>
              </div>
              <div className="p-4 space-y-1">
                {achievementType && (
                  <SidebarRow
                    icon={TypeIcon}
                    label={locale === "km" ? "ប្រភេទ" : "Type"}
                    value={typeLabel ?? ""}
                    iconColor="text-school-blue-600"
                  />
                )}
                {achievement.award_level && (
                  <SidebarRow
                    icon={Award}
                    label={locale === "km" ? "កម្រិត" : "Level"}
                    value={t(
                      achievement.award_level === "school"
                        ? "school_level"
                        : achievement.award_level,
                    )}
                    iconColor="text-school-gold-600"
                  />
                )}
                {achievement.achievement_date && (
                  <SidebarRow
                    icon={Calendar}
                    label={locale === "km" ? "កាលបរិច្ឆេទ" : "Date"}
                    value={formatDate(achievement.achievement_date, locale)}
                    iconColor="text-school-blue-600"
                  />
                )}
                {achievement.participant_name && (
                  <SidebarRow
                    icon={User}
                    label={locale === "km" ? "អ្នកចូលរួម" : "Participant"}
                    value={achievement.participant_name}
                    iconColor="text-school-gray-600"
                  />
                )}
              </div>
            </div>

            {/* Participant Card */}
            {achievement.participant_name && (
              <div className="bg-white rounded-2xl border border-school-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 bg-school-gold-500 flex items-center gap-2.5">
                  <User className="w-4 h-4 text-white/80" />
                  <h3 className="text-sm font-semibold text-white">
                    {locale === "km" ? "អ្នកចូលរួម" : "Participant"}
                  </h3>
                </div>
                <div className="p-5 text-center">
                  <div className="w-16 h-16 rounded-full bg-school-gold-50 flex items-center justify-center mx-auto mb-3 shadow-sm ring-1 ring-school-gold-200/50">
                    <User className="w-7 h-7 text-school-gold-600" />
                  </div>
                  <p className={`font-semibold text-gray-900 ${locale === "km" ? "font-khmer" : ""}`}>
                    {achievement.participant_name}
                  </p>
                </div>
              </div>
            )}

            {/* Back Button */}
            <Button
              asChild
              className="w-full bg-school-blue-800 hover:bg-school-blue-900 text-white shadow-md hover:shadow-lg transition-all duration-300 h-11"
            >
              <Link href={`/${locale}/achievements`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {locale === "km" ? "មើលសមិទ្ធផលទាំងអស់" : "All Achievements"}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── RELATED ACHIEVEMENTS ─── */}
      {related.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2
                className={`text-2xl font-bold text-school-blue-900 ${
                  locale === "km" ? "font-khmer" : ""
                }`}
              >
                {locale === "km" ? "សមិទ្ធផលពាក់ព័ន្ធ" : "Related Achievements"}
              </h2>
              <p className="text-sm text-school-gray-400 mt-1">
                {locale === "km"
                  ? "សមិទ្ធផលស្រដៀងគ្នា"
                  : "More achievements in the same category"}
              </p>
            </div>
            <Link
              href={`/${locale}/achievements`}
              className="text-sm font-medium text-school-blue-700 hover:text-school-blue-900 transition-colors inline-flex items-center gap-1 group"
            >
              {locale === "km" ? "មើលទាំងអស់" : "View All"}
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {related.map((item) => {
              const rTitle = getLocalizedText(item.title_km, item.title_en, locale);
              const rDesc = getLocalizedText(
                item.description_km,
                item.description_en,
                locale,
              );
              const RTypeIcon = item.achievement_type
                ? TYPE_ICONS[item.achievement_type] ?? Trophy
                : Trophy;

              return (
                <Link
                  key={item.id}
                  href={`/${locale}/achievements/${item.id}`}
                  className="group block bg-white rounded-2xl border border-school-gray-200 hover:border-school-blue-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                >
                  {item.image_url ? (
                    <div className="relative w-full h-36 bg-school-gray-100 overflow-hidden">
                      <Image
                        src={convertGoogleDriveUrl(item.image_url)}
                        alt={rTitle}
                        fill
                        sizes="(max-width: 768px) 100vw, 290px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized={item.image_url.includes("google.com") || false}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-br from-school-blue-50 via-white to-school-gold-50 flex items-center justify-center group-hover:from-school-blue-100 group-hover:to-school-gold-100 transition-all duration-500">
                      <div className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm ring-1 ring-school-blue-100/50">
                        <RTypeIcon className="w-6 h-6 text-school-blue-400" />
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    {item.award_level && (
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 border ${
                          LEVEL_STYLES[item.award_level] ?? LEVEL_FALLBACK
                        }`}
                      >
                        <Award className="w-2.5 h-2.5" />
                        {t(
                          item.award_level === "school" ? "school_level" : item.award_level,
                        )}
                      </span>
                    )}
                    <p
                      className={`text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-school-blue-800 transition-colors ${
                        locale === "km" ? "font-khmer" : ""
                      }`}
                    >
                      {rTitle}
                    </p>
                    {rDesc && (
                      <p
                        className={`text-xs text-school-gray-400 mt-1.5 line-clamp-2 ${
                          locale === "km" ? "font-khmer" : ""
                        }`}
                      >
                        {rDesc}
                      </p>
                    )}
                    {item.achievement_date && (
                      <p className="text-[11px] text-school-gray-400 mt-3 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.achievement_date, locale)}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── Share Section ─── */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl pb-16">
        <div className="bg-school-gray-50 rounded-2xl border border-school-gray-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-school-blue-50 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-school-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-school-blue-900 text-sm">
                {locale === "km" ? "ចែករំលែក" : "Share this achievement"}
              </p>
              <p className="text-xs text-school-gray-400">
                {locale === "km" ? "ចែករំលែកទៅកាន់បណ្តាញសង្គម" : "Share to social media"}
              </p>
            </div>
          </div>
          <ShareButton locale={locale} />
        </div>
      </section>

      {/* Bottom spacer */}
      <div className="h-8" />
    </div>
  );
}

// ─── Sidebar Row ──────────────────────────────────────────────

function SidebarRow({
  icon: Icon,
  label,
  value,
  iconColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  iconColor: string;
}) {
  return (
    <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-school-gray-50 transition-colors">
      <div className={`w-9 h-9 rounded-lg bg-school-gray-50 flex items-center justify-center shrink-0 ring-1 ring-school-gray-200/50 ${iconColor}`}>
        <Icon className="w-[18px] h-[18px]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-school-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-medium text-school-gray-800 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}
