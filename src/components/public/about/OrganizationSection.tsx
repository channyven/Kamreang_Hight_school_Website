"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Loader2, Search, Phone, BookMarked, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn, getAvatarUrl } from "@/utils";
import type { Teacher } from "@/types";
import { orgChartData } from "@/lib/mock-data";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// react-organizational-chart bundles Emotion for its connector lines, which
// touches `document` at module-evaluation time — that crashes Next.js SSR
// even though the component itself is "use client". Load it client-only.
const OrgChart = dynamic(() => import("./OrgChart"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-school-blue-800" />
    </div>
  ),
});

const GRADES = [7, 8, 9, 10, 11, 12];

interface OrganizationSectionProps {
  teachers: Teacher[];
  locale: string;
}

export default function OrganizationSection({ teachers, locale }: OrganizationSectionProps) {
  const km = locale === "km";
  const active = useMemo(() => teachers.filter((t) => t.is_active), [teachers]);

  const defaultGrade = useMemo(() => {
    return GRADES.find((g) => active.some((t) => (t.grade_levels ?? []).includes(g))) ?? GRADES[0];
  }, [active]);
  const [selectedGrade, setSelectedGrade] = useState(defaultGrade);
  const [searchQuery, setSearchQuery] = useState("");

  const gradeTeachers = useMemo(
    () => active.filter((t) => (t.grade_levels ?? []).includes(selectedGrade)),
    [active, selectedGrade]
  );

  const filteredGradeTeachers = useMemo(() => {
    return gradeTeachers.filter((t) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      return (
        (t.name_km ?? "").toLowerCase().includes(q) ||
        (t.name_en ?? "").toLowerCase().includes(q) ||
        (t.subject_km ?? "").toLowerCase().includes(q) ||
        (t.subject_en ?? "").toLowerCase().includes(q)
      );
    });
  }, [gradeTeachers, searchQuery]);

  return (
    <section className="py-16 bg-gradient-to-b from-white to-[#f8f9ff]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className={cn("text-3xl md:text-4xl font-extrabold mb-3 tracking-tight", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
            {km ? "រចនាសម្ព័ន្ធ និងគ្រូបង្រៀន" : "Organization & Teachers"}
          </h2>
          <p className="text-[10px] md:text-[11px] tracking-[0.4em] uppercase font-bold opacity-60" style={{ color: "#737781" }}>
            {km ? "រចនាសម្ព័ន្ធ និងគ្រូបង្រៀន" : "ORGANIZATION & TEACHERS"}
          </p>
        </div>

        <Tabs defaultValue="by-grade">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-[#eff4ff] p-1.5 h-auto rounded-xl shadow-sm">
              <TabsTrigger
                value="org-chart"
                className={cn(
                  "rounded-lg px-5 py-2.5 text-sm font-bold data-[state=active]:bg-school-blue-800 data-[state=active]:text-white data-[state=active]:shadow-md transition-all",
                  km && "font-khmer"
                )}
              >
                {km ? "តារាងរចនាសម្ព័ន្ធ" : "Organization Chart"}
              </TabsTrigger>
              <TabsTrigger
                value="by-grade"
                className={cn(
                  "rounded-lg px-5 py-2.5 text-sm font-bold data-[state=active]:bg-school-blue-800 data-[state=active]:text-white data-[state=active]:shadow-md transition-all",
                  km && "font-khmer"
                )}
              >
                <BookMarked className="w-4 h-4 mr-1.5 inline-block" />
                {km ? "គ្រូតាមថ្នាក់" : "Teacher by Grade"}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ─── TEACHER BY GRADE TAB ─── */}
          <TabsContent value="by-grade" className="mt-0 outline-none">
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {GRADES.map((grade) => {
                const count = active.filter((t) => (t.grade_levels ?? []).includes(grade)).length;
                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setSelectedGrade(grade)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer",
                      selectedGrade === grade
                        ? "bg-school-blue-800 text-white shadow-md shadow-school-blue-800/20"
                        : "bg-[#eff4ff] text-school-blue-800 hover:bg-school-blue-100"
                    )}
                  >
                    {km ? `ថ្នាក់ទី ${grade}` : `Grade ${grade}`}
                    <span className="ml-1.5 opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Search bar */}
            <div className="relative max-w-xs mx-auto mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={km ? "ស្វែងរកតាមឈ្មោះ ឬមុខវិជ្ជា..." : "Search by name or subject..."}
                aria-label={km ? "ស្វែងរកគ្រូបង្រៀន" : "Search teachers"}
                className={cn(
                  "w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-xs transition-all duration-200 outline-none focus:border-school-blue-400 focus:ring-2 focus:ring-school-blue-100 placeholder:text-gray-400",
                  km && "font-khmer"
                )}
              />
            </div>

            {/* Teacher grid - 5 per row */}
            {filteredGradeTeachers.length === 0 ? (
              <p className={cn("text-center text-xs py-6", km && "font-khmer")} style={{ color: "#737781" }}>
                {searchQuery.trim()
                  ? km ? "មិនមានគ្រូបង្រៀនត្រូវនឹងការស្វែងរកទេ" : "No teachers match your search."
                  : km ? "មិនទាន់មានគ្រូបង្រៀនកំណត់សម្រាប់ថ្នាក់នេះទេ" : "No teachers assigned to this grade yet."}
              </p>
            ) : (
              <>
                {searchQuery.trim() && (
                  <p className={cn("text-[10px] text-center mb-3 text-gray-400", km && "font-khmer")}>
                    {km
                      ? `បានរកឃើញ ${filteredGradeTeachers.length} នាក់`
                      : `Found ${filteredGradeTeachers.length} teacher${filteredGradeTeachers.length !== 1 ? "s" : ""}`}
                  </p>
                )}
                {/* 5 per row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filteredGradeTeachers.map((teacher) => (
                    <TeacherCard key={teacher.id} teacher={teacher} km={km} />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* ─── ORGANIZATION CHART TAB ─── */}
          <TabsContent value="org-chart" className="mt-0 outline-none">
            <div className="bg-white rounded-3xl border border-[#e6eeff]/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <OrgChart data={orgChartData} km={km} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

// ─── Info Row (simple label:value line) ──────────────────────

function InfoRow({ label, value, km }: { label: string; value: string; km: boolean }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className={cn("text-[10px] uppercase tracking-wider font-semibold w-[72px] shrink-0 text-right", km && "font-khmer")} style={{ color: "#a0a5b0" }}>
        {label}
      </span>
      <span className={cn("text-xs font-medium", km && "font-khmer")} style={{ color: "#2c3038" }}>
        {value}
      </span>
    </div>
  );
}

// ─── Teacher Card Component ───────────────────────────────────

function TeacherCard({ teacher, km }: { teacher: Teacher; km: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group bg-white rounded-xl p-3 text-center border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg w-full cursor-pointer"
        style={{ borderColor: "#e6eeff", boxShadow: "0px 1px 6px rgba(30,78,140,0.04)" }}
      >
        <div className="relative w-20 h-20 mx-auto rounded-full mb-3 overflow-hidden ring-2 ring-[#eff4ff] transition-all duration-300 group-hover:ring-[#fdbc13]/40 group-hover:shadow-md">
          {teacher.photo_url ? (
            <Image
              src={teacher.photo_url}
              alt={teacher.name_km}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="80px"
            />
          ) : (
            <Image
              src={getAvatarUrl(teacher.name_km, 80)}
              alt={teacher.name_km}
              fill
              className="object-cover"
              sizes="80px"
            />
          )}
        </div>
        <h4
          className={cn(
            "font-semibold text-sm leading-tight truncate transition-colors group-hover:text-[#00376f] flex items-center justify-center gap-0.5",
            km && "font-khmer"
          )}
          style={{ color: "#0d1c2f" }}
        >
          <span>{teacher.name_km}</span>
          {teacher.gender && (
            <span className="inline-block text-[9px] opacity-50">
              {teacher.gender === "Male" ? "♂" : "♀"}
            </span>
          )}
        </h4>
        <p className={cn("text-xs leading-snug truncate mt-0.5", km && "font-khmer")} style={{ color: "#434750" }}>
          {km ? teacher.subject_km : teacher.subject_en}
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-1 flex-wrap">
          {teacher.qualification_km && (
            <span className="inline-block text-[8px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 truncate max-w-[60px]">
              {teacher.qualification_km}
            </span>
          )}
        </div>
      </button>

      {/* ─── Enhanced Detail Dialog ─── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto p-0 gap-0 border-none rounded-3xl shadow-2xl bg-white scrollbar-none">
          <DialogTitle className="sr-only">
            {teacher.name_km}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {km ? teacher.subject_km : teacher.subject_en}
          </DialogDescription>

          {/* ─── Large Professional Photo ─── */}
          <div className="relative w-full h-[420px] overflow-hidden">
            {teacher.photo_url ? (
              <Image
                src={teacher.photo_url}
                alt={teacher.name_km}
                fill
                className="object-cover object-top"
                sizes="520px"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-school-blue-800 to-school-navy">
                <div className="relative w-28 h-28 rounded-full bg-white/10 flex items-center justify-center ring-4 ring-white/5">
                  <Image
                    src={getAvatarUrl(teacher.name_km, 120)}
                    alt={teacher.name_km}
                    width={112}
                    height={112}
                    className="rounded-full"
                  />
                </div>
              </div>
            )}

            {/* Soft gradient bottom overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Close button */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center text-white/70 hover:bg-black/50 hover:text-white transition-all z-10"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Minimal overlay: Name + Gender + Subject·Role·Phone */}
            <div className="absolute bottom-0 left-0 right-0 p-5 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cn("text-xl md:text-2xl font-bold text-white tracking-tight", km && "font-khmer")}>
                  {teacher.name_km}
                </h3>
                {teacher.gender && (
                  <span className="text-xs font-medium text-white/80">
                    {teacher.gender === "Male" ? "♂" : "♀"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/80">
                <span className="text-school-goldMain font-semibold">
                  {km ? teacher.subject_km : teacher.subject_en}
                </span>
                <span className="text-white/40">·</span>
                <span>
                  {km ? (teacher.department_km || "គ្រូបង្រៀន") : (teacher.department_en || "Teacher")}
                </span>
                {teacher.phone && (
                  <>
                    <span className="text-white/40 mx-0.5">·</span>
                    <span>{teacher.phone}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ─── Minimal Details List (no backgrounds/padding) ─── */}
          <div className="p-4 space-y-1.5">
            <InfoRow label={km ? "មុខងារ" : "Role"} value={km ? (teacher.department_km || teacher.subject_km || "គ្រូបង្រៀន") : (teacher.department_en || teacher.subject_en || "Teacher")} km={km} />
            <InfoRow label={km ? "ទូរស័ព្ទ" : "Phone"} value={teacher.phone || (km ? "គ្មាន" : "—")} km={km} />
            <InfoRow label={km ? "គុណវុឌ្ឍិ" : "Qualification"} value={km ? (teacher.qualification_km || "—") : (teacher.qualification_en || "—")} km={km} />
            <InfoRow label={km ? "មុខវិជ្ជា" : "Subject"} value={km ? (teacher.subject_km || "—") : (teacher.subject_en || "—")} km={km} />
            <InfoRow label={km ? "ថ្នាក់បង្រៀន" : "Teach Grade"} value={teacher.grade_levels?.length ? (km ? `ថ្នាក់ទី ${[...teacher.grade_levels].sort((a, b) => a - b).join(", ")}` : `Grade ${[...teacher.grade_levels].sort((a, b) => a - b).join(", ")}`) : "—"} km={km} />
            {teacher.years_experience && (
              <InfoRow label={km ? "បទពិសោធន៍" : "Experience"} value={km ? `${teacher.years_experience} ឆ្នាំ` : `${teacher.years_experience} year${teacher.years_experience !== 1 ? "s" : ""}`} km={km} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
