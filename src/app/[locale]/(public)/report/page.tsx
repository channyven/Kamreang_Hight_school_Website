import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { createServerClient } from "@/lib/supabase";
import { dbToUiSchoolReport } from "@/lib/report-data";
import ReportClient from "@/components/public/report/ReportClient";
import type { SchoolReport as DbSchoolReport } from "@/types";
import type { Locale } from "@/i18n/config";
import { FileBarChart } from "lucide-react";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("report");
  return { title: t("title"), description: t("subtitle") };
}

export default async function ReportPage() {
  const t = await getTranslations("report");
  const locale = (await getLocale()) as Locale;

  // Fetch the latest published operations report from the database.
  const supabase = createServerClient();
  const { data: dbReport } = await supabase
    .from("school_reports")
    .select("*")
    .eq("is_published", true)
    .order("academic_year", { ascending: false })
    .limit(1)
    .maybeSingle();

  const report = dbToUiSchoolReport(dbReport as DbSchoolReport | null);

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

        {report ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-8">
            <ReportClient report={report} locale={locale} />
          </div>
        ) : (
          <NoReportPlaceholder locale={locale} />
        )}
      </div>
    </section>
  );
}

/** Shown when no published report exists in the database yet. */
function NoReportPlaceholder({ locale }: { locale: Locale }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 md:p-16">
      <div className="max-w-md mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 mb-6">
          <FileBarChart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {locale === "km"
            ? "របាយការណ៍មិនទាន់មានទេ"
            : "Report Not Available Yet"}
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          {locale === "km"
            ? "របាយការណ៍ប្រតិបត្តិការរបស់សាលាកំពុងត្រូវបានរៀបចំ។ សូមពិនិត្យមើលម្តងទៀតនៅពេលក្រោយ។"
            : "The school operations report is being prepared. Please check back later."}
        </p>
      </div>
    </div>
  );
}
