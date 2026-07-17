"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { reportFileSchema, type ReportFileInput } from "@/schemas/validations";
import { createReportFile, updateReportFile, getReportFileById } from "@/actions/Report";
import { REPORT_FILE_CATEGORIES, type ReportFileCategory } from "@/types";

interface ReportFileFormProps {
  /** When provided, the form is in edit mode. */
  id?: string;
}

export default function ReportFileForm({ id }: ReportFileFormProps) {
  const t = useTranslations("reportAdmin");
  const locale = useLocale() as "km" | "en";
  const router = useRouter();
  const editing = Boolean(id);
  const [loading, setLoading] = useState(editing);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReportFileInput>({
    resolver: zodResolver(reportFileSchema),
    defaultValues: {
      category: "report",
      sort_order: 0,
      is_active: true,
      title_km: "",
      title_en: "",
      description_km: "",
      description_en: "",
      file_url: "",
      file_name: "",
      academic_year: "",
    },
  });

  // Load existing record in edit mode.
  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const file = await getReportFileById(id);
        if (file && active) {
          reset({
            title_km: file.title_km,
            title_en: file.title_en,
            description_km: file.description_km ?? "",
            description_en: file.description_en ?? "",
            file_url: file.file_url,
            file_name: file.file_name,
            category: file.category as ReportFileCategory,
            academic_year: file.academic_year ?? "",
            sort_order: file.sort_order,
            is_active: file.is_active,
          });
        } else if (!file && active) {
          toast.error(locale === "km" ? "រកមិនឃើញ" : "Not found");
          router.push(`/${locale}/admin/reports`);
        }
      } catch (err) {
        console.error("Failed to load report file:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, locale, router, reset]);

  const onSubmit = async (data: ReportFileInput) => {
    const result = editing
      ? await updateReportFile(id!, data)
      : await createReportFile(data);

    if (result.success) {
      toast.success(locale === "km" ? "បានរក្សាទុក!" : "Saved!");
      reset();
      router.push(`/${locale}/admin/reports`);
    } else {
      toast.error(result.error ?? (locale === "km" ? "រក្សាទុកមិនបាន" : "Failed to save"));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/admin/reports`}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t("back")}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {editing ? t("edit_file") : t("new_file")}
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[360px]">
          <Loader2 className="w-8 h-8 animate-spin text-school-blue-800" />
        </div>
      ) : (
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={`${t("title")} (KM)`} error={errors.title_km?.message}>
            <input {...register("title_km")} className={inputCls} />
          </Field>
          <Field label={`${t("title")} (EN)`} error={errors.title_en?.message}>
            <input {...register("title_en")} className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={`${t("title")} desc (KM)`}>
            <textarea {...register("description_km")} rows={2} className={inputCls} />
          </Field>
          <Field label={`${t("title")} desc (EN)`}>
            <textarea {...register("description_en")} rows={2} className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="File URL" error={errors.file_url?.message}>
            <input {...register("file_url")} className={inputCls} placeholder="https://..." />
          </Field>
          <Field label="File Name" error={errors.file_name?.message}>
            <input {...register("file_name")} className={inputCls} placeholder="report-2024.pdf" />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label={t("category")}>
            <select {...register("category")} className={inputCls}>
              {REPORT_FILE_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {locale === "km" ? c.labelKm : c.labelEn}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("academic_year")}>
            <input {...register("academic_year")} className={inputCls} placeholder="2024-2025" />
          </Field>
          <Field label="Sort Order">
            <input type="number" {...register("sort_order")} className={inputCls} />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" {...register("is_active")} className="w-4 h-4 rounded accent-school-blue-800" />
          {t("is_published")}
        </label>

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
          {t("save")}
        </Button>
      </form>
      )}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-school-blue-800/30";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-500 mb-1 block">{label}</span>
      {children}
      {error && <span className="text-xs text-red-600 mt-1 block">{error}</span>}
    </label>
  );
}
