"use client";

import { useState, useEffect, useCallback, useTransition, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Loader2, FileBarChart, FileText, Plus, Pencil, Trash2, ExternalLink,
  Search, Calendar,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

import {
  getReportFiles, deleteReportFile,
  getReportCustomSections, deleteReportCustomSection,
} from "@/actions/Report";
import { supabase } from "@/lib/supabase";
import type { ReportFile, ReportFileCategory, ReportCustomSection } from "@/types";
import { REPORT_FILE_CATEGORIES } from "@/types";
import { cn, adminHref } from "@/utils";

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

const SECTION_ICON_GRADIENT = "from-school-blue-700 to-school-blue-800";

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
          <Button onClick={() => router.push(adminHref(locale, "reports/files/new"))}>
            <Plus className="w-4 h-4 mr-2" />
            {t("new_file")}
          </Button>
        ) : (
          <Button onClick={() => router.push(adminHref(locale, "reports/sections/new"))}>
            <Plus className="w-4 h-4 mr-2" />
            {t("add_section")}
          </Button>
        )}
      </div>

      {/* Styled Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <TabButton active={tab === "operations"} onClick={() => handleTabChange("operations")} icon={FileBarChart}>
          {t("sections_nav")}
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
            <OperationsSummary locale={locale} />
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
                        <th className="text-left font-semibold text-gray-600 p-3 pl-5 w-2/5">{t("section_title")}</th>
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
                                  onClick={() => router.push(adminHref(locale, "reports/files/new"))}
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
                            className="group hover:bg-school-blue-50/40 transition-colors"
                          >
                            <td className="p-3 pl-5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-school-blue-50 to-school-blue-100 flex items-center justify-center shrink-0 group-hover:from-school-blue-100 group-hover:to-school-blue-200 transition-colors">
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
                                  <Link href={adminHref(locale, `reports/files/${file.id}`)} title={t("edit_file")}>
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
  locale,
}: {
  locale: "km" | "en";
}) {
  const t = useTranslations("reportAdmin");
  const router = useRouter();
  const [customSections, setCustomSections] = useState<ReportCustomSection[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDeleting, startDeleteTransition] = useTransition();
  const [sectionToDelete, setSectionToDelete] = useState<ReportCustomSection | null>(null);

  const loadCustomSections = useCallback(async () => {
    try {
      const sections = await getReportCustomSections();
      setCustomSections(sections);
    } catch (err) {
      console.error("Failed to load custom report sections:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomSections();
  }, [loadCustomSections]);

  const customSectionBlockCount = (cs: ReportCustomSection) =>
    cs.subsections.reduce((sum, sub) => sum + sub.blocks.length, 0);

  const subsectionsSummary = (cs: ReportCustomSection) =>
    `${t("subsections_count", { count: cs.subsections.length })} · ${t("blocks_count", { count: customSectionBlockCount(cs) })}`;

  const handleDeleteSection = async () => {
    if (!sectionToDelete) return;
    startDeleteTransition(async () => {
      const result = await deleteReportCustomSection(sectionToDelete.id);
      if (result.success) {
        toast.success(t("delete_success"));
        setSectionToDelete(null);
        loadCustomSections();
      } else {
        toast.error(result.error ?? t("delete_error"));
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Sections table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="text-left font-semibold text-gray-600 p-3 pl-5 w-12">#</th>
              <th className="text-left font-semibold text-gray-600 p-3">{t("section_title")}</th>
              <th className="text-left font-semibold text-gray-600 p-3 hidden sm:table-cell">{t("content_summary")}</th>
              <th className="text-left font-semibold text-gray-600 p-3">{t("status")}</th>
              <th className="text-right font-semibold text-gray-600 p-3 pr-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td className="p-3 pl-5"><Skeleton className="h-5 w-6" /></td>
                  <td className="p-3"><Skeleton className="h-5 w-40" /></td>
                  <td className="p-3 hidden sm:table-cell"><Skeleton className="h-5 w-20" /></td>
                  <td className="p-3"><Skeleton className="h-6 w-16 rounded-full" /></td>
                  <td className="p-3 pr-5"><div className="flex justify-end gap-1"><Skeleton className="h-8 w-8 rounded-md" /><Skeleton className="h-8 w-8 rounded-md" /></div></td>
                </tr>
              ))
            ) : customSections.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    icon={FileBarChart}
                    title={t("no_sections")}
                  />
                </td>
              </tr>
            ) : (
              customSections.map((cs, i) => (
                <motion.tr
                  key={cs.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="group hover:bg-school-blue-50/40 transition-colors"
                >
                  <td className="p-3 pl-5 text-gray-400 font-medium">{i + 1}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${SECTION_ICON_GRADIENT} flex items-center justify-center shrink-0`}>
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-900">
                        {locale === "km" ? cs.title_km : cs.title_en}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-500 hidden sm:table-cell">
                    {subsectionsSummary(cs)}
                  </td>
                  <td className="p-3">
                    <Badge variant={cs.is_active ? "success" : "secondary"} className="text-xs font-medium">
                      {cs.is_active ? t("active") : t("draft")}
                    </Badge>
                  </td>
                  <td className="p-3 pr-5">
                    <div className="flex items-center justify-end gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-school-blue-700 hover:bg-school-blue-50"
                        onClick={() => router.push(adminHref(locale, `reports/sections/${cs.id}`))}
                        title={t("edit_section")}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setSectionToDelete(cs)}
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

      {/* Delete confirmation dialog */}
      <Dialog open={!!sectionToDelete} onOpenChange={(open) => !open && setSectionToDelete(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-center">{t("delete_confirm_title")}</DialogTitle>
            <DialogDescription className="text-center">
              {t("delete_section_confirm_desc_1")}
              <span className="font-semibold mx-1 text-gray-700">
                {sectionToDelete && (locale === "km" ? sectionToDelete.title_km : sectionToDelete.title_en)}
              </span>
              {t("delete_confirm_desc_2")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setSectionToDelete(null)}
              disabled={isDeleting}
              className="flex-1 sm:flex-none"
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSection}
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
