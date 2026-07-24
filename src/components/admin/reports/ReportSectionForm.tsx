"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft, Save, Loader2, Plus, Trash2, ChevronUp, ChevronDown, X,
  Rows3, Table2, List as ListIcon, AlignLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

import {
  getReportCustomSectionById,
  createReportCustomSection,
  updateReportCustomSection,
} from "@/actions/Report";
import type { ReportBlock, ReportSubsection } from "@/types";
import { adminHref, cn } from "@/utils";

type Lang = "km" | "en";
type UseT = ReturnType<typeof useTranslations>;

interface ReportSectionFormProps {
  id?: string;
}

function newBlock(type: ReportBlock["type"]): ReportBlock {
  switch (type) {
    case "keyvalue":
      return { type: "keyvalue", rows: [{ label_km: "", label_en: "", value: "" }] };
    case "table":
      return {
        type: "table",
        columns: [{ km: "", en: "" }, { km: "", en: "" }],
        rows: [["", ""]],
        note_km: "",
        note_en: "",
      };
    case "list":
      return { type: "list", items: [{ km: "", en: "" }] };
    case "paragraph":
      return { type: "paragraph", paragraphs: [{ km: "", en: "" }] };
  }
}

function emptySubsection(): ReportSubsection {
  return { key: "", title_km: "", title_en: "", blocks: [] };
}

function reindexKeys(subs: ReportSubsection[]): ReportSubsection[] {
  return subs.map((s, i) => ({ ...s, key: String.fromCharCode(97 + i) }));
}

export default function ReportSectionForm({ id }: ReportSectionFormProps) {
  const t = useTranslations("reportAdmin");
  const locale = useLocale() as Lang;
  const router = useRouter();
  const editing = Boolean(id);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [lang, setLang] = useState<Lang>(locale);

  const [sectionNumber, setSectionNumber] = useState(1);
  const [titleKm, setTitleKm] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [subsections, setSubsections] = useState<ReportSubsection[]>(
    reindexKeys([emptySubsection()])
  );

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const section = await getReportCustomSectionById(id);
        if (section && active) {
          setSectionNumber(section.section_number);
          setTitleKm(section.title_km);
          setTitleEn(section.title_en);
          setIsActive(section.is_active);
          setSubsections(
            section.subsections.length
              ? reindexKeys(section.subsections)
              : reindexKeys([emptySubsection()])
          );
        } else if (!section && active) {
          toast.error(locale === "km" ? "រកមិនឃើញ" : "Not found");
          router.push(adminHref(locale, "reports"));
        }
      } catch (err) {
        console.error("Failed to load report section:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id, locale, router]);

  // ── Subsection mutators ──────────────────────────────────────
  const updateSubsection = (idx: number, patch: Partial<ReportSubsection>) => {
    setSubsections((subs) => {
      const next = [...subs];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  };
  const addSubsection = () => {
    setSubsections((subs) => reindexKeys([...subs, emptySubsection()]));
  };
  const removeSubsection = (idx: number) => {
    setSubsections((subs) => reindexKeys(subs.filter((_, i) => i !== idx)));
  };
  const moveSubsection = (idx: number, dir: -1 | 1) => {
    setSubsections((subs) => {
      const target = idx + dir;
      if (target < 0 || target >= subs.length) return subs;
      const next = [...subs];
      [next[idx], next[target]] = [next[target], next[idx]];
      return reindexKeys(next);
    });
  };

  // ── Block mutators (scoped to a subsection) ──────────────────
  const addBlock = (subIdx: number, type: ReportBlock["type"]) => {
    updateSubsection(subIdx, { blocks: [...subsections[subIdx].blocks, newBlock(type)] });
  };
  const updateBlock = (subIdx: number, blockIdx: number, block: ReportBlock) => {
    const blocks = [...subsections[subIdx].blocks];
    blocks[blockIdx] = block;
    updateSubsection(subIdx, { blocks });
  };
  const removeBlock = (subIdx: number, blockIdx: number) => {
    updateSubsection(subIdx, {
      blocks: subsections[subIdx].blocks.filter((_, i) => i !== blockIdx),
    });
  };
  const moveBlock = (subIdx: number, blockIdx: number, dir: -1 | 1) => {
    const blocks = subsections[subIdx].blocks;
    const target = blockIdx + dir;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[blockIdx], next[target]] = [next[target], next[blockIdx]];
    updateSubsection(subIdx, { blocks: next });
  };

  const onSubmit = async () => {
    setSaving(true);
    const payload = {
      section_number: sectionNumber,
      title_km: titleKm,
      title_en: titleEn,
      is_active: isActive,
      subsections,
    };
    const result = editing
      ? await updateReportCustomSection(id!, payload)
      : await createReportCustomSection(payload);

    if (result.success) {
      toast.success(locale === "km" ? "បានរក្សាទុក!" : "Saved!");
      router.push(adminHref(locale, "reports"));
    } else {
      toast.error(result.error ?? (locale === "km" ? "រក្សាទុកមិនបាន" : "Failed to save"));
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={adminHref(locale, "reports")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t("back")}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {editing ? t("edit_section") : t("new_section")}
        </h1>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section meta */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr_auto_auto] gap-4 items-end">
              <Field label={t("section_number")}>
                <Input
                  type="number"
                  value={sectionNumber}
                  onChange={(e) => setSectionNumber(Number(e.target.value))}
                  className="h-10"
                />
              </Field>
              <Field label={t("section_title")}>
                <BilingualInput
                  lang={lang}
                  valueKm={titleKm}
                  valueEn={titleEn}
                  onChangeKm={setTitleKm}
                  onChangeEn={setTitleEn}
                  className="h-10"
                />
              </Field>
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-gray-500 block">{t("language")}</span>
                <LangToggle lang={lang} onChange={setLang} />
              </div>
              <div className="flex items-center gap-2 pb-2.5 shrink-0">
                <Label className="text-sm text-gray-700">{t("active")}</Label>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </div>
          </div>

          {/* Subsections */}
          <div className="space-y-4">
            {subsections.map((sub, subIdx) => (
              <SubsectionCard
                key={subIdx}
                subsection={sub}
                index={subIdx}
                total={subsections.length}
                lang={lang}
                t={t}
                onTitleKmChange={(v) => updateSubsection(subIdx, { title_km: v })}
                onTitleEnChange={(v) => updateSubsection(subIdx, { title_en: v })}
                onMove={(dir) => moveSubsection(subIdx, dir)}
                onRemove={() => removeSubsection(subIdx)}
                onAddBlock={(type) => addBlock(subIdx, type)}
                onUpdateBlock={(blockIdx, block) => updateBlock(subIdx, blockIdx, block)}
                onRemoveBlock={(blockIdx) => removeBlock(subIdx, blockIdx)}
                onMoveBlock={(blockIdx, dir) => moveBlock(subIdx, blockIdx, dir)}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addSubsection}
              className="w-full sm:w-auto border-dashed gap-2"
            >
              <Plus className="w-4 h-4" />
              {t("add_subsection")}
            </Button>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => router.push(adminHref(locale, "reports"))}>
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={onSubmit}
              className="bg-school-blue-800 hover:bg-school-blue-900 min-w-[160px] h-11"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {locale === "km" ? "កំពុងរក្សាទុក..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editing ? t("update_section") : t("create_section")}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Field ─────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-gray-500 block">{label}</span>
      {children}
    </label>
  );
}

// ─── Language toggle ───────────────────────────────────────────

function LangToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <button
        type="button"
        onClick={() => onChange("km")}
        className={cn(
          "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
          lang === "km" ? "bg-white text-school-blue-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
        )}
      >
        ខ្មែរ
      </button>
      <button
        type="button"
        onClick={() => onChange("en")}
        className={cn(
          "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
          lang === "en" ? "bg-white text-school-blue-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
        )}
      >
        English
      </button>
    </div>
  );
}

// ─── Bilingual field helpers ────────────────────────────────────
// Backed by two values (km/en) but only render the input for the
// currently active form language — halves the visible inputs per row.

function BilingualInput({
  lang, valueKm, valueEn, onChangeKm, onChangeEn, className,
}: {
  lang: Lang; valueKm: string; valueEn: string;
  onChangeKm: (v: string) => void; onChangeEn: (v: string) => void;
  className?: string;
}) {
  const value = lang === "km" ? valueKm : valueEn;
  const onChange = lang === "km" ? onChangeKm : onChangeEn;
  return <Input value={value} onChange={(e) => onChange(e.target.value)} className={className ?? "h-9"} />;
}

function BilingualTextarea({
  lang, valueKm, valueEn, onChangeKm, onChangeEn, rows = 2, className,
}: {
  lang: Lang; valueKm: string; valueEn: string;
  onChangeKm: (v: string) => void; onChangeEn: (v: string) => void;
  rows?: number; className?: string;
}) {
  const value = lang === "km" ? valueKm : valueEn;
  const onChange = lang === "km" ? onChangeKm : onChangeEn;
  return <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className={className ?? "text-sm"} />;
}

// ─── Subsection card ─────────────────────────────────────────

function SubsectionCard({
  subsection, index, total, lang, t,
  onTitleKmChange, onTitleEnChange, onMove, onRemove,
  onAddBlock, onUpdateBlock, onRemoveBlock, onMoveBlock,
}: {
  subsection: ReportSubsection;
  index: number;
  total: number;
  lang: Lang;
  t: UseT;
  onTitleKmChange: (v: string) => void;
  onTitleEnChange: (v: string) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onAddBlock: (type: ReportBlock["type"]) => void;
  onUpdateBlock: (blockIdx: number, block: ReportBlock) => void;
  onRemoveBlock: (blockIdx: number) => void;
  onMoveBlock: (blockIdx: number, dir: -1 | 1) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-[56px_1fr_auto] gap-3 items-end">
        <Field label={t("subsection_key")}>
          <Input value={subsection.key} disabled className="h-10 text-center font-mono bg-gray-50" />
        </Field>
        <Field label={t("subsection_title")}>
          <BilingualInput
            lang={lang}
            valueKm={subsection.title_km}
            valueEn={subsection.title_en}
            onChangeKm={onTitleKmChange}
            onChangeEn={onTitleEnChange}
            className="h-10"
          />
        </Field>
        <div className="flex items-center gap-1 pb-0.5 shrink-0">
          <Button
            type="button" variant="ghost" size="icon"
            className="h-9 w-9 text-gray-400 hover:text-gray-700"
            disabled={index === 0} onClick={() => onMove(-1)}
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button
            type="button" variant="ghost" size="icon"
            className="h-9 w-9 text-gray-400 hover:text-gray-700"
            disabled={index === total - 1} onClick={() => onMove(1)}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button
            type="button" variant="ghost" size="icon"
            className="h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50"
            onClick={onRemove}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Blocks */}
      {subsection.blocks.length > 0 && (
        <div className="space-y-3 pl-0 sm:pl-4 sm:border-l-2 sm:border-gray-100">
          {subsection.blocks.map((block, blockIdx) => (
            <BlockCard
              key={blockIdx}
              block={block}
              index={blockIdx}
              total={subsection.blocks.length}
              lang={lang}
              t={t}
              onChange={(b) => onUpdateBlock(blockIdx, b)}
              onMove={(dir) => onMoveBlock(blockIdx, dir)}
              onRemove={() => onRemoveBlock(blockIdx)}
            />
          ))}
        </div>
      )}

      {/* Add block toolbar */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-medium text-gray-400">{t("add_block")}:</span>
        <Button type="button" variant="outline" size="sm" onClick={() => onAddBlock("keyvalue")} className="gap-1.5 text-xs h-8">
          <Rows3 className="w-3.5 h-3.5" /> {t("block_keyvalue")}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => onAddBlock("table")} className="gap-1.5 text-xs h-8">
          <Table2 className="w-3.5 h-3.5" /> {t("block_table")}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => onAddBlock("list")} className="gap-1.5 text-xs h-8">
          <ListIcon className="w-3.5 h-3.5" /> {t("block_list")}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => onAddBlock("paragraph")} className="gap-1.5 text-xs h-8">
          <AlignLeft className="w-3.5 h-3.5" /> {t("block_paragraph")}
        </Button>
      </div>
    </div>
  );
}

// ─── Block card (dispatches by type) ──────────────────────────

function BlockCard({
  block, index, total, lang, t, onChange, onMove, onRemove,
}: {
  block: ReportBlock;
  index: number;
  total: number;
  lang: Lang;
  t: UseT;
  onChange: (block: ReportBlock) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  const typeLabel: Record<ReportBlock["type"], string> = {
    keyvalue: t("block_keyvalue"),
    table: t("block_table"),
    list: t("block_list"),
    paragraph: t("block_paragraph"),
  };

  return (
    <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {typeLabel[block.type]}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button" variant="ghost" size="icon"
            className="h-7 w-7 text-gray-400 hover:text-gray-700"
            disabled={index === 0} onClick={() => onMove(-1)}
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button" variant="ghost" size="icon"
            className="h-7 w-7 text-gray-400 hover:text-gray-700"
            disabled={index === total - 1} onClick={() => onMove(1)}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button" variant="ghost" size="icon"
            className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
            onClick={onRemove}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      {block.type === "keyvalue" && <KeyValueEditor block={block} onChange={onChange} lang={lang} t={t} />}
      {block.type === "table" && <TableEditor block={block} onChange={onChange} lang={lang} t={t} />}
      {block.type === "list" && <ListEditor block={block} onChange={onChange} lang={lang} t={t} />}
      {block.type === "paragraph" && <ParagraphEditor block={block} onChange={onChange} lang={lang} t={t} />}
    </div>
  );
}

// ─── Row-item shared shell (matches operations/page.tsx's ArrayEditor style) ──

function RowItem({ index, onRemove, t, children }: {
  index: number; onRemove: () => void; t: UseT; children: React.ReactNode;
}) {
  return (
    <div className="group relative bg-white border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-400">{index + 1}</span>
        <button
          type="button"
          onClick={onRemove}
          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded hover:bg-red-50"
        >
          <X className="w-3 h-3" />
          {t("remove_item")}
        </button>
      </div>
      {children}
    </div>
  );
}

// ─── Key-Value block editor ────────────────────────────────────

function KeyValueEditor({
  block, onChange, lang, t,
}: { block: Extract<ReportBlock, { type: "keyvalue" }>; onChange: (b: ReportBlock) => void; lang: Lang; t: UseT }) {
  const setRow = (i: number, patch: Partial<{ label_km: string; label_en: string; value: string }>) => {
    const rows = [...block.rows];
    rows[i] = { ...rows[i], ...patch };
    onChange({ ...block, rows });
  };
  const addRow = () => onChange({ ...block, rows: [...block.rows, { label_km: "", label_en: "", value: "" }] });
  const removeRow = (i: number) => onChange({ ...block, rows: block.rows.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-2">
      {block.rows.map((row, i) => (
        <RowItem key={i} index={i} onRemove={() => removeRow(i)} t={t}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <BilingualInput
              lang={lang}
              valueKm={row.label_km} valueEn={row.label_en}
              onChangeKm={(v) => setRow(i, { label_km: v })}
              onChangeEn={(v) => setRow(i, { label_en: v })}
              className="h-9"
            />
            <Input value={row.value} onChange={(e) => setRow(i, { value: e.target.value })} placeholder={t("value")} className="h-9" />
          </div>
        </RowItem>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addRow} className="border-dashed gap-1.5 text-xs h-8 w-full sm:w-auto">
        <Plus className="w-3.5 h-3.5" /> {t("add_row")}
      </Button>
    </div>
  );
}

// ─── Table block editor ────────────────────────────────────────

function TableEditor({
  block, onChange, lang, t,
}: { block: Extract<ReportBlock, { type: "table" }>; onChange: (b: ReportBlock) => void; lang: Lang; t: UseT }) {
  const setColumn = (i: number, patch: Partial<{ km: string; en: string }>) => {
    const columns = [...block.columns];
    columns[i] = { ...columns[i], ...patch };
    onChange({ ...block, columns });
  };
  const addColumn = () => {
    onChange({
      ...block,
      columns: [...block.columns, { km: "", en: "" }],
      rows: block.rows.map((r) => [...r, ""]),
    });
  };
  const removeColumn = (i: number) => {
    onChange({
      ...block,
      columns: block.columns.filter((_, idx) => idx !== i),
      rows: block.rows.map((r) => r.filter((_, idx) => idx !== i)),
    });
  };
  const setCell = (r: number, c: number, value: string) => {
    const rows = block.rows.map((row) => [...row]);
    rows[r][c] = value;
    onChange({ ...block, rows });
  };
  const addRow = () => onChange({ ...block, rows: [...block.rows, block.columns.map(() => "")] });
  const removeRow = (i: number) => onChange({ ...block, rows: block.rows.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-3">
      {/* Columns — one row across the table width, one input per column */}
      <div className="flex items-start gap-2">
        <div className="grid gap-2 flex-1" style={{ gridTemplateColumns: `repeat(${block.columns.length}, minmax(0, 1fr))` }}>
          {block.columns.map((col, i) => (
            <div key={i} className="flex items-center gap-1">
              <BilingualInput
                lang={lang}
                valueKm={col.km} valueEn={col.en}
                onChangeKm={(v) => setColumn(i, { km: v })}
                onChangeEn={(v) => setColumn(i, { en: v })}
                className="h-9"
              />
              <Button
                type="button" variant="ghost" size="icon"
                className="h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                onClick={() => removeColumn(i)} disabled={block.columns.length <= 1}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-1.5">
        {block.rows.map((row, r) => (
          <div key={r} className="flex items-center gap-2">
            <div className="grid gap-2 flex-1" style={{ gridTemplateColumns: `repeat(${block.columns.length}, minmax(0, 1fr))` }}>
              {row.map((cell, c) => (
                <Input key={c} value={cell} onChange={(e) => setCell(r, c, e.target.value)} className="h-9" />
              ))}
            </div>
            <Button
              type="button" variant="ghost" size="icon"
              className="h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
              onClick={() => removeRow(r)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={addRow} className="border-dashed gap-1.5 text-xs h-8">
          <Plus className="w-3.5 h-3.5" /> {t("add_row")}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={addColumn} className="border-dashed gap-1.5 text-xs h-8">
          <Plus className="w-3.5 h-3.5" /> {t("add_column")}
        </Button>
      </div>

      <div>
        <span className="text-xs font-medium text-gray-500 block mb-1.5">{t("notes")}</span>
        <BilingualTextarea
          lang={lang}
          valueKm={block.note_km ?? ""} valueEn={block.note_en ?? ""}
          onChangeKm={(v) => onChange({ ...block, note_km: v })}
          onChangeEn={(v) => onChange({ ...block, note_en: v })}
          rows={2}
          className="text-sm"
        />
      </div>
    </div>
  );
}

// ─── List block editor ─────────────────────────────────────────

function ListEditor({
  block, onChange, lang, t,
}: { block: Extract<ReportBlock, { type: "list" }>; onChange: (b: ReportBlock) => void; lang: Lang; t: UseT }) {
  const setItem = (i: number, patch: Partial<{ km: string; en: string }>) => {
    const items = [...block.items];
    items[i] = { ...items[i], ...patch };
    onChange({ ...block, items });
  };
  const addItem = () => onChange({ ...block, items: [...block.items, { km: "", en: "" }] });
  const removeItem = (i: number) => onChange({ ...block, items: block.items.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-2">
      {block.items.map((item, i) => (
        <RowItem key={i} index={i} onRemove={() => removeItem(i)} t={t}>
          <BilingualTextarea
            lang={lang}
            valueKm={item.km} valueEn={item.en}
            onChangeKm={(v) => setItem(i, { km: v })}
            onChangeEn={(v) => setItem(i, { en: v })}
            rows={2}
            className="text-sm"
          />
        </RowItem>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addItem} className="border-dashed gap-1.5 text-xs h-8 w-full sm:w-auto">
        <Plus className="w-3.5 h-3.5" /> {t("add_item")}
      </Button>
    </div>
  );
}

// ─── Paragraph block editor ────────────────────────────────────

function ParagraphEditor({
  block, onChange, lang, t,
}: { block: Extract<ReportBlock, { type: "paragraph" }>; onChange: (b: ReportBlock) => void; lang: Lang; t: UseT }) {
  const setParagraph = (i: number, patch: Partial<{ km: string; en: string }>) => {
    const paragraphs = [...block.paragraphs];
    paragraphs[i] = { ...paragraphs[i], ...patch };
    onChange({ ...block, paragraphs });
  };
  const addParagraph = () => onChange({ ...block, paragraphs: [...block.paragraphs, { km: "", en: "" }] });
  const removeParagraph = (i: number) => onChange({ ...block, paragraphs: block.paragraphs.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-2">
      {block.paragraphs.map((p, i) => (
        <RowItem key={i} index={i} onRemove={() => removeParagraph(i)} t={t}>
          <BilingualTextarea
            lang={lang}
            valueKm={p.km} valueEn={p.en}
            onChangeKm={(v) => setParagraph(i, { km: v })}
            onChangeEn={(v) => setParagraph(i, { en: v })}
            rows={3}
            className="text-sm"
          />
        </RowItem>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addParagraph} className="border-dashed gap-1.5 text-xs h-8 w-full sm:w-auto">
        <Plus className="w-3.5 h-3.5" /> {t("add_paragraph")}
      </Button>
    </div>
  );
}
