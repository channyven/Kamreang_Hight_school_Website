"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Loader2, GraduationCap, BookOpen,  Layers,  Search, Phone } from "lucide-react";
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

  const filteredTeachers = useMemo(() => {
    return gradeTeachers.filter((t) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      const nameKm = (t.name_km ?? "").toLowerCase();
      const nameEn = (t.name_en ?? "").toLowerCase();
      const subjectKm = (t.subject_km ?? "").toLowerCase();
      const subjectEn = (t.subject_en ?? "").toLowerCase();
      return (
        nameKm.includes(q) ||
        nameEn.includes(q) ||
        subjectKm.includes(q) ||
        subjectEn.includes(q)
      );
    });
  }, [gradeTeachers, searchQuery]);

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className={cn("text-3xl md:text-4xl font-extrabold mb-2 tracking-tight", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
            {km ? "រចនាសម្ព័ន្ធ និងគ្រូបង្រៀន" : "Organization & Teachers"}
          </h2>
          <p className="text-[10px] md:text-[11px] tracking-[0.4em] uppercase font-bold opacity-60" style={{ color: "#737781" }}>
            ORGANIZATION &amp; TEACHERS
          </p>
        </div>

        <Tabs defaultValue="org-chart">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-[#eff4ff] p-1.5 h-auto rounded-xl">
              <TabsTrigger
                value="org-chart"
                className={cn(
                  "rounded-lg px-6 py-2.5 text-sm font-bold data-[state=active]:bg-school-blue-800 data-[state=active]:text-white data-[state=active]:shadow-md transition-all",
                  km && "font-khmer"
                )}
              >
                {km ? "តារាងរចនាសម្ព័ន្ធ" : "Organization Chart"}
              </TabsTrigger>
              <TabsTrigger
                value="by-grade"
                className={cn(
                  "rounded-lg px-6 py-2.5 text-sm font-bold data-[state=active]:bg-school-blue-800 data-[state=active]:text-white data-[state=active]:shadow-md transition-all",
                  km && "font-khmer"
                )}
              >
                {km ? "គ្រូបង្រៀនតាមថ្នាក់" : "Teacher by Grade"}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="org-chart" className="mt-0 outline-none">
            <div className="bg-white rounded-3xl border border-[#e6eeff]/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <OrgChart data={orgChartData} km={km} />
            </div>
          </TabsContent>

          <TabsContent value="by-grade" className="mt-0">
            <div className="flex flex-wrap justify-center gap-1.5 mb-4">
              {GRADES.map((grade) => {
                const count = active.filter((t) => (t.grade_levels ?? []).includes(grade)).length;
                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setSelectedGrade(grade)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer",
                      selectedGrade === grade
                        ? "bg-school-blue-800 text-white"
                        : "bg-[#eff4ff] text-school-blue-800 hover:bg-school-blue-100"
                    )}
                  >
                    {km ? `ថ្នាក់ទី ${grade}` : `Grade ${grade}`}
                    <span className="ml-1 opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Search bar */}
            <div className="relative max-w-xs mx-auto mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={km ? "ស្វែងរកតាមឈ្មោះ ឬមុខវិជ្ជា..." : "Search by name or subject..."}
                aria-label={km ? "ស្វែងរកគ្រូបង្រៀន" : "Search teachers"}
                className={cn(
                  "w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs transition-all duration-200 outline-none focus:border-school-blue-400 focus:ring-2 focus:ring-school-blue-100 placeholder:text-gray-400",
                  km && "font-khmer"
                )}
              />
            </div>

            {/* Teacher grid */}
            {filteredTeachers.length === 0 ? (
              <p className={cn("text-center text-xs py-6", km && "font-khmer")} style={{ color: "#737781" }}>
                {searchQuery.trim()
                  ? km
                    ? "មិនមានគ្រូបង្រៀនត្រូវនឹងការស្វែងរកទេ"
                    : "No teachers match your search."
                  : km
                    ? "មិនទាន់មានគ្រូបង្រៀនកំណត់សម្រាប់ថ្នាក់នេះទេ"
                    : "No teachers assigned to this grade yet."}
              </p>
            ) : (
              <>
                {/* Result count */}
                {searchQuery.trim() && (
                  <p className={cn("text-[10px] text-center mb-3 text-gray-400", km && "font-khmer")}>
                    {km
                      ? `បានរកឃើញ ${filteredTeachers.length} នាក់`
                      : `Found ${filteredTeachers.length} teacher${filteredTeachers.length !== 1 ? "s" : ""}`}
                  </p>
                )}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                  {filteredTeachers.map((teacher) => (
                    <TeacherCard key={teacher.id} teacher={teacher} km={km} />
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function TeacherCard({ teacher, km }: { teacher: Teacher; km: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group bg-white rounded-xl p-2.5 text-center border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md w-full cursor-pointer"
        style={{ borderColor: "#e6eeff", boxShadow: "0px 1px 6px rgba(30,78,140,0.04)" }}
      >
        <div className="relative w-10 h-10 mx-auto rounded-full mb-1.5 overflow-hidden ring-1.5 ring-[#eff4ff] transition-all duration-200 group-hover:ring-[#fdbc13]/30">
          {teacher.photo_url ? (
            <Image
              src={teacher.photo_url}
              alt={km ? teacher.name_km : teacher.name_en}
              fill
              className="object-cover"
              sizes="40px"
            />
          ) : (
            <Image
              src={getAvatarUrl(km ? teacher.name_km : teacher.name_en, 40)}
              alt={km ? teacher.name_km : teacher.name_en}
              fill
              className="object-cover"
              sizes="40px"
            />
          )}
        </div>
        <h4
          className={cn(
            "font-semibold text-[11px] leading-tight truncate transition-colors group-hover:text-[#00376f]",
            km && "font-khmer"
          )}
          style={{ color: "#0d1c2f" }}
        >
          {km ? teacher.name_km : teacher.name_en}
        </h4>
        <p className={cn("text-[10px] leading-snug truncate", km && "font-khmer")} style={{ color: "#434750" }}>
          {km ? teacher.subject_km : teacher.subject_en}
        </p>
        {teacher.years_experience ? (
          <span
            className="inline-block text-[9px] font-medium px-1.5 py-0.5 rounded-full mt-0.5"
            style={{ background: "#eff4ff", color: "#00376f" }}
          >
            {teacher.years_experience}y
          </span>
        ) : null}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-0 gap-0 border-none bg-school-navy text-white rounded-[2.5rem] shadow-2xl scrollbar-none">
          <DialogTitle className="sr-only">
            {km ? teacher.name_km : teacher.name_en}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {km ? teacher.subject_km : teacher.subject_en}
          </DialogDescription>
          {/* Top Photo Section */}
          <div className="relative aspect-[4/5] w-full group/photo">
            {teacher.photo_url ? (
              <Image
                src={teacher.photo_url}
                alt={km ? teacher.name_km : teacher.name_en}
                fill
                className="object-cover"
                sizes="500px"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1e3a8a] to-school-navy flex items-center justify-center">
                <div className="relative w-40 h-40 rounded-full bg-white/10 flex items-center justify-center ring-8 ring-white/5">
                  <Image
                    src={getAvatarUrl(km ? teacher.name_km : teacher.name_en, 160)}
                    alt={km ? teacher.name_km : teacher.name_en}
                    width={160}
                    height={160}
                    className="rounded-full"
                  />
                </div>
              </div>
            )}
            
            {/* Name/Role Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-school-navy via-school-navy/20 to-transparent flex flex-col justify-end p-10 pb-12">
              <div className="flex items-center gap-3 mb-2">
                <h3 className={cn("text-4xl font-extrabold tracking-tight", km && "font-khmer")}>
                  {km ? teacher.name_km : teacher.name_en}
                </h3>
                {teacher.gender && (
                  <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center opacity-60">
                    <span className="text-[10px]">{teacher.gender === "Male" ? "♂" : "♀"}</span>
                  </div>
                )}
              </div>
              <p className={cn("text-school-goldMain font-bold text-base mb-4", km && "font-khmer")}>
                {km ? teacher.subject_km : teacher.subject_en}
              </p>
              {teacher.phone && (
                <div className="flex items-center gap-3 text-white/50 text-sm font-medium">
                  <Phone className="w-4 h-4 text-school-goldMain" />
                  <span>{teacher.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Details Body */}
          <div className="px-8 pb-12 pt-2 grid grid-cols-2 gap-5">
            {/* Educational Attainment */}
            <div className="bg-white/5 rounded-[1.5rem] p-5 flex items-start gap-4 border border-white/5 transition-colors hover:bg-white/10">
              <div className="w-11 h-11 rounded-2xl bg-school-goldMain/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <GraduationCap className="w-5 h-5 text-school-goldMain" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-black mb-1">
                  {km ? "គុណវុឌ្ឍិ" : "Educational Attainment"}
                </p>
                <p className={cn("text-[15px] font-bold leading-tight", km && "font-khmer")}>
                  {km ? teacher.qualification_km || "ថ្នាក់បរិញ្ញាបត្រ" : teacher.qualification_en || "Master's Degree"}
                </p>
              </div>
            </div>

            {/* Specialization */}
            <div className="bg-white/5 rounded-[1.5rem] p-5 flex items-start gap-4 border border-white/5 transition-colors hover:bg-white/10">
              <div className="w-11 h-11 rounded-2xl bg-school-goldMain/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <BookOpen className="w-5 h-5 text-school-goldMain" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-black mb-1">
                  {km ? "ជំនាញ" : "Specialization"}
                </p>
                <p className={cn("text-[15px] font-bold leading-tight", km && "font-khmer")}>
                  {km ? teacher.department_km || "ប្រវត្តិវិទ្យា" : teacher.department_en || "History"}
                </p>
              </div>
            </div>

            {/* Subject Currently Taught */}
            <div className="bg-white/5 rounded-[1.5rem] p-5 flex items-start gap-4 border border-white/5 transition-colors hover:bg-white/10">
              <div className="w-11 h-11 rounded-2xl bg-school-goldMain/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <BookOpen className="w-5 h-5 text-school-goldMain" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-black mb-1">
                  {km ? "មុខវិជ្ជាបង្រៀន" : "Subject Currently Taught"}
                </p>
                <p className={cn("text-[15px] font-bold leading-tight", km && "font-khmer")}>
                  {km ? teacher.subject_km : teacher.subject_en}
                </p>
              </div>
            </div>

            {/* Class Level Taught */}
            <div className="bg-white/5 rounded-[1.5rem] p-5 flex items-start gap-4 border border-white/5 transition-colors hover:bg-white/10">
              <div className="w-11 h-11 rounded-2xl bg-school-goldMain/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Layers className="w-5 h-5 text-school-goldMain" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-black mb-1">
                  {km ? "ថ្នាក់បង្រៀន" : "Class Level Taught"}
                </p>
                <p className={cn("text-[15px] font-bold leading-tight", km && "font-khmer")}>
                  {km 
                    ? `ថ្នាក់ទី ${teacher.grade_levels?.sort((a, b) => a - b).join(", ") || 7}` 
                    : `Grade ${teacher.grade_levels?.sort((a, b) => a - b).join(", ") || 7}`}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
