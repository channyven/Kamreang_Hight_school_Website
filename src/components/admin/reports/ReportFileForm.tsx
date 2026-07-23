"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Loader2, FileText, ExternalLink,
  Globe, BookOpen, Calendar, Eye
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { reportFileSchema, type ReportFileInput } from "@/schemas/validations";
import { createReportFile, updateReportFile, getReportFileById } from "@/actions/Report";
import { REPORT_FILE_CATEGORIES, type ReportFileCategory } from "@/types";
import { adminHref } from "@/utils";

interface ReportFileFormProps {
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
    setValue,
    watch,
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

  const watchedUrl = watch("file_url");
  const watchedActive = watch("is_active");

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
          router.push(adminHref(locale, "reports"));
        }
      } catch (err) {
        console.error("Failed to load report file:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id, locale, router, reset]);

  const onSubmit = async (data: ReportFileInput) => {
    const result = editing
      ? await updateReportFile(id!, data)
      : await createReportFile(data);

    if (result.success) {
      toast.success(locale === "km" ? "បានរក្សាទុក!" : "Saved!");
      reset();
      router.push(adminHref(locale, "reports"));
    } else {
      toast.error(result.error ?? (locale === "km" ? "រក្សាទុកមិនបាន" : "Failed to save"));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href={adminHref(locale, "reports")}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t("back")}
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {editing ? t("edit_file") : t("new_file")}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {editing
                ? (locale === "km" ? "កែប្រែឯកសាររបាយការណ៍" : "Edit report file details")
                : (locale === "km" ? "បន្ថែមឯកសាររបាយការណ៍ថ្មី" : "Add a new report file to the library")}
            </p>
          </div>
        </div>
        {watchedUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={watchedUrl} target="_blank" rel="noopener noreferrer">
              <Eye className="w-4 h-4 mr-1.5" />
              {locale === "km" ? "មើល" : "View"}
            </a>
          </Button>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-9 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-9 w-full" /></div>
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-9 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-9 w-full" /></div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Titles */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <Globe className="w-4 h-4 text-school-blue-700" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">
                {locale === "km" ? "ចំណងជើង" : "Title"}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={`${t("title")} (${locale === "km" ? "ខ្មែរ" : "KM"})`} error={errors.title_km?.message}>
                <Input {...register("title_km")} placeholder={locale === "km" ? "បញ្ចូលចំណងជើងជាភាសាខ្មែរ" : "Enter Khmer title"} />
              </Field>
              <Field label={`${t("title")} (${locale === "km" ? "អង់គ្លេស" : "EN"})`} error={errors.title_en?.message}>
                <Input {...register("title_en")} placeholder={locale === "km" ? "បញ្ចូលចំណងជើងជាភាសាអង់គ្លេស" : "Enter English title"} />
              </Field>
            </div>

            <Separator />

            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-emerald-700" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">
                {locale === "km" ? "ការពិពណ៌នា" : "Description"}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={`Description (KM)`}>
                <Textarea {...register("description_km")} rows={3} placeholder={locale === "km" ? "ការពិពណ៌នាជាភាសាខ្មែរ" : "Khmer description"} />
              </Field>
              <Field label={`Description (EN)`}>
                <Textarea {...register("description_en")} rows={3} placeholder={locale === "km" ? "ការពិពណ៌នាជាភាសាអង់គ្លេស" : "English description"} />
              </Field>
            </div>
          </div>

          {/* File Details */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-700" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">
                {locale === "km" ? "ព័ត៌មានឯកសារ" : "File Details"}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="File URL" error={errors.file_url?.message}>
                <Input
                  {...register("file_url")}
                  placeholder="https://example.com/report.pdf"
                />
              </Field>
              <Field label="File Name" error={errors.file_name?.message}>
                <Input {...register("file_name")} placeholder="report-2024.pdf" />
              </Field>
            </div>

            {/* URL Preview */}
            {watchedUrl && watchedUrl.startsWith("http") && (
              <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 flex items-center gap-3">
                <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-700 truncate flex-1">{watchedUrl}</p>
                <a
                  href={watchedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 shrink-0"
                >
                  Open
                </a>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-purple-700" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">
                {locale === "km" ? "ព័ត៌មានបន្ថែម" : "Metadata"}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label={t("category")}>
                <select
                  {...register("category")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {REPORT_FILE_CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {locale === "km" ? c.labelKm : c.labelEn}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t("academic_year")}>
                <Input {...register("academic_year")} placeholder="2024-2025" />
              </Field>
              <Field label="Sort Order">
                <Input type="number" {...register("sort_order")} placeholder="0" />
              </Field>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is-active" className="text-sm font-medium text-gray-700">
                  {t("is_published")}
                </Label>
                <p className="text-xs text-gray-500 mt-0.5">
                  {locale === "km"
                    ? "បើកមុខងារនេះ ដើម្បីឱ្យឯកសារបង្ហាញនៅលើគេហទំព័រសាធារណៈ"
                    : "When enabled, this file will be visible on the public website"}
                </p>
              </div>
              <Switch
                id="is-active"
                checked={watchedActive}
                onCheckedChange={(v) => setValue("is_active", v)}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(adminHref(locale, "reports"))}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-school-blue-800 hover:bg-school-blue-900 min-w-[160px] h-11"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editing ? (locale === "km" ? "រក្សាទុក" : "Update") : (locale === "km" ? "បង្កើត" : "Create")}
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  label, error, children,
}: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-gray-500">{label}</Label>
      {children}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
          <span className="w-1 h-1 rounded-full bg-red-600 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
