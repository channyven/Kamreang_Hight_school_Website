import type { Metadata } from "next";
import Image from "next/image";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import {
  Newspaper,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { getPublishedNews, getNewsCategories } from "@/lib/queries";
import NewsContent from "./NewsContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("news");
  return { title: t("title") };
}

interface NewsPageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const locale = await getLocale();
  const t = await getTranslations("news");
  const params = await searchParams;
  const initialSlug = params.category ?? "";

  const { news: allNews, categories } = await getNewsData();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16">
      {/* ─── Hero Section ─── */}
      <section className="relative h-[50vh] min-h-[400px] max-h-[560px] overflow-hidden">
        <Image
          src="/images/home/hero-campus-morning.png"
          alt="School campus"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />

        {/* Khmer decorative pattern overlay */}
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
          className="absolute inset-0 w-full h-full opacity-[0.04]"
          style={{ backgroundSize: "120px 120px" }}
        >
          <defs>
            <pattern id="khmer-tile2" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <polygon points="30,4 56,30 30,56 4,30" stroke="white" strokeWidth="1.2" fill="none" />
              <polygon points="30,14 46,30 30,46 14,30" stroke="white" strokeWidth="0.8" fill="none" />
              <circle cx="30" cy="4" r="2" fill="white" />
              <circle cx="56" cy="30" r="2" fill="white" />
              <circle cx="30" cy="56" r="2" fill="white" />
              <circle cx="4" cy="30" r="2" fill="white" />
              <circle cx="30" cy="30" r="3" fill="white" />
              <line x1="30" y1="4" x2="30" y2="56" stroke="white" strokeWidth="0.4" opacity="0.5" />
              <line x1="4" y1="30" x2="56" y2="30" stroke="white" strokeWidth="0.4" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="120" height="120" fill="url(#khmer-tile2)" />
        </svg>

        {/* Animated floating orbs */}
        <div className="absolute top-[15%] left-[8%] w-[180px] h-[180px] rounded-full opacity-[0.08] pointer-events-none animate-orb-1"
          style={{ background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)" }} />
        <div className="absolute bottom-[20%] right-[12%] w-[220px] h-[220px] rounded-full opacity-[0.06] pointer-events-none animate-orb-2"
          style={{ background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)" }} />
        <div className="absolute top-[40%] right-[20%] w-[120px] h-[120px] rounded-full opacity-[0.05] pointer-events-none animate-orb-3"
          style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)" }} />
        <div className="absolute bottom-[30%] left-[20%] w-[150px] h-[150px] rounded-full opacity-[0.04] pointer-events-none animate-orb-4"
          style={{ background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)" }} />

        {/* Gold accent glowing orb */}
        <div className="absolute -top-24 -right-24 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(251,191,36,0.10) 0%, transparent 65%)" }} />

        {/* Dark overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              {/* Gold accent pill badge */}
              <div className="hero-fade-in-1">
                <div
                  className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mx-auto"
                  style={{ color: "#fbbf24", background: "rgba(251,191,36,0.08)" }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className={locale === "km" ? "font-khmer" : ""}>{t("title")}</span>
                </div>
              </div>

              {/* Khmer subtitle */}
              <div className="hero-fade-in-2">
                <p
                  className="text-lg md:text-xl mb-2 leading-relaxed tracking-wide font-khmer"
                  style={{ color: "#fbbf24" }}
                >
                  {locale === "km" ? "ព័ត៌មានថ្មីៗប្រចាំសាលា" : "ស្វាគមន៍មកកាន់ព័ត៌មានវិទ្យាល័យ"}
                </p>
              </div>

              {/* English heading */}
              <h1 className="hero-fade-in-3 text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] mb-6 tracking-tight">
                {t("title")}
              </h1>

              {/* Gold divider */}
              <div className="hero-fade-in-3 w-16 h-0.5 rounded-full mb-6 mx-auto" style={{ background: "#fbbf24" }} />

              {/* Subtitle */}
              <p
                className={`hero-fade-in-4 text-white/70 text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto ${
                  locale === "km" ? "font-khmer" : ""
                }`}
              >
                {t("subtitle")}
              </p>

              {/* Quick stats */}
              <div className="hero-fade-in-4 flex flex-wrap items-center justify-center gap-6">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Newspaper className="w-4 h-4" style={{ color: "#fbbf24" }} />
                  <span className="text-sm text-white/80">
                    <strong className="text-white font-semibold">{allNews.length}</strong>{" "}
                    {locale === "km" ? "អត្ថបទ" : "articles"}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <TrendingUp className="w-4 h-4" style={{ color: "#fbbf24" }} />
                  <span className="text-sm text-white/80">
                    <strong className="text-white font-semibold">{categories.length}</strong>{" "}
                    {locale === "km" ? "ប្រភេទ" : "categories"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wavy bottom divider */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
          <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0 56L1440 56L1440 16C1200 48 960 60 720 44C480 28 240 0 0 16L0 56Z" fill="rgb(249 250 251)" />
          </svg>
        </div>
      </section>

      {/* ─── Client-side Content (real-time category filtering) ─── */}
      <NewsContent
        allNews={allNews}
        categories={categories}
        locale={locale}
        t={{
          title: t("title"),
          subtitle: t("subtitle"),
          read_more: t("read_more"),
          featured: t("featured"),
          no_results: t("no_results"),
        }}
        initialSlug={initialSlug}
      />
    </div>
  );
}

// Keep the data fetching function outside the component
async function getNewsData() {
  const [news, categories] = await Promise.all([
    getPublishedNews(),
    getNewsCategories(),
  ]);
  return { news, categories };
}
