"use client";

import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useCallback } from "react";

export default function ShareButton({ locale }: { locale: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success(
        locale === "km" ? "បានចម្លងតំណភ្ជាប់!" : "Link copied to clipboard!",
        { duration: 2500 }
      );
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(
        locale === "km" ? "មិនអាចចម្លងតំណភ្ជាប់" : "Failed to copy link"
      );
    }
  }, [locale]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="min-w-[120px] transition-all"
    >
      {copied ? (
        <Check className="w-4 h-4 mr-1 text-green-500" />
      ) : (
        <Copy className="w-4 h-4 mr-1" />
      )}
      {copied
        ? (locale === "km" ? "បានចម្លង!" : "Copied!")
        : (locale === "km" ? "ចម្លងតំណភ្ជាប់" : "Copy Link")}
    </Button>
  );
}
