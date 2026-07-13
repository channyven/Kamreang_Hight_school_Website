"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";
import { ChevronLeft, ChevronRight, ArrowRight, BookOpen, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/types";

interface HeroSectionProps {
  slides?: HeroSlide[];
}

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: "slide-welcome",
    title_km: "សូមស្វាគមន៍មកវិទ្យាល័យកំរៀង",
    title_en: "Welcome to Kamrieng High School",
    subtitle_km: "ផ្ដល់ការអប់រំប្រកបដោយគុណភាព វប្បធម៌ និងនវានុវត្ត",
    subtitle_en: "Empowering the next generation of Cambodian leaders through academic rigor, cultural integrity, and innovative learning.",
    gradient: "linear-gradient(135deg, #061525 0%, #0c2d5e 55%, #092045 100%)",
    cta_primary_en: "Enroll Now",
    cta_primary_km: "ចុះឈ្មោះឥឡូវ",
    cta_secondary_en: "View Prospectus",
    cta_secondary_km: "មើលព័ត៌មាន",
    cta_primary_href: "/contact",
    cta_secondary_href: "/about",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "slide-academic",
    title_km: "ភាពល្អឥតខ្ចោះក្នុងការអប់រំ",
    title_en: "Excellence in Education",
    subtitle_km: "កម្មវិធីសិក្សាទំនើបបញ្ចូលជាមួយប្រពៃណីខ្មែរ ដើម្បីភាពជោគជ័យ",
    subtitle_en: "Modern curriculum blending STEM, humanities, and Khmer classical arts to prepare students for a global future.",
    gradient: "linear-gradient(135deg, #061e14 0%, #0c4228 55%, #083320 100%)",
    cta_primary_en: "Our Programs",
    cta_primary_km: "កម្មវិធីរបស់យើង",
    cta_secondary_en: "Meet Our Teachers",
    cta_secondary_km: "ជួបគ្រូបង្រៀន",
    cta_primary_href: "/about",
    cta_secondary_href: "/about",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "slide-culture",
    title_km: "ជំរកវប្បធម៌ខ្មែរ",
    title_en: "Rooted in Khmer Heritage",
    subtitle_km: "ការអប់រំដែលការពារវប្បធម៌ប្រពៃណីខ្មែរ ហើយប្រែក្លាយជីវិតរបស់យើង",
    subtitle_en: "Honoring Cambodias rich cultural legacy through traditional arts, Khmer language, and national history.",
    gradient: "linear-gradient(135deg, #1a0c05 0%, #5c2d0a 55%, #421f08 100%)",
    cta_primary_en: "Learn More",
    cta_primary_km: "ស្វែងយល់បន្ថែម",
    cta_secondary_en: "Latest News",
    cta_secondary_km: "ព័ត៌មានថ្មីៗ",
    cta_primary_href: "/about",
    cta_secondary_href: "/news",
    sort_order: 3,
    is_active: true,
  },
  {
    id: "slide-future",
    title_km: "កសាងអនាគតកម្ពុជា",
    title_en: "Building Cambodia's Future",
    subtitle_km: "ជំនឹ STEM ភាសា ហើយភាពជាអ្នកដឹកនាំ ស្ថាបនាកម្ពុជានៃថ្ងៃស្អែក",
    subtitle_en: "Through STEM education, leadership programs, and digital literacy, we prepare students to lead Cambodia's development.",
    gradient: "linear-gradient(135deg, #0c0820 0%, #271463 55%, #1a0c4a 100%)",
    cta_primary_en: "Join Us Today",
    cta_primary_km: "ចូលរួមជាមួយយើង",
    cta_secondary_en: "Our Achievements",
    cta_secondary_km: "សិទ្ធិសម្រេចរបស់យើង",
    cta_primary_href: "/contact",
    cta_secondary_href: "/achievements",
    sort_order: 4,
    is_active: true,
  },
];

const SLIDE_ACCENTS = ["#fdbc13", "#4ade80", "#fb923c", "#c084fc"];

function AngkorWatSilhouette() {
  return (
    <svg viewBox="0 0 500 420" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full h-full">
      <rect x="0" y="350" width="500" height="70" />
      <rect x="5" y="323" width="490" height="27" />
      <rect x="55" y="298" width="390" height="25" />
      <rect x="135" y="275" width="230" height="23" />
      <rect x="153" y="277" width="10" height="16" rx="2" />
      <rect x="173" y="277" width="10" height="16" rx="2" />
      <rect x="237" y="277" width="10" height="16" rx="2" />
      <rect x="280" y="277" width="10" height="16" rx="2" />
      <rect x="317" y="277" width="10" height="16" rx="2" />
      <rect x="337" y="277" width="10" height="16" rx="2" />
      <rect x="68" y="300" width="9" height="13" rx="2" />
      <rect x="86" y="300" width="9" height="13" rx="2" />
      <rect x="406" y="300" width="9" height="13" rx="2" />
      <rect x="424" y="300" width="9" height="13" rx="2" />
      <rect x="20" y="252" width="34" height="71" />
      <rect x="17" y="239" width="40" height="13" />
      <rect x="21" y="227" width="32" height="12" />
      <rect x="25" y="216" width="24" height="11" />
      <rect x="28" y="206" width="18" height="10" />
      <rect x="31" y="197" width="12" height="9" />
      <ellipse cx="37" cy="190" rx="8" ry="12" />
      <rect x="90" y="232" width="46" height="66" />
      <rect x="86" y="217" width="54" height="15" />
      <rect x="91" y="203" width="44" height="14" />
      <rect x="96" y="190" width="34" height="13" />
      <rect x="101" y="178" width="24" height="12" />
      <rect x="105" y="167" width="16" height="11" />
      <rect x="108" y="157" width="10" height="10" />
      <ellipse cx="113" cy="149" rx="9" ry="14" />
      <rect x="218" y="202" width="64" height="73" />
      <rect x="212" y="184" width="76" height="18" />
      <rect x="218" y="167" width="64" height="17" />
      <rect x="224" y="151" width="52" height="16" />
      <rect x="230" y="136" width="40" height="15" />
      <rect x="235" y="122" width="30" height="14" />
      <rect x="239" y="109" width="22" height="13" />
      <rect x="242" y="97" width="16" height="12" />
      <rect x="244" y="86" width="12" height="11" />
      <ellipse cx="250" cy="77" rx="11" ry="16" />
      <rect x="364" y="232" width="46" height="66" />
      <rect x="360" y="217" width="54" height="15" />
      <rect x="365" y="203" width="44" height="14" />
      <rect x="370" y="190" width="34" height="13" />
      <rect x="375" y="178" width="24" height="12" />
      <rect x="379" y="167" width="16" height="11" />
      <rect x="382" y="157" width="10" height="10" />
      <ellipse cx="387" cy="149" rx="9" ry="14" />
      <rect x="446" y="252" width="34" height="71" />
      <rect x="443" y="239" width="40" height="13" />
      <rect x="447" y="227" width="32" height="12" />
      <rect x="451" y="216" width="24" height="11" />
      <rect x="454" y="206" width="18" height="10" />
      <rect x="457" y="197" width="12" height="9" />
      <ellipse cx="463" cy="190" rx="8" ry="12" />
      <rect x="218" y="373" width="12" height="47" />
      <rect x="270" y="373" width="12" height="47" />
      <g opacity="0.2" transform="scale(1,-1) translate(0,-870)">
        <rect x="5" y="323" width="490" height="27" />
        <rect x="55" y="298" width="390" height="25" />
        <rect x="135" y="275" width="230" height="23" />
        <rect x="218" y="202" width="64" height="73" />
        <rect x="212" y="184" width="76" height="18" />
        <ellipse cx="250" cy="77" rx="11" ry="16" />
        <rect x="90" y="232" width="46" height="66" />
        <rect x="364" y="232" width="46" height="66" />
      </g>
    </svg>
  );
}

function LotusFlower({ size = 56 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" width={size} height={size} aria-hidden="true">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <ellipse key={angle} cx="50" cy="26" rx="8" ry="24" transform={`rotate(${angle}, 50, 50)`} opacity="0.75" />
      ))}
      {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle) => (
        <ellipse key={angle} cx="50" cy="32" rx="6" ry="16" transform={`rotate(${angle}, 50, 50)`} opacity="0.5" />
      ))}
      <circle cx="50" cy="50" r="9" />
    </svg>
  );
}

function KhmerPattern() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="absolute inset-0 w-full h-full opacity-[0.04]" style={{ backgroundSize: "120px 120px" }}>
      <defs>
        <pattern id="khmer-tile-hero" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <polygon points="30,4 56,30 30,56 4,30" stroke="white" strokeWidth="1.2" fill="none" />
          <polygon points="30,14 46,30 30,46 14,30" stroke="white" strokeWidth="0.8" fill="none" />
          <circle cx="30" cy="4" r="2" fill="white" />
          <circle cx="56" cy="30" r="2" fill="white" />
          <circle cx="30" cy="56" r="2" fill="white" />
          <circle cx="4" cy="30" r="2" fill="white" />
          <circle cx="30" cy="30" r="3" fill="white" />
          <line x1="30" y1="4" x2="30" y2="56" stroke="white" strokeWidth="0.4" opacity="0.5" />
          <line x1="4" y1="30" x2="56" y2="30" stroke="white" strokeWidth="0.4" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="120" height="120" fill="url(#khmer-tile-hero)" />
    </svg>
  );
}

function ScrollIndicator() {
  return (
    <motion.div
      className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.8, duration: 0.8 }}
    >
      <motion.div
        className="flex flex-col items-center gap-1"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="block w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
        <ChevronDown className="w-3.5 h-3.5 text-white/40" />
      </motion.div>
    </motion.div>
  );
}

export default function HeroSection({ slides }: HeroSectionProps) {
  const locale = useLocale();
  const activeSlides = (slides ?? []).filter((s) => s.is_active).slice(0, 5);
  const allSlides = activeSlides.length > 0 ? activeSlides : FALLBACK_SLIDES;

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number, dir: number) => {
    setDirection(dir);
    setCurrent(index);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % allSlides.length, 1);
  }, [current, allSlides.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + allSlides.length) % allSlides.length, -1);
  }, [current, allSlides.length, goTo]);

  useEffect(() => {
    if (allSlides.length <= 1 || paused) return;
    timerRef.current = setInterval(next, 6000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, allSlides.length, paused]);

  const slide = allSlides[current];
  const accent = SLIDE_ACCENTS[current % SLIDE_ACCENTS.length];

  return (
    <section
      className="relative h-screen min-h-[580px] max-h-[900px] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={`bg-${current}`}
          custom={direction}
          variants={{
            enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          {slide.image_url ? (
            <Image src={slide.image_url} alt={slide.title_en} fill className="object-cover" priority={current === 0} />
          ) : (
            <div className="absolute inset-0" style={{ background: slide.gradient ?? "linear-gradient(135deg, #061525 0%, #0c2d5e 100%)" }}>
              <KhmerPattern />
              <div className="absolute right-0 bottom-0 w-[55%] h-[88%] hidden lg:block pointer-events-none" style={{ color: "white", opacity: 0.08 }}>
                <AngkorWatSilhouette />
              </div>
              <div className="absolute bottom-14 left-6 pointer-events-none" style={{ color: accent, opacity: 0.08 }}>
                <LotusFlower size={64} />
              </div>
              <div className="absolute -top-16 -right-16 w-[380px] h-[380px] rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${accent}15 0%, transparent 65%)` }} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${current}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05, duration: 0.4 }}
                  className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border text-xs font-semibold tracking-wider uppercase"
                  style={{ borderColor: `${accent}50`, color: accent, background: `${accent}12` }}
                >
                  <span style={{ fontSize: "10px" }}>🇰🇭</span>
                  Kingdom of Cambodia
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="font-khmer text-lg md:text-xl mb-2 leading-relaxed tracking-wide"
                  style={{ color: accent }}
                >
                  {slide.title_km}
                </motion.p>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] mb-6 tracking-tight"
                >
                  {slide.title_en}
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="w-16 h-0.5 rounded-full mb-6"
                  style={{ background: accent }}
                />

                {(slide.subtitle_en || slide.subtitle_km) && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                    className={cn(
                      "text-white/70 text-base md:text-lg leading-relaxed mb-10 max-w-xl",
                      locale === "km" ? "font-khmer" : ""
                    )}
                  >
                    {locale === "km" ? (slide.subtitle_km ?? slide.subtitle_en) : (slide.subtitle_en ?? slide.subtitle_km)}
                  </motion.p>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="flex flex-wrap gap-4"
                >
                  <Button asChild size="lg" className={cn("font-semibold px-8 h-12 shadow-2xl shadow-black/30 transition-all duration-300 border-0 hover:scale-[1.03] hover:shadow-2xl active:scale-[0.97] group", locale === "km" && "font-khmer")} style={{ background: accent, color: "#0a0a0a" }}>
                    <Link href={`/${locale}${slide.cta_primary_href ?? "/contact"}`}>
                      {locale === "km" ? (slide.cta_primary_km ?? "ចុះឈ្មោះ") : (slide.cta_primary_en ?? "Enroll Now")}
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" className={cn("bg-white/10 border text-white hover:bg-white/20 backdrop-blur-sm px-8 h-12 font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]", locale === "km" && "font-khmer")} style={{ borderColor: "rgba(255,255,255,0.2)" }}>
                    <Link href={`/${locale}${slide.cta_secondary_href ?? "/about"}`}>
                      <BookOpen className="mr-2 w-4 h-4 opacity-80" />
                      {locale === "km" ? (slide.cta_secondary_km ?? "មើលព័ត៌មាន") : (slide.cta_secondary_en ?? "View Prospectus")}
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {allSlides.length > 1 && (
        <>
          <button onClick={() => { prev(); setPaused(false); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95" aria-label="Previous slide">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => { next(); setPaused(false); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95" aria-label="Next slide">
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {allSlides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {allSlides.map((_, i) => (
            <button key={i} onClick={() => goTo(i, i > current ? 1 : -1)} className="rounded-full transition-all duration-300 border-0 cursor-pointer" style={{ width: i === current ? "28px" : "7px", height: "7px", background: i === current ? accent : "rgba(255,255,255,0.3)" }} aria-label={`Go to slide ${i + 1}`} />
          ))}
        </div>
      )}

      <ScrollIndicator />

      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
          <path d="M0 56L1440 56L1440 16C1200 48 960 60 720 44C480 28 240 0 0 16L0 56Z" fill="rgb(249 250 251)" />
        </svg>
      </div>
    </section>
  );
}
