"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Upload, X, Loader2, ImageIcon, Crop as CropIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/upload";
import { STORAGE_BUCKETS } from "@/lib/supabase";
import { cn } from "@/utils";
import { toast } from "sonner";

interface PhotoCropUploaderProps {
  /** Current image URL (if already set) */
  value?: string | null;
  /** Called when an image is uploaded or removed */
  onChange: (url: string | null) => void;
  /** Storage bucket to upload to */
  bucket?: keyof typeof STORAGE_BUCKETS;
  /** Optional subfolder within the bucket */
  folder?: string;
  /** Crop aspect ratio (width / height). Defaults to the ID card photo slot. */
  aspect?: number;
  /** Optional class name */
  className?: string;
  /** Optional label */
  label?: string;
}

const DEFAULT_ASPECT = 80 / 88; // matches the student ID card photo slot

function isValidUrl(url: string): boolean {
  if (url.startsWith("/api/proxy-image?url=")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function centerAspectCrop(width: number, height: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, width, height),
    width,
    height
  );
}

async function cropToFile(image: HTMLImageElement, crop: PixelCrop): Promise<File> {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const canvas = document.createElement("canvas");
  const MAX = 600;
  const cropW = crop.width * scaleX;
  const cropH = crop.height * scaleY;
  const ratio = Math.min(1, MAX / Math.max(cropW, cropH));
  canvas.width = cropW * ratio;
  canvas.height = cropH * ratio;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(
    image,
    crop.x * scaleX, crop.y * scaleY, cropW, cropH,
    0, 0, canvas.width, canvas.height
  );

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Crop failed"))), "image/jpeg", 0.9);
  });
  return new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
}

export default function PhotoCropUploader({
  value,
  onChange,
  bucket = "SCHOOL_IMAGES",
  folder = "photos",
  aspect = DEFAULT_ASPECT,
  className,
  label,
}: PhotoCropUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [urlDraft, setUrlDraft] = useState(value ?? "");
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropCountRef = useRef(0);

  // ─── Crop modal state ─────────────────────────────────────────
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImgUrl, setCropImgUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [applying, setApplying] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setPreview(value ?? null);
    setUrlDraft(value ?? "");
  }, [value]);

  // ─── Upload a cropped file to Supabase Storage ────────────────

  const doUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file, file.name);
        const result = await uploadImage(formData, STORAGE_BUCKETS[bucket], folder);
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

  // ─── Open the crop modal for a freshly picked/dropped file ────

  const openCropperForFile = useCallback((file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPEG, PNG, WebP, and GIF images are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10 MB.");
      return;
    }
    setCrop(undefined);
    setCompletedCrop(undefined);
    setCropImgUrl(URL.createObjectURL(file));
    setCropOpen(true);
  }, []);

  // ─── Re-open the crop modal for the already-uploaded photo ────

  const openCropperForEdit = useCallback(async () => {
    if (!preview) return;
    try {
      const res = await fetch(preview);
      const blob = await res.blob();
      setCrop(undefined);
      setCompletedCrop(undefined);
      setCropImgUrl(URL.createObjectURL(blob));
      setCropOpen(true);
    } catch {
      toast.error("Could not load this image for editing");
    }
  }, [preview]);

  const closeCropper = useCallback(() => {
    if (cropImgUrl) URL.revokeObjectURL(cropImgUrl);
    setCropImgUrl(null);
    setCropOpen(false);
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, [cropImgUrl]);

  const handleImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    },
    [aspect]
  );

  const handleApplyCrop = useCallback(async () => {
    if (!imgRef.current || !completedCrop || completedCrop.width === 0) {
      toast.error("Adjust the crop area first");
      return;
    }
    setApplying(true);
    try {
      const file = await cropToFile(imgRef.current, completedCrop);
      closeCropper();
      await doUpload(file);
    } catch {
      toast.error("Failed to crop image");
    } finally {
      setApplying(false);
    }
  }, [completedCrop, closeCropper, doUpload]);

  // ─── File input / drag & drop ──────────────────────────────────

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) openCropperForFile(file);
      if (inputRef.current) inputRef.current.value = "";
    },
    [openCropperForFile]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropCountRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropCountRef.current -= 1;
    if (dropCountRef.current === 0) setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      dropCountRef.current = 0;
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast.error("Please drop an image file.");
        return;
      }
      openCropperForFile(file);
    },
    [openCropperForFile]
  );

  const handleRemove = useCallback(() => {
    setPreview(null);
    setUrlDraft("");
    onChange(null);
  }, [onChange]);

  // ─── Render ──────────────────────────────────────────────────

  return (
    <div className={cn("space-y-2", className)}>
      {label && <p className="text-xs font-medium text-gray-500">{label}</p>}

      {preview && isValidUrl(preview) ? (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "relative group rounded-xl overflow-hidden border bg-gray-50 transition-colors",
            isDragOver ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
          )}
        >
          <div className="relative w-full max-w-[200px] mx-auto" style={{ aspectRatio: aspect }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Uploaded image preview" className="w-full h-full object-cover" />
          </div>

          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center gap-2 transition-opacity",
              isDragOver ? "bg-blue-600/50 opacity-100" : "bg-black/40 opacity-0 group-hover:opacity-100"
            )}
          >
            {isDragOver ? (
              <p className="text-sm font-semibold text-white">Drop to replace</p>
            ) : (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8"
                  title="Edit / Crop"
                  aria-label="Edit / Crop"
                  onClick={openCropperForEdit}
                >
                  <CropIcon className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  title="Remove"
                  aria-label="Remove"
                  onClick={handleRemove}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
          </div>

          <div className="px-3 py-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 truncate font-mono">{preview}</p>
          </div>
        </div>
      ) : preview && !isValidUrl(preview) ? (
        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-600 font-medium">Invalid image URL</p>
          <p className="text-xs text-red-400 mt-1 truncate font-mono">{preview}</p>
          <div className="flex justify-center gap-2 mt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              <Upload className="w-3.5 h-3.5 mr-1" />
              Upload
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
              <X className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200",
            "flex flex-col items-center justify-center gap-2 py-8 px-4",
            isDragOver ? "border-blue-500 bg-blue-50/60 scale-[1.01]" : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/30",
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
              <p className="text-sm font-semibold text-blue-600">Drop your image here</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">Click to upload or drag & drop</p>
              <p className="text-xs text-gray-400">JPEG, PNG, WebP or GIF &bull; Max 10 MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
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
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleRemove}>
            <X className="w-3.5 h-3.5 text-gray-400" />
          </Button>
        )}
      </div>

      {/* ═══ Crop Modal ═══ */}
      <AnimatePresence>
        {cropOpen && cropImgUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={closeCropper}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
                <h2 className="text-sm font-semibold text-gray-900">Crop Photo</h2>
                <button
                  onClick={closeCropper}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-gray-50">
                {/* No `aspect` prop here on purpose — react-image-crop hides
                    the edge (top/bottom/left/right) drag handles whenever
                    aspect is locked, leaving only the 4 corners draggable.
                    The starting box is still seeded at the portrait ratio
                    via centerAspectCrop on image load; from there the user
                    can freely resize from any side. */}
                <ReactCrop
                  crop={crop}
                  onChange={(_: Crop, percentCrop: Crop) => setCrop(percentCrop)}
                  onComplete={(c: PixelCrop) => setCompletedCrop(c)}
                  keepSelection
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    src={cropImgUrl}
                    alt="Crop preview"
                    onLoad={handleImageLoad}
                    className="max-h-[60vh] w-auto"
                  />
                </ReactCrop>
              </div>

              <div className="flex items-center justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100 shrink-0">
                <Button variant="outline" size="sm" className="h-9 gap-2 text-sm" onClick={closeCropper} disabled={applying}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-9 gap-2 text-sm bg-school-blue-800 hover:bg-school-blue-900"
                  onClick={handleApplyCrop}
                  disabled={applying}
                >
                  {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CropIcon className="w-4 h-4" />}
                  Save Photo
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
