"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Newspaper, Trophy, FileText,
  MessageSquare, Users, Settings, BarChart3,
  ChevronLeft, ChevronRight, LogOut, X, Plus,
  GraduationCap, Landmark, BookOpen, Heart, Image as ImageIcon, Phone,
} from "lucide-react";
import { useAuth } from "@/providers/AuthContext";
import { cn, adminHref } from "@/utils";
import type { Locale } from "@/i18n/config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface NavItem {
  key: string;
  href: string;
  icon: React.ReactNode;
  permission?: string;
}

interface NavGroup {
  labelKey: string;
  keys: string[];
}

const NAV_GROUPS: NavGroup[] = [
  { labelKey: "nav_group_overview", keys: ["dashboard", "statistics"] },
  { labelKey: "nav_group_content", keys: ["hero_slides", "about", "teachers", "students", "governance", "news", "achievements", "documents", "contact", "donate"] },
  { labelKey: "nav_group_inbox", keys: ["messages"] },
  { labelKey: "nav_group_system", keys: ["users", "settings"] },
];

export default function AdminSidebar() {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const { user, logout, hasPermission } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const allNavItems: NavItem[] = useMemo(
    () => [
      { key: "dashboard", href: adminHref(locale), icon: <LayoutDashboard className="w-4 h-4" /> },
      { key: "statistics", href: adminHref(locale, "statistics"), icon: <BarChart3 className="w-4 h-4" /> },
      { key: "hero_slides", href: adminHref(locale, "hero-slides"), icon: <ImageIcon className="w-4 h-4" /> },
      { key: "about", href: adminHref(locale, "about"), icon: <FileText className="w-4 h-4" /> },
      { key: "teachers", href: adminHref(locale, "teachers"), icon: <GraduationCap className="w-4 h-4" /> },
      { key: "students", href: adminHref(locale, "students"), icon: <BookOpen className="w-4 h-4" />, permission: "canManageStudents" },
      { key: "governance", href: adminHref(locale, "governance"), icon: <Landmark className="w-4 h-4" /> },
      { key: "news", href: adminHref(locale, "news"), icon: <Newspaper className="w-4 h-4" /> },
      { key: "achievements", href: adminHref(locale, "achievements"), icon: <Trophy className="w-4 h-4" /> },
      { key: "documents", href: adminHref(locale, "documents"), icon: <FileText className="w-4 h-4" /> },
      { key: "contact", href: adminHref(locale, "contact"), icon: <Phone className="w-4 h-4" /> },
      { key: "donate", href: adminHref(locale, "donate"), icon: <Heart className="w-4 h-4" /> },
      { key: "messages", href: adminHref(locale, "messages"), icon: <MessageSquare className="w-4 h-4" /> },
      { key: "users", href: adminHref(locale, "users"), icon: <Users className="w-4 h-4" />, permission: "canManageUsers" },
      { key: "settings", href: adminHref(locale, "settings"), icon: <Settings className="w-4 h-4" />, permission: "canManageSettings" },
    ],
    [locale]
  );

  const visibleItems = useMemo(
    () =>
      allNavItems.filter(
        (item) => !item.permission || hasPermission(item.permission as Parameters<typeof hasPermission>[0])
      ),
    [allNavItems, hasPermission]
  );

  // Compute the single best-matching nav item so that parent routes like
  // /students don't stay highlighted when a child route like /students/123/edit is active.
  const activeHref = useMemo(() => {
    let best = "";
    let bestLen = 0;
    const base = adminHref(locale);

    for (const item of visibleItems) {
      const href = item.href;

      // Dashboard: exact match only
      if (href === base) {
        if (pathname === base) return href;
        continue;
      }

      // Check if pathname matches this href as a proper URL segment boundary.
      // This prevents /students from matching /students-cards or /students_extra,
      // while still matching /students/123.
      if (pathname === href || pathname.startsWith(href + "/")) {
        if (href.length > bestLen) {
          best = href;
          bestLen = href.length;
        }
      }
    }

    return best;
  }, [visibleItems, pathname, locale]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full relative">
      {/* Brand */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-5 border-b border-[rgba(255,255,255,0.08)]",
          collapsed ? "justify-center px-3" : ""
        )}
      >
        <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 ring-2 ring-white/20">
          <Image
            src="/images/about/kamrieng%20high%20school.jpg"
            alt="School logo"
            fill
            className="object-cover"
            sizes="36px"
          />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className={cn("text-sm font-bold text-white leading-tight", locale === "km" && "font-khmer")}>
              {t("portal_name")}
            </p>
            <p className="text-xs leading-tight mt-0.5 text-[rgba(255,255,255,0.45)]">
              {locale === "km"
                ? (process.env.NEXT_PUBLIC_SCHOOL_NAME_KM ?? "វិទ្យាល័យកំរៀង")
                : (process.env.NEXT_PUBLIC_SCHOOL_NAME_EN ?? "Kamrieng High School")}
            </p>
          </div>
        )}
      </div>

      {/* Create New Post CTA */}
      {!collapsed && (
        <div className="px-3 pt-4 pb-2">
          <Link
            href={adminHref(locale, "news/new")}
            className={cn(
              "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95 bg-secondary text-secondary-foreground",
              locale === "km" && "font-khmer"
            )}
          >
            <Plus className="w-4 h-4" />
            {t("create_new_post")}
          </Link>
        </div>
      )}
      {collapsed && (
        <div className="px-2 pt-4 pb-2">
          <Link
            href={adminHref(locale, "news/new")}
            className="flex items-center justify-center w-full py-2.5 rounded-xl transition-all duration-200 hover:opacity-90 bg-secondary text-secondary-foreground"
            title={t("create_new_post")}
          >
            <Plus className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Nav groups */}
      <nav className="flex-1 px-3 pb-3 overflow-y-auto scrollbar-thin" style={{ paddingTop: "8px" }}>
        {NAV_GROUPS.map((group) => {
          const groupItems = visibleItems.filter((i) => group.keys.includes(i.key));
          if (groupItems.length === 0) return null;
          return (
            <div key={group.labelKey} className="mb-4">
              {!collapsed && (
                <p
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-widest px-3 mb-1 text-[rgba(255,255,255,0.3)]",
                    locale === "km" && "font-khmer normal-case tracking-normal"
                  )}
                >
                  {t(group.labelKey as Parameters<typeof t>[0])}
                </p>
              )}
              <div className="space-y-0.5">
                {groupItems.map((item) => {
                  const active = item.href === activeHref;
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? t(item.key as Parameters<typeof t>[0]) : undefined}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                        collapsed && "justify-center px-2",
                        active
                          ? "text-[#dfad32]"
                          : "text-[rgba(255,255,255,0.5)] hover:text-white"
                      )}
                      style={
                        active
                          ? { background: "rgba(223,173,50,0.15)" }
                          : {}
                      }
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {!collapsed && (
                        <span className={cn(locale === "km" && "font-khmer")}>
                          {t(item.key as Parameters<typeof t>[0])}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-[rgba(255,255,255,0.08)]">
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-1 mb-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-[rgba(223,173,50,0.2)] text-[#dfad32]">
              {user.full_name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate leading-tight">{user.full_name}</p>
              <p className="text-[11px] truncate leading-tight text-[rgba(255,255,255,0.4)]">
                {user.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          title={t("logout")}
          className={cn(
            "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors text-[rgba(255,255,255,0.45)] hover:text-white",
            collapsed ? "justify-center" : ""
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className={cn(locale === "km" && "font-khmer")}>{t("logout")}</span>}
        </button>
      </div>

      {/* Logout confirmation dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-[380px] !gap-0 overflow-hidden p-0">
          <div className="px-7 pt-7 pb-5">
            <DialogHeader className="!block">
              <DialogTitle className={cn("text-xl font-bold text-center", locale === "km" && "font-khmer")}>
                {locale === "km" ? "បញ្ជាក់ការចាកចេញ" : "Confirm Sign Out"}
              </DialogTitle>
              <DialogDescription className={cn("text-center text-sm mt-3 leading-relaxed", locale === "km" && "font-khmer")}>
                {locale === "km"
                  ? "តើអ្នកប្រាកដថាចង់ចាកចេញពីប្រព័ន្ធគ្រប់គ្រងឬទេ?"
                  : "Are you sure you want to sign out of the admin panel?"}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Separator */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          <DialogFooter className="gap-[30px] px-7 py-4">
            <Button
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
              className={cn(
                "flex-1 transition-all duration-200 hover:bg-gray-100",
                locale === "km" && "font-khmer"
              )}
            >
              {locale === "km" ? "បោះបង់" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowLogoutConfirm(false);
                logout();
              }}
              className={cn(
                "flex-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
                locale === "km" && "font-khmer"
              )}
            >
              {locale === "km" ? "ចាកចេញ" : "Sign Out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Collapse toggle (desktop) */}
      <button
        className="hidden lg:flex absolute -right-3.5 top-20 w-7 h-7 rounded-full items-center justify-center text-white border border-[rgba(255,255,255,0.12)] transition-all duration-150"
        style={{ background: "hsl(var(--admin-sidebar-bg))" }}
        onClick={() => setCollapsed((c) => !c)}
      >
        {collapsed
          ? <ChevronRight className="w-3.5 h-3.5" />
          : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed top-0 left-0 h-full transition-all duration-300 z-40 print:hidden",
          collapsed ? "w-16" : "w-60"
        )}
        style={{ background: "hsl(var(--admin-sidebar-bg))" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40 print:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="lg:hidden fixed top-0 left-0 h-full w-60 z-50 print:hidden"
              style={{ background: "hsl(var(--admin-sidebar-bg))" }}
            >
              <button
                className="absolute top-4 right-4 hover:text-white transition-colors text-[rgba(255,255,255,0.5)]"
                onClick={() => setMobileOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
