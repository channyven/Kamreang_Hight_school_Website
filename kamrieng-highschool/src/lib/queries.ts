import { unstable_cache } from "next/cache";
import { createServerClient } from "@/lib/supabase";
import type { Achievement, Leadership, News, NewsCategory, SchoolInfo, Statistics, Teacher } from "@/types";
import {
  mockSchoolInfo,
  mockLeadership,
  mockTeachers,
  mockAchievements,
  mockNews,
  mockNewsCategories,
  mockStats,
} from "@/lib/mock-data";

// Public-site reads are wrapped in `unstable_cache` so navigating between
// pages doesn't pay a fresh Supabase round-trip on every request (each one
// was measured at several seconds). Server actions call `revalidateTag`
// with the matching tag below so admin edits still show up immediately.

export const getSiteSettings = unstable_cache(
  async (): Promise<Record<string, string>> => {
    const supabase = createServerClient();
    const { data } = await supabase.from("settings").select("key, value");
    const settings: Record<string, string> = {};
    (data ?? []).forEach((s: { key: string; value: string }) => {
      settings[s.key] = s.value;
    });
    return settings;
  },
  ["site-settings"],
  { tags: ["settings"], revalidate: 60 }
);

export const getAboutPageData = unstable_cache(
  async () => {
    const supabase = createServerClient();
    const [{ data: info }, { data: leaders }, { data: teacherRows }] = await Promise.all([
      supabase.from("school_info").select("*"),
      supabase.from("leadership").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("teachers").select("*").eq("is_active", true).order("sort_order"),
    ]);

    return {
      schoolInfo: info && info.length > 0 ? (info as SchoolInfo[]) : mockSchoolInfo,
      leadership: leaders && leaders.length > 0 ? (leaders as Leadership[]) : mockLeadership,
      teachers: teacherRows && teacherRows.length > 0 ? (teacherRows as Teacher[]) : mockTeachers,
    };
  },
  ["about-page-data"],
  { tags: ["school_info", "leadership", "teachers"], revalidate: 60 }
);

export const getPublishedAchievements = unstable_cache(
  async (): Promise<Achievement[]> => {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("achievements")
      .select("*")
      .eq("status", "published")
      .order("achievement_date", { ascending: false });
    return data && data.length > 0
      ? (data as Achievement[])
      : mockAchievements.filter((a) => a.status === "published");
  },
  ["published-achievements"],
  { tags: ["achievements"], revalidate: 60 }
);

export const getPublishedNews = unstable_cache(
  async (): Promise<News[]> => {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("news")
      .select("*, category:news_categories(*)")
      .eq("status", "published")
      .order("publish_date", { ascending: false });
    return data && data.length > 0
      ? (data as News[])
      : mockNews.filter((n) => n.status === "published");
  },
  ["published-news"],
  { tags: ["news"], revalidate: 60 }
);

export const getNewsCategories = unstable_cache(
  async (): Promise<NewsCategory[]> => {
    const supabase = createServerClient();
    const { data } = await supabase.from("news_categories").select("*").order("sort_order");
    return data && data.length > 0 ? (data as NewsCategory[]) : mockNewsCategories;
  },
  ["news-categories"],
  { tags: ["news_categories"], revalidate: 60 }
);

export const getCurrentStatistics = unstable_cache(
  async (): Promise<Statistics> => {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("statistics")
      .select("*")
      .eq("is_current", true)
      .maybeSingle();
    return (data as Statistics | null) ?? mockStats;
  },
  ["current-statistics"],
  { tags: ["statistics"], revalidate: 60 }
);
