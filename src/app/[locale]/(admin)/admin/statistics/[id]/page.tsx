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
import { statisticsSchema, type StatisticsInput } from "@/schemas/validations";
import { createStatistics, updateStatistics } from "@/actions/statistics";
import { supabase } from "@/lib/supabase";

interface PageProps { params: Promise<{ id: string }>; }

export default function StatisticsFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === "new";
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(!isNew);

  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } =
    useForm<StatisticsInput>({ resolver: zodResolver(statisticsSchema), defaultValues: { is_current: false } });

  useEffect(() => {
    if (!isNew) {
      supabase.from("statistics").select("*").eq("id", id).single().then(({ data }) => {
        if (data) Object.entries(data).forEach(([k, v]) => { if (v !== null) setValue(k as keyof StatisticsInput, v as string); });
        setLoading(false);
      });
    }
  }, [id, isNew, setValue]);

  const onSubmit = async (data: StatisticsInput) => {
    const result = isNew ? await createStatistics(data) : await updateStatistics(id, data);
    if (result.success) { toast.success(isNew ? "Statistics created!" : "Statistics updated!"); router.push(`/${locale}/admin/statistics`); }
    else toast.error(result.error ?? "Failed to save");
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/admin/statistics`}><ArrowLeft className="w-4 h-4 mr-1" />{locale === "km" ? "ត្រឡប់" : "Back"}</Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? (locale === "km" ? "បន្ថែមស្ថិតិ" : "Add Statistics") : (locale === "km" ? "កែស្ថិតិ" : "Edit Statistics")}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Academic Year</h2>

          <div className="space-y-1.5">
            <Label>Academic Year *</Label>
            <Input {...register("academic_year")} placeholder="2023-2024" />
            {errors.academic_year && <p className="text-xs text-red-500">{errors.academic_year.message}</p>}
          </div>

          <div className="flex items-center justify-between">
            <Label>Mark as Current Year</Label>
            <Controller name="is_current" control={control} render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Student Data</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Total Students</Label>
              <Input type="number" {...register("total_students", { valueAsNumber: true })} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Male Students</Label>
              <Input type="number" {...register("male_students", { valueAsNumber: true })} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Female Students</Label>
              <Input type="number" {...register("female_students", { valueAsNumber: true })} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>New Students</Label>
              <Input type="number" {...register("new_students", { valueAsNumber: true })} placeholder="0" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Staff & Infrastructure</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Total Teachers</Label>
              <Input type="number" {...register("total_teachers", { valueAsNumber: true })} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Total Classes</Label>
              <Input type="number" {...register("total_classes", { valueAsNumber: true })} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Graduation Rate (%)</Label>
              <Input type="number" step="0.1" {...register("graduation_rate", { valueAsNumber: true })} placeholder="98.5" />
            </div>
            <div className="space-y-1.5">
              <Label>Pass Rate (%)</Label>
              <Input type="number" step="0.1" {...register("pass_rate", { valueAsNumber: true })} placeholder="95.0" />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full bg-school-blue-800 hover:bg-school-blue-900" disabled={isSubmitting} size="lg">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {isNew ? "Create Statistics" : "Update Statistics"}
        </Button>
      </form>
    </div>
  );
}
