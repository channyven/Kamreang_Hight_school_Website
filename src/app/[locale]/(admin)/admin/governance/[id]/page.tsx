"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { governanceItemSchema, type GovernanceItemInput } from "@/lib/validations";
import { createGovernanceItem, updateGovernanceItem, getGovernanceItemById } from "@/actions/governance";
import { GOVERNANCE_ICON_NAMES, getGovernanceIcon } from "@/lib/governance-icons";
import { cn } from "@/lib/utils";
import type { GovernanceSection } from "@/types";

interface PageProps { params: Promise<{ id: string }>; }

const SECTION_OPTIONS: { value: GovernanceSection; label_km: string; label_en: string }[] = [
  { value: "governance", label_km: "អភិបាលកិច្ចសាលារៀន", label_en: "School Governance" },
  { value: "culture", label_km: "វប្បធម៌បង្រៀន និងរៀន", label_en: "Teaching & Learning Culture" },
];

export default function GovernanceItemFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === "new";
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(!isNew);

  const defaultSection = (searchParams.get("section") as GovernanceSection) ?? "governance";

  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<GovernanceItemInput>({
      resolver: zodResolver(governanceItemSchema),
      defaultValues: { section: defaultSection, icon: "ClipboardCheck", is_active: true, sort_order: 0 },
    });

  const selectedIcon = watch("icon");
  const currentSection = watch("section") ?? defaultSection;

  useEffect(() => {
    if (!isNew) {
      getGovernanceItemById(id).then((data) => {
        if (data) Object.entries(data).forEach(([k, v]) => { if (v !== null) setValue(k as keyof GovernanceItemInput, v as string); });
        setLoading(false);
      });
    }
  }, [id, isNew, setValue]);

  const onSubmit = async (data: GovernanceItemInput) => {
    const result = isNew ? await createGovernanceItem(data) : await updateGovernanceItem(id, data);
    if (result.success) { toast.success(isNew ? "Item created!" : "Item updated!"); router.push(`/${locale}/admin/governance?section=${data.section}`); }
    else toast.error(result.error ?? "Failed to save");
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/admin/governance?section=${currentSection}`}><ArrowLeft className="w-4 h-4 mr-1" />{locale === "km" ? "ត្រឡប់" : "Back"}</Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? (locale === "km" ? "បន្ថែមធាតុ" : "New Item") : (locale === "km" ? "កែធាតុ" : "Edit Item")}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Text</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>អត្ថបទ (ខ្មែរ) *</Label>
                  <Textarea {...register("text_km")} className="font-khmer" rows={4} placeholder="អត្ថបទជាភាសាខ្មែរ" />
                  {errors.text_km && <p className="text-xs text-red-500">{errors.text_km.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Text (English) *</Label>
                  <Textarea {...register("text_en")} rows={4} placeholder="Item text" />
                  {errors.text_en && <p className="text-xs text-red-500">{errors.text_en.message}</p>}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
              <h2 className="font-semibold text-gray-900">Icon</h2>
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                {GOVERNANCE_ICON_NAMES.map((name) => {
                  const Icon = getGovernanceIcon(name);
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
                <Label>Section</Label>
                <Controller
                  name="section"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTION_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {locale === "km" ? s.label_km : s.label_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
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
            </div>

            <Button type="submit" className="w-full bg-school-blue-800 hover:bg-school-blue-900" disabled={isSubmitting} size="lg">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {isNew ? "Create Item" : "Update Item"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
