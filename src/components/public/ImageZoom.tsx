"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageZoomProps {
  src: string;
  alt: string;
  children: React.ReactNode;
  unoptimized?: boolean;
}

export default function ImageZoom({
  src,
  alt,
  children,
  unoptimized = false,
}: ImageZoomProps) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "";
  }, []);

  // Keyboard: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      {/* ─── Clickable image (preserves original layout) ─── */}
      <button
        type="button"
        onClick={open}
        className="group relative block w-full cursor-zoom-in text-left focus:outline-none"
        aria-label={`${alt} — click to zoom`}
      >
        {children}
      </button>

      {/* ─── Lightbox modal ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={close}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={close}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image */}
            <motion.div
              key={src}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full h-full max-w-6xl max-h-[88vh] m-4 sm:m-6"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={src}
                alt={alt}
                fill
                className="object-contain drop-shadow-2xl"
                priority
                unoptimized={unoptimized}
                sizes="100vw"
              />
            </motion.div>

            {/* Hint text */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/70 text-xs">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white/15 text-white font-mono text-[11px]">ESC</kbd> to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
