"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { format, isToday, isTomorrow, startOfWeek, endOfWeek, addDays } from "date-fns";
import type { CalendarEvent } from "@/types";
import { EVENT_CATEGORIES } from "@/types";

interface Props {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export default function UpcomingEvents({ events, onEventClick }: Props) {
  const locale = useLocale();
  const t = useTranslations("calendar");
  const km = locale === "km";
  const getTitle = (ev: CalendarEvent) => km ? (ev.title_km || ev.title) : (ev.title_en || ev.title);

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const tomorrowStr = format(addDays(today, 1), "yyyy-MM-dd");
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);

  const { todayEvents, tomorrowEvents, weekEvents } = useMemo(() => {
    const published = events.filter((e) => e.status === "published" || e.status === "draft");
    return {
      todayEvents: published.filter((e) => e.start_date <= todayStr && e.end_date >= todayStr),
      tomorrowEvents: published.filter((e) => e.start_date <= tomorrowStr && e.end_date >= tomorrowStr),
      weekEvents: published.filter((e) => {
        const d = new Date(e.start_date + "T00:00:00");
        return d >= weekStart && d <= weekEnd && !isToday(d) && !isTomorrow(d);
      }),
    };
  }, [events, todayStr, tomorrowStr, weekStart, weekEnd]);

  const sections = [
    { key: "today", label: t("todaysEvents"), items: todayEvents },
    { key: "tomorrow", label: t("tomorrow"), items: tomorrowEvents },
    { key: "week", label: t("thisWeek"), items: weekEvents },
  ];

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">
        {t("upcomingEvents")}
      </h3>
      <div className="space-y-3">
        {sections.map((section) => (
          section.items.length > 0 && (
            <div key={section.key}>
              <p className="text-[10px] font-medium text-gray-400 mb-1 uppercase">{section.label}</p>
              <div className="space-y-1">
                {section.items.slice(0, 3).map((ev) => {
                  const cat = EVENT_CATEGORIES.find((c) => c.key === ev.category);
                  return (
                    <button
                      key={ev.id}
                      onClick={() => onEventClick(ev)}
                      className="flex items-start gap-2 w-full text-left p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className="w-2 h-full min-h-[24px] rounded-full shrink-0 mt-0.5"
                        style={{ background: cat?.color }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate leading-tight">{getTitle(ev)}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{formattedDate(ev)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )
        ))}
        {todayEvents.length === 0 && tomorrowEvents.length === 0 && weekEvents.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">
            {t("noEvents")}
          </p>
        )}
      </div>
    </div>
  );
}

function formattedDate(ev: CalendarEvent): string {
  if (ev.is_all_day) {
    if (ev.start_date === ev.end_date) return ev.start_date;
    return `${ev.start_date} - ${ev.end_date}`;
  }
  return `${ev.start_date}${ev.start_time ? ` ${ev.start_time}` : ""}`;
}