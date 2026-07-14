"use client";

import { useLocale } from "next-intl";
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  Trash2,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate, formatFileSize } from "@/utils";
import type { AppDocument } from "@/types";

interface DocumentListProps {
  /** Array of documents to display. */
  documents: AppDocument[];
  /** Whether data is currently being fetched. */
  loading: boolean;
  /** Callback fired when the delete action is triggered. */
  onDelete: (id: string) => void;
}

/** Derive the file extension from a file name string. */
function getExtension(fileName?: string | null): string {
  if (!fileName) return "";
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

/** Map document file extensions to the matching icon component. */
function getDocIcon(fileName?: string | null) {
  const ext = getExtension(fileName);
  if (ext === "pdf") return <FileText className="w-5 h-5 text-red-500" />;
  if (["doc", "docx"].includes(ext)) return <FileText className="w-5 h-5 text-blue-500" />;
  if (["xls", "xlsx", "csv"].includes(ext)) return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return <FileImage className="w-5 h-5 text-purple-500" />;
  if (["ppt", "pptx"].includes(ext)) return <FileText className="w-5 h-5 text-orange-500" />;
  return <File className="w-5 h-5 text-gray-400" />;
}

/** Get the localized label for a document category from the joined object. */
function getCategoryLabel(category: { name_km?: string; name_en?: string } | null | undefined, locale: string): string {
  if (!category) return "—";
  return locale === "km" ? (category.name_km ?? category.name_en ?? "—") : (category.name_en ?? category.name_km ?? "—");
}

/**
 * Renders a table of documents with file icon, title, category, size, date, and actions.
 * Falls back to an empty state handled by the parent when there are no items.
 */
export default function DocumentList({ documents, loading, onDelete }: DocumentListProps) {
  const locale = useLocale();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[420px]">
        <Loader2 className="w-8 h-8 animate-spin text-school-blue-800" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {locale === "km" ? "ឈ្មោះឯកសារ" : "Name"}
            </th>
            <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 hidden sm:table-cell">
              {locale === "km" ? "ប្រភេទ" : "Category"}
            </th>
            <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 hidden md:table-cell">
              {locale === "km" ? "ទំហំ" : "Size"}
            </th>
            <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 hidden md:table-cell">
              {locale === "km" ? "កាលបរិច្ឆេទ" : "Date"}
            </th>
            <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {locale === "km" ? "សកម្មភាព" : "Actions"}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {documents.map((doc) => (
            <tr
              key={doc.id}
              className="transition-colors hover:bg-gray-50/50"
            >
              {/* Name + icon */}
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  {getDocIcon(doc.file_name)}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate max-w-[240px]">
                      {locale === "km" ? doc.title_km : doc.title_en}
                    </p>
                    {(locale === "km" ? doc.description_km : doc.description_en) && (
                      <p className="text-xs text-gray-400 truncate max-w-[240px] mt-0.5">
                        {locale === "km" ? doc.description_km : doc.description_en}
                      </p>
                    )}
                  </div>
                </div>
              </td>

              {/* Category badge */}
              <td className="px-5 py-4 hidden sm:table-cell">
                <Badge variant="outline" className="text-xs font-normal text-gray-500">
                  {getCategoryLabel(doc.category, locale)}
                </Badge>
              </td>

              {/* File size */}
              <td className="px-5 py-4 text-gray-400 text-xs hidden md:table-cell">
                {formatFileSize(doc.file_size)}
              </td>

              {/* Date */}
              <td className="px-5 py-4 text-gray-400 text-xs hidden md:table-cell">
                {formatRelativeDate(doc.created_at)}
              </td>

              {/* Actions */}
              <td className="px-5 py-4">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    asChild
                  >
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 text-gray-400" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDelete(doc.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
