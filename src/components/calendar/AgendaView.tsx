"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { format } from "date-fns";
import type { CalendarEvent } from "@/types";
import { EVENT_CATEGORIES } from "@/types";
import { toKhmerNumeral } from "@/utils";
import CategoryBadge from "./CategoryBadge";

interface Props {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export default function AgendaView({ events, onEventClick }: Props) {
  const locale = useLocale();
  const t = useTranslations("calendar");
  const km = locale === "km";

  const groupedEvents = useMemo(() => {
    const sorted = [...events].sort(
      (a, b) => a.start_date.localeCompare(b.start_date) || (a.start_time ?? "").localeCompare(b.start_time ?? "")
    );
    const groups: Record<string, CalendarEvent[]> = {};
    sorted.forEach((ev) => {
      if (!groups[ev.start_date]) groups[ev.start_date] = [];
      groups[ev.start_date].push(ev);
    });
    return groups;
  }, [events]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    if (km) {
      return `${["អាទិត្យ","ច័ន្ទ","អង្គារ","ពុធ","ព្រហស្បតិ៍","សុក្រ","សៅរ៍"][d.getDay()]} ${toKhmerNumeral(d.getDate())} ${["មករា","កុម្ភៈ","មីនា","មេសា","ឧសភា","មិថុនា","កក្កដា","សីហា","កញ្ញា","តុលា","វិច្ឆិកា","ធ្នូ"][d.getMonth()]} ${toKhmerNumeral(d.getFullYear())}`;
    }
    return format(d, "EEEE, MMMM d, yyyy");
  };

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-sm">{t("noEvents")}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="space-y-6 p-4">
        {Object.entries(groupedEvents).map(([dateStr, dateEvents]) => (
          <div key={dateStr}>
            <h3 className="text-sm font-bold text-gray-800 mb-3 pb-1 border-b border-gray-100">
              {formatDate(dateStr)}
              <span className="text-xs font-normal text-gray-400 ml-2">
                {dateEvents.length} {t("events")}
              </span>
            </h3>
            <div className="space-y-2">
              {dateEvents.map((ev) => {
                const cat = EVENT_CATEGORIES.find((c) => c.key === ev.category);
                return (
                  <button
                    key={ev.id}
                    onClick={() => onEventClick(ev)}
                    className="flex items-start gap-3 w-full text-left p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                  >
                    <div
                      className="w-1 h-12 rounded-full shrink-0 mt-0.5"
                      style={{ background: cat?.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{ev.title}</p>
                        {ev.is_featured && (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0">
                            {t("featured")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <CategoryBadge category={ev.category} />
                        {!ev.is_all_day && ev.start_time && (
                          <span className="text-[11px] text-gray-400">
                            {ev.start_time}{ev.end_time ? ` - ${ev.end_time}` : ""}
                          </span>
                        )}
                        {ev.location && (
                          <span className="text-[11px] text-gray-400 truncate">• {ev.location}</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}