"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { DocumentInput } from "@/schemas/validations";
import { Label } from "@/components/ui/label";

interface ContentCardProps {
  register: UseFormRegister<DocumentInput>;
  errors: FieldErrors<DocumentInput>;
}

/**
 * Card containing Khmer and English title + description fields.
 */
export default function ContentCard({ register, errors }: ContentCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
        <span className="text-lg">📄</span> Content
      </h2>

      {/* Khmer title */}
      <div className="space-y-1.5">
        <Label className="font-medium">
          ចំណងជើង (ខ្មែរ) <span className="text-red-500">*</span>
        </Label>
        <input
          {...register("title_km")}
          className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="បញ្ចូលចំណងជើង"
          dir="auto"
        />
        {errors.title_km && (
          <p className="text-xs text-red-500">{errors.title_km.message}</p>
        )}
      </div>

      {/* English title */}
      <div className="space-y-1.5">
        <Label className="font-medium">
          Title (English) <span className="text-red-500">*</span>
        </Label>
        <input
          {...register("title_en")}
          className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Document title"
        />
        {errors.title_en && (
          <p className="text-xs text-red-500">{errors.title_en.message}</p>
        )}
      </div>

      {/* Description fields (two columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="font-medium">ការពិពណ៌នា (ខ្មែរ)</Label>
          <textarea
            {...register("description_km")}
            rows={4}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="ការពិពណ៌នា..."
            style={{ height: 120 }}
            dir="auto"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="font-medium">Description (English)</Label>
          <textarea
            {...register("description_en")}
            rows={4}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Description..."
            style={{ height: 120 }}
          />
        </div>
      </div>
    </div>
  );
}
