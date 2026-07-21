"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import {
  Plus, Search, Loader2, Users, Download,
  ChevronLeft, ChevronRight, Filter, X, GraduationCap,
  MoreHorizontal, Eye, Edit, Trash2, BookOpen, Calendar,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import type { Student } from "@/types";
import { toast } from "sonner";
import { deleteStudent } from "@/actions/students";
import { exportStudentsToExcel } from "@/lib/export";


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
    active: "សកម្ម", inactive: "អសកម្ម", graduated: "បញ្ចប់",
    suspended: "ផ្អាក", transferred: "ផ្ទេរ", expelled: "បណ្តេញចេញ",
  },
  en: {
    active: "Active", inactive: "Inactive", graduated: "Graduated",
    suspended: "Suspended", transferred: "Transferred", expelled: "Expelled",
  },
};

export default function AdminStudentsPage() {
  const locale = useLocale();
  const [items, setItems] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [majorFilter, setMajorFilter] = useState("all");
  const [academicYearFilter, setAcademicYearFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  

  // Store the full data separately so we can compute filter options from it
  const [fullData, setFullData] = useState<Student[]>([]);

  const hasActiveFilters =
    statusFilter !== "all" ||
    facultyFilter !== "all" ||
    majorFilter !== "all" ||
    academicYearFilter !== "all" ||
    genderFilter !== "all" ||
    search !== "";

  const clearFilters = () => {
    setStatusFilter("all");
    setFacultyFilter("all");
    setMajorFilter("all");
    setAcademicYearFilter("all");
    setGenderFilter("all");
    setSearch("");
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data: studentData } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });

      const raw = (studentData ?? []) as Student[];
      setFullData(raw);

      let list = [...raw];

      if (statusFilter !== "all") {
        list = list.filter((s) => s.status === statusFilter);
      }
      if (facultyFilter !== "all") {
        list = list.filter((s) => s.faculty === facultyFilter);
      }
      if (majorFilter !== "all") {
        list = list.filter((s) => s.major === majorFilter);
      }
      if (academicYearFilter !== "all") {
        list = list.filter((s) => s.academic_year === academicYearFilter);
      }
      if (genderFilter !== "all") {
        list = list.filter((s) => s.gender === genderFilter);
      }
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

      setItems(list);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, [search, statusFilter, facultyFilter, majorFilter, academicYearFilter, genderFilter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete student "${name}"?`)) return;
    const result = await deleteStudent(id);
    if (result.success) { toast.success("Student deleted"); fetchItems(); }
    else toast.error(result.error ?? "Failed to delete");
  };



  const getStatusLabel = (status: string) =>
    STATUS_LABELS[locale as keyof typeof STATUS_LABELS]?.[status] ?? status;

  // Compute unique values from the full (unfiltered) dataset
  const filterOptions = useMemo(() => {
    const data = fullData.length > 0 ? fullData : items;
    return {
      faculties: [...new Set(data.map((s) => s.faculty).filter(Boolean))] as string[],
      majors: [...new Set(data.map((s) => s.major).filter(Boolean))] as string[],
      academicYears: [...new Set(data.map((s) => s.academic_year).filter(Boolean))] as string[],
      genders: [...new Set(data.map((s) => s.gender).filter(Boolean))] as string[],
    };
  }, [fullData, items]);

  const columnHelper = createColumnHelper<Student>();

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "photo_name",
        header: () => <span className="font-medium">Student</span>,
        cell: (info) => {
          const s = info.row.original;
          const en = `${s.english_first_name} ${s.english_last_name}`;
          const kh = s.khmer_first_name ? `${s.khmer_first_name} ${s.khmer_last_name}` : null;
          return (
            <div className="flex items-center gap-3">
              {s.photo ? (
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-gray-100">
                  <Image
                    src={s.photo}
                    alt={en}
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
                <p className="font-medium text-gray-900 truncate max-w-[160px]">{en}</p>
                {kh && (
                  <p className="text-xs text-gray-400 font-khmer truncate max-w-[160px]">{kh}</p>
                )}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("student_id", {
        header: () => <span className="font-medium">Student Code</span>,
        cell: (info) => (
          <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("class_name", {
        header: () => <span className="font-medium">Class</span>,
        cell: (info) => (
          <span className="text-sm font-medium text-gray-700">{info.getValue() ?? "—"}</span>
        ),
      }),
      columnHelper.accessor("faculty", {
        header: () => <span className="font-medium">Department</span>,
        cell: (info) => (
          <span className="text-xs text-gray-500 max-w-[120px] truncate block">{info.getValue() ?? "—"}</span>
        ),
      }),
      columnHelper.accessor("status", {
        header: () => <span className="font-medium">Status</span>,
        cell: (info) => {
          const status = info.getValue() ?? "active";
          return (
            <Badge variant={STATUS_COLORS[status] ?? "default"} className="text-xs capitalize">
              {getStatusLabel(status)}
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => null,
        cell: (info) => {
          const s = info.row.original;
          const name = `${s.english_first_name} ${s.english_last_name}`;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/admin/students/${s.id}`} className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/admin/students/${s.id}/edit`} className="flex items-center gap-2">
                    <Edit className="w-4 h-4 text-blue-500" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 text-red-600 focus:text-red-600"
                  onClick={() => handleDelete(s.id, name)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ],
    [locale, getStatusLabel, columnHelper, handleDelete]
  );

  const table = useReactTable({
    data: items,
      columns: columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage student records, cards, and status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-sm gap-2"
            onClick={() => exportStudentsToExcel(items, `students_${new Date().toISOString().split('T')[0]}`)}
            disabled={items.length === 0}
          >
            <Download className="w-4 h-4" /> Export Excel
          </Button>

          <Button asChild
            className="bg-blue-600 hover:bg-blue-700 h-9 text-sm gap-2"
          >
            <Link href={`/${locale}/admin/students/new`}>
              <Plus className="w-4 h-4" /> Add Student
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
        {/* Search row */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name or student ID..."
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

        {/* Filter dropdowns */}
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-8 text-xs bg-gray-50">
              <Filter className="w-3 h-3 mr-1.5 text-gray-400" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="graduated">Graduated</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="transferred">Transferred</SelectItem>
              <SelectItem value="expelled">Expelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={facultyFilter} onValueChange={setFacultyFilter}>
            <SelectTrigger className="w-40 h-8 text-xs bg-gray-50">
              <GraduationCap className="w-3 h-3 mr-1.5 text-gray-400" />
              <SelectValue placeholder="Faculty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Faculties</SelectItem>
              {filterOptions.faculties.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={majorFilter} onValueChange={setMajorFilter}>
            <SelectTrigger className="w-40 h-8 text-xs bg-gray-50">
              <BookOpen className="w-3 h-3 mr-1.5 text-gray-400" />
              <SelectValue placeholder="Major" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Majors</SelectItem>
              {filterOptions.majors.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
            <SelectTrigger className="w-36 h-8 text-xs bg-gray-50">
              <Calendar className="w-3 h-3 mr-1.5 text-gray-400" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {filterOptions.academicYears.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-32 h-8 text-xs bg-gray-50">
              <Users className="w-3 h-3 mr-1.5 text-gray-400" />
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              {filterOptions.genders.map((g) => (
                <SelectItem key={g} value={g} className="capitalize">{g}</SelectItem>
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
            {statusFilter !== "all" && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                <Filter className="w-3 h-3" />
                {getStatusLabel(statusFilter)}
                <button onClick={() => setStatusFilter("all")} className="hover:text-green-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {facultyFilter !== "all" && (
              <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                <GraduationCap className="w-3 h-3" />
                {facultyFilter}
                <button onClick={() => setFacultyFilter("all")} className="hover:text-purple-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {majorFilter !== "all" && (
              <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
                <BookOpen className="w-3 h-3" />
                {majorFilter}
                <button onClick={() => setMajorFilter("all")} className="hover:text-orange-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {academicYearFilter !== "all" && (
              <span className="inline-flex items-center gap-1 text-xs bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full border border-cyan-200">
                <Calendar className="w-3 h-3" />
                {academicYearFilter}
                <button onClick={() => setAcademicYearFilter("all")} className="hover:text-cyan-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {genderFilter !== "all" && (
              <span className="inline-flex items-center gap-1 text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full border border-pink-200 capitalize">
                <Users className="w-3 h-3" />
                {genderFilter}
                <button onClick={() => setGenderFilter("all")} className="hover:text-pink-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-gray-400 hover:text-gray-600 hover:underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">No students found</p>
            <p className="text-xs mt-1 text-gray-400">
              Add a new student or adjust your search filters
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                {table.getPageCount() > 1
                  ? `Page ${table.getState().pagination.pageIndex + 1} of ${table.getPageCount()} (${items.length} total)`
                  : `${items.length} students`}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: table.getPageCount() }, (_, i) => (
                  <Button
                    key={i}
                    variant={table.getState().pagination.pageIndex === i ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0 text-xs"
                    onClick={() => table.setPageIndex(i)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>


    </div>
  );
}
