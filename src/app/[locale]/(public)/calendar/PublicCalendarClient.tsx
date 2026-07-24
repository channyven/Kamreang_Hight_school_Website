"use client";

import CalendarView from "@/components/calendar/CalendarView";
import type { CalendarEvent } from "@/types";

interface Props {
  events: CalendarEvent[];
}

export default function PublicCalendarClient({ events }: Props) {
  return (
    <section className="min-h-screen bg-gray-50 pt-20">
      <div className="h-[calc(100vh-5rem)]">
        <CalendarView events={events} />
      </div>
    </section>
  );
}