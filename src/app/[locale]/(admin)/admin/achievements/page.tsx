"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Plus, Search, Edit, Trash2, Loader2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import type { Achievement } from "@/types";
import { formatShortDate, getLocalizedText } from "@/utils";
import { toast } from "sonner";
import { deleteAchievement } from "@/actions/achievements";

const LEVEL_COLORS: Record<string, string> = {
  national: "bg-red-100 text-red-700",
  provincial: "bg-orange-100 text-orange-700",
  district: "bg-blue-100 text-blue-700",
  school: "bg-green-100 text-green-700",
};

const STATUS_COLORS: Record<string, "default" | "success" | "warning" | "destructive"> = {
  published: "success",
  draft: "warning",
  archived: "destructive",
};

export default function AdminAchievementsPage() {
  const locale = useLocale();
  const [items, setItems] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("achievements").select("*").order("achievement_date", { ascending: false });
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    const { data } = await query;
    let list = (data ?? []) as Achievement[];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.title_en?.toLowerCase().includes(q) || a.title_km?.toLowerCase().includes(q));
    }
    setItems(list);
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const result = await deleteAchievement(id);
    if (result.success) { toast.success("Achievement deleted"); fetchItems(); }
    else toast.error(result.error ?? "Failed to delete");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {locale === "km" ? "គ្រប់គ្រងសមិទ្ធផល" : "Achievements Management"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} achievements</p>
        </div>
        <Button asChild className="bg-school-blue-800 hover:bg-school-blue-900">
          <Link href={`/${locale}/admin/achievements/new`}>
            <Plus className="w-4 h-4 mr-2" />
            {locale === "km" ? "បន្ថែម" : "New Achievement"}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder={locale === "km" ? "ស្វែងរក..." : "Search..."} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {["all", "published", "draft", "archived"].map((s) => (
            <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)} className={statusFilter === s ? "bg-school-blue-800" : ""}>
              {s === "all" ? (locale === "km" ? "ទាំងអស់" : "All") : s}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-400">{locale === "km" ? "រកមិនឃើញ" : "No achievements found"}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 w-12">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Level</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, i) => {
                  const title = getLocalizedText(item.title_km, item.title_en, locale);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            <div className="w-10 h-8 rounded overflow-hidden shrink-0">
                              <Image src={item.image_url} alt={title} width={40} height={32} className="object-cover w-full h-full" />
                            </div>
                          ) : (
                            <div className="w-10 h-8 rounded bg-yellow-50 flex items-center justify-center shrink-0">
                              <Trophy className="w-4 h-4 text-yellow-500" />
                            </div>
                          )}
                          <p className={`font-medium text-gray-900 truncate max-w-[200px] ${locale === "km" ? "font-khmer" : ""}`}>{title}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {item.award_level && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[item.award_level] ?? "bg-gray-100 text-gray-700"}`}>
                            {item.award_level}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs">
                        {item.achievement_date && formatShortDate(item.achievement_date, locale)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_COLORS[item.status] ?? "default"} className="text-xs capitalize">{item.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <Link href={`/${locale}/admin/achievements/${item.id}`}><Edit className="w-4 h-4 text-blue-500" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(item.id, title)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
