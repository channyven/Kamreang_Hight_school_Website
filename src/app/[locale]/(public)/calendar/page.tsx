import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
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
  const now = new Date();
  const startDate = new Date(now.getFullYear() - 1, 0, 1).toISOString().split("T")[0];
  const endDate = new Date(now.getFullYear() + 1, 11, 31).toISOString().split("T")[0];

  const [dbEvents, schedule] = await Promise.all([
    getCalendarEvents(startDate, endDate),
    getCurrentSchedule(),
  ]);

  const scheduleEvents = generateScheduleEvents(schedule, startDate, endDate);
  const allEvents = [...dbEvents, ...scheduleEvents];

  return <PublicCalendarClient events={allEvents} />;
}