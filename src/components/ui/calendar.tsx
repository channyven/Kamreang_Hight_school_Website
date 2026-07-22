"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = {
  mode?: "single";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  initialFocus?: boolean;
  className?: string;
  month?: Date;
  onMonthChange?: (date: Date) => void;
  disabled?: (date: Date) => boolean;
  fromDate?: Date;
  toDate?: Date;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Generate a reasonable range of years (from 100 years ago to 10 years from now)
function getYearRange(): number[] {
  const currentYear = new Date().getFullYear();
  const start = currentYear - 100;
  const end = currentYear + 10;
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
const YEAR_OPTIONS = getYearRange();

function Calendar({
  className,
  selected,
  onSelect,
  month: controlledMonth,
  onMonthChange,
  disabled,
  fromDate,
  toDate,
}: CalendarProps) {
  const today = new Date();
  const [internalMonth, setInternalMonth] = React.useState(
    controlledMonth ?? selected ?? today
  );
  const month = controlledMonth ?? internalMonth;

  const setMonth = (d: Date) => {
    if (onMonthChange) onMonthChange(d);
    else setInternalMonth(d);
  };

  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const startDayOfWeek = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();

  const prevMonth = () => setMonth(new Date(year, monthIndex - 1, 1));
  const nextMonth = () => setMonth(new Date(year, monthIndex + 1, 1));

  const goToMonth = (m: number) => setMonth(new Date(year, m, 1));
  const goToYear = (y: number) => setMonth(new Date(y, monthIndex, 1));

  const isDisabled = (day: number) => {
    if (!disabled && !fromDate && !toDate) return false;
    const date = new Date(year, monthIndex, day);
    if (disabled && disabled(date)) return true;
    if (fromDate && date < new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate())) return true;
    if (toDate && date > new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate())) return true;
    return false;
  };

  const isSelected = (day: number) => {
    if (!selected) return false;
    return (
      selected.getDate() === day &&
      selected.getMonth() === monthIndex &&
      selected.getFullYear() === year
    );
  };

  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === monthIndex &&
      today.getFullYear() === year
    );
  };

  const handleDayClick = (day: number) => {
    if (isDisabled(day)) return;
    const date = new Date(year, monthIndex, day);
    if (onSelect) onSelect(date);
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div className={cn("p-3", className)}>
      {/* Navigation with dropdowns for month & year */}
      <div className="flex items-center justify-between gap-1 mb-3">
        <button
          type="button"
          onClick={prevMonth}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 shrink-0"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1.5">
          {/* Month dropdown */}
          <select
            value={monthIndex}
            onChange={(e) => goToMonth(Number(e.target.value))}
            className="text-sm font-medium bg-transparent border border-gray-200 rounded-md px-1.5 py-1 cursor-pointer hover:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>

          {/* Year dropdown */}
          <select
            value={year}
            onChange={(e) => goToYear(Number(e.target.value))}
            className="text-sm font-medium bg-transparent border border-gray-200 rounded-md px-1.5 py-1 cursor-pointer hover:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={nextMonth}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 shrink-0"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0 text-center mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-xs text-gray-500 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0 text-center">
        {days.map((day, i) =>
          day === null ? (
            <div key={`empty-${i}`} />
          ) : (
            <button
              key={day}
              type="button"
              onClick={() => handleDayClick(day)}
              disabled={isDisabled(day)}
              className={cn(
                "h-8 w-8 rounded-md text-sm p-0 font-normal transition-colors",
                "hover:bg-blue-50",
                isSelected(day) && "bg-blue-600 text-white hover:bg-blue-700",
                isToday(day) && !isSelected(day) && "border border-blue-200",
                isDisabled(day) && "opacity-30 cursor-not-allowed hover:bg-transparent"
              )}
            >
              {day}
            </button>
          )
        )}
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
