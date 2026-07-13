"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { DocumentInput } from "@/lib/validations";
import { documentSchema } from "@/lib/validations";
import { createDocument } from "@/actions/Document";
import ContentCard from "./ContentCard";
import FileCard from "./FileCard";
import SettingsCard from "./SettingsCard";
import { Button } from "@/components/ui/button";

/**
 * Full-page form for creating a new document.
 * Composed of ContentCard, FileCard, SettingsCard, and a submit button.
 */
export default function NewDocumentForm() {
  const locale = useLocale();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DocumentInput>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      category: "other",
      sort_order: 0,
      is_active: true,
      title_km: "",
      title_en: "",
      description_km: "",
      description_en: "",
      file_url: "",
      file_name: "",
    },
  });

  const onSubmit = async (data: DocumentInput) => {
    const result = await createDocument(data);

    if (result.success) {
      toast.success(locale === "km" ? "ឯកសារត្រូវបានបង្កើត!" : "Document created!");
      reset();
      router.push(`/${locale}/admin/documents`);
    } else {
      toast.error(result.error ?? (locale === "km" ? "បង្កើតឯកសារមិនបានសម្រេច" : "Failed to create document"));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/admin/documents`}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            {locale === "km" ? "ត្រឡប់" : "Back"}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {locale === "km" ? "ឯកសារថ្មី" : "New Document"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left column (70%) - Content + File */}
          <div className="lg:col-span-3 space-y-5">
            <ContentCard register={register} errors={errors} />
            <FileCard register={register} errors={errors} />
          </div>

          {/* Right column (30%) - Settings + Submit */}
          <div className="lg:col-span-2 space-y-5">
            <SettingsCard control={control} errors={errors} />

            <Button
              type="submit"
              className="w-full bg-school-blue-800 hover:bg-school-blue-900 rounded-lg h-12 text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              {locale === "km" ? "បង្កើតឯកសារ" : "Create Document"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
