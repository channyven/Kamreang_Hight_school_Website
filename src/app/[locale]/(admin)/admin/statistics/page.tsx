"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Plus, Edit, Trash2, Loader2, StarOff, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import type { Statistics } from "@/types";
import { toast } from "sonner";
import { deleteStatistics, setCurrentStatistics } from "@/actions/statistics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminStatisticsPage() {
  const locale = useLocale();
  const [items, setItems] = useState<Statistics[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("statistics").select("*").order("academic_year", { ascending: false });
    setItems((data ?? []) as Statistics[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSetCurrent = async (id: string) => {
    const result = await setCurrentStatistics(id);
    if (result.success) { toast.success("Updated current year"); fetchItems(); }
    else toast.error(result.error ?? "Failed to update");
  };

  const handleDelete = async (id: string, year: string) => {
    if (!confirm(`Delete statistics for "${year}"?`)) return;
    const result = await deleteStatistics(id);
    if (result.success) { toast.success("Statistics deleted"); fetchItems(); }
    else toast.error(result.error ?? "Failed to delete");
  };

  const chartData = items.slice(0, 5).reverse().map((s) => ({
    year: s.academic_year,
    students: s.total_students,
    teachers: s.total_teachers,
    classes: s.total_classes,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {locale === "km" ? "គ្រប់គ្រងស្ថិតិ" : "Statistics Management"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} academic years</p>
        </div>
        <Button asChild className="bg-school-blue-800 hover:bg-school-blue-900">
          <Link href={`/${locale}/admin/statistics/new`}>
            <Plus className="w-4 h-4 mr-2" />
            {locale === "km" ? "បន្ថែម" : "Add Year"}
          </Link>
        </Button>
      </div>

      {/* Trend chart */}
      {chartData.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-school-blue-800" />
            <h2 className="font-semibold text-gray-900">Enrollment Trends</h2>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="students" name="Students" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="teachers" name="Teachers" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="classes" name="Classes" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No statistics found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Academic Year</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Students</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Teachers</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Classes</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Graduation %</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Current</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${item.is_current ? "bg-amber-50/50" : ""}`}>
                    <td className="px-4 py-3 font-semibold text-gray-900">{item.academic_year}</td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium">{item.total_students?.toLocaleString()}</span>
                        {item.male_students != null && item.female_students != null && (
                          <span className="text-xs text-gray-400 ml-1">({item.male_students}M / {item.female_students}F)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">{item.total_teachers}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">{item.total_classes}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-600">
                      {item.graduation_rate != null ? `${item.graduation_rate}%` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {item.is_current ? (
                        <Badge variant="warning" className="text-xs">Current</Badge>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleSetCurrent(item.id)}>
                          <StarOff className="w-3 h-3 mr-1" />Set Current
                        </Button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                          <Link href={`/${locale}/admin/statistics/${item.id}`}><Edit className="w-4 h-4 text-blue-500" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(item.id, item.academic_year)}>
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
