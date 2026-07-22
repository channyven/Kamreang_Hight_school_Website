import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { cn } from "@/utils";
import { getGovernanceIcon } from "@/lib/governance-icons";
import { getGovernanceItems } from "@/lib/queries";
import type { GovernanceItem } from "@/types";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("governance");
  return { title: t("title") };
}

function ItemCard({
  item,
  index,
  km,
  accent,
}: {
  item: GovernanceItem;
  index: number;
  km: boolean;
  accent: "navy" | "gold";
}) {
  const Icon = getGovernanceIcon(item.icon);
  const isNavy = accent === "navy";
  const mainColor = isNavy ? "#2c2a7a" : "#a67d1a";
  const tintBg = isNavy ? "rgba(44,42,122,0.08)" : "rgba(223,173,50,0.14)";

  return (
    <div
      className="group relative bg-white rounded-2xl p-6 pt-7 border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ boxShadow: "0px 4px 20px rgba(44,42,122,0.06)" }}
    >
      {/* Hover-reveal top accent bar */}
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
        style={{ background: isNavy ? "#2c2a7a" : "#dfad32" }}
      />

      <div className="flex items-start justify-between mb-5">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 group-hover:text-white"
          style={{ background: tintBg }}
        >
          <Icon
            className="w-5 h-5 transition-colors duration-300"
            style={{ color: mainColor }}
          />
        </div>
        <span
          aria-hidden="true"
          className="text-3xl font-black leading-none select-none"
          style={{ color: mainColor, opacity: 0.12 }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <p
        className={cn("text-sm leading-relaxed", km && "font-khmer")}
        style={{ color: "#2c2a7a" }}
      >
        {km ? item.text_km : item.text_en}
      </p>
    </div>
  );
}

export default async function GovernancePage() {
  const locale = await getLocale();
  const km = locale === "km";
  const items = await getGovernanceItems();
  const governanceItems = items.filter((i) => i.section === "governance");
  const cultureItems = items.filter((i) => i.section === "culture");

  return (
    <div className="min-h-screen" style={{ background: "#f8f7fc" }}>
      {/* ── Hero ── */}
      <section
        className="pt-24 pb-20"
        style={{
          background: "linear-gradient(135deg, #191845 0%, #2c2a7a 55%, #343291 100%)",
        }}
      >
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <p className="font-khmer text-2xl md:text-3xl mb-3" style={{ color: "#dfad32" }}>
            អភិបាលកិច្ចសាលារៀន
          </p>
          <h1 className={cn("text-4xl md:text-5xl font-bold text-white mb-5", km && "font-khmer")}>
            {km ? "អភិបាលកិច្ច និងវប្បធម៌សាលារៀន" : "School Governance"}
          </h1>
          <p className={cn("text-base md:text-lg text-white/70 leading-relaxed", km && "font-khmer")}>
            {km
              ? "របៀបគ្រប់គ្រង តាមដាន និងលើកកម្ពស់គុណភាពអប់រំ តាមរយៈប្រព័ន្ធ រចនាសម្ព័ន្ធ និងវប្បធម៌សិក្សារបស់សាលា"
              : "How our school is structured, monitored, and improved — and the everyday culture of teaching and learning behind it."}
          </p>
        </div>
      </section>

      {/* ── Governance ── */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="font-khmer text-3xl mb-2" style={{ color: "#2c2a7a" }}>
              អភិបាលកិច្ចសាលារៀន
            </p>
            <h2 className={cn("text-2xl font-bold mb-3", km && "font-khmer")} style={{ color: "#2c2a7a" }}>
              {km ? "រចនាសម្ព័ន្ធ និងប្រព័ន្ធគ្រប់គ្រង" : "Structure & Management Systems"}
            </h2>
            <p
              className={cn(
                "text-xs tracking-[0.2em] uppercase font-medium",
                km && "font-khmer normal-case tracking-normal"
              )}
              style={{ color: "#727272" }}
            >
              {km ? "ការគ្រប់គ្រងសាលា" : "SCHOOL GOVERNANCE"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {governanceItems.map((item, i) => (
              <ItemCard key={item.id} item={item} index={i} km={km} accent="navy" />
            ))}
          </div>
        </div>
      </section>

      {/* ── Teaching & Learning Culture ── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="font-khmer text-3xl mb-2" style={{ color: "#2c2a7a" }}>
              វប្បធម៌បង្រៀន និងរៀន
            </p>
            <h2 className={cn("text-2xl font-bold mb-3", km && "font-khmer")} style={{ color: "#2c2a7a" }}>
              {km ? "សកម្មភាពសិក្សា និងអភិវឌ្ឍន៍សិស្ស" : "Learning Activities & Student Growth"}
            </h2>
            <p
              className={cn(
                "text-xs tracking-[0.2em] uppercase font-medium",
                km && "font-khmer normal-case tracking-normal"
              )}
              style={{ color: "#727272" }}
            >
              {km ? "ការបង្រៀន និងការសិក្សា" : "TEACHING & LEARNING CULTURE"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cultureItems.map((item, i) => (
              <ItemCard key={item.id} item={item} index={i} km={km} accent="gold" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
