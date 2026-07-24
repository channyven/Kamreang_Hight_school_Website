import { unstable_cache } from "next/cache";
import { createServerClient } from "@/lib/supabase";
import type { Achievement, AppDocument, GovernanceItem, Leadership, Milestone, News, NewsCategory, SchoolInfo, SchoolReport as DbSchoolReport, Statistics, Teacher } from "@/types";
import { REPORT_FILE_CATEGORIES } from "@/types";
import {
  mockSchoolInfo,
  mockLeadership,
  mockMilestones,
  mockTeachers,
  mockStats,
  mockGovernanceItems,
} from "@/lib/mock-data";
import { schoolReport, dbToUiSchoolReport } from "@/lib/report-data";
import type { SchoolReport as FrontendSchoolReport } from "@/lib/report-data";

// Public-site reads are wrapped in `unstable_cache` so navigating between
// pages doesn't pay a fresh Supabase round-trip on every request (each one
// was measured at several seconds). Server actions call `revalidateTag`
// with the matching tag below so admin edits still show up immediately.

export const getSiteSettings = unstable_cache(
  async (): Promise<Record<string, string>> => {
    try {
      const supabase = createServerClient();
      const { data } = await supabase.from("settings").select("key, value");
      const settings: Record<string, string> = {};
      (data ?? []).forEach((s: { key: string; value: string }) => {
        settings[s.key] = s.value;
      });
      return settings;
    } catch {
      return {};
    }
  },
  ["site-settings"],
  { tags: ["settings"], revalidate: 60 }
);

export const getAboutPageData = unstable_cache(
  async () => {
    try {
      const supabase = createServerClient();
      const [{ data: info }, { data: leaders }, { data: teacherRows }, { data: milestoneRows }] = await Promise.all([
        supabase.from("school_info").select("*"),
        supabase.from("leadership").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("teachers").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("milestones").select("*").eq("is_active", true).order("sort_order"),
      ]);

      // Check if Supabase data is still placeholder/seed content (e.g. "Phnom Penh High School")
      // If so, fall back to mock data which has the correct Kamrieng High School content
      const hasPlaceholderData = info?.some(
        (row: Record<string, unknown>) =>
          typeof row.content_en === "string" &&
          (row.content_en.includes("Phnom Penh") ||
            row.content_en.includes("established in 1960"))
      );

      // Check if teachers have grade_levels — Supabase data likely doesn't
      const hasGradeLevels = teacherRows?.some(
        (t: Record<string, unknown>) =>
          Array.isArray(t.grade_levels) && t.grade_levels.length > 0
      );

      return {
        schoolInfo: info && info.length > 0 && !hasPlaceholderData
          ? (info as SchoolInfo[])
          : mockSchoolInfo,
        leadership: leaders && leaders.length > 0 ? (leaders as Leadership[]) : mockLeadership,
        teachers: teacherRows && teacherRows.length > 0 && hasGradeLevels
          ? (teacherRows as Teacher[])
          : mockTeachers,
        milestones: milestoneRows && milestoneRows.length > 0
          ? (milestoneRows as Milestone[])
          : mockMilestones,
      };
    } catch {
      return {
        schoolInfo: mockSchoolInfo,
        leadership: mockLeadership,
        teachers: mockTeachers,
        milestones: mockMilestones,
      };
    }
  },
  ["about-page-data"],
  { tags: ["school_info", "leadership", "teachers", "milestones"], revalidate: 60 }
);

export const getPublishedAchievements = unstable_cache(
  async (): Promise<Achievement[]> => {
    try {
      const supabase = createServerClient();
      const { data } = await supabase
        .from("achievements")
        .select("*")
        .eq("status", "published")
        .order("achievement_date", { ascending: false });
      return (data ?? []) as Achievement[];
    } catch {
      return [];
    }
  },
  ["published-achievements"],
  { tags: ["achievements"], revalidate: 60 }
);

export const getPublishedNews = unstable_cache(
  async (): Promise<News[]> => {
    try {
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from("news")
        .select("*, category:news_categories(*)")
        .eq("status", "published")
        .order("publish_date", { ascending: false });

      if (error) {
        console.error("[getPublishedNews] Supabase query failed:", error);
        return [];
      }

      return data ? (data as News[]) : [];
    } catch (err) {
      console.error("[getPublishedNews] Unexpected error:", err);
      return [];
    }
  },
  ["published-news"],
  { tags: ["news"], revalidate: 30 }
);

export const getNewsCategories = unstable_cache(
  async (): Promise<NewsCategory[]> => {
    try {
      const supabase = createServerClient();
      const { data } = await supabase.from("news_categories").select("*").order("sort_order");
      return (data ?? []) as NewsCategory[];
    } catch {
      return [];
    }
  },
  ["news-categories"],
  { tags: ["news_categories"], revalidate: 60 }
);

export const getPublishedDocuments = unstable_cache(
  async (): Promise<AppDocument[]> => {
    try {
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from("report_files")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[getPublishedDocuments] Supabase query failed:", error);
        return [];
      }

      // Map report_files to AppDocument structure
      return (data ?? []).map((file: Record<string, unknown>) => ({
        id: file.id as string,
        title_km: file.title_km as string,
        title_en: file.title_en as string,
        description_km: file.description_km as string | null,
        description_en: file.description_en as string | null,
        file_url: file.file_url as string,
        file_name: file.file_name as string,
        category: {
          slug: file.category as string,
          name_km:
            REPORT_FILE_CATEGORIES.find((c) => c.key === file.category)
              ?.labelKm ?? (file.category as string),
          name_en:
            REPORT_FILE_CATEGORIES.find((c) => c.key === file.category)
              ?.labelEn ?? (file.category as string),
        },
        is_active: file.is_active as boolean,
        sort_order: file.sort_order as number,
        created_at: file.created_at as string,
        updated_at: file.updated_at as string,
      })) as AppDocument[];
    } catch (err) {
      console.error("[getPublishedDocuments] Unexpected error:", err);
      return [];
    }
  },
  ["published-documents"],
  { tags: ["documents"], revalidate: 60 }
);

export const getGovernanceItems = unstable_cache(
  async (): Promise<GovernanceItem[]> => {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("governance_items")
      .select("*")
      .eq("is_active", true)
      .order("section")
      .order("sort_order");
    return data && data.length > 0 ? (data as GovernanceItem[]) : mockGovernanceItems;
  },
  ["governance-items"],
  { tags: ["governance_items"], revalidate: 60 }
);

export const getCurrentStatistics = unstable_cache(
  async (): Promise<Statistics> => {
    try {
      const supabase = createServerClient();
      const { data } = await supabase
        .from("statistics")
        .select("*")
        .eq("is_current", true)
        .maybeSingle();
      return (data as Statistics | null) ?? mockStats;
    } catch {
      return mockStats;
    }
  },
  ["current-statistics"],
  { tags: ["statistics"], revalidate: 60 }
);

export const getPublishedSchoolReport = unstable_cache(
  async (): Promise<FrontendSchoolReport> => {
    try {
      const supabase = createServerClient();
      const { data } = await supabase
        .from("school_reports")
        .select("*")
        .eq("is_published", true)
        .order("academic_year", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        const mapped = dbToUiSchoolReport(data as DbSchoolReport);
        if (mapped) return mapped;
      }
    } catch {
      // fall through to local fallback
    }
    return schoolReport;
  },
  ["published-school-report"],
  { tags: ["school_reports"], revalidate: 300 }
);
