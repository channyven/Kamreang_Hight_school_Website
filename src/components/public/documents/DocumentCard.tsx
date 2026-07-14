"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  FileText,
  CalendarDays,
  Download,
  FileImage,
  FileSpreadsheet,
} from "lucide-react";
import type { AppDocument } from "@/types";
import { formatRelativeDate } from "@/utils";
import DocumentViewer from "./DocumentViewer";

interface DocumentCardProps {
  document: AppDocument;
  index: number;
}

/** Derive the file extension from a file name string. */
function getExtension(fileName?: string | null): string {
  if (!fileName) return "";
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

/** Return a file-type-specific Lucide icon + colour. */
function getDocIcon(fileName?: string | null) {
  const ext = getExtension(fileName);
  if (ext === "pdf")
    return <FileText className="w-10 h-10 text-red-500" />;
  if (["doc", "docx"].includes(ext))
    return <FileText className="w-10 h-10 text-blue-600" />;
  if (["xls", "xlsx", "csv"].includes(ext))
    return <FileSpreadsheet className="w-10 h-10 text-emerald-600" />;
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
    return <FileImage className="w-10 h-10 text-purple-500" />;
  if (["ppt", "pptx"].includes(ext))
    return <FileText className="w-10 h-10 text-orange-500" />;
  return <FileText className="w-10 h-10 text-gray-400" />;
}

/**
 * Reusable document card with:
 * - PDF icon on the left
 * - Category badge above the title
 * - Bold title, short description, upload date with calendar icon
 * - Circular yellow download button at bottom-right (stopPropagation)
 * - Clicking the card opens a DocumentViewer modal
 */
export default function DocumentCard({ document: doc, index }: DocumentCardProps) {
  const locale = useLocale();
  const [viewerOpen, setViewerOpen] = useState(false);

  const title = locale === "km" ? doc.title_km : doc.title_en;
  const description =
    locale === "km" ? doc.description_km : doc.description_en;
  const categoryName =
    locale === "km" ? doc.category?.name_km : doc.category?.name_en;

  const handleCardClick = () => {
    setViewerOpen(true);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Create a temporary anchor to trigger the download
    const anchor = document.createElement("a");
    anchor.href = doc.file_url;
    anchor.download = doc.file_name || "document";
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        onClick={handleCardClick}
        className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer p-5 flex flex-col gap-3 overflow-hidden"
      >
        {/* ─── Top: Icon + Category badge ───────────────── */}
        <div className="flex items-start justify-between">
          <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-school-blue-50 transition-colors duration-200">
            {getDocIcon(doc.file_name)}
          </div>
          {categoryName && (
            <span className="text-[11px] font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
              {categoryName}
            </span>
          )}
        </div>

        {/* ─── Title ─────────────────────────────────────── */}
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-school-blue-800 transition-colors duration-200">
          {title}
        </h3>

        {/* ─── Description ───────────────────────────────── */}
        {description && (
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed flex-1">
            {description}
          </p>
        )}

        {/* ─── Footer: Date + Download button ────────────── */}
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-50">
          {/* Date with calendar icon */}
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{formatRelativeDate(doc.created_at)}</span>
          </div>

          {/* Circular yellow download button */}
          <button
            onClick={handleDownload}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-school-gold-500 text-white shadow-sm hover:bg-school-gold-600 hover:shadow-md active:scale-90 transition-all duration-200"
            aria-label={locale === "km" ? "ទាញយក" : "Download"}
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Document preview modal */}
      {viewerOpen && (
        <DocumentViewer
          document={doc}
          open={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </>
  );
}
