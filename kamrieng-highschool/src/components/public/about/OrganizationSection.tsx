"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Loader2, User } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Teacher } from "@/types";

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
  const gradeTeachers = active.filter((t) => (t.grade_levels ?? []).includes(selectedGrade));

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className={cn("text-3xl font-bold mb-2", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
            {km ? "រចនាសម្ព័ន្ធ និងគ្រូបង្រៀន" : "Organization & Teachers"}
          </h2>
          <p className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: "#737781" }}>
            ORGANIZATION &amp; TEACHERS
          </p>
        </div>

        <Tabs defaultValue="org-chart">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-[#eff4ff] p-1 h-auto">
              <TabsTrigger
                value="org-chart"
                className={cn(
                  "rounded-lg px-4 py-2 data-[state=active]:bg-school-blue-800 data-[state=active]:text-white",
                  km && "font-khmer"
                )}
              >
                {km ? "តារាងរចនាសម្ព័ន្ធ" : "Organization Chart"}
              </TabsTrigger>
              <TabsTrigger
                value="by-grade"
                className={cn(
                  "rounded-lg px-4 py-2 data-[state=active]:bg-school-blue-800 data-[state=active]:text-white",
                  km && "font-khmer"
                )}
              >
                {km ? "គ្រូបង្រៀនតាមថ្នាក់" : "Teacher by Grade"}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="org-chart" className="mt-0">
            <OrgChart km={km} />
          </TabsContent>

          <TabsContent value="by-grade" className="mt-0">
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {GRADES.map((grade) => {
                const count = active.filter((t) => (t.grade_levels ?? []).includes(grade)).length;
                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setSelectedGrade(grade)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer",
                      selectedGrade === grade
                        ? "bg-school-blue-800 text-white"
                        : "bg-[#eff4ff] text-school-blue-800 hover:bg-school-blue-100"
                    )}
                  >
                    {km ? `ថ្នាក់ទី ${grade}` : `Grade ${grade}`}
                    <span className="ml-1.5 opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>

            {gradeTeachers.length === 0 ? (
              <p className={cn("text-center text-sm py-10", km && "font-khmer")} style={{ color: "#737781" }}>
                {km
                  ? "មិនទាន់មានគ្រូបង្រៀនកំណត់សម្រាប់ថ្នាក់នេះទេ"
                  : "No teachers assigned to this grade yet."}
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {gradeTeachers.map((teacher) => (
                  <TeacherCard key={teacher.id} teacher={teacher} km={km} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function TeacherCard({ teacher, km }: { teacher: Teacher; km: boolean }) {
  return (
    <div
      className="group bg-white rounded-2xl p-5 text-center border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{ borderColor: "#e6eeff", boxShadow: "0px 2px 12px rgba(30,78,140,0.05)" }}
    >
      <div className="relative w-16 h-16 mx-auto rounded-full mb-3 overflow-hidden ring-2 ring-[#eff4ff] transition-all duration-300 group-hover:ring-[#fdbc13]/40">
        {teacher.photo_url ? (
          <Image
            src={teacher.photo_url}
            alt={km ? teacher.name_km : teacher.name_en}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "#eff4ff" }}>
            <User className="w-8 h-8" style={{ color: "#a8c8ff" }} />
          </div>
        )}
      </div>
      <h4
        className={cn(
          "font-semibold text-sm mb-1 leading-tight transition-colors group-hover:text-[#00376f]",
          km && "font-khmer"
        )}
        style={{ color: "#0d1c2f" }}
      >
        {km ? teacher.name_km : teacher.name_en}
      </h4>
      <p className={cn("text-xs mb-2 leading-snug", km && "font-khmer")} style={{ color: "#434750" }}>
        {km ? teacher.subject_km : teacher.subject_en}
      </p>
      {teacher.years_experience ? (
        <span
          className="inline-block text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: "#eff4ff", color: "#00376f" }}
        >
          {teacher.years_experience}y exp
        </span>
      ) : null}
    </div>
  );
}
