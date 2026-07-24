"use client";


import { Clock, MapPin } from "lucide-react";
import type { CalendarEvent } from "@/types";
import { EVENT_CATEGORIES } from "@/types";
import { cn } from "@/utils";
import CategoryBadge from "./CategoryBadge";

interface Props {
  event: CalendarEvent;
  onClick?: () => void;
  compact?: boolean;
  view?: "month" | "week" | "day";
}

export default function EventCard({ event, onClick, compact, view }: Props) {
  const cat = EVENT_CATEGORIES.find((c) => c.key === event.category);

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left truncate rounded px-1 py-0.5 text-[11px] font-medium transition-opacity hover:opacity-80"
        style={{
          background: `${cat?.color ?? "#6366f1"}20`,
          color: cat?.color ?? "#6366f1",
          borderLeft: `2px solid ${cat?.color ?? "#6366f1"}`,
        }}
        title={event.title}
      >
        {event.title}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg border p-3 transition-all hover:shadow-md",
        view === "day" ? "p-3" : "p-2"
      )}
      style={{
        background: `${cat?.color ?? "#6366f1"}08`,
        borderColor: `${cat?.color ?? "#6366f1"}25`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-semibold truncate",
              view === "day" ? "text-sm" : "text-xs"
            )}
            style={{ color: cat?.color ?? "#6366f1" }}
          >
            {event.title}
          </p>
          <CategoryBadge category={event.category} className="mt-1" />
        </div>
      </div>
      {!event.is_all_day && event.start_time && (
        <div className="flex items-center gap-1 mt-1.5 text-[11px] text-gray-500">
          <Clock className="w-3 h-3 shrink-0" />
          <span>
            {event.start_time}{event.end_time ? ` - ${event.end_time}` : ""}
          </span>
        </div>
      )}
      {event.location && (
        <div className="flex items-center gap-1 mt-0.5 text-[11px] text-gray-400">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
      )}
    </button>
  );
}