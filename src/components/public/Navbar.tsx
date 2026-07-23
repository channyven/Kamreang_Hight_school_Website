"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Menu, X, Globe, Heart } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn, adminHref } from "@/utils";
import { locales, localeNames, type Locale } from "@/i18n/config";

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

  const navLinks: NavLink[] = useMemo(
    () => [
      { key: "home", href: `/${locale}` },
      { key: "about", href: `/${locale}/about` },
      { key: "governance", href: `/${locale}/governance` },
      { key: "news", href: `/${locale}/news` },
      { key: "achievements", href: `/${locale}/achievements` },
      { key: "report", href: `/${locale}/report` },
      { key: "contact", href: `/${locale}/contact` },
    ],
    [locale]
  );

  const switchLocale = useCallback(
    (newLocale: Locale) => {
      const segments = pathname.split("/");
      segments[1] = newLocale;
      router.push(segments.join("/"));
    },
    [pathname, router]
  );

  const isActive = useCallback(
    (href: string) => {
      if (href === `/${locale}`) {
        return pathname === `/${locale}` || pathname === `/${locale}/`;
      }
      // Match the exact path or a proper sub-path (e.g., /en/news matches /en/news/article-1
      // but not /en/news-foo or /en/report-extra matching /en/report)
      return pathname === href || pathname.startsWith(href + "/");
    },
    [locale, pathname]
  );

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
          <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-transparent transition-all duration-300 group-hover:ring-school-gold-400/60">
              <Image
                src="/images/about/kamrieng%20high%20school.jpg"
                alt="School logo"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="40px"
              />
            </div>
            <div className="hidden sm:block">
              <p className={cn("text-sm font-bold leading-tight transition-colors", isTransparent ? "text-white" : "text-school-blue-800", "group-hover:text-school-gold-500")}>
                {locale === "km"
                  ? (process.env.NEXT_PUBLIC_SCHOOL_NAME_KM ?? "វិទ្យាល័យកំរៀង")
                  : (process.env.NEXT_PUBLIC_SCHOOL_NAME_EN ?? "Kamrieng High School")}
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
            <div className="relative flex items-center gap-1">
              <Globe
                className={cn("w-4 h-4", isTransparent ? "text-white/80" : "text-gray-600")}
              />
              <LayoutGroup>
                <div className="flex items-center">
                  {locales.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => switchLocale(loc)}
                      className={cn(
                        "relative flex items-center gap-1 text-xs px-2 py-1 rounded font-medium transition-colors duration-150",
                        loc === locale
                          ? "text-white"
                          : isTransparent
                            ? "text-white/80 hover:text-white"
                            : "text-gray-600 hover:text-gray-900"
                      )}
                      title={localeNames[loc]}
                    >
                      {loc === locale && (
                        <motion.div
                          layoutId="active-nav-lang"
                          className="absolute inset-0 rounded bg-school-gold-500"
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1">
                        <span className="relative w-4 h-3 overflow-hidden rounded-sm shrink-0">
                          <Image
                            src={`/icons/flag-${loc}.svg`}
                            alt={localeNames[loc]}
                            fill
                            className="object-contain"
                            sizes="16px"
                          />
                        </span>
                        <span>{loc.toUpperCase()}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </LayoutGroup>
            </div>

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
                  <Link href={adminHref(locale)} onClick={() => setMobileOpen(false)}>
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
