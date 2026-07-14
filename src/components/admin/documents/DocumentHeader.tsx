"use client";

import { useLocale } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentHeaderProps {
  /** Total number of documents (used for the subtitle count). */
  totalCount: number;
  /** Callback fired when the "New Document" button is clicked. */
  onCreateNew?: () => void;
}

/**
 * Header section for the Documents Management page.
 * Displays a title, document count subtitle, and a "New Document" action button.
 */
export default function DocumentHeader({ totalCount, onCreateNew }: DocumentHeaderProps) {
  const locale = useLocale();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {locale === "km" ? "គ្រប់គ្រងឯកសារ" : "Documents Management"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {totalCount} {locale === "km" ? "ឯកសារ" : totalCount === 1 ? "document" : "documents"}
        </p>
      </div>
      <Button
        onClick={onCreateNew}
        className="bg-school-blue-800 hover:bg-school-blue-900 shrink-0"
      >
        <Plus className="w-4 h-4 mr-2" />
        {locale === "km" ? "ឯកសារថ្មី" : "New Document"}
      </Button>
    </div>
  );
}
