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
  GraduationCap, Landmark, FileBarChart, CalendarDays,
} from "lucide-react";
import { useAuth } from "@/providers/AuthContext";
import { cn } from "@/utils";
import type { Locale } from "@/i18n/config";

interface NavItem {
  key: string;
  href: string;
  icon: React.ReactNode;
  permission?: string;
}

interface NavGroup {
  label: string;
  keys: string[];
}

const NAV_GROUPS: NavGroup[] = [
  { label: "Overview", keys: ["dashboard", "statistics"] },
  { label: "Content", keys: ["news", "achievements", "teachers", "documents", "reports", "governance", "about", "calendar"] },
  { label: "Inbox", keys: ["messages"] },
  { label: "System", keys: ["users", "settings"] },
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
      { key: "dashboard", href: `/${locale}/admin`, icon: <LayoutDashboard className="w-4 h-4" /> },
      { key: "statistics", href: `/${locale}/admin/statistics`, icon: <BarChart3 className="w-4 h-4" /> },
      { key: "news", href: `/${locale}/admin/news`, icon: <Newspaper className="w-4 h-4" /> },
      { key: "achievements", href: `/${locale}/admin/achievements`, icon: <Trophy className="w-4 h-4" /> },
      { key: "teachers", href: `/${locale}/admin/teachers`, icon: <GraduationCap className="w-4 h-4" /> },
      { key: "documents", href: `/${locale}/admin/documents`, icon: <FileText className="w-4 h-4" /> },
      { key: "reports", href: `/${locale}/admin/reports`, icon: <FileBarChart className="w-4 h-4" /> },
      { key: "governance", href: `/${locale}/admin/governance`, icon: <Landmark className="w-4 h-4" /> },
      { key: "about", href: `/${locale}/admin/about`, icon: <FileText className="w-4 h-4" /> },
      { key: "calendar", href: `/${locale}/admin/calendar`, icon: <CalendarDays className="w-4 h-4" /> },
      { key: "messages", href: `/${locale}/admin/messages`, icon: <MessageSquare className="w-4 h-4" /> },
      { key: "users", href: `/${locale}/admin/users`, icon: <Users className="w-4 h-4" />, permission: "canManageUsers" },
      { key: "settings", href: `/${locale}/admin/settings`, icon: <Settings className="w-4 h-4" />, permission: "canManageSettings" },
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
      if (href === `/${locale}/admin`) return pathname === `/${locale}/admin`;
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
          style={{ background: "#fdbc13" }}
        >
          <School className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight">
              {t("admin_portal")}
            </p>
            <p className="text-xs leading-tight mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
              {process.env.NEXT_PUBLIC_SCHOOL_NAME_EN ?? "Kamrieng High School"}
            </p>
          </div>
        )}
      </div>

      {/* Create New Post CTA */}
      {!collapsed && (
        <div className="px-3 pt-4 pb-2">
          <Link
            href={`/${locale}/admin/news/new`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ background: "#fdbc13", color: "#0d1b38" }}
          >
            <Plus className="w-4 h-4" />
            {t("create_new_post")}
          </Link>
        </div>
      )}
      {collapsed && (
        <div className="px-2 pt-4 pb-2">
          <Link
            href={`/${locale}/admin/news/new`}
            className="flex items-center justify-center w-full py-2.5 rounded-xl transition-all duration-200 hover:opacity-90"
            style={{ background: "#fdbc13", color: "#0d1b38" }}
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
            <div key={group.label} className="mb-4">
              {!collapsed && (
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-1"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {group.label}
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
                          ? { background: "rgba(253,188,19,0.15)", color: "#fdbc13" }
                          : { color: "rgba(255,255,255,0.5)" }
                      }
                    >
                      {active && !collapsed && (
                        <span
                          className="absolute left-0 w-0.5 h-6 rounded-r"
                          style={{ background: "#fdbc13" }}
                        />
                      )}
                      <span className="shrink-0">{item.icon}</span>
                      {!collapsed && (
                        <span>{t(item.key as Parameters<typeof t>[0])}</span>
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
              style={{ background: "rgba(253,188,19,0.2)", color: "#fdbc13" }}
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
          {!collapsed && <span>{t("logout")}</span>}
        </button>
      </div>

      {/* Collapse toggle (desktop) */}
      <button
        className="hidden lg:flex absolute -right-3.5 top-20 w-7 h-7 rounded-full items-center justify-center text-white border transition-all duration-150"
        style={{ background: "#0d1b38", borderColor: "rgba(255,255,255,0.12)" }}
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
        style={{ background: "#0d1b38" }}
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
              style={{ background: "#0d1b38" }}
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
