"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ArrowUp,
  School,
  BookOpen,
  FlaskConical,
  Library,
  Trophy,
  Monitor,
  LucideIcon,
} from "lucide-react";
import { cn, getLocalizedText, getAvatarUrl, stripHtml } from "@/utils";
import type { Leadership, Statistics } from "@/types";
import ScrollReveal from "@/components/public/about/ScrollReveal";

interface ReportSection {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface ReportPageClientProps {
  schoolData: {
    schoolInfo: { content_en?: string }[];
    leadership: Leadership[];
    teachers: unknown[];
  };
  statistics: Statistics;
}

const SECTIONS: ReportSection[] = [
  { id: "overview", label: "overview", icon: Building2 },
  { id: "school-info", label: "school_info", icon: School },
  { id: "statistics", label: "statistics", icon: Users },
  { id: "facilities", label: "facilities", icon: Building2 },
];

export function ReportPageClient({ schoolData, statistics }: ReportPageClientProps) {
  const t = useTranslations("report");
  const locale = useLocale();
  const km = locale === "km";
  const [activeSection, setActiveSection] = useState("overview");

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(sectionId);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const leadership = schoolData?.leadership ?? [];
  const principal = leadership[0];
  const stats = statistics || ({} as Statistics);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9ff] via-white to-[#f8f9ff]">
      {/* ── Header ── */}
      <header className="relative overflow-hidden bg-gradient-to-r from-school-blue-900 via-school-blue-800 to-school-blue-900 text-white">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative container mx-auto px-4 py-16 md:py-20 text-center max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="font-khmer text-xl md:text-2xl mb-3 text-school-gold-400"
          >
            {km ? t("subtitle") : "របាយការណ៍ប្រតិបត្តិការ"}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className={cn("text-4xl md:text-5xl font-bold", km && "font-khmer")}
          >
            {t("title")}
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
            className="w-20 h-1 bg-school-gold-400 rounded-full mx-auto mt-6"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="text-white/70 mt-5 text-base md:text-lg"
          >
            {km ? t("title") : t("subtitle")}
          </motion.p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Sidebar Navigation ── */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="lg:sticky lg:top-8 bg-white rounded-2xl shadow-lg border border-gray-100/80 p-4">
              <h3 className="font-semibold text-gray-900 mb-4 px-2">{t("overview")}</h3>
              <ul className="space-y-1">
                {SECTIONS.map((section) => {
                  const Icon = section.icon;
                  return (
                    <li key={section.id}>
                      <button
                        onClick={() => scrollToSection(section.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 border-l-2",
                          activeSection === section.id
                            ? "bg-school-blue-50 text-school-blue-800 font-medium border-school-gold-400"
                            : "text-gray-600 hover:bg-gray-50 border-transparent"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{t(section.label)}</span>
                        {activeSection === section.id && (
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* ── Main Content ── */}
          <main className="flex-1 space-y-10">
            {/* Overview Section */}
            <ScrollReveal variant="fade-up">
              <section id="overview" className="bg-white rounded-2xl shadow-lg border border-gray-100/80 p-8 scroll-mt-8">
                <SectionHeading icon={Building2} title={t("overview")} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon={Users}
                    label={t("total_students")}
                    value={stats.total_students || 0}
                    colorClass="bg-blue-100 text-blue-700"
                  />
                  <StatCard
                    icon={GraduationCap}
                    label={t("total_teachers")}
                    value={stats.total_teachers || 0}
                    colorClass="bg-violet-100 text-violet-700"
                  />
                  <StatCard
                    icon={BookOpen}
                    label={t("total_classes")}
                    value={stats.total_classes || 0}
                    colorClass="bg-rose-100 text-rose-700"
                  />
                  <StatCard
                    icon={Trophy}
                    label={t("grade_a_students")}
                    value={stats.grade_a_students || 0}
                    colorClass="bg-amber-100 text-amber-700"
                  />
                </div>
              </section>
            </ScrollReveal>

            {/* School Information Section */}
            <ScrollReveal variant="fade-up">
              <section id="school-info" className="bg-white rounded-2xl shadow-lg border border-gray-100/80 p-8 scroll-mt-8">
                <SectionHeading icon={School} title={t("school_info")} />

                {principal ? (
                  <div className="mb-8 flex flex-col sm:flex-row gap-6 items-start p-6 bg-school-blue-50 rounded-2xl">
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden ring-4 ring-white/60 shadow-md">
                      <img
                        src={getAvatarUrl(
                          getLocalizedText(principal.name_km, principal.name_en, locale),
                          96
                        )}
                        alt={getLocalizedText(principal.name_km, principal.name_en, locale)}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={cn("text-xl font-bold text-gray-900 flex items-center gap-2", km && "font-khmer")}>
                        {getLocalizedText(principal.name_km, principal.name_en, locale)}
                      </h3>
                      {(principal.position_km || principal.position_en) && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-school-blue-700 bg-white rounded-full px-3 py-1 mt-2">
                          {getLocalizedText(principal.position_km, principal.position_en, locale)}
                        </span>
                      )}
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {principal.phone && (
                          <InfoRow label={t("phone")} value={principal.phone} icon={Phone} />
                        )}
                        {(principal.bio_km || principal.bio_en) && (
                          <InfoRow
                            label={t("position")}
                            value={stripHtml(getLocalizedText(principal.bio_km, principal.bio_en, locale))}
                            icon={GraduationCap}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8 p-6 bg-school-blue-50 rounded-2xl text-sm text-gray-500">
                    {t("principal_info")}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gray-50 rounded-2xl">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-school-blue-700" />
                      {t("location")}
                    </h3>
                    <div className="space-y-3">
                      <InfoRow label={t("address")} value="Kamrieng High School" />
                      <InfoRow label={t("province")} value={process.env.NEXT_PUBLIC_SCHOOL_PROVINCE || "Battambang"} />
                      <InfoRow label={t("school_code")} value="00123456" />
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-2xl">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-school-blue-700" />
                      {t("contact_info")}
                    </h3>
                    <div className="space-y-3">
                      <InfoRow
                        label={t("phone")}
                        value={process.env.NEXT_PUBLIC_SCHOOL_PHONE || "-"}
                        icon={Phone}
                      />
                      <InfoRow
                        label={t("email")}
                        value={process.env.NEXT_PUBLIC_SCHOOL_EMAIL || "-"}
                        icon={Mail}
                      />
                    </div>
                  </div>
                </div>
              </section>
            </ScrollReveal>

            {/* Statistics Section */}
            <ScrollReveal variant="fade-up">
              <section id="statistics" className="bg-white rounded-2xl shadow-lg border border-gray-100/80 p-8 scroll-mt-8">
                <SectionHeading icon={Users} title={t("statistics")} />

                <div className="mb-6 p-5 bg-school-blue-50 rounded-2xl flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{t("academic_year")}</h3>
                  <p className="text-2xl font-bold text-school-blue-800">{stats.academic_year || "2024-2025"}</p>
                </div>

                <DataTable
                  title={t("student_enrollment")}
                  headers={[t("total_students"), t("male_students"), t("female_students"), t("new_students")]}
                  rows={[[
                    String(stats.total_students || 0),
                    String(stats.male_students || 0),
                    String(stats.female_students || 0),
                    String(stats.new_students || 0),
                  ]]}
                />

                <DataTable
                  title={t("staff_information")}
                  headers={[t("total_teachers"), t("total_classes")]}
                  rows={[[
                    String(stats.total_teachers || 0),
                    String(stats.total_classes || 0),
                  ]]}
                />

                <DataTable
                  title={t("academic_data")}
                  headers={[t("grade_a_students"), t("graduation_rate"), t("pass_rate")]}
                  rows={[[
                    String(stats.grade_a_students || 0),
                    stats.graduation_rate ? `${stats.graduation_rate}%` : "-",
                    stats.pass_rate ? `${stats.pass_rate}%` : "-",
                  ]]}
                />
              </section>
            </ScrollReveal>

            {/* Facilities Section */}
            <ScrollReveal variant="fade-up">
              <section id="facilities" className="bg-white rounded-2xl shadow-lg border border-gray-100/80 p-8 scroll-mt-8">
                <SectionHeading icon={Building2} title={t("facilities")} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FacilityCard icon={BookOpen} label={t("classrooms")} value="42" description="Well-equipped classrooms" />
                  <FacilityCard icon={FlaskConical} label={t("laboratories")} value="6" description="Science and computer labs" />
                  <FacilityCard icon={Library} label={t("libraries")} value="2" description="Main and digital libraries" />
                  <FacilityCard icon={Trophy} label={t("sports_facilities")} value="4" description="Sports fields and courts" />
                  <FacilityCard icon={Monitor} label={t("computer_rooms")} value="3" description="Modern computer facilities" />
                </div>
              </section>
            </ScrollReveal>
          </main>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-school-blue-800 text-white p-3 rounded-full shadow-lg hover:bg-school-blue-900 transition-colors z-30"
        aria-label={t("back_to_top")}
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </div>
  );
}

function SectionHeading({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-school-blue-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-school-blue-800" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-school-gold-400/60 to-transparent ml-2" />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  colorClass,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div className="group relative bg-white rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border border-gray-100/80">
      <div className={cn("inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 transition-transform duration-300 group-hover:scale-110", colorClass)}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-2xl md:text-3xl font-bold text-school-blue-800 tabular-nums">
        {value.toLocaleString("en-US")}
      </p>
      <p className="text-sm text-gray-500 mt-1 font-medium">{label}</p>
    </div>
  );
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: string; icon?: LucideIcon }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-sm text-gray-500 min-w-[90px] flex-shrink-0">{label}:</span>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {Icon && <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />}
        <span className="text-sm font-medium text-gray-900 break-words">{value}</span>
      </div>
    </div>
  );
}

function DataTable({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return (
    <div className="mb-8">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-school-blue-800 text-white">
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-school-blue-50/40 transition-colors">
                {row.map((cell, ci) => (
                  <td key={ci} className={cn("px-4 py-3", ci === 0 ? "font-semibold text-gray-900" : "text-gray-600")}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FacilityCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="bg-gray-50 rounded-2xl p-5 hover:bg-school-blue-50/50 transition-colors border border-gray-100/80">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 bg-school-blue-100 rounded-xl">
          <Icon className="w-5 h-5 text-school-blue-800" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{label}</h4>
          <p className="text-2xl font-bold text-school-blue-800">{value}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
