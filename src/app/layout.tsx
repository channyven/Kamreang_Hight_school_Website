import type { Metadata } from "next";
import { Inter, Battambang } from "next/font/google";
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
    default: process.env.NEXT_PUBLIC_SCHOOL_NAME_EN ?? "Kamrieng High School",
    template: `%s | ${process.env.NEXT_PUBLIC_SCHOOL_NAME_EN ?? "Kamrieng High School"}`,
  },
  description: "Official website of Kamrieng High School — news, achievements, academics, and more.",
  keywords: ["Kamrieng High School", "វិទ្យាល័យកំរៀង", "school", "education", "Cambodia", "high school"],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  icons: {
    icon: { url: "/images/kamrieng-logo.png", type: "image/png" },
    shortcut: { url: "/images/kamrieng-logo.png", type: "image/png" },
    apple: { url: "/images/kamrieng-logo.png", type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className={`${inter.variable} ${battambang.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
