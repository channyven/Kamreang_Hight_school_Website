"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  Search, X, Download, Printer, QrCode, ZoomIn,
  ChevronLeft, ChevronRight, Users, Check,
  Archive, GraduationCap, Calendar, ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Student } from "@/types";
import { getStudents } from "@/actions/students";
import { downloadQrCode } from "@/lib/qrcode";
import { toast } from "sonner";
import StudentQrDetailModal from "@/components/admin/students/StudentQrDetailModal";
import { adminHref } from "@/utils";

// ─── Constants ─────────────────────────────────────────────────

const STATUS_COLORS: Record<string, "success" | "default" | "warning" | "danger" | "info"> = {
  active: "success",
  inactive: "default",
  graduated: "info",
  suspended: "danger",
  transferred: "warning",
  expelled: "danger",
};

const STATUS_LABELS: Record<string, Record<string, string>> = {
  km: {
    active: "សកម្ម",
    inactive: "អសកម្ម",
    graduated: "បញ្ចប់",
    suspended: "ផ្អាក",
    transferred: "ផ្ទេរ",
    expelled: "បណ្តេញចេញ",
  },
  en: {
    active: "Active",
    inactive: "Inactive",
    graduated: "Graduated",
    suspended: "Suspended",
    transferred: "Transferred",
    expelled: "Expelled",
  },
};

const PAGE_SIZE = 15;
type SortOrder = "newest" | "oldest";

// ─── Helpers ────────────────────────────────────────────────────

function getStatusLabel(status: string, locale: string) {
  return STATUS_LABELS[locale]?.[status] ?? status;
}

function getFullName(s: Student) {
  return `${s.english_first_name} ${s.english_last_name}`;
}

function getKhmerName(s: Student) {
  return s.khmer_first_name
    ? `${s.khmer_first_name} ${s.khmer_last_name ?? ""}`
    : null;
}

// ─── Skeleton Row ───────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3">
        <div className="w-5 h-5 rounded bg-gray-200" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 rounded bg-gray-200" />
            <div className="h-3 w-20 rounded bg-gray-100" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="h-5 w-28 rounded bg-gray-200" />
      </td>
      <td className="px-4 py-3">
        <div className="h-5 w-14 rounded bg-gray-200" />
      </td>
      <td className="px-4 py-3">
        <div className="h-5 w-20 rounded bg-gray-200" />
      </td>
      <td className="px-4 py-3">
        <div className="h-5 w-16 rounded-full bg-gray-200" />
      </td>
      <td className="px-4 py-3">
        <div className="h-8 w-8 rounded bg-gray-200 mx-auto" />
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-7 w-7 rounded bg-gray-200" />
          <div className="h-7 w-7 rounded bg-gray-200" />
        </div>
      </td>
    </tr>
  );
}

// ─── Component ──────────────────────────────────────────────────

export default function StudentCardsPage() {
  const locale = useLocale();

  // ── Data state ──────────────────────────────────────────────
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Filter state ────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  // ── Selection state ─────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAllPage, setSelectAllPage] = useState(false);

  // ── QR Card modal state ─────────────────────────────────
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ── Pagination state ────────────────────────────────────────
  const [page, setPage] = useState(0);

  // ── Derived filter options ──────────────────────────────────
  const filterOptions = useMemo(() => {
    const data = allStudents;
    return {
      classes: [...new Set(data.map((s) => s.class_name).filter(Boolean))] as string[],
      batches: [...new Set(data.map((s) => s.academic_year).filter(Boolean))] as string[],
    };
  }, [allStudents]);

  // ── Filtered data ──────────────────────────────────────────
  const filteredStudents = useMemo(() => {
    let list = [...allStudents];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.student_id?.toLowerCase().includes(q) ||
          s.english_first_name?.toLowerCase().includes(q) ||
          s.english_last_name?.toLowerCase().includes(q) ||
          s.khmer_first_name?.toLowerCase().includes(q) ||
          s.khmer_last_name?.toLowerCase().includes(q)
      );
    }
    if (classFilter !== "all") {
      list = list.filter((s) => s.class_name === classFilter);
    }
    if (batchFilter !== "all") {
      list = list.filter((s) => s.academic_year === batchFilter);
    }

    // Sort by created_at
    list.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return list;
  }, [allStudents, search, classFilter, batchFilter, sortOrder]);

  // ── Paginated data ─────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paginatedStudents = useMemo(
    () => filteredStudents.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE),
    [filteredStudents, safePage]
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
    setSelectedIds(new Set());
    setSelectAllPage(false);
  }, [search, classFilter, batchFilter, sortOrder]);

  // ── Fetch data ─────────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStudents();
      setAllStudents(data as Student[]);
    } catch {
      setAllStudents([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // ── Selection handlers ─────────────────────────────────────
  const toggleSelectAll = useCallback(() => {
    if (selectAllPage) {
      setSelectedIds(new Set());
      setSelectAllPage(false);
    } else {
      const ids = new Set(paginatedStudents.map((s) => s.id));
      setSelectedIds(ids);
      setSelectAllPage(true);
    }
  }, [paginatedStudents, selectAllPage]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSelectAllPage(false);
  }, []);

  const selectedStudents = useMemo(
    () => allStudents.filter((s) => selectedIds.has(s.id)),
    [allStudents, selectedIds]
  );

  const hasSelection = selectedIds.size > 0;

  // ── QR code helpers ────────────────────────────────────────
  const getQrDataUrl = (s: Student): string | null => {
    return s.qr_code ?? null;
  };

  const handleOpenCardModal = useCallback((s: Student) => {
    setSelectedStudent(s);
    setModalOpen(true);
  }, []);

  // ── Bulk actions ──────────────────────────────────────────
  const handlePrintSelected = useCallback(() => {
    if (selectedStudents.length === 0) {
      toast.error("No students selected");
      return;
    }
    // Open a print window with a grid of student cards
    const win = window.open("", "_blank");
    if (!win) return;

    const cardsHtml = selectedStudents
      .map((s) => {
        const qr = getQrDataUrl(s);
        const photoHtml = s.photo
          ? `<img src="${s.photo}" alt="${getFullName(s)}" class="card-photo" />`
          : `<div class="card-photo-placeholder"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`;
        const qrHtml = qr
          ? `<img src="${qr}" alt="QR" class="card-qr" />`
          : `<div class="card-qr-placeholder"><span>No QR</span></div>`;
        return `
          <div class="card">
            <div class="card-header-bg"></div>
            <div class="card-content">
              <div class="card-row">
                <div class="card-photo-col">${photoHtml}</div>
                <div class="card-info-col">
                  <div class="card-name">${getFullName(s)}</div>
                  ${getKhmerName(s) ? `<div class="card-name-kh">${getKhmerName(s)}</div>` : ""}
                  <div class="card-id">${s.student_id}</div>
                  ${s.class_name ? `<div class="card-class">${s.class_name}</div>` : ""}
                </div>
                <div class="card-qr-col">${qrHtml}</div>
              </div>
            </div>
          </div>
        `;
      })
      .join("\n");

    win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Student Cards</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 15mm; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #f8fafc;
      padding: 20px;
    }
    .print-header {
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #1e3a8a;
    }
    .print-header h1 {
      font-size: 18px;
      color: #1e3a8a;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .print-header p {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
      page-break-inside: avoid;
    }
    .card-header-bg {
      height: 8px;
      background: linear-gradient(90deg, #1e3a8a, #1d4ed8);
    }
    .card-content { padding: 14px; }
    .card-row { display: flex; gap: 12px; align-items: center; }
    .card-photo { width: 64px; height: 64px; border-radius: 8px; object-fit: cover; border: 2px solid #e2e8f0; }
    .card-photo-placeholder {
      width: 64px; height: 64px; border-radius: 8px;
      background: #f1f5f9; border: 2px dashed #cbd5e1;
      display: flex; align-items: center; justify-content: center;
    }
    .card-photo-col { flex-shrink: 0; }
    .card-info-col { flex: 1; min-width: 0; }
    .card-name { font-size: 13px; font-weight: 700; color: #0f172a; }
    .card-name-kh { font-size: 11px; color: #64748b; margin-top: 1px; }
    .card-id {
      display: inline-block; font-family: 'Courier New', monospace;
      font-size: 10px; font-weight: 600;
      background: #eff6ff; color: #1d4ed8;
      padding: 1px 6px; border-radius: 3px; margin-top: 4px;
    }
    .card-class { font-size: 10px; color: #64748b; margin-top: 2px; }
    .card-qr-col { flex-shrink: 0; }
    .card-qr { width: 64px; height: 64px; border-radius: 4px; border: 1px solid #e2e8f0; padding: 2px; }
    .card-qr-placeholder {
      width: 64px; height: 64px; border-radius: 4px;
      background: #f8fafc; border: 1px dashed #e2e8f0;
      display: flex; align-items: center; justify-content: center;
      font-size: 9px; color: #94a3b8;
    }
    @media print {
      body { background: white; padding: 10mm; }
      .card { box-shadow: none; border: 1px solid #e2e8f0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="print-header no-print">
    <h1>KAMRIENG HIGH SCHOOL</h1>
    <p>Student Identification Cards — ${selectedStudents.length} students</p>
  </div>
  <div class="cards-grid">${cardsHtml}</div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        setTimeout(function() { window.close(); }, 500);
      }, 800);
    };
  </script>
</body>
</html>
    `);
    win.document.close();
    toast.success(`Printing ${selectedStudents.length} student cards`);
  }, [selectedStudents]);

  const handleDownloadSelectedQr = useCallback(() => {
    if (selectedStudents.length === 0) {
      toast.error("No students selected");
      return;
    }

    let downloaded = 0;
    let skipped = 0;

    selectedStudents.forEach((s) => {
      const qr = getQrDataUrl(s);
      if (qr) {
        downloadQrCode(qr, `${s.student_id}-${s.english_last_name}`);
        downloaded++;
      } else {
        skipped++;
      }
    });

    if (downloaded > 0) {
      toast.success(`Downloaded ${downloaded} QR code${downloaded > 1 ? "s" : ""}`);
    }
    if (skipped > 0) {
      toast.warning(`${skipped} student${skipped > 1 ? "s" : ""} had no QR code`);
    }
  }, [selectedStudents]);

  const handleDownloadAllQr = useCallback(() => {
    const allWithQr = allStudents.filter((s) => s.qr_code);
    if (allWithQr.length === 0) {
      toast.error("No QR codes available to download");
      return;
    }
    allWithQr.forEach((s) => {
      if (s.qr_code) {
        downloadQrCode(s.qr_code, `${s.student_id}-${s.english_last_name}`);
      }
    });
    toast.success(`Downloaded ${allWithQr.length} QR codes`);
  }, [allStudents]);

  const handlePrintAll = useCallback(() => {
    if (allStudents.length === 0) {
      toast.error("No students available");
      return;
    }
    setTimeout(() => {
      const win = window.open("", "_blank");
      if (!win) return;

      const cardsHtml = allStudents
        .map((s) => {
          const qr = getQrDataUrl(s);
          const photoHtml = s.photo
            ? `<img src="${s.photo}" alt="${getFullName(s)}" class="card-photo" />`
            : `<div class="card-photo-placeholder"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`;
          const qrHtml = qr
            ? `<img src="${qr}" alt="QR" class="card-qr" />`
            : `<div class="card-qr-placeholder"><span>No QR</span></div>`;
          return `
            <div class="card">
              <div class="card-header-bg"></div>
              <div class="card-content">
                <div class="card-row">
                  <div class="card-photo-col">${photoHtml}</div>
                  <div class="card-info-col">
                    <div class="card-name">${getFullName(s)}</div>
                    ${getKhmerName(s) ? `<div class="card-name-kh">${getKhmerName(s)}</div>` : ""}
                    <div class="card-id">${s.student_id}</div>
                    ${s.class_name ? `<div class="card-class">${s.class_name}</div>` : ""}
                  </div>
                  <div class="card-qr-col">${qrHtml}</div>
                </div>
              </div>
            </div>
          `;
        })
        .join("\n");

      win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>All Student Cards</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 15mm; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #f8fafc;
      padding: 20px;
    }
    .print-header {
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #1e3a8a;
    }
    .print-header h1 { font-size: 18px; color: #1e3a8a; font-weight: 700; letter-spacing: 1px; }
    .print-header p { font-size: 11px; color: #64748b; margin-top: 4px; }
    .cards-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .card {
      background: white; border-radius: 12px; overflow: hidden;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;
      page-break-inside: avoid;
    }
    .card-header-bg { height: 8px; background: linear-gradient(90deg, #1e3a8a, #1d4ed8); }
    .card-content { padding: 14px; }
    .card-row { display: flex; gap: 12px; align-items: center; }
    .card-photo { width: 64px; height: 64px; border-radius: 8px; object-fit: cover; border: 2px solid #e2e8f0; }
    .card-photo-placeholder { width: 64px; height: 64px; border-radius: 8px; background: #f1f5f9; border: 2px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; }
    .card-info-col { flex: 1; min-width: 0; }
    .card-name { font-size: 13px; font-weight: 700; color: #0f172a; }
    .card-name-kh { font-size: 11px; color: #64748b; margin-top: 1px; }
    .card-id { display: inline-block; font-family: 'Courier New', monospace; font-size: 10px; font-weight: 600; background: #eff6ff; color: #1d4ed8; padding: 1px 6px; border-radius: 3px; margin-top: 4px; }
    .card-class { font-size: 10px; color: #64748b; margin-top: 2px; }
    .card-qr-col { flex-shrink: 0; }
    .card-qr { width: 64px; height: 64px; border-radius: 4px; border: 1px solid #e2e8f0; padding: 2px; }
    .card-qr-placeholder { width: 64px; height: 64px; border-radius: 4px; background: #f8fafc; border: 1px dashed #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #94a3b8; }
    @media print { body { background: white; padding: 10mm; } .card { box-shadow: none; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="print-header no-print"><h1>KAMRIENG HIGH SCHOOL</h1><p>Student Identification Cards — ${allStudents.length} students</p></div>
  <div class="cards-grid">${cardsHtml}</div>
  <script>window.onload = function() { setTimeout(function() { window.print(); setTimeout(function() { window.close(); }, 500); }, 800); };</script>
</body>
</html>
      `);
      win.document.close();
    }, 100);
    toast.success(`Printing ${allStudents.length} student cards`);
  }, [allStudents]);

  // ── Render ────────────────────────────────────────────────
  const hasActiveFilters = search !== "" || classFilter !== "all" || batchFilter !== "all";

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Cards</h1>
          <p className="text-gray-500 text-sm mt-1">
            Search students and download their QR codes or printable student ID cards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-sm gap-2"
            onClick={handlePrintAll}
            disabled={loading || allStudents.length === 0}
          >
            <Printer className="w-4 h-4" />
            Print Student Cards
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-sm gap-2"
            onClick={handleDownloadAllQr}
            disabled={loading || allStudents.length === 0}
          >
            <Archive className="w-4 h-4" />
            Download All QR Codes
          </Button>
        </div>
      </div>

      {/* ── Search & Filters ───────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by student name or student ID..."
            className="pl-9 h-9 text-sm bg-gray-50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setSearch("")}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
            <SelectTrigger className="w-36 h-8 text-xs bg-gray-50">
              <ArrowUpDown className="w-3 h-3 mr-1.5 text-gray-400" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-40 h-8 text-xs bg-gray-50">
              <GraduationCap className="w-3 h-3 mr-1.5 text-gray-400" />
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {filterOptions.classes.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={batchFilter} onValueChange={setBatchFilter}>
            <SelectTrigger className="w-44 h-8 text-xs bg-gray-50">
              <Calendar className="w-3 h-3 mr-1.5 text-gray-400" />
              <SelectValue placeholder="All Batches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {filterOptions.batches.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active filter badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-gray-100">
            <span className="text-xs text-gray-400 mr-1">Active filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                <Search className="w-3 h-3" />
                &ldquo;{search}&rdquo;
                <button onClick={() => setSearch("")} className="hover:text-blue-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {classFilter !== "all" && (
              <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                <GraduationCap className="w-3 h-3" />
                {classFilter}
                <button onClick={() => setClassFilter("all")} className="hover:text-purple-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {batchFilter !== "all" && (
              <span className="inline-flex items-center gap-1 text-xs bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full border border-cyan-200">
                <Calendar className="w-3 h-3" />
                {batchFilter}
                <button onClick={() => setBatchFilter("all")} className="hover:text-cyan-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearch("");
                setClassFilter("all");
                setBatchFilter("all");
              }}
              className="text-xs text-gray-400 hover:text-gray-600 hover:underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Bulk Actions Bar ───────────────────────────────── */}
      {hasSelection && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Check className="w-4 h-4" />
            <span className="font-medium">{selectedIds.size}</span>
            <span>student{selectedIds.size !== 1 ? "s" : ""} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 bg-white border-blue-200 text-blue-700 hover:bg-blue-100"
              onClick={handlePrintSelected}
            >
              <Printer className="w-3.5 h-3.5" />
              Print Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 bg-white border-blue-200 text-blue-700 hover:bg-blue-100"
              onClick={handleDownloadSelectedQr}
            >
              <Download className="w-3.5 h-3.5" />
              Download QR Codes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-gray-400 hover:text-gray-600"
              onClick={() => {
                setSelectedIds(new Set());
                setSelectAllPage(false);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* ── Table Card ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["", "Student", "Student ID", "Class", "Batch", "Status", "QR Code", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">No students found</p>
            <p className="text-xs mt-1 text-gray-400">
              {hasActiveFilters
                ? "Try adjusting your search or filters"
                : "Add students first to generate their cards and QR codes"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {/* Checkbox column */}
                    <th className="w-12 px-4 py-3">
                      <Checkbox
                        checked={selectAllPage && paginatedStudents.length > 0}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Student
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Class
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Batch
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">
                      QR Code
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedStudents.map((s) => {
                    const isSelected = selectedIds.has(s.id);
                    const qrDataUrl = getQrDataUrl(s);
                    const fullName = getFullName(s);
                    const khName = getKhmerName(s);
                    const status = s.status ?? "active";

                    return (
                      <tr
                        key={s.id}
                        className={`transition-colors ${
                          isSelected ? "bg-blue-50/50 hover:bg-blue-50" : "hover:bg-gray-50"
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelect(s.id)}
                            aria-label={`Select ${fullName}`}
                          />
                        </td>

                        {/* Student (photo + name) */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {s.photo ? (
                              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-gray-100">
                                <Image
                                  src={s.photo}
                                  alt={fullName}
                                  width={40}
                                  height={40}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0 ring-2 ring-blue-50">
                                <Users className="w-5 h-5 text-blue-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate max-w-[160px]">
                                {fullName}
                              </p>
                              {khName && (
                                <p className="text-xs text-gray-400 font-khmer truncate max-w-[160px]">
                                  {khName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Student ID */}
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                            {s.student_id}
                          </span>
                        </td>

                        {/* Class */}
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-700">
                            {s.class_name ?? "—"}
                          </span>
                        </td>

                        {/* Batch */}
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-500">
                            {s.academic_year ?? "—"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <Badge
                            variant={STATUS_COLORS[status] ?? "default"}
                            className="text-xs capitalize"
                          >
                            {getStatusLabel(status, locale)}
                          </Badge>
                        </td>

                        {/* QR Code */}
                        <td className="px-4 py-3 text-center">
                          {qrDataUrl ? (
                            <div className="flex justify-center">
                              <div className="group relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={qrDataUrl}
                                  alt={`QR for ${fullName}`}
                                  className="w-10 h-10 object-contain rounded-md border border-gray-200 p-0.5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-110 hover:ring-2 hover:ring-blue-200"
                                  onClick={() => handleOpenCardModal(s)}
                                />
                                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                  <ZoomIn className="w-3 h-3 inline mr-0.5" />
                                  View details
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <div className="w-10 h-10 rounded-md bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center">
                                <QrCode className="w-4 h-4 text-gray-300" />
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all"
                              disabled={!qrDataUrl}
                              onClick={() => handleOpenCardModal(s)}
                              title="View ID Card"
                            >
                              <ZoomIn className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg hover:bg-green-50 hover:text-green-600 transition-all"
                              asChild
                              title="Download Card"
                            >
                              <Link href={adminHref(locale, `students/${s.id}/card`)}>
                                <Download className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ──────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                {filteredStudents.length > 0
                  ? `Showing ${safePage * PAGE_SIZE + 1}–${Math.min(
                      (safePage + 1) * PAGE_SIZE,
                      filteredStudents.length
                    )} of ${filteredStudents.length}`
                  : "No results"}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  // Show pages around current page
                  let pageIndex: number;
                  if (totalPages <= 7) {
                    pageIndex = i;
                  } else if (safePage <= 3) {
                    pageIndex = i;
                  } else if (safePage >= totalPages - 4) {
                    pageIndex = totalPages - 7 + i;
                  } else {
                    pageIndex = safePage - 3 + i;
                  }
                  return (
                    <Button
                      key={pageIndex}
                      variant={safePage === pageIndex ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0 text-xs"
                      onClick={() => setPage(pageIndex)}
                    >
                      {pageIndex + 1}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={safePage >= totalPages - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Summary footer ──────────────────────────────────── */}
      {!loading && allStudents.length > 0 && (
        <div className="text-center text-xs text-gray-400">
          <p>
            {allStudents.length} total student{allStudents.length !== 1 ? "s" : ""}
            {filteredStudents.length !== allStudents.length
              ? ` (${filteredStudents.length} filtered)`
              : ""}
            {" · "}
            {allStudents.filter((s) => s.qr_code).length} with QR codes
            {" · "}
            {allStudents.filter((s) => s.status === "active").length} active
          </p>
        </div>
      )}

      {/* ── QR Detail Modal ──────────────────────────────────── */}
      {selectedStudent && (
        <StudentQrDetailModal
          student={selectedStudent}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </div>
  );
}
