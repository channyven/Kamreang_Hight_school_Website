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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getPublishedAchievementById, getPublishedAchievements } from "@/lib/queries";
import { getLocalizedText, formatDate, convertGoogleDriveUrl } from "@/utils";
import ShareButton from "@/components/public/ShareButton";

export const revalidate = 60;

// ─── Theme colors per achievement type ────────────────────────
const TYPE_THEME: Record<string, { primary: string; light: string; gradient: string; icon: string }> = {
  student: {
    primary: "from-blue-600 to-blue-800",
    light: "from-blue-50 to-blue-100",
    gradient: "from-blue-900 to-blue-700",
    icon: "text-blue-400",
  },
  teacher: {
    primary: "from-purple-600 to-purple-800",
    light: "from-purple-50 to-purple-100",
    gradient: "from-purple-900 to-purple-700",
    icon: "text-purple-400",
  },
  school: {
    primary: "from-amber-600 to-amber-800",
    light: "from-amber-50 to-amber-100",
    gradient: "from-amber-900 to-amber-700",
    icon: "text-amber-400",
  },
};

const DEFAULT_THEME = {
  primary: "from-school-blue-600 to-school-blue-800",
  light: "from-school-blue-50 to-school-blue-100",
  gradient: "from-school-blue-900 to-school-blue-700",
  icon: "text-school-blue-400",
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

const LEVEL_STYLES: Record<string, string> = {
  national:    "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-200",
  provincial:  "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-200",
  district:    "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-200",
  school:      "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-200",
};

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
    locale
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ─── HERO SECTION ─── */}
      <section
        className={`relative bg-gradient-to-br ${theme.gradient} overflow-hidden`}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0">
          {/* Animated gradient orbs */}
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-white/5 blur-3xl" />

          {/* Geometric pattern */}
          <svg viewBox="0 0 1200 800" className="absolute inset-0 w-full h-full opacity-[0.03]">
            <defs>
              <pattern id="detail-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="1200" height="800" fill="url(#detail-grid)" />
          </svg>

          {/* Floating trophy icon */}
          <div className="absolute right-10 top-1/3 opacity-[0.06] hidden lg:block">
            <Trophy className="w-64 h-64" />
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-6 pt-28 pb-20 sm:pt-36 sm:pb-28">
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
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-sm border border-white/20 shadow-lg">
                  <TypeIcon className="w-3.5 h-3.5" />
                  {typeLabel}
                </span>
              )}

              {/* Level badge */}
              {achievement.award_level && (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${
                    LEVEL_STYLES[achievement.award_level] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  <Medal className="w-3.5 h-3.5" />
                  {t(
                    achievement.award_level === "school"
                      ? "school_level"
                      : achievement.award_level
                  )}
                </span>
              )}

              {/* Featured badge */}
              {achievement.is_featured && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900 shadow-lg shadow-amber-500/20">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {locale === "km" ? "ពិសេស" : "Featured"}
                </span>
              )}
            </div>

            {/* Title */}
            <h1
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5 ${
                locale === "km" ? "font-khmer" : ""
              }`}
            >
              {title}
            </h1>

            {/* Date & Participant row */}
            <div className="flex flex-wrap items-center gap-5">
              {achievement.achievement_date && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <Calendar className="w-4 h-4 text-white/70" />
                  <span className="text-sm font-medium text-white/90">
                    {formatDate(achievement.achievement_date, locale)}
                  </span>
                </div>
              )}
              {achievement.participant_name && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <User className="w-4 h-4 text-white/70" />
                  <span className="text-sm font-medium text-white/90">
                    {achievement.participant_name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* ─── MAIN CONTENT ─── */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ═══ Left Column — Main Content ═══ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            {achievement.image_url && (
              <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5 bg-gray-100">
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
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            )}

            {/* Description Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.primary} flex items-center justify-center shadow-lg`}>
                  <Quote className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {locale === "km" ? "អំពីសមិទ្ធផល" : "About This Achievement"}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {locale === "km" ? "ព័ត៌មានលម្អិត" : "Detailed information"}
                  </p>
                </div>
              </div>

              {description ? (
                <div className="prose max-w-none prose-gray prose-sm sm:prose-base leading-relaxed">
                  {description.split("\n").map((paragraph, i) => (
                    <p
                      key={i}
                      className={`text-gray-600 leading-relaxed mb-4 last:mb-0 ${
                        locale === "km" ? "font-khmer" : ""
                      }`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400 italic">
                    {locale === "km"
                      ? "មិនមានការពិពណ៌នាទេ។"
                      : "No description provided."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ═══ Right Column — Sidebar ═══ */}
          <div className="space-y-6">
            {/* Metadata Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div
                className={`px-5 py-3.5 bg-gradient-to-r ${theme.primary} flex items-center gap-2.5`}
              >
                <Trophy className="w-4 h-4 text-white/80" />
                <h3 className="text-sm font-semibold text-white">
                  {locale === "km" ? "ព័ត៌មានសង្ខេប" : "Quick Info"}
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {achievementType && (
                  <SidebarRow
                    icon={TypeIcon}
                    label={locale === "km" ? "ប្រភេទ" : "Type"}
                    value={typeLabel ?? ""}
                    color={theme.icon}
                  />
                )}
                {achievement.award_level && (
                  <SidebarRow
                    icon={Medal}
                    label={locale === "km" ? "កម្រិត" : "Level"}
                    value={t(
                      achievement.award_level === "school"
                        ? "school_level"
                        : achievement.award_level
                    )}
                    color="text-orange-500"
                  />
                )}
                {achievement.achievement_date && (
                  <SidebarRow
                    icon={Calendar}
                    label={locale === "km" ? "កាលបរិច្ឆេទ" : "Date"}
                    value={formatDate(achievement.achievement_date, locale)}
                    color="text-blue-500"
                  />
                )}
                {achievement.participant_name && (
                  <SidebarRow
                    icon={User}
                    label={locale === "km" ? "អ្នកចូលរួម" : "Participant"}
                    value={achievement.participant_name}
                    color="text-purple-500"
                  />
                )}
              </div>
            </div>

            {/* Participant Card */}
            {achievement.participant_name && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 bg-gradient-to-r from-purple-500 to-purple-600 flex items-center gap-2.5">
                  <User className="w-4 h-4 text-white/80" />
                  <h3 className="text-sm font-semibold text-white">
                    {locale === "km" ? "អ្នកចូលរួម" : "Participant"}
                  </h3>
                </div>
                <div className="p-5 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mx-auto mb-3 shadow-md">
                    <User className="w-7 h-7 text-purple-600" />
                  </div>
                  <p className={`font-semibold text-gray-900 ${locale === "km" ? "font-khmer" : ""}`}>
                    {achievement.participant_name}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-school-blue-700 to-school-blue-900 hover:from-school-blue-800 hover:to-school-blue-950 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-11"
              >
                <Link href={`/${locale}/achievements`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {locale === "km" ? "មើលសមិទ្ធផលទាំងអស់" : "All Achievements"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── RELATED ACHIEVEMENTS ─── */}
      {related.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2
                className={`text-2xl font-bold text-gray-900 ${
                  locale === "km" ? "font-khmer" : ""
                }`}
              >
                {locale === "km" ? "សមិទ្ធផលពាក់ព័ន្ធ" : "Related Achievements"}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
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
                locale
              );
              const RTypeIcon = item.achievement_type
                ? TYPE_ICONS[item.achievement_type] ?? Trophy
                : Trophy;

              return (
                <Link
                  key={item.id}
                  href={`/${locale}/achievements/${item.id}`}
                  className="group block bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  {item.image_url ? (
                    <div className="relative w-full h-36 bg-gray-50 overflow-hidden">
                      <Image
                        src={convertGoogleDriveUrl(item.image_url)}
                        alt={rTitle}
                        fill
                        sizes="(max-width: 768px) 100vw, 290px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized={item.image_url.includes("google.com") || false}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    </div>
                  ) : (
                    <div
                      className={`w-full h-36 bg-gradient-to-br ${
                        item.achievement_type
                          ? TYPE_THEME[item.achievement_type]?.light ?? "from-school-blue-50 to-school-gold-50"
                          : "from-school-blue-50 to-school-gold-50"
                      } flex items-center justify-center group-hover:scale-105 transition-transform duration-500`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm ring-1 ring-black/5">
                        <RTypeIcon className="w-6 h-6 text-school-blue-400" />
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    {item.award_level && (
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 ${
                          LEVEL_STYLES[item.award_level]?.replace("shadow", "shadow-sm") ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Medal className="w-2.5 h-2.5" />
                        {t(
                          item.award_level === "school" ? "school_level" : item.award_level
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
                        className={`text-xs text-gray-400 mt-1.5 line-clamp-2 ${
                          locale === "km" ? "font-khmer" : ""
                        }`}
                      >
                        {rDesc}
                      </p>
                    )}
                    {item.achievement_date && (
                      <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1.5">
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
        <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-school-blue-50 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-school-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {locale === "km" ? "ចែករំលែក" : "Share this achievement"}
              </p>
              <p className="text-xs text-gray-400">
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
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center shrink-0 ring-1 ring-black/5 ${color}`}>
        <Icon className="w-[18px] h-[18px]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-medium text-gray-800 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}
