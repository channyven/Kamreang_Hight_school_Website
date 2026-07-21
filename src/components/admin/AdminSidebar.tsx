"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Newspaper, Trophy, FileText,
  MessageSquare, Users, Settings, BarChart3,
  School, ChevronLeft, ChevronRight, LogOut, X, Plus,
  GraduationCap, Landmark, Heart, Image as ImageIcon, Phone,
} from "lucide-react";
import { useAuth } from "@/providers/AuthContext";
import { cn, adminHref } from "@/utils";
import type { Locale } from "@/i18n/config";

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
  { labelKey: "nav_group_content", keys: ["hero_slides", "about", "teachers", "governance", "news", "achievements", "documents", "contact", "donate"] },
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

  const allNavItems: NavItem[] = useMemo(
    () => [
      { key: "dashboard", href: adminHref(locale), icon: <LayoutDashboard className="w-4 h-4" /> },
      { key: "statistics", href: adminHref(locale, "statistics"), icon: <BarChart3 className="w-4 h-4" /> },
      { key: "hero_slides", href: adminHref(locale, "hero-slides"), icon: <ImageIcon className="w-4 h-4" /> },
      { key: "about", href: adminHref(locale, "about"), icon: <FileText className="w-4 h-4" /> },
      { key: "teachers", href: adminHref(locale, "teachers"), icon: <GraduationCap className="w-4 h-4" /> },
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

  const isActive = useCallback(
    (href: string) => {
      if (href === adminHref(locale)) return pathname === adminHref(locale);
      return pathname.startsWith(href);
    },
    [locale, pathname]
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full relative">
      {/* Brand */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-5 border-b",
          collapsed ? "justify-center px-3" : ""
        )}
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "#dfad32" }}
        >
          <School className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className={cn("text-sm font-bold text-white leading-tight", locale === "km" && "font-khmer")}>
              {t("portal_name")}
            </p>
            <p className="text-xs leading-tight mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
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
              "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95",
              locale === "km" && "font-khmer"
            )}
            style={{ background: "#dfad32", color: "#191845" }}
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
            className="flex items-center justify-center w-full py-2.5 rounded-xl transition-all duration-200 hover:opacity-90"
            style={{ background: "#dfad32", color: "#191845" }}
            title={t("create_new_post")}
          >
            <Plus className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Nav groups */}
      <nav className="flex-1 px-3 pb-3 overflow-y-auto scrollbar-thin" style={{ paddingTop: 8 }}>
        {NAV_GROUPS.map((group) => {
          const groupItems = visibleItems.filter((i) => group.keys.includes(i.key));
          if (groupItems.length === 0) return null;
          return (
            <div key={group.labelKey} className="mb-4">
              {!collapsed && (
                <p
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-widest px-3 mb-1",
                    locale === "km" && "font-khmer normal-case tracking-normal"
                  )}
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {t(group.labelKey as Parameters<typeof t>[0])}
                </p>
              )}
              <div className="space-y-0.5">
                {groupItems.map((item) => {
                  const active = isActive(item.href);
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
                          ? "text-white"
                          : "hover:text-white"
                      )}
                      style={
                        active
                          ? { background: "rgba(223,173,50,0.15)", color: "#dfad32" }
                          : { color: "rgba(255,255,255,0.5)" }
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
      <div
        className="px-3 py-3 border-t"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-1 mb-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: "rgba(223,173,50,0.2)", color: "#dfad32" }}
            >
              {user.full_name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate leading-tight">{user.full_name}</p>
              <p className="text-[11px] truncate leading-tight" style={{ color: "rgba(255,255,255,0.4)" }}>
                {user.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          title={t("logout")}
          className={cn(
            "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors",
            collapsed ? "justify-center" : ""
          )}
          style={{ color: "rgba(255,255,255,0.45)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className={cn(locale === "km" && "font-khmer")}>{t("logout")}</span>}
        </button>
      </div>

      {/* Collapse toggle (desktop) */}
      <button
        className="hidden lg:flex absolute -right-3.5 top-20 w-7 h-7 rounded-full items-center justify-center text-white border transition-all duration-150"
        style={{ background: "#191845", borderColor: "rgba(255,255,255,0.12)" }}
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
          "hidden lg:flex flex-col fixed top-0 left-0 h-full transition-all duration-300 z-40",
          collapsed ? "w-16" : "w-60"
        )}
        style={{ background: "#191845" }}
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
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="lg:hidden fixed top-0 left-0 h-full w-60 z-50"
              style={{ background: "#191845" }}
            >
              <button
                className="absolute top-4 right-4 hover:text-white transition-colors"
                style={{ color: "rgba(255,255,255,0.5)" }}
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
