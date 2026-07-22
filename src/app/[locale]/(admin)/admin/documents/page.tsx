"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getDocuments, deleteDocument } from "@/actions/Document";
import { supabase } from "@/lib/supabase";
import DocumentHeader from "@/components/admin/documents/DocumentHeader";
import DocumentToolbar from "@/components/admin/documents/DocumentToolbar";
import DocumentEmptyState from "@/components/admin/documents/DocumentEmptyState";
import DocumentList from "@/components/admin/documents/DocumentList";
import type { AppDocument, DocumentCategory } from "@/types";

/**
 * Admin Documents Management page.
 *
 * Features:
 * - List all uploaded documents with search and category filtering
 * - Delete documents
 * - Empty state when no documents exist
 * - Future-ready for upload, pagination, and API integration
 */
export default function AdminDocumentsPage() {
  const locale = useLocale();
  const router = useRouter();

  // ─── State ────────────────────────────────────────────────
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | "all">("all");

  // ─── Fetch documents ──────────────────────────────────────
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDocuments({
        category: activeCategory,
        search: search || undefined,
      });
      setDocuments(data);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      toast.error(locale === "km" ? "មិនអាចផ្ទុកឯកសារបានទេ" : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search, locale]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // ─── Delete handler ────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    const docTitle = locale === "km" ? doc?.title_km : doc?.title_en;
    const confirmMsg =
      locale === "km"
        ? `លុប "${docTitle}"?`
        : `Delete "${docTitle}"?`;

    if (!confirm(confirmMsg)) return;

    const result = await deleteDocument(id);
    if (result.success) {
      toast.success(locale === "km" ? "លុបឯកសារដោយជោគជ័យ" : "Document deleted");
      fetchDocuments();
    } else {
      toast.error(result.error ?? (locale === "km" ? "លុបមិនបានសម្រេច" : "Failed to delete"));
    }
  };

  // ─── Navigate to new document page ───────────────────────
  const handleCreateNew = () => {
    router.push(`/${locale}/admin/documents/new`);
  };

  // ─── Subscribe to realtime changes ────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("documents-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "downloads" },
        () => {
          fetchDocuments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDocuments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <DocumentHeader totalCount={documents.length} onCreateNew={handleCreateNew} />

      {/* Toolbar */}
      <DocumentToolbar
        search={search}
        onSearchChange={setSearch}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Content area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm min-h-[420px]">
        {loading ? (
          <div className="flex items-center justify-center h-[420px]">
            <Loader2 className="w-8 h-8 animate-spin text-school-blue-800" />
          </div>
        ) : documents.length === 0 ? (
          <DocumentEmptyState />
        ) : (
          <DocumentList
            documents={documents}
            loading={false}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
