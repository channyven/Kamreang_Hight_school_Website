"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { format, isToday } from "date-fns";
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

export default function DayView({ currentDate, events, onEventClick }: Props) {
  const locale = useLocale();
  const t = useTranslations("calendar");
  const km = locale === "km";
  const dateStr = format(currentDate, "yyyy-MM-dd");

  const dayEvents = useMemo(
    () => events.filter((ev) => {
      return ev.start_date <= dateStr && ev.end_date >= dateStr;
    }),
    [events, dateStr]
  );

  const allDayEvents = dayEvents.filter((ev) => ev.is_all_day);
  const timedEvents = dayEvents.filter((ev) => !ev.is_all_day);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Date header */}
      <div className={cn("px-4 py-3 border-b border-gray-200", isToday(currentDate) && "bg-blue-50")}>
        <p className={cn("text-lg font-bold", isToday(currentDate) ? "text-school-blue-800" : "text-gray-900")}>
          {km
            ? `${["អាទិត្យ","ច័ន្ទ","អង្គារ","ពុធ","ព្រហស្បតិ៍","សុក្រ","សៅរ៍"][currentDate.getDay()]} ${toKhmerNumeral(currentDate.getDate())} ${["មករា","កុម្ភៈ","មីនា","មេសា","ឧសភា","មិថុនា","កក្កដា","សីហា","កញ្ញា","តុលា","វិច្ឆិកា","ធ្នូ"][currentDate.getMonth()]} ${toKhmerNumeral(currentDate.getFullYear())}`
            : format(currentDate, "EEEE, MMMM d, yyyy")
          }
        </p>
      </div>

      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-100 bg-amber-50/30">
          <p className="text-[10px] font-semibold uppercase text-gray-500 mb-1.5">
            {t("allDay")}
          </p>
          <div className="space-y-1">
            {allDayEvents.map((ev) => (
              <EventCard key={ev.id} event={ev} onClick={() => onEventClick(ev)} view="day" />
            ))}
          </div>
        </div>
      )}

      {/* Time slots */}
      <div className="overflow-y-auto max-h-[600px]">
        {HOURS.map((hour) => {
          const hourEvents = timedEvents.filter((ev) => {
            if (!ev.start_time) return false;
            const evHour = parseInt(ev.start_time.split(":")[0]);
            const evEndHour = ev.end_time ? parseInt(ev.end_time.split(":")[0]) : evHour;
            return evHour <= hour && evEndHour >= hour;
          });

          const now = new Date();
          const isCurrentHour = isToday(currentDate) && now.getHours() === hour;

          return (
            <div
              key={hour}
              className={cn(
                "flex border-b border-gray-100 min-h-[60px]",
                isCurrentHour && "bg-blue-50/20"
              )}
            >
              <div className="w-16 shrink-0 px-2 py-1 text-[10px] text-gray-400 flex items-start justify-end pr-3 border-r border-gray-100">
                {km ? toKhmerNumeral(hour) : hour}:00
              </div>
              <div className="flex-1 px-2 py-1 space-y-1">
                {hourEvents.map((ev) => (
                  <EventCard key={ev.id} event={ev} onClick={() => onEventClick(ev)} view="day" />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* No events */}
      {dayEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <p className="text-sm">{t("noEvents")}</p>
        </div>
      )}
    </div>
  );
}