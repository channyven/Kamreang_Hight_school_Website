"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DOCUMENT_CATEGORIES, type DocumentCategory } from "@/types";

interface DocumentToolbarProps {
  /** Current search query value. */
  search: string;
  /** Callback to update the search query. */
  onSearchChange: (value: string) => void;
  /** Currently selected category filter ("all" or a specific category). */
  activeCategory: DocumentCategory | "all";
  /** Callback when a category filter button is clicked. */
  onCategoryChange: (category: DocumentCategory | "all") => void;
}

const ALL_CATEGORIES = ["all", ...DOCUMENT_CATEGORIES.map((c) => c.key)] as const;

/**
 * Toolbar for the Documents Management page.
 * Contains a search input with icon and category filter buttons.
 */
export default function DocumentToolbar({
  search,
  onSearchChange,
  activeCategory,
  onCategoryChange,
}: DocumentToolbarProps) {
  const locale = useLocale();

  // Build category labels with translations
  const categoryOptions = useMemo(() => {
    return ALL_CATEGORIES.map((key) => {
      if (key === "all") {
        return { key, label: locale === "km" ? "ទាំងអស់" : "All" };
      }
      const cat = DOCUMENT_CATEGORIES.find((c) => c.key === key);
      return {
        key,
        label: locale === "km" ? cat?.labelKm ?? key : cat?.labelEn ?? key,
      };
    });
  }, [locale]);

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Search input */}
      <div className="relative w-full sm:w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        <Input
          placeholder={locale === "km" ? "ស្វែងរក..." : "Search..."}
          className="pl-9 rounded-lg border-gray-200"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Category filter buttons */}
      <div className="flex flex-wrap gap-2">
        {categoryOptions.map(({ key, label }) => {
          const isActive = activeCategory === key;
          return (
            <Button
              key={key}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(key as DocumentCategory | "all")}
              className={
                isActive
                  ? "bg-school-blue-800 text-white hover:bg-school-blue-900"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }
            >
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
