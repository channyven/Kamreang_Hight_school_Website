import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import LocaleHtmlSync from "@/components/LocaleHtmlSync";
import { Toaster } from "sonner";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: process.env.NEXT_PUBLIC_SCHOOL_NAME_EN ?? "Kamrieng High School",
      template: `%s | ${process.env.NEXT_PUBLIC_SCHOOL_NAME_EN ?? "Kamrieng High School"}`,
    },
    description: `Official website of ${process.env.NEXT_PUBLIC_SCHOOL_NAME_EN ?? "our school"} — news, achievements, and more.`,
    keywords: ["Kamrieng High School", "វិទ្យាល័យកំរៀង", "school", "education", "Cambodia", "Battambang", "high school", "secondary education"],
    openGraph: {
      type: "website",
      siteName: process.env.NEXT_PUBLIC_SCHOOL_NAME_EN,
      locale: "km_KH",
      alternateLocale: ["en_US"],
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Admin routes are served through a middleware rewrite (see middleware.ts)
  // that bypasses next-intl's own middleware, so `requestLocale` (the
  // header-based mechanism getMessages()/getLocale() normally rely on)
  // never gets set for them and silently falls back to the default locale.
  // Seeding the request-scoped cache here with the locale we already know
  // from the URL segment fixes locale resolution for every route.
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleHtmlSync />
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
      />
    </NextIntlClientProvider>
  );
}
