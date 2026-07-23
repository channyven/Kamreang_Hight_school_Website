"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, Phone, User } from "lucide-react";
import { adminHref } from "@/utils";
import Link from "next/link";
import PhotoCropUploader from "@/components/admin/PhotoCropUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { teacherSchema, type TeacherInput } from "@/schemas/validations";
import { createTeacher, updateTeacher, fetchTeacher } from "@/actions/teachers";

interface PageProps { params: Promise<{ id: string }>; }

export default function TeacherFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === "new";
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(!isNew);

  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } =
    useForm<TeacherInput>({ resolver: zodResolver(teacherSchema), defaultValues: { is_active: true, sort_order: 0, grade_levels: [] } });

  useEffect(() => {
    if (!isNew) {
      fetchTeacher(id).then((data) => {
        if (data) {
          Object.entries(data).forEach(([k, v]) => {
            if (v !== null) setValue(k as keyof TeacherInput, v as string);
          });
        }
        setLoading(false);
      });
    }
  }, [id, isNew, setValue]);

  const onSubmit = async (data: TeacherInput) => {
    const result = isNew ? await createTeacher(data) : await updateTeacher(id, data);
    if (result.success) { toast.success(isNew ? "Teacher created!" : "Teacher updated!"); router.push(adminHref(locale, "teachers")); }
    else toast.error(result.error ?? "Failed to save");
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={adminHref(locale, "teachers")}><ArrowLeft className="w-4 h-4 mr-1" />{locale === "km" ? "ត្រឡប់" : "Back"}</Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? (locale === "km" ? "បន្ថែមគ្រូបង្រៀន" : "New Teacher") : (locale === "km" ? "កែគ្រូបង្រៀន" : "Edit Teacher")}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Name</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>ឈ្មោះ (ខ្មែរ) *</Label>
                  <Input {...register("name_km")} className="font-khmer" placeholder="ឈ្មោះគ្រូបង្រៀន" />
                  {errors.name_km && <p className="text-xs text-red-500">{errors.name_km.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Name (English) *</Label>
                  <Input {...register("name_en")} placeholder="Teacher name" />
                  {errors.name_en && <p className="text-xs text-red-500">{errors.name_en.message}</p>}
                </div>
              </div>

              <h2 className="font-semibold text-gray-900 pt-2">Subject</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>មុខវិជ្ជា (ខ្មែរ)</Label>
                  <Input {...register("subject_km")} className="font-khmer" placeholder="ឧ. គណិតវិទ្យា" />
                </div>
                <div className="space-y-1.5">
                  <Label>Subject (English)</Label>
                  <Input {...register("subject_en")} placeholder="e.g. Mathematics" />
                </div>
              </div>

              <h2 className="font-semibold text-gray-900 pt-2">Department</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>ផ្នែក (ខ្មែរ)</Label>
                  <Input {...register("department_km")} className="font-khmer" placeholder="ឧ. ផ្នែកគណិតវិទ្យា" />
                </div>
                <div className="space-y-1.5">
                  <Label>Department (English)</Label>
                  <Input {...register("department_en")} placeholder="e.g. Mathematics" />
                </div>
              </div>

              <h2 className="font-semibold text-gray-900 pt-2">Qualification</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>សញ្ញាបត្រ (ខ្មែរ)</Label>
                  <Input {...register("qualification_km")} className="font-khmer" placeholder="ឧ. បរិញ្ញាបត្រ" />
                </div>
                <div className="space-y-1.5">
                  <Label>Qualification (English)</Label>
                  <Input {...register("qualification_en")} placeholder="e.g. B.Sc." />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Settings</h2>
              <div className="space-y-1.5">
                <Label>Years of Experience</Label>
                <Input type="number" min={0} {...register("years_experience")} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input type="number" min={0} {...register("sort_order")} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Grades Taught</Label>
                <Controller
                  name="grade_levels"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      {[7, 8, 9, 10, 11, 12].map((grade) => {
                        const checked = (field.value ?? []).includes(grade);
                        return (
                          <button
                            key={grade}
                            type="button"
                            onClick={() =>
                              field.onChange(
                                checked
                                  ? (field.value ?? []).filter((g: number) => g !== grade)
                                  : [...(field.value ?? []), grade].sort((a: number, b: number) => a - b)
                              )
                            }
                            className={`w-10 h-9 rounded-md text-sm font-medium border transition-colors ${
                              checked
                                ? "bg-school-blue-800 text-white border-school-blue-800"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            {grade}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Controller name="is_active" control={control} render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h2 className="font-semibold text-gray-900">Contact</h2>
              <div className="space-y-1.5">
                <Label>
                  <Phone className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                  Phone
                </Label>
                <Input {...register("phone")} placeholder="e.g. 095 85 85 45" />
              </div>
              <div className="space-y-1.5">
                <Label>
                  <User className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                  Gender
                </Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h2 className="font-semibold text-gray-900">Photo</h2>
              <Controller
                name="photo_url"
                control={control}
                render={({ field }) => (
                  <PhotoCropUploader
                    value={field.value}
                    onChange={(url) => field.onChange(url ?? "")}
                    bucket="SCHOOL_IMAGES"
                    folder="teachers"
                    label="Upload teacher photo"
                  />
                )}
              />
            </div>

            <Button type="submit" className="w-full bg-school-blue-800 hover:bg-school-blue-900" disabled={isSubmitting} size="lg">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {isNew ? "Create Teacher" : "Update Teacher"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
