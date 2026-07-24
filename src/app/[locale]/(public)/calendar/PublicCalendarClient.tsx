"use client";

import CalendarView from "@/components/calendar/CalendarView";
import type { CalendarEvent } from "@/types";

interface Props {
  events: CalendarEvent[];
}

export default function PublicCalendarClient({ events }: Props) {
  return (
    <div className="h-full">
      <CalendarView events={events} />
    </div>
  );
}