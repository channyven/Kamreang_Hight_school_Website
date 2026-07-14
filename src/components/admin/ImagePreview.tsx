"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AlertTriangle } from "lucide-react";

interface ImagePreviewProps {
  url?: string | null;
  className?: string;
}

export default function ImagePreview({ url, className = "" }: ImagePreviewProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Reset error/loading when URL changes so a new URL gets a fresh load attempt
  useEffect(() => {
    setError(false);
    setLoading(true);
  }, [url]);

  if (!url) {
    return null;
  }

  return (
    <div className={`relative aspect-[16/9] rounded-lg bg-gray-100 border border-gray-200 overflow-hidden group ${className}`}>
      {/* Loading spinner */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="w-6 h-6 border-2 border-school-blue-800 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-red-50 z-10">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span className="text-[11px] text-red-400 text-center px-2">
            Image failed to load
          </span>
          <span className="text-[10px] text-red-300 text-center px-2 break-all max-w-full">
            {url}
          </span>
        </div>
      ) : (
        <Image
          src={url}
          alt="Featured image preview"
          fill
          className={`object-cover transition-opacity duration-300 ${loading ? "opacity-0" : "opacity-100"}`}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
          unoptimized={url.includes("google.com")}
        />
      )}

      {/* Overlay with URL on hover */}
      {!error && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-[10px] text-white truncate block leading-tight">
            {url}
          </span>
        </div>
      )}
    </div>
  );
}
