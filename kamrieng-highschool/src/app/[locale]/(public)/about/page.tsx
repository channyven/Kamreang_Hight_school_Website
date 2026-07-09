import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { getLocalizedText, cn } from "@/lib/utils";
import { Eye, Star, ArrowRight, User, Quote, Mail, FileText } from "lucide-react";
import { getAboutPageData } from "@/lib/queries";
import OrganizationSection from "@/components/public/about/OrganizationSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return { title: t("title") };
}

const MILESTONES = [
  {
    year: "1954",
    title_en: "Official Opening",
    title_km: "ការបើកផ្លូវការ",
    desc_en:
      "The school was inaugurated by His Majesty King Norodom Sihanouk, marking a new era for local education.",
    desc_km:
      "សាលារៀន​ ត្រូវ​ បាន​ ឧ​ទ្ទិ​ស​ ​ ដោយ​ ព្រះ​ ករុណា​ ព្រះ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​",
    color: "#c0392b",
  },
  {
    year: "1985",
    title_en: "Reconstruction Era",
    title_km: "ជំនាន់ស្ថាបនាឡើងវិញ",
    desc_en:
      "Following the dark years, the school was modernized with three new academic blocks and a science laboratory.",
    desc_km:
      "ក្រោយ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​",
    color: "#00376f",
  },
  {
    year: "2020",
    title_en: "Digital Transformation",
    title_km: "ការផ្លាស់ប្ដូរឌីជីថល",
    desc_en:
      "Introduction of the E-Learning center and fiber optic infrastructure to support modern digital literacy.",
    desc_km:
      "ការ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​",
    color: "#00376f",
  },
];

const CORE_VALUES = [
  "Academic Excellence",
  "Integrity & Honor",
  "Cultural Pride",
  "Innovation",
];

export default async function AboutPage() {
  const locale = await getLocale();
  const t = await getTranslations("about");
  const km = locale === "km";
  const { schoolInfo, leadership, teachers } = await getAboutPageData();

  const leaders = leadership
    .filter((l) => l.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);
  const principal = leaders[0];
  const viceLeaders = leaders.slice(1);

  const infoMap = Object.fromEntries(schoolInfo.map((i) => [i.section, i]));
  const vision = infoMap["vision"];
  const mission = infoMap["mission"];
  const history = infoMap["history"];

  return (
    <div className="min-h-screen" style={{ background: "#f8f9ff" }}>

      {/* ── Hero ── */}
      <section
        className="pt-24 pb-20"
        style={{
          background: "linear-gradient(135deg, #001f45 0%, #00376f 55%, #1e4e8c 100%)",
        }}
      >
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <p className="font-khmer text-2xl md:text-3xl mb-3" style={{ color: "#fdbc13" }}>
            អំពីសាលារបស់យើង
          </p>
          <h1 className={cn("text-4xl md:text-5xl font-bold text-white mb-5", km && "font-khmer")}>
            {t("title")}
          </h1>
          <p
            className={cn("text-base md:text-lg text-white/70 leading-relaxed", km && "font-khmer")}
          >
            {km
              ? "ការដាំដុះភាពឆ្នើម និងមោទនភាពជាតិ ក្នុងការអប់រំសាធារណៈ នៃប្រទេសកម្ពុជា ចាប់តាំងពីឆ្នាំ ១៩៥៤"
              : "Cultivating excellence and national pride in Cambodian public education since 1954. We are committed to building the future of our nation through academic rigor and cultural values."}
          </p>
        </div>
      </section>

      {/* ── Vision / Mission / Values ── */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Vision & Mission — spans 2 cols */}
            <div
              className="lg:col-span-2 bg-white rounded-2xl p-8"
              style={{ boxShadow: "0px 4px 20px rgba(30,78,140,0.07)" }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(0,55,111,0.08)" }}
                >
                  <Eye className="w-4 h-4" style={{ color: "#00376f" }} />
                </div>
                <div>
                  <p
                    className={cn("text-xs font-semibold leading-tight", km && "font-khmer")}
                    style={{ color: "#fdbc13" }}
                  >
                    {km ? "ចក្ខុវិស័យ និងបេសកកម្ម" : "ចក្ខុវិស័យ និងបេសកកម្ម"}
                  </p>
                  <p className="text-xs tracking-[0.15em] uppercase" style={{ color: "#737781" }}>
                    VISION &amp; MISSION
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h3 className={cn("text-base font-bold mb-3", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
                    {km ? "ចក្ខុវិស័យ" : "Vision"}
                  </h3>
                  <div
                    className={cn("text-sm leading-relaxed prose prose-sm max-w-none", km && "font-khmer")}
                    style={{ color: "#434750" }}
                    dangerouslySetInnerHTML={{
                      __html: vision
                        ? (getLocalizedText(vision.content_km, vision.content_en, locale) ?? "")
                        : "",
                    }}
                  />
                </div>
                <div>
                  <h3 className={cn("text-base font-bold mb-3", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
                    {km ? "បេសកកម្ម" : "Mission"}
                  </h3>
                  <div
                    className={cn("text-sm leading-relaxed prose prose-sm max-w-none", km && "font-khmer")}
                    style={{ color: "#434750" }}
                    dangerouslySetInnerHTML={{
                      __html: mission
                        ? (getLocalizedText(mission.content_km, mission.content_en, locale) ?? "")
                        : "",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Core Values */}
            <div className="rounded-2xl p-8 flex flex-col" style={{ background: "#fdbc13" }}>
              <div className="flex items-center gap-3 mb-8">
                <Star className="w-5 h-5 flex-shrink-0" style={{ color: "#00376f" }} />
                <div>
                  <p className={cn("text-xs font-semibold leading-tight", km && "font-khmer")} style={{ color: "#6b4d00" }}>
                    {km ? "គុណតម្លៃ" : "គុណតម្លៃ"}
                  </p>
                  <p className="text-xs tracking-[0.15em] uppercase" style={{ color: "#5d4200" }}>
                    CORE VALUES
                  </p>
                </div>
              </div>
              <ul className="space-y-4 flex-1">
                {CORE_VALUES.map((v) => (
                  <li key={v} className="flex items-center gap-3 text-sm font-semibold" style={{ color: "#261900" }}>
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: "#00376f" }}
                    />
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── History ── */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-khmer text-3xl md:text-4xl mb-1" style={{ color: "#00376f" }}>
                ប្រវត្តិ​សាលា
              </p>
              <h2 className="text-2xl font-bold mb-6" style={{ color: "#0d1c2f" }}>
                {history ? getLocalizedText(null, history.title_en, "en") : "Our Rich History"}
              </h2>
              <div
                className={cn("text-base leading-relaxed mb-6 prose prose-sm max-w-none", km && "font-khmer")}
                style={{ color: "#434750" }}
                dangerouslySetInnerHTML={{
                  __html: history
                    ? (getLocalizedText(history.content_km, history.content_en, locale) ?? "")
                    : "",
                }}
              />
              <a
                href="#"
                className={cn("inline-flex items-center gap-1.5 text-sm font-semibold group", km && "font-khmer")}
                style={{ color: "#00376f" }}
              >
                {km ? "ស្វែងយល់បន្ថែម" : "Learn more about our archives"}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>

            {/* Image / placeholder */}
            <div
              className="relative rounded-2xl overflow-hidden flex items-end"
              style={{
                minHeight: 320,
                background: "linear-gradient(135deg, #00376f 0%, #1e4e8c 100%)",
              }}
            >
              {/* Decorative circles */}
              <div
                className="absolute top-8 right-8 w-40 h-40 rounded-full opacity-10"
                style={{ background: "#fdbc13" }}
              />
              <div
                className="absolute top-24 right-24 w-60 h-60 rounded-full opacity-5"
                style={{ background: "#ffffff" }}
              />
              <div className="relative z-10 p-6">
                <span
                  className="text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm"
                  style={{ background: "rgba(0,0,0,0.35)", color: "#ffffff" }}
                >
                  Established 1954
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Milestones ── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-khmer text-3xl mb-2" style={{ color: "#0d1c2f" }}>
              ដំណាក់កាលសំខាន់ៗ
            </h2>
            <p className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: "#737781" }}>
              KEY MILESTONES
            </p>
          </div>

          <div className="relative max-w-2xl mx-auto">
            {/* Centre line */}
            <div
              className="absolute left-1/2 top-2 bottom-2 w-px"
              style={{ background: "#c3c6d2", transform: "translateX(-50%)" }}
            />

            {MILESTONES.map((m, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div
                  key={m.year}
                  className={cn(
                    "relative flex items-start gap-0 mb-16 last:mb-0",
                    isLeft ? "flex-row" : "flex-row-reverse"
                  )}
                >
                  {/* Content */}
                  <div className={cn("flex-1 pb-4", isLeft ? "pr-10 text-right" : "pl-10 text-left")}>
                    <p className="text-3xl font-bold mb-1" style={{ color: m.color }}>
                      {m.year}
                    </p>
                    <h3
                      className={cn("text-lg font-semibold mb-2", km && "font-khmer")}
                      style={{ color: "#0d1c2f" }}
                    >
                      {km ? m.title_km : m.title_en}
                    </h3>
                    <p
                      className={cn("text-sm leading-relaxed", km && "font-khmer")}
                      style={{ color: "#434750" }}
                    >
                      {km ? m.desc_km : m.desc_en}
                    </p>
                  </div>

                  {/* Dot — centred on the line */}
                  <div
                    className="absolute left-1/2 w-3.5 h-3.5 rounded-full border-2 border-white"
                    style={{
                      background: m.color,
                      top: "0.45rem",
                      transform: "translateX(-50%)",
                      boxShadow: `0 0 0 3px ${m.color}30`,
                    }}
                  />

                  {/* Spacer */}
                  <div className="flex-1" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Leadership ── */}
      <section className="py-16" style={{ background: "#f8f9ff" }}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2
              className={cn("text-3xl font-bold mb-2", km && "font-khmer")}
              style={{ color: "#0d1c2f" }}
            >
              {km ? "គណៈ​គ្រប់គ្រង​សាលា" : "School Leadership"}
            </h2>
            <p className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: "#737781" }}>
              SCHOOL LEADERSHIP
            </p>
          </div>

          {/* Principal featured card */}
          {principal && (
            <div
              className="relative bg-white rounded-3xl overflow-hidden mb-10"
              style={{ boxShadow: "0px 8px 30px rgba(30,78,140,0.10)" }}
            >
              {/* Top accent strip */}
              <div
                className="h-1.5 w-full"
                style={{ background: "linear-gradient(90deg, #00376f 0%, #fdbc13 100%)" }}
              />

              <div className="grid grid-cols-1 md:grid-cols-[300px_1fr]">
                {/* Photo */}
                <div
                  className="flex items-center justify-center p-8 md:p-10"
                  style={{ background: "linear-gradient(160deg, #eef3ff 0%, #dde9ff 100%)" }}
                >
                  <div className="relative w-44 h-44 md:w-52 md:h-52 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl shrink-0">
                    {principal.photo_url ? (
                      <Image
                        src={principal.photo_url}
                        alt={getLocalizedText(principal.name_km, principal.name_en, locale) ?? ""}
                        fill
                        className="object-cover"
                        sizes="208px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: "#dde9ff" }}>
                        <User className="w-20 h-20" style={{ color: "#a8c8ff" }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="relative p-8 md:p-10 flex flex-col justify-center overflow-hidden">
                  <Quote
                    className="absolute -top-2 right-6 w-24 h-24 pointer-events-none"
                    style={{ color: "#00376f", opacity: 0.06 }}
                  />
                  <span
                    className="relative self-start inline-flex items-center text-xs tracking-[0.15em] uppercase font-semibold px-3 py-1.5 rounded-full mb-4"
                    style={{ background: "rgba(0,55,111,0.08)", color: "#00376f" }}
                  >
                    {km ? "នាយកសាលា" : "School Principal"}
                  </span>
                  <h3
                    className={cn("relative text-2xl md:text-3xl font-bold mb-5", km && "font-khmer")}
                    style={{ color: "#00376f" }}
                  >
                    {getLocalizedText(principal.name_km, principal.name_en, locale)}
                  </h3>
                  <blockquote
                    className={cn("relative text-base italic leading-relaxed mb-7 pl-5 border-l-[3px]", km && "font-khmer")}
                    style={{ color: "#434750", borderColor: "#fdbc13" }}
                  >
                    {`"${getLocalizedText(principal.bio_km, principal.bio_en, locale)}"`}
                  </blockquote>
                  <div className="relative flex flex-wrap gap-3">
                    <button
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: "#00376f" }}
                    >
                      <Mail className="w-4 h-4" />
                      {km ? "ការណែនាំ" : "View Message"}
                    </button>
                    <button
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border transition-colors hover:bg-[#f0f5ff]"
                      style={{ color: "#00376f", borderColor: "#00376f" }}
                    >
                      <FileText className="w-4 h-4" />
                      {km ? "ជីវប្រវត្ដិ" : "Biography"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vice directors */}
          {viceLeaders.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {viceLeaders.map((leader) => (
                <div
                  key={leader.id}
                  className="group bg-white rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{ boxShadow: "0px 4px 20px rgba(30,78,140,0.07)" }}
                >
                  <div className="relative w-24 h-24 mx-auto rounded-full mb-4 overflow-hidden ring-4 ring-[#e6eeff] transition-all duration-300 group-hover:ring-[#fdbc13]/40">
                    {leader.photo_url ? (
                      <Image
                        src={leader.photo_url}
                        alt={getLocalizedText(leader.name_km, leader.name_en, locale) ?? ""}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: "#e6eeff" }}>
                        <User className="w-10 h-10" style={{ color: "#a8c8ff" }} />
                      </div>
                    )}
                  </div>
                  <h4
                    className={cn("font-bold text-base mb-1 transition-colors group-hover:text-[#00376f]", km && "font-khmer")}
                    style={{ color: "#0d1c2f" }}
                  >
                    {getLocalizedText(leader.name_km, leader.name_en, locale)}
                  </h4>
                  <p
                    className={cn("text-sm", km && "font-khmer")}
                    style={{ color: "#434750" }}
                  >
                    {getLocalizedText(leader.position_km, leader.position_en, locale)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <OrganizationSection teachers={teachers} locale={locale} />
    </div>
  );
}
