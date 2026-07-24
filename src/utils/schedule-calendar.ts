import type { Schedule, SchedulePeriod, CalendarEvent } from "@/types";
import { format, addDays, parseISO, startOfWeek, endOfWeek } from "date-fns";

const DAY_INDEX_MAP: Record<number, { key: string }> = {
  0: { key: "sun" },
  1: { key: "mon" },
  2: { key: "tue" },
  3: { key: "wed" },
  4: { key: "thu" },
  5: { key: "fri" },
  6: { key: "sat" },
};

function parseTime(timeStr: string): { start: string; end: string } {
  const parts = timeStr.split("-").map((t) => t.trim());
  if (parts.length === 2) return { start: parts[0], end: parts[1] };
  return { start: timeStr, end: "" };
}

function extractPeriods(daily_schedule: unknown): SchedulePeriod[] {
  if (!daily_schedule) return [];
  const d = daily_schedule as Record<string, unknown>;
  if (Array.isArray(d)) return d as SchedulePeriod[];
  if (d.periods && Array.isArray(d.periods)) return d.periods as SchedulePeriod[];
  return [];
}

/**
 * Generate synthetic CalendarEvent[] from an academic schedule
 * for a given date range (typically the currently visible range).
 */
export function generateScheduleEvents(
  schedule: Schedule | null,
  rangeStart: string,
  rangeEnd: string
): CalendarEvent[] {
  if (!schedule) return [];

  const periods = extractPeriods(schedule.daily_schedule);
  if (periods.length === 0) return [];

  const start = parseISO(rangeStart);
  const end = parseISO(rangeEnd);
  const events: CalendarEvent[] = [];

  let current = startOfWeek(start, { weekStartsOn: 1 }); // Start from Monday
  const lastDay = endOfWeek(end, { weekStartsOn: 1 });

  while (current <= lastDay) {
    const dayOfWeek = current.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const dayInfo = DAY_INDEX_MAP[dayOfWeek];
    const dateStr = format(current, "yyyy-MM-dd");

    // Only Mon-Sat
    if (dayInfo && dateStr >= rangeStart && dateStr <= rangeEnd) {
      for (const period of periods) {
        const p = period as unknown as Record<string, unknown>;
        const subjectKm = (p[`${dayInfo.key}_km`] as string) ?? period.name_km;
        const subjectEn = (p[`${dayInfo.key}_en`] as string) ?? period.name_en;
        const isHoliday = !!p[`${dayInfo.key}_holiday`];
        const { start: startTime, end: endTime } = parseTime(period.time);

        if (isHoliday) {
          events.push({
            id: `schedule-holiday-${dateStr}-${period.time}`,
            title: subjectKm || subjectEn || "",
            description: "",
            category: "holiday",
            location: "",
            organizer: "",
            start_date: dateStr,
            end_date: dateStr,
            start_time: "",
            end_time: "",
            is_all_day: true,
            is_recurring: false,
            visibility: "public",
            status: "published",
            color: "#22c55e",
            is_featured: false,
            created_at: "",
            updated_at: "",
          });
        } else if (subjectKm || subjectEn) {
          events.push({
            id: `schedule-${dateStr}-${period.time}`,
            title: subjectEn || subjectKm || "",
            description: subjectKm ? `(${subjectKm})` : "",
            category: "academic",
            location: "",
            organizer: "",
            start_date: dateStr,
            end_date: dateStr,
            start_time: startTime,
            end_time: endTime,
            is_all_day: false,
            is_recurring: false,
            visibility: "public",
            status: "published",
            color: "#2563eb",
            is_featured: false,
            created_at: "",
            updated_at: "",
          });
        }
      }
    }

    current = addDays(current, 1);
  }

  return events;
}