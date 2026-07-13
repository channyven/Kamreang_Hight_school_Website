"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { DocumentInput } from "@/schemas/validations";
import { Label } from "@/components/ui/label";

interface FileCardProps {
  register: UseFormRegister<DocumentInput>;
  errors: FieldErrors<DocumentInput>;
}

/**
 * Card containing File URL and File Name input fields.
 */
export default function FileCard({ register, errors }: FileCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
        <span className="text-lg">📎</span> File
      </h2>

      {/* File URL */}
      <div className="space-y-1.5">
        <Label className="font-medium">
          File URL <span className="text-red-500">*</span>
        </Label>
        <input
          {...register("file_url")}
          className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="https://drive.google.com/... or direct file link"
        />
        {errors.file_url && (
          <p className="text-xs text-red-500">{errors.file_url.message}</p>
        )}
        <p className="text-xs text-gray-400">
          Paste a Google Drive share link or a direct file URL.
        </p>
      </div>

      {/* File Name */}
      <div className="space-y-1.5">
        <Label className="font-medium">
          File Name <span className="text-red-500">*</span>
        </Label>
        <input
          {...register("file_name")}
          className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Annual-Report-2025.pdf"
        />
        {errors.file_name && (
          <p className="text-xs text-red-500">{errors.file_name.message}</p>
        )}
        <p className="text-xs text-gray-400">
          Display name shown to visitors, including the extension.
        </p>
      </div>
    </div>
  );
}
