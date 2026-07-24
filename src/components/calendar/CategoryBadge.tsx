"use client";

import { EVENT_CATEGORIES, type EventCategory } from "@/types";
import { cn } from "@/utils";

interface Props {
  category: EventCategory;
  className?: string;
  size?: "sm" | "md";
}

export default function CategoryBadge({ category, className, size = "sm" }: Props) {
  const cat = EVENT_CATEGORIES.find((c) => c.key === category);
  if (!cat) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1",
        className
      )}
      style={{
        background: `${cat.color}18`,
        color: cat.color,
        border: `1px solid ${cat.color}30`,
      }}
    >
      <span
        className="rounded-full"
        style={{
          width: size === "sm" ? 5 : 6,
          height: size === "sm" ? 5 : 6,
          background: cat.color,
        }}
      />
      {cat.labelEn}
    </span>
  );
}