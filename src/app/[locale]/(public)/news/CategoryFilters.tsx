"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Newspaper,
  Megaphone,
  CalendarDays,
  FlaskConical,
  Trophy,
  ChevronDown,
} from "lucide-react";
import type { NewsCategory } from "@/types";
import { getLocalizedText } from "@/lib/utils";

interface CategoryFiltersProps {
  categories: NewsCategory[];
  allCount: number;
  categoryCounts: Map<string, number>;
  locale: string;
  currentSlug: string;
  onCategoryChange: (slug: string) => void;
}

// Map category slugs to unique icons
const CATEGORY_ICONS: Record<string, typeof Newspaper> = {
  announcement: Megaphone,
  events: CalendarDays,
  science: FlaskConical,
  sports: Trophy,
};

function getCategoryIcon(slug: string) {
  return CATEGORY_ICONS[slug] ?? Newspaper;
}

export default function CategoryFilters({
  categories,
  allCount,
  categoryCounts,
  locale,
  currentSlug,
  onCategoryChange,
}: CategoryFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isAllActive = !currentSlug;
  const activeCategory = categories.find((c) => c.slug === currentSlug);
  const mobileLabel = activeCategory
    ? getLocalizedText(activeCategory.name_km, activeCategory.name_en, locale)
    : locale === "km"
      ? "ទាំងអស់"
      : "All Categories";

  const handleSelect = (slug: string) => {
    onCategoryChange(slug);
    setMobileOpen(false);
  };

  return (
    <div ref={dropdownRef} className="w-full">
      {/* ─── Desktop pills ─── */}
      <div className="hidden sm:block">
        <div ref={scrollRef} className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1 scroll-smooth snap-x snap-mandatory">
          {/* \"All\" button */}
          <button
            onClick={() => handleSelect("")}
            className="relative shrink-0 snap-start focus:outline-none"
          >
            <span
              className={`relative inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isAllActive
                  ? "text-white"
                  : "text-gray-600 hover:text-school-blue-700 hover:bg-school-blue-50/80 border border-transparent hover:border-school-blue-200"
              }`}
            >
              {isAllActive && (
                <motion.span
                  layoutId="activeCategory"
                  className="absolute inset-0 rounded-xl bg-school-blue-800 shadow-md shadow-school-blue-800/20"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Newspaper className="w-3.5 h-3.5" />
                {locale === "km" ? "ទាំងអស់" : "All"}
              </span>
              <span
                className={`relative z-10 text-[10px] px-1.5 py-0.5 rounded-full ${
                  isAllActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {allCount}
              </span>
            </span>
          </button>

          {/* Category buttons */}
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.slug);
            const catCount = categoryCounts.get(cat.id) ?? 0;
            const isActive = currentSlug === cat.slug;

            return (
              <button
                key={cat.id}
                onClick={() => handleSelect(cat.slug)}
                className="relative shrink-0 snap-start focus:outline-none"
              >
                <span
                  className={`relative inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "text-white"
                      : "text-gray-600 hover:text-school-blue-700 hover:bg-school-blue-50/80 border border-transparent hover:border-school-blue-200"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeCategory"
                      className="absolute inset-0 rounded-xl bg-school-blue-800 shadow-md shadow-school-blue-800/20"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    {getLocalizedText(cat.name_km, cat.name_en, locale)}
                  </span>
                  <span
                    className={`relative z-10 text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {catCount}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Mobile dropdown ─── */}
      <div className="sm:hidden relative">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-haspopup="listbox"
          aria-label={locale === "km" ? "ជ្រើសរើសប្រភេទ" : "Select category"}
          className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 shadow-sm hover:border-school-blue-300 hover:shadow transition-all duration-200"
        >
          <span className="flex items-center gap-2">
            {currentSlug ? (
              (() => {
                const Icon = getCategoryIcon(currentSlug);
                return <Icon className="w-4 h-4 text-school-blue-800" />;
              })()
            ) : (
              <Newspaper className="w-4 h-4 text-school-blue-800" />
            )}
            {mobileLabel}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              mobileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -8, scaleY: 0.95 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scaleY: 1 }}
              exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -8, scaleY: 0.95 }}
              transition={{ duration: 0.15 }}
              role="listbox"
              className="absolute top-full left-0 right-0 mt-1 z-30 bg-white rounded-xl border border-gray-200 shadow-xl shadow-gray-200/50 overflow-hidden"
            >
              {/* All option */}
              <button
                onClick={() => handleSelect("")}
                className={`w-full flex items-center justify-between gap-2 px-4 py-3 text-sm transition-colors text-left ${
                  isAllActive
                    ? "bg-school-blue-800 text-white font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Newspaper className="w-4 h-4" />
                  {locale === "km" ? "ទាំងអស់" : "All Categories"}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isAllActive ? "bg-white/20" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {allCount}
                </span>
              </button>

              {/* Category options */}
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.slug);
                const catCount = categoryCounts.get(cat.id) ?? 0;
                const isActive = currentSlug === cat.slug;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelect(cat.slug)}
                    className={`w-full flex items-center justify-between gap-2 px-4 py-3 text-sm transition-colors text-left ${
                      isActive
                        ? "bg-school-blue-800 text-white font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {getLocalizedText(cat.name_km, cat.name_en, locale)}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        isActive ? "bg-white/20" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {catCount}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
