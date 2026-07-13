import { useLocale } from "next-intl";

interface CategoryBadgeProps {
  category?: { name_km: string; name_en: string; slug: string } | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  reports: "bg-blue-100 text-blue-700",
  "exam-results": "bg-purple-100 text-purple-700",
  "registration-forms": "bg-green-100 text-green-700",
  "school-policies": "bg-orange-100 text-orange-700",
  "other-documents": "bg-gray-100 text-gray-600",
};

/**
 * Small rounded badge displaying the document category name
 * with a color that matches the category type.
 */
export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const locale = useLocale();

  if (!category) return null;

  const label = locale === "km" ? category.name_km : category.name_en;
  const color = CATEGORY_COLORS[category.slug] ?? "bg-gray-100 text-gray-600";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
