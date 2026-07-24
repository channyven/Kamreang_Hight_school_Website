"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  ChevronLeft, ChevronRight, Search, Plus,
  PanelLeftClose, PanelLeft,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils";
import { toKhmerNumeral } from "@/utils";

type ViewMode = "month" | "week" | "day" | "agenda";

interface Props {
  currentDate: Date;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  eventsCount: number;
  admin?: boolean;
  onCreateEvent?: () => void;
}

const VIEWS: ViewMode[] = ["month", "week", "day", "agenda"];

export default function CalendarHeader({
  currentDate, view, onViewChange, onPrev, onNext, onToday,
  searchQuery, onSearchChange, sidebarOpen, onToggleSidebar,
  eventsCount, admin, onCreateEvent,
}: Props) {
  const locale = useLocale();
  const t = useTranslations("calendar");
  const km = locale === "km";

  const title = (() => {
    if (km) {
      const months = ["មករា","កុម្ភៈ","មីនា","មេសា","ឧសភា","មិថុនា","កក្កដា","សីហា","កញ្ញា","តុលា","វិច្ឆិកា","ធ្នូ"];
      if (view === "month") return `${months[currentDate.getMonth()]} ${toKhmerNumeral(currentDate.getFullYear())}`;
      if (view === "week" || view === "day") return `${toKhmerNumeral(currentDate.getDate())} ${months[currentDate.getMonth()]} ${toKhmerNumeral(currentDate.getFullYear())}`;
      return t("agenda");
    }
    if (view === "month") return format(currentDate, "MMMM yyyy");
    if (view === "week") return format(currentDate, "MMM d, yyyy");
    if (view === "day") return format(currentDate, "EEEE, MMMM d, yyyy");
    return t("agenda");
  })();

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          title={sidebarOpen ? t("closeSidebar") : t("openSidebar")}
        >
          {sidebarOpen
            ? <PanelLeftClose className="w-4 h-4 text-gray-500" />
            : <PanelLeft className="w-4 h-4 text-gray-500" />
          }
        </button>

        {/* Today button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="text-xs font-medium"
        >
          {t("today")}
        </Button>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <button onClick={onPrev} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={onNext} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold text-gray-900 flex-1 min-w-0 truncate">
          {title}
        </h2>

        {/* View switcher */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          {VIEWS.map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                view === v
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {t(v)}
            </button>
          ))}
        </div>

        {/* Event count */}
        <span className="text-xs text-gray-400 hidden md:inline">
          {eventsCount} {t("events")}
        </span>

        {/* Search */}
        <div className="relative hidden md:block w-44">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchEvents")}
            className="pl-8 h-8 text-xs"
          />
        </div>

        {/* Create button (admin) */}
        {admin && onCreateEvent && (
          <Button size="sm" onClick={onCreateEvent} className="bg-school-blue-800 hover:bg-school-blue-900 text-white">
            <Plus className="w-3.5 h-3.5 mr-1" />
            {km ? "បង្កើត" : t("createEvent")}
          </Button>
        )}
      </div>
    </div>
  );
}