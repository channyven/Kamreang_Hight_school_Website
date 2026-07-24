"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { cn } from "@/utils";
import type { Locale } from "@/i18n/config";
import type { ReportCustomSection } from "@/types";
import {
  SectionShell,
  getSectionIcon,
  CustomSection,
} from "./ReportSections";

export default function ReportClient({
  locale,
  customSections,
}: {
  locale: Locale;
  customSections: ReportCustomSection[];
}) {
  const t = useTranslations("report");
  const [activeId, setActiveId] = useState(customSections[0]?.id ?? "");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const selectSection = (id: string) => {
    setActiveId(id);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navItems = customSections.map((cs) => ({
    id: cs.id,
    label: locale === "km" ? cs.title_km : cs.title_en,
    icon: getSectionIcon("FileText"),
  }));

  const activeSection = customSections.find((cs) => cs.id === activeId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
      {/* ─── Desktop sticky nav ─── */}
      <aside className="hidden lg:block">
        <div className="sticky top-28">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 px-3">
            {t("on_this_page")}
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => selectSection(item.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                    isActive
                      ? "bg-school-blue-800 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-school-blue-800"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ─── Mobile nav (collapsible) ─── */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileNavOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm text-sm font-medium text-school-blue-900"
        >
          <span className="flex items-center gap-2">
            <Menu className="w-4 h-4" />
            {t("jump_to")}: {navItems.find((n) => n.id === activeId)?.label}
          </span>
          {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
        {mobileNavOpen && (
          <nav className="mt-2 bg-white border border-gray-200 rounded-xl shadow-sm p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => selectSection(item.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                    isActive
                      ? "bg-school-blue-800 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* ─── Content: only the selected section ─── */}
      <div className="min-w-0">
        {activeSection && (
          <SectionShell
            key={activeSection.id}
            id={`custom-${activeSection.id}`}
            title={locale === "km" ? activeSection.title_km : activeSection.title_en}
            icon={getSectionIcon("FileText")}
          >
            <CustomSection subsections={activeSection.subsections} locale={locale} />
          </SectionShell>
        )}
      </div>
    </div>
  );
}
