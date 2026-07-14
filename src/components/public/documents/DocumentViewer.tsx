"use client";

import { useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  FileText,
  FileImage,
  FileSpreadsheet,
  ExternalLink,
} from "lucide-react";
import type { AppDocument } from "@/types";

interface DocumentViewerProps {
  /** The document to preview. */
  document: AppDocument;
  /** Whether the modal is open. */
  open: boolean;
  /** Callback when the modal is closed. */
  onClose: () => void;
}

/** Derive the file extension from a file name string. */
function getExtension(fileName?: string | null): string {
  if (!fileName) return "";
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

/** Human-readable file type label. */
function getFileTypeLabel(fileName?: string | null): string {
  const ext = getExtension(fileName);
  const map: Record<string, string> = {
    pdf: "PDF Document",
    doc: "Word Document",
    docx: "Word Document",
    xls: "Excel Spreadsheet",
    xlsx: "Excel Spreadsheet",
    csv: "CSV File",
    jpg: "JPEG Image",
    jpeg: "JPEG Image",
    png: "PNG Image",
    gif: "GIF Image",
    webp: "WebP Image",
    svg: "SVG Image",
    ppt: "PowerPoint",
    pptx: "PowerPoint",
  };
  return map[ext] ?? "Document";
}

/** Determine if the file is an image type. */
function isImageFile(fileName?: string | null): boolean {
  return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
    getExtension(fileName)
  );
}

/** Determine if the file is viewable in an iframe. */
function isViewableInIframe(fileName?: string | null): boolean {
  const ext = getExtension(fileName);
  return ["pdf", "jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
}

/** Get a Google Drive embed URL if the file is hosted on Google Drive. */
function getEmbedUrl(fileUrl: string): string {
  // Google Drive file URL patterns:
  // https://drive.google.com/file/d/FILE_ID/view
  // https://drive.google.com/open?id=FILE_ID
  const fileMatch = fileUrl.match(
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_\-]+)/
  );
  if (fileMatch) {
    return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
  }
  const openMatch = fileUrl.match(/[?&]id=([a-zA-Z0-9_\-]+)/);
  if (openMatch && fileUrl.includes("/open")) {
    return `https://drive.google.com/file/d/${openMatch[1]}/preview`;
  }
  return fileUrl;
}

/**
 * Full-screen modal component for previewing documents inside the app.
 * Supports PDF, images, and other viewable formats via iframe/embed.
 * For non-viewable files, shows a fallback with download option.
 */
export default function DocumentViewer({
  document: doc,
  open,
  onClose,
}: DocumentViewerProps) {
  const locale = useLocale();

  const title = locale === "km" ? doc.title_km : doc.title_en;
  const ext = getExtension(doc.file_name);
  const fileTypeLabel = getFileTypeLabel(doc.file_name);
  const embedUrl = getEmbedUrl(doc.file_url);
  const canViewInline = isViewableInIframe(doc.file_name);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleDownload = () => {
    const anchor = document.createElement("a");
    anchor.href = doc.file_url;
    anchor.download = doc.file_name || "document";
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* ─── Header ────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* File-type icon */}
                <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                  {ext === "pdf" ? (
                    <FileText className="w-5 h-5 text-red-500" />
                  ) : isImageFile(doc.file_name) ? (
                    <FileImage className="w-5 h-5 text-purple-500" />
                  ) : (
                    <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-gray-900 text-sm truncate">
                    {title}
                  </h2>
                  <p className="text-[11px] text-gray-400">{fileTypeLabel}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Download button */}
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-school-gold-500 text-white hover:bg-school-gold-600 hover:shadow-md active:scale-90 transition-all duration-200"
                  aria-label={locale === "km" ? "ទាញយក" : "Download"}
                >
                  <Download className="w-4 h-4" />
                </button>

                {/* Open in new tab */}
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 active:scale-90 transition-all duration-200"
                  aria-label={locale === "km" ? "បើកក្នុងផ្ទាំងថ្មី" : "Open in new tab"}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 active:scale-90 transition-all duration-200"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ─── Content area ──────────────────────────── */}
            <div className="flex-1 overflow-auto bg-gray-50 flex items-start justify-center p-4">
              {canViewInline ? (
                <iframe
                  src={embedUrl}
                  className="w-full h-[75vh] rounded-lg bg-white shadow-sm border-0"
                  title={title}
                  allow="autoplay"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                    <FileText className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">
                    {locale === "km"
                      ? "មិនអាចមើលជាមុនបានទេ"
                      : "Preview not available"}
                  </h3>
                  <p className="text-sm text-gray-300 max-w-xs mb-6">
                    {locale === "km"
                      ? `ឯកសារប្រភេទ .${ext} មិនអាចមើលក្នុងកម្មវិធីបានទេ។`
                      : `This .${ext} file type cannot be previewed in the browser.`}
                  </p>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-school-gold-500 text-white font-medium hover:bg-school-gold-600 hover:shadow-lg active:scale-95 transition-all duration-200"
                  >
                    <Download className="w-4 h-4" />
                    {locale === "km" ? "ទាញយកឯកសារ" : "Download File"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
