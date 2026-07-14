"use client";

import { useLocale } from "next-intl";
import { FolderOpen } from "lucide-react";

/**
 * Empty state placeholder displayed when there are no documents
 * matching the current filters, or when no documents have been uploaded yet.
 */
export default function DocumentEmptyState() {
  const locale = useLocale();

  return (
    <div className="flex flex-col items-center justify-center h-[420px] text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <FolderOpen className="w-8 h-8 text-gray-300" />
      </div>
      <p className="text-sm font-medium text-gray-400">
        {locale === "km" ? "រកមិនឃើញឯកសារ" : "No documents found"}
      </p>
      <p className="text-xs text-gray-300 mt-1">
        {locale === "km"
          ? "ចុចប៊ូតុង \"ឯកសារថ្មី\" ដើម្បីបង្ហោះឯកសារដំបូង"
          : 'Click "New Document" to upload your first document'}
      </p>
    </div>
  );
}
