import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import {
  ClipboardCheck,
  NotebookPen,
  Users2,
  FileSignature,
  Vote,
  LineChart,
  CalendarDays,
  Smartphone,
  Handshake,
  MessageCircleQuestion,
  FlaskConical,
  Presentation,
  type LucideIcon,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("governance");
  return { title: t("title") };
}

interface GovernanceItem {
  km: string;
  en: string;
  icon: LucideIcon;
}

const GOVERNANCE_ITEMS: GovernanceItem[] = [
  {
    km: "តេស្តស្តង់ដារ តាមលំនាំប្រឡងបាក់ឌុប",
    en: "Standardized tests aligned with the national Baccalaureate exam format",
    icon: ClipboardCheck,
  },
  {
    km: "ផែនការសិក្សាសិស្ស ផែនការបង្រៀន និងផែនការកែលម្អសាលារៀន",
    en: "Student learning plans, teaching plans, and school improvement plans",
    icon: NotebookPen,
  },
  {
    km: "គណៈកម្មការគ្រប់គ្រងថ្នាក់រៀន និងសាលារៀន",
    en: "Classroom and school management committees",
    icon: Users2,
  },
  {
    km: "កិច្ចព្រមព្រៀងលទ្ធផលការងារប្រចាំឆ្នាំ",
    en: "Annual work performance agreements",
    icon: FileSignature,
  },
  {
    km: "ក្រុមប្រឹក្សាសិស្ស",
    en: "Student council",
    icon: Vote,
  },
  {
    km: "ប្រព័ន្ធតាមដានសិស្សប្រចាំខែ និងត្រីមាស",
    en: "Monthly and quarterly student monitoring system",
    icon: LineChart,
  },
];

const CULTURE_ITEMS: GovernanceItem[] = [
  {
    km: "សិស្សមានកាលវិភាគរៀន និងបំពេញកិច្ចការផ្សេងៗប្រចាំថ្ងៃ ក្នុងមួយសប្តាហ៍ៗ",
    en: "Students follow a weekly class schedule and complete daily tasks",
    icon: CalendarDays,
  },
  {
    km: "សិស្សសិក្សាតាមរយៈ GEIP EdTech App មុនពេលរៀនជាមួយគ្នា",
    en: "Students study through the GEIP EdTech App before learning together",
    icon: Smartphone,
  },
  {
    km: "សិស្សរៀនផ្ទាល់ជាមួយគ្នា",
    en: "Students engage in direct peer-to-peer learning",
    icon: Handshake,
  },
  {
    km: "សិស្សហ្វឹកហាត់បង្ហាញសំណួរ លំហាត់ និងចំណេះដឹងថ្មីៗ",
    en: "Students practice presenting questions, exercises, and new knowledge",
    icon: MessageCircleQuestion,
  },
  {
    km: "សិស្សរៀនជាគម្រោងស្រាវជ្រាវ ដើម្បីពង្រឹងការយល់ដឹងខ្លឹមសារមេរៀន",
    en: "Students undertake research projects to deepen their understanding of lessons",
    icon: FlaskConical,
  },
  {
    km: "សិស្សផ្សព្វផ្សាយគម្រោងស្រាវជ្រាវ ដើម្បីអភិវឌ្ឍជំនាញ និងបទពិសោធន៍ជាក់ស្តែង",
    en: "Students present research projects to build practical skills and experience",
    icon: Presentation,
  },
];

function ItemCard({ item, index, km }: { item: GovernanceItem; index: number; km: boolean }) {
  const Icon = item.icon;
  return (
    <div
      className="group relative bg-white rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{ boxShadow: "0px 4px 20px rgba(30,78,140,0.07)" }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 group-hover:bg-[#00376f]"
          style={{ background: "rgba(0,55,111,0.08)" }}
        >
          <Icon
            className="w-5 h-5 transition-colors duration-300 group-hover:text-white"
            style={{ color: "#00376f" }}
          />
        </div>
        <div className="min-w-0">
          <span
            className="text-xs font-bold tracking-wider"
            style={{ color: "#fdbc13" }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <p
            className={cn(
              "text-sm leading-relaxed mt-1",
              km && "font-khmer"
            )}
            style={{ color: "#0d1c2f" }}
          >
            {km ? item.km : item.en}
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function GovernancePage() {
  const locale = await getLocale();
  const km = locale === "km";

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
            <p className="font-khmer text-3xl mb-2" style={{ color: "#00376f" }}>
              អភិបាលកិច្ចសាលារៀន
            </p>
            <h2 className={cn("text-2xl font-bold mb-3", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
              {km ? "រចនាសម្ព័ន្ធ និងប្រព័ន្ធគ្រប់គ្រង" : "Structure & Management Systems"}
            </h2>
            <p className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: "#737781" }}>
              SCHOOL GOVERNANCE
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GOVERNANCE_ITEMS.map((item, i) => (
              <ItemCard key={item.en} item={item} index={i} km={km} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Teaching & Learning Culture ── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="font-khmer text-3xl mb-2" style={{ color: "#00376f" }}>
              វប្បធម៌បង្រៀន និងរៀន
            </p>
            <h2 className={cn("text-2xl font-bold mb-3", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
              {km ? "សកម្មភាពសិក្សា និងអភិវឌ្ឍន៍សិស្ស" : "Learning Activities & Student Growth"}
            </h2>
            <p className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: "#737781" }}>
              TEACHING &amp; LEARNING CULTURE
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CULTURE_ITEMS.map((item, i) => (
              <ItemCard key={item.en} item={item} index={i} km={km} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
