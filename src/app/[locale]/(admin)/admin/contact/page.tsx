"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import {
  Save,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Image,
  Globe,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { upsertSetting } from "@/actions/settings";
import { convertGoogleDriveUrl } from "@/utils";

type SettingsMap = Record<string, string>;

const CONTACT_SETTINGS = [
  { key: "school_address_km", label: "Address (Khmer)", icon: MapPin, locale: "km", multiline: true },
  { key: "school_address_en", label: "Address (English)", icon: MapPin, locale: "en", multiline: true },
  { key: "school_phone", label: "Phone Number", icon: Phone, locale: null, multiline: false },
  { key: "school_email", label: "Email Address", icon: Mail, locale: null, multiline: false },
  { key: "school_hours_km", label: "Working Hours (Khmer)", icon: Clock, locale: "km", multiline: false },
  { key: "school_hours_en", label: "Working Hours (English)", icon: Clock, locale: "en", multiline: false },
] as const;

const SOCIAL_SETTINGS = [
  { key: "school_facebook", label: "Facebook URL", icon: Facebook, placeholder: "https://facebook.com/..." },
  { key: "school_tiktok", label: "TikTok URL", icon: Smartphone, placeholder: "https://tiktok.com/..." },
] as const;

const KM_LABELS: Record<string, string> = {
  school_address_km: "អាស្រ័យដ្ថាន (ខ្មែរ)",
  school_address_en: "អាស្រ័យដ្ថាន (អង់គ្លេស)",
  school_phone: "លេខទូរស័ព្ទ",
  school_email: "អាសយដ្ឋានអ៊ីមែល",
  school_hours_km: "ម៉ោងធ្វើការ (ខ្មែរ)",
  school_hours_en: "ម៉ោងធ្វើការ (អង់គ្លេស)",
  school_facebook: "URL Facebook",
  school_tiktok: "URL TikTok",
  school_campus_photo: "រូបថតបរិវេណសាលា",
};

export default function AdminContactPage() {
  const locale = useLocale();
  const km = locale === "km";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsMap>({});
  const [campusPhoto, setCampusPhoto] = useState("");
  const [previewError, setPreviewError] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("settings").select("key, value");
    const settingsMap: SettingsMap = {};
    (data ?? []).forEach((s: { key: string; value: string }) => {
      settingsMap[s.key] = s.value;
    });
    setSettings(settingsMap);
    // Convert Google Drive URL to a displayable image URL on load
    const savedUrl = settingsMap.school_campus_photo ?? "";
    setCampusPhoto(savedUrl);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = async () => {
    // Validate required fields
    const requiredKeys = ["school_address_km", "school_address_en", "school_phone", "school_email"];
    const missingRequired = requiredKeys.filter((key) => !settings[key]?.trim());

    if (missingRequired.length > 0) {
      const fieldNames = missingRequired.map((key) =>
        km && KM_LABELS[key] ? KM_LABELS[key] : key.replace(/_/g, " ")
      );
      toast.error(
        km
          ? `សូមបំពេញព័ត៌មានដែលត្រូវការ៖ ${fieldNames.join(", ")}`
          : `Please fill in required fields: ${fieldNames.join(", ")}`
      );
      setSaving(false);
      return;
    }

    setSaving(true);
    const allKeys = [
      ...CONTACT_SETTINGS.map((s) => s.key),
      ...SOCIAL_SETTINGS.map((s) => s.key),
      "school_campus_photo",
    ];

    const results = await Promise.allSettled(
      allKeys.map((key) =>
        upsertSetting(key, settings[key] ?? "")
      )
    );

    const failures = results.filter(
      (r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success)
    ).length;

    setSaving(false);

    if (failures === 0) {
      toast.success(km ? "បានរក្សាទុកព័ត៌មានទំនាក់ទំនងទាំងអស់ដោយជោគជ័យ" : "All contact information saved successfully");
    } else {
      toast.error(
        km
          ? `បរាជ័យ ${failures} ក្នុងចំណោម ${allKeys.length} ការរក្សាទុក`
          : `${failures} of ${allKeys.length} settings failed to save`
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-school-blue-800" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {km ? "គ្រប់គ្រងទំព័រទំនាក់ទំនង" : "Contact Page Management"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {km
              ? "គ្រប់គ្រងព័ត៌មានទំនាក់ទំនង បណ្តាញសង្គម និងរូបថតបរិវេណសាលា"
              : "Manage contact information, social media links, and campus photo"}
          </p>
        </div>
        <Button
          onClick={handleSaveAll}
          disabled={saving}
          className="bg-school-blue-800 hover:bg-school-blue-900 text-white shadow-sm"
          size="lg"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {km ? "រក្សាទុកការផ្លាស់ប្តូរទាំងអស់" : "Save All Changes"}
        </Button>
      </div>

      {/* Row 1 - Contact Information & Social Media side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              {km ? "ព័ត៌មានទំនាក់ទំនង" : "Contact Information"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CONTACT_SETTINGS.map(({ key, label, icon: Icon, locale: fieldLocale, multiline }) => (
              <div
                key={key}
                className={`space-y-1.5 ${key === "school_address_km" || key === "school_address_en" ? "md:col-span-2" : ""}`}
              >
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-gray-400" />
                  {km && KM_LABELS[key] ? KM_LABELS[key] : label}
                </Label>
                {multiline ? (
                  <Textarea
                    className={`${fieldLocale === "km" ? "font-khmer" : ""} min-h-[80px] resize-y`}
                    value={settings[key] ?? ""}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder={label}
                  />
                ) : (
                  <Input
                    className={`${fieldLocale === "km" ? "font-khmer" : ""}`}
                    value={settings[key] ?? ""}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder={label}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Social Media Links */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
              <Globe className="w-4 h-4 text-sky-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              {km ? "បណ្តាញសង្គម" : "Social Media Links"}
            </h2>
          </div>

          <div className="space-y-4">
            {SOCIAL_SETTINGS.map(({ key, label, icon: Icon, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-gray-400" />
                  {km && KM_LABELS[key] ? KM_LABELS[key] : label}
                </Label>
                <Input
                  value={settings[key] ?? ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 2 - Campus Photo full width */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Image className="w-4 h-4 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            {km ? "រូបថតបរិវេណសាលា" : "Campus Photo"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              {km ? "URL រូបថត" : "Image URL"}
            </Label>
            <Input
              value={campusPhoto}
              onChange={(e) => {
                setCampusPhoto(e.target.value);
                handleChange("school_campus_photo", e.target.value);
                setPreviewError(false);
              }}
              placeholder="Paste image URL or Google Drive link"
            />
          </div>

          {/* Photo Preview */}
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
            {campusPhoto ? (                  !previewError ? (
                    <img
                      src={convertGoogleDriveUrl(campusPhoto)}
                      alt="Campus preview"
                      className="w-full h-full object-cover"
                      onError={() => setPreviewError(true)}
                    />
              ) : (
                <div className="text-center p-4">
                  <Image className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-400">
                    {km
                      ? "មិនអាចផ្ទុករូបភាពបានទេ។ សូមពិនិត្យ URL"
                      : "Failed to load image. Check the URL."}
                  </p>
                </div>
              )
            ) : (
              <div className="text-center p-4">
                <Image className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-400">
                  {km
                    ? "បញ្ចូល URL រូបថតដើម្បីមើលការបង្ហាញជាមុន"
                    : "Enter an image URL to see a preview"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Current campus photo hint */}
        {campusPhoto && !previewError && (
          <p className="text-xs text-emerald-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {km ? "រូបថតនឹងបង្ហាញនៅលើទំព័រទំនាក់ទំនង" : "This photo will appear on the public Contact page"}
          </p>
        )}
      </Card>
    </div>
  );
}
