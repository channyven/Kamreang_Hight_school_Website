"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils";
import { toKhmerNumeral } from "@/utils";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday,
  format, addMonths, subMonths,
} from "date-fns";

interface Props {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  eventsByDate: Record<string, number>;
}

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export default function MiniCalendar({
  currentDate, selectedDate, onSelectDate, onMonthChange, eventsByDate,
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3">
      {/* Month/Year Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => onMonthChange(subMonths(currentDate, 1))}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
        <span className="text-sm font-semibold text-gray-800">
          {km
            ? `${["មករា","កុម្ភៈ","មីនា","មេសា","ឧសភា","មិថុនា","កក្កដា","សីហា","កញ្ញា","តុលា","វិច្ឆិកា","ធ្នូ"][currentDate.getMonth()]} ${toKhmerNumeral(currentDate.getFullYear())}`
            : format(currentDate, "MMMM yyyy")
          }
        </span>
        <button
          onClick={() => onMonthChange(addMonths(currentDate, 1))}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_KEYS.map((key) => (
          <div key={key} className="text-center text-[10px] font-medium text-gray-400 py-1">
            {km
              ? ({ sun: "អា", mon: "ច", tue: "អ", wed: "ព", thu: "ព្រ", fri: "សុ", sat: "ស" } as Record<string, string>)[key]
              : t(key as "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat")
            }
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, i) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const count = eventsByDate[dateStr] ?? 0;
          const isCurrent = isSameMonth(day, currentDate);
          const isSelected = isSameDay(day, selectedDate);
          const today = isToday(day);

          return (
            <button
              key={i}
              onClick={() => onSelectDate(day)}
              className={cn(
                "relative text-center py-1 rounded-lg text-xs transition-all",
                !isCurrent && "text-gray-300",
                isCurrent && !isSelected && !today && "text-gray-700 hover:bg-gray-100",
                isSelected && "text-white font-bold",
                today && !isSelected && "font-bold"
              )}
              style={
                isSelected
                  ? { background: "#1e3a8a" }
                  : today ? { color: "#1e3a8a" } : undefined
              }
            >
              {km ? toKhmerNumeral(format(day, "d")) : format(day, "d")}
              {count > 0 && (
                <span
                  className={cn(
                    "absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full",
                    isSelected ? "bg-white" : "bg-blue-500"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}