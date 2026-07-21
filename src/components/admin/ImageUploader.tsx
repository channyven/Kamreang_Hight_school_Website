"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/upload";
import { STORAGE_BUCKETS } from "@/lib/supabase";
import { cn } from "@/utils";
import { toast } from "sonner";

interface ImageUploaderProps {
  /** Current image URL (if already set) */
  value?: string | null;
  /** Called when an image is uploaded or removed */
  onChange: (url: string | null) => void;
  /** Storage bucket to upload to */
  bucket?: keyof typeof STORAGE_BUCKETS;
  /** Optional subfolder within the bucket */
  folder?: string;
  /** Optional class name */
  className?: string;
  /** Optional label */
  label?: string;
}

/**
 * Returns true if url is displayable as an <img src> — either a valid
 * http/https URL, or our own same-origin Google Drive proxy path
 * (see convertGoogleDriveUrl in src/utils), which is relative and would
 * otherwise fail the `new URL()` parse below.
 */
function isValidUrl(url: string): boolean {
  if (url.startsWith("/api/proxy-image?url=")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ImageUploader({
  value,
  onChange,
  bucket = "SCHOOL_IMAGES",
  folder = "about",
  className,
  label,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [urlDraft, setUrlDraft] = useState(value ?? "");
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropCountRef = useRef(0);

  // Resync local preview/draft when the parent reassigns `value` out from
  // under us (e.g. the Google Drive share-link auto-converter effects in
  // the hero-slides/news/achievements/donate admin forms run *after* this
  // component already committed the raw pasted URL via onChange).
  useEffect(() => {
    setPreview(value ?? null);
    setUrlDraft(value ?? "");
  }, [value]);

  // ─── Upload a file to Supabase Storage ───────────────────────

  const doUpload = useCallback(
    async (file: File) => {
      // Validate file type
      const allowed = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
      ];
      if (!allowed.includes(file.type)) {
        toast.error("Only JPEG, PNG, WebP, GIF, and SVG images are allowed.");
        return;
      }

      // Validate file size (10 MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be smaller than 10 MB.");
        return;
      }

      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file, file.name);

        const result = await uploadImage(
          formData,
          STORAGE_BUCKETS[bucket],
          folder
        );

        setPreview(result.url);
        setUrlDraft(result.url);
        onChange(result.url);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [bucket, folder, onChange]
  );

  // ─── File input change (click to upload) ─────────────────────

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      await doUpload(file);

      // Reset the input so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    },
    [doUpload]
  );

  // ─── Drag & Drop handlers ────────────────────────────────────

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropCountRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropCountRef.current -= 1;
    if (dropCountRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      dropCountRef.current = 0;

      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      // Only accept image files
      if (!file.type.startsWith("image/")) {
        toast.error("Please drop an image file.");
        return;
      }

      await doUpload(file);
    },
    [doUpload]
  );

  // ─── Remove image ────────────────────────────────────────────

  const handleRemove = useCallback(() => {
    setPreview(null);
    setUrlDraft("");
    onChange(null);
  }, [onChange]);

  // ─── Render ──────────────────────────────────────────────────

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className="text-xs font-medium text-gray-500">{label}</p>
      )}

      {preview && isValidUrl(preview) ? (
        /* ── Image Preview (only for valid http/https URLs) ── */
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          {/* Preview */}
          <div className="relative aspect-video max-h-[200px] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Uploaded image preview"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Overlay actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="w-3.5 h-3.5 mr-1" />
              Replace
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Remove
            </Button>
          </div>

          {/* File URL */}
          <div className="px-3 py-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 truncate font-mono">
              {preview}
            </p>
          </div>
        </div>
      ) : preview && !isValidUrl(preview) ? (
        /* ── Invalid URL — show warning instead ── */
        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-600 font-medium">
            Invalid image URL
          </p>
          <p className="text-xs text-red-400 mt-1 truncate font-mono">
            {preview}
          </p>
          <div className="flex justify-center gap-2 mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="w-3.5 h-3.5 mr-1" />
              Upload
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      ) : (
        /* ── Drop zone (empty state) ── */
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200",
            "flex flex-col items-center justify-center gap-2 py-8 px-4",
            isDragOver
              ? "border-blue-500 bg-blue-50/60 scale-[1.01]"
              : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/30",
            uploading && "pointer-events-none opacity-60"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-500">Uploading...</p>
            </>
          ) : isDragOver ? (
            <>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-blue-600">
                Drop your image here
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-gray-400">
                JPEG, PNG, WebP, GIF or SVG &bull; Max 10 MB
              </p>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Manual URL input as fallback (only for http/https URLs) */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onBlur={() => {
              const val = urlDraft.trim();
              if (!val) {
                setPreview(null);
                onChange(null);
                return;
              }
              if (!isValidUrl(val)) {
                toast.error("Please enter a valid http or https URL");
                return;
              }
              setPreview(val);
              setUrlDraft(val);
              onChange(val);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            placeholder="Or paste image URL..."
            className="w-full text-xs rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-500 placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
        {preview && isValidUrl(preview) && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={handleRemove}
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </Button>
        )}
      </div>
    </div>
  );
}
