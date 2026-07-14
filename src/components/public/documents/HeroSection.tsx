"use client";

import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { Search, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface HeroSectionProps {
  /** Current search query value from URL params. */
  initialSearch?: string;
}

/**
 * Full-width hero banner for the Documents page.
 * Displays Khmer and English titles, a subtitle, and a search bar.
 */
export default function HeroSection({ initialSearch = "" }: HeroSectionProps) {
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState(initialSearch);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    const qs = params.toString();
    router.push(`/${locale}/document${qs ? `?${qs}` : ""}`);
  };

  return (
    <section className="bg-gradient-to-r from-[#0b2f63] to-[#1d4f91] py-20 md:py-24">
      <div className="container mx-auto px-4 text-center">
        {/* Khmer title */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-school-gold-500 text-lg md:text-xl font-khmer mb-2"
        >
          ឯកសារសាលារៀន
        </motion.p>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-white font-bold text-5xl md:text-6xl lg:text-7xl mb-3 tracking-tight"
        >
          Documents
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-white/80 text-base md:text-lg max-w-xl mx-auto mb-8"
        >
          {locale === "km"
            ? "ទាញយកឯកសារផ្លូវការ របាយការណ៍ និងបែបបទរបស់សាលា"
            : "Download official school documents, reports, and forms"}
        </motion.p>

        {/* Search bar */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          onSubmit={handleSearch}
          className="flex items-center max-w-[500px] mx-auto bg-white rounded-full shadow-lg h-[52px] overflow-hidden"
        >
          <div className="flex items-center flex-1 px-5 gap-3">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={locale === "km" ? "ស្វែងរកឯកសារតាមចំណងជើង..." : "Search documents by title..."}
              className="flex-1 h-full outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent"
            />
          </div>
          <button
            type="submit"
            className="w-[52px] h-[52px] bg-school-gold-500 hover:bg-school-gold-600 active:scale-95 transition-all duration-200 flex items-center justify-center shrink-0"
          >
            <ArrowRight className="w-5 h-5 text-white" />
          </button>
        </motion.form>
      </div>
    </section>
  );
}
