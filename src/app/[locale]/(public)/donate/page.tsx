import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Heart, Building2, Smartphone } from "lucide-react";
import { cn } from "@/utils";
import CopyButton from "@/components/public/CopyButton";
import DonateQrImage from "@/components/public/DonateQrImage";
import { getActiveBankAccounts, getActiveDonationPurposes, getActiveDonationQrCodes, getSiteSettings } from "@/lib/queries";
import { getDonateIcon } from "@/lib/donate-icons";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("donate");
  return { title: t("title") };
}

export default async function DonatePage() {
  const locale = await getLocale();
  const t = await getTranslations("donate");
  const km = locale === "km";
  const [bankAccounts, donationPurposes, qrCodes, settings] = await Promise.all([
    getActiveBankAccounts(),
    getActiveDonationPurposes(),
    getActiveDonationQrCodes(),
    getSiteSettings(),
  ]);
  // Legacy fallback: before migration 019 the QR lived in the settings table
  const legacyQrUrl = settings["donate_qr_url"];
  const displayQrCodes =
    qrCodes.length > 0
      ? qrCodes.map((q) => ({
          id: q.id,
          src: q.image_url,
          label: (km ? q.label_km : q.label_en) || q.label_en || q.label_km,
        }))
      : legacyQrUrl
        ? [{ id: "legacy", src: legacyQrUrl, label: undefined as string | undefined }]
        : [];

  return (
    <div className="min-h-screen" style={{ background: "#f8f9ff" }}>

      {/* Hero */}
      <section
        className="pt-24 pb-20"
        style={{
          background: "linear-gradient(135deg, #001f45 0%, #00376f 55%, #1e4e8c 100%)",
        }}
      >
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <div className="flex justify-center mb-5">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(253,188,19,0.2)" }}
            >
              <Heart className="w-8 h-8" style={{ color: "#fdbc13" }} />
            </div>
          </div>
          <p className="font-khmer text-2xl md:text-3xl mb-3" style={{ color: "#fdbc13" }}>
            {km ? "ចូលរួមគាំទ្រ" : "ចូលរួមគាំទ្រ"}
          </p>
          <h1 className={cn("text-4xl md:text-5xl font-bold text-white mb-5", km && "font-khmer")}>
            {t("title")}
          </h1>
          <p className={cn("text-base md:text-lg text-white/70 leading-relaxed", km && "font-khmer")}>
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Why Donate */}
      {donationPurposes.length > 0 && (
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className={cn("text-2xl md:text-3xl font-bold mb-3", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
              {t("why_title")}
            </h2>
            <p className={cn("text-sm text-gray-500 max-w-2xl mx-auto", km && "font-khmer")}>
              {t("why_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {donationPurposes.map((use) => {
              const desc = km ? use.desc_km : use.desc_en;
              const Icon = getDonateIcon(use.icon);
              return (
                <div
                  key={use.id}
                  className="group bg-white rounded-2xl p-6 text-center hover:-translate-y-1 transition-transform duration-300"
                  style={{ boxShadow: "0px 4px 20px rgba(30,78,140,0.07)" }}
                >
                  <div
                    className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center transition-colors duration-300 group-hover:bg-[#00376f]"
                    style={{ background: "rgba(0,55,111,0.08)" }}
                  >
                    <Icon
                      className="w-7 h-7 transition-colors duration-300 group-hover:text-white"
                      style={{ color: "#00376f" }}
                    />
                  </div>
                  <h3 className={cn("font-bold text-base mb-2", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
                    {km ? use.title_km : use.title_en}
                  </h3>
                  {desc && (
                    <p className={cn("text-sm leading-relaxed", km && "font-khmer")} style={{ color: "#434750" }}>
                      {desc}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* Bank Transfer */}
      {bankAccounts.length > 0 && (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-3">
              <Building2 className="w-7 h-7" style={{ color: "#00376f" }} />
            </div>
            <h2 className={cn("text-2xl font-bold mb-2", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
              {t("bank_transfer")}
            </h2>
            <p className={cn("text-sm", km && "font-khmer")} style={{ color: "#737781" }}>
              {t("bank_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bankAccounts.map((acc) => (
              <div
                key={acc.id}
                className="rounded-2xl p-6 border"
                style={{
                  borderColor: "#e6eeff",
                  boxShadow: "0px 4px 20px rgba(30,78,140,0.07)",
                }}
              >
                {/* Bank header */}
                <div className="flex items-center gap-3 mb-5">
                  {acc.logo_url ? (
                    <div className="w-10 h-10 rounded-xl overflow-hidden border bg-white shrink-0 flex items-center justify-center" style={{ borderColor: "#e6eeff" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={acc.logo_url}
                        alt={`${acc.bank_name_en} logo`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: acc.logo_color }}
                    >
                      {acc.bank_name_en.slice(0, 3)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-sm" style={{ color: "#0d1c2f" }}>
                      {km ? acc.bank_name_km : acc.bank_name_en}
                    </p>
                    <p className="text-xs" style={{ color: "#737781" }}>{acc.currency}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2.5 border-b" style={{ borderColor: "#f0f4ff" }}>
                    <span className={cn("text-xs font-medium", km && "font-khmer")} style={{ color: "#737781" }}>
                      {t("account_name")}
                    </span>
                    <span className={cn("text-sm font-semibold", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
                      {km ? acc.account_name_km : acc.account_name_en}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className={cn("text-xs font-medium", km && "font-khmer")} style={{ color: "#737781" }}>
                      {t("account_number")}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-mono" style={{ color: "#00376f" }}>
                        {acc.account_number}
                      </span>
                      <CopyButton value={acc.account_number.replace(/\s/g, "")} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Mobile / QR */}
      <section className="py-16" style={{ background: "#f8f9ff" }}>
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <div className="flex justify-center mb-4">
            <Smartphone className="w-7 h-7" style={{ color: "#00376f" }} />
          </div>
          <h2 className={cn("text-2xl font-bold mb-3", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
            {t("mobile_pay")}
          </h2>
          <p className={cn("text-sm mb-8", km && "font-khmer")} style={{ color: "#737781" }}>
            {t("mobile_subtitle")}
          </p>

          {displayQrCodes.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-6">
              {displayQrCodes.map((qr) => (
                <div
                  key={qr.id}
                  className="bg-white rounded-2xl p-8"
                  style={{ boxShadow: "0px 4px 20px rgba(30,78,140,0.07)" }}
                >
                  <DonateQrImage src={qr.src} alt={qr.label || "Mobile payment QR code"} />
                  <p className={cn("text-sm font-medium", km && "font-khmer")} style={{ color: "#434750" }}>
                    {qr.label || t("scan_qr")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 inline-block" style={{ boxShadow: "0px 4px 20px rgba(30,78,140,0.07)" }}>
              {/* Placeholder QR */}
              <div
                className="w-48 h-48 mx-auto rounded-xl flex flex-col items-center justify-center mb-4"
                style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #e6eeff 100%)" }}
              >
                <div className="grid grid-cols-5 gap-1 opacity-40">
                  {[1,0,1,0,1,0,1,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,1,1,0].map((v, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-sm"
                      style={{ background: v ? "#00376f" : "transparent" }}
                    />
                  ))}
                </div>
                <p className="text-xs mt-2 font-medium" style={{ color: "#00376f" }}>ABA / KHQR</p>
              </div>
              <p className={cn("text-sm font-medium", km && "font-khmer")} style={{ color: "#434750" }}>
                {t("scan_qr")}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Thank you banner */}
      <section
        className="py-14"
        style={{ background: "linear-gradient(135deg, #001f45 0%, #00376f 100%)" }}
      >
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <Heart className="w-8 h-8 mx-auto mb-4" style={{ color: "#fdbc13" }} />
          <h2 className={cn("text-2xl md:text-3xl font-bold text-white mb-4", km && "font-khmer")}>
            {t("thank_you")}
          </h2>
          <p className={cn("text-white/70 text-sm leading-relaxed", km && "font-khmer")}>
            {t("thank_you_desc")}
          </p>
        </div>
      </section>
    </div>
  );
}
