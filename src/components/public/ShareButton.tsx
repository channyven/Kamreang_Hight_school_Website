"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShareButton({ locale }: { locale: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => { navigator.clipboard.writeText(window.location.href); }}
    >
      <Share2 className="w-4 h-4 mr-1" />
      {locale === "km" ? "ចំណែក" : "Copy Link"}
    </Button>
  );
}
