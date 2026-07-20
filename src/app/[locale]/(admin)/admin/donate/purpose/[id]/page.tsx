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
import { Textarea } from "@/components/ui/textarea";
import { donationPurposeSchema, type DonationPurposeInput } from "@/schemas/validations";
import { createDonationPurpose, updateDonationPurpose, getDonationPurposeById } from "@/actions/donate";
import { DONATE_ICON_NAMES, getDonateIcon } from "@/lib/donate-icons";
import { cn } from "@/utils";

interface PageProps { params: Promise<{ id: string }>; }

export default function DonationPurposeFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === "new";
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(!isNew);

  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<DonationPurposeInput>({
      resolver: zodResolver(donationPurposeSchema),
      defaultValues: { icon: "BookOpen", is_active: true, sort_order: 0 },
    });

  const selectedIcon = watch("icon");

  useEffect(() => {
    if (!isNew) {
      getDonationPurposeById(id).then((data) => {
        if (data) {
          Object.entries(data).forEach(([k, v]) => {
            if (v !== null) setValue(k as keyof DonationPurposeInput, v as string);
          });
        }
        setLoading(false);
      });
    }
  }, [id, isNew, setValue]);

  const onSubmit = async (data: DonationPurposeInput) => {
    const result = isNew ? await createDonationPurpose(data) : await updateDonationPurpose(id, data);
    if (result.success) {
      toast.success(
        isNew
          ? (locale === "km" ? "កាតត្រូវបានបន្ថែម!" : "Card added!")
          : (locale === "km" ? "កាតត្រូវបានកែប្រែ!" : "Card updated!")
      );
      router.push(`/${locale}/admin/donate?tab=why-donate`);
    } else {
      toast.error(result.error ?? "Failed to save");
    }
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/admin/donate?tab=why-donate`}><ArrowLeft className="w-4 h-4 mr-1" />{locale === "km" ? "ត្រឡប់" : "Back"}</Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? (locale === "km" ? "បន្ថែមកាត" : "Add Card") : (locale === "km" ? "កែកាត" : "Edit Card")}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">{locale === "km" ? "ខ្លឹមសារកាត" : "Card Content"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>ចំណងជើង (ខ្មែរ) *</Label>
                  <Input {...register("title_km")} className="font-khmer" placeholder="បណ្ណាល័យ និងសៀវភៅ" />
                  {errors.title_km && <p className="text-xs text-red-500">{errors.title_km.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Title (English) *</Label>
                  <Input {...register("title_en")} placeholder="Library & Books" />
                  {errors.title_en && <p className="text-xs text-red-500">{errors.title_en.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>ការពិពណ៌នា (ខ្មែរ)</Label>
                  <Textarea {...register("desc_km")} className="font-khmer" rows={3} placeholder="ការពិពណ៌នាជាភាសាខ្មែរ" />
                  {errors.desc_km && <p className="text-xs text-red-500">{errors.desc_km.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Description (English)</Label>
                  <Textarea {...register("desc_en")} rows={3} placeholder="Short description of this purpose" />
                  {errors.desc_en && <p className="text-xs text-red-500">{errors.desc_en.message}</p>}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
              <h2 className="font-semibold text-gray-900">Icon</h2>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {DONATE_ICON_NAMES.map((name) => {
                  const Icon = getDonateIcon(name);
                  const active = selectedIcon === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      title={name}
                      onClick={() => setValue("icon", name, { shouldValidate: true })}
                      className={cn(
                        "aspect-square rounded-lg border p-2 flex items-center justify-center transition-colors",
                        active
                          ? "bg-blue-50 border-school-blue-800 text-school-blue-800"
                          : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
              {errors.icon && <p className="text-xs text-red-500">{errors.icon.message}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Settings</h2>
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input type="number" min={0} {...register("sort_order")} placeholder="0" />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Controller name="is_active" control={control} render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )} />
              </div>
              <p className="text-xs text-gray-400">
                {locale === "km"
                  ? "មានតែកាតសកម្មប៉ុណ្ណោះដែលបង្ហាញលើទំព័របរិច្ចាគសាធារណៈ"
                  : "Only active cards are shown on the public Donate page."}
              </p>
            </div>

            <Button type="submit" className="w-full bg-school-blue-800 hover:bg-school-blue-900" disabled={isSubmitting} size="lg">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {isNew
                ? (locale === "km" ? "បន្ថែមកាត" : "Add Card")
                : (locale === "km" ? "រក្សាទុក" : "Save Changes")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
