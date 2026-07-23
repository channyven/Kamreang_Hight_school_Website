"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft, Save, Loader2, Plus, X, Info, BookOpen, Users, DollarSign,
  Target, Clock, ClipboardCheck, FileText, Award, Trophy,
  BarChart3, Building2, AlertTriangle, Rocket, Eye
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { getOperationsReport, upsertOperationsReport } from "@/actions/Report";
import type { OperationsReportContent } from "@/types";
import { cn } from "@/utils";

type ReportTab = "general" | "planning" | "students" | "resources" | "outlook";

const TABS: { id: ReportTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "general", label: "General", icon: Info },
  { id: "planning", label: "Planning & Assessment", icon: BookOpen },
  { id: "students", label: "Students & Staff", icon: Users },
  { id: "resources", label: "Resources", icon: DollarSign },
  { id: "outlook", label: "Outlook", icon: Target },
];



export default function EditOperationsReportPage() {
  const t = useTranslations("reportAdmin");
  const locale = useLocale() as "km" | "en";
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ReportTab>("general");
  const [academicYear, setAcademicYear] = useState("2024-2025");
  const [isPublished, setIsPublished] = useState(false);
  const [content, setContent] = useState<OperationsReportContent>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

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

  const update = (patch: Partial<OperationsReportContent>) => {
    setContent((c) => ({ ...c, ...patch }));
    setDirty(true);
  };

  const onSubmit = async () => {
    setSaving(true);
    const result = await upsertOperationsReport({
      academic_year: academicYear,
      is_published: isPublished,
      content: content as Record<string, unknown>,
    });
    if (result.success) {
      toast.success(locale === "km" ? "របាយការណ៍ត្រូវបានរក្សាទុក" : "Report saved");
      setDirty(false);
      router.push(`/${locale}/admin/reports`);
    } else {
      toast.error(result.error ?? (locale === "km" ? "រក្សាទុកមិនបាន" : "Failed to save"));
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <div className="text-center space-y-4">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-school-blue-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-school-blue-800 animate-spin" />
          </div>
          <p className="text-sm text-gray-500">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/${locale}/admin/reports`}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t("back")}
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("edit_operations")}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{academicYear}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <Badge variant="warning" className="text-xs animate-pulse">
              Unsaved
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/${locale}/report`, "_blank")}
          >
            <Eye className="w-4 h-4 mr-1.5" />
            {locale === "km" ? "មើល" : "Preview"}
          </Button>
        </div>
      </div>

      {/* Meta bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-center">
          <div className="flex items-center gap-4">
            <div className="space-y-1 flex-1">
              <Label htmlFor="academic-year" className="text-xs text-gray-500">{t("academic_year")}</Label>
              <Input
                id="academic-year"
                value={academicYear}
                onChange={(e) => { setAcademicYear(e.target.value); setDirty(true); }}
                placeholder="2024-2025"
                className="max-w-[200px] h-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="published-toggle" className="text-sm text-gray-700 cursor-pointer">
              {t("is_published")}
            </Label>
            <Switch
              id="published-toggle"
              checked={isPublished}
              onCheckedChange={(v) => { setIsPublished(v); setDirty(true); }}
            />
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
        {/* Desktop sidebar nav */}
        <aside className="hidden lg:block sticky top-24">
          <nav className="bg-white rounded-xl border border-gray-200 shadow-sm p-2 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 pt-2 pb-1">
              Sections
            </p>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left",
                    isActive
                      ? "bg-school-blue-800 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-school-blue-800"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile tab bar */}
        <div className="lg:hidden overflow-x-auto -mx-1 px-1">
          <div className="flex gap-1 bg-white rounded-xl border border-gray-200 shadow-sm p-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap",
                    isActive
                      ? "bg-school-blue-800 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content area */}
        <motion.main
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-6"
        >
          {activeTab === 'general' && (
            <>
              <Section title={t("general")} icon={Info}>
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
                  <div className="sm:col-span-2 space-y-4">
                    <Field label={`${t("summary")} (KM)`}>
                      <TextArea value={content.general?.summary_km ?? ""} onChange={(v) => update({ general: { ...content.general, summary_km: v } })} />
                    </Field>
                    <Field label={`${t("summary")} (EN)`}>
                      <TextArea value={content.general?.summary_en ?? ""} onChange={(v) => update({ general: { ...content.general, summary_en: v } })} />
                    </Field>
                  </div>
                </div>
              </Section>

              <Section title={t("teaching_hours")} icon={Clock}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={t("weekly_hours")}>
                    <Num value={content.teaching_hours?.weekly_hours} onChange={(v) => update({ teaching_hours: { ...content.teaching_hours, weekly_hours: v } })} />
                  </Field>
                  <div className="sm:col-span-2 space-y-4">
                    <Field label={`${t("teaching_notes")} (KM)`}>
                      <TextArea value={content.teaching_hours?.notes_km ?? ""} onChange={(v) => update({ teaching_hours: { ...content.teaching_hours, notes_km: v } })} />
                    </Field>
                    <Field label={`${t("teaching_notes")} (EN)`}>
                      <TextArea value={content.teaching_hours?.notes_en ?? ""} onChange={(v) => update({ teaching_hours: { ...content.teaching_hours, notes_en: v } })} />
                    </Field>
                  </div>
                </div>
              </Section>

              <Section title="Regular Testing" icon={ClipboardCheck}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Monthly Tests (KM)">
                    <Text value={content.regular_testing?.monthly_tests_km ?? ""} onChange={(v) => update({ regular_testing: { ...content.regular_testing, monthly_tests_km: v } })} />
                  </Field>
                  <Field label="Monthly Tests (EN)">
                    <Text value={content.regular_testing?.monthly_tests_en ?? ""} onChange={(v) => update({ regular_testing: { ...content.regular_testing, monthly_tests_en: v } })} />
                  </Field>
                  <Field label="Semester Tests (KM)">
                    <Text value={content.regular_testing?.semester_tests_km ?? ""} onChange={(v) => update({ regular_testing: { ...content.regular_testing, semester_tests_km: v } })} />
                  </Field>
                  <Field label="Semester Tests (EN)">
                    <Text value={content.regular_testing?.semester_tests_en ?? ""} onChange={(v) => update({ regular_testing: { ...content.regular_testing, semester_tests_en: v } })} />
                  </Field>
                  <div className="sm:col-span-2 space-y-4">
                    <Field label="Notes (KM)">
                      <TextArea value={content.regular_testing?.notes_km ?? ""} onChange={(v) => update({ regular_testing: { ...content.regular_testing, notes_km: v } })} />
                    </Field>
                    <Field label="Notes (EN)">
                      <TextArea value={content.regular_testing?.notes_en ?? ""} onChange={(v) => update({ regular_testing: { ...content.regular_testing, notes_en: v } })} />
                    </Field>
                  </div>
                </div>
              </Section>
            </>
          )}

          {activeTab === 'planning' && (
            <>
              <Section title="School, Teacher & Student Planning" icon={BookOpen}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="School Improvement Plan (KM)">
                    <TextArea value={content.planning?.school_improvement_plan_km ?? ""} onChange={(v) => update({ planning: { ...content.planning, school_improvement_plan_km: v } })} />
                  </Field>
                  <Field label="School Improvement Plan (EN)">
                    <TextArea value={content.planning?.school_improvement_plan_en ?? ""} onChange={(v) => update({ planning: { ...content.planning, school_improvement_plan_en: v } })} />
                  </Field>
                  <Field label="Teacher Development Plan (KM)">
                    <TextArea value={content.planning?.teacher_development_plan_km ?? ""} onChange={(v) => update({ planning: { ...content.planning, teacher_development_plan_km: v } })} />
                  </Field>
                  <Field label="Teacher Development Plan (EN)">
                    <TextArea value={content.planning?.teacher_development_plan_en ?? ""} onChange={(v) => update({ planning: { ...content.planning, teacher_development_plan_en: v } })} />
                  </Field>
                  <Field label="Student Support Plan (KM)">
                    <TextArea value={content.planning?.student_support_plan_km ?? ""} onChange={(v) => update({ planning: { ...content.planning, student_support_plan_km: v } })} />
                  </Field>
                  <Field label="Student Support Plan (EN)">
                    <TextArea value={content.planning?.student_support_plan_en ?? ""} onChange={(v) => update({ planning: { ...content.planning, student_support_plan_en: v } })} />
                  </Field>
                </div>
              </Section>

              <Section title="Annual Work Agreements" icon={FileText}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Teacher Contracts (KM)">
                    <TextArea value={content.agreements?.teacher_contracts_km ?? ""} onChange={(v) => update({ agreements: { ...content.agreements, teacher_contracts_km: v } })} />
                  </Field>
                  <Field label="Teacher Contracts (EN)">
                    <TextArea value={content.agreements?.teacher_contracts_en ?? ""} onChange={(v) => update({ agreements: { ...content.agreements, teacher_contracts_en: v } })} />
                  </Field>
                  <Field label="Community Partnerships (KM)">
                    <TextArea value={content.agreements?.community_partnerships_km ?? ""} onChange={(v) => update({ agreements: { ...content.agreements, community_partnerships_km: v } })} />
                  </Field>
                  <Field label="Community Partnerships (EN)">
                    <TextArea value={content.agreements?.community_partnerships_en ?? ""} onChange={(v) => update({ agreements: { ...content.agreements, community_partnerships_en: v } })} />
                  </Field>
                </div>
              </Section>

              <Section title="Self-Assessment — Model School Standards" icon={Award}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Model School Standard (KM)">
                    <Text value={content.self_assessment?.model_school_standard_km ?? ""} onChange={(v) => update({ self_assessment: { ...content.self_assessment, model_school_standard_km: v } })} />
                  </Field>
                  <Field label="Model School Standard (EN)">
                    <Text value={content.self_assessment?.model_school_standard_en ?? ""} onChange={(v) => update({ self_assessment: { ...content.self_assessment, model_school_standard_en: v } })} />
                  </Field>
                  <Field label="Last Assessment Date (KM)">
                    <Text value={content.self_assessment?.last_assessment_date_km ?? ""} onChange={(v) => update({ self_assessment: { ...content.self_assessment, last_assessment_date_km: v } })} />
                  </Field>
                  <Field label="Last Assessment Date (EN)">
                    <Text value={content.self_assessment?.last_assessment_date_en ?? ""} onChange={(v) => update({ self_assessment: { ...content.self_assessment, last_assessment_date_en: v } })} />
                  </Field>
                  <Field label="Score">
                    <Num value={content.self_assessment?.score} onChange={(v) => update({ self_assessment: { ...content.self_assessment, score: v } })} />
                  </Field>
                  <Field label="Max Score">
                    <Num value={content.self_assessment?.max_score} onChange={(v) => update({ self_assessment: { ...content.self_assessment, max_score: v } })} />
                  </Field>
                </div>
              </Section>

              <Section title="Awards & Recognitions" icon={Trophy}>
                <ArrayEditor
                  items={content.awards?.awards ?? []}
                  onItems={(items) => update({ awards: { ...content.awards, awards: items } })}
                  newItem={{ title_km: "", title_en: "", year: new Date().getFullYear() }}
                  render={(item, setItem) => (
                    <>
                      <Field label="Title (KM)"><Text value={item.title_km} onChange={(v) => setItem({ ...item, title_km: v })} /></Field>
                      <Field label="Title (EN)"><Text value={item.title_en} onChange={(v) => setItem({ ...item, title_en: v })} /></Field>
                      <Field label="Year"><Num value={item.year} onChange={(v) => setItem({ ...item, year: v })} /></Field>
                    </>
                  )}
                />
              </Section>
            </>
          )}

          {activeTab === 'students' && (
            <>
              <Section title={t("student_stats")} icon={BarChart3}>
                <ArrayEditor
                  items={content.student_stats?.items ?? []}
                  onItems={(items) => update({ student_stats: { ...content.student_stats, items } })}
                  newItem={{ label_km: "", label_en: "", value: 0, suffix: "" }}
                  render={(item, setItem) => (
                    <>
                      <Field label={t("label_km")}><Text value={item.label_km} onChange={(v) => setItem({ ...item, label_km: v })} /></Field>
                      <Field label={t("label_en")}><Text value={item.label_en} onChange={(v) => setItem({ ...item, label_en: v })} /></Field>
                      <Field label={t("value")}><Num value={item.value} onChange={(v) => setItem({ ...item, value: v })} /></Field>
                      <Field label="Suffix"><Text value={item.suffix ?? ""} onChange={(v) => setItem({ ...item, suffix: v })} /></Field>
                    </>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <Field label={`${t("label_km")} note`}>
                    <TextArea value={content.student_stats?.notes_km ?? ""} onChange={(v) => update({ student_stats: { ...content.student_stats, notes_km: v } })} />
                  </Field>
                  <Field label={`${t("label_en")} note`}>
                    <TextArea value={content.student_stats?.notes_en ?? ""} onChange={(v) => update({ student_stats: { ...content.student_stats, notes_en: v } })} />
                  </Field>
                </div>
              </Section>

              <Section title="Feeder Schools" icon={Building2}>
                <ArrayEditor
                  items={content.feeder_schools?.schools ?? []}
                  onItems={(items) => update({ feeder_schools: { ...content.feeder_schools, schools: items } })}
                  newItem={{ name_km: "", name_en: "", student_count: 0 }}
                  render={(item, setItem) => (
                    <>
                      <Field label="School Name (KM)"><Text value={item.name_km} onChange={(v) => setItem({ ...item, name_km: v })} /></Field>
                      <Field label="School Name (EN)"><Text value={item.name_en} onChange={(v) => setItem({ ...item, name_en: v })} /></Field>
                      <Field label="Student Count"><Num value={item.student_count} onChange={(v) => setItem({ ...item, student_count: v })} /></Field>
                    </>
                  )}
                />
              </Section>

              <Section title="Academic Results" icon={BarChart3}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Grade 9 Pass Rate">
                    <Num value={content.academic_results?.grade9_pass_rate} onChange={(v) => update({ academic_results: { ...content.academic_results, grade9_pass_rate: v } })} />
                  </Field>
                  <Field label="Grade 12 Pass Rate">
                    <Num value={content.academic_results?.grade12_pass_rate} onChange={(v) => update({ academic_results: { ...content.academic_results, grade12_pass_rate: v } })} />
                  </Field>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Students</h4>
                  <ArrayEditor
                    items={content.academic_results?.top_students ?? []}
                    onItems={(items) => update({ academic_results: { ...content.academic_results, top_students: items } })}
                    newItem={{ name: "", score: 0 }}
                    render={(item, setItem) => (
                      <>
                        <Field label="Student Name"><Text value={item.name} onChange={(v) => setItem({ ...item, name: v })} /></Field>
                        <Field label="Score"><Num value={item.score} onChange={(v) => setItem({ ...item, score: v })} /></Field>
                      </>
                    )}
                  />
                </div>
              </Section>

              <Section title={t("staff_status")} icon={Users}>
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
            </>
          )}

          {activeTab === 'resources' && (
            <>
              <Section title="Textbook Status" icon={BookOpen}>
                <ArrayEditor
                  items={content.facilities?.textbook_status ?? []}
                  onItems={(items) => update({ facilities: { ...content.facilities, textbook_status: items } })}
                  newItem={{ subject_km: "", subject_en: "", student_ratio: 0 }}
                  render={(item, setItem) => (
                    <>
                      <Field label="Subject (KM)"><Text value={item.subject_km} onChange={(v) => setItem({ ...item, subject_km: v })} /></Field>
                      <Field label="Subject (EN)"><Text value={item.subject_en} onChange={(v) => setItem({ ...item, subject_en: v })} /></Field>
                      <Field label="Student Ratio"><Num value={item.student_ratio} onChange={(v) => setItem({ ...item, student_ratio: v })} /></Field>
                    </>
                  )}
                />
              </Section>

              <Section title={t("facilities")} icon={Building2}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Notes (KM)">
                    <TextArea value={content.facilities?.notes_km ?? ""} onChange={(v) => update({ facilities: { ...content.facilities, notes_km: v } })} />
                  </Field>
                  <Field label="Notes (EN)">
                    <TextArea value={content.facilities?.notes_en ?? ""} onChange={(v) => update({ facilities: { ...content.facilities, notes_en: v } })} />
                  </Field>
                </div>
              </Section>

              <Section title={t("budget")} icon={DollarSign}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={t("currency")}>
                    <Text value={content.budget?.currency ?? "USD"} onChange={(v) => update({ budget: { ...content.budget, currency: v } })} />
                  </Field>
                  <Field label="Total Budget">
                    <Num value={content.budget?.total_budget} onChange={(v) => update({ budget: { ...content.budget, total_budget: v } })} />
                  </Field>
                  <Field label="Community Support">
                    <Num value={content.budget?.community_support} onChange={(v) => update({ budget: { ...content.budget, community_support: v } })} />
                  </Field>
                  <Field label="Remaining Balance">
                    <Num value={content.budget?.remaining_balance} onChange={(v) => update({ budget: { ...content.budget, remaining_balance: v } })} />
                  </Field>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Expenditure Breakdown</h4>
                  <ArrayEditor
                    items={content.budget?.expenditure ?? []}
                    onItems={(items) => update({ budget: { ...content.budget, expenditure: items } })}
                    newItem={{ label_km: "", label_en: "", amount: 0 }}
                    render={(item, setItem) => (
                      <>
                        <Field label={t("label_km")}><Text value={item.label_km} onChange={(v) => setItem({ ...item, label_km: v })} /></Field>
                        <Field label={t("label_en")}><Text value={item.label_en} onChange={(v) => setItem({ ...item, label_en: v })} /></Field>
                        <Field label={t("amount")}><Num value={item.amount} onChange={(v) => setItem({ ...item, amount: v })} /></Field>
                      </>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <Field label="Notes (KM)">
                    <TextArea value={content.budget?.notes_km ?? ""} onChange={(v) => update({ budget: { ...content.budget, notes_km: v } })} />
                  </Field>
                  <Field label="Notes (EN)">
                    <TextArea value={content.budget?.notes_en ?? ""} onChange={(v) => update({ budget: { ...content.budget, notes_en: v } })} />
                  </Field>
                </div>
              </Section>
            </>
          )}

          {activeTab === 'outlook' && (
            <>
              <Section title={t("challenges")} icon={AlertTriangle}>
                <ArrayEditor
                  items={content.challenges ?? []}
                  onItems={(items) => update({ challenges: items })}
                  newItem={{ title_km: "", title_en: "", detail_km: "", detail_en: "" }}
                  render={(item, setItem) => (
                    <>
                      <Field label={`Title (KM)`}><Text value={item.title_km} onChange={(v) => setItem({ ...item, title_km: v })} /></Field>
                      <Field label={`Title (EN)`}><Text value={item.title_en} onChange={(v) => setItem({ ...item, title_en: v })} /></Field>
                      <Field label={t("detail_km")}><TextArea value={item.detail_km} onChange={(v) => setItem({ ...item, detail_km: v })} /></Field>
                      <Field label={t("detail_en")}><TextArea value={item.detail_en} onChange={(v) => setItem({ ...item, detail_en: v })} /></Field>
                    </>
                  )}
                />
              </Section>

              <Section title={t("future_direction")} icon={Rocket}>
                <ArrayEditor
                  items={content.future_direction ?? []}
                  onItems={(items) => update({ future_direction: items })}
                  newItem={{ km: "", en: "" }}
                  render={(item, setItem) => (
                    <>
                      <Field label="Detail (KM)"><TextArea value={item.km} onChange={(v) => setItem({ ...item, km: v })} /></Field>
                      <Field label="Detail (EN)"><TextArea value={item.en} onChange={(v) => setItem({ ...item, en: v })} /></Field>
                    </>
                  )}
                />
              </Section>
            </>
          )}
        </motion.main>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-60 bg-white/90 backdrop-blur-md border-t border-gray-200 p-3 sm:p-4 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-xs text-gray-400 hidden sm:block">
            {dirty ? (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Unsaved changes
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                All saved
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <Button
              variant="outline"
              onClick={() => router.push(`/${locale}/admin/reports`)}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              className="bg-school-blue-800 hover:bg-school-blue-900 min-w-[140px] h-11"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t("save")}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-gray-500 block">{label}</span>
      {children}
    </label>
  );
}

function Text({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-9" />;
}

function TextArea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="min-h-[80px]" />;
}

function Num({ value, onChange }: { value: number | undefined; onChange: (v: number) => void }) {
  return (
    <Input
      type="number"
      value={value ?? 0}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-9"
    />
  );
}

function Section({
  title, icon: Icon, children,
}: {
  title: string; icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 sm:p-5 space-y-4 hover:border-gray-200 transition-colors">
      {Icon && (
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-school-blue-50 to-school-blue-100 flex items-center justify-center">
            <Icon className="w-4 h-4 text-school-blue-700" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      {!Icon && <h3 className="text-base font-semibold text-gray-900 mb-3">{title}</h3>}
      {children}
    </div>
  );
}

function ArrayEditor<T extends Record<string, unknown>>({
  items, onItems, newItem, render,
}: {
  items: T[]; onItems: (items: T[]) => void; newItem: T;
  render: (item: T, setItem: (i: T) => void, index: number) => React.ReactNode;
}) {
  const t = useTranslations("reportAdmin");
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="group relative bg-gray-50/80 border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400">Item {i + 1}</span>
            <button
              type="button"
              onClick={() => onItems(items.filter((_, idx) => idx !== i))}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded hover:bg-red-50"
            >
              <X className="w-3 h-3" />
              {t("remove_item")}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {render(
              item,
              (ni) => {
                const copy = [...items];
                copy[i] = ni;
                onItems(copy);
              },
              i
            )}
          </div>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onItems([...items, { ...newItem }])}
        className="w-full sm:w-auto border-dashed gap-2"
      >
        <Plus className="w-4 h-4" />
        {t("add_item")}
      </Button>
    </div>
  );
}

