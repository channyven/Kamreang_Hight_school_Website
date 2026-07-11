"use client";

import Image from "next/image";
import { useMemo, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Target,
  Heart,
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
  ShieldCheck,
  Award,
  Crown,
  Handshake,
  Telescope,
  Star,
  HeartHandshake,
} from "lucide-react";
import { cn, getLocalizedText, getAvatarUrl } from "@/lib/utils";
import type { SchoolInfo, Leadership, Teacher, Statistics } from "@/types";
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

function MilestoneSchoolIcon() {
  return (
    <svg viewBox="0 0 200 160" fill="none" className="w-full h-full">
      {/* Sky gradient */}
      <rect width="200" height="160" rx="12" fill="url(#sky-school)" />
      <defs>
        <linearGradient id="sky-school" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8f0fe" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
      </defs>
      {/* Sun */}
      <circle cx="160" cy="40" r="22" fill="#fde68a" opacity="0.8" />
      <circle cx="160" cy="40" r="16" fill="#fcd34d" />
      {/* School building */}
      <rect x="55" y="60" width="90" height="80" rx="3" fill="#1e3a8a" />
      <rect x="70" y="35" width="60" height="30" rx="2" fill="#2563eb" />
      <polygon points="70,35 100,18 130,35" fill="#1e40af" />
      {/* Door */}
      <rect x="90" y="105" width="22" height="35" rx="2" fill="#f59e0b" />
      {/* Windows */}
      <rect x="65" y="75" width="14" height="16" rx="1" fill="#93c5fd" />
      <rect x="85" y="75" width="14" height="16" rx="1" fill="#93c5fd" />
      <rect x="105" y="75" width="14" height="16" rx="1" fill="#93c5fd" />
      <rect x="122" y="75" width="14" height="16" rx="1" fill="#93c5fd" />
      {/* Ground */}
      <rect x="0" y="140" width="200" height="20" fill="#86efac" opacity="0.5" />
      {/* Trees */}
      <circle cx="38" cy="105" r="18" fill="#22c55e" opacity="0.6" />
      <rect x="36" y="115" width="4" height="28" fill="#854d0e" />
      <circle cx="162" cy="110" r="14" fill="#22c55e" opacity="0.6" />
      <rect x="160" y="118" width="4" height="25" fill="#854d0e" />
      {/* Flag */}
      <rect x="98" y="18" width="2" height="18" fill="#78350f" />
      <polygon points="100,18 118,24 100,30" fill="#ef4444" />
    </svg>
  );
}

function MilestoneAwardIcon() {
  return (
    <svg viewBox="0 0 200 160" fill="none" className="w-full h-full">
      {/* Gold gradient bg */}
      <rect width="200" height="160" rx="12" fill="url(#gold-bg)" />
      <defs>
        <radialGradient id="gold-bg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </radialGradient>
      </defs>
      {/* Trophy */}
      <rect x="76" y="52" width="48" height="42" rx="6" fill="#d97706" />
      <rect x="80" y="56" width="40" height="34" rx="4" fill="#f59e0b" />
      {/* Trophy handles */}
      <path d="M76 62C62 58 58 70 64 78" stroke="#d97706" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M124 62C138 58 142 70 136 78" stroke="#d97706" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Star on trophy */}
      <polygon points="100,66 104,76 114,76 106,82 109,92 100,86 91,92 94,82 86,76 96,76" fill="#92400e" />
      {/* Trophy base */}
      <rect x="86" y="94" width="28" height="6" rx="2" fill="#d97706" />
      <rect x="92" y="100" width="16" height="22" rx="2" fill="#b45309" />
      {/* Ribbon left */}
      <path d="M76 52L60 30L76 40Z" fill="#ef4444" opacity="0.8" />
      <path d="M76 52L60 36L72 46Z" fill="#dc2626" opacity="0.6" />
      {/* Ribbon right */}
      <path d="M124 52L140 30L124 40Z" fill="#ef4444" opacity="0.8" />
      <path d="M124 52L140 36L128 46Z" fill="#dc2626" opacity="0.6" />
      {/* Confetti dots */}
      <circle cx="38" cy="38" r="3" fill="#f59e0b" opacity="0.7" />
      <circle cx="52" cy="120" r="3" fill="#3b82f6" opacity="0.7" />
      <circle cx="148" cy="44" r="3" fill="#22c55e" opacity="0.7" />
      <circle cx="162" cy="106" r="3" fill="#ef4444" opacity="0.7" />
      <circle cx="30" cy="78" r="2" fill="#a855f7" opacity="0.6" />
      <circle cx="170" cy="74" r="2" fill="#f59e0b" opacity="0.6" />
    </svg>
  );
}

function MilestoneGrowthIcon() {
  return (
    <svg viewBox="0 0 200 160" fill="none" className="w-full h-full">
      {/* Blue gradient bg */}
      <rect width="200" height="160" rx="12" fill="url(#growth-bg)" />
      <defs>
        <linearGradient id="growth-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
      </defs>
      {/* Growing bar chart */}
      <rect x="40" y="100" width="28" height="40" rx="3" fill="#93c5fd" />
      <rect x="74" y="78" width="28" height="62" rx="3" fill="#60a5fa" />
      <rect x="108" y="54" width="28" height="86" rx="3" fill="#3b82f6" />
      <rect x="142" y="36" width="28" height="104" rx="3" fill="#1e3a8a" />
      {/* Arrow trend line */}
      <polyline points="44,100 88,78 122,54 156,36" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Arrow head */}
      <polygon points="156,36 150,44 162,44" fill="#f59e0b" />
      {/* Students icon */}
      <circle cx="55" cy="38" r="8" fill="#f59e0b" opacity="0.3" />
      <circle cx="55" cy="38" r="5" fill="#f59e0b" opacity="0.6" />
      <circle cx="145" cy="18" r="8" fill="#f59e0b" opacity="0.3" />
      <circle cx="145" cy="18" r="5" fill="#f59e0b" opacity="0.6" />
      <circle cx="100" cy="26" r="6" fill="#f59e0b" opacity="0.25" />
      <circle cx="100" cy="26" r="4" fill="#f59e0b" opacity="0.5" />
      {/* Baseline */}
      <rect x="30" y="140" width="150" height="3" rx="1" fill="#bfdbfe" />
    </svg>
  );
}

const MILESTONES = [
  {
    year: "2000",
    title_en: "School Founded",
    title_km: "បង្កើតសាលា",
    desc_en:
      "Kamrieng High School was founded through the initiative of the Kamrieng district governor and district education office, together with local authorities, to bring secondary education to this rural community.",
    desc_km:
      "វិទ្យាល័យកំរៀង ត្រូវបានបង្កើតឡើងតាមគំនិតផ្ដួចផ្ដើមរបស់លោក សុខ គង់ អភិបាលស្រុកកំរៀង និងលោក នូប ធឿន ប្រធានការិយាល័យអប់រំ យុវជន និងកីឡាស្រុកកំរៀង រួមជាមួយអាជ្ញាធរមូលដ្ឋាន។",
    color: "#1e3a8a",
    image: MilestoneSchoolIcon,
    caption_km: "ការបង្កើតសាលា",
    caption_en: "School Founding",
  },
  {
    year: "2022",
    title_en: 'Recognized as a "Best School"',
    title_km: "ទទួលស្គាល់ជា \"សាលាល្អ\"",
    desc_en:
      'The Ministry of Education, Youth and Sport formally recognized Kamrieng High School as a "Best School" (សាលាល្អ).',
    desc_km:
      'ក្រសួងអប់រំ យុវជន និងកីឡា បានទទួលស្គាល់វិទ្យាល័យកំរៀងជា "សាលាល្អ" ។',
    color: "#f59e0b",
    image: MilestoneAwardIcon,
    caption_km: "ពានរង្វាន់សាលាល្អ",
    caption_en: "Best School Award",
  },
  {
    year: "2024–2025",
    title_en: "Growing Enrollment",
    title_km: "ការកើនឡើងនៃចំនួនសិស្ស",
    desc_en:
      "The school now serves 2,126 students across 42 classes, Grade 7 through 12, guided by 51 teaching staff.",
    desc_km:
      "បច្ចុប្បន្នសាលាមានសិស្សចំនួន ២,១២៦ នាក់ ក្នុង ៤២ ថ្នាក់ ចាប់ពីថ្នាក់ទី ៧ ដល់ទី ១២ ដឹកនាំដោយគ្រូចំនួន ៥១ នាក់។",
    color: "#1e3a8a",
    image: MilestoneGrowthIcon,
    caption_km: "កំណើនសិស្ស",
    caption_en: "Enrollment Growth",
  },
];

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
  const count = instant ? numericValue : useCounter(numericValue, isVisible);

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
            {leader.photo_url ? (
              <Image
                src={leader.photo_url}
                alt={getLocalizedText(leader.name_km, leader.name_en, locale)}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <Image
                src={getAvatarUrl(
                  getLocalizedText(leader.name_km, leader.name_en, locale),
                  96
                )}
                alt={getLocalizedText(leader.name_km, leader.name_en, locale)}
                fill
                className="object-cover"
                sizes="96px"
              />
            )}
          </div>
          <DialogTitle className={cn("text-xl font-bold text-white mb-0.5 flex items-center justify-center gap-2", km && "font-khmer")}>
            <span>{getLocalizedText(leader.name_km, leader.name_en, locale)}</span>
            {leader.gender && (
              <span className="text-lg text-white/80">{leader.gender}</span>
            )}
          </DialogTitle>
          {leader.name_km && leader.name_en && (
            <p className={cn("text-sm text-white/70 mb-1", km && "font-khmer")}>
              {km ? leader.name_en : leader.name_km}
            </p>
          )}
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

// ─── Main Component ────────────────────────────────────────────

interface AboutPageClientProps {
  schoolInfo: SchoolInfo[];
  leadership: Leadership[];
  teachers: Teacher[];
  statistics: Statistics | null;
  locale: string;
}

export default function AboutPageClient({
  schoolInfo,
  leadership,
  teachers,
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
  const viceLeaders = leaders.slice(1);
  const [selectedLeader, setSelectedLeader] = useState<Leadership | null>(null);
  const vision = infoMap["vision"];
  const mission = infoMap["mission"];
  const history = infoMap["history"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9ff] via-white to-[#f8f9ff]">
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
        <div className="container mx-auto px-6">
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
        <div className="container mx-auto px-6">
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
                      "text-[16px] leading-[1.8] text-gray-600 font-medium",
                      km && "font-khmer"
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
                      "text-[16px] leading-[1.8] text-gray-600 font-medium",
                      km && "font-khmer"
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
        <div className="container mx-auto px-6">
          <ScrollReveal variant="fade-up">
            <SectionHeading
              khmer="ប្រវត្តិ​សាលា"
              english="School History"
            />
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal variant="fade-left" delay={0.1}>
              <div>
                <div
                  className={cn(
                    "text-base leading-relaxed mb-6 prose prose-sm max-w-none text-gray-600",
                    km && "font-khmer"
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
            <ScrollReveal variant="fade-right" delay={0.2}>
              <div className="relative rounded-2xl overflow-hidden group cursor-pointer min-h-[320px] shadow-lg">
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

        <div className="container mx-auto px-6 relative">
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

            {MILESTONES.map((m, i) => {
              const isLeft = i % 2 === 0;
              const SvgImage = m.image;
              return (
                <ScrollReveal
                  key={m.year}
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
                          borderColor: `${m.color}20`,
                          boxShadow: `0 4px 20px ${m.color}10`,
                        }}
                      >
                        {/* Year badge */}
                        <div
                          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4 text-white"
                          style={{ background: m.color }}
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
                          {km ? m.desc_km : m.desc_en}
                        </p>

                        {/* Subtle hover indicator */}
                        <div
                          className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                          style={{ background: m.color }}
                        />
                      </div>
                    </div>

                    {/* Dot on the vertical line */}
                    <div
                      className="relative z-10 w-10 h-10 rounded-full border-[4px] border-white hidden md:flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-125"
                      style={{
                        background: m.color,
                        boxShadow: `0 0 0 6px ${m.color}15, 0 4px 15px ${m.color}30`,
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
                      {SvgImage && (
                        <motion.div
                          className="relative rounded-2xl overflow-hidden shadow-lg border"
                          style={{ borderColor: `${m.color}20` }}
                          whileHover={{ scale: 1.02, y: -4 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <div className="w-full h-48 md:h-52">
                            <SvgImage />
                          </div>
                          {/* Image caption */}
                          <div
                            className="absolute bottom-0 left-0 right-0 px-4 py-3 backdrop-blur-sm"
                            style={{
                              background: `linear-gradient(to top, ${m.color}cc, transparent)`,
                            }}
                          >
                            <p className="text-white text-xs font-semibold">
                              {km ? m.caption_km : m.caption_en}
                            </p>
                          </div>
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
        <div className="container mx-auto px-6">
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
                      {principal.photo_url ? (
                        <Image
                          src={principal.photo_url}
                          alt={getLocalizedText(principal.name_km, principal.name_en, locale)}
                          fill
                          className="object-cover"
                          sizes="208px"
                        />
                      ) : (
                        <Image
                          src={getAvatarUrl(
                            getLocalizedText(principal.name_km, principal.name_en, locale),
                            208
                          )}
                          alt={getLocalizedText(principal.name_km, principal.name_en, locale)}
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
                      {getLocalizedText(principal.name_km, principal.name_en, locale)}
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

          {/* Vice leaders */}
          {viceLeaders.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {viceLeaders.map((leader, i) => (
                <ScrollReveal key={leader.id} variant="fade-up" delay={0.1 + i * 0.1}>
                  <button
                    type="button"
                    onClick={() => setSelectedLeader(leader)}
                    className="group bg-white rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg border border-gray-100/80 hover:border-school-blue-100 w-full cursor-pointer"
                  >
                    <div className="relative w-24 h-24 mx-auto rounded-full mb-4 overflow-hidden ring-4 ring-blue-50 transition-all duration-500 group-hover:ring-school-gold-500/40">
                      {leader.photo_url ? (
                        <Image
                          src={leader.photo_url}
                          alt={getLocalizedText(leader.name_km, leader.name_en, locale)}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="96px"
                        />
                      ) : (
                        <Image
                          src={getAvatarUrl(
                            getLocalizedText(leader.name_km, leader.name_en, locale),
                            96
                          )}
                          alt={getLocalizedText(leader.name_km, leader.name_en, locale)}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      )}
                    </div>
                    <h4
                      className={cn(
                        "font-bold text-base mb-1 transition-colors group-hover:text-school-blue-800",
                        km && "font-khmer"
                      )}
                      style={{ color: "#1f2937" }}
                    >
                      {getLocalizedText(leader.name_km, leader.name_en, locale)}
                    </h4>
                    <p className={cn("text-sm text-gray-500", km && "font-khmer")}>
                      {getLocalizedText(leader.position_km, leader.position_en, locale)}
                    </p>
                  </button>
                </ScrollReveal>
              ))}
            </div>
          )}
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
