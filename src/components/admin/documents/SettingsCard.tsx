"use client";

import { useState, useEffect } from "react";
import type { Control, FieldErrors } from "react-hook-form";
import { useController } from "react-hook-form";
import { useLocale } from "next-intl";
import type { DocumentInput } from "@/schemas/validations";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getDocumentCategories } from "@/actions/Document";
import type { DocumentCategoryOption } from "@/actions/Document";

interface SettingsCardProps {
  control: Control<DocumentInput>;
  errors: FieldErrors<DocumentInput>;
}

/**
 * Sidebar card with Category select, Sort Order input, and Active toggle.
 * Categories are loaded from the database with a hardcoded fallback.
 */
export default function SettingsCard({ control, errors }: SettingsCardProps) {
  const locale = useLocale();
  const [categories, setCategories] = useState<DocumentCategoryOption[]>([]);

  useEffect(() => {
    getDocumentCategories().then(setCategories);
  }, []);

  const { field: categoryField } = useController({
    name: "category",
    control,
  });

  const { field: sortOrderField } = useController({
    name: "sort_order",
    control,
  });

  const { field: isActiveField } = useController({
    name: "is_active",
    control,
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
        <span className="text-lg">⚙️</span> Settings
      </h2>

      {/* Category */}
      <div className="space-y-1.5">
        <Label className="font-medium">Category</Label>
        <Select
          value={categoryField.value}
          onValueChange={categoryField.onChange}
        >
          <SelectTrigger className="h-11 rounded-lg">
            <SelectValue
              placeholder={locale === "km" ? "ជ្រើសរើសប្រភេទ" : "Select category"}
            />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.key} value={cat.key}>
                {locale === "km" ? cat.labelKm : cat.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-xs text-red-500">{errors.category.message}</p>
        )}
      </div>

      {/* Sort Order */}
      <div className="space-y-1.5">
        <Label className="font-medium">
          {locale === "km" ? "លំដាប់" : "Sort Order"}
        </Label>
        <input
          type="number"
          min={0}
          {...sortOrderField}
          onChange={(e) => sortOrderField.onChange(Number(e.target.value))}
          className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="text-xs text-gray-400">
          {locale === "km"
            ? "លេខតូចជាងនឹងបង្ហាញមុននៅលើទំព័រសាធារណៈ"
            : "Lower numbers appear first on the public page."}
        </p>
      </div>

      {/* Active toggle */}
      <div className="flex items-center justify-between">
        <Label className="font-medium cursor-pointer">Active</Label>
        <Switch
          checked={isActiveField.value}
          onCheckedChange={isActiveField.onChange}
        />
      </div>
    </div>
  );
}
