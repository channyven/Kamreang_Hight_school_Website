"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Plus, Trash2, ImageIcon, AlertTriangle, ChevronUp, ChevronDown, Upload, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { convertGoogleDriveUrl } from "@/lib/utils";
import { uploadImage } from "@/lib/upload";
import { STORAGE_BUCKETS } from "@/lib/supabase";
import { toast } from "sonner";

interface PhotoGalleryProps {
  images: string[];
  onChange: (images: string[]) => void;
  locale?: string;
}

export default function PhotoGallery({ images, onChange, locale = "en" }: PhotoGalleryProps) {
  const [newUrl, setNewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImage = () => {
    const url = newUrl.trim();
    if (!url) return;

    // Convert Google Drive links
    const converted = convertGoogleDriveUrl(url);

    // Avoid duplicates
    if (images.includes(converted)) {
      setNewUrl("");
      return;
    }

    onChange([...images, converted]);
    setNewUrl("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setUploading(true);
    let uploaded = 0;
    const errors: string[] = [];

    // Upload all files in parallel
    const uploadPromises = fileArray.map(async (file) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadImage(formData, STORAGE_BUCKETS.NEWS_IMAGES, "gallery");
        return { url: result.url, error: null };
      } catch (err) {
        return { url: null, error: err instanceof Error ? err.message : `${file.name} failed` };
      }
    });

    const results = await Promise.all(uploadPromises);

    const newImages = [...images];
    results.forEach((r) => {
      if (r.url && !newImages.includes(r.url)) {
        newImages.push(r.url);
        uploaded++;
      } else if (r.error) {
        errors.push(r.error);
      }
    });
    if (uploaded > 0) {
      onChange(newImages);
    }

    if (uploaded > 0) {
      toast.success(
        locale === "km"
          ? `បានបញ្ចូល ${uploaded} រូបភាព`
          : `${uploaded} image${uploaded > 1 ? "s" : ""} uploaded`
      );
    }

    if (errors.length > 0) {
      toast.error(
        locale === "km"
          ? `បរាជ័យ ${errors.length} រូបភាព`
          : `${errors.length} upload${errors.length > 1 ? "s" : ""} failed`
      );
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const updated = [...images];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addImage();
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload + URL row */}
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="shrink-0"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <span className="ml-1 hidden sm:inline">
            {uploading
              ? (locale === "km" ? "កំពុងបញ្ចូល..." : "Uploading...")
              : (locale === "km" ? "បញ្ចូលច្រើន" : "Upload All")}
          </span>
        </Button>
        <div className="flex-1 relative">
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={locale === "km" ? "តំណ Google Drive ឬ URL" : "Paste URL or Google Drive link"}
            className="pr-8 text-sm"
          />
        </div>
        <Button
          type="button"
          size="sm"
          onClick={addImage}
          className="bg-school-blue-800 hover:bg-school-blue-900 shrink-0"
        >
          <Plus className="w-4 h-4 mr-1" />
          {locale === "km" ? "បន្ថែម" : "Add"}
        </Button>
      </div>

      <p className="text-[10px] text-gray-400 leading-tight -mt-1.5">
        {locale === "km"
          ? "💡 អ្នកអាចជ្រើសរើសរូបភាពច្រើនក្នុងពេលតែមួយ"
          : "💡 Select multiple images at once from your computer"}
      </p>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 rounded-lg border border-dashed border-gray-200 bg-gray-50/50">
          <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
          <p className="text-xs text-gray-400">
            {locale === "km" ? "មិនទាន់មានរូបភាពទេ" : "No gallery images yet"}
          </p>
          <p className="text-[10px] text-gray-300 mt-0.5">
            {locale === "km" ? "បន្ថែមតំណភ្ជាប់ Google Drive ឬ URL រូបភាព" : "Add Google Drive links or image URLs above"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {images.map((url, index) => (
            <GalleryImageCard
              key={`${url}-${index}`}
              url={url}
              index={index}
              total={images.length}
              onRemove={removeImage}
              onMove={moveImage}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface GalleryImageCardProps {
  url: string;
  index: number;
  total: number;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: "up" | "down") => void;
}

function GalleryImageCard({ url, index, total, onRemove, onMove }: GalleryImageCardProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
      {/* Reorder buttons */}
      <div className="absolute top-1 left-1 z-20 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onMove(index, "up")}
          disabled={index === 0}
          className="w-5 h-5 rounded bg-black/50 hover:bg-black/70 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => onMove(index, "down")}
          disabled={index === total - 1}
          className="w-5 h-5 rounded bg-black/50 hover:bg-black/70 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Delete button */}
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute top-1 right-1 z-20 w-5 h-5 rounded bg-red-500/80 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="w-3 h-3" />
      </button>

      {/* Index badge */}
      <div className="absolute bottom-1 left-1 z-10 px-1.5 py-0.5 rounded bg-black/40 text-white text-[10px] font-medium">
        #{index + 1}
      </div>

      {/* Loading spinner */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="w-5 h-5 border-2 border-school-blue-800 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-red-50 p-2">
          <AlertTriangle className="w-4 h-4 text-red-300" />
          <span className="text-[9px] text-red-300 text-center leading-tight truncate max-w-full">
            Failed to load
          </span>
        </div>
      ) : (
        <Image
          src={url}
          alt={`Gallery image ${index + 1}`}
          fill
          className={`object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => { setError(true); setLoaded(true); }}
          unoptimized={url.includes("google.com")}
          sizes="(max-width: 640px) 50vw, 33vw"
        />
      )}
    </div>
  );
}
