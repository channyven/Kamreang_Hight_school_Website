"use client";

import { useState, useEffect, use } from "react";
import { useLocale } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Loader2,
  Globe,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Palette,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { createHeroSlide, updateHeroSlide, getAdminHeroSlideById } from "@/actions/hero-slides";
import { heroSlideSchema, type HeroSlideInput } from "@/schemas/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { convertGoogleDriveUrl, adminHref } from "@/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

const PRESET_GRADIENTS = [
  { label: "Navy Blue", value: "linear-gradient(135deg, #0d1b38 0%, #1e3a8a 55%, #1e3066 100%)" },
  { label: "Deep Blue", value: "linear-gradient(135deg, #0f2957 0%, #1e4e8c 60%, #1e40af 100%)" },
  { label: "Teal", value: "linear-gradient(135deg, #0a3d62 0%, #1a6b8a 50%, #0d8abe 100%)" },
  { label: "Purple", value: "linear-gradient(135deg, #1a1a3e 0%, #2d2d7a 50%, #4a47a3 100%)" },
  { label: "Royal", value: "linear-gradient(135deg, #0d1c2f 0%, #1e3a8a 45%, #1565c0 100%)" },
  { label: "Forest", value: "linear-gradient(135deg, #061e14 0%, #0c4228 55%, #083320 100%)" },
  { label: "Warm", value: "linear-gradient(135deg, #1a0c05 0%, #5c2d0a 55%, #421f08 100%)" },
  { label: "Dark", value: "linear-gradient(135deg, #061525 0%, #0c2d5e 55%, #092045 100%)" },
];

export default function HeroSlideFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === "new";
  const locale = useLocale();
  const router = useRouter();

  const [loading, setLoading] = useState(!isNew);
  const [showGradientPicker, setShowGradientPicker] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<HeroSlideInput>({
    resolver: zodResolver(heroSlideSchema),
    defaultValues: {
      sort_order: 1,
      is_active: true,
      cta_primary_href: "/contact",
      cta_secondary_href: "/about",
    },
  });

  const watchImageUrl = watch("image_url");
  const watchGradient = watch("gradient");
  const isActive = watch("is_active");

  useEffect(() => {
    if (!isNew) {
      const init = async () => {
        const data = await getAdminHeroSlideById(id);
        if (data) {
          (Object.entries(data) as [keyof HeroSlideInput, unknown][]).forEach(([k, v]) => {
            if (v !== null) {
              setValue(k, v as string & boolean & number);
            }
          });
        }
        setLoading(false);
      };
      init();
    }
  }, [id, isNew, setValue]);

  const onSubmit = async (data: HeroSlideInput) => {
    const result = isNew
      ? await createHeroSlide(data)
      : await updateHeroSlide(id, data);

    if (result.success) {
      toast.success(
        isNew
          ? (locale === "km" ? "ស្លាយត្រូវបានបង្កើត" : "Slide created!")
          : (locale === "km" ? "ស្លាយត្រូវបានកែប្រែ" : "Slide updated!")
      );
      router.push(adminHref(locale, "hero-slides"));
    } else {
      toast.error(result.error ?? (locale === "km" ? "បរាជ័យ" : "Failed to save"));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-school-blue-800 mx-auto mb-3" />
          <p className="text-sm text-gray-400">
            {locale === "km" ? "កំពុងផ្ទុក..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between gap-4 bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="-ml-2 text-gray-500 hover:text-gray-900">
            <Link href={adminHref(locale, "hero-slides")}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              {locale === "km" ? "ត្រឡប់" : "Back"}
            </Link>
          </Button>
          <div className="hidden sm:block w-px h-6 bg-gray-200" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {isNew
                ? locale === "km"
                  ? "បន្ថែមស្លាយថ្មី"
                  : "New Hero Slide"
                : locale === "km"
                  ? "កែស្លាយ"
                  : "Edit Hero Slide"}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {isNew
                ? locale === "km"
                  ? "បង្កើតស្លាយថ្មីសម្រាប់ទំព័រដើម"
                  : "Create a new slide for the homepage hero"
                : locale === "km"
                  ? "កែប្រែស្លាយដែលមានស្រាប់"
                  : "Modify the existing hero slide"}
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
              </div>

              <div className="p-5 sm:p-6 space-y-6">
                {/* Title */}
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
                        placeholder="បញ្ចូលចំណងជើងខ្មែរ..."
                      />
                      {errors.title_km && (
                        <p className="text-xs text-red-500">
                          {locale === "km" ? "សូមបញ្ចូលចំណងជើងខ្មែរ" : "Khmer title is required"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                        <span className="text-base">🇺🇸</span> English
                      </Label>
                      <Input
                        {...register("title_en")}
                        placeholder="Enter English title..."
                      />
                      {errors.title_en && (
                        <p className="text-xs text-red-500">
                          {locale === "km" ? "សូមបញ្ចូលចំណងជើងអង់គ្លេស" : "English title is required"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Subtitle */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    {locale === "km" ? "អត្ថបទរង" : "Subtitle"}
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                        <span className="text-base">🇰🇭</span> Khmer
                      </Label>
                      <Textarea
                        {...register("subtitle_km")}
                        rows={3}
                        className="font-khmer resize-none"
                        placeholder="បញ្ចូលអត្ថបទរងខ្មែរ..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                        <span className="text-base">🇺🇸</span> English
                      </Label>
                      <Textarea
                        {...register("subtitle_en")}
                        rows={3}
                        className="resize-none"
                        placeholder="Enter English subtitle..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Call to Action Buttons ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <Sparkles className="w-4 h-4 text-school-blue-800" />
                <h2 className="font-semibold text-gray-900 text-sm">
                  {locale === "km" ? "ប៊ូតុងសកម្មភាព" : "Call to Action Buttons"}
                </h2>
              </div>
              <div className="p-5 sm:p-6 space-y-5">
                {/* Primary CTA */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">
                    {locale === "km" ? "ប៊ូតុងចម្បង" : "Primary Button"}
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-500">Khmer</Label>
                      <Input
                        {...register("cta_primary_km")}
                        className="font-khmer"
                        placeholder="ចុះឈ្មោះ"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-500">English</Label>
                      <Input
                        {...register("cta_primary_en")}
                        placeholder="Enroll Now"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-500">Link</Label>
                      <Input
                        {...register("cta_primary_href")}
                        placeholder="/contact"
                      />
                    </div>
                  </div>
                </div>

                {/* Secondary CTA */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">
                    {locale === "km" ? "ប៊ូតុងបន្ទាប់បន្សំ" : "Secondary Button"}
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-500">Khmer</Label>
                      <Input
                        {...register("cta_secondary_km")}
                        className="font-khmer"
                        placeholder="មើលព័ត៌មានបន្ថែម"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-500">English</Label>
                      <Input
                        {...register("cta_secondary_en")}
                        placeholder="View Prospectus"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-500">Link</Label>
                      <Input
                        {...register("cta_secondary_href")}
                        placeholder="/about"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ Sidebar ═══ */}
          <div className="space-y-6">
            {/* ── Active Status ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                {isActive ? (
                  <Eye className="w-4 h-4 text-emerald-500" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
                <h2 className="font-semibold text-gray-900 text-sm">
                  {locale === "km" ? "ស្ថានភាព" : "Status"}
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 cursor-pointer">
                      {locale === "km" ? "បើកបង្ហាញ" : "Active"}
                    </Label>
                    <p className="text-[11px] text-gray-400">
                      {locale === "km"
                        ? "បង្ហាញស្លាយនេះនៅលើទំព័រដើម"
                        : "Show this slide on the homepage"}
                    </p>
                  </div>
                  <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* ── Sort Order ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <span className="text-sm font-semibold text-gray-500">#</span>
                <h2 className="font-semibold text-gray-900 text-sm">
                  {locale === "km" ? "លំដាប់" : "Sort Order"}
                </h2>
              </div>
              <div className="p-5">
                <Input
                  type="number"
                  min={1}
                  max={99}
                  {...register("sort_order", { valueAsNumber: true })}
                  className="w-24"
                />
                <p className="text-[11px] text-gray-400 mt-1.5">
                  {locale === "km"
                    ? "ស្លាយដែលលំដាប់តូចនឹងបង្ហាញមុន"
                    : "Lower numbers appear first"}
                </p>
              </div>
            </div>

            {/* ── Image URL ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <ImageIcon className="w-4 h-4 text-school-blue-800" />
                <h2 className="font-semibold text-gray-900 text-sm">
                  {locale === "km" ? "រូបភាព" : "Background Image"}
                </h2>
                {watchImageUrl && (
                  <span className="ml-auto text-[10px] text-emerald-500 font-medium">
                    ✓ {locale === "km" ? "មាន" : "Set"}
                  </span>
                )}
              </div>
              <div className="p-5 space-y-3">
                <Input
                  {...register("image_url", {
                    onBlur: (e) => {
                      const converted = convertGoogleDriveUrl(e.target.value);
                      if (converted !== e.target.value) {
                        setValue("image_url", converted);
                      }
                    },
                  })}
                  placeholder={locale === "km" ? "បិទភ្ជាប់តំណ Google Drive..." : "Paste Google Drive link"}
                  onPaste={(e) => {
                    setTimeout(() => {
                      const input = e.target as HTMLInputElement;
                      const converted = convertGoogleDriveUrl(input.value);
                      if (converted !== input.value) {
                        setValue("image_url", converted);
                      }
                    }, 0);
                  }}
                  className="text-sm"
                />
                {watchImageUrl && (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden border border-gray-100">
                    <img
                      src={watchImageUrl}
                      alt="Preview"
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <p className="text-[11px] text-gray-400">
                  {locale === "km"
                    ? "បើទុកទទេ នឹងប្រើពណ៌ជម្រាល (gradient)"
                    : "Leave empty to use gradient background"}
                </p>
              </div>
            </div>

            {/* ── Gradient ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <Palette className="w-4 h-4 text-school-blue-800" />
                <h2 className="font-semibold text-gray-900 text-sm">
                  {locale === "km" ? "ពណ៌ជម្រាល" : "Gradient"}
                </h2>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    {...register("gradient")}
                    placeholder="linear-gradient(...)"
                    className="text-xs font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowGradientPicker(!showGradientPicker)}
                  >
                    <Palette className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {showGradientPicker && (
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_GRADIENTS.map((g) => (
                      <button
                        key={g.value}
                        type="button"
                        title={g.label}
                        onClick={() => {
                          setValue("gradient", g.value);
                          setShowGradientPicker(false);
                        }}
                        className={`w-full aspect-[3/1] rounded-lg border-2 transition-all hover:scale-105 ${
                          watchGradient === g.value
                            ? "border-school-blue-800 ring-2 ring-school-blue-800/20"
                            : "border-gray-200"
                        }`}
                        style={{ background: g.value }}
                      />
                    ))}
                  </div>
                )}

                {/* Preview */}
                {watchGradient && (
                  <div
                    className="w-full h-12 rounded-lg border border-gray-100"
                    style={{ background: watchGradient }}
                  />
                )}

                <p className="text-[11px] text-gray-400">
                  {locale === "km"
                    ? "ជ្រើសរើសពណ៌ជម្រាល ប្រើនៅពេលគ្មានរូបភាព"
                    : "Gradient is used as fallback when no image is set"}
                </p>
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
                    ? locale === "km"
                      ? "បង្កើតស្លាយ"
                      : "Create Slide"
                    : locale === "km"
                      ? "រក្សាទុក"
                      : "Save Changes"}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
