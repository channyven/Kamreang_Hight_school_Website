"use client";

import Image from "next/image";
import { useMemo, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Target,
  ArrowRight,
  Quote,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Crown,
  Handshake,
  Telescope,
  Star,
  HeartHandshake,
  X,
  Search,
} from "lucide-react";
import { cn, getLocalizedText, getAvatarUrl } from "@/utils";
import type { SchoolInfo, Leadership, Milestone, Teacher, Statistics } from "@/types";
import OrganizationSection from "./OrganizationSection";
import ScrollReveal from "./ScrollReveal";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// ─── Animated Counter Hook ────────────────────────────────────

function useCounter(target: number, active: boolean, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, active, duration]);

  return count;
}

/** Check if a URL is a valid http/https URL — rejects file://, blob:, data:, etc. */
function isValidUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  return url.startsWith("http://") || url.startsWith("https://");
}

/** Strip common Khmer honorific prefixes from a name for matching */
function stripHonorific(name: string): string {
  // Remove zero-width characters FIRST (they can be embedded IN the prefix)
  const cleaned = name.trim().replace(/[\u200B-\u200D\uFEFF]/g, "");
  const prefixes = ["លោក", "លោកស្រី", "អ្នកគ្រូ", "អ្នកស្រី", "អ្នក"];
  for (const prefix of prefixes) {
    if (cleaned.startsWith(prefix)) {
      return cleaned.slice(prefix.length).trim();
    }
  }
  return cleaned;
}

// ─── Data ──────────────────────────────────────────────────────

interface StatConfig {
  icon: React.ReactNode;
  label: string;
  color: string;
  /** Raw numeric value to animate from 0 */
  getNumericValue: (s: Statistics) => number;
  /** Suffix appended after the animated number (e.g. " m²", "%") */
  suffix: string;
  /** Optional formatter for the number portion (commas, decimals) */
  formatNumber?: (n: number) => string;
  /** Whether to skip counter animation (show value instantly) */
  instant?: boolean;
}

const STAT_HEADERS: Record<string, StatConfig> = {
  established: {
    icon: <Calendar className="w-5 h-5" />,
    label: "Established",
    color: "bg-amber-100 text-amber-700",
    getNumericValue: () => 2000,
    suffix: "",
    instant: true,
  },
  landArea: {
    icon: <MapPin className="w-5 h-5" />,
    label: "Land Area",
    color: "bg-emerald-100 text-emerald-700",
    getNumericValue: () => 21253,
    suffix: " m²",
    formatNumber: (n) => n.toLocaleString("en-US"),
  },
  students: {
    icon: <Users className="w-5 h-5" />,
    label: "Students",
    color: "bg-blue-100 text-blue-700",
    getNumericValue: (s) => s.total_students ?? 0,
    suffix: "",
    formatNumber: (n) => n.toLocaleString("en-US"),
  },
  teachers: {
    icon: <GraduationCap className="w-5 h-5" />,
    label: "Teachers",
    color: "bg-violet-100 text-violet-700",
    getNumericValue: (s) => s.total_teachers ?? 0,
    suffix: "",
  },
  classes: {
    icon: <BookOpen className="w-5 h-5" />,
    label: "Classes",
    color: "bg-rose-100 text-rose-700",
    getNumericValue: (s) => s.total_classes ?? 0,
    suffix: "",
  },
  passRate: {
    icon: <TrendingUp className="w-5 h-5" />,
    label: "BAC Pass Rate",
    color: "bg-cyan-100 text-cyan-700",
    getNumericValue: (s) => s.pass_rate ?? s.graduation_rate ?? 0,
    suffix: "%",
    formatNumber: (n) => n.toFixed(1),
  },
};



// ─── Sub-components ────────────────────────────────────────────

function AnimatedStatCard({
  icon,
  label,
  color,
  numericValue,
  suffix,
  formatNum,
  delay,
  instant,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  numericValue: number;
  suffix: string;
  formatNum?: (n: number) => string;
  delay: number;
  instant?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIsInView(ref);
  const animatedCount = useCounter(numericValue, isVisible);
  const count = instant ? numericValue : animatedCount;

  // Format the number portion
  const displayNum = formatNum
    ? formatNum(count)
    : Math.floor(count).toString();

  return (
    <ScrollReveal delay={delay} duration={0.5} variant="fade-up">
      <div
        ref={ref}
        className="group relative bg-white rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border border-gray-100/80"
      >
        <div
          className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 transition-transform duration-300 group-hover:scale-110 ${color}`}
        >
          {icon}
        </div>
        <p className="text-2xl md:text-3xl font-bold text-school-blue-800 counter-value tabular-nums">
          {instant ? (
            displayNum + suffix
          ) : (
            <>
              <span className="tabular-nums">{displayNum}</span>
              {suffix}
            </>
          )}
        </p>
        <p className="text-sm text-gray-500 mt-1 font-medium">{label}</p>
      </div>
    </ScrollReveal>
  );
}

/** Simplified in-view detection hook — returns true once the element enters the viewport */
function useIsInView(ref: React.RefObject<HTMLDivElement | null>) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return inView;
}

function SectionHeading({
  khmer,
  english,
  subtitle,
}: {
  khmer: string;
  english: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-12">
      <p className="font-khmer text-3xl md:text-4xl mb-1 text-school-blue-800">{khmer}</p>
      <h2 className="text-2xl font-bold text-gray-900">{english}</h2>
      {subtitle && (
        <p className="text-xs tracking-[0.2em] uppercase font-medium text-gray-400 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── Leader Detail Dialog ─────────────────────────────────────

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

function LeaderDetailDialog({
  leader,
  open,
  onOpenChange,
  km,
  locale,
}: {
  leader: Leadership | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  km: boolean;
  locale: string;
}) {
  if (!leader) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header with photo and name */}
        <div className="bg-gradient-to-r from-school-blue-800 to-school-blue-700 px-6 pt-8 pb-6 text-center">
          <div className="relative w-24 h-24 mx-auto rounded-2xl overflow-hidden ring-4 ring-white/30 shadow-xl mb-4">
            {isValidUrl(leader.photo_url) ? (
              <Image
                src={leader.photo_url}
                alt={leader.name_en}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <Image
                src={getAvatarUrl(leader.name_en, 96)}
                alt={leader.name_en}
                fill
                className="object-cover"
                sizes="96px"
              />
            )}
          </div>
          <DialogTitle className={cn("text-xl font-bold text-white mb-0.5", km && "font-khmer")}>
            <span>{leader.name_en}</span>
            {leader.gender && (
              <span className="text-lg text-white/80">{leader.gender}</span>
            )}
          </DialogTitle>
          {(leader.position_km || leader.position_en) && (
            <DialogDescription className={cn("inline-flex items-center gap-1.5 text-xs text-white/80 bg-white/15 rounded-full px-4 py-1.5 mt-1", km && "font-khmer")}>
              {getLocalizedText(leader.position_km, leader.position_en, locale)}
            </DialogDescription>
          )}
        </div>

        {/* Details body */}
        <div className="px-6 py-5 space-y-3">
          {/* Phone */}
          {leader.phone && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80">
              <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Phone className="w-4 h-4 text-gray-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 mb-0.5">
                  {km ? "ទូរស័ព្ទ" : "Phone"}
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {leader.phone}
                </p>
              </div>
            </div>
          )}

          {/* Title */}
          {(leader.title_km || leader.title_en) && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-school-blue-50/50">
              <div className="w-9 h-9 rounded-lg bg-school-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <GraduationCap className="w-4 h-4 text-school-blue-700" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-school-blue-500 mb-0.5">
                  {km ? "តួនាទី" : "Position"}
                </p>
                <p className={cn("text-sm font-medium text-gray-800", km && "font-khmer")}>
                  {getLocalizedText(leader.title_km, leader.title_en, locale)}
                </p>
              </div>
            </div>
          )}

          {/* Bio */}
          {(leader.bio_km || leader.bio_en) && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/60">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Quote className="w-4 h-4 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-amber-500 mb-0.5">
                  {km ? "ជីវប្រវត្តិ" : "Biography"}
                </p>
                <p className={cn("text-sm leading-relaxed text-gray-600 italic", km && "font-khmer")}>
                  &ldquo;{getLocalizedText(leader.bio_km, leader.bio_en, locale)}&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Staff Card ────────────────────────────────────────────

function StaffCard({ teacher, km }: { teacher: Teacher; km: boolean }) {
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
            "font-semibold text-sm leading-tight truncate transition-colors group-hover:text-[#00376f]",
            km && "font-khmer"
          )}
          style={{ color: "#0d1c2f" }}
        >
          <span>{teacher.name_km || teacher.name_en}</span>
          {teacher.gender && (
            <span className="inline-block ml-0.5 text-[9px] opacity-50">
              {teacher.gender === "Male" ? "♂" : "♀"}
            </span>
          )}
        </h4>
        <p className={cn("text-xs leading-snug truncate", km && "font-khmer")} style={{ color: "#434750" }}>
          {teacher.department_km || teacher.subject_km || teacher.department_en || teacher.subject_en || (km ? "គ្រូបង្រៀន" : "Teacher")}
        </p>
      </button>

      {/* ─── Detail Dialog ─── */}
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

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center text-white/70 hover:bg-black/50 hover:text-white transition-all z-10"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Minimal overlay: Name + Gender + Subject·Role + Phone */}
            <div className="absolute bottom-0 left-0 right-0 p-5 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cn("text-xl md:text-2xl font-bold text-white tracking-tight", km && "font-khmer")}>
                  {teacher.name_km || teacher.name_en}
                </h3>
                {teacher.gender && (
                  <span className="text-xs font-medium text-white/80">
                    {teacher.gender === "Male" ? "♂" : "♀"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/80">
                <span className="text-school-goldMain font-semibold">
                  {teacher.subject_km || teacher.subject_en}
                </span>
                <span className="text-white/40">·</span>
                <span>
                  {teacher.department_km || teacher.department_en || (km ? "គ្រូបង្រៀន" : "Teacher")}
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

// ─── Main Component ────────────────────────────────────────────

interface AboutPageClientProps {
  schoolInfo: SchoolInfo[];
  leadership: Leadership[];
  teachers: Teacher[];
  milestones: Milestone[];
  statistics: Statistics | null;
  locale: string;
}

export default function AboutPageClient({
  schoolInfo,
  leadership,
  teachers,
  milestones,
  statistics,
  locale,
}: AboutPageClientProps) {
  const km = locale === "km";

  const infoMap = useMemo(
    () => Object.fromEntries(schoolInfo.map((i) => [i.section, i])),
    [schoolInfo]
  );

  const leaders = useMemo(
    () =>
      leadership
        .filter((l) => l.is_active)
        .sort((a, b) => a.sort_order - b.sort_order),
    [leadership]
  );
  const principal = leaders[0];
  const [selectedLeader, setSelectedLeader] = useState<Leadership | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'leadership' | 'teachers'>('all');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');

  const filteredStaff = useMemo(() => {
    let list = teachers.filter(t => t.is_active);
    if (activeFilter === 'leadership') {
      // Build set of cleaned leadership names (strip honorific prefixes)
      // Include ALL leadership members (principal + vice principals)
      const leaderNames = new Set(
        leadership.map(l => stripHonorific(l.name_km))
      );
      list = list.filter(t => leaderNames.has(t.name_km));
    }
    if (staffSearchQuery.trim()) {
      const q = staffSearchQuery.trim().toLowerCase();
      list = list.filter(t =>
        (t.name_km ?? '').toLowerCase().includes(q) ||
        (t.subject_km ?? '').toLowerCase().includes(q) ||
        (t.department_km ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [teachers, leadership, activeFilter, staffSearchQuery]);

  const vision = infoMap["vision"];
  const mission = infoMap["mission"];
  const history = infoMap["history"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9ff] via-white to-[#f8f9ff] overflow-x-hidden">
      {/* ─── HERO ─── */}
      <ScrollReveal variant="fade-in" duration={0.8}>
        <section className="relative pt-24 pb-20 overflow-hidden">
          {/* Banner Image Background */}
          <div className="absolute inset-0">
            <Image
              src="/images/about/banner%20about%20page.png"
              alt="School banner"
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-school-blue-900/85 via-school-blue-800/75 to-school-blue-900/85" />
          </div>

          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <div className="relative container mx-auto px-6 text-center max-w-4xl">
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="font-khmer text-xl md:text-2xl mb-3 text-school-gold-400"
            >
              អំពីសាលារបស់យើង
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className={cn(
                "text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5",
                km && "font-khmer"
              )}
            >
              {km ? "អំពីសាលារៀន" : "About School"}
            </motion.h1>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
              className="w-20 h-1 bg-school-gold-400 rounded-full mx-auto mb-6"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className={cn(
                "text-base md:text-lg text-white/80 leading-relaxed max-w-2xl mx-auto",
                km && "font-khmer"
              )}
            >
              {km
                ? "សាលារៀនសាធារណៈនៅស្រុកកំរៀង ខេត្តបាត់ដំបង បម្រើសហគមន៍ជនបទនេះតាំងពីឆ្នាំ ២០០០ ប្ដេជ្ញាពង្រីកលទ្ធភាពទទួលបានការអប់រំប្រកបដោយគុណភាពសម្រាប់សិស្សគ្រប់រូប។"
                : "A public secondary school in Kamrieng district, Battambang province, serving this rural community since 2000, committed to expanding access to quality education for every student."}
            </motion.p>
          </div>

          {/* Bottom wave */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
            <svg viewBox="0 0 1440 40" fill="none" className="w-full">
              <path
                d="M0 40L1440 40L1440 12C1200 36 960 44 720 32C480 20 240 0 0 12L0 40Z"
                fill="#f8f9ff"
              />
            </svg>
          </div>
        </section>
      </ScrollReveal>

      {/* ─── STATISTICS ─── */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal variant="fade-up">
            <SectionHeading
              khmer="ស្ថិតិសាលារៀន"
              english="School at a Glance"
            />
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(STAT_HEADERS).map(([key, config]) => {
              const numericValue = statistics
                ? config.getNumericValue(statistics)
                : 0;
              return (
                <AnimatedStatCard
                  key={key}
                  icon={config.icon}
                  label={config.label}
                  color={config.color}
                  numericValue={numericValue}
                  suffix={config.suffix}
                  formatNum={config.formatNumber}
                  instant={config.instant}
                  delay={Object.keys(STAT_HEADERS).indexOf(key) * 0.08}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── VISION / MISSION / VALUES ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal variant="fade-up">
            <div className="text-center mb-16">
              <p className="text-xs tracking-[0.25em] uppercase font-bold text-school-goldMain mb-3">
                {km ? "ទិសដៅរបស់យើង" : "OUR DIRECTION"}
              </p>
              <h2 className={cn("text-4xl md:text-5xl font-extrabold text-school-navy mb-5 tracking-tight", km && "font-khmer")}>
                {km ? "ចក្ខុវិស័យ និងបេសកកម្ម" : "Vision & Mission"}
              </h2>
              <div className="w-14 h-1.5 bg-school-goldMain mx-auto rounded-full" />
            </div>
          </ScrollReveal>

          {/* Vision + Mission row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
            {/* Vision */}
            <ScrollReveal variant="fade-up" delay={0.1}>
              <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 h-full border-l-[6px] border-l-school-goldMain">
                <div className="p-10 md:p-12">
                  <div className="mb-10">
                    <div className="w-20 h-20 rounded-2xl bg-[#fff9eb] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 mb-8">
                      <Telescope className="w-10 h-10 text-school-goldMain" />
                    </div>
                    <h3 className={cn("text-2xl md:text-3xl font-bold text-school-navy", km && "font-khmer")}>
                      {km ? "ចក្ខុវិស័យរបស់យើង" : "Our Vision"}
                    </h3>
                  </div>
                  <div
                    className={cn(
                      "prose prose-lg max-w-prose prose-headings:text-school-blue-900 prose-a:text-school-blue-700",
                      km ? "prose-khmer font-khmer" : "prose-english"
                    )}
                    dangerouslySetInnerHTML={{
                      __html: vision
                        ? getLocalizedText(vision.content_km, vision.content_en, locale)
                        : "",
                    }}
                  />
                </div>
              </div>
            </ScrollReveal>

            {/* Mission */}
            <ScrollReveal variant="fade-up" delay={0.2}>
              <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 h-full border-l-[6px] border-l-[#1e3a8a]">
                <div className="p-10 md:p-12">
                  <div className="mb-10">
                    <div className="w-20 h-20 rounded-2xl bg-[#eff4ff] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 mb-8">
                      <Target className="w-10 h-10 text-[#1e3a8a]" />
                    </div>
                    <h3 className={cn("text-2xl md:text-3xl font-bold text-school-navy", km && "font-khmer")}>
                      {km ? "បេសកកម្មរបស់យើង" : "Our Mission"}
                    </h3>
                  </div>
                  <div
                    className={cn(
                      "prose prose-lg max-w-prose prose-headings:text-school-blue-900 prose-a:text-school-blue-700",
                      km ? "prose-khmer font-khmer" : "prose-english"
                    )}
                    dangerouslySetInnerHTML={{
                      __html: mission
                        ? getLocalizedText(mission.content_km, mission.content_en, locale)
                        : "",
                    }}
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Core Values row */}
          <div className="mt-20">
            <ScrollReveal variant="fade-up" delay={0.25}>
              <div className="text-center mb-16">
                <p className="text-xs tracking-[0.25em] uppercase font-bold text-school-goldMain mb-3">
                  {km ? "អ្វីដែលយើងប្រកាន់ខ្ជាប់" : "WHAT WE STAND FOR"}
                </p>
                <h2 className={cn("text-4xl md:text-5xl font-extrabold text-school-navy mb-5 tracking-tight", km && "font-khmer")}>
                  {km ? "គុណតម្លៃស្នូលរបស់យើង" : "Our Core Values"}
                </h2>
                <div className="w-14 h-1.5 bg-school-goldMain mx-auto rounded-full" />
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  en: "Integrity",
                  km: "សុច្ចរិតភាព",
                  icon: Handshake,
                  desc_en: "We act with honesty, transparency, and strong moral principles in all our interactions and decisions.",
                  desc_km: "យើងប្រព្រឹត្តដោយភាពស្មោះត្រង់ តម្លាភាព និងគោលការណ៍សីលធម៌រឹងមាំក្នុងគ្រប់អន្តរកម្ម និងការសម្រេចចិត្តរបស់យើង។",
                },
                {
                  en: "Excellence",
                  km: "ឧត្តមភាព",
                  icon: Star,
                  desc_en: "We pursue the highest standards in everything we do, in academics, character, and service to our community.",
                  desc_km: "យើងខិតខំសម្រេចបាននូវស្តង់ដារខ្ពស់បំផុតក្នុងគ្រប់កិច្ចការដែលយើងធ្វើ ទាំងការសិក្សា ចរិតលក្ខណៈ និងការបម្រើសហគមន៍របស់យើង។",
                },
                {
                  en: "Dignity",
                  km: "សេចក្តីថ្លៃថ្នូរ",
                  icon: Crown,
                  desc_en: "We treat everyone with honor and respect, valuing the inherent worth of every individual in our school.",
                  desc_km: "យើងប្រព្រឹត្តចំពោះអ្នកគ្រប់គ្នាដោយកិត្តិយស និងការគោរព ដោយផ្តល់តម្លៃដល់សេចក្តីថ្លៃថ្នូររបស់បុគ្គលម្នាក់ៗនៅក្នុងសាលារបស់យើង។",
                },
                {
                  en: "Mutual Respect",
                  km: "ការគោរពគ្នាទៅវិញទៅមក",
                  icon: HeartHandshake,
                  desc_en: "We honor diversity and value every voice, fostering a supportive environment built on understanding.",
                  desc_km: "យើងផ្តល់កិត្តិយសដល់ភាពចម្រុះ និងផ្តល់តម្លៃដល់គ្រប់សំឡេង ដោយជំរុញបរិយាកាសគាំទ្រដែលបង្កើតឡើងលើការយោគយល់គ្នា។",
                },
              ].map((v, i) => {
                const ValueIcon = v.icon;
                return (
                  <ScrollReveal key={v.en} variant="fade-up" delay={0.3 + i * 0.1}>
                    <div className="group bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 h-full flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-10 transition-all duration-500 group-hover:scale-110 group-hover:bg-[#fff9eb] group-hover:shadow-lg group-hover:shadow-school-goldMain/10">
                        <ValueIcon className="w-10 h-10 text-school-goldMain transition-transform duration-500 group-hover:rotate-12" />
                      </div>
                      <h4 className={cn("text-2xl font-bold text-school-navy mb-5", km && "font-khmer")}>
                        {km ? v.km : v.en}
                      </h4>
                      <p className={cn("text-[15px] text-gray-500 leading-relaxed font-medium", km && "font-khmer")}>
                        {km ? v.desc_km : v.desc_en}
                      </p>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── HISTORY ─── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal variant="fade-up">
            <SectionHeading
              khmer="ប្រវត្តិ​សាលា"
              english="School History"
            />
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ScrollReveal variant="fade-left" delay={0.1} className="h-full">
              <div className="h-full flex flex-col justify-center">
                <div
                  className={cn(
                    "prose prose-base max-w-prose mb-4 prose-headings:text-school-blue-900 prose-a:text-school-blue-700",
                    km ? "prose-khmer font-khmer" : "prose-english"
                  )}
                  dangerouslySetInnerHTML={{
                    __html: history
                      ? getLocalizedText(history.content_km, history.content_en, locale)
                      : "",
                  }}
                />
                <a
                  href="#"
                  className={cn(
                    "inline-flex items-center gap-1.5 text-sm font-semibold group text-school-blue-800 hover:text-school-blue-600 transition-colors",
                    km && "font-khmer"
                  )}
                >
                  {km ? "ស្វែងយល់បន្ថែម" : "Learn more about our archives"}
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </ScrollReveal>

            {/* Image: Real school photo */}
            <ScrollReveal variant="fade-right" delay={0.2} className="h-full">
              <div className="relative rounded-2xl overflow-hidden group cursor-pointer h-full min-h-[260px] shadow-lg">
                <Image
                  src="/images/about/4.png"
                  alt={km ? "រូបថតសាលា" : "School photo"}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                {/* Dark gradient overlay for badge */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Decorative accent */}
                <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-school-gold-400/15 transition-transform duration-500 group-hover:scale-125" />

                <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end">
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm bg-black/40 text-white border border-white/10">
                    {km ? "បង្កើតឆ្នាំ ២០០០" : "Established 2000"}
                  </span>
                  <ArrowRight className="w-5 h-5 text-white/70 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── KEY MILESTONES ─── */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "radial-gradient(circle, #1e3a8a 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <ScrollReveal variant="fade-up">
            <SectionHeading
              khmer="ដំណាក់កាលសំខាន់ៗ"
              english="Key Milestones"
            />
          </ScrollReveal>

          <div className="relative max-w-4xl mx-auto">
            {/* Vertical centre line */}
            <div
              className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-school-blue-800 via-school-gold-500 to-school-blue-800 hidden md:block"
              style={{ transform: "translateX(-50%)" }}
            />

            {(milestones ?? []).map((m, i) => {
              const isLeft = i % 2 === 0;
              const m_color = m.color ?? "#1e3a8a";
              return (
                <ScrollReveal
                  key={m.id}
                  variant={isLeft ? "fade-left" : "fade-right"}
                  delay={i * 0.15}
                >
                  <div
                    className={cn(
                      "relative flex items-center gap-0 mb-20 last:mb-0",
                      isLeft ? "md:flex-row" : "md:flex-row-reverse",
                      "flex-col"
                    )}
                  >
                    {/* Content card */}
                    <div
                      className={cn(
                        "flex-1 w-full md:w-auto",
                        isLeft ? "md:pr-16 md:text-right" : "md:pl-16 md:text-left"
                      )}
                    >
                      <div
                        className="group relative bg-white rounded-2xl p-6 md:p-8 border transition-all duration-300 hover:shadow-xl"
                        style={{
                          borderColor: `${m_color}20`,
                          boxShadow: `0 4px 20px ${m_color}10`,
                        }}
                      >
                        {/* Year badge */}
                        <div
                          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4 text-white"
                          style={{ background: m_color }}
                        >
                          <span>{m.year}</span>
                        </div>

                        <h3
                          className={cn(
                            "text-lg md:text-xl font-bold mb-3 text-gray-900",
                            km && "font-khmer"
                          )}
                        >
                          {km ? m.title_km : m.title_en}
                        </h3>
                        <p
                          className={cn(
                            "text-sm leading-relaxed text-gray-500",
                            km && "font-khmer"
                          )}
                        >
                          {km ? (m.description_km ?? "") : (m.description_en ?? "")}
                        </p>

                        {/* Subtle hover indicator */}
                        <div
                          className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                          style={{ background: m_color }}
                        />
                      </div>
                    </div>

                    {/* Dot on the vertical line */}
                    <div
                      className="relative z-10 w-10 h-10 rounded-full border-[4px] border-white hidden md:flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-125"
                      style={{
                        background: m_color,
                        boxShadow: `0 0 0 6px ${m_color}15, 0 4px 15px ${m_color}30`,
                      }}
                    >
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>

                    {/* Image / SVG illustration */}
                    <div
                      className={cn(
                        "flex-1 w-full md:w-auto mt-4 md:mt-0",
                        isLeft ? "md:pl-16" : "md:pr-16"
                      )}
                    >
                      {(m.image_url ?? "") && (
                        <motion.div
                          className="relative rounded-2xl overflow-hidden shadow-lg border group/img"
                          style={{ borderColor: `${m_color}20` }}
                          whileHover={{ scale: 1.02, y: -4 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <div className="relative w-full h-48 md:h-52 overflow-hidden">
                            <Image
                              src={m.image_url!}
                              alt={km ? (m.caption_km ?? "") : (m.caption_en ?? "")}
                              fill
                              className="object-cover transition-transform duration-700 group-hover/img:scale-105"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </div>
                          {/* Image caption */}
                          {(m.caption_km || m.caption_en) && (
                            <div
                              className="absolute bottom-0 left-0 right-0 px-4 py-3 backdrop-blur-sm"
                              style={{
                                background: `linear-gradient(to top, ${m_color}cc, transparent)`,
                              }}
                            >
                              <p className="text-white text-xs font-semibold">
                                {km ? (m.caption_km ?? m.caption_en) : (m.caption_en ?? m.caption_km)}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── LEADERSHIP ─── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal variant="fade-up">
            <SectionHeading
              khmer="គណៈ​គ្រប់គ្រង​សាលា"
              english="School Leadership"
            />
          </ScrollReveal>

          {/* Principal featured card */}
          {principal && (
            <ScrollReveal variant="fade-up" delay={0.1}>
              <button
                type="button"
                onClick={() => setSelectedLeader(principal)}
                className="relative bg-white rounded-3xl overflow-hidden mb-10 shadow-[0_8px_30px_rgba(30,58,138,0.10)] hover:shadow-[0_12px_40px_rgba(30,58,138,0.15)] transition-all duration-500 w-full text-left cursor-pointer group"
              >
                {/* Top accent strip */}
                <div className="h-1.5 w-full bg-gradient-to-r from-school-blue-800 to-school-gold-500" />

                <div className="grid grid-cols-1 md:grid-cols-[300px_1fr]">
                  {/* Photo */}
                  <div className="flex items-center justify-center p-8 md:p-10 bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <div className="relative w-44 h-44 md:w-52 md:h-52 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl shrink-0 transition-transform duration-300 group-hover:scale-[1.02]">
                      {isValidUrl(principal.photo_url) ? (
                        <Image
                          src={principal.photo_url}
                        alt={principal.name_en}
                        fill
                        className="object-cover"
                        sizes="208px"
                      />
                    ) : (
                      <Image
                        src={getAvatarUrl(principal.name_en, 208)}
                        alt={principal.name_en}
                        fill
                        className="object-cover"
                        sizes="208px"
                        />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative p-8 md:p-10 flex flex-col justify-center overflow-hidden">
                    <Quote className="absolute -top-2 right-6 w-24 h-24 pointer-events-none text-school-blue-800/5" />

                    <span className="relative self-start inline-flex items-center text-xs tracking-[0.15em] uppercase font-semibold px-3 py-1.5 rounded-full mb-4 bg-school-blue-50 text-school-blue-800">
                      {km ? "នាយកសាលា" : "School Principal"}
                    </span>

                    <h3
                      className={cn(
                        "relative text-2xl md:text-3xl font-bold mb-5 text-school-blue-800",
                        km && "font-khmer"
                      )}
                    >
                      {principal.name_en}
                    </h3>

                    {(principal.bio_en || principal.bio_km) && (
                      <blockquote
                        className={cn(
                          "relative text-base italic leading-relaxed mb-7 pl-5 border-l-[3px] text-gray-500",
                          km && "font-khmer"
                        )}
                        style={{ borderColor: "#f59e0b" }}
                      >
                        {`"${getLocalizedText(principal.bio_km, principal.bio_en, locale)}"`}
                      </blockquote>
                    )}

                    <div className="relative flex flex-wrap gap-3">
                      <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-school-blue-800 shadow-md shadow-school-blue-800/20">
                        <Mail className="w-4 h-4" />
                        {km ? "ចុចមើលព័ត៌មានលម្អិត" : "Click for details"}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            </ScrollReveal>
          )}

          {/* ─── CLICKABLE STATS + SEARCH ─── */}
          <ScrollReveal variant="fade-up" delay={0.2}>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              {/* Total Staff */}
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={cn(
                  "relative rounded-xl px-4 py-2.5 text-center border transition-all duration-200 cursor-pointer min-w-[100px]",
                  activeFilter === 'all'
                    ? "bg-school-blue-800 border-school-blue-800 text-white shadow-md shadow-school-blue-800/20"
                    : "bg-white border-gray-200 text-gray-700 hover:border-school-blue-300 hover:shadow-sm"
                )}
              >
                <p className="text-lg font-bold tabular-nums leading-none">
                  {teachers.filter(t => t.is_active).length + leadership.filter(l => l.is_active).length}
                </p>
                <p className={cn("text-[10px] mt-1 opacity-70 font-medium", km && "font-khmer")}>
                  {km ? "បុគ្គលិកសរុប" : "Total Staff"}
                </p>
              </button>

              {/* Leadership */}
              <button
                type="button"
                onClick={() => setActiveFilter('leadership')}
                className={cn(
                  "relative rounded-xl px-4 py-2.5 text-center border transition-all duration-200 cursor-pointer min-w-[100px]",
                  activeFilter === 'leadership'
                    ? "bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/20"
                    : "bg-white border-gray-200 text-gray-700 hover:border-amber-300 hover:shadow-sm"
                )}
              >
                <p className="text-lg font-bold tabular-nums leading-none">
                  {leadership.filter(l => l.is_active).length}
                </p>
                <p className={cn("text-[10px] mt-1 opacity-70 font-medium", km && "font-khmer")}>
                  {km ? "គណៈគ្រប់គ្រង" : "Leadership"}
                </p>
              </button>

              {/* Teachers */}
              <button
                type="button"
                onClick={() => setActiveFilter('teachers')}
                className={cn(
                  "relative rounded-xl px-4 py-2.5 text-center border transition-all duration-200 cursor-pointer min-w-[100px]",
                  activeFilter === 'teachers'
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "bg-white border-gray-200 text-gray-700 hover:border-emerald-300 hover:shadow-sm"
                )}
              >
                <p className="text-lg font-bold tabular-nums leading-none">
                  {teachers.filter(t => t.is_active).length}
                </p>
                <p className={cn("text-[10px] mt-1 opacity-70 font-medium", km && "font-khmer")}>
                  {km ? "គ្រូបង្រៀន" : "Teachers"}
                </p>
              </button>

              {/* Search */}
              <div className="relative min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={staffSearchQuery}
                  onChange={(e) => setStaffSearchQuery(e.target.value)}
                  placeholder={km ? "ស្វែងរកគ្រូ..." : "Search staff..."}
                  className={cn(
                    "w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-xs transition-all outline-none focus:border-school-blue-400 focus:ring-2 focus:ring-school-blue-100 placeholder:text-gray-400",
                    km && "font-khmer"
                  )}
                />
              </div>
            </div>
          </ScrollReveal>

          {/* ─── FILTERED STAFF GRID ─── */}
          <ScrollReveal variant="fade-up" delay={0.3}>
            <div>
              <div className="text-center mb-4">
                <p className="text-xs" style={{ color: '#737781' }}>
                  {km
                    ? `បង្ហាញ ${filteredStaff.length} នាក់`
                    : `Showing ${filteredStaff.length} staff`}
                  {staffSearchQuery.trim() && (
                    <button
                      type="button"
                      onClick={() => setStaffSearchQuery('')}
                      className="ml-2 text-school-blue-600 hover:text-school-blue-800 underline text-[10px]"
                    >
                      {km ? 'សម្អាត' : 'Clear'}
                    </button>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredStaff.map((teacher) => (
                  <StaffCard key={teacher.id} teacher={teacher} km={km} />
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── LEADER DIALOG ─── */}
      <LeaderDetailDialog
        leader={selectedLeader}
        open={selectedLeader !== null}
        onOpenChange={(open) => { if (!open) setSelectedLeader(null); }}
        km={km}
        locale={locale}
      />

      {/* ─── ORGANIZATION & TEACHERS ─── */}
      <OrganizationSection teachers={teachers} locale={locale} />
    </div>
  );
}
