import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getAboutPageData, getCurrentStatistics } from "@/lib/queries";
import AboutPageClient from "@/components/public/about/AboutPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return { title: t("title") };
}

export default async function AboutPage() {
  const locale = await getLocale();
  const [{ schoolInfo, leadership, teachers }, statistics] = await Promise.all([
    getAboutPageData(),
    getCurrentStatistics(),
  ]);

  return (
    <AboutPageClient
      schoolInfo={schoolInfo}
      leadership={leadership}
      teachers={teachers}
      statistics={statistics}
      locale={locale}
    />
  );
}
