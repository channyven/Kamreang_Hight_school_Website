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
      const start = Date.now();
      const supabase = createServerClient();
      const { data, error } = await supabase.from("settings").select("key, value");
      
      if (error) {
        console.error(`[getSiteSettings] Supabase error (${Date.now() - start}ms):`, error);
        return {};
      }
      
      const settings: Record<string, string> = {};
      (data ?? []).forEach((s: { key: string; value: string }) => {
        settings[s.key] = s.value;
      });
      console.log(`[getSiteSettings] Success (${Date.now() - start}ms)`);
      return settings;
    } catch (err) {
      console.error("[getSiteSettings] Unexpected error:", err);
      return {};
    }
  },
  ["site-settings"],
  { tags: ["settings"], revalidate: 60 }
);

export const getAboutPageData = unstable_cache(
  async () => {
    try {
      const start = Date.now();
      const supabase = createServerClient();
      const [{ data: info, error: e1 }, { data: leaders, error: e2 }, { data: teacherRows, error: e3 }, { data: milestoneRows, error: e4 }] = await Promise.all([
        supabase.from("school_info").select("*"),
        supabase.from("leadership").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("teachers").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("milestones").select("*").eq("is_active", true).order("sort_order"),
      ]);

      console.log(`[getAboutPageData] Parallel query took ${Date.now() - start}ms`);

      if (e1 || e2 || e3 || e4) {
        console.error("[getAboutPageData] One or more queries failed:", { e1, e2, e3, e4 });
        // Fall back to mocks if any major query fails
        return {
          schoolInfo: mockSchoolInfo,
          leadership: mockLeadership,
          teachers: mockTeachers,
          milestones: mockMilestones,
        };
      }
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
      const start = Date.now();
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .order("created_at");
      
      console.log(`[getActiveBankAccounts] Query took ${Date.now() - start}ms`);
      
      if (error) {
        console.error("[getActiveBankAccounts] Supabase error:", error);
        return mockBankAccounts;
      }
      return (data ?? []) as BankAccount[];
    } catch (err) {
      console.error("[getActiveBankAccounts] Unexpected error:", err);
      return mockBankAccounts;
    }
  },
  ["bank-accounts"],
  { tags: ["bank_accounts"], revalidate: 60 }
);

export const getActiveDonationPurposes = unstable_cache(
  async (): Promise<DonationPurpose[]> => {
    try {
      const start = Date.now();
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from("donation_purposes")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .order("created_at");
      
      console.log(`[getActiveDonationPurposes] Query took ${Date.now() - start}ms`);

      if (error) {
        console.error("[getActiveDonationPurposes] Supabase error:", error);
        return mockDonationPurposes;
      }
      return (data ?? []) as DonationPurpose[];
    } catch (err) {
      console.error("[getActiveDonationPurposes] Unexpected error:", err);
      return mockDonationPurposes;
    }
  },
  ["donation-purposes"],
  { tags: ["donation_purposes"], revalidate: 60 }
);

export const getActiveDonationQrCodes = unstable_cache(
  async (): Promise<DonationQr[]> => {
    try {
      const start = Date.now();
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from("donation_qr_codes")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .order("created_at");
      
      console.log(`[getActiveDonationQrCodes] Query took ${Date.now() - start}ms`);
      
      if (error) {
        console.error("[getActiveDonationQrCodes] Supabase error:", error);
        return [];
      }
      return (data ?? []) as DonationQr[];
    } catch (err) {
      console.error("[getActiveDonationQrCodes] Unexpected error:", err);
      return [];
    }
  },
  ["donation-qr-codes"],
  { tags: ["donation_qr_codes"], revalidate: 60 }
);

export const getHeroSlides = unstable_cache(
  async (): Promise<HeroSlide[]> => {
    try {
      const start = Date.now();
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      
      console.log(`[getHeroSlides] Query took ${Date.now() - start}ms`);
      
      if (error) {
        console.error("[getHeroSlides] Supabase error:", error);
        return [];
      }
      return (data ?? []) as HeroSlide[];
    } catch (err) {
      console.error("[getHeroSlides] Unexpected error:", err);
      return [];
    }
  },
  ["hero-slides"],
  { tags: ["hero_slides"], revalidate: 60 }
);

export const getPublishedAchievementById = unstable_cache(
  async (id: string): Promise<Achievement | null> => {
    try {
      const supabase = createServerClient();
      const { data } = await supabase
        .from("achievements")
        .select("*")
        .eq("id", id)
        .eq("status", "published")
        .single();
      return (data ?? null) as Achievement | null;
    } catch {
      return null;
    }
  },
  ["published-achievement-by-id"],
  { tags: ["achievements"], revalidate: 60 }
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
