"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Save, Loader2, Settings, Users, FileText, Globe } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { upsertSetting, upsertSchoolInfo, updateLeadership } from "@/actions/settings";
import type { Leadership } from "@/types";
import { Switch } from "@/components/ui/switch";

type SettingsMap = Record<string, string>;

export default function AdminSettingsPage() {
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsMap>({});
  const [schoolInfo, setSchoolInfo] = useState<Record<string, { km: string; en: string }>>({});
  const [leadership, setLeadership] = useState<Leadership[]>([]);

  useEffect(() => {
    const init = async () => {
      const [{ data: sets }, { data: info }, { data: leaders }] = await Promise.all([
        supabase.from("settings").select("key, value"),
        supabase.from("school_info").select("*"),
        supabase.from("leadership").select("*").order("sort_order"),
      ]);

      const settingsMap: SettingsMap = {};
      (sets ?? []).forEach((s: { key: string; value: string }) => { settingsMap[s.key] = s.value; });
      setSettings(settingsMap);

      const infoMap: Record<string, { km: string; en: string }> = {};
      (info ?? []).forEach((i: { section: string; content_km: string; content_en: string }) => {
        infoMap[i.section] = { km: i.content_km, en: i.content_en };
      });
      setSchoolInfo(infoMap);

      setLeadership((leaders ?? []) as Leadership[]);
      setLoading(false);
    };
    init();
  }, []);

  const handleSaveSetting = async (key: string, value: string) => {
    setSaving(true);
    const result = await upsertSetting(key, value);
    setSaving(false);
    if (result.success) toast.success("Saved");
    else toast.error(result.error ?? "Failed to save");
  };

  const handleSaveSchoolInfo = async (section: string) => {
    setSaving(true);
    const info = schoolInfo[section] ?? { km: "", en: "" };
    const result = await upsertSchoolInfo(section, info.km, info.en);
    setSaving(false);
    if (result.success) toast.success("Saved");
    else toast.error(result.error ?? "Failed to save");
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
    if (result.success) toast.success("Saved");
    else toast.error(result.error ?? "Failed to save");
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {locale === "km" ? "ការកំណត់" : "Settings"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {locale === "km" ? "គ្រប់គ្រងព័ត៌មានសាលា និងការដំឡើង" : "Manage school information and site configuration"}
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="general" className="flex items-center gap-1.5"><Settings className="w-3.5 h-3.5" />General</TabsTrigger>
          <TabsTrigger value="hero" className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />Hero</TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />About</TabsTrigger>
          <TabsTrigger value="leadership" className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Leadership</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-5 mt-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Contact Information</h2>
            {["school_address_km", "school_address_en", "school_phone", "school_email", "school_hours_km", "school_hours_en", "school_facebook", "school_youtube", "school_tiktok"].map((key) => (
              <div key={key} className="flex items-end gap-3">
                <div className="flex-1 space-y-1.5">
                  <Label className="capitalize">{key.replace(/_/g, " ")}</Label>
                  <Input
                    value={settings[key] ?? ""}
                    onChange={(e) => setSettings((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={key}
                  />
                </div>
                <Button size="sm" variant="outline" onClick={() => handleSaveSetting(key, settings[key] ?? "")} disabled={saving}>
                  <Save className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Hero Settings */}
        <TabsContent value="hero" className="space-y-5 mt-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Homepage Hero</h2>
            {[
              { key: "hero_title_km", label: "Title (Khmer)", cls: "font-khmer" },
              { key: "hero_title_en", label: "Title (English)", cls: "" },
              { key: "hero_subtitle_km", label: "Subtitle (Khmer)", cls: "font-khmer" },
              { key: "hero_subtitle_en", label: "Subtitle (English)", cls: "" },
              { key: "hero_image_url", label: "Hero Image URL", cls: "" },
              { key: "hero_cta_primary_km", label: "CTA Button (Khmer)", cls: "font-khmer" },
              { key: "hero_cta_primary_en", label: "CTA Button (English)", cls: "" },
            ].map(({ key, label, cls }) => (
              <div key={key} className="flex items-end gap-3">
                <div className="flex-1 space-y-1.5">
                  <Label>{label}</Label>
                  <Input
                    className={cls}
                    value={settings[key] ?? ""}
                    onChange={(e) => setSettings((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={label}
                  />
                </div>
                <Button size="sm" variant="outline" onClick={() => handleSaveSetting(key, settings[key] ?? "")} disabled={saving}>
                  <Save className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* About / School Info */}
        <TabsContent value="about" className="space-y-5 mt-4">
          {["history", "vision", "mission", "values"].map((section) => (
            <div key={section} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 capitalize">{section}</h2>
                <Button size="sm" onClick={() => handleSaveSchoolInfo(section)} disabled={saving}>
                  <Save className="w-3.5 h-3.5 mr-1" />Save {section}
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>ខ្មែរ</Label>
                  <textarea
                    className="font-khmer w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[100px]"
                    value={schoolInfo[section]?.km ?? ""}
                    onChange={(e) => setSchoolInfo((p) => ({ ...p, [section]: { ...p[section], km: e.target.value } }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>English</Label>
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[100px]"
                    value={schoolInfo[section]?.en ?? ""}
                    onChange={(e) => setSchoolInfo((p) => ({ ...p, [section]: { ...p[section], en: e.target.value } }))}
                  />
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Leadership */}
        <TabsContent value="leadership" className="space-y-4 mt-4">
          {leadership.map((leader, i) => (
            <div key={leader.id} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">{leader.name_en || `Leader ${i + 1}`}</h2>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={leader.is_active}
                    onCheckedChange={(v) => setLeadership((prev) => prev.map((l) => l.id === leader.id ? { ...l, is_active: v } : l))}
                  />
                  <Button size="sm" onClick={() => handleSaveLeadership(leader)} disabled={saving}>
                    <Save className="w-3.5 h-3.5 mr-1" />Save
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(["name_km", "name_en", "position_km", "position_en"] as const).map((field) => (
                  <div key={field} className="space-y-1.5">
                    <Label className="capitalize">{field.replace(/_/g, " ")}</Label>
                    <Input
                      className={field.includes("_km") ? "font-khmer" : ""}
                      value={(leader[field] as string) ?? ""}
                      onChange={(e) => setLeadership((prev) => prev.map((l) => l.id === leader.id ? { ...l, [field]: e.target.value } : l))}
                    />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <ImageUploader
                    value={leader.photo_url}
                    onChange={(url) => setLeadership((prev) => prev.map((l) => l.id === leader.id ? { ...l, photo_url: url ?? "" } : l))}
                    folder={`leadership/${leader.id}`}
                    label="Photo"
                  />
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
