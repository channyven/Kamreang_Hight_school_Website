"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Info,
  Clock,
  Users,
  UserCheck,
  Building2,
  Wallet,
  AlertTriangle,
  Rocket,
  ArrowUp,
  ClipboardCheck,
  Book,
  FileText,
  Award,
  Trophy,
  Calendar,
  Building,
  BarChart2,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { cn, formatNumber } from "@/utils";
import { localize, type SchoolReport } from "@/lib/report-data";
import type { Locale } from "@/i18n/config";

const ICONS: Record<string, LucideIcon> = {
  Info,
  Clock,
  Users,
  UserCheck,
  Building2,
  Wallet,
  AlertTriangle,
  Rocket,
  ClipboardCheck,
  Book,
  FileText,
  Award,
  Trophy,
  Calendar,
  Building,
  BarChart2,
  BookOpen,
};

export function getSectionIcon(name: string): LucideIcon {
  return ICONS[name] ?? Info;
}

/** Shared section wrapper: anchor target + animated heading. */
export function SectionShell({
  id,
  title,
  icon,
  children,
}: {
  id: string;
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  const Icon = icon;
  return (
    <section id={id} className="scroll-mt-28 py-10 border-t border-gray-100 first:border-t-0">
      <div className="flex items-center gap-3 mb-6">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-school-blue-50 text-school-blue-800 shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-school-blue-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

// ─── General Information ─────────────────────────────────────

export function GeneralInfoSection({
  data,
  locale,
}: {
  data: SchoolReport["general"];
  locale: Locale;
}) {
  const facts = [
    { label: locale === "km" ? "ឆ្នាំសិក្សា" : "Academic Year", value: localize(data.academicYear, locale) },
    { label: locale === "km" ? "នាយកសាលា" : "Principal", value: localize(data.principal, locale) },
    { label: locale === "km" ? "បុគ្គលិកសរុប" : "Total Staff", value: formatNumber(data.totalStaff, locale) },
    { label: locale === "km" ? "សិស្សសរុប" : "Total Students", value: formatNumber(data.totalStudents, locale) },
    { label: locale === "km" ? "ថ្នាក់រៀន" : "Classes", value: formatNumber(data.totalClasses, locale) },
    { label: locale === "km" ? "ផ្ទៃក្រឡាដី" : "Land Area", value: `${formatNumber(data.landAreaSqm, locale)} m²` },
    { label: locale === "km" ? "បង្កើតឡើង" : "Established", value: formatNumber(data.establishedYear, locale) },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {facts.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
          >
            <p className="text-xs text-gray-500 mb-1">{f.label}</p>
            <p className={cn("text-base font-semibold text-school-blue-900", locale === "km" && "font-khmer")}>
              {f.value}
            </p>
          </motion.div>
        ))}
      </div>
      <div className="bg-school-blue-800 rounded-xl p-5 text-white flex flex-col justify-center">
        <p className="text-xs uppercase tracking-wider text-school-gold-400 mb-2">
          {locale === "km" ? "សង្ខេប" : "Summary"}
        </p>
        <p className={cn("text-sm leading-relaxed", locale === "km" && "font-khmer")}>
          {localize(data.summary, locale)}
        </p>
      </div>
    </div>
  );
}

// ─── Teaching Hours ─────────────────────────────────────────

export function TeachingHoursSection({
  data,
  locale,
}: {
  data: SchoolReport["teachingHours"];
  locale: Locale;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500">
              <th className="text-left font-medium px-4 py-3">
                {locale === "km" ? "ម៉ោង" : "Period"}
              </th>
              <th className="text-left font-medium px-4 py-3">
                {locale === "km" ? "ពេលវេលា" : "Time"}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.dailySchedule.map((s, i) => (
              <tr key={i} className="border-t border-gray-100">
                <td className={cn("px-4 py-3 text-gray-800", locale === "km" && "font-khmer")}>
                  {localize(s.period, locale)}
                </td>
                <td className="px-4 py-3 text-gray-600 tabular-nums">{s.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-amber-50 rounded-xl border border-amber-100 p-5 flex flex-col justify-center">
        <p className="text-3xl font-bold text-school-gold-600">
          {formatNumber(data.weeklyHours, locale)}
          <span className="text-base font-medium text-gray-500 ml-1">
            {locale === "km" ? "ម៉ោង/សប្តាហ៍" : "hrs/week"}
          </span>
        </p>
        <p className={cn("text-sm text-gray-600 mt-2 leading-relaxed", locale === "km" && "font-khmer")}>
          {localize(data.notes, locale)}
        </p>
      </div>
    </div>
  );
}

// ─── Regular Testing ───────────────────────────────────────

export function RegularTestingSection({
  data,
  locale,
}: {
  data: SchoolReport["regularTesting"];
  locale: Locale;
}) {
  const items = [
    { label: { km: "ការប្រលងប្រចាំខែ", en: "Monthly Tests" }, value: data.monthlyTests },
    { label: { km: "ការប្រលងឆមាស", en: "Semester Exams" }, value: data.semesterTests },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
        >
          <p className="text-sm font-semibold text-school-blue-900 mb-1">{localize(item.label, locale)}</p>
          <p className="text-sm text-gray-600">{localize(item.value, locale)}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ─── School, Teacher & Student Planning ───────────────────

export function PlanningSection({
  data,
  locale,
}: {
  data: SchoolReport["planning"];
  locale: Locale;
}) {
  const items = [
    { label: { km: "ផែនការកែលម្អសាលា", en: "School Improvement Plan" }, value: data.schoolImprovementPlan },
    { label: { km: "ផែនការអភិវឌ្ឍន៍គ្រូ", en: "Teacher Development Plan" }, value: data.teacherDevelopmentPlan },
    { label: { km: "ផែនការគាំទ្រសិស្ស", en: "Student Support Plan" }, value: data.studentSupportPlan },
  ];
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
        >
          <p className="text-sm font-semibold text-school-blue-900 mb-1">{localize(item.label, locale)}</p>
          <p className="text-sm text-gray-600">{localize(item.value, locale)}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Annual Work Agreements ───────────────────────────────

export function AgreementsSection({
  data,
  locale,
}: {
  data: SchoolReport["agreements"];
  locale: Locale;
}) {
  const items = [
    { label: { km: "កិច្ចសន្យាគ្រូបង្រៀន", en: "Teacher Contracts" }, value: data.teacherContracts },
    { label: { km: "ភាពជាដៃគូសហគមន៍", en: "Community Partnerships" }, value: data.communityPartnerships },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
        >
          <p className="text-sm font-semibold text-school-blue-900 mb-1">{localize(item.label, locale)}</p>
          <p className="text-sm text-gray-600">{localize(item.value, locale)}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Self-Assessment — Model School Standards ─────────────

export function SelfAssessmentSection({
  data,
  locale,
}: {
  data: SchoolReport["selfAssessment"];
  locale: Locale;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <p className="text-sm text-gray-600 mb-2">{localize(data.modelSchoolStandard, locale)}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-4xl font-bold text-school-blue-800">{data.score}</p>
        <p className="text-xl font-medium text-gray-400">/ {data.maxScore}</p>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {locale === 'km' ? 'វាយតម្លៃចុងក្រោយ: ' : 'Last assessed: '}
        {localize(data.lastAssessmentDate, locale)}
      </p>
    </div>
  );
}

// ─── Awards & Recognitions ────────────────────────────────

export function AwardsSection({
  data,
  locale,
}: {
  data: SchoolReport["awards"];
  locale: Locale;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.awards.map((award, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          className="bg-white rounded-xl border-l-4 border-l-school-gold-500 shadow-sm p-5"
        >
          <p className="text-sm font-semibold text-school-blue-900">{localize(award.title, locale)}</p>
          <p className="text-sm text-gray-500">{award.year}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Teaching-Hour Timetables by Grade ───────────────────

export function TimetablesSection({
  data,
  locale,
}: {
  data: SchoolReport["timetables"];
  locale: Locale;
}) {
  const grades = [
    { label: "Grade 7", value: data.grade7 },
    { label: "Grade 8", value: data.grade8 },
    { label: "Grade 9", value: data.grade9 },
    { label: "Grade 10", value: data.grade10 },
    { label: "Grade 11", value: data.grade11 },
    { label: "Grade 12", value: data.grade12 },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {grades.map((grade, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center"
        >
          <p className="font-semibold text-school-blue-900">{grade.label}</p>
          <p className="text-sm text-gray-600 mt-1">{localize(grade.value, locale)}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Student Statistics ─────────────────────────────────────

export function StudentStatsSection({
  data,
  locale,
}: {
  data: SchoolReport["studentStats"];
  locale: Locale;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {data.items.map((item, i) => (
          <motion.div
            key={item.label.en}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center"
          >
            <p className="text-2xl font-bold text-school-blue-800 tabular-nums">
              {formatNumber(item.value, locale)}
              {item.suffix ?? ""}
            </p>
            <p className={cn("text-xs text-gray-500 mt-1", locale === "km" && "font-khmer")}>
              {localize(item.label, locale)}
            </p>
          </motion.div>
        ))}
      </div>
      <p className={cn("text-sm text-gray-500", locale === "km" && "font-khmer")}>
        {localize(data.notes, locale)}
      </p>
    </div>
  );
}

// ─── Feeder Schools ─────────────────────────────────────────

export function FeederSchoolsSection({
  data,
  locale,
}: {
  data: SchoolReport["feederSchools"];
  locale: Locale;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {data.schools.map((school, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
        >
          <p className="text-sm font-semibold text-school-blue-900 mb-1">{localize(school.name, locale)}</p>
          <p className="text-lg font-bold text-school-blue-800">{school.studentCount} students</p>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Academic Results ───────────────────────────────────────

export function AcademicResultsSection({
  data,
  locale,
}: {
  data: SchoolReport["academicResults"];
  locale: Locale;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-school-blue-900 mb-1">Grade 9 Pass Rate</p>
        <p className="text-4xl font-bold text-school-blue-800">{data.grade9PassRate}%</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-school-blue-900 mb-1">Grade 12 Pass Rate</p>
        <p className="text-4xl font-bold text-school-blue-800">{data.grade12PassRate}%</p>
      </div>
      <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-school-blue-900 mb-2">Top Students</p>
        <ul className="space-y-2">
          {data.topStudents.map((student, i) => (
            <li key={i} className="flex justify-between">
              <span className="text-sm text-gray-700">{student.name}</span>
              <span className="text-sm font-bold text-school-blue-800">{student.score}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Staff Status ───────────────────────────────────────────

export function StaffStatusSection({
  data,
  locale,
}: {
  data: SchoolReport["staffStatus"];
  locale: Locale;
}) {
  const total = data.reduce((sum, s) => sum + s.count, 0);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {data.map((s, i) => {
        const pct = total ? Math.round((s.count / total) * 100) : 0;
        return (
          <motion.div
            key={s.label.en}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
          >
            <div className={cn("inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3", s.color)}>
              <UserCheck className="w-5 h-5" />
            </div>
            <p className={cn("text-sm text-gray-500", locale === "km" && "font-khmer")}>
              {localize(s.label, locale)}
            </p>
            <p className="text-2xl font-bold text-school-blue-900 tabular-nums">
              {formatNumber(s.count, locale)}
            </p>
            <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-school-blue-600 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1 tabular-nums">{pct}%</p>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Facilities & Textbook Status ───────────────────────────

export function FacilitiesSection({
  data,
  locale,
}: {
  data: SchoolReport["facilities"];
  locale: Locale;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-school-blue-900 mb-4">
          {locale === "km" ? "ហេដ្ឋារចនាសម្ព័ន្ធ" : "Infrastructure"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.items.map((item, i) => (
            <motion.div
              key={item.label.en}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex gap-4 items-start"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className={cn("text-sm font-semibold text-school-blue-900", locale === "km" && "font-khmer")}>
                  {localize(item.label, locale)}
                </p>
                <p className={cn("text-sm text-gray-500 mt-0.5", locale === "km" && "font-khmer")}>
                  {localize(item.detail, locale)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-school-blue-900 mb-4">
          {locale === "km" ? "ស្ថានភាពសៀវភៅសិក្សា" : "Textbook Status"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.textbookStatus.map((item, i) => (
            <motion.div
              key={item.subject.en}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
            >
              <p className={cn("text-sm font-semibold text-school-blue-900", locale === "km" && "font-khmer")}>
                {localize(item.subject, locale)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {locale === "km" ? `សិស្ស ${item.studentRatio} នាក់ក្នុងមួយក្បាល` : `${item.studentRatio} students per book`}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
       <p className={cn("text-sm text-gray-500 pt-4", locale === "km" && "font-khmer")}>
        {localize(data.notes, locale)}
      </p>
    </div>
  );
}


// ─── Budget ─────────────────────────────────────────────────

export function BudgetSection({
  data,
  locale,
}: {
  data: SchoolReport["budget"];
  locale: Locale;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500">Total Budget (FY 2023-2024)</p>
            <p className="text-2xl font-bold text-school-blue-900">{formatNumber(data.totalBudget, locale)} {data.currency}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500">Community Support</p>
            <p className="text-2xl font-bold text-school-blue-900">{formatNumber(data.communitySupport, locale)} {data.currency}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500">Remaining Balance</p>
            <p className="text-2xl font-bold text-emerald-600">{formatNumber(data.remainingBalance, locale)} {data.currency}</p>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-school-blue-900 my-4">
            {locale === "km" ? "ការបែងចែកចំណាយ" : "Expenditure Breakdown"}
        </h3>
        <div className="space-y-3">
            {data.expenditure.map((item, i) => {
            const pct = data.totalBudget ? Math.round((item.amount / data.totalBudget) * 100) : 0;
            return (
                <motion.div
                key={item.label.en}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
                >
                <div className="flex items-center justify-between mb-2">
                    <p className={cn("text-sm font-medium text-gray-800", locale === "km" && "font-khmer")}>
                    {localize(item.label, locale)}
                    </p>
                    <p className="text-sm font-bold text-school-blue-900 tabular-nums">
                    {formatNumber(item.amount, locale)} {data.currency}
                    </p>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full bg-school-gold-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                </motion.div>
            );
            })}
        </div>
      </div>
      <p className={cn("text-sm text-gray-500 pt-4", locale === "km" && "font-khmer")}>
        {localize(data.notes, locale)}
      </p>
    </div>
  );
}

// ─── Challenges ─────────────────────────────────────────────

export function ChallengesSection({
  data,
  locale,
}: {
  data: SchoolReport["challenges"];
  locale: Locale;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {data.map((c, i) => (
        <motion.div
          key={c.title.en}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 border-l-4 border-l-rose-400"
        >
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-rose-100 text-rose-600 mb-3">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className={cn("text-sm font-semibold text-school-blue-900 mb-1", locale === "km" && "font-khmer")}>
            {localize(c.title, locale)}
          </p>
          <p className={cn("text-sm text-gray-500 leading-relaxed", locale === "km" && "font-khmer")}>
            {localize(c.detail, locale)}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Future Direction ───────────────────────────────────────

export function FutureDirectionSection({
  data,
  locale,
}: {
  data: SchoolReport["futureDirection"];
  locale: Locale;
}) {
  return (
    <ol className="space-y-3">
      {data.map((item, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
          className="flex gap-4 items-start bg-white rounded-xl border border-gray-100 shadow-sm p-4"
        >
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-school-blue-800 text-white text-sm font-bold shrink-0">
            {i + 1}
          </span>
          <p className={cn("text-sm text-gray-700 leading-relaxed", locale === "km" && "font-khmer")}>
            {localize(item, locale)}
          </p>
        </motion.li>
      ))}
    </ol>
  );
}

// ─── Back to top ────────────────────────────────────────────

export function BackToTop({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-school-blue-700 hover:text-school-gold-600 transition-colors"
    >
      <ArrowUp className="w-4 h-4" />
      {label}
    </button>
  );
}
