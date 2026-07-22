"use client";

import Image from "next/image";
import { X, Phone, GraduationCap, BookOpen, User } from "lucide-react";
import { cn, getAvatarUrl } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Teacher } from "@/types";

interface TeacherProfileDialogProps {
  teacher: Teacher;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  km: boolean;
}

/**
 * Shared teacher profile dialog with a split-panel layout:
 * - Left → professional studio portrait
 * - Right dark navy panel → name, gender, yellow role badge, phone, education, grade, subjects
 */
export default function TeacherProfileDialog({
  teacher,
  open,
  onOpenChange,
  km,
}: TeacherProfileDialogProps) {
  // Split subject string into tags for display
  const subjects = (
    km ? teacher.subject_km : teacher.subject_en
  )?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];

  const roleDisplay = km
    ? (teacher.department_km || teacher.subject_km || "គ្រូបង្រៀន")
    : (teacher.department_en || teacher.subject_en || "Teacher");

  const qualificationDisplay = km
    ? teacher.qualification_km
    : teacher.qualification_en;

  const gradeDisplay = teacher.grade_levels && teacher.grade_levels.length > 0
    ? (km
        ? `ថ្នាក់ទី ${[...teacher.grade_levels].sort((a, b) => a - b).join(", ")}`
        : `Grade ${[...teacher.grade_levels].sort((a, b) => a - b).join(", ")}`)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-[680px] max-h-[90vh] p-0 gap-0 overflow-hidden",
          "rounded-2xl shadow-2xl bg-white scrollbar-none",
          "border border-[#bfd9ff]"
        )}
      >
        <DialogTitle className="sr-only">
          {teacher.name_km || teacher.name_en}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {roleDisplay}
        </DialogDescription>

        {/* Close button */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/40 hover:text-white transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex flex-col sm:flex-row-reverse">
          {/* ─── LEFT PANEL — Photo ─── */}
          <div className="flex-1 relative bg-[#f5f7fa] min-h-[340px] sm:min-h-[460px]">
            {teacher.photo_url ? (
              <Image
                src={teacher.photo_url}
                alt={teacher.name_km || teacher.name_en || "Teacher photo"}
                fill
                className="object-cover object-top"
                sizes="420px"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#e8edf5] to-[#d5dde8]">
                <div className="relative w-32 h-32 rounded-full bg-white/60 flex items-center justify-center shadow-lg ring-4 ring-white/80">
                  <Image
                    src={getAvatarUrl(teacher.name_km || teacher.name_en, 128)}
                    alt={teacher.name_km || teacher.name_en || "Teacher"}
                    width={128}
                    height={128}
                    className="rounded-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ─── RIGHT PANEL — Dark Navy ─── */}
          <div className="relative w-full sm:w-[280px] shrink-0 bg-[#0a1628] p-6 flex flex-col overflow-hidden">
            {/* Subtle radial pattern */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.2) 0%, transparent 60%)",
              }}
            />

            {/* ── Name + gender ── */}
            <div className="mb-3">
              <h3
                className={cn(
                  "text-xl font-bold text-white leading-tight",
                  km && "font-khmer"
                )}
              >
                {teacher.name_km || teacher.name_en}
                {teacher.gender && (
                  <span className="inline-block ml-1.5 text-sm font-semibold text-blue-300/80 align-middle">
                    {teacher.gender === "Male" ? "♂" : "♀"}
                  </span>
                )}
              </h3>
            </div>

            {/* ── Role Badge (yellow, black text) ── */}
            <span className="inline-flex self-start items-center px-3 py-1.5 rounded-lg bg-[#facc15] text-[#0a1628] text-[11px] font-bold tracking-wide uppercase mb-6">
              {roleDisplay}
            </span>

            {/* ── Info Sections ── */}
            <div className="space-y-4">
              {/* Phone */}
              {teacher.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.12em] font-semibold text-blue-300/50">
                      {km ? "ទូរស័ព្ទ" : "Phone"}
                    </p>
                    <span className="text-sm text-white/90 font-medium tracking-wide">
                      {teacher.phone}
                    </span>
                  </div>
                </div>
              )}

              {/* Education */}
              {qualificationDisplay && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.12em] font-semibold text-blue-300/50">
                      {km ? "ការអប់រំ" : "Education"}
                    </p>
                    <span className="text-sm text-white/90 font-medium">
                      {qualificationDisplay}
                    </span>
                  </div>
                </div>
              )}

              {/* Grade */}
              {gradeDisplay && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.12em] font-semibold text-blue-300/50">
                      {km ? "ថ្នាក់" : "Grade"}
                    </p>
                    <span className="text-sm text-white/90 font-medium">
                      {gradeDisplay}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ── Subject Tags ── */}
            {subjects.length > 0 && (
              <div className="mt-auto pt-6">
                <p className="text-[9px] uppercase tracking-[0.12em] font-semibold text-blue-300/50 mb-2.5">
                  {km ? "មុខវិជ្ជា" : "Subjects"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-200 text-[11px] font-semibold"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Experience ── */}
            {teacher.years_experience && (
              <p className="text-[9px] text-white/35 mt-4">
                {km
                  ? `${teacher.years_experience} ឆ្នាំនៃបទពិសោធន៍`
                  : `${teacher.years_experience} year${teacher.years_experience !== 1 ? "s" : ""} of experience`}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
