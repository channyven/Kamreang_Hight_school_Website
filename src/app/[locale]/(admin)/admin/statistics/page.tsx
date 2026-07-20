"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Plus, Edit, Trash2, Loader2, StarOff, TrendingUp, Users, GraduationCap, BookOpen, School, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Statistics } from "@/types";
import { toast } from "sonner";
import { getAdminStatisticsList, deleteStatistics, setCurrentStatistics } from "@/actions/statistics";
import { formatNumber } from "@/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";

const t = (locale: string, km: string, en: string) => locale === "km" ? km : en;

// ─── Summary Card ─────────────────────────────────────────────
function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent: "blue" | "amber" | "emerald" | "violet" | "rose";
}) {
  const accentMap = {
    blue:    { bg: "bg-blue-50",    text: "text-blue-600",    ring: "ring-blue-200/50", bar: "#1e3a8a" },
    amber:   { bg: "bg-amber-50",   text: "text-amber-600",   ring: "ring-amber-200/50", bar: "#f59e0b" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-200/50", bar: "#10b981" },
    violet:  { bg: "bg-violet-50",  text: "text-violet-600",  ring: "ring-violet-200/50", bar: "#8b5cf6" },
    rose:    { bg: "bg-rose-50",    text: "text-rose-600",    ring: "ring-rose-200/50", bar: "#f43f5e" },
  };
  const a = accentMap[accent];
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-3.5 ring-1 ${a.ring} hover:shadow-sm transition-shadow`}>
      <div className={`p-1.5 rounded-lg w-fit ${a.bg}`}>
        <Icon className={`w-4 h-4 ${a.text}`} />
      </div>
      <p className="mt-2 text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminStatisticsPage() {
  const locale = useLocale();
  const [items, setItems] = useState<Statistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState<"bar" | "line">("bar");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const data = await getAdminStatisticsList();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSetCurrent = async (id: string) => {
    const result = await setCurrentStatistics(id);
    if (result.success) {
      toast.success(t(locale, "បានធ្វើបច្ចុប្បន្នភាពឆ្នាំបច្ចុប្បន្ន", "Updated current year"));
      fetchItems();
    } else toast.error(result.error ?? t(locale, "បរាជ័យ", "Failed"));
  };

  const handleDelete = async (id: string, year: string) => {
    if (!confirm(t(locale, `លុបស្ថិតិ "${year}"?`, `Delete statistics for "${year}"?`))) return;
    const result = await deleteStatistics(id);
    if (result.success) {
      toast.success(t(locale, "បានលុបស្ថិតិ", "Statistics deleted"));
      fetchItems();
    } else toast.error(result.error ?? t(locale, "បរាជ័យ", "Failed"));
  };

  // ─── Summary calculations ──────────────────────────────────
  const summary = useMemo(() => {
    const total = items.length;
    const avgStudents = total > 0
      ? Math.round(items.reduce((sum, s) => sum + (s.total_students ?? 0), 0) / total)
      : 0;
    const avgTeachers = total > 0
      ? Math.round(items.reduce((sum, s) => sum + (s.total_teachers ?? 0), 0) / total)
      : 0;
    const avgGraduation = total > 0
      ? items.reduce((sum, s) => sum + (s.graduation_rate ?? 0), 0) / total
      : 0;
    const totalStudents = items.reduce((sum, s) => sum + (s.total_students ?? 0), 0);
    return { total, avgStudents, avgTeachers, avgGraduation, totalStudents };
  }, [items]);

  // ─── Chart data ────────────────────────────────────────────
  const chartData = useMemo(() => {
    // Take up to 8 most recent years, sorted chronologically
    return [...items]
      .sort((a, b) => a.academic_year.localeCompare(b.academic_year))
      .slice(-8)
      .map((s) => ({
        year: s.academic_year,
        students: s.total_students ?? 0,
        teachers: s.total_teachers ?? 0,
        classes: s.total_classes ?? 0,
        graduationRate: s.graduation_rate ?? 0,
        passRate: s.pass_rate ?? 0,
      }));
  }, [items]);

  // ─── Labels ────────────────────────────────────────────────
  const labels = {
    pageTitle: t(locale, "គ្រប់គ្រងស្ថិតិ", "Statistics Management"),
    addYear: t(locale, "បន្ថែមឆ្នាំ", "Add Year"),
    academicYear: t(locale, "ឆ្នាំសិក្សា", "Academic Year"),
    students: t(locale, "សិស្ស", "Students"),
    teachers: t(locale, "គ្រូ", "Teachers"),
    classes: t(locale, "ថ្នាក់", "Classes"),
    graduationRate: t(locale, "អត្រាជាប់", "Graduation %"),
    current: t(locale, "បច្ចុប្បន្ន", "Current"),
    actions: t(locale, "សកម្មភាព", "Actions"),
    setCurrent: t(locale, "កំណត់ជាបច្ចុប្បន្ន", "Set Current"),
    noData: t(locale, "គ្មានទិន្នន័យ", "No statistics found"),
    enrollmentTrends: t(locale, "និន្នាការចុះឈ្មោះ", "Enrollment Trends"),
    avgStudents: t(locale, "សិស្សមធ្យម", "Avg Students"),
    avgTeachers: t(locale, "គ្រូមធ្យម", "Avg Teachers"),
    totalStudents: t(locale, "សិស្សសរុប", "Total Students"),
    avgGraduation: t(locale, "អត្រាជាប់មធ្យម", "Avg Graduation"),
    years: t(locale, "ឆ្នាំ", "Years"),
    studentsM: t(locale, "ប្រុស", "M"),
    studentsF: t(locale, "ស្រី", "F"),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{labels.pageTitle}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {summary.total} {labels.years} &middot; {formatNumber(summary.totalStudents)} {labels.totalStudents.toLowerCase()}
          </p>
        </div>
        <Button asChild className="bg-school-blue-800 hover:bg-school-blue-900">
          <Link href={`/${locale}/admin/statistics/new`}>
            <Plus className="w-4 h-4 mr-2" />
            {labels.addYear}
          </Link>
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard
          icon={School}
          label={labels.years}
          value={String(summary.total)}
          accent="blue"
        />
        <SummaryCard
          icon={Users}
          label={labels.avgStudents}
          value={formatNumber(summary.avgStudents, locale)}
          sub={t(locale, `${summary.totalStudents.toLocaleString()} សរុប`, `${summary.totalStudents.toLocaleString()} total`)}
          accent="violet"
        />
        <SummaryCard
          icon={GraduationCap}
          label={labels.avgTeachers}
          value={String(summary.avgTeachers)}
          accent="amber"
        />
        <SummaryCard
          icon={BarChart3}
          label={labels.avgGraduation}
          value={`${summary.avgGraduation.toFixed(1)}%`}
          accent="emerald"
        />
      </div>

      {/* Trend chart */}
      {chartData.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-school-blue-800" />
              <h2 className="font-semibold text-gray-900">{labels.enrollmentTrends}</h2>
            </div>
            <div className="flex gap-1">
              <Button
                variant={chartView === "bar" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setChartView("bar")}
              >
                {t(locale, "ជួរឈរ", "Bar")}
              </Button>
              <Button
                variant={chartView === "line" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setChartView("line")}
              >
                {t(locale, "បន្ទាត់", "Line")}
              </Button>
            </div>
          </div>

          {chartView === "bar" ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} barGap={4} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="students" name={labels.students} fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="teachers" name={labels.teachers} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="classes" name={labels.classes} fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Line type="monotone" dataKey="students" name={labels.students} stroke="#1e3a8a" strokeWidth={2} dot={{ fill: "#1e3a8a", r: 4 }} />
                <Line type="monotone" dataKey="teachers" name={labels.teachers} stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 4 }} />
                <Line type="monotone" dataKey="graduationRate" name={labels.graduationRate} stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Data table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-school-blue-800" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-400">{labels.noData}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">{labels.academicYear}</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">{labels.students}</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">{labels.teachers}</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">{labels.classes}</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">{labels.graduationRate}</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">{labels.current}</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">{labels.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 transition-colors ${item.is_current ? "bg-amber-50/50" : ""}`}
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900">{item.academic_year}</td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium">{item.total_students?.toLocaleString() ?? "—"}</span>
                        {item.male_students != null && item.female_students != null && (
                          <span className="text-xs text-gray-400 ml-1">
                            ({item.male_students}{labels.studentsM}/{item.female_students}{labels.studentsF})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">{item.total_teachers ?? "—"}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">{item.total_classes ?? "—"}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-600">
                      {item.graduation_rate != null ? `${item.graduation_rate}%` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {item.is_current ? (
                        <Badge variant="warning" className="text-xs">
                          {t(locale, "បច្ចុប្បន្ន", "Current")}
                        </Badge>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleSetCurrent(item.id)}
                        >
                          <StarOff className="w-3 h-3 mr-1" />
                          {labels.setCurrent}
                        </Button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                          <Link href={`/${locale}/admin/statistics/${item.id}`}>
                            <Edit className="w-4 h-4 text-blue-500" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(item.id, item.academic_year)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
