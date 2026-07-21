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
  Star,
  Share2,
  FileText,
  Award,
} from "lucide-react";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { getPublishedAchievementById, getPublishedAchievements } from "@/lib/queries";
import { getLocalizedText, formatDate, convertGoogleDriveUrl } from "@/utils";
import ShareButton from "@/components/public/ShareButton";
import ImageZoom from "@/components/public/ImageZoom";

const PhotoGallery = dynamic(() => import("@/components/public/PhotoGallery"));

export const revalidate = 60;

// ─── Brand-aligned theme per achievement type ─────────────────

const TYPE_THEME: Record<string, { badge: string }> = {
  student: { badge: "bg-school-blue-800 text-white" },
  teacher: { badge: "bg-school-gold-500 text-white" },
  school:  { badge: "bg-school-gray-800 text-white" },
};
const DEFAULT_THEME = { badge: "bg-school-blue-800 text-white" };

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  student: GraduationCap,
  teacher: Users,
  school: School,
};

const TYPE_LABELS: Record<string, { en: string; km: string }> = {
  student: { en: "Student",  km: "សិស្ស" },
  teacher: { en: "Teacher",  km: "គ្រូ"   },
  school:  { en: "School",   km: "សាលា"  },
};

// ─── Level badges ─────────────────────────────────────────────

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
      {/* ═══ HERO ═══ */}
      <section className="bg-school-blue-800">
        <div className="container mx-auto px-6 pt-24 pb-12 sm:pt-28 sm:pb-16">
          <div className="max-w-4xl mx-auto">
            {/* Back */}
            <Link
              href={`/${locale}/achievements`}
              className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4" />
              {locale === "km" ? "ត្រឡប់ទៅសមិទ្ធផល" : "Back to Achievements"}
            </Link>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              {achievementType && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${theme.badge}`}>
                  <TypeIcon className="w-3.5 h-3.5" />
                  {typeLabel}
                </span>
              )}
              {achievement.award_level && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  LEVEL_STYLES[achievement.award_level] ?? LEVEL_FALLBACK
                }`}>
                  <Award className="w-3.5 h-3.5" />
                  {t(achievement.award_level === "school" ? "school_level" : achievement.award_level)}
                </span>
              )}
              {achievement.is_featured && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-school-gold-400 text-school-gold-900">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {locale === "km" ? "ពិសេស" : "Featured"}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-6 ${locale === "km" ? "font-khmer" : ""}`}>
              {title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
              {achievement.achievement_date && (
                <span className="inline-flex items-center gap-1.5 text-white/70">
                  <Calendar className="w-4 h-4 text-school-gold-300" />
                  {formatDate(achievement.achievement_date, locale)}
                </span>
              )}
              {achievement.participant_name && (
                <span className="inline-flex items-center gap-1.5 text-white/70">
                  <User className="w-4 h-4 text-school-gold-300" />
                  {achievement.participant_name}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MAIN CONTENT ═══ */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left — Main ── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image with click-to-zoom lightbox */}
            {achievement.image_url && (
              <div className="-mt-8 sm:-mt-12">
                <ImageZoom
                  src={convertGoogleDriveUrl(achievement.image_url)}
                  alt={title}
                  unoptimized={
                    achievement.image_url.includes("google.com") ||
                    achievement.image_url.includes("firebasestorage") ||
                    false
                  }
                >
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
                </ImageZoom>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-2xl border border-school-gray-200 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-school-blue-900 mb-5">
                {locale === "km" ? "អំពីសមិទ្ធផល" : "About This Achievement"}
              </h2>

              {/* Gallery */}
            {achievement.gallery_images && achievement.gallery_images.length > 0 && (
              <PhotoGallery images={achievement.gallery_images} locale={locale} />
            )}

            {description ? (
                <div className="space-y-4">
                  {description.split("\n").map((paragraph, i) => (
                    <p key={i} className={`text-school-gray-700 leading-relaxed ${locale === "km" ? "font-khmer" : ""}`}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-14 h-14 rounded-xl bg-school-gray-50 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-school-gray-300" />
                  </div>
                  <p className="text-sm text-school-gray-400 italic">
                    {locale === "km" ? "មិនមានការពិពណ៌នាទេ។" : "No description provided."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right — Sidebar ── */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-2xl border border-school-gray-200 overflow-hidden">
              <div className="px-5 py-3.5 bg-school-blue-800">
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-4 h-4 text-school-gold-300" />
                  <h3 className="text-sm font-semibold text-white">
                    {locale === "km" ? "ព័ត៌មានសង្ខេប" : "Quick Info"}
                  </h3>
                </div>
              </div>
              <div className="p-4 divide-y divide-school-gray-100">
                {achievementType && (
                  <SidebarRow icon={TypeIcon} label={locale === "km" ? "ប្រភេទ" : "Type"} value={typeLabel ?? ""} />
                )}
                {achievement.award_level && (
                  <SidebarRow icon={Award} label={locale === "km" ? "កម្រិត" : "Level"} value={t(achievement.award_level === "school" ? "school_level" : achievement.award_level)} />
                )}
                {achievement.achievement_date && (
                  <SidebarRow icon={Calendar} label={locale === "km" ? "កាលបរិច្ឆេទ" : "Date"} value={formatDate(achievement.achievement_date, locale)} />
                )}
                {achievement.participant_name && (
                  <SidebarRow icon={User} label={locale === "km" ? "អ្នកចូលរួម" : "Participant"} value={achievement.participant_name} />
                )}
              </div>
            </div>

            {/* Participant */}
            {achievement.participant_name && (
              <div className="bg-white rounded-2xl border border-school-gray-200 overflow-hidden">
                <div className="px-5 py-3.5 bg-school-gold-500">
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-white" />
                    <h3 className="text-sm font-semibold text-white">
                      {locale === "km" ? "អ្នកចូលរួម" : "Participant"}
                    </h3>
                  </div>
                </div>
                <div className="p-5 text-center">
                  <div className="w-16 h-16 rounded-full bg-school-gold-50 flex items-center justify-center mx-auto mb-3 ring-1 ring-school-gold-200/50">
                    <User className="w-7 h-7 text-school-gold-600" />
                  </div>
                  <p className={`font-semibold text-school-blue-900 ${locale === "km" ? "font-khmer" : ""}`}>
                    {achievement.participant_name}
                  </p>
                </div>
              </div>
            )}

            {/* CTA */}
            <Button asChild className="w-full bg-school-blue-800 hover:bg-school-blue-900 text-white h-11 rounded-xl">
              <Link href={`/${locale}/achievements`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {locale === "km" ? "មើលសមិទ្ធផលទាំងអស់" : "All Achievements"}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ RELATED ═══ */}
      {related.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className={`text-2xl font-bold text-school-blue-900 ${locale === "km" ? "font-khmer" : ""}`}>
                {locale === "km" ? "សមិទ្ធផលពាក់ព័ន្ធ" : "Related Achievements"}
              </h2>
              <p className="text-sm text-school-gray-400 mt-1">
                {locale === "km" ? "សមិទ្ធផលស្រដៀងគ្នា" : "More achievements in the same category"}
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
              const rDesc = getLocalizedText(item.description_km, item.description_en, locale);
              const RTypeIcon = item.achievement_type ? TYPE_ICONS[item.achievement_type] ?? Trophy : Trophy;

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
                    <div className="w-full h-36 bg-gradient-to-br from-school-blue-50 via-white to-school-gold-50 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center shadow-sm ring-1 ring-school-blue-100/50">
                        <RTypeIcon className="w-6 h-6 text-school-blue-400" />
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    {item.award_level && (
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 border ${LEVEL_STYLES[item.award_level] ?? LEVEL_FALLBACK}`}>
                        <Award className="w-2.5 h-2.5" />
                        {t(item.award_level === "school" ? "school_level" : item.award_level)}
                      </span>
                    )}
                    <h3 className={`text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-school-blue-800 transition-colors ${locale === "km" ? "font-khmer" : ""}`}>
                      {rTitle}
                    </h3>
                    {rDesc && (
                      <p className={`text-xs text-school-gray-400 mt-1.5 line-clamp-2 ${locale === "km" ? "font-khmer" : ""}`}>
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

      {/* ═══ SHARE ═══ */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl pb-16">
        <div className="bg-school-gray-50 rounded-2xl border border-school-gray-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-school-blue-50 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-school-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-school-blue-900 text-sm">
                {locale === "km" ? "ចែករំលែកសមិទ្ធផលនេះ" : "Share this achievement"}
              </p>
              <p className="text-xs text-school-gray-400">
                {locale === "km" ? "ចែករំលែកទៅកាន់បណ្តាញសង្គម" : "Copy link to share with others"}
              </p>
            </div>
          </div>
          <ShareButton locale={locale} />
        </div>
      </section>

      <div className="h-6" />
    </div>
  );
}

// ─── Sidebar Row ──────────────────────────────────────────────

function SidebarRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <div className="w-5 h-5 rounded-lg bg-school-gray-100 flex items-center justify-center shrink-0">
        <Icon className="w-3 h-3 text-school-gray-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-school-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-school-gray-800 break-words">{value}</p>
      </div>
    </div>
  );
}
