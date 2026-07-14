"use client";

import { useState, useEffect, use } from "react";
import { useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getDocumentById, updateDocument } from "@/actions/Document";
import type { DocumentInput } from "@/schemas/validations";
import { documentSchema } from "@/schemas/validations";
import ContentCard from "@/components/admin/documents/ContentCard";
import FileCard from "@/components/admin/documents/FileCard";
import SettingsCard from "@/components/admin/documents/SettingsCard";
import type { DocumentCategory } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditDocumentPage({ params }: PageProps) {
  const { id } = use(params);
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DocumentInput>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      category: "other",
      sort_order: 0,
      is_active: true,
      title_km: "",
      title_en: "",
      description_km: "",
      description_en: "",
      file_url: "",
      file_name: "",
    },
  });

  // Fetch the document data and populate the form
  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      try {
        const doc = await getDocumentById(id);
        if (doc) {
          // Map the joined category slug back to our DocumentCategory enum
          const categorySlug = doc.category?.slug ?? "";
          const categoryMap: Record<string, DocumentCategory> = {
            reports: "report",
            "exam-results": "result",
            "registration-forms": "form",
            "school-policies": "policy",
            "other-documents": "other",
          };

          reset({
            title_km: doc.title_km ?? "",
            title_en: doc.title_en ?? "",
            description_km: doc.description_km ?? "",
            description_en: doc.description_en ?? "",
            file_url: doc.file_url ?? "",
            file_name: doc.file_name ?? "",
            category: categoryMap[categorySlug] ?? "other",
            sort_order: doc.sort_order ?? 0,
            is_active: doc.is_active ?? true,
          });
        } else {
          toast.error(
            locale === "km"
              ? "រកមិនឃើញឯកសារ"
              : "Document not found"
          );
          router.push(`/${locale}/admin/documents`);
        }
      } catch (err) {
        console.error("Failed to fetch document:", err);
        toast.error(
          locale === "km"
            ? "មិនអាចផ្ទុកឯកសារបានទេ"
            : "Failed to load document"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [id, locale, router, reset]);

  const onSubmit = async (data: DocumentInput) => {
    const result = await updateDocument(id, data);

    if (result.success) {
      toast.success(
        locale === "km" ? "ឯកសារត្រូវបានកែប្រែ!" : "Document updated!"
      );
      router.push(`/${locale}/admin/documents`);
    } else {
      toast.error(
        result.error ??
          (locale === "km"
            ? "កែប្រែឯកសារមិនបានសម្រេច"
            : "Failed to update document")
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <Loader2 className="w-8 h-8 animate-spin text-school-blue-800" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/admin/documents`}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            {locale === "km" ? "ត្រឡប់" : "Back"}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {locale === "km" ? "កែប្រែឯកសារ" : "Edit Document"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left column (70%) - Content + File */}
          <div className="lg:col-span-3 space-y-5">
            <ContentCard register={register} errors={errors} />
            <FileCard register={register} errors={errors} />
          </div>

          {/* Right column (30%) - Settings + Submit */}
          <div className="lg:col-span-2 space-y-5">
            <SettingsCard control={control} errors={errors} />

            <Button
              type="submit"
              className="w-full bg-school-blue-800 hover:bg-school-blue-900 rounded-lg h-12 text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              {locale === "km" ? "រក្សាទុក" : "Update Document"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
