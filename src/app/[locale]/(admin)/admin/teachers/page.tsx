"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Teacher } from "@/types";
import { getLocalizedText, adminHref } from "@/utils";
import { toast } from "sonner";
import { deleteTeacher, fetchTeachers } from "@/actions/teachers";

export default function AdminTeachersPage() {
  const locale = useLocale();
  const [items, setItems] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const list = await fetchTeachers();
    const q = search.toLowerCase();
    const filtered = q
      ? list.filter((t: Teacher) => t.name_en?.toLowerCase().includes(q) || t.name_km?.toLowerCase().includes(q))
      : list;
    setItems(filtered);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const result = await deleteTeacher(id);
    if (result.success) { toast.success("Teacher deleted"); fetchItems(); }
    else toast.error(result.error ?? "Failed to delete");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {locale === "km" ? "គ្រប់គ្រងគ្រូបង្រៀន" : "Teachers Management"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} teachers</p>
        </div>
        <Button asChild className="bg-school-blue-800 hover:bg-school-blue-900">
          <Link href={adminHref(locale, "teachers/new")}>
            <Plus className="w-4 h-4 mr-2" />
            {locale === "km" ? "បន្ថែម" : "New Teacher"}
          </Link>
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input placeholder={locale === "km" ? "ស្វែងរក..." : "Search..."} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-400">{locale === "km" ? "រកមិនឃើញ" : "No teachers found"}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 w-12">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Subject</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden xl:table-cell">Gender</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, i) => {
                  const name = item.name_km;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.photo_url ? (
                            <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-blue-100 shadow-sm">
                              <Image src={item.photo_url} alt={name} width={44} height={44} className="object-cover w-full h-full" />
                            </div>
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0 ring-2 ring-blue-100">
                              <span className="text-sm font-bold text-blue-400">{name?.[0] ?? "?"}</span>
                            </div>
                          )}
                          <p className={`font-medium text-gray-900 truncate max-w-[200px] ${locale === "km" ? "font-khmer" : ""}`}>{name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                        {getLocalizedText(item.subject_km, item.subject_en, locale)}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-600 text-xs font-mono">
                        {item.phone || "—"}
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        {item.gender ? (
                          <Badge variant="outline" className="text-xs">
                            {item.gender === "Male" ? "♂ " : "♀ "}
                            {item.gender}
                          </Badge>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={item.is_active ? "success" : "default"} className="text-xs">
                          {item.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <Link href={adminHref(locale, `teachers/${item.id}`)}><Edit className="w-4 h-4 text-blue-500" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(item.id, name ?? "")}>
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
