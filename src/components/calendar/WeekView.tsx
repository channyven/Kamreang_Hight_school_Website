"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  startOfWeek, endOfWeek, eachDayOfInterval, isToday,
  format,
} from "date-fns";
import type { CalendarEvent } from "@/types";
import { cn } from "@/utils";
import { toKhmerNumeral } from "@/utils";
import EventCard from "./EventCard";

interface Props {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 6); // 6 AM to 7 PM

export default function WeekView({ currentDate, events, onEventClick }: Props) {
  const locale = useLocale();
  const t = useTranslations("calendar");
  const km = locale === "km";

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-8 border-b border-gray-200">
        <div className="px-2 py-2.5 text-center text-xs font-semibold text-gray-500 border-r border-gray-100">
          {t("time")}
        </div>
        {weekDays.map((day, i) => {
          const today = isToday(day);
          return (
            <div
              key={i}
              className={cn(
                "px-2 py-2.5 text-center border-r last:border-r-0",
                today && "bg-blue-50"
              )}
            >
              <p className={cn("text-xs font-semibold", today ? "text-school-blue-800" : "text-gray-500")}>
                {km
                  ? (["អា","ច","អ","ព","ព្រ","សុ","ស"][day.getDay()])
                  : format(day, "EEE")
                }
              </p>
              <p className={cn(
                "text-sm font-bold mt-0.5",
                today ? "text-school-blue-800" : "text-gray-700"
              )}>
                {km ? toKhmerNumeral(format(day, "d")) : format(day, "d")}
              </p>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="overflow-y-auto max-h-[600px]">
        {HOURS.map((hour) => {
          return (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-100 min-h-[48px]">
              <div className="px-2 py-1 text-[10px] text-gray-400 border-r border-gray-100 flex items-start justify-end pr-3">
                {km ? toKhmerNumeral(hour) : hour}:00
              </div>
              {weekDays.map((day, di) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const dayEvents = events
                  .filter((ev) => {
                    const start = new Date(ev.start_date + "T00:00:00");
                    const end = new Date(ev.end_date + "T00:00:00");
                    const d = new Date(dateStr + "T00:00:00");
                    return d >= start && d <= end;
                  })
                  .filter((ev) => {
                    if (ev.is_all_day) return false;
                    if (!ev.start_time) return false;
                    const evHour = parseInt(ev.start_time.split(":")[0]);
                    return evHour === hour || (evHour < hour && ev.end_time && parseInt(ev.end_time.split(":")[0]) >= hour);
                  });

                return (
                  <div
                    key={di}
                    className={cn(
                      "px-1 py-0.5 border-r last:border-r-0",
                      isToday(day) && "bg-blue-50/30"
                    )}
                  >
                    {dayEvents.map((ev) => (
                      <EventCard key={ev.id} event={ev} onClick={() => onEventClick(ev)} compact />
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}