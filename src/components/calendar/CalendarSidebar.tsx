"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { format } from "date-fns";
import type { CalendarEvent, EventCategory } from "@/types";
import { EVENT_CATEGORIES } from "@/types";
import { cn } from "@/utils";
import { toKhmerNumeral } from "@/utils";
import MiniCalendar from "./MiniCalendar";
import UpcomingEvents from "./UpcomingEvents";

interface Props {
  open: boolean;
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  eventsByDate: Record<string, number>;
  events: CalendarEvent[];
  selectedCategories: EventCategory[];
  onToggleCategory: (cat: EventCategory) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export default function CalendarSidebar({
  open, currentDate, selectedDate, onSelectDate,
  onMonthChange, eventsByDate, events, selectedCategories,
  onToggleCategory, onEventClick,
}: Props) {
  const locale = useLocale();
  const t = useTranslations("calendar");
  const km = locale === "km";

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach((e) => {
      counts[e.category] = (counts[e.category] ?? 0) + 1;
    });
    return counts;
  }, [events]);

  return (
    <aside
      className={cn(
        "shrink-0 transition-all duration-300 overflow-hidden",
        open ? "w-72" : "w-0 lg:w-0"
      )}
    >
      <div className="w-72 p-4 space-y-4">
        {/* Mini Calendar */}
        <MiniCalendar
          currentDate={currentDate}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          onMonthChange={onMonthChange}
          eventsByDate={eventsByDate}
        />

        {/* Today's Date */}
        <div className="bg-gradient-to-br from-school-blue-800 to-school-blue-900 rounded-xl p-4 text-white">
          <p className="text-xs opacity-80">
            {km
              ? `${["អាទិត្យ","ច័ន្ទ","អង្គារ","ពុធ","ព្រហស្បតិ៍","សុក្រ","សៅរ៍"][selectedDate.getDay()]}`
              : format(selectedDate, "EEEE")
            }
          </p>
          <p className="text-2xl font-bold mt-1">
            {km ? toKhmerNumeral(format(selectedDate, "d")) : format(selectedDate, "d")}
          </p>
          <p className="text-sm opacity-80">
            {km
              ? `${["មករា","កុម្ភៈ","មីនា","មេសា","ឧសភា","មិថុនា","កក្កដា","សីហា","កញ្ញា","តុលា","វិច្ឆិកា","ធ្នូ"][selectedDate.getMonth()]} ${toKhmerNumeral(selectedDate.getFullYear())}`
              : format(selectedDate, "MMMM yyyy")
            }
          </p>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">
            {t("categories")}
          </h3>
          <div className="space-y-1">
            {EVENT_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.key] ?? 0;
              const active = selectedCategories.length === 0 || selectedCategories.includes(cat.key);
              return (
                <button
                  key={cat.key}
                  onClick={() => onToggleCategory(cat.key)}
                  className={cn(
                    "flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs transition-all",
                    active ? "bg-gray-50" : "opacity-40"
                  )}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: cat.color }}
                  />
                  <span className="flex-1 text-left text-gray-700">
                    {km ? cat.labelKm : cat.labelEn}
                  </span>
                  <span className="text-gray-400 text-[10px]">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <UpcomingEvents events={events} onEventClick={onEventClick} />
      </div>
    </aside>
  );
}