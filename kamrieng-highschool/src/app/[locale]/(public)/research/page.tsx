import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatShortDate,
  formatNumber,
  getLocalizedText,
  truncate,
  stripHtml,
} from "@/lib/utils";
import {
  FlaskConical,
  BookOpen,
  Microscope,
  Globe,
  Lightbulb,
  ArrowRight,
  Search,
  Users,
  Newspaper,
  Trophy,
  Calendar,
  X,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { getPublishedNews, getNewsCategories, getPublishedAchievements } from "@/lib/queries";
import type { News, Achievement } from "@/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("research");
  return { title: t("title") };
}

// ─── Static data ────────────────────────────────────────────────

const RESEARCH_AREAS = [
  {
    icon: Microscope,
    title_en: "STEM & Technology",
    title_km: "STEM និងបច្ចេកវិទ្យា",
    desc_en:
      "Exploring innovations in science, technology, engineering, and mathematics through hands-on projects and competitions.",
    desc_km:
      "ស្វែងយល់ពីការច្នៃប្រឌិតផ្នែកវិទ្យាសាស្ត្រ បច្ចេកវិទ្យា វិស្វកម្ម និងគណិតវិទ្យា តាមរយៈគម្រោង និងការប្រកួតប្រជែង",
    color: "bg-blue-100 text-blue-700",
    iconColor: "text-blue-600",
  },
  {
    icon: BookOpen,
    title_en: "Khmer Literature & Linguistics",
    title_km: "អក្សរសាស្ត្រ និងភាសាវិទ្យាខ្មែរ",
    desc_en:
      "Preserving and advancing Khmer language, classical poetry, and literary heritage through academic study.",
    desc_km:
      "ការថែរក្សា និងអភិវឌ្ឍភាសាខ្មែរ កំណាព្យបុរាណ និងមរតកអក្សរសាស្ត្រ តាមរយៈការសិក្សាស្រាវជ្រាវ",
    color: "bg-amber-100 text-amber-700",
    iconColor: "text-amber-600",
  },
  {
    icon: Globe,
    title_en: "Social Sciences & Community",
    title_km: "វិទ្យាសាស្ត្រសង្គម និងសហគមន៍",
    desc_en:
      "Researching Cambodian society, history, geography, and community development to foster cultural understanding.",
    desc_km:
      "ការស្រាវជ្រាវអំពីសង្គមកម្ពុជា ប្រវត្តិសាស្ត្រ ភូមិសាស្ត្រ និងការអភិវឌ្ឍសហគមន៍",
    color: "bg-green-100 text-green-700",
    iconColor: "text-green-600",
  },
  {
    icon: Lightbulb,
    title_en: "Environmental Studies",
    title_km: "ការសិក្សាបរិស្ថាន",
    desc_en:
      "Investigating local ecosystems, sustainable agriculture, and climate resilience in rural Cambodia.",
    desc_km:
      "ការសិក្សាអំពីប្រព័ន្ធអេកូឡូស៊ីក្នុងស្រុក កសិកម្មប្រកបដោយចីរភាព និងការសម្របខ្លួនទៅនឹងបម្រែបម្រួលអាកាសធាតុ",
    color: "bg-emerald-100 text-emerald-700",
    iconColor: "text-emerald-600",
  },
  {
    icon: Users,
    title_en: "Education & Pedagogy",
    title_km: "ការអប់រំ និងគរុកោសល្យ",
    desc_en:
      "Studying teaching methodologies, curriculum development, and inclusive education practices.",
    desc_km:
      "ការសិក្សាអំពីវិធីសាស្រ្តបង្រៀន ការអភិវឌ្ឍកម្មវិធីសិក្សា និងការអនុវត្តការអប់រំរួមបញ្ចូល",
    color: "bg-purple-100 text-purple-700",
    iconColor: "text-purple-600",
  },
  {
    icon: FlaskConical,
    title_en: "Health & Life Sciences",
    title_km: "វិទ្យាសាស្ត្រសុខាភិបាល និងជីវិត",
    desc_en:
      "Exploring public health, nutrition, and life sciences relevant to Cambodian communities.",
    desc_km:
      "ការស្វែងយល់ពីសុខភាពសាធារណៈ អាហារូបត្ថម្ភ និងវិទ្យាសាស្ត្រជីវិតដែលពាក់ព័ន្ធនឹងសហគមន៍កម្ពុជា",
    color: "bg-rose-100 text-rose-700",
    iconColor: "text-rose-600",
  },
];

const FEATURED_PROJECTS = [
  {
    title_en: "Smart Irrigation System for Rice Farmers",
    title_km: "ប្រព័ន្ធស្រោចស្រពឆ្លាតវៃសម្រាប់កសិករស្រូវ",
    author_en: "Student Research Team — Grade 12",
    author_km: "ក្រុមស្រាវជ្រាវសិស្ស — ថ្នាក់ទី ១២",
    desc_en:
      "An IoT-based prototype that monitors soil moisture and automates water distribution, reducing water usage by 35% in field tests.",
    desc_km:
      "គំរូដើមដែលប្រើ IoT ដើម្បីតាមដានសំណើមដី និងចែកចាយទឹកដោយស្វ័យប្រវត្តិ កាត់បន្ថយការប្រើប្រាស់ទឹក ៣៥%",
  },
  {
    title_en: "Khmer Script Handwriting Recognition",
    title_km: "ការស្គាល់សរសេរដៃជាអក្សរខ្មែរ",
    author_en: "Student Research Team — Grade 11",
    author_km: "ក្រុមស្រាវជ្រាវសិស្ស — ថ្នាក់ទី ១១",
    desc_en:
      "Training a neural network to digitize handwritten Khmer manuscripts, achieving 92% accuracy on historical documents.",
    desc_km:
      "ការបណ្តុះបណ្តាលបណ្តាញសរសៃប្រសាទ ដើម្បីឌីជីថលឯកសារសរសេរដៃជាភាសាខ្មែរ សម្រេចបានភាពត្រឹមត្រូវ ៩២%",
  },
  {
    title_en: "Biodiversity Survey of Local Wetlands",
    title_km: "ការស្ទង់មតិជីវចម្រុះនៃតំបន់ដីសើមក្នុងស្រុក",
    author_en: "Student Research Team — Grade 10",
    author_km: "ក្រុមស្រាវជ្រាវសិស្ស — ថ្នាក់ទី ១០",
    desc_en:
      "A field study cataloging over 120 species of flora and fauna in the wetlands surrounding our province.",
    desc_km:
      "ការសិក្សាវាលដែលចងក្រងប្រភេទរុក្ខជាតិ និងសត្វជាង ១២០ ប្រភេទ នៅតំបន់ដីសើមជុំវិញខេត្តរបស់យើង",
  },
];

// ─── Search helpers ─────────────────────────────────────────────

function matchesNews(item: News, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return false;
  const haystack = [
    item.title_km,
    item.title_en,
    item.excerpt_km,
    item.excerpt_en,
    item.content_km,
    item.content_en,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function matchesAchievement(item: Achievement, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return false;
  const haystack = [
    item.title_km,
    item.title_en,
    item.description_km,
    item.description_en,
    item.participant_name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

interface SearchResult {
  type: "news" | "achievement" | "research_area" | "featured_project";
  title: string;
  excerpt: string;
  date?: string;
  url: string;
  badge?: string;
  badgeVariant?: "default" | "info" | "warning" | "outline" | "success";
  image?: string;
  /** Used for research areas to show a color icon */
  iconColor?: string;
}

function isQueryMatch(fields: (string | null | undefined)[], query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return false;
  return fields.filter(Boolean).join(" ").toLowerCase().includes(q);
}

async function getSearchResults(
  query: string,
  categorySlug: string,
  locale: string
): Promise<{
  results: SearchResult[];
  newsCount: number;
  achievementCount: number;
  areaCount: number;
  projectCount: number;
}> {
  const [allNews, allAchievements, categories] = await Promise.all([
    getPublishedNews(),
    getPublishedAchievements(),
    getNewsCategories(),
  ]);

  // Filter news by category if specified
  let filteredNews = allNews;
  if (categorySlug) {
    const cat = categories.find((c) => c.slug === categorySlug);
    if (cat) filteredNews = filteredNews.filter((n) => n.category_id === cat.id);
  }

  // Apply search
  const matchingNews = query
    ? filteredNews.filter((n) => matchesNews(n, query))
    : filteredNews;
  const matchingAchievements = query
    ? allAchievements.filter((a) => matchesAchievement(a, query))
    : [];

  // Match research areas
  const matchingAreas = RESEARCH_AREAS.filter((a) =>
    isQueryMatch([a.title_en, a.title_km, a.desc_en, a.desc_km], query)
  );

  // Match featured projects
  const matchingProjects = FEATURED_PROJECTS.filter((p) =>
    isQueryMatch([p.title_en, p.title_km, p.desc_en, p.desc_km, p.author_en, p.author_km], query)
  );

  // Build results
  const results: SearchResult[] = [
    ...matchingNews.map((n) => ({
      type: "news" as const,
      title: getLocalizedText(n.title_km, n.title_en, locale),
      excerpt: truncate(
        stripHtml(
          getLocalizedText(n.excerpt_km || n.content_km, n.excerpt_en || n.content_en, locale)
        ),
        200
      ),
      date: n.publish_date ?? n.created_at,
      url: `/${locale}/news/${n.slug}`,
      badge: n.category
        ? getLocalizedText(n.category.name_km, n.category.name_en, locale)
        : undefined,
      badgeVariant: "info" as const,
      image: n.featured_image,
    })),
    ...matchingAchievements.map((a) => ({
      type: "achievement" as const,
      title: getLocalizedText(a.title_km, a.title_en, locale),
      excerpt: truncate(
        stripHtml(getLocalizedText(a.description_km, a.description_en, locale)),
        200
      ),
      date: a.achievement_date,
      url: `/${locale}/achievements`,
      badge: a.award_level
        ? a.award_level.charAt(0).toUpperCase() + a.award_level.slice(1)
        : undefined,
      badgeVariant: "warning" as const,
    })),
    ...matchingAreas.map((a) => ({
      type: "research_area" as const,
      title: getLocalizedText(a.title_km, a.title_en, locale),
      excerpt: truncate(getLocalizedText(a.desc_km, a.desc_en, locale), 200),
      url: `/${locale}/research`,
      badge: locale === "km" ? "ផ្នែកស្រាវជ្រាវ" : "Research Area",
      badgeVariant: "default" as const,
      iconColor: a.iconColor,
    })),
    ...matchingProjects.map((p) => ({
      type: "featured_project" as const,
      title: getLocalizedText(p.title_km, p.title_en, locale),
      excerpt: truncate(getLocalizedText(p.desc_km, p.desc_en, locale), 200),
      url: `/${locale}/research`,
      badge: locale === "km" ? "គម្រោង" : "Project",
      badgeVariant: "success" as const,
    })),
  ];

  // Sort: items with dates sort by date desc, static items keep order
  results.sort((a, b) => {
    if (a.date && b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (a.date) return -1;
    if (b.date) return 1;
    // Among static items, research areas come before projects
    if (a.type === "research_area" && b.type === "featured_project") return -1;
    if (a.type === "featured_project" && b.type === "research_area") return 1;
    return 0;
  });

  return {
    results,
    newsCount: matchingNews.length,
    achievementCount: matchingAchievements.length,
    areaCount: matchingAreas.length,
    projectCount: matchingProjects.length,
  };
}

// ─── Build query string helper ──────────────────────────────────

function buildQueryString(params: {
  q?: string;
  category?: string;
}): string {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", params.category);
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

// ─── Page component ─────────────────────────────────────────────

interface ResearchPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function ResearchPage({ searchParams }: ResearchPageProps) {
  const locale = await getLocale();
  const t = await getTranslations("research");
  const params = await searchParams;
  const query = params.q ?? "";
  const categorySlug = params.category ?? "";
  const km = locale === "km";
  const hasSearch = !!query || !!categorySlug;

  // Fetch data for search or static sections
  const categories = await getNewsCategories();

  let searchData: Awaited<ReturnType<typeof getSearchResults>> | null = null;
  if (hasSearch) {
    searchData = await getSearchResults(query, categorySlug, locale);
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* ── Hero with Search ── */}
      <section
        className="py-14 md:py-20"
        style={{
          background: "linear-gradient(135deg, #0a1628 0%, #1a3a5c 55%, #0f2847 100%)",
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <div
            className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border text-xs font-semibold tracking-wider uppercase"
            style={{
              borderColor: "rgba(253,188,19,0.5)",
              color: "#fdbc13",
              background: "rgba(253,188,19,0.12)",
            }}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            {km ? "ស្រាវជ្រាវ" : "RESEARCH & DISCOVER"}
          </div>
          <h1 className={`text-4xl font-bold text-white mb-3 ${km ? "font-khmer" : ""}`}>
            {t("title")}
          </h1>
          <p className={`text-school-blue-200 max-w-2xl mx-auto mb-8 ${km ? "font-khmer" : ""}`}>
            {t("subtitle")}
          </p>

          {/* Search bar */}
          <form
            action={`/${locale}/research`}
            method="GET"
            role="search"
            className="max-w-xl mx-auto relative"
          >
            {categorySlug && (
              <input type="hidden" name="category" value={categorySlug} />
            )}
            <div className="relative flex items-center">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
              <input
                name="q"
                type="search"
                defaultValue={query}
                placeholder={
                  km
                    ? "ស្វែងរកព័ត៌មាន សមិទ្ធផល និងផ្នែកស្រាវជ្រាវ..."
                    : "Search news, achievements, research areas..."
                }
                aria-label={
                  km ? "ស្វែងរកមាតិកាសាលា" : "Search school content"
                }
                className="w-full h-14 pl-12 pr-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 text-base outline-none focus:ring-2 focus:ring-school-gold-500/50 focus:bg-white/15 transition-all"
              />
              {query && (
                <Link
                  href={`/${locale}/research${buildQueryString({ category: categorySlug })}`}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  aria-label={km ? "លុបការស្វែងរក" : "Clear search"}
                >
                  <X className="w-5 h-5" />
                </Link>
              )}
            </div>
          </form>

          {/* News category quick links */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Link href={`/${locale}/research`}>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  !categorySlug && !query
                    ? "bg-school-gold-500/20 text-school-gold-300 border-school-gold-500/40"
                    : "text-white/60 border-white/20 hover:text-white hover:border-white/40"
                }`}
              >
                {km ? "ទាំងអស់" : "All Topics"}
              </span>
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/${locale}/research${buildQueryString({
                  q: query,
                  category: categorySlug === cat.slug ? "" : cat.slug,
                })}`}
              >
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    categorySlug === cat.slug
                      ? "bg-school-gold-500/20 text-school-gold-300 border-school-gold-500/40"
                      : "text-white/60 border-white/20 hover:text-white hover:border-white/40"
                  }`}
                >
                  {getLocalizedText(cat.name_km, cat.name_en, locale)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Search Results / Content ── */}
      <div className="container mx-auto px-4 py-10">
        {hasSearch && searchData ? (
          <>
            {/* Search summary */}
            <div className="mb-8">
              <p className={`text-sm text-gray-500 ${km ? "font-khmer" : ""}`}>
                {km
                  ? `បានរកឃើញ ${formatNumber(searchData.results.length, locale)} លទ្ធផល${query ? ` សម្រាប់ "${query}"` : ""}`
                  : `Found ${searchData.results.length} result${searchData.results.length === 1 ? "" : "s"}${query ? ` for "${query}"` : ""}`}
              </p>
              {(searchData.newsCount > 0 || searchData.achievementCount > 0 || searchData.areaCount > 0 || searchData.projectCount > 0) && (
                <div className="flex flex-wrap gap-3 mt-2">
                  {searchData.newsCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      <Newspaper className="w-3 h-3" />
                      {km
                        ? `${formatNumber(searchData.newsCount, locale)} ព័ត៌មាន`
                        : `${searchData.newsCount} News`}
                    </span>
                  )}
                  {searchData.achievementCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                      <Trophy className="w-3 h-3" />
                      {km
                        ? `${formatNumber(searchData.achievementCount, locale)} សមិទ្ធផល`
                        : `${searchData.achievementCount} Achievement${searchData.achievementCount === 1 ? "" : "s"}`}
                    </span>
                  )}
                  {searchData.areaCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                      <FlaskConical className="w-3 h-3" />
                      {km
                        ? `${formatNumber(searchData.areaCount, locale)} ផ្នែកស្រាវជ្រាវ`
                        : `${searchData.areaCount} Research Area${searchData.areaCount === 1 ? "" : "s"}`}
                    </span>
                  )}
                  {searchData.projectCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                      <Lightbulb className="w-3 h-3" />
                      {km
                        ? `${formatNumber(searchData.projectCount, locale)} គម្រោង`
                        : `${searchData.projectCount} Project${searchData.projectCount === 1 ? "" : "s"}`}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Results grid */}
            {searchData.results.length === 0 ? (
              <div className="text-center py-20">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className={`text-lg font-medium text-gray-500 mb-1 ${km ? "font-khmer" : ""}`}>
                  {km ? "មិនមានលទ្ធផល" : "No results found"}
                </p>
                {query && (
                  <p className={`text-sm text-gray-400 ${km ? "font-khmer" : ""}`}>
                    {km
                      ? "សូមព្យាយាមស្វែងរកពាក្យផ្សេងទៀត ឬលុបតម្រង"
                      : "Try different keywords or clear your filters"}
                  </p>
                )}
                <Link href={`/${locale}/research`}>
                  <Button variant="outline" className="mt-6">
                    {km ? "ត្រឡប់ទៅទំព័រដើម" : "Browse all content"}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {searchData.results.map((result, i) => (
                  <Link key={`${result.type}-${i}`} href={result.url}>
                    <article className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                      {/* Thumbnail area */}
                      {result.type === "news" && result.image ? (
                        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                          <Image
                            src={result.image}
                            alt={result.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (() => {
                        const iconMap: Record<string, { icon: typeof Newspaper; gradient: string }> = {
                          news: { icon: Newspaper, gradient: "bg-gradient-to-br from-blue-50 to-blue-100" },
                          achievement: { icon: Trophy, gradient: "bg-gradient-to-br from-amber-50 to-amber-100" },
                          research_area: { icon: FlaskConical, gradient: "bg-gradient-to-br from-purple-50 to-purple-100" },
                          featured_project: { icon: Lightbulb, gradient: "bg-gradient-to-br from-green-50 to-green-100" },
                        };
                        const info = iconMap[result.type] ?? iconMap.news;
                        const IconComp = info.icon;
                        const iconColors: Record<string, string> = {
                          news: "text-blue-300",
                          achievement: "text-amber-300",
                          research_area: result.iconColor ?? "text-purple-300",
                          featured_project: "text-green-300",
                        };
                        return (
                          <div className={`aspect-[16/9] flex items-center justify-center ${info.gradient}`}>
                            <IconComp className={`w-12 h-12 ${iconColors[result.type] ?? "text-gray-300"}`} />
                          </div>
                        );
                      })()}

                      <div className="p-5 flex-1 flex flex-col">
                        {/* Badge row */}
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={
                              result.type === "news" ? "info" :
                              result.type === "achievement" ? "warning" :
                              result.type === "research_area" ? "default" :
                              "success"
                            }
                            className="text-[10px] uppercase tracking-wider"
                          >
                            {result.type === "news"
                              ? km ? "ព័ត៌មាន" : "News"
                              : result.type === "achievement"
                                ? km ? "សមិទ្ធផល" : "Achievement"
                                : result.type === "research_area"
                                  ? km ? "ផ្នែកស្រាវជ្រាវ" : "Research"
                                  : km ? "គម្រោង" : "Project"}
                          </Badge>
                          {result.badge && (
                            <Badge variant="outline" className="text-[10px]">
                              {result.badge}
                            </Badge>
                          )}
                        </div>

                        {/* Title */}
                        <h3
                          className={`font-semibold text-gray-900 text-sm leading-snug mb-2 group-hover:text-school-blue-800 transition-colors line-clamp-2 ${km ? "font-khmer" : ""}`}
                        >
                          {result.title}
                        </h3>

                        {/* Excerpt */}
                        <p
                          className={`text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3 flex-1 ${km ? "font-khmer" : ""}`}
                        >
                          {result.excerpt}
                        </p>

                        {/* Date */}
                        {result.date && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-auto">
                            <Calendar className="w-3 h-3" />
                            {formatShortDate(result.date, locale)}
                          </div>
                        )}
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* ── Research Areas (shown when no active search) ── */}
            <section className="mb-16">
              <div className="text-center mb-10">
                <h2 className={`text-3xl font-bold text-gray-900 mb-2 ${km ? "font-khmer" : ""}`}>
                  {t("categories_title")}
                </h2>
                <p className={`text-gray-500 max-w-xl mx-auto ${km ? "font-khmer" : ""}`}>
                  {t("categories_desc")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {RESEARCH_AREAS.map((area, i) => {
                  const Icon = area.icon;
                  return (
                    <div
                      key={i}
                      className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      <div
                        className={`w-12 h-12 rounded-xl ${area.color} flex items-center justify-center mb-4`}
                      >
                        <Icon className={`w-6 h-6 ${area.iconColor}`} />
                      </div>
                      <h3 className={`font-semibold text-gray-900 mb-2 ${km ? "font-khmer" : ""}`}>
                        {km ? area.title_km : area.title_en}
                      </h3>
                      <p className={`text-sm text-gray-500 leading-relaxed ${km ? "font-khmer" : ""}`}>
                        {km ? area.desc_km : area.desc_en}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ── News Categories Discovery ── */}
            <section className="mb-16">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 text-school-gold-500 font-semibold text-sm uppercase tracking-wider mb-2">
                  <Newspaper className="w-4 h-4" />
                  {km ? "រុករកតាមប្រភេទ" : "BROWSE BY CATEGORY"}
                </div>
                <h2 className={`text-3xl font-bold text-gray-900 mb-2 ${km ? "font-khmer" : ""}`}>
                  {km ? "ព័ត៌មានតាមប្រភេទ" : "News by Category"}
                </h2>
                <p className={`text-gray-500 max-w-xl mx-auto text-sm ${km ? "font-khmer" : ""}`}>
                  {km
                    ? "ស្វែងរកព័ត៌មាន និងព្រឹត្តិការណ៍តាមប្រភេទផ្សេងៗ"
                    : "Discover news, events, and announcements organized by topic"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((cat) => {
                  const name = getLocalizedText(cat.name_km, cat.name_en, locale);
                  const CATEGORY_ICONS: Record<string, typeof Newspaper> = {
                    announcement: Newspaper,
                    events: Calendar,
                    science: Microscope,
                    sports: TrendingUp,
                  };
                  const Icon = CATEGORY_ICONS[cat.slug] ?? Newspaper;
                  return (
                    <Link
                      key={cat.id}
                      href={`/${locale}/research?category=${cat.slug}`}
                    >
                      <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-school-blue-100 text-school-blue-700 flex items-center justify-center mx-auto mb-3 group-hover:bg-school-blue-800 group-hover:text-white transition-colors">
                          <Icon className="w-6 h-6" />
                        </div>
                        <h3 className={`font-semibold text-gray-900 text-sm ${km ? "font-khmer" : ""}`}>
                          {name}
                        </h3>
                        <p className="text-xs text-school-blue-600 mt-1 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                          {km ? "ស្វែងរក" : "Browse"}{" "}
                          <ChevronRight className="w-3 h-3" />
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* ── Featured Research ── */}
            <section className="mb-16">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-school-gold-500 font-semibold text-sm uppercase tracking-wider">
                    {t("featured_title")}
                  </p>
                  <h2 className={`text-3xl font-bold text-gray-900 mt-1 ${km ? "font-khmer" : ""}`}>
                    {km ? "គម្រោងលេចធ្លោ" : "Featured Projects"}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {FEATURED_PROJECTS.map((project, i) => (
                  <article
                    key={i}
                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="info" className="text-xs">
                        {km ? "គម្រោងសិស្ស" : "Student Project"}
                      </Badge>
                    </div>
                    <h3
                      className={`font-semibold text-gray-900 text-sm mb-2 group-hover:text-school-blue-800 transition-colors ${km ? "font-khmer" : ""}`}
                    >
                      {km ? project.title_km : project.title_en}
                    </h3>
                    <p
                      className={`text-xs font-medium text-gray-400 mb-3 flex items-center gap-1 ${km ? "font-khmer" : ""}`}
                    >
                      <Users className="w-3 h-3" />
                      {km ? project.author_km : project.author_en}
                    </p>
                    <p
                      className={`text-xs text-gray-500 leading-relaxed ${km ? "font-khmer" : ""}`}
                    >
                      {km ? project.desc_km : project.desc_en}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ── CTA ── */}
        <section
          className="rounded-2xl p-10 text-center"
          style={{
            background: "linear-gradient(135deg, #00376f 0%, #1e4e8c 100%)",
          }}
        >
          <FlaskConical
            className="w-10 h-10 mx-auto mb-4 opacity-60"
            style={{ color: "#fdbc13" }}
          />
          <h2 className={`text-2xl font-bold text-white mb-3 ${km ? "font-khmer" : ""}`}>
            {km ? "ចូលរួមក្នុងការស្រាវជ្រាវ" : "Participate in Research"}
          </h2>
          <p className={`text-school-blue-200 max-w-lg mx-auto mb-6 text-sm ${km ? "font-khmer" : ""}`}>
            {km
              ? "សិស្ស និងគ្រូទាំងអស់ត្រូវបានលើកទឹកចិត្តឱ្យចូលរួមក្នុងគម្រោងស្រាវជ្រាវ"
              : "All students and teachers are encouraged to participate in research projects and contribute to our growing body of knowledge."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="gold" size="lg" className="font-semibold">
              <Link href={`/${locale}/contact`}>
                {km ? "ទាក់ទងមកយើង" : "Contact Our Team"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-white/10 border text-white hover:bg-white/20 backdrop-blur-sm"
              style={{ borderColor: "rgba(255,255,255,0.25)" }}
            >
              <Link href={`/${locale}/news`}>
                <Search className="mr-2 w-4 h-4" />
                {km ? "ស្វែងរកការស្រាវជ្រាវ" : "Browse Publications"}
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}