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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { achievementSchema, type AchievementInput } from "@/schemas/validations";
import { createAchievement, updateAchievement } from "@/actions/achievements";
import { supabase } from "@/lib/supabase";
import { convertGoogleDriveUrl } from "@/utils";

interface PageProps { params: Promise<{ id: string }>; }

export default function AchievementFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === "new";
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(!isNew);

  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<AchievementInput>({ resolver: zodResolver(achievementSchema), defaultValues: { status: "draft", is_featured: false } });

  const watchImageUrl = watch("image_url");
  const [previewError, setPreviewError] = useState(false);

  // Auto-convert Google Drive URLs whenever the value changes
  useEffect(() => {
    if (watchImageUrl) {
      const converted = convertGoogleDriveUrl(watchImageUrl);
      if (converted !== watchImageUrl) {
        setValue("image_url", converted);
      }
    }
  }, [watchImageUrl, setValue]);

  // Reset preview error whenever image URL changes
  useEffect(() => {
    setPreviewError(false);
  }, [watchImageUrl]);

  useEffect(() => {
    if (!isNew) {
      supabase.from("achievements").select("*").eq("id", id).single().then(({ data }) => {
        if (data) Object.entries(data).forEach(([k, v]) => { if (v !== null) setValue(k as keyof AchievementInput, v as string); });
        setLoading(false);
      });
    }
  }, [id, isNew, setValue]);

  const onSubmit = async (data: AchievementInput) => {
    const result = isNew ? await createAchievement(data) : await updateAchievement(id, data);
    if (result.success) { toast.success(isNew ? "Achievement created!" : "Achievement updated!"); router.push(`/${locale}/admin/achievements`); }
    else toast.error(result.error ?? "Failed to save");
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/admin/achievements`}><ArrowLeft className="w-4 h-4 mr-1" />{locale === "km" ? "ត្រឡប់" : "Back"}</Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? (locale === "km" ? "បន្ថែមសមិទ្ធផល" : "New Achievement") : (locale === "km" ? "កែសមិទ្ធផល" : "Edit Achievement")}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Content</h2>

              <div className="space-y-1.5">
                <Label>ចំណងជើង (ខ្មែរ) *</Label>
                <Input {...register("title_km")} className="font-khmer" placeholder="ចំណងជើងសមិទ្ធផល" />
                {errors.title_km && <p className="text-xs text-red-500">{errors.title_km.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Title (English) *</Label>
                <Input {...register("title_en")} placeholder="Achievement title" />
                {errors.title_en && <p className="text-xs text-red-500">{errors.title_en.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Achievement Date</Label>
                  <Input type="date" {...register("achievement_date")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Participant Name</Label>
                  <Input {...register("participant_name")} placeholder="Student / Team name" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>ការពិពណ៌នា (ខ្មែរ)</Label>
                  <textarea {...register("description_km")} rows={5} className="font-khmer w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="ការពិពណ៌នា..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Description (English)</Label>
                  <textarea {...register("description_en")} rows={5} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Description..." />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Settings</h2>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Controller name="status" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-1.5">
                <Label>Award Level</Label>
                <Controller name="award_level" control={control} render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national">National</SelectItem>
                      <SelectItem value="provincial">Provincial</SelectItem>
                      <SelectItem value="district">District</SelectItem>
                      <SelectItem value="school">School</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-1.5">
                <Label>Achievement Type</Label>
                <Controller name="achievement_type" control={control} render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="arts">Arts</SelectItem>
                      <SelectItem value="community">Community</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Featured</Label>
                <Controller name="is_featured" control={control} render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h2 className="font-semibold text-gray-900">
                {locale === "km" ? "រូបភាព" : "Image"}
              </h2>
              <Input
                {...register("image_url")}
                placeholder={locale === "km" ? "បិទភ្ជាប់តំណ Google Drive..." : "Paste Google Drive link"}
                className="text-sm"
              />
              {watchImageUrl && (
                <div className="relative w-full h-24 rounded-lg overflow-hidden border border-gray-100">
                  <img
                    key={watchImageUrl}
                    src={watchImageUrl}
                    alt="Preview"
                    className={`object-cover w-full h-full transition-opacity duration-300 ${previewError ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setPreviewError(false)}
                    onError={() => setPreviewError(true)}
                  />
                  {previewError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                      <p className="text-[11px] text-gray-400 px-3 text-center">
                        {locale === "km"
                          ? "មិនអាចផ្ទុករូបភាព"
                          : "Could not load image"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full bg-school-blue-800 hover:bg-school-blue-900" disabled={isSubmitting} size="lg">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {isNew ? "Create Achievement" : "Update Achievement"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
