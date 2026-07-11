import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatShortDate,
  formatNumber,
  getLocalizedText,
  truncate,
  stripHtml,
} from "@/lib/utils";
import {
  Search,
  X,
  Calendar,
  Trophy,
  Users,
  ArrowRight,
  Newspaper,
  Building2,
  Shield,
} from "lucide-react";
import {
  getPublishedNews,
  getPublishedAchievements,
  getNewsCategories,
} from "@/lib/queries";
import { getAboutPageData } from "@/lib/queries";
import type {
  News,
  Achievement,
  Teacher,
  SchoolInfo,
  Leadership,
} from "@/types";

// ─── Data fetching ──────────────────────────────────────────

interface SearchResults {
  news: News[];
  achievements: Achievement[];
  teachers: Teacher[];
  schoolInfo: SchoolInfo[];
  leadership: Leadership[];
}

async function getSearchData(): Promise<SearchResults> {
  const [news, achievements, aboutData] = await Promise.all([
    getPublishedNews(),
    getPublishedAchievements(),
    getAboutPageData(),
  ]);
  return {
    news,
    achievements,
    teachers: aboutData.teachers ?? [],
    schoolInfo: aboutData.schoolInfo ?? [],
    leadership: aboutData.leadership ?? [],
  };
}

// ─── Search matching ────────────────────────────────────────

function matchesQuery(
  item: Record<string, unknown>,
  fields: string[],
  query: string
): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return false;
  const haystack = fields
    .map((f) => String(item[f] ?? ""))
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function matchNews(item: News, query: string): boolean {
  return matchesQuery(
    item as unknown as Record<string, unknown>,
    [
      "title_km",
      "title_en",
      "excerpt_km",
      "excerpt_en",
      "content_km",
      "content_en",
    ],
    query
  );
}

function matchAchievement(item: Achievement, query: string): boolean {
  return matchesQuery(
    item as unknown as Record<string, unknown>,
    [
      "title_km",
      "title_en",
      "description_km",
      "description_en",
    ],
    query
  );
}

function matchTeacher(item: Teacher, query: string): boolean {
  return matchesQuery(
    item as unknown as Record<string, unknown>,
    [
      "name_km",
      "name_en",
      "subject_km",
      "subject_en",
      "department_km",
      "department_en",
      "qualification_km",
      "qualification_en",
    ],
    query
  );
}

function matchSchoolInfo(item: SchoolInfo, query: string): boolean {
  return matchesQuery(
    item as unknown as Record<string, unknown>,
    [
      "title_km",
      "title_en",
      "content_km",
      "content_en",
    ],
    query
  );
}

function matchLeadership(item: Leadership, query: string): boolean {
  return matchesQuery(
    item as unknown as Record<string, unknown>,
    [
      "name_km",
      "name_en",
      "title_km",
      "title_en",
      "position_km",
      "position_en",
      "bio_km",
      "bio_en",
    ],
    query
  );
}

// ─── Metadata ───────────────────────────────────────────────

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q ?? "";
  const title = query ? `Search results for "${query}"` : "Search";
  return { title };
}

// ─── Helpers ────────────────────────────────────────────────

function getExcerpt(
  contentKm: string | null | undefined,
  contentEn: string | null | undefined,
  locale: string
): string {
  const text = getLocalizedText(contentKm, contentEn, locale);
  if (!text) return "";
  return truncate(stripHtml(text), 200);
}

// ─── Page ───────────────────────────────────────────────────

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const locale = await getLocale();
  const t = await getTranslations();
  const params = await searchParams;
  const query = params.q ?? "";
  const hasQuery = query.trim().length > 0;

  // Fetch all data
  const { news, achievements, teachers, schoolInfo, leadership } =
    await getSearchData();
  const categories = await getNewsCategories();

  // Filter by keyword across ALL content types
  const matchedNews = hasQuery
    ? news.filter((n) => matchNews(n, query))
    : [];
  const matchedAchievements = hasQuery
    ? achievements.filter((a) => matchAchievement(a, query))
    : [];
  const matchedTeachers = hasQuery
    ? teachers.filter((t) => matchTeacher(t, query))
    : [];
  const matchedSchoolInfo = hasQuery
    ? schoolInfo.filter((s) => matchSchoolInfo(s, query))
    : [];
  const matchedLeadership = hasQuery
    ? leadership.filter((l) => matchLeadership(l, query))
    : [];

  // Group news by category for "Events" highlighting
  const eventsCategory = categories.find((c) => c.slug === "events");
  const eventsNews = eventsCategory
    ? matchedNews.filter((n) => n.category_id === eventsCategory.id)
    : [];
  const otherNews = eventsCategory
    ? matchedNews.filter((n) => n.category_id !== eventsCategory.id)
    : matchedNews;

  const totalResults =
    matchedNews.length +
    matchedAchievements.length +
    matchedTeachers.length +
    matchedSchoolInfo.length +
    matchedLeadership.length;

  // Placeholder: no query entered
  if (!hasQuery) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Hero */}
        <div className="gradient-school text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1
              className={`text-4xl font-bold mb-3 ${locale === "km" ? "font-khmer" : ""}`}
            >
              {locale === "km" ? "ស្វែងរក" : "Search"}
            </h1>
            <p
              className={`text-school-blue-100 max-w-xl mx-auto ${locale === "km" ? "font-khmer" : ""}`}
            >
              {locale === "km"
                ? "ស្វែងរកព័ត៌មាន សមិទ្ធិផល គ្រូបង្រៀន ព័ត៌មានសាលា និងអ្វីៗជាច្រើនទៀត"
                : "Search news, achievements, teachers, school info, and more across the entire website"}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          {/* Big search box */}
          <div className="max-w-2xl mx-auto text-center">
            <form action={`/${locale}/search`} method="GET" role="search">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <Input
                  name="q"
                  type="search"
                  placeholder={
                    locale === "km"
                      ? "ស្វែងរកពាក្យគន្លឹះ..."
                      : "Search by keyword..."
                  }
                  autoFocus
                  className="pl-12 pr-4 h-14 text-lg rounded-2xl bg-white border-2 border-gray-200 shadow-sm focus:border-school-blue-800 transition-all"
                />
              </div>
            </form>

            {/* Quick suggestions */}
            <div className="mt-8">
              <p
                className={`text-sm text-gray-500 mb-3 ${locale === "km" ? "font-khmer" : ""}`}
              >
                {locale === "km" ? "ស្វែងរករហ័ស៖" : "Quick search:"}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "Events",
                  "Science",
                  "Sports",
                  "Olympiad",
                  "Scholarship",
                  "History",
                  "Vision",
                ].map((keyword) => (
                  <Link
                    key={keyword}
                    href={`/${locale}/search?q=${encodeURIComponent(keyword.toLowerCase())}`}
                  >
                    <Badge
                      variant="outline"
                      className="cursor-pointer px-3 py-1.5 text-sm hover:bg-school-blue-800 hover:text-white transition-colors"
                    >
                      {keyword}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Results view ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <div className="gradient-school text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Search form in hero */}
            <form action={`/${locale}/search`} method="GET" role="search">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none" />
                <Input
                  name="q"
                  type="search"
                  defaultValue={query}
                  placeholder={
                    locale === "km"
                      ? "ស្វែងរកពាក្យគន្លឹះ..."
                      : "Search by keyword..."
                  }
                  autoFocus
                  className="pl-12 pr-12 h-14 text-lg rounded-2xl bg-white/15 border border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 transition-all"
                />
                {query && (
                  <Link
                    href={`/${locale}/search`}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </form>

            {/* Results summary */}
            <div className="flex items-center gap-2 mt-4 text-sm text-school-blue-100">
              <Search className="w-4 h-4" />
              <span>
                {locale === "km"
                  ? `បានរកឃើញ ${formatNumber(totalResults, locale)} លទ្ធផល សម្រាប់ "${query}"`
                  : `Found ${totalResults} result${totalResults === 1 ? "" : "s"} for "${query}"`}
              </span>
              {totalResults > 0 && (
                <span className="text-school-blue-200 text-xs">
                  {[
                    matchedNews.length &&
                      `${matchedNews.length} ${locale === "km" ? "ព័ត៌មាន" : "news"}`,
                    matchedAchievements.length &&
                      `${matchedAchievements.length} ${locale === "km" ? "សមិទ្ធិផល" : "achievements"}`,
                    matchedTeachers.length &&
                      `${matchedTeachers.length} ${locale === "km" ? "គ្រូ" : "teachers"}`,
                    matchedSchoolInfo.length &&
                      `${matchedSchoolInfo.length} ${locale === "km" ? "ព័ត៌មានសាលា" : "pages"}`,
                    matchedLeadership.length &&
                      `${matchedLeadership.length} ${locale === "km" ? "ថ្នាក់ដឹកនាំ" : "leaders"}`,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {totalResults === 0 ? (
          // ── No results ──────────────────────────────────────────
          <div className="text-center py-20 text-gray-400">
            <Search className="w-20 h-20 mx-auto mb-4 opacity-20" />
            <p
              className={`text-xl font-medium mb-2 text-gray-500 ${locale === "km" ? "font-khmer" : ""}`}
            >
              {locale === "km"
                ? "មិនមានលទ្ធផលទេ"
                : "No results found"}
            </p>
            <p
              className={`text-sm mb-6 ${locale === "km" ? "font-khmer" : ""}`}
            >
              {locale === "km"
                ? `គ្មានលទ្ធផលសម្រាប់ "${query}" ទេ។ សូមព្យាយាមស្វែងរកពាក្យផ្សេងទៀត`
                : `No results match "${query}". Try searching with different keywords`}
            </p>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href={`/${locale}/search`}>
                <X className="w-4 h-4 mr-1" />
                {locale === "km" ? "សម្អាតការស្វែងរក" : "Clear search"}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-10">
            {/* ── Events Section (highlighted) ──────────────────── */}
            {eventsNews.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-school-gold-100 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-school-gold-500" />
                  </div>
                  <h2
                    className={`text-xl font-bold text-gray-900 ${locale === "km" ? "font-khmer" : ""}`}
                  >
                    {locale === "km" ? "ព្រឹត្តិការណ៍" : "Events"}
                  </h2>
                  <Badge variant="secondary" className="ml-1">
                    {eventsNews.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eventsNews.map((item) => {
                    const title = getLocalizedText(
                      item.title_km,
                      item.title_en,
                      locale
                    );
                    const excerpt = getExcerpt(
                      item.content_km,
                      item.content_en,
                      locale
                    );

                    return (
                      <Link
                        key={item.id}
                        href={`/${locale}/news/${item.slug}`}
                        className="group bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-school-blue-50 flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5 text-school-blue-700" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-400 mb-1">
                              {formatShortDate(
                                item.publish_date ?? item.created_at,
                                locale
                              )}
                            </p>
                            <h3
                              className={`font-semibold text-sm text-gray-900 group-hover:text-school-blue-800 transition-colors line-clamp-2 ${locale === "km" ? "font-khmer" : ""}`}
                            >
                              {title}
                            </h3>
                            {excerpt && (
                              <p
                                className={`text-xs text-gray-500 mt-1 line-clamp-2 ${locale === "km" ? "font-khmer" : ""}`}
                              >
                                {excerpt}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── News Section (non-events) ─────────────────────── */}
            {otherNews.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Newspaper className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2
                    className={`text-xl font-bold text-gray-900 ${locale === "km" ? "font-khmer" : ""}`}
                  >
                    {locale === "km" ? "ព័ត៌មាន" : "News"}
                  </h2>
                  <Badge variant="secondary" className="ml-1">
                    {otherNews.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {otherNews.map((item) => {
                    const title = getLocalizedText(
                      item.title_km,
                      item.title_en,
                      locale
                    );
                    const excerpt = getExcerpt(
                      item.content_km,
                      item.content_en,
                      locale
                    );
                    const categoryName = item.category
                      ? getLocalizedText(
                          item.category.name_km,
                          item.category.name_en,
                          locale
                        )
                      : null;

                    return (
                      <Link
                        key={item.id}
                        href={`/${locale}/news/${item.slug}`}
                        className="group bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          {item.featured_image ? (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                              <Image
                                src={item.featured_image}
                                alt={title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                              <Newspaper className="w-5 h-5 text-blue-600" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {categoryName && (
                                <span className="text-[10px] font-medium text-school-blue-700 bg-school-blue-50 px-1.5 py-0.5 rounded">
                                  {categoryName}
                                </span>
                              )}
                              <span className="text-[10px] text-gray-400">
                                {formatShortDate(
                                  item.publish_date ?? item.created_at,
                                  locale
                                )}
                              </span>
                            </div>
                            <h3
                              className={`font-semibold text-sm text-gray-900 group-hover:text-school-blue-800 transition-colors line-clamp-2 ${locale === "km" ? "font-khmer" : ""}`}
                            >
                              {title}
                            </h3>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-4">
                  <Link
                    href={`/${locale}/news?q=${encodeURIComponent(query)}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-school-blue-800 hover:gap-2 transition-all"
                  >
                    {locale === "km"
                      ? "មើលព័ត៌មានទាំងអស់"
                      : "View all news results"}{" "}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </section>
            )}

            {/* ── Achievements Section ──────────────────────────── */}
            {matchedAchievements.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-school-gold-100 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-school-gold-500" />
                  </div>
                  <h2
                    className={`text-xl font-bold text-gray-900 ${locale === "km" ? "font-khmer" : ""}`}
                  >
                    {locale === "km" ? "សមិទ្ធិផល" : "Achievements"}
                  </h2>
                  <Badge variant="secondary" className="ml-1">
                    {matchedAchievements.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matchedAchievements.map((item) => {
                    const title = getLocalizedText(
                      item.title_km,
                      item.title_en,
                      locale
                    );
                    const desc = getLocalizedText(
                      item.description_km,
                      item.description_en,
                      locale
                    );

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-school-gold-50 flex items-center justify-center shrink-0">
                            <Trophy className="w-5 h-5 text-school-gold-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              {item.award_level && (
                                <span className="text-[10px] font-medium text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded">
                                  {t(
                                    `achievements.${item.award_level}` as Parameters<
                                      typeof t
                                    >[0]
                                  )}
                                </span>
                              )}
                              {item.achievement_type && (
                                <span className="text-[10px] text-gray-400">
                                  {t(
                                    `achievements.${item.achievement_type}` as Parameters<
                                      typeof t
                                    >[0]
                                  )}
                                </span>
                              )}
                              {item.achievement_date && (
                                <span className="text-[10px] text-gray-400">
                                  {formatShortDate(
                                    item.achievement_date,
                                    locale
                                  )}
                                </span>
                              )}
                            </div>
                            <h3
                              className={`font-semibold text-sm text-gray-900 line-clamp-2 ${locale === "km" ? "font-khmer" : ""}`}
                            >
                              {title}
                            </h3>
                            {desc && (
                              <p
                                className={`text-xs text-gray-500 mt-1 line-clamp-2 ${locale === "km" ? "font-khmer" : ""}`}
                              >
                                {desc}
                              </p>
                            )}
                            {item.participant_name && (
                              <p className="text-xs text-school-blue-700 font-medium mt-1">
                                {item.participant_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4">
                  <Link
                    href={`/${locale}/achievements`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-school-blue-800 hover:gap-2 transition-all"
                  >
                    {locale === "km"
                      ? "មើលសមិទ្ធិផលទាំងអស់"
                      : "View all achievements"}{" "}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </section>
            )}

            {/* ── School Info Section ───────────────────────────── */}
            {matchedSchoolInfo.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <h2
                    className={`text-xl font-bold text-gray-900 ${locale === "km" ? "font-khmer" : ""}`}
                  >
                    {locale === "km" ? "ព័ត៌មានសាលា" : "About School"}
                  </h2>
                  <Badge variant="secondary" className="ml-1">
                    {matchedSchoolInfo.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matchedSchoolInfo.map((item) => {
                    const title = getLocalizedText(
                      item.title_km,
                      item.title_en,
                      locale
                    );
                    const content = getExcerpt(
                      item.content_km,
                      item.content_en,
                      locale
                    );

                    return (
                      <Link
                        key={item.id}
                        href={`/${locale}/about`}
                        className="group bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[10px] font-medium uppercase tracking-wider text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                                {item.section}
                              </span>
                            </div>
                            <h3
                              className={`font-semibold text-sm text-gray-900 group-hover:text-school-blue-800 transition-colors line-clamp-2 ${locale === "km" ? "font-khmer" : ""}`}
                            >
                              {title}
                            </h3>
                            {content && (
                              <p
                                className={`text-xs text-gray-500 mt-1 line-clamp-3 ${locale === "km" ? "font-khmer" : ""}`}
                              >
                                {content}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-4">
                  <Link
                    href={`/${locale}/about`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-school-blue-800 hover:gap-2 transition-all"
                  >
                    {locale === "km"
                      ? "មើលព័ត៌មានសាលាទាំងអស់"
                      : "View all about pages"}{" "}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </section>
            )}

            {/* ── Leadership Section ────────────────────────────── */}
            {matchedLeadership.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h2
                    className={`text-xl font-bold text-gray-900 ${locale === "km" ? "font-khmer" : ""}`}
                  >
                    {locale === "km" ? "ថ្នាក់ដឹកនាំ" : "Leadership"}
                  </h2>
                  <Badge variant="secondary" className="ml-1">
                    {matchedLeadership.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matchedLeadership.map((item) => {
                    const name = getLocalizedText(
                      item.name_km,
                      item.name_en,
                      locale
                    );
                    const position = getLocalizedText(
                      item.position_km,
                      item.position_en,
                      locale
                    );
                    const bio = getLocalizedText(
                      item.bio_km,
                      item.bio_en,
                      locale
                    );

                    return (
                      <Link
                        key={item.id}
                        href={`/${locale}/about`}
                        className="group bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                            <Shield className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3
                              className={`font-semibold text-sm text-gray-900 group-hover:text-school-blue-800 transition-colors ${locale === "km" ? "font-khmer" : ""}`}
                            >
                              {name}
                            </h3>
                            {position && (
                              <p
                                className={`text-xs text-school-blue-700 font-medium mt-0.5 ${locale === "km" ? "font-khmer" : ""}`}
                              >
                                {position}
                              </p>
                            )}
                            {bio && (
                              <p
                                className={`text-xs text-gray-500 mt-1 line-clamp-2 ${locale === "km" ? "font-khmer" : ""}`}
                              >
                                {bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-4">
                  <Link
                    href={`/${locale}/about`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-school-blue-800 hover:gap-2 transition-all"
                  >
                    {locale === "km"
                      ? "មើលថ្នាក់ដឹកនាំទាំងអស់"
                      : "View all leadership"}{" "}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </section>
            )}

            {/* ── Teachers Section ──────────────────────────────── */}
            {matchedTeachers.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <h2
                    className={`text-xl font-bold text-gray-900 ${locale === "km" ? "font-khmer" : ""}`}
                  >
                    {locale === "km" ? "គ្រូបង្រៀន" : "Teachers"}
                  </h2>
                  <Badge variant="secondary" className="ml-1">
                    {matchedTeachers.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matchedTeachers.map((item) => {
                    const name = getLocalizedText(
                      item.name_km,
                      item.name_en,
                      locale
                    );
                    const subject = getLocalizedText(
                      item.subject_km,
                      item.subject_en,
                      locale
                    );
                    const department = getLocalizedText(
                      item.department_km,
                      item.department_en,
                      locale
                    );

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3
                              className={`font-semibold text-sm text-gray-900 ${locale === "km" ? "font-khmer" : ""}`}
                            >
                              {name}
                            </h3>
                            {subject && (
                              <p
                                className={`text-xs text-school-blue-700 font-medium mt-0.5 ${locale === "km" ? "font-khmer" : ""}`}
                              >
                                {subject}
                              </p>
                            )}
                            {department && (
                              <p
                                className={`text-xs text-gray-400 mt-0.5 ${locale === "km" ? "font-khmer" : ""}`}
                              >
                                {department}
                              </p>
                            )}
                            {item.years_experience != null && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {locale === "km"
                                  ? `បទពិសោធន៍ ${item.years_experience} ឆ្នាំ`
                                  : `${item.years_experience} years experience`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4">
                  <Link
                    href={`/${locale}/about`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-school-blue-800 hover:gap-2 transition-all"
                  >
                    {locale === "km"
                      ? "មើលគ្រូទាំងអស់"
                      : "View all teachers"}{" "}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
