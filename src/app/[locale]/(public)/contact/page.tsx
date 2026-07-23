import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getSiteSettings } from "@/lib/queries";
import ContactPageClient from "@/components/public/ContactPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact");
  return { title: t("title") };
}

async function getContactInfo(locale: string) {
  const settings = await getSiteSettings();
  const km = locale === "km";
  return {
    address:
      (km ? settings.school_address_km : settings.school_address_en) ??
      (km ? "ខេត្តបាត់ដំបង, កម្ពុជា" : "Battambang Province, Cambodia"),
    phone: settings.school_phone ?? "095 85 85 45",
    email: settings.school_email ?? "reachtalab@gmail.com",
    hours:
      (km ? settings.school_hours_km : settings.school_hours_en) ??
      (km ? "ច័ន្ទ - សុក្រ: ម៉ោង ៧:០០ - ១១:០០, ១៤:០០ - ១៧:០០" : "Mon - Fri: 7:00 - 11:00, 14:00 - 17:00"),
    campusPhoto: settings.school_campus_photo ?? "",
    facebook: settings.school_facebook ?? "",
    tiktok: settings.school_tiktok ?? "",
  };
}

export default async function ContactPage() {
  const locale = await getLocale();
  const { address, phone, email, hours, campusPhoto, facebook, tiktok } = await getContactInfo(locale);

  return (
    <ContactPageClient
      address={address}
      phone={phone}
      email={email}
      hours={hours}
      campusPhoto={campusPhoto}
      facebook={facebook}
      tiktok={tiktok}
    />
  );
}
