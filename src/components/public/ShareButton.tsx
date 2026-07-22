"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function ShareButton({ locale }: { locale: string }) {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(
      locale === "km" ? "បានចម្លងតំណ" : "Link copied to clipboard!"
    );
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
    >
      <Share2 className="w-4 h-4 mr-1" />
      {locale === "km" ? "ចម្លងតំណ" : "Copy Link"}
    </Button>
  );
}
