"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, FileBarChart, FileText, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { getReportFiles, deleteReportFile } from "@/actions/Report";
import { supabase } from "@/lib/supabase";
import type { ReportFile, ReportFileCategory } from "@/types";
import { REPORT_FILE_CATEGORIES } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import Link from "next/link";

type Tab = "operations" | "files";

export default function AdminReportsPage() {
  const t = useTranslations("reportAdmin");
  const locale = useLocale() as "km" | "en";
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("operations");
  const [files, setFiles] = useState<ReportFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ReportFileCategory | "all">("all");

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReportFiles({
        category: activeCategory,
        search: search || undefined,
      });
      setFiles(data);
    } catch (err) {
      console.error("Failed to fetch report files:", err);
      toast.error(locale === "km" ? "មិនអាចផ្ទុកឯកសារបាន" : "Failed to load report files");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search, locale]);

  useEffect(() => {
    if (tab === "files") fetchFiles();
  }, [tab, fetchFiles]);

  useEffect(() => {
    if (tab !== "files") return;
    const channel = supabase
      .channel("report-files-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "report_files" }, () => {
        fetchFiles();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tab, fetchFiles]);

  const handleDelete = async (id: string) => {
    const file = files.find((f) => f.id === id);
    const name = locale === "km" ? file?.title_km : file?.title_en;
    if (!confirm(locale === "km" ? `លុប "${name}"?` : `Delete "${name}"?`)) return;
    const result = await deleteReportFile(id);
    if (result.success) {
      toast.success(locale === "km" ? "លុបដោយជោគជ័យ" : "Deleted");
      fetchFiles();
    } else {
      toast.error(result.error ?? (locale === "km" ? "លុបមិនបាន" : "Failed to delete"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("subtitle")}</p>
        </div>
        {tab === "files" && (
          <Button
            onClick={() => router.push(`/${locale}/admin/reports/files/new`)}
            className="bg-school-blue-800 hover:bg-school-blue-900 shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("new_file")}
          </Button>
        )}
        {tab === "operations" && (
          <Button
            onClick={() => router.push(`/${locale}/admin/reports/operations`)}
            className="bg-school-blue-800 hover:bg-school-blue-900 shrink-0"
          >
            <Pencil className="w-4 h-4 mr-2" />
            {t("edit_operations")}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <TabButton active={tab === "operations"} onClick={() => setTab("operations")} icon={FileBarChart}>
          {t("operations")}
        </TabButton>
        <TabButton active={tab === "files"} onClick={() => setTab("files")} icon={FileText}>
          {t("files")}
          {!loading && files.length > 0 && (
            <span className="ml-2 text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
              {files.length}
            </span>
          )}
        </TabButton>
      </div>

      {/* Content */}
      {tab === "operations" ? (
        <OperationsSummary locale={locale} onEdit={() => router.push(`/${locale}/admin/reports/operations`)} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm min-h-[420px]">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("search")}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-school-blue-800/30"
            />
            <div className="flex gap-1 flex-wrap">
              <FilterChip active={activeCategory === "all"} onClick={() => setActiveCategory("all")}>
                {t("all")}
              </FilterChip>
              {REPORT_FILE_CATEGORIES.map((c) => (
                <FilterChip
                  key={c.key}
                  active={activeCategory === c.key}
                  onClick={() => setActiveCategory(c.key)}
                >
                  {locale === "km" ? c.labelKm : c.labelEn}
                </FilterChip>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-[360px]">
              <Loader2 className="w-8 h-8 animate-spin text-school-blue-800" />
            </div>
          ) : files.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: "#c0c8d4" }} />
              <p className="text-sm" style={{ color: "#c0c8d4" }}>{t("no_files")}</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {files.map((file) => (
                <li key={file.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50">
                  <div className="w-9 h-9 rounded-lg bg-school-blue-50 text-school-blue-800 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {locale === "km" ? file.title_km : file.title_en}
                    </p>
                    <p className="text-xs text-gray-500">
                      {file.academic_year ? `${file.academic_year} · ` : ""}
                      {locale === "km"
                        ? REPORT_FILE_CATEGORIES.find((c) => c.key === file.category)?.labelKm
                        : REPORT_FILE_CATEGORIES.find((c) => c.key === file.category)?.labelEn}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-gray-400 hover:text-school-blue-800 hover:bg-gray-100"
                      title="Open"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <Link
                      href={`/${locale}/admin/reports/files/${file.id}`}
                      className="p-2 rounded-lg text-gray-400 hover:text-school-blue-800 hover:bg-gray-100"
                      title={t("edit_file")}
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                      title={t("remove_item")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
        active
          ? "border-school-blue-800 text-school-blue-800"
          : "border-transparent text-gray-500 hover:text-gray-800"
      )}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
        active
          ? "bg-school-blue-800 text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      )}
    >
      {children}
    </button>
  );
}

/**
 * Lightweight read-only summary of the current operations report so admins
 * see its state directly from the list tab without a separate fetch-heavy load.
 */
function OperationsSummary({ locale, onEdit }: { locale: "km" | "en"; onEdit: () => void }) {
  const t = useTranslations("reportAdmin");
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{t("operations")}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {locale === "km"
              ? "របាយការណ៍ប្រតិបត្តិការប្រចាំឆ្នាំរបស់សាលា ដែលបង្ហាញនៅទំព័រសាធារណៈ។"
              : "The annual school operations report shown on the public site."}
          </p>
        </div>
        <Button onClick={onEdit} variant="outline" size="sm">
          <Pencil className="w-4 h-4 mr-1.5" />
          {t("edit_operations")}
        </Button>
      </div>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          t("general"),
          t("teaching_hours"),
          t("student_stats"),
          t("facilities"),
          t("budget"),
          t("challenges"),
          t("future_direction"),
          t("staff_status"),
        ].map((label) => (
          <div key={label} className="rounded-lg bg-gray-50 px-3 py-2.5 text-sm text-gray-600">
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
