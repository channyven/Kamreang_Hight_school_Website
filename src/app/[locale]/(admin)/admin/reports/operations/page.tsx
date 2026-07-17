"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Save, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getOperationsReport, upsertOperationsReport } from "@/actions/Report";
import type { OperationsReportContent } from "@/types";

export default function EditOperationsReportPage() {
  const t = useTranslations("reportAdmin");
  const locale = useLocale() as "km" | "en";
  const router = useRouter();

  const [academicYear, setAcademicYear] = useState("2024-2025");
  const [isPublished, setIsPublished] = useState(false);
  const [content, setContent] = useState<OperationsReportContent>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getOperationsReport();
        if (data) {
          setAcademicYear(data.academic_year);
          setIsPublished(data.is_published);
          setContent(data.content ?? {});
        }
      } catch (err) {
        console.error("Failed to load operations report:", err);
        toast.error(locale === "km" ? "មិនអាចផ្ទុករបាយការណ៍" : "Failed to load report");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [locale]);

  const update = (patch: Partial<OperationsReportContent>) =>
    setContent((c) => ({ ...c, ...patch }));

  const onSubmit = async () => {
    setSaving(true);
    const result = await upsertOperationsReport({
      academic_year: academicYear,
      is_published: isPublished,
      content: content as Record<string, unknown>,
    });
    if (result.success) {
      toast.success(locale === "km" ? "របាយការណ៍ត្រូវបានរក្សាទុក" : "Report saved");
      router.push(`/${locale}/admin/reports`);
    } else {
      toast.error(result.error ?? (locale === "km" ? "រក្សាទុកមិនបាន" : "Failed to save"));
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <Loader2 className="w-8 h-8 animate-spin text-school-blue-800" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/admin/reports`}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t("back")}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">{t("edit_operations")}</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        {/* Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t("academic_year")}>
            <input
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-school-blue-800/30"
              placeholder="2024-2025"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-gray-700 h-10 px-1">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded accent-school-blue-800"
            />
            {t("is_published")}
          </label>
        </div>

        {/* General */}
        <Section title={t("general")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={`${t("principal")} (KM)`}>
              <Text value={content.general?.principal_km ?? ""} onChange={(v) => update({ general: { ...content.general, principal_km: v } })} />
            </Field>
            <Field label={`${t("principal")} (EN)`}>
              <Text value={content.general?.principal_en ?? ""} onChange={(v) => update({ general: { ...content.general, principal_en: v } })} />
            </Field>
            <Field label={t("total_staff")}>
              <Num value={content.general?.total_staff} onChange={(v) => update({ general: { ...content.general, total_staff: v } })} />
            </Field>
            <Field label={t("total_students")}>
              <Num value={content.general?.total_students} onChange={(v) => update({ general: { ...content.general, total_students: v } })} />
            </Field>
            <Field label={t("total_classes")}>
              <Num value={content.general?.total_classes} onChange={(v) => update({ general: { ...content.general, total_classes: v } })} />
            </Field>
            <Field label={t("land_area")}>
              <Num value={content.general?.land_area_sqm} onChange={(v) => update({ general: { ...content.general, land_area_sqm: v } })} />
            </Field>
            <Field label={t("established_year")}>
              <Num value={content.general?.established_year} onChange={(v) => update({ general: { ...content.general, established_year: v } })} />
            </Field>
            <div className="sm:col-span-2">
              <Field label={`${t("summary")} (KM)`}>
                <TextArea value={content.general?.summary_km ?? ""} onChange={(v) => update({ general: { ...content.general, summary_km: v } })} />
              </Field>
              <Field label={`${t("summary")} (EN)`}>
                <TextArea value={content.general?.summary_en ?? ""} onChange={(v) => update({ general: { ...content.general, summary_en: v } })} />
              </Field>
            </div>
          </div>
        </Section>

        {/* Teaching hours */}
        <Section title={t("teaching_hours")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t("weekly_hours")}>
              <Num value={content.teaching_hours?.weekly_hours} onChange={(v) => update({ teaching_hours: { ...content.teaching_hours, weekly_hours: v } })} />
            </Field>
            <div className="sm:col-span-2">
              <Field label={`${t("teaching_notes")} (KM)`}>
                <TextArea value={content.teaching_hours?.notes_km ?? ""} onChange={(v) => update({ teaching_hours: { ...content.teaching_hours, notes_km: v } })} />
              </Field>
              <Field label={`${t("teaching_notes")} (EN)`}>
                <TextArea value={content.teaching_hours?.notes_en ?? ""} onChange={(v) => update({ teaching_hours: { ...content.teaching_hours, notes_en: v } })} />
              </Field>
            </div>
          </div>
        </Section>

        {/* Student stats (dynamic) */}
        <Section title={t("student_stats")}>
          <ArrayEditor
            items={content.student_stats?.items ?? []}
            onItems={(items) => update({ student_stats: { ...content.student_stats, items } })}
            newItem={{ label_km: "", label_en: "", value: 0, suffix: "" }}
            render={(item, setItem) => (
              <>
                <Field label={t("label_km")}><Text value={item.label_km} onChange={(v) => setItem({ ...item, label_km: v })} /></Field>
                <Field label={t("label_en")}><Text value={item.label_en} onChange={(v) => setItem({ ...item, label_en: v })} /></Field>
                <Field label={t("value")}><Num value={item.value} onChange={(v) => setItem({ ...item, value: v })} /></Field>
                <Field label="%"><Text value={item.suffix ?? ""} onChange={(v) => setItem({ ...item, suffix: v })} /></Field>
              </>
            )}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <Field label={`${t("student_stats")} note (KM)`}>
              <TextArea value={content.student_stats?.notes_km ?? ""} onChange={(v) => update({ student_stats: { ...content.student_stats, notes_km: v } })} />
            </Field>
            <Field label={`${t("student_stats")} note (EN)`}>
              <TextArea value={content.student_stats?.notes_en ?? ""} onChange={(v) => update({ student_stats: { ...content.student_stats, notes_en: v } })} />
            </Field>
          </div>
        </Section>

        {/* Staff status (dynamic) */}
        <Section title={t("staff_status")}>
          <ArrayEditor
            items={content.staff_status ?? []}
            onItems={(items) => update({ staff_status: items })}
            newItem={{ label_km: "", label_en: "", count: 0 }}
            render={(item, setItem) => (
              <>
                <Field label={t("label_km")}><Text value={item.label_km} onChange={(v) => setItem({ ...item, label_km: v })} /></Field>
                <Field label={t("label_en")}><Text value={item.label_en} onChange={(v) => setItem({ ...item, label_en: v })} /></Field>
                <Field label={t("value")}><Num value={item.count} onChange={(v) => setItem({ ...item, count: v })} /></Field>
              </>
            )}
          />
        </Section>

        {/* Facilities (dynamic) */}
        <Section title={t("facilities")}>
          <ArrayEditor
            items={content.facilities?.items ?? []}
            onItems={(items) => update({ facilities: { ...content.facilities, items } })}
            newItem={{ label_km: "", label_en: "", detail_km: "", detail_en: "" }}
            render={(item, setItem) => (
              <>
                <Field label={t("label_km")}><Text value={item.label_km} onChange={(v) => setItem({ ...item, label_km: v })} /></Field>
                <Field label={t("label_en")}><Text value={item.label_en} onChange={(v) => setItem({ ...item, label_en: v })} /></Field>
                <Field label={t("detail_km")}><Text value={item.detail_km} onChange={(v) => setItem({ ...item, detail_km: v })} /></Field>
                <Field label={t("detail_en")}><Text value={item.detail_en} onChange={(v) => setItem({ ...item, detail_en: v })} /></Field>
              </>
            )}
          />
        </Section>

        {/* Budget (dynamic) */}
        <Section title={t("budget")}>
          <Field label={t("currency")}>
            <Text value={content.budget?.currency ?? "USD"} onChange={(v) => update({ budget: { ...content.budget, currency: v } })} />
          </Field>
          <ArrayEditor
            items={content.budget?.items ?? []}
            onItems={(items) => update({ budget: { ...content.budget, items } })}
            newItem={{ label_km: "", label_en: "", amount: 0 }}
            render={(item, setItem) => (
              <>
                <Field label={t("label_km")}><Text value={item.label_km} onChange={(v) => setItem({ ...item, label_km: v })} /></Field>
                <Field label={t("label_en")}><Text value={item.label_en} onChange={(v) => setItem({ ...item, label_en: v })} /></Field>
                <Field label={t("amount")}><Num value={item.amount} onChange={(v) => setItem({ ...item, amount: v })} /></Field>
              </>
            )}
          />
        </Section>

        {/* Challenges (dynamic) */}
        <Section title={t("challenges")}>
          <ArrayEditor
            items={content.challenges ?? []}
            onItems={(items) => update({ challenges: items })}
            newItem={{ title_km: "", title_en: "", detail_km: "", detail_en: "" }}
            render={(item, setItem) => (
              <>
                <Field label={`${t("challenges")} (KM)`}><Text value={item.title_km} onChange={(v) => setItem({ ...item, title_km: v })} /></Field>
                <Field label={`${t("challenges")} (EN)`}><Text value={item.title_en} onChange={(v) => setItem({ ...item, title_en: v })} /></Field>
                <Field label={t("detail_km")}><TextArea value={item.detail_km} onChange={(v) => setItem({ ...item, detail_km: v })} /></Field>
                <Field label={t("detail_en")}><TextArea value={item.detail_en} onChange={(v) => setItem({ ...item, detail_en: v })} /></Field>
              </>
            )}
          />
        </Section>

        {/* Future direction (dynamic) */}
        <Section title={t("future_direction")}>
          <ArrayEditor
            items={content.future_direction ?? []}
            onItems={(items) => update({ future_direction: items })}
            newItem={{ km: "", en: "" }}
            render={(item, setItem) => (
              <>
                <Field label={`${t("future_direction")} (KM)`}><TextArea value={item.km} onChange={(v) => setItem({ ...item, km: v })} /></Field>
                <Field label={`${t("future_direction")} (EN)`}><TextArea value={item.en} onChange={(v) => setItem({ ...item, en: v })} /></Field>
              </>
            )}
          />
        </Section>
      </div>

      <Button
        onClick={onSubmit}
        className="w-full bg-school-blue-800 hover:bg-school-blue-900 rounded-lg h-12 text-base"
        disabled={saving}
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
        {t("save")}
      </Button>
    </div>
  );
}

// ─── Small presentational helpers ────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-500 mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function Text({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-school-blue-800/30"
    />
  );
}

function TextArea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={2}
      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-school-blue-800/30"
    />
  );
}

function Num({ value, onChange }: { value: number | undefined; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      value={value ?? 0}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-school-blue-800/30"
    />
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-gray-100 pt-5">
      <h3 className="text-sm font-semibold text-school-blue-900 mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ArrayEditor<T extends object>({
  items,
  onItems,
  newItem,
  render,
}: {
  items: T[];
  onItems: (items: T[]) => void;
  newItem: T;
  render: (item: T, setItem: (i: T) => void, index: number) => React.ReactNode;
}) {
  const t = useTranslations("reportAdmin");
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end bg-gray-50 rounded-lg p-3">
          {render(item, (ni) => {
            const copy = [...items];
            copy[i] = ni;
            onItems(copy);
          }, i)}
          <button
            type="button"
            onClick={() => onItems(items.filter((_, idx) => idx !== i))}
            className="col-span-2 sm:col-span-4 flex items-center justify-center gap-1 text-xs text-red-600 hover:text-red-700 py-1"
          >
            <X className="w-3.5 h-3.5" /> {t("remove_item")}
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onItems([...items, newItem])}
        className="flex items-center gap-1.5 text-sm font-medium text-school-blue-800 hover:text-school-blue-900"
      >
        <Plus className="w-4 h-4" /> {t("add_item")}
      </button>
    </div>
  );
}
