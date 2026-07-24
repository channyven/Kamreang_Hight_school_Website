"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Loader2, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn, getAvatarUrl } from "@/utils";
import type { Teacher } from "@/types";
import { orgChartData } from "@/lib/mock-data";
import TeacherProfileDialog from "@/components/public/teachers/TeacherProfileDialog";

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
    <section className="py-16 bg-gradient-to-b from-white to-[#f8f7fc]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className={cn("text-3xl md:text-4xl font-extrabold mb-3 tracking-tight", km && "font-khmer")} style={{ color: "#2c2a7a" }}>
            {km ? "រចនាសម្ព័ន្ធ និងគ្រូបង្រៀន" : "Organization & Teachers"}
          </h2>
          <p className="text-[10px] md:text-[11px] tracking-[0.4em] uppercase font-bold opacity-60" style={{ color: "#727272" }}>
            {km ? "រចនាសម្ព័ន្ធ និងគ្រូបង្រៀន" : "ORGANIZATION & TEACHERS"}
          </p>
        </div>

        <Tabs defaultValue="by-grade">
          <div className="flex justify-center mb-12">
            <TabsList className="bg-[#f4f4fb] p-1.5 h-auto rounded-xl shadow-sm">
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
                {km ? "គ្រូតាមថ្នាក់" : "Teacher by Grade"}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ─── TEACHER BY GRADE TAB ─── */}
          <TabsContent value="by-grade" className="mt-0 outline-none">
            <div className="flex flex-wrap justify-center gap-4 mb-10">
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
                        : "bg-[#f4f4fb] text-school-blue-800 hover:bg-school-blue-100"
                    )}
                  >
                    {km ? `ថ្នាក់ទី ${grade}` : `Grade ${grade}`}
                    <span className="ml-1.5 opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Search bar */}
            <div className="relative max-w-sm mx-auto mb-10">
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
              <p className={cn("text-center text-xs py-6", km && "font-khmer")} style={{ color: "#727272" }}>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  {filteredGradeTeachers.map((teacher) => (
                    <TeacherCard key={teacher.id} teacher={teacher} km={km} />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* ─── ORGANIZATION CHART TAB ─── */}
          <TabsContent value="org-chart" className="mt-0 outline-none">
            <div className="bg-white rounded-3xl border border-[#d7d6f1]/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <OrgChart data={orgChartData} km={km} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
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
        style={{ borderColor: "#d7d6f1", boxShadow: "0px 1px 6px rgba(44,42,122,0.04)" }}
      >
        <div className="relative w-20 h-20 mx-auto rounded-full mb-3 overflow-hidden ring-2 ring-[#f4f4fb] transition-all duration-300 group-hover:ring-[#dfad32]/40 group-hover:shadow-md">
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
            "font-semibold text-sm leading-tight truncate transition-colors group-hover:text-[#2c2a7a] flex items-center justify-center gap-0.5",
            km && "font-khmer"
          )}
          style={{ color: "#2c2a7a" }}
        >
          <span>{teacher.name_km}</span>
          {teacher.gender && (
            <span className="inline-block text-[9px] opacity-50">
              {teacher.gender === "Male" ? "M" : "F"}
            </span>
          )}
        </h4>
        <p className={cn("text-xs leading-snug truncate mt-0.5", km && "font-khmer")} style={{ color: "#636363" }}>
          {km ? teacher.subject_km : teacher.subject_en}
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-1 flex-wrap">
          {teacher.qualification_km && (
            <span className="inline-block text-[8px] font-medium px-1.5 py-0.5 rounded-full bg-school-gold-50 text-school-gold-800 truncate max-w-[60px]">
              {teacher.qualification_km}
            </span>
          )}
        </div>
      </button>

      <TeacherProfileDialog
        teacher={teacher}
        open={open}
        onOpenChange={setOpen}
        km={km}
      />
    </>
  );
}
