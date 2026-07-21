"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  ArrowLeft,
  Edit,
  Trophy,
  Calendar,
  Users,
  GraduationCap,
  School,
  User,
  FileText,
  Settings2,
  ExternalLink,
  Eye,
  Info,
  Globe2,
  BookOpen,
  Clock,
  Fingerprint,
  Star,
  Medal,
  Sparkles,
  CheckCircle2,
  XCircle,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import type { Achievement } from "@/types";
import { formatDate, getLocalizedText, convertGoogleDriveUrl, adminHref } from "@/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

// ─── Theme colors per achievement type ────────────────────────
const TYPE_THEME: Record<string, { gradient: string; icon: string; badge: string }> = {
  student: {
    gradient: "from-blue-500 to-blue-600",
    icon: "text-blue-400",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  teacher: {
    gradient: "from-purple-500 to-purple-600",
    icon: "text-purple-400",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
  },
  school: {
    gradient: "from-amber-500 to-amber-600",
    icon: "text-amber-400",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

const DEFAULT_THEME = {
  gradient: "from-school-blue-500 to-school-blue-600",
  icon: "text-school-blue-400",
  badge: "bg-school-blue-50 text-school-blue-700 border-school-blue-200",
};

const TYPE_LABELS: Record<string, { en: string; km: string }> = {
  student: { en: "Student", km: "សិស្ស" },
  teacher: { en: "Teacher", km: "គ្រូ" },
  school: { en: "School", km: "សាលា" },
};

const LEVEL_LABELS: Record<string, { en: string; km: string; color: string }> = {
  national:    { en: "National", km: "ជាតិ", color: "from-red-400 to-red-500" },
  provincial:  { en: "Provincial", km: "ខេត្ត", color: "from-orange-400 to-orange-500" },
  district:    { en: "District", km: "ស្រុក", color: "from-blue-400 to-blue-500" },
  school:      { en: "School Level", km: "កម្រិតសាលា", color: "from-emerald-400 to-emerald-500" },
};

const STATUS_CONFIG: Record<
  string,
  { en: string; km: string; variant: "default" | "success" | "warning" | "destructive"; icon: typeof CheckCircle2 }
> = {
  published: { en: "Published", km: "បានចេញផ្សាយ", variant: "success", icon: CheckCircle2 },
  draft: { en: "Draft", km: "សេចក្តីព្រាង", variant: "warning", icon: FileText },
  archived: { en: "Archived", km: "ទុកក្នុងប័ណ្ណសារ", variant: "destructive", icon: XCircle },
};

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  student: GraduationCap,
  teacher: Users,
  school: School,
};

type Tab = "overview" | "content" | "system";

export default function AdminAchievementViewPage({ params }: PageProps) {
  const { id } = use(params);
  const locale = useLocale();
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    supabase
      .from("achievements")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setAchievement(data as Achievement | null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative mx-auto w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-school-blue-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-school-blue-800 animate-spin" />
          </div>
          <p className="text-sm text-gray-500 font-medium">
            {locale === "km" ? "កំពុងផ្ទុក..." : "Loading achievement..."}
          </p>
        </div>
      </div>
    );
  }

  if (!achievement) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
          <Trophy className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {locale === "km" ? "រកមិនឃើញសមិទ្ធផល" : "Achievement not found"}
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          {locale === "km" ? "សមិទ្ធផលនេះមិនមាននៅក្នុងប្រព័ន្ធទេ។" : "This achievement doesn't exist in the system."}
        </p>
        <Button asChild variant="outline">
          <Link href={adminHref(locale, "achievements")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {locale === "km" ? "ត្រឡប់" : "Back to list"}
          </Link>
        </Button>
      </div>
    );
  }

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
  const levelMeta = achievement.award_level ? LEVEL_LABELS[achievement.award_level] : null;
  const StatusIcon = STATUS_CONFIG[achievement.status]?.icon ?? CheckCircle2;

  const tabs: { key: Tab; label: string; labelKm: string; icon: typeof Eye }[] = [
    { key: "overview", label: "Overview", labelKm: "ទិដ្ឋភាពទូទៅ", icon: Eye },
    { key: "content", label: "Content", labelKm: "មាតិកា", icon: BookOpen },
    { key: "system", label: "System Info", labelKm: "ព័ត៌មានប្រព័ន្ធ", icon: Settings2 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* ─── Header ─── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="-ml-2 text-gray-500 hover:text-gray-900 shrink-0">
              <Link href={adminHref(locale, "achievements")}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                {locale === "km" ? "ត្រឡប់" : "Back"}
              </Link>
            </Button>
            <div className="hidden sm:block w-px h-8 bg-gray-200" />
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-lg shrink-0`}>
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate max-w-[280px] sm:max-w-md">
                    {title || (locale === "km" ? "គ្មានចំណងជើង" : "Untitled")}
                  </h1>
                  <Badge variant={STATUS_CONFIG[achievement.status]?.variant ?? "default"} className="text-[11px] capitalize shrink-0 gap-1">
                    <StatusIcon className="w-3 h-3" />
                    {locale === "km" ? STATUS_CONFIG[achievement.status]?.km : STATUS_CONFIG[achievement.status]?.en}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {achievement.achievement_date && formatDate(achievement.achievement_date, locale)}
                  {achievement.participant_name && ` · ${achievement.participant_name}`}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/${locale}/achievements/${id}`, "_blank")}
              className="text-gray-600 shrink-0"
            >
              <ExternalLink className="w-4 h-4 mr-1.5" />
              {locale === "km" ? "មើលលើគេហទំព័រ" : "View on Site"}
            </Button>
            <Button asChild className="bg-school-blue-800 hover:bg-school-blue-900 shrink-0 shadow-lg shadow-school-blue-800/20">
              <Link href={adminHref(locale, `achievements/${id}`)}>
                <Edit className="w-4 h-4 mr-1.5" />
                {locale === "km" ? "កែសម្រួល" : "Edit"}
              </Link>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-100 px-4 sm:px-6">
          <div className="flex gap-6 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 py-3.5 text-sm font-medium border-b-2 transition-all ${
                    isActive
                      ? "text-school-blue-800 border-school-blue-800"
                      : "text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {locale === "km" ? tab.labelKm : tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ Tab: Overview ═══ */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Image */}
            {achievement.image_url && !imageError && (
              <div className="relative w-full aspect-[21/9] bg-gray-100">
                <Image
                  src={convertGoogleDriveUrl(achievement.image_url)}
                  alt={title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 700px"
                  className="object-cover"
                  unoptimized={
                    achievement.image_url.includes("google.com") ||
                    achievement.image_url.includes("firebasestorage") ||
                    false
                  }
                  onError={() => setImageError(true)}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
            )}

            <div className="p-6 sm:p-8">
              {/* Badge Row */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {achievementType && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${theme.badge}`}>
                    <TypeIcon className="w-3.5 h-3.5" />
                    {typeLabel}
                  </span>
                )}
                {levelMeta && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${levelMeta.color}`}>
                    <Medal className="w-3.5 h-3.5" />
                    {locale === "km" ? levelMeta.km : levelMeta.en}
                  </span>
                )}
                {achievement.is_featured && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {locale === "km" ? "ពិសេស" : "Featured"}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className={`text-2xl sm:text-3xl font-bold text-gray-900 mb-6 ${locale === "km" ? "font-khmer" : ""}`}>
                {title}
              </h2>

              <Separator className="mb-6" />

              {/* Description */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-school-blue-50 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-school-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {locale === "km" ? "ការពិពណ៌នា" : "Description"}
                  </h3>
                </div>
                {description ? (
                  <div className={`prose max-w-none prose-sm text-gray-600 pl-10 ${locale === "km" ? "font-khmer" : ""}`}>
                    {description.split("\n").map((paragraph, i) => (
                      <p key={i} className="leading-relaxed mb-3 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic pl-10">
                    {locale === "km" ? "មិនមានការពិពណ៌នាទេ។" : "No description provided."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Info Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className={`px-5 py-3.5 bg-gradient-to-r ${theme.gradient} flex items-center gap-2.5`}>
                <Info className="w-4 h-4 text-white/80" />
                <h3 className="text-sm font-semibold text-white">
                  {locale === "km" ? "ព័ត៌មានសង្ខេប" : "Quick Info"}
                </h3>
              </div>
              <div className="p-4 space-y-2">
                {achievementType && (
                  <InfoRow icon={TypeIcon} label={locale === "km" ? "ប្រភេទ" : "Type"} value={typeLabel ?? "—"} />
                )}
                {achievement.award_level && (
                  <InfoRow icon={Medal} label={locale === "km" ? "កម្រិត" : "Level"} value={locale === "km" ? levelMeta?.km ?? "" : levelMeta?.en ?? ""} />
                )}
                {achievement.achievement_date && (
                  <InfoRow icon={Calendar} label={locale === "km" ? "កាលបរិច្ឆេទ" : "Date"} value={formatDate(achievement.achievement_date, locale)} />
                )}
                {achievement.participant_name && (
                  <InfoRow icon={User} label={locale === "km" ? "អ្នកចូលរួម" : "Participant"} value={achievement.participant_name} />
                )}
                {(achievement.gallery_images?.length ?? 0) > 0 && (
                  <InfoRow icon={ImageIcon} label={locale === "km" ? "រូបភាព" : "Gallery"} value={`${achievement.gallery_images?.length ?? 0} ${locale === "km" ? "រូប" : "photos"}`} />
                )}
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 bg-gradient-to-r from-gray-600 to-gray-700 flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-white/80" />
                <h3 className="text-sm font-semibold text-white">
                  {locale === "km" ? "ស្ថានភាព" : "Status"}
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{locale === "km" ? "ស្ថានភាពបច្ចុប្បន្ន" : "Current Status"}</span>
                  <Badge variant={STATUS_CONFIG[achievement.status]?.variant ?? "default"} className="gap-1">
                    <StatusIcon className="w-3 h-3" />
                    {locale === "km" ? STATUS_CONFIG[achievement.status]?.km : STATUS_CONFIG[achievement.status]?.en}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{locale === "km" ? "បង្ហាញលើទំព័រដើម" : "Featured"}</span>
                  <span className={`text-sm font-medium ${achievement.is_featured ? "text-amber-600" : "text-gray-400"}`}>
                    {achievement.is_featured
                      ? (locale === "km" ? "បាទ/ចាស" : "Yes")
                      : (locale === "km" ? "ទេ" : "No")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Tab: Content ═══ */}
      {activeTab === "content" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2.5">
            <Globe2 className="w-4 h-4 text-school-blue-800" />
            <h2 className="font-semibold text-gray-900 text-sm">
              {locale === "km" ? "មាតិកាពីរភាសា" : "Bilingual Content"}
            </h2>
            <span className="text-[11px] text-gray-400 ml-auto">
              {locale === "km" ? "ប្រៀបធៀបទាំងពីរភាសា" : "Side-by-side comparison"}
            </span>
          </div>
          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Khmer */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <span className="text-lg">🇰🇭</span> ភាសាខ្មែរ
                </div>
                <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="px-4 py-2.5 bg-gradient-to-r from-red-50 to-red-100/50 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {locale === "km" ? "ចំណងជើង" : "Title"}
                    </span>
                  </div>
                  <div className="px-4 py-3">
                    <p className={`text-sm font-medium text-gray-800 ${locale === "km" ? "font-khmer" : ""}`}>
                      {achievement.title_km || "—"}
                    </p>
                  </div>
                  <div className="px-4 py-2.5 bg-gradient-to-r from-red-50 to-red-100/50 border-y border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {locale === "km" ? "ការពិពណ៌នា" : "Description"}
                    </span>
                  </div>
                  <div className="px-4 py-3">
                    <p className={`text-xs text-gray-600 leading-relaxed ${locale === "km" ? "font-khmer" : ""}`}>
                      {achievement.description_km || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* English */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <span className="text-lg">🇺🇸</span> English
                </div>
                <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">
                      {achievement.title_en || "—"}
                    </p>
                  </div>
                  <div className="px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100/50 border-y border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {achievement.description_en || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Tab: System Info ═══ */}
      {activeTab === "system" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2.5">
            <Fingerprint className="w-4 h-4 text-school-blue-800" />
            <h2 className="font-semibold text-gray-900 text-sm">
              {locale === "km" ? "ព័ត៌មានប្រព័ន្ធ" : "System Information"}
            </h2>
          </div>
          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* ID */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-100">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-school-blue-50 flex items-center justify-center">
                    <Fingerprint className="w-4 h-4 text-school-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      {locale === "km" ? "លេខសម្គាល់" : "ID"}
                    </p>
                  </div>
                </div>
                <p className="font-mono text-xs text-gray-700 break-all bg-white rounded-lg px-3 py-2 border border-gray-100">
                  {achievement.id}
                </p>
              </div>

              {/* Status */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-100">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      {locale === "km" ? "ស្ថានភាព" : "Status"}
                    </p>
                  </div>
                </div>
                <Badge variant={STATUS_CONFIG[achievement.status]?.variant ?? "default"} className="gap-1">
                  <StatusIcon className="w-3 h-3" />
                  {locale === "km" ? STATUS_CONFIG[achievement.status]?.km : STATUS_CONFIG[achievement.status]?.en}
                </Badge>
              </div>

              {/* Featured */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-100">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Star className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      {locale === "km" ? "បង្ហាញលើទំព័រដើម" : "Featured"}
                    </p>
                  </div>
                </div>
                <p className={`text-sm font-semibold ${achievement.is_featured ? "text-amber-600" : "text-gray-400"}`}>
                  {achievement.is_featured
                    ? (locale === "km" ? "បាទ/ចាស" : "Yes")
                    : (locale === "km" ? "ទេ" : "No")}
                </p>
              </div>

              {/* Created At */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-100">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      {locale === "km" ? "បង្កើតនៅ" : "Created At"}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {formatDate(achievement.created_at, locale)}
                </p>
              </div>

              {/* Updated At */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-100">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      {locale === "km" ? "កែប្រែនៅ" : "Updated At"}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {formatDate(achievement.updated_at, locale)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Info Row ─────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
      <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 ring-1 ring-black/5">
        <Icon className="w-[18px] h-[18px] text-gray-600" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}
