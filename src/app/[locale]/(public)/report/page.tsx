import { ReportPageClient } from "./ReportPageClient";
import { getAboutPageData, getCurrentStatistics } from "@/lib/queries";

export default async function ReportPage() {
  const [aboutData, statsData] = await Promise.all([
    getAboutPageData(),
    getCurrentStatistics(),
  ]);

  return <ReportPageClient schoolData={aboutData} statistics={statsData} />;
}

export async function generateMetadata() {
  return {
    title: "School Operations Report",
    description: "Comprehensive school performance and information report",
  };
}
