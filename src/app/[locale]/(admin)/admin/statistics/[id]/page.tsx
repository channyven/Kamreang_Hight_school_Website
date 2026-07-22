"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { adminHref } from "@/utils";
import { statisticsSchema, type StatisticsInput } from "@/schemas/validations";
import { createStatistics, updateStatistics, getAdminStatisticsById } from "@/actions/statistics";
import type { Statistics } from "@/types";

interface PageProps { params: Promise<{ id: string }>; }

const t = (locale: string, km: string, en: string) => locale === "km" ? km : en;

// Fields to exclude from the form auto-fill (metadata, not user-editable)
const EXCLUDED_FIELDS = new Set(["id", "created_at", "updated_at", "created_by", "updated_by"]);

/** Map a Statistics record to form field values. */
function mapRecordToForm(data: Statistics): Partial<StatisticsInput> {
  const form: Partial<StatisticsInput> = {};
  for (const [key, value] of Object.entries(data)) {
    if (!EXCLUDED_FIELDS.has(key) && value !== null) {
      (form as Record<string, unknown>)[key] = value;
    }
  }
  return form;
}

export default function StatisticsFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === "new";
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(!isNew);

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } =
    useForm<StatisticsInput>({
      resolver: zodResolver(statisticsSchema),
      defaultValues: { is_current: false },
    });

  useEffect(() => {
    if (!isNew) {
      getAdminStatisticsById(id).then((data) => {
        if (data) reset(mapRecordToForm(data));
        setLoading(false);
      });
    }
  }, [id, isNew, reset]);

  const onSubmit = async (data: StatisticsInput) => {
    const result = isNew ? await createStatistics(data) : await updateStatistics(id, data);
    if (result.success) {
      toast.success(t(locale, "បានរក្សាទុកស្ថិតិ", isNew ? "Statistics created!" : "Statistics updated!"));
      router.push(adminHref(locale, "statistics"));
    } else {
      toast.error(result.error ?? t(locale, "បរាជ័យក្នុងការរក្សាទុក", "Failed to save"));
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={adminHref(locale, "statistics")}>
            <ArrowLeft className="w-4 h-4 mr-1" />{t(locale, "ត្រឡប់", "Back")}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew
            ? t(locale, "បន្ថែមស្ថិតិ", "Add Statistics")
            : t(locale, "កែស្ថិតិ", "Edit Statistics")}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Academic Year */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">{t(locale, "ឆ្នាំសិក្សា", "Academic Year")}</h2>
          <div className="space-y-1.5">
            <Label>{t(locale, "ឆ្នាំសិក្សា", "Academic Year")} *</Label>
            <Input {...register("academic_year")} placeholder="2023-2024" />
            {errors.academic_year && <p className="text-xs text-red-500">{errors.academic_year.message}</p>}
          </div>
          <div className="flex items-center justify-between">
            <Label>{t(locale, "កំណត់ជាឆ្នាំបច្ចុប្បន្ន", "Mark as Current Year")}</Label>
            <Controller
              name="is_current"
              control={control}
              render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
            />
          </div>
        </div>

        {/* Student Data */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">{t(locale, "ទិន្នន័យសិស្ស", "Student Data")}</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t(locale, "សិស្សសរុប", "Total Students")} error={errors.total_students?.message}>
              <Input type="number" {...register("total_students", { valueAsNumber: true })} placeholder="0" />
            </Field>
            <Field label={t(locale, "សិស្សប្រុស", "Male Students")} error={errors.male_students?.message}>
              <Input type="number" {...register("male_students", { valueAsNumber: true })} placeholder="0" />
            </Field>
            <Field label={t(locale, "សិស្សស្រី", "Female Students")} error={errors.female_students?.message}>
              <Input type="number" {...register("female_students", { valueAsNumber: true })} placeholder="0" />
            </Field>
            <Field label={t(locale, "សិស្សថ្មី", "New Students")} error={errors.new_students?.message}>
              <Input type="number" {...register("new_students", { valueAsNumber: true })} placeholder="0" />
            </Field>
          </div>
        </div>

        {/* Staff & Infrastructure */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">{t(locale, "បុគ្គលិក និងហេដ្ឋារចនាសម្ព័ន្ធ", "Staff & Infrastructure")}</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t(locale, "គ្រូសរុប", "Total Teachers")} error={errors.total_teachers?.message}>
              <Input type="number" {...register("total_teachers", { valueAsNumber: true })} placeholder="0" />
            </Field>
            <Field label={t(locale, "ថ្នាក់សរុប", "Total Classes")} error={errors.total_classes?.message}>
              <Input type="number" {...register("total_classes", { valueAsNumber: true })} placeholder="0" />
            </Field>
            <Field label={t(locale, "អត្រាជាប់ (%)", "Graduation Rate (%)")} error={errors.graduation_rate?.message}>
              <Input type="number" step="0.1" {...register("graduation_rate", { valueAsNumber: true })} placeholder="98.5" />
            </Field>
            <Field label={t(locale, "អត្រាប្រឡងជាប់ (%)", "Pass Rate (%)")} error={errors.pass_rate?.message}>
              <Input type="number" step="0.1" {...register("pass_rate", { valueAsNumber: true })} placeholder="95.0" />
            </Field>
          </div>
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full bg-school-blue-800 hover:bg-school-blue-900" disabled={isSubmitting} size="lg">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {isNew
            ? t(locale, "បង្កើតស្ថិតិ", "Create Statistics")
            : t(locale, "កែប្រែស្ថិតិ", "Update Statistics")}
        </Button>
      </form>
    </div>
  );
}

// ─── Field wrapper ─────────────────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
