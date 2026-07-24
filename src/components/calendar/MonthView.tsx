"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday,
  format,
} from "date-fns";
import type { CalendarEvent } from "@/types";
import { cn } from "@/utils";
import { toKhmerNumeral } from "@/utils";
import EventCard from "./EventCard";

interface Props {
  currentDate: Date;
  selectedDate: Date;
  events: CalendarEvent[];
  onSelectDate: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export default function MonthView({
  currentDate, selectedDate, events, onSelectDate, onEventClick,
}: Props) {
  const locale = useLocale();
  const t = useTranslations("calendar");
  const km = locale === "km";

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentDate]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((ev) => {
      const start = new Date(ev.start_date + "T00:00:00");
      const end = new Date(ev.end_date + "T00:00:00");
      for (let d = new Date(start); d <= end; d = new Date(d.getTime() + 86400000)) {
        const key = format(d, "yyyy-MM-dd");
        if (!map[key]) map[key] = [];
        map[key].push(ev);
      }
    });
    return map;
  }, [events]);

  const dayHeaders = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {dayHeaders.map((key) => (
          <div key={key} className="px-2 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase">
            {km
              ? ({ sun: "អា", mon: "ច", tue: "អ", wed: "ព", thu: "ព្រ", fri: "សុ", sat: "ស" } as Record<string, string>)[key]
              : t(key as "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat")
            }
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 flex-1">
        {days.map((day, i) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate[dateStr] ?? [];
          const isCurrent = isSameMonth(day, currentDate);
          const isSelected = isSameDay(day, selectedDate);
          const today = isToday(day);

          return (
            <div
              key={i}
              onClick={() => onSelectDate(day)}
              className={cn(
                "min-h-[100px] border-b border-r border-gray-100 p-1 cursor-pointer transition-colors",
                !isCurrent && "bg-gray-50/50",
                isSelected && "bg-blue-50/50",
                today && "bg-amber-50/30"
              )}
            >
              <div className="flex items-center justify-center mb-1">
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full",
                    today && !isSelected && "bg-school-blue-800 text-white",
                    isSelected && "bg-school-blue-800 text-white",
                    !today && !isSelected && "text-gray-700"
                  )}
                >
                  {km ? toKhmerNumeral(format(day, "d")) : format(day, "d")}
                </span>
              </div>
              <div className="space-y-0.5 max-h-[72px] overflow-y-auto scrollbar-thin">
                {dayEvents.slice(0, 3).map((ev) => (
                  <EventCard key={ev.id} event={ev} onClick={() => onEventClick(ev)} compact />
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-[10px] text-gray-400 text-center">
                    +{dayEvents.length - 3} {t("more")}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}