"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Plus, Search, Edit, Trash2, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { HeroSlide } from "@/types";
import { getLocalizedText, adminHref } from "@/utils";
import { toast } from "sonner";
import {
  getAdminHeroSlides,
  deleteHeroSlide,
  toggleHeroSlideActive,
  reorderHeroSlides,
} from "@/actions/hero-slides";

export default function AdminHeroSlidesPage() {
  const locale = useLocale();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    const items = await getAdminHeroSlides();
    setSlides(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const result = await deleteHeroSlide(id);
    if (result.success) {
      toast.success(locale === "km" ? "លុបបានដោយជោគជ័យ" : "Slide deleted");
      fetchSlides();
    } else {
      toast.error(result.error ?? (locale === "km" ? "បរាជ័យក្នុងការលុប" : "Failed to delete"));
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    const result = await toggleHeroSlideActive(id, !current);
    if (result.success) {
      toast.success(
        !current
          ? (locale === "km" ? "បានបើកបង្ហាញ" : "Slide activated")
          : (locale === "km" ? "បានបិទការបង្ហាញ" : "Slide deactivated")
      );
      fetchSlides();
    } else {
      toast.error(result.error ?? "Failed to toggle");
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newSlides = [...slides];
    [newSlides[index - 1], newSlides[index]] = [newSlides[index], newSlides[index - 1]];
    const ids = newSlides.map((s) => s.id);
    const result = await reorderHeroSlides(ids);
    if (result.success) {
      setSlides(newSlides);
      toast.success(locale === "km" ? "បានផ្លាស់ប្ដូរលំដាប់" : "Reordered");
    } else {
      toast.error(result.error ?? "Failed to reorder");
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === slides.length - 1) return;
    const newSlides = [...slides];
    [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
    const ids = newSlides.map((s) => s.id);
    const result = await reorderHeroSlides(ids);
    if (result.success) {
      setSlides(newSlides);
      toast.success(locale === "km" ? "បានផ្លាស់ប្ដូរលំដាប់" : "Reordered");
    } else {
      toast.error(result.error ?? "Failed to reorder");
    }
  };

  const filteredSlides = search
    ? slides.filter(
        (s) =>
          s.title_en?.toLowerCase().includes(search.toLowerCase()) ||
          s.title_km?.toLowerCase().includes(search.toLowerCase())
      )
    : slides;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {locale === "km" ? "គ្រប់គ្រងស្លាយពិពណ៌នា" : "Hero Slideshow"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {slides.length}/5 {locale === "km" ? "ស្លាយ" : "slides"}
            {slides.length >= 5 && (
              <span className="ml-2 text-amber-600 text-xs">
                ({locale === "km" ? "ឈានដល់កំណត់" : "limit reached"})
              </span>
            )}
          </p>
        </div>
        <Button
          asChild
          className={
            slides.length >= 5
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-school-blue-800 hover:bg-school-blue-900"
          }
          disabled={slides.length >= 5}
        >
          <Link
            href={slides.length >= 5 ? "#" : `/${locale}/admin/hero-slides/new`}
            onClick={
              slides.length >= 5
                ? (e) => {
                    e.preventDefault();
                    toast.error(
                      locale === "km"
                        ? "អ្នកអាចមានស្លាយបានត្រឹមតែ 5 ប៉ុណ្ណោះ។ សូមលុប ឬបិទស្លាយដែលមានស្រាប់ខ្លះជាមុនសិន។"
                        : "You can only have up to 5 hero slides. Please delete or deactivate some existing slides first."
                    );
                  }
                : undefined
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            {locale === "km" ? "បន្ថែមស្លាយ" : "New Slide"}
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder={locale === "km" ? "ស្វែងរក..." : "Search slides..."}
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Slides List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-school-blue-800" />
          </div>
        ) : filteredSlides.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-gray-200">
            <p>{locale === "km" ? "រកមិនឃើញ" : "No slides found"}</p>
          </div>
        ) : (
          filteredSlides.map((slide, index) => {
            const title = getLocalizedText(slide.title_km, slide.title_en, locale);
            return (
              <div
                key={slide.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-gray-300"
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowUp className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === slides.length - 1}
                      className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>

                  <span className="text-xs font-mono text-gray-400 w-5 shrink-0 text-center">
                    {slide.sort_order}
                  </span>

                  {/* Thumbnail / Gradient preview */}
                  <div className="w-28 h-16 shrink-0 rounded-lg overflow-hidden border border-gray-100">
                    {slide.image_url ? (
                      <Image
                        src={slide.image_url}
                        alt={title}
                        width={112}
                        height={64}
                        className="object-cover w-full h-full"
                        unoptimized={
                          slide.image_url.includes("google.com") ||
                          slide.image_url.includes("firebasestorage")
                        }
                      />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{
                          background: slide.gradient ?? "linear-gradient(135deg, #0d1b38, #1e3a8a)",
                        }}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium text-gray-900 truncate ${
                        locale === "km" ? "font-khmer" : ""
                      }`}
                    >
                      {title}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {getLocalizedText(
                        slide.subtitle_km ?? "",
                        slide.subtitle_en ?? "",
                        locale
                      ) || (locale === "km" ? "គ្មានអត្ថបទរង" : "No subtitle")}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Active Toggle */}
                    <div className="flex items-center gap-1.5">
                      <Switch
                        checked={slide.is_active}
                        onCheckedChange={() => handleToggleActive(slide.id, slide.is_active)}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                      <span className="text-[11px] text-gray-400 hidden sm:inline">
                        {slide.is_active
                          ? locale === "km"
                            ? "បើក"
                            : "On"
                          : locale === "km"
                            ? "បិទ"
                            : "Off"}
                      </span>
                    </div>

                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                      <Link href={adminHref(locale, `hero-slides/${slide.id}`)}>
                        <Edit className="w-4 h-4 text-blue-500" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(slide.id, title)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
