"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Calendar, Clock, MapPin, User, Tag, Eye, FileText,
} from "lucide-react";
import type { CalendarEvent } from "@/types";
import { EVENT_CATEGORIES, EVENT_VISIBILITY_OPTIONS, EVENT_STATUS_OPTIONS } from "@/types";
import CategoryBadge from "./CategoryBadge";

interface Props {
  event: CalendarEvent;
  onClose: () => void;
}

export default function EventDetails({ event, onClose }: Props) {
  const locale = useLocale();
  const t = useTranslations("calendar");
  const km = locale === "km";
  const cat = EVENT_CATEGORIES.find((c) => c.key === event.category);
  const displayTitle = km ? (event.title_km || event.title) : (event.title_en || event.title);
  const displayDescription = km ? (event.description_km || event.description) : (event.description_en || event.description);
  const vis = EVENT_VISIBILITY_OPTIONS.find((v) => v.key === event.visibility);
  const st = EVENT_STATUS_OPTIONS.find((s) => s.key === event.status);

  const formatDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString(locale === "km" ? "km-KH" : "en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  };

  return (
    <div className="relative space-y-6">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>

      {/* Header */}
      <div className="flex items-start gap-4 pr-6">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
          style={{ background: `${cat?.color ?? "#6366f1"}12` }}
        >
          <Calendar className="w-6 h-6" style={{ color: cat?.color ?? "#6366f1" }} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">{displayTitle}</h3>
          <div className="mt-2">
            <CategoryBadge category={event.category} size="md" />
          </div>
        </div>
      </div>

      {/* Date/Time - Primary info */}
      <div className="bg-gray-50/60 rounded-xl p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
            <Calendar className="w-4 h-4" style={{ color: cat?.color ?? "#6366f1" }} />
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="text-sm font-medium text-gray-900">
              {formatDate(event.start_date)}{event.start_date !== event.end_date ? ` - ${formatDate(event.end_date)}` : ""}
            </p>
            {!event.is_all_day && event.start_time && (
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                <Clock className="w-3.5 h-3.5" />
                {event.start_time}{event.end_time ? ` - ${event.end_time}` : ""}
              </p>
            )}
            {event.is_all_day && (
              <p className="text-xs text-amber-600 font-medium mt-1">{t("allDay")}</p>
            )}
          </div>
        </div>

        {event.location && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-700 pt-1.5">{event.location}</p>
          </div>
        )}

        {event.organizer && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
              <User className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-700 pt-1.5">{event.organizer}</p>
          </div>
        )}
      </div>

      {/* Description */}
      {displayDescription && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            {t("description")}
          </h4>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{displayDescription}</p>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-4">
        <div className="flex items-center gap-2.5">
          <Tag className="w-3.5 h-3.5 text-gray-300 shrink-0" />
          <div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
              {t("category")}
            </p>
            <p className="text-xs text-gray-700 capitalize mt-0.5">{event.category.replace("_", " ")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Eye className="w-3.5 h-3.5 text-gray-300 shrink-0" />
          <div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
              {t("visibility")}
            </p>
            <p className="text-xs text-gray-700 mt-0.5">{locale === "km" ? vis?.labelKm : vis?.labelEn}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 shrink-0">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
              {t("status")}
            </p>
            <p className="text-xs text-gray-700 mt-0.5">{locale === "km" ? st?.labelKm : st?.labelEn}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 shrink-0">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
              {t("date")}
            </p>
            <p className="text-xs text-gray-700 mt-0.5">
              {event.start_date === event.end_date
                ? event.start_date
                : `${event.start_date} - ${event.end_date}`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Recurring badge */}
      {event.is_recurring && (
        <div className="flex items-center gap-2 bg-purple-50 rounded-lg px-3 py-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500 shrink-0">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          <span className="text-xs font-medium text-purple-600">{t("recurring")}</span>
        </div>
      )}

      {/* Attachment */}
      {event.attachment_url && (
        <a
          href={event.attachment_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 rounded-lg px-3 py-2.5 transition-colors hover:bg-blue-100"
        >
          <FileText className="w-4 h-4" />
          {t("viewAttachment")}
        </a>
      )}
    </div>
  );
}