import Image from "next/image";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { Phone, Mail, MapPin, Facebook, Youtube } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { getSiteSettings } from "@/lib/queries";

async function getFooterContactInfo(locale: string) {
  const settings = await getSiteSettings();
  const km = locale === "km";
  return {
    address:
      (km ? settings.school_address_km : settings.school_address_en) ??
      (km
        ? "ភូមិអូរដា ឃុំអូរដា ស្រុកកំរៀង ខេត្តបាត់ដំបង"
        : "Ou Da village, Ou Da commune, Kamrieng district, Battambang province"),
    phone: settings.school_phone ?? "095 85 85 45",
    email: settings.school_email ?? "kamrieng@gmail.com",
    facebook: settings.school_facebook ?? "#",
    youtube: settings.school_youtube ?? "#",
  };
}

export default async function Footer() {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const km = locale === "km";
  const { address, phone, email, facebook, youtube } = await getFooterContactInfo(locale);

  const schoolName =
    locale === "km"
      ? (process.env.NEXT_PUBLIC_SCHOOL_NAME_KM ?? "វិទ្យាល័យកំរៀង")
      : (process.env.NEXT_PUBLIC_SCHOOL_NAME_EN ?? "Kamrieng High School");

  const quickLinks = [
    { label: t("nav.home"), href: `/${locale}` },
    { label: t("nav.about"), href: `/${locale}/about` },
    { label: t("nav.governance"), href: `/${locale}/governance` },
    { label: t("nav.news"), href: `/${locale}/news` },
    { label: t("nav.achievements"), href: `/${locale}/achievements` },
    { label: t("nav.contact"), href: `/${locale}/contact` },
    { label: t("nav.donate"), href: `/${locale}/donate` },
  ];

  return (
    <footer className="bg-school-blue-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* ── Brand & Contact ── */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden ring-2 ring-school-gold-500/30 shrink-0 bg-white">
                <Image
                  src="/images/about/kamrieng%20high%20school.jpg"
                  alt="Kamrieng High School"
                  fill
                  className="object-contain p-1"
                  sizes="56px"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">{schoolName}</h3>
                <p className="text-school-blue-200 text-xs">
                  {km
                    ? "ផ្តល់ការអប់រំប្រកបដោយគុណភាពតាំងពីឆ្នាំ ១៩៦០"
                    : "Since 2000"}
                </p>
              </div>
            </div>
            <div className="space-y-2.5 text-sm text-school-blue-200 mt-4">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-school-gold-400" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-school-gold-400" />
                <span dir="ltr">{phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-school-gold-400" />
                <span>{email}</span>
              </div>
            </div>
            {/* Social */}
            <div className="flex gap-3 mt-5">
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-school-gold-500 flex items-center justify-center transition-all duration-200 hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-500 flex items-center justify-center transition-all duration-200 hover:scale-110"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div className="lg:col-span-3 lg:col-start-7">
            <h4 className="font-semibold text-school-gold-400 mb-4 text-sm uppercase tracking-wider">
              {t("footer.quick_links")}
            </h4>
            <ul className="space-y-3">
              {quickLinks.slice(0, 4).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-school-blue-200 hover:text-school-gold-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Pages ── */}
          <div className="lg:col-span-3 lg:col-start-10">
            <h4 className="font-semibold text-school-gold-400 mb-4 text-sm uppercase tracking-wider">
              {km ? "ទំព័រ" : "Pages"}
            </h4>
            <ul className="space-y-3">
              {quickLinks.slice(4).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-school-blue-200 hover:text-school-gold-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-school-blue-800">
        <div className="container mx-auto px-6 py-4 text-center">
          <p className="text-xs text-school-blue-300">
            © 2026 Kamrieng High School. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
