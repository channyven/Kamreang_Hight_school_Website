"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Plus, Search, Eye, Edit, Trash2, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { News } from "@/types";
import { formatShortDate, getLocalizedText, adminHref } from "@/utils";
import { toast } from "sonner";
import { deleteNews, getAdminNewsList } from "@/actions/news";

const STATUS_COLORS: Record<string, "default" | "success" | "warning" | "destructive"> = {
  published: "success",
  draft: "warning",
  archived: "destructive",
};

export default function AdminNewsPage() {
  const locale = useLocale();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchNews = useCallback(async () => {
    setLoading(true);
    // Use server action (service role) to bypass RLS that restricts anon to published only
    const allItems = await getAdminNewsList();
    let items = allItems;

    if (statusFilter !== "all") {
      items = items.filter((n) => n.status === statusFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (n) =>
          n.title_en?.toLowerCase().includes(q) ||
          n.title_km?.toLowerCase().includes(q)
      );
    }

    setNews(items);
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const result = await deleteNews(id);
    if (result.success) {
      toast.success("News deleted");
      fetchNews();
    } else {
      toast.error(result.error ?? "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {locale === "km" ? "គ្រប់គ្រងព័ត៌មាន" : "News Management"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{news.length} articles</p>
        </div>
        <Button asChild className="bg-school-blue-800 hover:bg-school-blue-900">
          <Link href={adminHref(locale, "news/new")}>
            <Plus className="w-4 h-4 mr-2" />
            {locale === "km" ? "បន្ថែម" : "New Article"}
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={locale === "km" ? "ស្វែងរក..." : "Search news..."}
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["all", "published", "draft", "archived"].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className={statusFilter === s ? "bg-school-blue-800" : ""}
            >
              {s === "all" ? (locale === "km" ? "ទាំងអស់" : "All") : s}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-school-blue-800" />
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>{locale === "km" ? "រកមិនឃើញ" : "No news found"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 w-12">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    {locale === "km" ? "ចំណងជើង" : "Title"}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">
                    {locale === "km" ? "ប្រភេទ" : "Category"}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    {locale === "km" ? "ស្ថានភាព" : "Status"}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">
                    {locale === "km" ? "កាលបរិច្ឆេទ" : "Date"}
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">
                    {locale === "km" ? "សកម្មភាព" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {news.map((item, i) => {
                  const title = getLocalizedText(item.title_km, item.title_en, locale);
                  const catName = item.category
                    ? getLocalizedText(item.category.name_km, item.category.name_en, locale)
                    : null;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.featured_image && (
                            <div className="w-10 h-8 rounded overflow-hidden shrink-0">
                              <Image
                                src={item.featured_image}
                                alt={title}
                                width={40}
                                height={32}
                                className="object-cover w-full h-full"
                                unoptimized={item.featured_image.includes("google.com") || item.featured_image.includes("firebasestorage")}
                              />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className={`font-medium text-gray-900 truncate max-w-[200px] ${locale === "km" ? "font-khmer" : ""}`}>
                              {title}
                            </p>
                            {item.is_featured && (
                              <span className="text-xs text-school-gold-500 flex items-center gap-0.5 mt-0.5">
                                <Star className="w-3 h-3 fill-current" /> Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {catName && (
                          <Badge variant="outline" className="text-xs">{catName}</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_COLORS[item.status] ?? "default"} className="text-xs capitalize">
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-400 hidden lg:table-cell text-xs">
                        {formatShortDate(item.publish_date ?? item.created_at, locale)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <Link href={`/${locale}/news/${item.slug}`} target="_blank">
                              <Eye className="w-4 h-4 text-gray-500" />
                            </Link>
                          </Button>
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <Link href={adminHref(locale, `news/${item.id}`)}>
                              <Edit className="w-4 h-4 text-blue-500" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(item.id, title)}
                          >
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
