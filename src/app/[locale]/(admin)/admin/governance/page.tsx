"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { GovernanceItem, GovernanceSection } from "@/types";
import { getLocalizedText, cn, adminHref } from "@/utils";
import { getGovernanceIcon } from "@/lib/governance-icons";
import { toast } from "sonner";
import { deleteGovernanceItem, getAllGovernanceItems } from "@/actions/governance";

const SECTIONS: { value: GovernanceSection; label_km: string; label_en: string }[] = [
  { value: "governance", label_km: "អភិបាលកិច្ចសាលារៀន", label_en: "School Governance" },
  { value: "culture", label_km: "វប្បធម៌បង្រៀន និងរៀន", label_en: "Teaching & Learning Culture" },
];

export default function AdminGovernancePage() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const initialSection = (searchParams.get("section") as GovernanceSection) ?? "governance";
  const [items, setItems] = useState<GovernanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [section, setSection] = useState<GovernanceSection>(initialSection);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const data = await getAllGovernanceItems();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const visibleItems = useMemo(() => {
    let list = items.filter((i) => i.section === section);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.text_en?.toLowerCase().includes(q) || i.text_km?.toLowerCase().includes(q));
    }
    return list;
  }, [items, section, search]);

  const handleDelete = async (id: string, text: string) => {
    if (!confirm(`Delete "${text}"?`)) return;
    const result = await deleteGovernanceItem(id);
    if (result.success) { toast.success("Item deleted"); fetchItems(); }
    else toast.error(result.error ?? "Failed to delete");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {locale === "km" ? "គ្រប់គ្រងអភិបាលកិច្ចសាលារៀន" : "Governance Management"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {locale === "km" ? "កែសម្រួលធាតុលើទំព័រអភិបាលកិច្ច" : "Edit the items shown on the public Governance page"}
          </p>
        </div>
        <Button asChild className="bg-school-blue-800 hover:bg-school-blue-900">
          <Link href={adminHref(locale, `governance/new?section=${section}`)}>
            <Plus className="w-4 h-4 mr-2" />
            {locale === "km" ? "បន្ថែម" : "New Item"}
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-200">
        {SECTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => setSection(s.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              section === s.value
                ? "border-school-blue-800 text-school-blue-800"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {locale === "km" ? s.label_km : s.label_en}
          </button>
        ))}
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input placeholder={locale === "km" ? "ស្វែងរក..." : "Search..."} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>
        ) : visibleItems.length === 0 ? (
          <div className="text-center py-20 text-gray-400">{locale === "km" ? "រកមិនឃើញ" : "No items found"}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 w-12">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 w-12">Icon</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Text</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleItems.map((item, i) => {
                  const text = getLocalizedText(item.text_km, item.text_en, locale);
                  const Icon = getGovernanceIcon(item.icon);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-school-blue-800" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className={`text-gray-900 max-w-md ${locale === "km" ? "font-khmer" : ""}`}>{text}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={item.is_active ? "success" : "danger"} className="text-xs">
                          {item.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8">                             <Link href={adminHref(locale, `governance/${item.id}`)}><Edit className="w-4 h-4 text-blue-500" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(item.id, text ?? "")}>
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
