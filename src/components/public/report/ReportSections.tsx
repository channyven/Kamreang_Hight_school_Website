"use client";

import { type ReactNode } from "react";
import {
  Info,
  Clock,
  Users,
  UserCheck,
  Building2,
  Wallet,
  AlertTriangle,
  Rocket,
  ArrowUp,
  ClipboardCheck,
  Book,
  FileText,
  Award,
  Trophy,
  Calendar,
  Building,
  BarChart2,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/utils";
import type { Locale } from "@/i18n/config";
import type { ReportBlock, ReportSubsection } from "@/types";

const ICONS: Record<string, LucideIcon> = {
  Info,
  Clock,
  Users,
  UserCheck,
  Building2,
  Wallet,
  AlertTriangle,
  Rocket,
  ClipboardCheck,
  Book,
  FileText,
  Award,
  Trophy,
  Calendar,
  Building,
  BarChart2,
  BookOpen,
};

export function getSectionIcon(name: string): LucideIcon {
  return ICONS[name] ?? Info;
}

/** Shared section wrapper: anchor target + animated heading. */
export function SectionShell({
  id,
  title,
  icon,
  children,
}: {
  id: string;
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  const Icon = icon;
  return (
    <section id={id} className="scroll-mt-28 py-10 border-t border-gray-100 first:border-t-0">
      <div className="flex items-center gap-3 mb-6">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-school-blue-50 text-school-blue-800 shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-school-blue-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

// ─── Back to top ────────────────────────────────────────────

export function BackToTop({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-school-blue-700 hover:text-school-gold-600 transition-colors"
    >
      <ArrowUp className="w-4 h-4" />
      {label}
    </button>
  );
}

// ─── Dynamic, admin-created sections ──────────────────────────

function KeyValueBlock({ block, locale }: { block: ReportBlock & { type: "keyvalue" }; locale: Locale }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
      {block.rows.map((row, i) => (
        <div key={i} className="flex items-center justify-between gap-4 px-4 py-3">
          <p className={cn("text-sm font-medium text-school-blue-900", locale === "km" && "font-khmer")}>
            {locale === "km" ? row.label_km : row.label_en}
          </p>
          <p className="text-sm text-gray-600 text-right">{row.value}</p>
        </div>
      ))}
    </div>
  );
}

function TableBlock({ block, locale }: { block: ReportBlock & { type: "table" }; locale: Locale }) {
  const note = locale === "km" ? block.note_km : block.note_en;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500">
              {block.columns.map((col, i) => (
                <th key={i} className={cn("text-left font-medium px-4 py-3", locale === "km" && "font-khmer")}>
                  {locale === "km" ? col.km : col.en}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, i) => (
              <tr key={i} className="border-t border-gray-100">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-gray-700">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && (
        <p className={cn("text-xs text-gray-500 px-4 py-2.5 border-t border-gray-50", locale === "km" && "font-khmer")}>
          {note}
        </p>
      )}
    </div>
  );
}

function ListBlock({ block, locale }: { block: ReportBlock & { type: "list" }; locale: Locale }) {
  return (
    <ul className="space-y-2">
      {block.items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 bg-white rounded-lg border border-gray-100 shadow-sm px-4 py-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-school-gold-500 mt-2 shrink-0" />
          <p className={cn("text-sm text-gray-700 leading-relaxed", locale === "km" && "font-khmer")}>
            {locale === "km" ? item.km : item.en}
          </p>
        </li>
      ))}
    </ul>
  );
}

function ParagraphBlock({ block, locale }: { block: ReportBlock & { type: "paragraph" }; locale: Locale }) {
  return (
    <div className="space-y-3">
      {block.paragraphs.map((p, i) => (
        <p key={i} className={cn("text-sm text-gray-700 leading-relaxed", locale === "km" && "font-khmer")}>
          {locale === "km" ? p.km : p.en}
        </p>
      ))}
    </div>
  );
}

function ReportBlockView({ block, locale }: { block: ReportBlock; locale: Locale }) {
  switch (block.type) {
    case "keyvalue": return <KeyValueBlock block={block} locale={locale} />;
    case "table": return <TableBlock block={block} locale={locale} />;
    case "list": return <ListBlock block={block} locale={locale} />;
    case "paragraph": return <ParagraphBlock block={block} locale={locale} />;
    default: return null;
  }
}

export function CustomSection({
  subsections,
  locale,
}: {
  subsections: ReportSubsection[];
  locale: Locale;
}) {
  return (
    <div className="space-y-8">
      {subsections.map((sub) => (
        <div key={sub.key}>
          {(sub.title_km || sub.title_en) && (
            <h3 className={cn("text-base font-semibold text-school-blue-900 mb-3", locale === "km" && "font-khmer")}>
              {locale === "km" ? sub.title_km : sub.title_en}
            </h3>
          )}
          <div className="space-y-4">
            {sub.blocks.map((block, i) => (
              <ReportBlockView key={i} block={block} locale={locale} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
