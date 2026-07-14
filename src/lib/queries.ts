import { unstable_cache } from "next/cache";
import { createServerClient } from "@/lib/supabase";
import type { Achievement, AppDocument, GovernanceItem, Leadership, News, NewsCategory, SchoolInfo, Statistics, Teacher } from "@/types";
import {
  mockSchoolInfo,
  mockLeadership,
  mockTeachers,
  mockAchievements,
  mockNews,
  mockNewsCategories,
  mockStats,
  mockGovernanceItems,
} from "@/lib/mock-data";

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
      const [{ data: info }, { data: leaders }, { data: teacherRows }] = await Promise.all([
        supabase.from("school_info").select("*"),
        supabase.from("leadership").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("teachers").select("*").eq("is_active", true).order("sort_order"),
      ]);

      // Check if Supabase data is still placeholder/seed content (e.g. "Phnom Penh High School")
      // If so, fall back to mock data which has the correct Kamrieng High School content
      const hasPlaceholderData = info?.some(
        (row: any) =>
          row.content_en?.includes("Phnom Penh") ||
          row.content_en?.includes("established in 1960")
      );

      // Check if teachers have grade_levels — Supabase data likely doesn't
      const hasGradeLevels = teacherRows?.some((t: any) => t.grade_levels && t.grade_levels.length > 0);

      return {
        schoolInfo: info && info.length > 0 && !hasPlaceholderData
          ? (info as SchoolInfo[])
          : mockSchoolInfo,
        leadership: leaders && leaders.length > 0 ? (leaders as Leadership[]) : mockLeadership,
        teachers: teacherRows && teacherRows.length > 0 && hasGradeLevels
          ? (teacherRows as Teacher[])
          : mockTeachers,
      };
    } catch {
      return {
        schoolInfo: mockSchoolInfo,
        leadership: mockLeadership,
        teachers: mockTeachers,
      };
    }
  },
  ["about-page-data"],
  { tags: ["school_info", "leadership", "teachers"], revalidate: 60 }
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
      return data && data.length > 0
        ? (data as Achievement[])
        : mockAchievements.filter((a) => a.status === "published");
    } catch {
      return mockAchievements.filter((a) => a.status === "published");
    }
  },
  ["published-achievements"],
  { tags: ["achievements"], revalidate: 60 }
);

export const getPublishedNews = unstable_cache(
  async (): Promise<News[]> => {
    try {
      const supabase = createServerClient();
      const { data } = await supabase
        .from("news")
        .select("*, category:news_categories(*)")
        .eq("status", "published")
        .order("publish_date", { ascending: false });
      return data && data.length > 0
        ? (data as News[])
        : mockNews.filter((n) => n.status === "published");
    } catch {
      return mockNews.filter((n) => n.status === "published");
    }
  },
  ["published-news"],
  { tags: ["news"], revalidate: 60 }
);

export const getNewsCategories = unstable_cache(
  async (): Promise<NewsCategory[]> => {
    try {
      const supabase = createServerClient();
      const { data } = await supabase.from("news_categories").select("*").order("sort_order");
      return data && data.length > 0 ? (data as NewsCategory[]) : mockNewsCategories;
    } catch {
      return mockNewsCategories;
    }
  },
  ["news-categories"],
  { tags: ["news_categories"], revalidate: 60 }
);

export const getPublishedDocuments = unstable_cache(
  async (): Promise<AppDocument[]> => {
    try {
      const supabase = createServerClient();
      const { data } = await supabase
        .from("downloads")
        .select("*, category:download_categories(name_km, name_en, slug)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      return (data ?? []) as unknown as AppDocument[];
    } catch {
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
