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
import { adminHref } from "@/utils";
import { bankAccountSchema, type BankAccountInput } from "@/schemas/validations";
import { createBankAccount, updateBankAccount, getBankAccountById } from "@/actions/donate";

interface PageProps { params: Promise<{ id: string }>; }

export default function BankAccountFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === "new";
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(!isNew);

  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<BankAccountInput>({
      resolver: zodResolver(bankAccountSchema),
      defaultValues: { currency: "USD / KHR", logo_color: "#00376f", is_active: true, sort_order: 0 },
    });

  const logoColor = watch("logo_color") ?? "#00376f";

  useEffect(() => {
    if (!isNew) {
      getBankAccountById(id).then((data) => {
        if (data) {
          Object.entries(data).forEach(([k, v]) => {
            if (v !== null) setValue(k as keyof BankAccountInput, v as string);
          });
        }
        setLoading(false);
      });
    }
  }, [id, isNew, setValue]);

  const onSubmit = async (data: BankAccountInput) => {
    const result = isNew ? await createBankAccount(data) : await updateBankAccount(id, data);
    if (result.success) {
      toast.success(
        isNew
          ? (locale === "km" ? "គណនីធនាគារត្រូវបានបន្ថែម!" : "Bank account added!")
          : (locale === "km" ? "គណនីធនាគារត្រូវបានកែប្រែ!" : "Bank account updated!")
      );
      router.push(adminHref(locale, "donate?tab=bank-accounts"));
    } else {
      toast.error(result.error ?? "Failed to save");
    }
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={adminHref(locale, "donate?tab=bank-accounts")}><ArrowLeft className="w-4 h-4 mr-1" />{locale === "km" ? "ត្រឡប់" : "Back"}</Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? (locale === "km" ? "បន្ថែមគណនីធនាគារ" : "Add Bank Account") : (locale === "km" ? "កែគណនីធនាគារ" : "Edit Bank Account")}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">{locale === "km" ? "ព័ត៌មានធនាគារ" : "Bank Information"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>ឈ្មោះធនាគារ (ខ្មែរ) *</Label>
                  <Input {...register("bank_name_km")} className="font-khmer" placeholder="ធនាគារ ABA" />
                  {errors.bank_name_km && <p className="text-xs text-red-500">{errors.bank_name_km.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Bank Name (English) *</Label>
                  <Input {...register("bank_name_en")} placeholder="ABA Bank" />
                  {errors.bank_name_en && <p className="text-xs text-red-500">{errors.bank_name_en.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>ឈ្មោះគណនី (ខ្មែរ) *</Label>
                  <Input {...register("account_name_km")} className="font-khmer" placeholder="វិទ្យាល័យកំរៀង" />
                  {errors.account_name_km && <p className="text-xs text-red-500">{errors.account_name_km.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Account Name (English) *</Label>
                  <Input {...register("account_name_en")} placeholder="Kamrieng High School" />
                  {errors.account_name_en && <p className="text-xs text-red-500">{errors.account_name_en.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Account Number *</Label>
                  <Input {...register("account_number")} className="font-mono" placeholder="000 123 456" />
                  {errors.account_number && <p className="text-xs text-red-500">{errors.account_number.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Input {...register("currency")} placeholder="USD / KHR" />
                  {errors.currency && <p className="text-xs text-red-500">{errors.currency.message}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h2 className="font-semibold text-gray-900">{locale === "km" ? "ឡូហ្គោធនាគារ" : "Bank Logo"}</h2>
              <Controller
                name="logo_url"
                control={control}
                render={({ field }) => (
                  <ImageUploader
                    value={field.value || null}
                    onChange={(url) => field.onChange(url ?? "")}
                    bucket="SETTINGS"
                    folder="banks"
                  />
                )}
              />
              <p className="text-xs text-gray-400">
                {locale === "km"
                  ? "ប្រសិនបើកំណត់ ឡូហ្គោនេះជំនួសក្រឡាពណ៌"
                  : "If set, the logo replaces the colored tile below."}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Settings</h2>
              <div className="space-y-1.5">
                <Label>Logo Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={/^#[0-9a-fA-F]{6}$/.test(logoColor) ? logoColor : "#00376f"}
                    onChange={(e) => setValue("logo_color", e.target.value, { shouldValidate: true })}
                    className="h-10 w-16 rounded-md border border-gray-200 p-1 cursor-pointer bg-white"
                  />
                  <Input {...register("logo_color")} className="font-mono" placeholder="#00376f" />
                </div>
                {errors.logo_color && <p className="text-xs text-red-500">{errors.logo_color.message}</p>}
              </div>
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
                  ? "មានតែគណនីសកម្មប៉ុណ្ណោះដែលបង្ហាញលើទំព័របរិច្ចាគសាធារណៈ"
                  : "Only active accounts are shown on the public Donate page."}
              </p>
            </div>

            <Button type="submit" className="w-full bg-school-blue-800 hover:bg-school-blue-900" disabled={isSubmitting} size="lg">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {isNew
                ? (locale === "km" ? "បន្ថែមគណនី" : "Add Account")
                : (locale === "km" ? "រក្សាទុក" : "Save Changes")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
