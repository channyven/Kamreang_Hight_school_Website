"use client";

import { useState, useEffect, use } from "react";
import { useLocale as useNextLocale } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Loader2,
  Globe,
  FileText,
  Settings2,
  Image as ImageIcon,
  FolderOpen,
  Eye,
  CheckCircle2,
  Clock,
  Archive,
  Sparkles,
  Link as LinkIcon,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { newsSchema, type NewsInput } from "@/schemas/validations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { generateUniqueSlug, convertGoogleDriveUrl, adminHref } from "@/utils";
import PhotoGallery from "@/components/admin/PhotoGallery";
import { createNews, updateNews, getAdminNewsById } from "@/actions/news";
import type { NewsCategory } from "@/types";
import { useRouter as useNextRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_OPTIONS = [
  { value: "draft", label: { en: "Draft", km: "សេចក្តីព្រាង" }, icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200" },
  { value: "published", label: { en: "Published", km: "បានចេញផ្សាយ" }, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { value: "archived", label: { en: "Archived", km: "ទុកក្នុងប័ណ្ណសារ" }, icon: Archive, color: "text-gray-500 bg-gray-50 border-gray-200" },
] as const;



export default function NewsFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === "new";
  const locale = useNextLocale();
  const router = useNextRouter();
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [existingSlugs, setExistingSlugs] = useState<string[]>([]);

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState("");
  const [previewError, setPreviewError] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NewsInput>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      status: "draft",
      is_featured: false,
    },
  });

  const titleEn = watch("title_en");
  const titleKm = watch("title_km");
  const excerptEn = watch("excerpt_en");
  const excerptKm = watch("excerpt_km");
  const currentStatus = watch("status");
  const featuredImageUrl = watch("featured_image");

  // Auto-convert Google Drive URLs for featured_image
  useEffect(() => {
    if (featuredImageUrl) {
      const converted = convertGoogleDriveUrl(featuredImageUrl);
      if (converted !== featuredImageUrl) {
        setValue("featured_image", converted);
      }
    }
  }, [featuredImageUrl, setValue]);

  // Reset preview error when featured image URL changes
  useEffect(() => {
    setPreviewError(false);
  }, [featuredImageUrl]);

  // Auto-generate slug from English title
  useEffect(() => {
    if (isNew && titleEn && !slugManuallyEdited) {
      const unique = generateUniqueSlug(titleEn, existingSlugs);
      setValue("slug", unique);
    }
  }, [titleEn, isNew, existingSlugs, setValue, slugManuallyEdited]);

  useEffect(() => {
    const init = async () => {
      const { data: cats } = await supabase
        .from("news_categories")
        .select("*")
        .order("sort_order");
      setCategories((cats ?? []) as NewsCategory[]);

      const { data: slugsData } = await supabase.from("news").select("slug");

      const allSlugs = (slugsData ?? [])
        .map((r) => r.slug)
        .filter(Boolean) as string[];

      if (isNew) {
        setExistingSlugs(allSlugs);
      }

      if (!isNew) {
        const data = await getAdminNewsById(id);
        if (data) {
          Object.entries(data).forEach(([k, v]) => {
            if (v === null) return;
            if (k === "gallery_images") {
              setValue("gallery_images", Array.isArray(v) ? v : []);
            } else {
              setValue(k as keyof NewsInput, v as string);
            }
          });
          setExistingSlugs(allSlugs.filter((s) => s !== data.slug));
        }
        setLoading(false);
      }
    };
    init();
  }, [id, isNew, setValue]);

  const doSubmit = async (data: NewsInput) => {
    const result = isNew
      ? await createNews(data)
      : await updateNews(id, data);

    if (result.success) {
      toast.success(isNew ? "Article created!" : "Article updated!");
      router.push(adminHref(locale, "news"));
    } else {
      toast.error(result.error ?? "Failed to save");
    }
  };

  const onSubmit = async (data: NewsInput) => {
    // If featured_image is empty, show the image dialog
    if (!data.featured_image || data.featured_image.trim() === "") {
      setPendingImageUrl("");
      setShowImageDialog(true);
      return;
    }
    await doSubmit(data);
  };

  const handleImageDialogConfirm = async () => {
    if (pendingImageUrl.trim()) {
      const converted = convertGoogleDriveUrl(pendingImageUrl.trim());
      setValue("featured_image", converted);
    }
    setShowImageDialog(false);
    // Small delay lets react-hook-form register the updated value before re-submitting
    setTimeout(() => handleSubmit(doSubmit)(), 0);
  };

  const activeStatusMeta = STATUS_OPTIONS.find((s) => s.value === currentStatus);
  const StatusIcon = activeStatusMeta?.icon ?? Clock;

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
            <Link href={adminHref(locale, "news")}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              {locale === "km" ? "ត្រឡប់" : "Back"}
            </Link>
          </Button>
          <div className="hidden sm:block w-px h-6 bg-gray-200" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isNew
                  ? (locale === "km" ? "បន្ថែមព័ត៌មានថ្មី" : "New Article")
                  : (locale === "km" ? "កែព័ត៌មាន" : "Edit Article")}
              </h1>
              {activeStatusMeta && (
                <Badge
                  variant="outline"
                  className={`gap-1.5 px-2.5 py-1 text-[11px] font-semibold ${activeStatusMeta.color}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {locale === "km" ? activeStatusMeta.label.km : activeStatusMeta.label.en}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-0.5">
              {isNew
                ? (locale === "km" ? "បង្កើតអត្ថបទព័ត៌មានថ្មីសម្រាប់គេហទំព័រ" : "Create a new news article for the website")
                : (locale === "km" ? "កែប្រែព័ត៌មានដែលមានស្រាប់" : "Modify the existing news article")}
            </p>
          </div>
        </div>

        {!isNew && (
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link              href={`/${locale}/news/${watch("slug")}`} target="_blank">
              <Eye className="w-4 h-4 mr-1.5" />
              {locale === "km" ? "មើលព័ត៌មាន" : "Preview"}
            </Link>
          </Button>
        )}
      </div>

      {/* ─── Form ─── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ═══ Main Content ═══ */}
          <div className="lg:col-span-2 space-y-6">
            {/* ── Bilingual Content (Khmer & English side by side) ── */}
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

              <div className="p-5 sm:p-6 space-y-6">
                {/* Title - Bilingual */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    {locale === "km" ? "ចំណងជើង" : "Title"}
                    <span className="text-red-400">*</span>
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Khmer Title */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                        <span className="text-base">🇰🇭</span> Khmer
                      </Label>
                      <div className="relative">
                        <Input
                          {...register("title_km")}
                          className="font-khmer pr-16"
                          placeholder="បញ្ចូលចំណងជើងព័ត៌មាន..."
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 font-mono">
                          {titleKm?.length ?? 0}/500
                        </span>
                      </div>
                      {errors.title_km && (
                        <p className="text-xs text-red-500">{errors.title_km.message as string}</p>
                      )}
                    </div>
                    {/* English Title */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                        <span className="text-base">🇺🇸</span> English
                      </Label>
                      <div className="relative">
                        <Input
                          {...register("title_en")}
                          className="pr-16"
                          placeholder="Enter article title..."
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 font-mono">
                          {titleEn?.length ?? 0}/500
                        </span>
                      </div>
                      {errors.title_en && (
                        <p className="text-xs text-red-500">{errors.title_en.message as string}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700">
                    Slug <span className="text-red-400 ml-0.5">*</span>
                    <span className="text-[11px] font-normal text-gray-400 ml-2">(URL identifier)</span>
                  </Label>
                  <div className="relative max-w-lg">
                    <Input
                      {...register("slug", {
                        onChange: () => setSlugManuallyEdited(true),
                      })}
                      placeholder="article-url-slug"
                      className="pl-9 font-mono text-sm"
                    />
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                  </div>
                  {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
                  <p className="text-[11px] text-gray-400">
                    {locale === "km"
                      ? "ប្រើតែអក្សរឡាតាំងតូច លេខ និងសហសញ្ញា (hyphen) ប៉ុណ្ណោះ"
                      : "Only lowercase letters, numbers, and hyphens allowed"}
                  </p>
                </div>

                <Separator />

                {/* Excerpt - Bilingual */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    {locale === "km" ? "សង្ខេប" : "Excerpt"}
                    <span className="text-[11px] font-normal text-gray-400 ml-2">
                      ({locale === "km" ? "អត្ថបទសង្ខេបខ្លី" : "Short summary shown in cards"})
                    </span>
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Khmer Excerpt */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                        <span className="text-base">🇰🇭</span> Khmer
                      </Label>
                      <div className="relative">
                        <textarea
                          {...register("excerpt_km")}
                          rows={3}
                          className={`w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none font-khmer`}
                          placeholder="បញ្ចូលសេចក្តីសង្ខេបខ្លី..."
                        />
                        <span className="absolute right-3 bottom-2.5 text-[10px] text-gray-300 font-mono">
                          {excerptKm?.length ?? 0}/500
                        </span>
                      </div>
                    </div>
                    {/* English Excerpt */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                        <span className="text-base">🇺🇸</span> English
                      </Label>
                      <div className="relative">
                        <textarea
                          {...register("excerpt_en")}
                          rows={3}
                          className={`w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none`}
                          placeholder="Enter a brief summary..."
                        />
                        <span className="absolute right-3 bottom-2.5 text-[10px] text-gray-300 font-mono">
                          {excerptEn?.length ?? 0}/500
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Content - Bilingual */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    {locale === "km" ? "មាតិកា" : "Content"}
                    <span className="text-[11px] font-normal text-gray-400 ml-2">
                      ({locale === "km" ? "មាតិកា HTML" : "HTML content"})
                    </span>
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Khmer Content */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                        <span className="text-base">🇰🇭</span> Khmer
                      </Label>
                      <textarea
                        {...register("content_km")}
                        rows={14}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono font-khmer"
                        placeholder="បញ្ចូលមាតិកា HTML..."
                      />
                    </div>
                    {/* English Content */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                        <span className="text-base">🇺🇸</span> English
                      </Label>
                      <textarea
                        {...register("content_en")}
                        rows={14}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
                        placeholder="Enter HTML content..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ Sidebar ═══ */}
          <div className="space-y-6">
            {/* ── Publish Settings ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <Settings2 className="w-4 h-4 text-school-blue-800" />
                <h2 className="font-semibold text-gray-900 text-sm">
                  {locale === "km" ? "ការកំណត់ផ្សព្វផ្សាយ" : "Publish Settings"}
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
                          {STATUS_OPTIONS.map((opt) => {
                            const Icon = opt.icon;
                            return (
                              <SelectItem key={opt.value} value={opt.value}>
                                <span className="flex items-center gap-2">
                                  <Icon className="w-3.5 h-3.5" />
                                  {locale === "km" ? opt.label.km : opt.label.en}
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Publish Date */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {locale === "km" ? "កាលបរិច្ឆេទផ្សព្វផ្សាយ" : "Publish Date"}
                  </Label>
                  <Input type="datetime-local" {...register("publish_date")} className="text-sm" />
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-amber-50/50 border border-amber-100/60">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <div>
                      <Label className="text-sm font-medium text-amber-800 cursor-pointer">
                        {locale === "km" ? "ព័ត៌មានពិសេស" : "Featured Article"}
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

            {/* ── Category ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <FileText className="w-4 h-4 text-school-blue-800" />
                <h2 className="font-semibold text-gray-900 text-sm">
                  {locale === "km" ? "ប្រភេទ" : "Category"}
                </h2>
              </div>
              <div className="p-5">
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || "none"}
                      onValueChange={(val) => field.onChange(val === "none" ? "" : val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={locale === "km" ? "ជ្រើសរើសប្រភេទ" : "Select category"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          {locale === "km" ? "គ្មានប្រភេទ" : "No category"}
                        </SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {locale === "km" ? cat.name_km : cat.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* ── Featured Image ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <ImageIcon className="w-4 h-4 text-school-blue-800" />
                <h2 className="font-semibold text-gray-900 text-sm">
                  {locale === "km" ? "រូបភាពតំណាង" : "Featured Image"}
                </h2>
                {watch("featured_image") && (
                  <span className="ml-auto text-[10px] text-emerald-500 font-medium">
                    ✓ {locale === "km" ? "មាន" : "Set"}
                  </span>
                )}
              </div>
              <div className="p-5 space-y-3">
                <Input
                  {...register("featured_image")}
                  placeholder={locale === "km" ? "បិទភ្ជាប់តំណ Google Drive..." : "Paste Google Drive link"}
                  className="text-sm"
                />
                {featuredImageUrl && (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden border border-gray-100">
                    <img
                      key={featuredImageUrl}
                      src={featuredImageUrl}
                      alt="Featured image preview"
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
            </div>

            {/* ── Photo Gallery ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2.5">
                  <FolderOpen className="w-4 h-4 text-school-blue-800" />
                  <h2 className="font-semibold text-gray-900 text-sm">
                    {locale === "km" ? "វិចិត្រសាលរូបភាព" : "Photo Gallery"}
                  </h2>
                </div>
                <Badge variant="outline" className="text-[11px] font-mono text-gray-400">
                  {watch("gallery_images")?.length ?? 0} {locale === "km" ? "រូប" : "img"}
                </Badge>
              </div>
              <div className="p-5">
                <Controller
                  name="gallery_images"
                  control={control}
                  render={({ field }) => (
                    <PhotoGallery
                      images={field.value ?? []}
                      onChange={field.onChange}
                      locale={locale}
                    />
                  )}
                />
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
                    ? (locale === "km" ? "បង្កើតអត្ថបទ" : "Create Article")
                    : (locale === "km" ? "រក្សាទុក" : "Save Changes")}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* ─── Featured Image Required Dialog ─── */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <DialogTitle className="text-lg">
                  {locale === "km" ? "ត្រូវការរូបភាពតំណាង" : "Featured Image Required"}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-0.5">
                  {locale === "km"
                    ? "សូមបញ្ចូលតំណរូបភាពមុនពេលចុចរក្សាទុក"
                    : "Please enter an image URL before saving"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-2">
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 block">
              {locale === "km" ? "តំណរូបភាព" : "Image URL"}
            </Label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <Input
                value={pendingImageUrl}
                onChange={(e) => setPendingImageUrl(e.target.value)}
                placeholder={
                  locale === "km"
                    ? "បិទភ្ជាប់តំណ Google Drive..."
                    : "Paste Google Drive link..."
                }
                className="pl-9 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleImageDialogConfirm();
                  }
                }}
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              {locale === "km"
                ? "ចម្លងតំណរូបភាពពី Google Drive ឬប្រភពផ្សេងទៀត"
                : "Copy the image link from Google Drive or other sources"}
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowImageDialog(false);
                setTimeout(() => handleSubmit(doSubmit)(), 0);
              }}
            >
              {locale === "km" ? "រំលង" : "Skip"}
            </Button>
            <Button
              onClick={handleImageDialogConfirm}
              disabled={!pendingImageUrl.trim()}
              className="bg-school-blue-800 hover:bg-school-blue-900"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {locale === "km" ? "រក្សាទុក" : "Save & Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
