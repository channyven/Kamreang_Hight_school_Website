"use client";

import { useState, useEffect, use, useRef } from "react";
import { useLocale as useNextLocale } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase, STORAGE_BUCKETS } from "@/lib/supabase";
import { newsSchema, type NewsInput } from "@/schemas/validations";
import { slugify, convertGoogleDriveUrl } from "@/utils";
import ImagePreview from "@/components/admin/ImagePreview";
import PhotoGallery from "@/components/admin/PhotoGallery";
import { createNews, updateNews } from "@/actions/news";
import { uploadImage } from "@/lib/upload";
import type { NewsCategory } from "@/types";
import { useRouter as useNextRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function NewsFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === "new";
  const locale = useNextLocale();
  const router = useNextRouter();
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const featuredInputRef = useRef<HTMLInputElement>(null);

  const handleFeaturedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingFeatured(true);
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImage(formData, STORAGE_BUCKETS.NEWS_IMAGES, "featured");
      setValue("featured_image", result.url);
      toast.success(locale === "km" ? "បានបញ្ចូលរូបភាព" : "Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingFeatured(false);
      // Reset so the same file can be re-selected
      if (featuredInputRef.current) featuredInputRef.current.value = "";
    }
  };

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

  // Auto-generate slug from English title
  useEffect(() => {
    if (isNew && titleEn) {
      setValue("slug", slugify(titleEn));
    }
  }, [titleEn, isNew, setValue]);

  useEffect(() => {
    const init = async () => {
      const { data: cats } = await supabase
        .from("news_categories")
        .select("*")
        .order("sort_order");
      setCategories((cats ?? []) as NewsCategory[]);

      if (!isNew) {
        const { data } = await supabase
          .from("news")
          .select("*")
          .eq("id", id)
          .single();
        if (data) {
          Object.entries(data).forEach(([k, v]) => {
            if (v === null) return;
            if (k === "gallery_images") {
              // JSONB array stored in DB
              setValue("gallery_images", Array.isArray(v) ? v : []);
            } else {
              setValue(k as keyof NewsInput, v as string);
            }
          });
        }
        setLoading(false);
      }
    };
    init();
  }, [id, isNew, setValue]);

  const onSubmit = async (data: NewsInput) => {
    const result = isNew
      ? await createNews(data)
      : await updateNews(id, data);

    if (result.success) {
      toast.success(isNew ? "Article created!" : "Article updated!");
      router.push(`/${locale}/admin/news`);
    } else {
      toast.error(result.error ?? "Failed to save");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-school-blue-800" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/admin/news`}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            {locale === "km" ? "ត្រឡប់" : "Back"}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew
            ? (locale === "km" ? "បន្ថែមព័ត៌មានថ្មី" : "New Article")
            : (locale === "km" ? "កែព័ត៌មាន" : "Edit Article")}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Content</h2>

              {/* Khmer title */}
              <div className="space-y-1.5">
                <Label>ចំណងជើង (ខ្មែរ) *</Label>
                <Input {...register("title_km")} className="font-khmer" placeholder="ចំណងជើងព័ត៌មាន" />
                {errors.title_km && <p className="text-xs text-red-500">{errors.title_km.message}</p>}
              </div>

              {/* English title */}
              <div className="space-y-1.5">
                <Label>Title (English) *</Label>
                <Input {...register("title_en")} placeholder="Article title" />
                {errors.title_en && <p className="text-xs text-red-500">{errors.title_en.message}</p>}
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <Label>Slug *</Label>
                <Input {...register("slug")} placeholder="article-slug" />
                {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
              </div>

              {/* Excerpts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>សង្ខេប (ខ្មែរ)</Label>
                  <textarea
                    {...register("excerpt_km")}
                    rows={3}
                    className="font-khmer w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="សង្ខេបខ្លី..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Excerpt (English)</Label>
                  <textarea
                    {...register("excerpt_en")}
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Brief excerpt..."
                  />
                </div>
              </div>

              {/* Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>មាតិកា (ខ្មែរ)</Label>
                  <textarea
                    {...register("content_km")}
                    rows={10}
                    className="font-khmer w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="មាតិកា HTML..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Content (English)</Label>
                  <textarea
                    {...register("content_en")}
                    rows={10}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="HTML content..."
                  />
                </div>
              </div>
            </div>

            {/* Photo Gallery */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">
                  {locale === "km" ? "វិចិត្រសាលរូបភាព" : "Photo Gallery"}
                </h2>
                <span className="text-xs text-gray-400">
                  {watch("gallery_images")?.length ?? 0} {locale === "km" ? "រូបភាព" : "images"}
                </span>
              </div>
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

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Publish settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Publish Settings</h2>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Publish Date</Label>
                <Input type="datetime-local" {...register("publish_date")} />
              </div>

              <div className="flex items-center justify-between">
                <Label>Featured Article</Label>
                <Controller
                  name="is_featured"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </div>

            {/* Category */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h2 className="font-semibold text-gray-900">Category</h2>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "none"}
                    onValueChange={(val) => field.onChange(val === "none" ? "" : val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{locale === "km" ? "គ្មានប្រភេទ" : "No category"}</SelectItem>
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

            {/* Featured image */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h2 className="font-semibold text-gray-900">Featured Image</h2>

              {/* File upload */}
              <div className="flex gap-2">
                <input
                  ref={featuredInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFeaturedUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => featuredInputRef.current?.click()}
                  disabled={uploadingFeatured}
                  className="w-full"
                >
                  {uploadingFeatured ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  ) : (
                    <Upload className="w-4 h-4 mr-1.5" />
                  )}
                  {uploadingFeatured
                    ? (locale === "km" ? "កំពុងបញ្ចូល..." : "Uploading...")
                    : (locale === "km" ? "បញ្ចូលរូបភាព" : "Upload Image")}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400">
                    {locale === "km" ? "ឬ" : "or"}
                  </span>
                </div>
              </div>

              <Input
                {...register("featured_image", {
                  onBlur: (e) => {
                    const converted = convertGoogleDriveUrl(e.target.value);
                    if (converted !== e.target.value) {
                      setValue("featured_image", converted);
                    }
                  },
                })}
                placeholder="Paste Google Drive link or image URL"
                onPaste={(e) => {
                  // Convert immediately on paste (delay needed because the
                  // input value hasn't been updated yet at paste time)
                  setTimeout(() => {
                    const input = e.target as HTMLInputElement;
                    const converted = convertGoogleDriveUrl(input.value);
                    if (converted !== input.value) {
                      setValue("featured_image", converted);
                    }
                  }, 0);
                }}
              />
              <p className="text-xs text-gray-400">
                Supports Google Drive links &mdash; paste a share link and it will be auto-converted
              </p>

              {/* Image preview */}
              <ImagePreview url={watch("featured_image")} />
            </div>

            <Button
              type="submit"
              className="w-full bg-school-blue-800 hover:bg-school-blue-900"
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {isNew ? "Create Article" : "Update Article"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
