"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import {
  Dialog, DialogContent, DialogTitle,
} from "@/components/ui/dialog";
import type { CalendarEvent, EventCategory } from "@/types";
import CalendarHeader from "./CalendarHeader";
import CalendarSidebar from "./CalendarSidebar";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import DayView from "./DayView";
import AgendaView from "./AgendaView";
import EventDetails from "./EventDetails";

type ViewMode = "month" | "week" | "day" | "agenda";

interface Props {
  events: CalendarEvent[];
  admin?: boolean;
  onCreateEvent?: () => void;
}

export default function CalendarView({ events, admin, onCreateEvent }: Props) {
  const t = useTranslations("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>("month");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Responsive sidebar
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1024px)");
    setSidebarOpen(!mql.matches);
    const handler = (e: MediaQueryListEvent) => setSidebarOpen(!e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Filter events
  const filteredEvents = useMemo(() => {
    let result = events;

    if (selectedCategories.length > 0) {
      result = result.filter((ev) => selectedCategories.includes(ev.category));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (ev) =>
          ev.title.toLowerCase().includes(q) ||
          (ev.description ?? "").toLowerCase().includes(q) ||
          ev.category.toLowerCase().includes(q) ||
          (ev.location ?? "").toLowerCase().includes(q) ||
          (ev.organizer ?? "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [events, selectedCategories, searchQuery]);

  // Events by date for mini calendar dots
  const eventsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    filteredEvents.forEach((ev) => {
      const start = new Date(ev.start_date + "T00:00:00");
      const end = new Date(ev.end_date + "T00:00:00");
      for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
        const key = format(d, "yyyy-MM-dd");
        map[key] = (map[key] ?? 0) + 1;
      }
    });
    return map;
  }, [filteredEvents]);

  const handlePrev = useCallback(() => {
    if (view === "month") setCurrentDate((d) => subMonths(d, 1));
    else if (view === "week") setCurrentDate((d) => subWeeks(d, 1));
    else if (view === "day") setCurrentDate((d) => subDays(d, 1));
  }, [view]);

  const handleNext = useCallback(() => {
    if (view === "month") setCurrentDate((d) => addMonths(d, 1));
    else if (view === "week") setCurrentDate((d) => addWeeks(d, 1));
    else if (view === "day") setCurrentDate((d) => addDays(d, 1));
  }, [view]);

  const handleToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }, []);

  const handleToggleCategory = useCallback((cat: EventCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [cat]
    );
  }, []);

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <CalendarSidebar
        open={sidebarOpen}
        currentDate={currentDate}
        selectedDate={selectedDate}
        onSelectDate={(d) => { setSelectedDate(d); setCurrentDate(d); }}
        onMonthChange={setCurrentDate}
        eventsByDate={eventsByDate}
        events={filteredEvents}
        selectedCategories={selectedCategories}
        onToggleCategory={handleToggleCategory}
        onEventClick={setSelectedEvent}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <CalendarHeader
          currentDate={currentDate}
          view={view}
          onViewChange={setView}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          eventsCount={filteredEvents.length}
          admin={admin}
          onCreateEvent={onCreateEvent}
        />

        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {view === "month" && (
            <MonthView
              currentDate={currentDate}
              selectedDate={selectedDate}
              events={filteredEvents}
              onSelectDate={(d) => setSelectedDate(d)}
              onEventClick={setSelectedEvent}
            />
          )}
          {view === "week" && (
            <WeekView
              currentDate={currentDate}
              events={filteredEvents}
              onEventClick={setSelectedEvent}
            />
          )}
          {view === "day" && (
            <DayView
              currentDate={currentDate}
              events={filteredEvents}
              onEventClick={setSelectedEvent}
            />
          )}
          {view === "agenda" && (
            <AgendaView
              events={filteredEvents}
              onEventClick={setSelectedEvent}
            />
          )}
        </div>
      </div>

      {/* Event details dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-xl !rounded-2xl shadow-xl p-0 overflow-hidden [&>.absolute]:hidden"><div className="p-6">
          <DialogTitle className="sr-only">
            {selectedEvent?.title ?? t("eventDetails")}
          </DialogTitle>
          {selectedEvent && (
            <EventDetails
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
            />
          )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}