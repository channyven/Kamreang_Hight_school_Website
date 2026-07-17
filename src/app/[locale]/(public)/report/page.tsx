import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { getPublishedSchoolReport } from "@/lib/queries";
import ReportClient from "@/components/public/report/ReportClient";
import type { Locale } from "@/i18n/config";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("report");
  return { title: t("title"), description: t("subtitle") };
}

export default async function ReportPage() {
  const t = await getTranslations("report");
  const locale = (await getLocale()) as Locale;
  const report = await getPublishedSchoolReport();

  return (
    <section className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Page header */}
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-school-gold-600 mb-2">
            {locale === "km" ? "របាយការណ៍" : "Report"}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-school-blue-900">{t("title")}</h1>
          <p className="mt-2 text-gray-600 max-w-2xl">{t("subtitle")}</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-8">
          <ReportClient report={report} locale={locale} />
        </div>
      </div>
    </section>
  );
}
