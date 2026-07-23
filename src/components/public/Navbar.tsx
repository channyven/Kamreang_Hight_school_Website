"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, Heart, LogIn, ChevronDown } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";

interface NavLink {
  key: string;
  href: string;
}

interface NavDropdown {
  key: string;
  items: NavLink[];
}

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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
      { key: "contact", href: `/${locale}/contact` },
    ],
    [locale]
  );

  const navDropdowns: NavDropdown[] = useMemo(
    () => [
      {
        key: "resources",
        items: [
          { key: "report", href: `/${locale}/report` },
          { key: "document", href: `/${locale}/document` },
          { key: "schedule", href: `/${locale}/schedule` },
        ],
      },
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
      // For home page, match exactly or with trailing slash
      if (href === `/${locale}`) {
        return pathname === `/${locale}` || pathname === `/${locale}/`;
      }
      // Match the exact path or a proper sub-path (e.g., /en/news matches /en/news/article-1)
      // We check that it starts with href AND either it's the exact match or it's followed by a slash
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

            {navDropdowns.map((dropdown) => {
              const isDropdownActive = dropdown.items.some((item) =>
                isActive(item.href)
              );
              return (
                <div
                  key={dropdown.key}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(dropdown.key)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDropdown((o) =>
                        o === dropdown.key ? null : dropdown.key
                      )
                    }
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isDropdownActive
                        ? "bg-school-blue-800 text-white"
                        : isTransparent
                        ? "text-white/90 hover:text-white hover:bg-white/10"
                        : "text-gray-700 hover:text-school-blue-800 hover:bg-gray-100"
                    )}
                    aria-expanded={openDropdown === dropdown.key}
                  >
                    {t(dropdown.key as Parameters<typeof t>[0])}
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        openDropdown === dropdown.key && "rotate-180"
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {openDropdown === dropdown.key && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full pt-2 w-48"
                      >
                        <div className="bg-white rounded-lg shadow-lg ring-1 ring-black/5 py-1.5">
                          {dropdown.items.map((item) => (
                            <Link
                              key={item.key}
                              href={item.href}
                              onClick={() => setOpenDropdown(null)}
                              className={cn(
                                "block px-4 py-2 text-sm font-medium transition-colors",
                                isActive(item.href)
                                  ? "bg-school-blue-50 text-school-blue-800"
                                  : "text-gray-700 hover:bg-gray-100 hover:text-school-blue-800"
                              )}
                            >
                              {t(item.key as Parameters<typeof t>[0])}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
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

              {navDropdowns.map((dropdown) => {
                const isOpen = openDropdown === dropdown.key;
                const isDropdownActive = dropdown.items.some((item) =>
                  isActive(item.href)
                );
                return (
                  <div key={dropdown.key}>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdown((o) =>
                          o === dropdown.key ? null : dropdown.key
                        )
                      }
                      className={cn(
                        "flex w-full items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isDropdownActive
                          ? "bg-school-blue-800 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                      aria-expanded={isOpen}
                    >
                      <span>{t(dropdown.key as Parameters<typeof t>[0])}</span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="py-1 pl-4 space-y-1">
                            {dropdown.items.map((item) => (
                              <Link
                                key={item.key}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                  "block px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                  isActive(item.href)
                                    ? "bg-school-blue-50 text-school-blue-800"
                                    : "text-gray-700 hover:bg-gray-100"
                                )}
                              >
                                {t(item.key as Parameters<typeof t>[0])}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
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
