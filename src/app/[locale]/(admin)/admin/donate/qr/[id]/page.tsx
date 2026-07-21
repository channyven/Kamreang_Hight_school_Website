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
import ImageUploader from "@/components/admin/ImageUploader";
import { adminHref, convertGoogleDriveUrl } from "@/utils";
import { donationQrSchema, type DonationQrInput } from "@/schemas/validations";
import { createDonationQr, updateDonationQr, getDonationQrById } from "@/actions/donate";

interface PageProps { params: Promise<{ id: string }>; }

export default function DonationQrFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === "new";
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(!isNew);

  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<DonationQrInput>({
      resolver: zodResolver(donationQrSchema),
      defaultValues: { image_url: "", is_active: true, sort_order: 0 },
    });

  const watchImageUrl = watch("image_url");

  // Auto-convert Google Drive share links to our proxy format whenever the value changes
  useEffect(() => {
    if (watchImageUrl) {
      const converted = convertGoogleDriveUrl(watchImageUrl);
      if (converted !== watchImageUrl) {
        setValue("image_url", converted);
      }
    }
  }, [watchImageUrl, setValue]);

  useEffect(() => {
    if (!isNew) {
      getDonationQrById(id).then((data) => {
        if (data) {
          Object.entries(data).forEach(([k, v]) => {
            if (v !== null) setValue(k as keyof DonationQrInput, v as string);
          });
        }
        setLoading(false);
      });
    }
  }, [id, isNew, setValue]);

  const onSubmit = async (data: DonationQrInput) => {
    const result = isNew ? await createDonationQr(data) : await updateDonationQr(id, data);
    if (result.success) {
      toast.success(
        isNew
          ? (locale === "km" ? "កូដ QR ត្រូវបានបន្ថែម!" : "QR code added!")
          : (locale === "km" ? "កូដ QR ត្រូវបានកែប្រែ!" : "QR code updated!")
      );
      router.push(adminHref(locale, "donate?tab=qr-code"));
    } else {
      toast.error(result.error ?? "Failed to save");
    }
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={adminHref(locale, "donate?tab=qr-code")}><ArrowLeft className="w-4 h-4 mr-1" />{locale === "km" ? "ត្រឡប់" : "Back"}</Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? (locale === "km" ? "បន្ថែមកូដ QR" : "Add QR Code") : (locale === "km" ? "កែកូដ QR" : "Edit QR Code")}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">{locale === "km" ? "រូបភាពកូដ QR" : "QR Code Image"}</h2>
              <Controller
                name="image_url"
                control={control}
                render={({ field }) => (
                  <ImageUploader
                    value={field.value || null}
                    onChange={(url) => field.onChange(url ?? "")}
                    bucket="SETTINGS"
                    folder="donate"
                    label={locale === "km" ? "ផ្ទុករូបភាព ឬបិទភ្ជាប់ URL" : "Upload an image or paste a URL"}
                  />
                )}
              />
              {errors.image_url && <p className="text-xs text-red-500">{errors.image_url.message}</p>}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">{locale === "km" ? "ស្លាក" : "Label"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>ស្លាក (ខ្មែរ)</Label>
                  <Input {...register("label_km")} className="font-khmer" placeholder="ធនាគារ ABA" />
                  {errors.label_km && <p className="text-xs text-red-500">{errors.label_km.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Label (English)</Label>
                  <Input {...register("label_en")} placeholder="ABA / KHQR" />
                  {errors.label_en && <p className="text-xs text-red-500">{errors.label_en.message}</p>}
                </div>
              </div>
              <p className="text-xs text-gray-400">
                {locale === "km"
                  ? "ស្លាកបង្ហាញនៅក្រោមកូដ QR លើទំព័របរិច្ចាគសាធារណៈ"
                  : "The label is shown under the QR code on the public Donate page."}
              </p>
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
                  ? "មានតែកូដ QR សកម្មប៉ុណ្ណោះដែលបង្ហាញលើទំព័របរិច្ចាគសាធារណៈ"
                  : "Only active QR codes are shown on the public Donate page."}
              </p>
            </div>

            <Button type="submit" className="w-full bg-school-blue-800 hover:bg-school-blue-900" disabled={isSubmitting} size="lg">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {isNew
                ? (locale === "km" ? "បន្ថែមកូដ QR" : "Add QR Code")
                : (locale === "km" ? "រក្សាទុក" : "Save Changes")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
