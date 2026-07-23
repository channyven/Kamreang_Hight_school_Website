"use client";

import { useState, useEffect, useCallback, useTransition, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Loader2, FileBarChart, FileText, Plus, Pencil, Trash2, ExternalLink,
  Search, Info, Clock, Users, Building2, Wallet, AlertTriangle,
  Rocket, UserCheck, Eye, Calendar,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

import { getReportFiles, deleteReportFile } from "@/actions/Report";
import { supabase } from "@/lib/supabase";
import type { ReportFile, ReportFileCategory } from "@/types";
import { REPORT_FILE_CATEGORIES } from "@/types";
import { cn } from "@/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

type Tab = "operations" | "files";

// ─── Section icons for the operations summary ───────────────
const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  general: Info,
  teaching_hours: Clock,
  student_stats: Users,
  staff_status: UserCheck,
  facilities: Building2,
  budget: Wallet,
  challenges: AlertTriangle,
  future_direction: Rocket,
};

const SECTION_COLORS: Record<string, string> = {
  general: "from-blue-500 to-blue-600",
  teaching_hours: "from-emerald-500 to-emerald-600",
  student_stats: "from-violet-500 to-violet-600",
  staff_status: "from-cyan-500 to-cyan-600",
  facilities: "from-amber-500 to-amber-600",
  budget: "from-rose-500 to-rose-600",
  challenges: "from-orange-500 to-orange-600",
  future_direction: "from-indigo-500 to-indigo-600",
};

export default function AdminReportsPage() {
  const t = useTranslations("reportAdmin");
  const locale = useLocale() as "km" | "en";
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("operations");
  const [files, setFiles] = useState<ReportFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ReportFileCategory | "all">("all");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [isDeleting, startDeleteTransition] = useTransition();
  const [fileToDelete, setFileToDelete] = useState<ReportFile | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReportFiles({
        category: activeCategory === "all" ? undefined : activeCategory,
        search: search || undefined,
      });
      setFiles(data);
    } catch (err) {
      console.error("Failed to fetch report files:", err);
      toast.error(t("loading_error"));
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search, t]);

  // Debounced search
  useEffect(() => {
    if (tab !== "files") return;
    const timer = setTimeout(fetchFiles, 300);
    return () => clearTimeout(timer);
  }, [tab, fetchFiles]);

  // Real-time subscription
  useEffect(() => {
    if (tab !== "files") return;
    const channel = supabase
      .channel("report-files-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "report_files" }, () => {
        fetchFiles();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tab, fetchFiles]);

  // Keyboard shortcut: Cmd+K focuses search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleDelete = async () => {
    if (!fileToDelete) return;
    startDeleteTransition(async () => {
      const result = await deleteReportFile(fileToDelete.id);
      if (result.success) {
        toast.success(t("delete_success"));
        setFileToDelete(null);
        fetchFiles();
      } else {
        toast.error(result.error ?? t("delete_error"));
      }
    });
  };

  const getCategoryLabel = (categoryKey: ReportFileCategory) => {
    const cat = REPORT_FILE_CATEGORIES.find(c => c.key === categoryKey);
    return locale === 'km' ? cat?.labelKm : cat?.labelEn;
  };

  // ── Tab switch handler with animation ────────────────────────
  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("subtitle")}</p>
        </div>
        {tab === "files" ? (
          <Button onClick={() => router.push(`/${locale}/admin/reports/files/new`)}>
            <Plus className="w-4 h-4 mr-2" />
            {t("new_file")}
          </Button>
        ) : (
          <Button onClick={() => router.push(`/${locale}/admin/reports/operations`)}>
            <Pencil className="w-4 h-4 mr-2" />
            {t("edit_operations")}
          </Button>
        )}
      </div>

      {/* Styled Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <TabButton active={tab === "operations"} onClick={() => handleTabChange("operations")} icon={FileBarChart}>
          {t("operations")}
        </TabButton>
        <TabButton active={tab === "files"} onClick={() => handleTabChange("files")} icon={FileText}>
          {t("files")}
          {!loading && files.length > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0 min-w-[20px] text-center">{files.length}</Badge>
          )}
        </TabButton>
      </div>

      {/* Tab Content with animation */}
      <AnimatePresence mode="wait">
        {tab === "operations" ? (
          <motion.div
            key="operations"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <OperationsSummary
              locale={locale}
              onEdit={() => router.push(`/${locale}/admin/reports/operations`)}
              onView={() => window.open(`/${locale}/report`, "_blank")}
            />
          </motion.div>
        ) : (
          <motion.div
            key="files"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="min-h-[420px] border-gray-200 shadow-sm overflow-hidden">
              {/* Toolbar */}
              <CardHeader className="p-4 border-b border-gray-100 bg-white">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      ref={searchInputRef}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={`${t("search")} (Ctrl+K)`}
                      className="pl-9 h-9 text-sm"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    <FilterChip
                      active={activeCategory === "all"}
                      onClick={() => setActiveCategory("all")}
                    >
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
              </CardHeader>

              {/* Table */}
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/80">
                        <th className="text-left font-semibold text-gray-600 p-3 pl-5 w-2/5">{t("title")}</th>
                        <th className="text-left font-semibold text-gray-600 p-3 hidden md:table-cell">{t("academic_year")}</th>
                        <th className="text-left font-semibold text-gray-600 p-3 hidden sm:table-cell">{t("category")}</th>
                        <th className="text-left font-semibold text-gray-600 p-3">{t("published")}</th>
                        <th className="text-right font-semibold text-gray-600 p-3 pr-5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <tr key={i}>
                            <td className="p-3 pl-5"><Skeleton className="h-5 w-3/4" /></td>
                            <td className="p-3 hidden md:table-cell"><Skeleton className="h-5 w-20" /></td>
                            <td className="p-3 hidden sm:table-cell"><Skeleton className="h-5 w-24" /></td>
                            <td className="p-3"><Skeleton className="h-6 w-16 rounded-full" /></td>
                            <td className="p-3 pr-5"><div className="flex justify-end gap-1"><Skeleton className="h-8 w-8 rounded-md" /><Skeleton className="h-8 w-8 rounded-md" /></div></td>
                          </tr>
                        ))
                      ) : files.length === 0 ? (
                        <tr>
                          <td colSpan={5}>
                            <EmptyState
                              icon={FileText}
                              title={t("no_files")}
                              action={
                                <Button
                                  size="sm"
                                  onClick={() => router.push(`/${locale}/admin/reports/files/new`)}
                                >
                                  <Plus className="w-4 h-4 mr-1.5" />
                                  {t("new_file")}
                                </Button>
                              }
                            />
                          </td>
                        </tr>
                      ) : (
                        files.map((file, index) => (
                          <motion.tr
                            key={file.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="group hover:bg-blue-50/40 transition-colors"
                          >
                            <td className="p-3 pl-5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0 group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                                  <FileText className="w-4 h-4 text-school-blue-700" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 truncate max-w-[200px] sm:max-w-[300px]">
                                    {locale === "km" ? file.title_km : file.title_en}
                                  </p>
                                  <p className="text-xs text-gray-400 md:hidden mt-0.5">
                                    {getCategoryLabel(file.category)}
                                    {file.academic_year && ` · ${file.academic_year}`}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-gray-600 hidden md:table-cell">
                              {file.academic_year ? (
                                <span className="inline-flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                  {file.academic_year}
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="p-3 hidden sm:table-cell">
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                                {getCategoryLabel(file.category)}
                              </span>
                            </td>
                            <td className="p-3">
                              <Badge
                                variant={file.is_active ? "success" : "secondary"}
                                className="text-xs font-medium"
                              >
                                {file.is_active ? t("published") : t("draft")}
                              </Badge>
                            </td>
                            <td className="p-3 pr-5">
                              <div className="flex items-center justify-end gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-400 hover:text-school-blue-700 hover:bg-blue-50"
                                  asChild
                                >
                                  <a href={file.file_url} target="_blank" rel="noopener noreferrer" title="Open file">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                                  asChild
                                >
                                  <Link href={`/${locale}/admin/reports/files/${file.id}`} title={t("edit_file")}>
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => setFileToDelete(file)}
                                  title={t("remove_item")}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer summary */}
                {!loading && files.length > 0 && (
                  <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {files.length} {t("file_count")}
                      {activeCategory !== "all" && ` · ${getCategoryLabel(activeCategory as ReportFileCategory)}`}
                      {search && ` · "${search}"`}
                    </span>
                    <span className="text-gray-300">
                      {files.filter(f => f.is_active).length} {t("published").toLowerCase()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation dialog */}
      <Dialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-center">{t("delete_confirm_title")}</DialogTitle>
            <DialogDescription className="text-center">
              {t("delete_confirm_desc_1")}
              <span className="font-semibold mx-1 text-gray-700">
                {fileToDelete && (locale === "km" ? fileToDelete.title_km : fileToDelete.title_en)}
              </span>
              {t("delete_confirm_desc_2")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setFileToDelete(null)}
              disabled={isDeleting}
              className="flex-1 sm:flex-none"
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 sm:flex-none"
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────

function TabButton({
  active, onClick, icon: Icon, children,
}: {
  active: boolean; onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all duration-200",
        active
          ? "border-school-blue-800 text-school-blue-800"
          : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
      )}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
}

function FilterChip({
  active, onClick, children,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
        active
          ? "bg-school-blue-800 text-white shadow-sm shadow-blue-200"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
      )}
    >
      {children}
    </button>
  );
}

function OperationsSummary({
  locale, onEdit, onView,
}: {
  locale: "km" | "en"; onEdit: () => void; onView: () => void;
}) {
  const t = useTranslations("reportAdmin");

  const sections = [
    { key: "general", label: t("general") },
    { key: "teaching_hours", label: t("teaching_hours") },
    { key: "student_stats", label: t("student_stats") },
    { key: "staff_status", label: t("staff_status") },
    { key: "facilities", label: t("facilities") },
    { key: "budget", label: t("budget") },
    { key: "challenges", label: t("challenges") },
    { key: "future_direction", label: t("future_direction") },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-school-blue-800 to-school-blue-700 flex items-center justify-center shrink-0 shadow-md shadow-blue-200">
              <FileBarChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t("operations")}</h2>
              <p className="text-sm text-gray-500 mt-1 max-w-xl">
                {locale === "km"
                  ? "របាយការណ៍ប្រតិបត្តិការប្រចាំឆ្នាំរបស់សាលា ដែលបង្ហាញនៅទំព័រសាធារណៈ។"
                  : "The annual school operations report shown on the public site."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={onView}>
              <Eye className="w-4 h-4 mr-1.5" />
              {locale === "km" ? "មើល" : "Preview"}
            </Button>
            <Button onClick={onEdit} size="sm">
              <Pencil className="w-4 h-4 mr-1.5" />
              {t("edit_operations")}
            </Button>
          </div>
        </div>
      </div>

      {/* Sections grid */}
      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {sections.map(({ key, label }, i) => {
            const Icon = SECTION_ICONS[key] ?? FileText;
            const gradient = SECTION_COLORS[key] ?? "from-gray-500 to-gray-600";
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="group relative rounded-xl border border-gray-100 bg-white p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default overflow-hidden"
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} text-white mb-3 shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  {label}
                </p>
                {/* Hover accent bar */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon, title, description, action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string; description?: string; action?: React.ReactNode;
}) {
  return (
    <div className="py-16 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 text-gray-300 mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      {description && <p className="text-xs text-gray-400 mb-4">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
