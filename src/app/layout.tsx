import type { Metadata } from "next";
import { Inter, Battambang } from "next/font/google";
import { getLocale } from "next-intl/server";
import { generateSchoolJsonLd } from "@/lib/structured-data";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const battambang = Battambang({
  subsets: ["khmer"],
  weight: ["400", "700"],
  variable: "--font-battambang",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_SCHOOL_NAME_EN ?? "Kamrieng Hight School",
    template: `%s | ${process.env.NEXT_PUBLIC_SCHOOL_NAME_EN ?? "Kamrieng Hight School"}`,
  },
  description: "Official website of the high school.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const schoolJsonLd = generateSchoolJsonLd();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schoolJsonLd) }}
          suppressHydrationWarning
        />
      </head>
      <body className={`${inter.variable} ${battambang.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
