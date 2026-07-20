import { unstable_cache } from "next/cache";
import { createServerClient } from "@/lib/supabase";
import type { Achievement, AppDocument, BankAccount, DonationPurpose, DonationQr, GovernanceItem, HeroSlide, Leadership, Milestone, News, NewsCategory, SchoolInfo, Statistics, Teacher } from "@/types";
import {
  mockSchoolInfo,
  mockLeadership,
  mockMilestones,
  mockTeachers,
  mockStats,
  mockGovernanceItems,
  mockBankAccounts,
  mockDonationPurposes,
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

export const getActiveBankAccounts = unstable_cache(
  async (): Promise<BankAccount[]> => {
    try {
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .order("created_at");
      // Fall back to mocks only when the query fails (e.g. table missing);
      // an empty result means the admin hid every account on purpose.
      if (error) return mockBankAccounts;
      return (data ?? []) as BankAccount[];
    } catch {
      return mockBankAccounts;
    }
  },
  ["bank-accounts"],
  { tags: ["bank_accounts"], revalidate: 60 }
);

export const getActiveDonationPurposes = unstable_cache(
  async (): Promise<DonationPurpose[]> => {
    try {
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from("donation_purposes")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .order("created_at");
      // Fall back to mocks only when the query fails (e.g. table missing);
      // an empty result means the admin hid every card on purpose.
      if (error) return mockDonationPurposes;
      return (data ?? []) as DonationPurpose[];
    } catch {
      return mockDonationPurposes;
    }
  },
  ["donation-purposes"],
  { tags: ["donation_purposes"], revalidate: 60 }
);

export const getActiveDonationQrCodes = unstable_cache(
  async (): Promise<DonationQr[]> => {
    try {
      const supabase = createServerClient();
      const { data } = await supabase
        .from("donation_qr_codes")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .order("created_at");
      // No mock fallback here: before 019 runs the donate page falls back
      // to the legacy `donate_qr_url` settings key instead.
      return (data ?? []) as DonationQr[];
    } catch {
      return [];
    }
  },
  ["donation-qr-codes"],
  { tags: ["donation_qr_codes"], revalidate: 60 }
);

export const getHeroSlides = unstable_cache(
  async (): Promise<HeroSlide[]> => {
    try {
      const supabase = createServerClient();
      const { data } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      return (data ?? []) as HeroSlide[];
    } catch {
      return [];
    }
  },
  ["hero-slides"],
  { tags: ["hero_slides"], revalidate: 60 }
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
