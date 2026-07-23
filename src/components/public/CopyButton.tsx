"use client";

import { Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocale } from "next-intl";

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const locale = useLocale();

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-gray-100 transition-colors"
      title={locale === "km" ? "ចម្លង" : "Copy"}
    >
      {copied
        ? <Check className="w-3.5 h-3.5 text-green-500" />
        : <Copy className="w-3.5 h-3.5 text-gray-500" />
      }
    </button>
  );
}
