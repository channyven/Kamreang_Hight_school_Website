"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Loader2,
  FileText,
  Settings2,
  Image as ImageIcon,
  Sparkles,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { achievementSchema, type AchievementInput } from "@/schemas/validations";
import { createAchievement, updateAchievement } from "@/actions/achievements";
import { supabase } from "@/lib/supabase";
import { convertGoogleDriveUrl } from "@/utils";
import ImagePreview from "@/components/admin/ImagePreview";

interface PageProps { params: Promise<{ id: string }>; }

const TYPE_OPTIONS = [
  { value: "student", label: { en: "Student", km: "សិស្ស" } },
  { value: "teacher", label: { en: "Teacher", km: "គ្រូ" } },
  { value: "school", label: { en: "School", km: "សាលា" } },
] as const;

const LEVEL_OPTIONS = [
  { value: "national", label: { en: "National", km: "ជាតិ" } },
  { value: "provincial", label: { en: "Provincial", km: "ខេត្ត" } },
  { value: "district", label: { en: "District", km: "ស្រុក" } },
  { value: "school", label: { en: "School Level", km: "កម្រិតសាលា" } },
] as const;

const STATUS_OPTIONS = [
  { value: "draft", label: { en: "Draft", km: "សេចក្តីព្រាង" }, color: "text-amber-600 bg-amber-50" },
  { value: "published", label: { en: "Published", km: "បានចេញផ្សាយ" }, color: "text-emerald-600 bg-emerald-50" },
  { value: "archived", label: { en: "Archived", km: "ទុកក្នុងប័ណ្ណសារ" }, color: "text-gray-500 bg-gray-50" },
] as const;

export default function AchievementFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === "new";
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(!isNew);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AchievementInput>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      status: "draft",
      is_featured: false,
    },
  });

  const currentStatus = watch("status");
  const imageUrl = watch("image_url");

  useEffect(() => {
    if (!isNew) {
      supabase
        .from("achievements")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data }) => {
          if (data) {
            Object.entries(data).forEach(([k, v]) => {
              if (v === null) return;
              if (k === "is_featured") {
                setValue("is_featured", Boolean(v));
              } else {
                setValue(k as keyof AchievementInput, v as string);
              }
            });
          }
          setLoading(false);
        });
    }
  }, [id, isNew, setValue]);

  const onSubmit = async (data: AchievementInput) => {
    const result = isNew
      ? await createAchievement(data)
      : await updateAchievement(id, data);
    if (result.success) {
      toast.success(isNew ? "Achievement created!" : "Achievement updated!");
      router.push(`/${locale}/admin/achievements`);
    } else {
      toast.error(result.error ?? "Failed to save");
    }
  };

  const statusMeta = STATUS_OPTIONS.find((s) => s.value === currentStatus);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-school-blue-800 mx-auto mb-3" />
          <p className="text-sm text-gray-400">{locale === "km" ? "កំពុងផ្ទុក..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="-ml-2 text-gray-500 hover:text-gray-900">
            <Link href={`/${locale}/admin/achievements`}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              {locale === "km" ? "ត្រឡប់" : "Back"}
            </Link>
          </Button>
          <div className="hidden sm:block w-px h-6 bg-gray-200" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isNew
                  ? (locale === "km" ? "បន្ថែមសមិទ្ធផលថ្មី" : "New Achievement")
                  : (locale === "km" ? "កែសមិទ្ធផល" : "Edit Achievement")}
              </h1>
              {statusMeta && (
                <Badge variant="outline" className={`gap-1.5 px-2.5 py-1 text-[11px] font-semibold ${statusMeta.color}`}>
                  {locale === "km" ? statusMeta.label.km : statusMeta.label.en}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-0.5">
              {isNew
                ? (locale === "km" ? "បង្កើតសមិទ្ធផលថ្មីសម្រាប់គេហទំព័រ" : "Create a new achievement for the website")
                : (locale === "km" ? "កែប្រែសមិទ្ធផលដែលមានស្រាប់" : "Modify the existing achievement")}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Form ─── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ═══ Main Content ═══ */}
          <div className="lg:col-span-2 space-y-6">
            {/* ── Bilingual Content ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <Globe className="w-4 h-4 text-school-blue-800" />
                <h2 className="font-semibold text-gray-900 text-sm">
                  {locale === "km" ? "មាតិកាពីរភាសា" : "Bilingual Content"}
                </h2>
                <span className="text-[11px] text-gray-400 ml-auto">
                  {locale === "km" ? "បំពេញទាំងពីរភាសា" : "Fill in both languages"}
                </span>
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                {/* Title - Bilingual */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    {locale === "km" ? "ចំណងជើង" : "Title"}
                    <span className="text-red-400">*</span>
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                        <span className="text-base">🇰🇭</span> Khmer
                      </Label>
                      <Input
                        {...register("title_km")}
                        className="font-khmer"
                        placeholder="ចំណងជើងសមិទ្ធផល..."
                      />
                      {errors.title_km && (
                        <p className="text-xs text-red-500">{errors.title_km.message as string}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                        <span className="text-base">🇺🇸</span> English
                      </Label>
                      <Input
                        {...register("title_en")}
                        placeholder="Achievement title..."
                      />
                      {errors.title_en && (
                        <p className="text-xs text-red-500">{errors.title_en.message as string}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Date + Participant */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {locale === "km" ? "កាលបរិច្ឆេទ" : "Achievement Date"}
                    </Label>
                    <Input type="date" {...register("achievement_date")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {locale === "km" ? "ឈ្មោះអ្នកចូលរួម" : "Participant Name"}
                    </Label>
                    <Input {...register("participant_name")} placeholder={locale === "km" ? "ឈ្មោះសិស្ស/ក្រុម..." : "Student / Team name..."} />
                  </div>
                </div>

                <Separator />

                {/* Description - Bilingual */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    {locale === "km" ? "ការពិពណ៌នា" : "Description"}
                    <span className="text-[11px] font-normal text-gray-400 ml-2">
                      ({locale === "km" ? "ស្រេចចិត្ត" : "Optional"})
                    </span>
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                        <span className="text-base">🇰🇭</span> Khmer
                      </Label>
                      <textarea
                        {...register("description_km")}
                        rows={5}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none font-khmer"
                        placeholder="ការពិពណ៌នាសមិទ្ធផល..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                        <span className="text-base">🇺🇸</span> English
                      </Label>
                      <textarea
                        {...register("description_en")}
                        rows={5}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                        placeholder="Achievement description..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ Sidebar ═══ */}
          <div className="space-y-6">
            {/* ── Settings ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <Settings2 className="w-4 h-4 text-school-blue-800" />
                <h2 className="font-semibold text-gray-900 text-sm">
                  {locale === "km" ? "ការកំណត់" : "Settings"}
                </h2>
              </div>
              <div className="p-5 space-y-5">
                {/* Status */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {locale === "km" ? opt.label.km : opt.label.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Achievement Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {locale === "km" ? "ប្រភេទ" : "Achievement Type"}
                  </Label>
                  <Controller
                    name="achievement_type"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value ?? ""} onValueChange={(val) => field.onChange(val || undefined)}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder={locale === "km" ? "ជ្រើសរើសប្រភេទ" : "Select type"} />
                        </SelectTrigger>
                        <SelectContent>
                          {TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {locale === "km" ? opt.label.km : opt.label.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Award Level */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {locale === "km" ? "កម្រិត" : "Award Level"}
                  </Label>
                  <Controller
                    name="award_level"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value ?? ""} onValueChange={(val) => field.onChange(val || undefined)}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder={locale === "km" ? "ជ្រើសរើសកម្រិត" : "Select level"} />
                        </SelectTrigger>
                        <SelectContent>
                          {LEVEL_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {locale === "km" ? opt.label.km : opt.label.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-amber-50/50 border border-amber-100/60">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <div>
                      <Label className="text-sm font-medium text-amber-800 cursor-pointer">
                        {locale === "km" ? "សមិទ្ធផលពិសេស" : "Featured"}
                      </Label>
                      <p className="text-[11px] text-amber-600/70">
                        {locale === "km" ? "បង្ហាញនៅលើទំព័រដើម" : "Show on homepage"}
                      </p>
                    </div>
                  </div>
                  <Controller
                    name="is_featured"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-amber-500"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* ── Image ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <ImageIcon className="w-4 h-4 text-school-blue-800" />
                <h2 className="font-semibold text-gray-900 text-sm">
                  {locale === "km" ? "រូបភាព" : "Image"}
                </h2>
                {imageUrl && (
                  <span className="ml-auto text-[10px] text-emerald-500 font-medium">
                    ✓ {locale === "km" ? "មាន" : "Set"}
                  </span>
                )}
              </div>
              <div className="p-5 space-y-3">
                {/* Image Preview */}
                {imageUrl && <ImagePreview url={imageUrl} />}

                {/* Google Drive link paste */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-500">
                    {locale === "km" ? "បិទភ្ជាប់តំណ Google Drive" : "Paste Google Drive link"}
                  </Label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                    <input
                      type="text"
                      value={imageUrl ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) {
                          setValue("image_url", "");
                          return;
                        }
                        setValue("image_url", val);
                      }}
                      onBlur={(e) => {
                        const converted = convertGoogleDriveUrl(e.target.value);
                        if (converted !== e.target.value) {
                          setValue("image_url", converted);
                        }
                      }}
                      onPaste={(e) => {
                        setTimeout(() => {
                          const input = e.target as HTMLInputElement;
                          const converted = convertGoogleDriveUrl(input.value);
                          if (converted !== input.value) {
                            setValue("image_url", converted);
                          }
                        }, 0);
                      }}
                      placeholder={locale === "km" ? "បិទភ្ជាប់តំណរូបភាព..." : "Paste image link..."}
                      className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400">
                    {locale === "km"
                      ? "💡 បិទភ្ជាប់តំណ Google Drive — វានឹងបម្លែងដោយស្វ័យប្រវត្តិ"
                      : "💡 Paste a Google Drive share link — it will auto-convert"}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Submit ── */}
            <Button
              type="submit"
              className="w-full bg-school-blue-800 hover:bg-school-blue-900 h-11 text-sm font-semibold shadow-lg shadow-school-blue-800/20"
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {locale === "km" ? "កំពុងរក្សាទុក..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isNew
                    ? (locale === "km" ? "បង្កើតសមិទ្ធផល" : "Create Achievement")
                    : (locale === "km" ? "រក្សាទុក" : "Save Changes")}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
