import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("schedule");
  return { title: t("title") };
}

export default async function SchedulePage() {
  const t = await getTranslations("schedule");

  return (
    <section className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-school-blue-800">{t("title")}</h1>
        <p className="mt-2 text-gray-600">{t("subtitle")}</p>
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
          {t("subtitle")}
        </div>
      </div>
    </section>
  );
}
