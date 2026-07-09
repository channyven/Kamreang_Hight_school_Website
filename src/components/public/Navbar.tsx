"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, School, Globe, Heart, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";

interface NavLink {
  key: string;
  href: string;
}

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
  const isTransparent = isHome && !scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks: NavLink[] = [
    { key: "home", href: `/${locale}` },
    { key: "about", href: `/${locale}/about` },
    { key: "governance", href: `/${locale}/governance` },
    { key: "news", href: `/${locale}/news` },
    { key: "achievements", href: `/${locale}/achievements` },
    { key: "contact", href: `/${locale}/contact` },
  ];

  const switchLocale = (newLocale: Locale) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  const isActive = (href: string) => {
    if (href === `/${locale}`) return pathname === `/${locale}`;
    return pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isTransparent
          ? "bg-transparent"
          : "bg-white/95 backdrop-blur-md shadow-md"
      )}
    >
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 rounded-full bg-school-blue-800 flex items-center justify-center">
              <School className="w-5 h-5 text-school-gold-400" />
            </div>
            <div className="hidden sm:block">
              <p className={cn("text-sm font-bold leading-tight", isTransparent ? "text-white" : "text-school-blue-800")}>
                {locale === "km"
                  ? process.env.NEXT_PUBLIC_SCHOOL_NAME_KM
                  : process.env.NEXT_PUBLIC_SCHOOL_NAME_EN}
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-school-blue-800 text-white"
                    : isTransparent
                    ? "text-white/90 hover:text-white hover:bg-white/10"
                    : "text-gray-700 hover:text-school-blue-800 hover:bg-gray-100"
                )}
              >
                {t(link.key as Parameters<typeof t>[0])}
              </Link>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Donate CTA */}
            <Link
              href={`/${locale}/donate`}
              aria-label={t("donate")}
              className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full px-2.5 py-2 sm:px-4 text-sm font-semibold text-white shadow-md shadow-school-gold-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-school-gold-500/50 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-school-gold-500 to-school-gold-600 transition-opacity duration-300 group-hover:opacity-0" />
              <span className="absolute inset-0 bg-gradient-to-r from-school-gold-400 to-school-gold-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <Heart className="relative w-4 h-4 shrink-0 fill-white transition-transform duration-300 group-hover:scale-110" />
              <span className="relative hidden sm:inline">{t("donate")}</span>
            </Link>

            {/* Locale switcher */}
            <div className="flex items-center gap-1">
              <Globe
                className={cn("w-4 h-4", isTransparent ? "text-white/80" : "text-gray-600")}
              />
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => switchLocale(loc)}
                  className={cn(
                    "text-xs px-2 py-1 rounded font-medium transition-colors",
                    loc === locale
                      ? "bg-school-gold-500 text-white"
                      : isTransparent
                      ? "text-white/80 hover:bg-white/10"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                  title={localeNames[loc]}
                >
                  {localeFlags[loc]}
                </button>
              ))}
            </div>

            {/* Admin sign-in */}
            <Link
              href={`/${locale}/admin`}
              aria-label={t("admin")}
              title={t("admin")}
              className={cn(
                "hidden lg:inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors",
                isTransparent
                  ? "text-white/80 hover:text-white hover:bg-white/10"
                  : "text-gray-600 hover:text-school-blue-800 hover:bg-gray-100"
              )}
            >
              <LogIn className="w-[18px] h-[18px]" />
            </Link>

            {/* Mobile menu toggle */}
            <button
              className={cn(
                "lg:hidden p-2 rounded-md",
                isTransparent ? "text-white" : "text-gray-700"
              )}
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white border-t shadow-lg"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-school-blue-800 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {t(link.key as Parameters<typeof t>[0])}
                </Link>
              ))}
              <div className="pt-2 border-t">
                <Button asChild size="sm" className="w-full bg-school-blue-800">
                  <Link href={`/${locale}/admin`} onClick={() => setMobileOpen(false)}>
                    {t("admin")}
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
