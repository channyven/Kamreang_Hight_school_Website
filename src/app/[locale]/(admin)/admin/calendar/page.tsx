"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Plus, Pencil, Trash2, Loader2, Save, X, Calendar,
  Copy, AlertTriangle, Search, Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  getAllCalendarEvents, createCalendarEvent, updateCalendarEvent,
  deleteCalendarEvent, duplicateCalendarEvent,
} from "@/actions/calendar";
import type { CalendarEvent, EventCategory, EventVisibility, EventStatus } from "@/types";
import { EVENT_CATEGORIES, EVENT_VISIBILITY_OPTIONS, EVENT_STATUS_OPTIONS } from "@/types";
import CategoryBadge from "@/components/calendar/CategoryBadge";
import CalendarView from "@/components/calendar/CalendarView";
import { format } from "date-fns";

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "school_event" as EventCategory,
  location: "",
  organizer: "",
  start_date: "",
  end_date: "",
  start_time: "",
  end_time: "",
  is_all_day: false,
  is_recurring: false,
  visibility: "public" as EventVisibility,
  status: "draft" as EventStatus,
  color: "",
  attachment_url: "",
  grade_level: undefined as number | undefined,
  department: "",
  is_featured: false,
};

export default function AdminCalendarPage() {
  const t = useTranslations("calendar");
  const locale = useLocale();
  const km = locale === "km";

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    const data = await getAllCalendarEvents();
    setEvents(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = km ? "សូមបញ្ចូលចំណងជើង" : "Title is required";
    if (!form.start_date) errors.start_date = km ? "សូមបញ្ចូលកាលបរិច្ឆេទចាប់ផ្ដើម" : "Start date is required";
    if (!form.end_date) errors.end_date = km ? "សូមបញ្ចូលកាលបរិច្ឆេទបញ្ចប់" : "End date is required";
    if (form.start_date && form.end_date && form.start_date > form.end_date) {
      errors.end_date = km ? "កាលបរិច្ឆេទបញ្ចប់ត្រូវតែក្រោយកាលបរិច្ឆេទចាប់ផ្ដើម" : "End date must be after start date";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFieldErrors({});
    setShowForm(true);
  };

  const handleEdit = (ev: CalendarEvent) => {
    setForm({
      title: ev.title,
      description: ev.description ?? "",
      category: ev.category,
      location: ev.location ?? "",
      organizer: ev.organizer ?? "",
      start_date: ev.start_date,
      end_date: ev.end_date,
      start_time: ev.start_time ?? "",
      end_time: ev.end_time ?? "",
      is_all_day: ev.is_all_day,
      is_recurring: ev.is_recurring,
      visibility: ev.visibility,
      status: ev.status,
      color: ev.color ?? "",
      attachment_url: ev.attachment_url ?? "",
      grade_level: ev.grade_level ?? undefined,
      department: ev.department ?? "",
      is_featured: ev.is_featured,
    });
    setEditingId(ev.id);
    setFieldErrors({});
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFieldErrors({});
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error(km ? "សូមពិនិត្យមើលកំហុសក្នុងទម្រង់" : "Please fix validation errors");
      return;
    }
    setSaving(true);
    const payload = form;
    const result = editingId
      ? await updateCalendarEvent(editingId, payload)
      : await createCalendarEvent(payload);
    setSaving(false);
    if (result.success) {
      toast.success(editingId ? "Event updated" : "Event created");
      setShowForm(false);
      setEditingId(null);
      fetchData();
    } else {
      toast.error(result.error ?? "Failed to save");
    }
  };

  const handleDelete = (id: string, title: string) => setDeleteConfirm({ id, title });
  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const result = await deleteCalendarEvent(deleteConfirm.id);
    setDeleteConfirm(null);
    if (result.success) {
      toast.success("Event deleted");
      fetchData();
    } else {
      toast.error(result.error ?? "Failed to delete");
    }
  };

  const handleDuplicate = async (id: string) => {
    const result = await duplicateCalendarEvent(id);
    if (result.success) {
      toast.success("Event duplicated");
      fetchData();
    } else {
      toast.error(result.error ?? "Failed to duplicate");
    }
  };

  const filteredEvents = events.filter((ev) => {
    if (statusFilter !== "all" && ev.status !== statusFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return ev.title.toLowerCase().includes(q) || (ev.description ?? "").toLowerCase().includes(q);
    }
    return true;
  });

  const listView = (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={km ? "ស្វែងរក..." : t("searchEvents")}
            className="pl-8 h-9 text-xs"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-9 text-xs">
            <SelectValue placeholder={km ? "ស្ថានភាព" : t("status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{km ? "ទាំងអស់" : "All"}</SelectItem>
            {EVENT_STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.key} value={opt.key}>{km ? opt.labelKm : opt.labelEn}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-gray-400">
          {filteredEvents.length} {km ? "ព្រឹត្តិការណ៍" : "events"}
        </span>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-200">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium text-gray-500">{km ? "គ្មានព្រឹត្តិការណ៍" : t("noEvents")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredEvents.map((ev) => {
            const cat = EVENT_CATEGORIES.find((c) => c.key === ev.category);
            const st = EVENT_STATUS_OPTIONS.find((s) => s.key === ev.status);
            return (
              <div
                key={ev.id}
                className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 px-4 py-3 hover:shadow-sm transition-shadow"
              >
                <div
                  className="w-1 h-10 rounded-full shrink-0"
                  style={{ background: cat?.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 truncate">{ev.title}</span>
                    {ev.is_featured && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0 border-amber-300 text-amber-700 bg-amber-50">
                        {km ? "លេចធ្លោ" : t("featured")}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <CategoryBadge category={ev.category} />
                    <span className="text-[10px] text-gray-400">
                      {format(new Date(ev.start_date + "T00:00:00"), "MMM d")}
                      {ev.start_date !== ev.end_date && ` - ${format(new Date(ev.end_date + "T00:00:00"), "MMM d")}`}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0"
                      style={{
                        borderColor: `${cat?.color}40`,
                        background: `${cat?.color}10`,
                        color: cat?.color,
                      }}
                    >
                      {km ? st?.labelKm : st?.labelEn}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(ev)}>
                    <Pencil className="w-3.5 h-3.5 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDuplicate(ev.id)}>
                    <Copy className="w-3.5 h-3.5 text-purple-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(ev.id, ev.title)}>
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const eventForm = (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
      {saving && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl shadow-lg border">
            <Loader2 className="w-5 h-5 animate-spin text-school-blue-800" />
            <span className="text-sm font-medium text-gray-700">{km ? "កំពុងរក្សាទុក..." : "Saving..."}</span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">
          {editingId ? (km ? "កែសម្រួលព្រឹត្តិការណ៍" : t("editEvent")) : (km ? "ព្រឹត្តិការណ៍ថ្មី" : t("createEvent"))}
        </h2>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleCancel} disabled={saving}>
            <X className="w-3.5 h-3.5 mr-1" />{km ? "បោះបង់" : t("cancel")}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Save className="w-3.5 h-3.5 mr-1" />{km ? "រក្សាទុក" : "Save"}
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Basic info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs text-gray-500">{km ? "ចំណងជើង" : "Title"} *</Label>
            <Input value={form.title} onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); setFieldErrors((p) => ({ ...p, title: "" })); }} className={fieldErrors.title ? "border-red-400" : ""} />
            {fieldErrors.title && <p className="text-xs text-red-500">{fieldErrors.title}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">{km ? "ប្រភេទ" : t("category")}</Label>
            <Select value={form.category} onValueChange={(v: EventCategory) => setForm((f) => ({ ...f, category: v }))}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {EVENT_CATEGORIES.map((c) => (
                  <SelectItem key={c.key} value={c.key} className="text-xs">
                    {km ? c.labelKm : c.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">{km ? "ការមើលឃើញ" : t("visibility")}</Label>
            <Select value={form.visibility} onValueChange={(v: EventVisibility) => setForm((f) => ({ ...f, visibility: v }))}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {EVENT_VISIBILITY_OPTIONS.map((v) => (
                  <SelectItem key={v.key} value={v.key} className="text-xs">{km ? v.labelKm : v.labelEn}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">{km ? "ស្ថានភាព" : t("status")}</Label>
            <Select value={form.status} onValueChange={(v: EventStatus) => setForm((f) => ({ ...f, status: v }))}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {EVENT_STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.key} value={s.key} className="text-xs">{km ? s.labelKm : s.labelEn}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">{km ? "ពណ៌" : "Color"}</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.color || "#6366f1"}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer"
              />
              <Input value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="h-9 text-xs" placeholder="#6366f1" />
            </div>
          </div>
        </div>

        {/* Date/Time */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">{km ? "ថ្ងៃចាប់ផ្ដើម" : "Start Date"} *</Label>
            <Input type="date" value={form.start_date} onChange={(e) => { setForm((f) => ({ ...f, start_date: e.target.value })); setFieldErrors((p) => ({ ...p, start_date: "" })); }} className={`h-9 text-xs ${fieldErrors.start_date ? "border-red-400" : ""}`} />
            {fieldErrors.start_date && <p className="text-xs text-red-500">{fieldErrors.start_date}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">{km ? "ថ្ងៃបញ្ចប់" : "End Date"} *</Label>
            <Input type="date" value={form.end_date} onChange={(e) => { setForm((f) => ({ ...f, end_date: e.target.value })); setFieldErrors((p) => ({ ...p, end_date: "" })); }} className={`h-9 text-xs ${fieldErrors.end_date ? "border-red-400" : ""}`} />
            {fieldErrors.end_date && <p className="text-xs text-red-500">{fieldErrors.end_date}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">{km ? "ម៉ោងចាប់ផ្ដើម" : "Start Time"}</Label>
            <Input type="time" value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} className="h-9 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">{km ? "ម៉ោងបញ្ចប់" : "End Time"}</Label>
            <Input type="time" value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} className="h-9 text-xs" />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Switch checked={form.is_all_day} onCheckedChange={(v) => setForm((f) => ({ ...f, is_all_day: v }))} />
            <span className="text-sm text-gray-600">{km ? "ពេញមួយថ្ងៃ" : t("allDay")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_recurring} onCheckedChange={(v) => setForm((f) => ({ ...f, is_recurring: v }))} />
            <span className="text-sm text-gray-600">{km ? "កើតឡើងវិញ" : t("recurring")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_featured} onCheckedChange={(v) => setForm((f) => ({ ...f, is_featured: v }))} />
            <span className="text-sm text-gray-600">{km ? "លេចធ្លោ" : t("featured")}</span>
          </div>
        </div>

        {/* Location & Organizer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">{km ? "ទីតាំង" : t("location")}</Label>
            <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="h-9 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">{km ? "អ្នករៀបចំ" : t("organizer")}</Label>
            <Input value={form.organizer} onChange={(e) => setForm((f) => ({ ...f, organizer: e.target.value }))} className="h-9 text-xs" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">{km ? "ការពិពណ៌នា" : t("description")}</Label>
          <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="text-xs" />
        </div>

        {/* Extra fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">{km ? "ថ្នាក់" : "Grade Level"}</Label>
<Select value={form.grade_level ? String(form.grade_level) : "all"} onValueChange={(v) => setForm((f) => ({ ...f, grade_level: v !== "all" ? parseInt(v) : undefined }))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={km ? "ទាំងអស់" : "All"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{km ? "ទាំងអស់" : "All Grades"}</SelectItem>
                {[7, 8, 9, 10, 11, 12].map((g) => (
                  <SelectItem key={g} value={String(g)} className="text-xs">
                    {km ? `ថ្នាក់ទី${g}` : `Grade ${g}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">{km ? "ដេប៉ាតឺម៉ង់" : "Department"}</Label>
            <Input value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} className="h-9 text-xs" />
          </div>
        </div>

        {/* Attachment */}
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">{km ? "តំណភ្ជាប់ឯកសារ" : "Attachment URL"}</Label>
          <Input value={form.attachment_url} onChange={(e) => setForm((f) => ({ ...f, attachment_url: e.target.value }))} className="h-9 text-xs" placeholder="https://..." />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-school-blue-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {km ? "គ្រប់គ្រងប្រតិទិន" : "Calendar Management"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {km ? "គ្រប់គ្រងព្រឹត្តិការណ៍ និងសកម្មភាពសាលា" : "Manage school events and activities"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("calendar")}
            className={viewMode === "calendar" ? "bg-school-blue-800" : ""}
          >
            <Calendar className="w-3.5 h-3.5 mr-1" />
            {km ? "ប្រតិទិន" : "Calendar"}
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-school-blue-800" : ""}
          >
            <Filter className="w-3.5 h-3.5 mr-1" />
            {km ? "បញ្ជី" : "List"}
          </Button>
          {!showForm && (
            <Button onClick={handleNew} className="bg-school-blue-800 hover:bg-school-blue-900 text-white">
              <Plus className="w-4 h-4 mr-2" />
              {km ? "បង្កើតព្រឹត្តិការណ៍" : t("createEvent")}
            </Button>
          )}
        </div>
      </div>

      {/* Event form overlay */}
      {showForm && eventForm}

      {/* Calendar view */}
      {!showForm && viewMode === "calendar" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <CalendarView
            events={events.filter((e) => e.status === "published" || e.status === "draft")}
            admin
            onCreateEvent={handleNew}
          />
        </div>
      )}

      {/* List view */}
      {!showForm && viewMode === "list" && listView}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{km ? "លុបព្រឹត្តិការណ៍" : t("deleteEvent")}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {km ? `តើអ្នកប្រាកដថាចង់លុប "${deleteConfirm.title}"?` : `Delete "${deleteConfirm.title}"?`}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-5">{km ? "សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។" : "This action cannot be undone."}</p>
            <div className="flex items-center justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(null)}>{km ? "បោះបង់" : t("cancel")}</Button>
              <Button size="sm" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                {km ? "លុប" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}