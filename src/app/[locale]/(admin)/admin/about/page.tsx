"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import {
  Save,
  Loader2,
  FileText,
  Users,
  GitMerge,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { upsertSchoolInfo, updateLeadership } from "@/actions/settings";
import { upsertMilestone, deleteMilestone } from "@/actions/milestones";
import ImageUploader from "@/components/admin/ImageUploader";
import type { SchoolInfo, Leadership, Milestone } from "@/types";
import dynamic from "next/dynamic";

// Dynamically import react-quill-new to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

// ─── Rich Text Editor Toolbar ──────────────────────────────────

const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "link"],
    [{ table: "cell" }],
  ],
};

// Undo / Redo via the built-in History module (Ctrl+Z / Cmd+Z)

const QUILL_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "blockquote",
  "link",
  "table",
];

// ─── Content Section Card ──────────────────────────────────────

function ContentCard({
  section,
  label,
  info,
  saving,
  onContentChange,
  onSave,
}: {
  section: string;
  label: string;
  info: { km: string; en: string };
  saving: boolean;
  onContentChange: (lang: "km" | "en", value: string) => void;
  onSave: () => void;
}) {
  const locale = useLocale();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">{label}</h2>
        <Button
          size="sm"
          onClick={onSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <Save className="w-3.5 h-3.5 mr-1.5" />
          Save
        </Button>
      </div>

      {/* Editor columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-gray-100">
        {/* Khmer Editor */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              ខ្មែរ
            </span>
            {locale === "km" && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                Active
              </Badge>
            )}
          </div>
          <div className="quill-wrapper font-khmer">
            <ReactQuill
              theme="snow"
              value={info.km}
              onChange={(v: string) => onContentChange("km", v)}
              modules={QUILL_MODULES}
              formats={QUILL_FORMATS}
              placeholder={locale === "km" ? "សរសេរមាតិកាជាភាសាខ្មែរ..." : "Type Khmer content here..."}
            />
          </div>
        </div>

        {/* English Editor */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              English
            </span>
            {locale === "en" && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                Active
              </Badge>
            )}
          </div>
          <div className="quill-wrapper">
            <ReactQuill
              theme="snow"
              value={info.en}
              onChange={(v: string) => onContentChange("en", v)}
              modules={QUILL_MODULES}
              formats={QUILL_FORMATS}
              placeholder="Type English content here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────

export default function AdminAboutPage() {
  const locale = useLocale();
  const km = locale === "km";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  // Content tab state
  const [schoolInfo, setSchoolInfo] = useState<
    Record<string, { km: string; en: string }>
  >({});

  // Leadership tab state
  const [leadership, setLeadership] = useState<Leadership[]>([]);

  // Milestones tab state
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(
    null
  );
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    year: "",
    title_km: "",
    title_en: "",
    description_km: "",
    description_en: "",
    image_url: "",
    caption_km: "",
    caption_en: "",
    color: "#1e3a8a",
    sort_order: 0,
    is_active: true,
  });

  // ─── Fetch Data ──────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: info }, { data: leaders }, { data: milestonesData }] =
      await Promise.all([
        supabase.from("school_info").select("*"),
        supabase.from("leadership").select("*").order("sort_order"),
        supabase.from("milestones").select("*").order("sort_order"),
      ]);

    const infoMap: Record<string, { km: string; en: string }> = {};
    (info ?? []).forEach(
      (i: { section: string; content_km: string; content_en: string }) => {
        infoMap[i.section] = { km: i.content_km, en: i.content_en };
      }
    );
    setSchoolInfo(infoMap);
    setLeadership((leaders ?? []) as Leadership[]);
    setMilestones((milestonesData ?? []) as Milestone[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Content Tab Handlers ────────────────────────────────────

  const handleContentChange = (
    section: string,
    lang: "km" | "en",
    value: string
  ) => {
    setSchoolInfo((prev) => ({
      ...prev,
      [section]: { ...prev[section], [lang]: value },
    }));
  };

  const handleSaveContent = async (section: string) => {
    setSaving(true);
    const info = schoolInfo[section] ?? { km: "", en: "" };
    const result = await upsertSchoolInfo(section, info.km, info.en);
    setSaving(false);
    if (result.success) {
      toast.success(
        km
          ? `បានរក្សាទុក ${section === "history" ? "ប្រវត្តិ" : section === "vision" ? "ចក្ខុវិស័យ" : section === "mission" ? "បេសកកម្ម" : "គុណតម្លៃ"}`
          : `${section.charAt(0).toUpperCase() + section.slice(1)} saved`
      );
    } else {
      toast.error(result.error ?? "Failed to save");
    }
  };

  // ─── Leadership Tab Handlers ─────────────────────────────────

  const handleLeadershipChange = (
    id: string,
    field: string,
    value: string | boolean
  ) => {
    setLeadership((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const handleSaveLeadership = async (leader: Leadership) => {
    setSaving(true);
    const result = await updateLeadership(leader.id, {
      name_km: leader.name_km,
      name_en: leader.name_en,
      position_km: leader.position_km ?? "",
      position_en: leader.position_en ?? "",
      bio_km: leader.bio_km,
      bio_en: leader.bio_en,
      photo_url: leader.photo_url,
      sort_order: leader.sort_order,
      is_active: leader.is_active,
    });
    setSaving(false);
    if (result.success) toast.success("Leader saved");
    else toast.error(result.error ?? "Failed to save");
  };

  // ─── Milestones Tab Handlers ─────────────────────────────────

  const handleEditMilestone = (milestone: Milestone) => {
    setMilestoneForm({
      year: milestone.year,
      title_km: milestone.title_km,
      title_en: milestone.title_en,
      description_km: milestone.description_km ?? "",
      description_en: milestone.description_en ?? "",
      image_url: milestone.image_url ?? "",
      caption_km: milestone.caption_km ?? "",
      caption_en: milestone.caption_en ?? "",
      color: milestone.color ?? "#1e3a8a",
      sort_order: milestone.sort_order,
      is_active: milestone.is_active,
    });
    setEditingMilestone(milestone);
    setShowMilestoneForm(true);
  };

  const handleAddMilestone = () => {
    setMilestoneForm({
      year: "",
      title_km: "",
      title_en: "",
      description_km: "",
      description_en: "",
      image_url: "",
      caption_km: "",
      caption_en: "",
      color: "#1e3a8a",
      sort_order: milestones.length + 1,
      is_active: true,
    });
    setEditingMilestone(null);
    setShowMilestoneForm(true);
  };

  const handleSaveMilestone = async () => {
    setSaving(true);
    const result = await upsertMilestone(
      editingMilestone?.id ?? null,
      milestoneForm
    );
    setSaving(false);
    if (result.success) {
      toast.success(
        editingMilestone
          ? "Milestone updated"
          : km
          ? "បានបន្ថែមដំណាក់កាលសំខាន់"
          : "Milestone added"
      );
      setShowMilestoneForm(false);
      setEditingMilestone(null);
      fetchData();
    } else {
      toast.error(result.error ?? "Failed to save milestone");
    }
  };

  const handleDeleteMilestone = async (id: string, title: string) => {
    if (!confirm(`Delete milestone "${title}"?`)) return;
    const result = await deleteMilestone(id);
    if (result.success) {
      toast.success("Milestone deleted");
      fetchData();
    } else {
      toast.error(result.error ?? "Failed to delete");
    }
  };

  const handleCancelMilestoneForm = () => {
    setShowMilestoneForm(false);
    setEditingMilestone(null);
  };

  // ─── Loading state ───────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-school-blue-800" />
      </div>
    );
  }

  // ─── Section labels ──────────────────────────────────────────

  const SECTION_LABELS: Record<string, string> = {
    history: km ? "ប្រវត្តិសាលា" : "History",
    vision: km ? "ចក្ខុវិស័យ" : "Vision",
    mission: km ? "បេសកកម្ម" : "Mission",
    values: km ? "គុណតម្លៃស្នូល" : "Core Values",
  };

  const sections = ["history", "vision", "mission", "values"];

  return (
    <div className="max-w-6xl space-y-6">
      {/* ─── Page Header ─── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {km ? "គ្រប់គ្រងទំព័រអំពីសាលា" : "About Page Management"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {km
            ? "គ្រប់គ្រងមាតិកា ភាពជាអ្នកដឹកនាំ និងព្រឹត្តិការណ៍សំខាន់ៗ ដែលបង្ហាញនៅលើទំព័រអំពីសាលា"
            : "Manage the content, leadership, and milestones shown on the public About page"}
        </p>
      </div>

      {/* ─── Tabs ─── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="content" className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            {km ? "មាតិកា" : "Content"}
          </TabsTrigger>
          <TabsTrigger
            value="leadership"
            className="flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            {km ? "ភាពជាអ្នកដឹកនាំ" : "Leadership"}
          </TabsTrigger>
          <TabsTrigger
            value="milestones"
            className="flex items-center gap-1.5"
          >
            <GitMerge className="w-3.5 h-3.5" />
            {km ? "ព្រឹត្តិការណ៍សំខាន់ៗ" : "Milestones"}
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════
            CONTENT TAB
           ═══════════════════════════════════════════════════════ */}
        <TabsContent value="content" className="space-y-6 mt-6">
          {sections.map((section) => (
            <ContentCard
              key={section}
              section={section}
              label={SECTION_LABELS[section]}
              info={schoolInfo[section] ?? { km: "", en: "" }}
              saving={saving}
              onContentChange={(lang, value) =>
                handleContentChange(section, lang, value)
              }
              onSave={() => handleSaveContent(section)}
            />
          ))}
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════
            LEADERSHIP TAB
           ═══════════════════════════════════════════════════════ */}
        <TabsContent value="leadership" className="space-y-6 mt-6">
          {leadership.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                {km ? "រកមិនឃើញអ្នកដឹកនាំ" : "No leadership found"}
              </p>
            </div>
          ) : (
            leadership.map((leader) => (
              <div
                key={leader.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{
                        background: "rgba(30,58,138,0.1)",
                        color: "#1e3a8a",
                      }}
                    >
                      {(leader.name_en?.[0] ?? "?").toUpperCase()}
                    </div>
                    <div>
                      <h2
                        className={`font-semibold text-gray-900 ${
                          km ? "font-khmer" : ""
                        }`}
                      >
                        {leader.name_en || leader.name_km || "Unknown"}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {leader.position_en || leader.position_km || ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={leader.is_active}
                      onCheckedChange={(v) =>
                        handleLeadershipChange(leader.id, "is_active", v)
                      }
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSaveLeadership(leader)}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Save className="w-3.5 h-3.5 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(
                      [
                        "name_km",
                        "name_en",
                        "position_km",
                        "position_en",
                      ] as const
                    ).map((field) => (
                      <div key={field} className="space-y-1.5">
                        <Label className="capitalize text-xs text-gray-500">
                          {field.replace(/_/g, " ")}
                        </Label>
                        <Input
                          className={
                            field.includes("_km") && km ? "font-khmer" : ""
                          }
                          value={(leader[field] as string) ?? ""}
                          onChange={(e) =>
                            handleLeadershipChange(
                              leader.id,
                              field,
                              e.target.value
                            )
                          }
                        />
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <ImageUploader
                        value={leader.photo_url}
                        onChange={(url) =>
                          handleLeadershipChange(
                            leader.id,
                            "photo_url",
                            url ?? ""
                          )
                        }
                        folder={`leadership/${leader.id}`}
                        label="Photo"
                      />
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500">
                          Biography (Khmer)
                        </Label>
                        <textarea
                          className={`font-khmer w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px]`}
                          value={leader.bio_km ?? ""}
                          onChange={(e) =>
                            handleLeadershipChange(
                              leader.id,
                              "bio_km",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500">
                          Biography (English)
                        </Label>
                        <textarea
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px]"
                          value={leader.bio_en ?? ""}
                          onChange={(e) =>
                            handleLeadershipChange(
                              leader.id,
                              "bio_en",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════
            MILESTONES TAB
           ═══════════════════════════════════════════════════════ */}
        <TabsContent value="milestones" className="space-y-6 mt-6">
          {/* Add Milestone Button */}
          {!showMilestoneForm && (
            <Button
              onClick={handleAddMilestone}
              className="bg-school-blue-800 hover:bg-school-blue-900 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {km ? "បន្ថែមព្រឹត្តិការណ៍សំខាន់" : "Add Milestone"}
            </Button>
          )}

          {/* Milestone Form */}
          {showMilestoneForm && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingMilestone
                    ? km
                      ? "កែសម្រួលព្រឹត្តិការណ៍សំខាន់"
                      : "Edit Milestone"
                    : km
                    ? "បន្ថែមព្រឹត្តិការណ៍សំខាន់ថ្មី"
                    : "New Milestone"}
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelMilestoneForm}
                  >
                    {km ? "បោះបង់" : "Cancel"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveMilestone}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="w-3.5 h-3.5 mr-1" />
                    {km ? "រក្សាទុក" : "Save"}
                  </Button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Year</Label>
                    <Input
                      value={milestoneForm.year}
                      onChange={(e) =>
                        setMilestoneForm((f) => ({
                          ...f,
                          year: e.target.value,
                        }))
                      }
                      placeholder="e.g. 2000"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">
                      Color (hex)
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={milestoneForm.color}
                        onChange={(e) =>
                          setMilestoneForm((f) => ({
                            ...f,
                            color: e.target.value,
                          }))
                        }
                        className="w-9 h-9 rounded-lg border border-input cursor-pointer"
                      />
                      <Input
                        value={milestoneForm.color}
                        onChange={(e) =>
                          setMilestoneForm((f) => ({
                            ...f,
                            color: e.target.value,
                          }))
                        }
                        className="flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">
                      Sort Order
                    </Label>
                    <Input
                      type="number"
                      value={milestoneForm.sort_order}
                      onChange={(e) =>
                        setMilestoneForm((f) => ({
                          ...f,
                          sort_order: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5 flex items-end pb-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={milestoneForm.is_active}
                        onCheckedChange={(v) =>
                          setMilestoneForm((f) => ({
                            ...f,
                            is_active: v,
                          }))
                        }
                      />
                      <span className="text-sm text-gray-600">
                        {km ? "សកម្ម" : "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">
                      Title (Khmer)
                    </Label>
                    <Input
                      className={km ? "font-khmer" : ""}
                      value={milestoneForm.title_km}
                      onChange={(e) =>
                        setMilestoneForm((f) => ({
                          ...f,
                          title_km: e.target.value,
                        }))
                      }
                      placeholder="បង្កើតសាលា"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">
                      Title (English)
                    </Label>
                    <Input
                      value={milestoneForm.title_en}
                      onChange={(e) =>
                        setMilestoneForm((f) => ({
                          ...f,
                          title_en: e.target.value,
                        }))
                      }
                      placeholder="School Founded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">
                      Description (Khmer)
                    </Label>
                    <textarea
                      className={`font-khmer w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[100px]`}
                      value={milestoneForm.description_km}
                      onChange={(e) =>
                        setMilestoneForm((f) => ({
                          ...f,
                          description_km: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">
                      Description (English)
                    </Label>
                    <textarea
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[100px]"
                      value={milestoneForm.description_en}
                      onChange={(e) =>
                        setMilestoneForm((f) => ({
                          ...f,
                          description_en: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <ImageUploader
                      value={milestoneForm.image_url}
                      onChange={(url) =>
                        setMilestoneForm((f) => ({
                          ...f,
                          image_url: url ?? "",
                        }))
                      }
                      folder="milestones"
                      label="Image"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-500">
                        Caption (Khmer)
                      </Label>
                      <Input
                        className={km ? "font-khmer" : ""}
                        value={milestoneForm.caption_km}
                        onChange={(e) =>
                          setMilestoneForm((f) => ({
                            ...f,
                            caption_km: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-500">
                        Caption (English)
                      </Label>
                      <Input
                        value={milestoneForm.caption_en}
                        onChange={(e) =>
                          setMilestoneForm((f) => ({
                            ...f,
                            caption_en: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Milestones List */}
          {!showMilestoneForm && (
            <div className="space-y-4">
              {milestones.length === 0 ? (
                <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-200">
                  <GitMerge className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    {km
                      ? "រកមិនឃើញព្រឹត្តិការណ៍សំខាន់"
                      : "No milestones found"}
                  </p>
                </div>
              ) : (
                milestones.map((milestone, i) => (
                  <div
                    key={milestone.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4 px-6 py-4">
                      {/* Color Indicator */}
                      <div
                        className="w-1.5 h-12 rounded-full shrink-0"
                        style={{ background: milestone.color ?? "#1e3a8a" }}
                      />

                      {/* Year Badge */}
                      <div
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold text-white shrink-0"
                        style={{ background: milestone.color ?? "#1e3a8a" }}
                      >
                        {milestone.year}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-semibold text-gray-900 truncate ${
                            km ? "font-khmer" : ""
                          }`}
                        >
                          {km ? milestone.title_km : milestone.title_en}
                        </h3>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {km
                            ? milestone.description_km
                            : milestone.description_en}
                        </p>
                      </div>

                      {/* Status */}
                      <Badge
                        variant={
                          milestone.is_active ? "success" : "default"
                        }
                        className="text-xs"
                      >
                        {milestone.is_active
                          ? km
                            ? "សកម្ម"
                            : "Active"
                          : km
                          ? "អសកម្ម"
                          : "Inactive"}
                      </Badge>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditMilestone(milestone)}
                        >
                          <Pencil className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleDeleteMilestone(
                              milestone.id,
                              km
                                ? milestone.title_km
                                : milestone.title_en
                            )
                          }
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── Rich Text Editor Styles ─── */}
      <style jsx global>{`
        .quill-wrapper .ql-toolbar {
          border: 1px solid #e2e8f0;
          border-radius: 8px 8px 0 0;
          background: #f8fafc;
        }
        .quill-wrapper .ql-container {
          border: 1px solid #e2e8f0;
          border-top: none;
          border-radius: 0 0 8px 8px;
          min-height: 180px;
          font-size: 14px;
        }
        .quill-wrapper .ql-editor {
          min-height: 180px;
          padding: 12px 16px;
        }
        .quill-wrapper.font-khmer .ql-editor {
          font-family: "Noto Sans Khmer", "Khmer OS Battambang", "Khmer OS", sans-serif;
        }
        .quill-wrapper .ql-toolbar button:hover .ql-stroke {
          stroke: #1e3a8a;
        }
        .quill-wrapper .ql-toolbar button:hover .ql-fill {
          fill: #1e3a8a;
        }
        .quill-wrapper .ql-toolbar button.ql-active .ql-stroke {
          stroke: #1e3a8a;
        }
        .quill-wrapper .ql-toolbar button.ql-active .ql-fill {
          fill: #1e3a8a;
        }
      `}</style>
    </div>
  );
}
