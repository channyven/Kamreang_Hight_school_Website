import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { AuthProvider } from "@/providers/AuthContext";
import LocaleHtmlSync from "@/components/LocaleHtmlSync";
import { Toaster } from "sonner";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

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

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider>
        <LocaleHtmlSync />
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
        />
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
