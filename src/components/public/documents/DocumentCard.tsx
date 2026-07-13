"use client";

import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { Calendar, Download, FileText, FileSpreadsheet, FileImage, File } from "lucide-react";
import { formatRelativeDate, formatFileSize } from "@/lib/utils";
import type { AppDocument } from "@/types";
import CategoryBadge from "./CategoryBadge";

interface DocumentCardProps {
  document: AppDocument;
  index: number;
}

/** Derive the file extension from a file name string. */
function getExtension(fileName?: string | null): string {
  if (!fileName) return "";
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

/** Get a file-type icon and its accent color based on the file extension. */
function getFileIcon(fileName?: string | null): { icon: React.ReactNode; bg: string } {
  const ext = getExtension(fileName);

  if (ext === "pdf") {
    return { icon: <FileText className="w-6 h-6 text-white" />, bg: "#dc2626" };
  }
  if (["doc", "docx"].includes(ext)) {
    return { icon: <FileText className="w-6 h-6 text-white" />, bg: "#2563eb" };
  }
  if (["xls", "xlsx", "csv"].includes(ext)) {
    return { icon: <FileSpreadsheet className="w-6 h-6 text-white" />, bg: "#16a34a" };
  }
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
    return { icon: <FileImage className="w-6 h-6 text-white" />, bg: "#9333ea" };
  }
  if (["ppt", "pptx"].includes(ext)) {
    return { icon: <FileText className="w-6 h-6 text-white" />, bg: "#ea580c" };
  }
  return { icon: <File className="w-6 h-6 text-white" />, bg: "#6b7280" };
}

/**
 * A single document card displayed in the grid.
 * Shows file icon, category badge, title, description, upload date, and download button.
 */
export default function DocumentCard({ document: doc, index }: DocumentCardProps) {
  const locale = useLocale();
  const { icon, bg } = getFileIcon(doc.file_name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6 flex flex-col"
    >
      {/* Top row: icon + category */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: bg }}
        >
          {icon}
        </div>
        <CategoryBadge category={doc.category} />
      </div>

      {/* Title (localized) */}
      <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2">
        {locale === "km" ? doc.title_km : doc.title_en}
      </h3>

      {/* Description (localized) */}
      {(locale === "km" ? doc.description_km : doc.description_en) && (
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
          {locale === "km" ? doc.description_km : doc.description_en}
        </p>
      )}

      {/* Divider */}
      <div className="border-t border-gray-100 my-3" />

      {/* Footer: date + download */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar className="w-3.5 h-3.5" />
          {locale === "km"
            ? `បានបង្ហោះ ${formatRelativeDate(doc.created_at)}`
            : `Uploaded ${formatRelativeDate(doc.created_at)}`}
        </div>
        <a
          href={doc.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-full bg-school-gold-500 hover:bg-school-gold-600 active:scale-95 transition-all duration-200 flex items-center justify-center shrink-0"
          aria-label="Download document"
        >
          <Download className="w-4 h-4 text-white" />
        </a>
      </div>
    </motion.div>
  );
}
