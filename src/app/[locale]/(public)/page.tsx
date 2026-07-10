import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import HeroSection from "@/components/public/home/HeroSection";
import StatsSection from "@/components/public/home/StatsSection";
import NewsSection from "@/components/public/home/NewsSection";
import AchievementsSection from "@/components/public/home/AchievementsSection";
import { getCurrentStatistics, getPublishedAchievements, getPublishedNews } from "@/lib/queries";
import { mockHeroSlides } from "@/lib/mock-data";
import type { News } from "@/types";

// Fallback images for the home page news cards only
const HOME_NEWS_IMAGES = [
  "/images/news/new1.png",
  "/images/news/new2.png",
  "/images/news/new4.png",
  "/images/news/new3.png",
  "/images/news/new5.png",
  "/images/news/new6.png",
];

function addFallbackImages(news: News[]): News[] {
  return news.map((item, i) => ({
    ...item,
    featured_image: item.featured_image || HOME_NEWS_IMAGES[i % HOME_NEWS_IMAGES.length],
  }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title:
      locale === "km"
        ? (process.env.NEXT_PUBLIC_SCHOOL_NAME_KM ?? "វិទ្យាល័យ")
        : (process.env.NEXT_PUBLIC_SCHOOL_NAME_EN ?? "High School"),
    description:
      locale === "km"
        ? "ស្វាគមន៍មកកាន់វិទ្យាល័យ"
        : "Welcome to our High School official website",
  };
}

export default async function HomePage() {
  const [stats, allNews, allAchievements] = await Promise.all([
    getCurrentStatistics(),
    getPublishedNews(),
    getPublishedAchievements(),
  ]);
  const news = addFallbackImages(allNews.slice(0, 6));
  const achievements = allAchievements.slice(0, 6);

  return (
    <>
      <HeroSection slides={mockHeroSlides} />
      <StatsSection stats={stats} />
      <NewsSection news={news} />
      <AchievementsSection achievements={achievements} />
    </>
  );
}
