import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Calendar, Sparkles } from "lucide-react";
import { getCalendarEvents } from "@/actions/calendar";
import { getCurrentSchedule } from "@/actions/schedule";
import { generateScheduleEvents } from "@/utils/schedule-calendar";
import PublicCalendarClient from "./PublicCalendarClient";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("calendar");
  return { title: t("title") };
}

export default async function CalendarPage() {
  const locale = await getLocale();
  const t = await getTranslations("calendar");
  const now = new Date();
  const startDate = new Date(now.getFullYear() - 1, 0, 1).toISOString().split("T")[0];
  const endDate = new Date(now.getFullYear() + 1, 11, 31).toISOString().split("T")[0];

  const [dbEvents, schedule] = await Promise.all([
    getCalendarEvents(startDate, endDate),
    getCurrentSchedule(),
  ]);

  const scheduleEvents = generateScheduleEvents(schedule, startDate, endDate);
  const allEvents = [...dbEvents, ...scheduleEvents];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* ─── Clean Minimal Hero ─── */}
      <section className="relative bg-gradient-to-br from-school-blue-900 via-school-blue-800 to-school-blue-700 overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg viewBox="0 0 400 300" className="w-full h-full">
            <defs>
              <pattern id="hero-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#hero-grid)" />
          </svg>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-16 sm:py-20 lg:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-hero-fade-in-1 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-school-gold-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span className={locale === "km" ? "font-khmer" : ""}>{t("title")}</span>
              </div>
            </div>

            <h1 className="animate-hero-fade-in-2 text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 tracking-tight">
              {t("title")}
            </h1>

            <p className={`animate-hero-fade-in-3 text-white/60 text-sm sm:text-base max-w-lg mx-auto ${locale === "km" ? "font-khmer" : ""}`}>
              {t("subtitle")}
            </p>

            <div className="animate-hero-fade-in-4 mt-6 flex items-center justify-center gap-4 text-xs text-white/40">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {allEvents.length} {locale === "km" ? "ព្រឹត្តិការណ៍" : "events"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Calendar Content ─── */}
      <div className="h-[calc(100vh-5rem-12rem)]">
        <PublicCalendarClient events={allEvents} />
      </div>
    </div>
  );
}