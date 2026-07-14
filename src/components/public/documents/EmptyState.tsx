"use client";

import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { FolderOpen } from "lucide-react";

/**
 * Empty state placeholder shown when no documents match the current filters.
 */
export default function EmptyState() {
  const locale = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
        <FolderOpen className="w-10 h-10 text-gray-300" />
      </div>
      <h3 className="text-lg font-semibold text-gray-400 mb-2">
        {locale === "km" ? "មិនមានឯកសារទេ" : "No documents available"}
      </h3>
      <p className="text-sm text-gray-300 max-w-xs">
        {locale === "km"
          ? "បច្ចុប្បន្នមិនមានឯកសារសម្រាប់បង្ហាញទេ"
          : "There are currently no documents to display."}
      </p>
    </motion.div>
  );
}
