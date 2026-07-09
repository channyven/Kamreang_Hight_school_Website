"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Bell, ExternalLink, Menu, Search, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/lib/utils";
import type { Locale } from "@/i18n/config";

const ROLE_LABELS: Record<string, string> = {
  administrator: "Administrator",
  director: "Director",
  editor: "Content Editor",
};

export default function AdminTopBar() {
  const { user, logout } = useAuth();
  const locale = useLocale() as Locale;
  const t = useTranslations("admin");

  return (
    <header
      className="h-14 flex items-center justify-between px-5 sticky top-0 z-30"
      style={{
        background: "#fff",
        borderBottom: "1px solid #eaeff6",
        boxShadow: "0 1px 3px rgba(13,27,56,0.04)",
      }}
    >
      {/* Left: mobile menu + search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          className="lg:hidden p-2 rounded-lg transition-colors"
          style={{ color: "#8892a0" }}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div
          className="hidden sm:flex items-center gap-2 flex-1 h-9 px-3 rounded-xl text-sm"
          style={{ background: "#f4f6fb", color: "#8892a0" }}
        >
          <Search className="w-4 h-4 shrink-0" />
          <input
            type="text"
            placeholder={locale === "km" ? "ស្វែងរក..." : "Search…"}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-current"
            style={{ color: "#434750" }}
          />
        </div>
      </div>

      {/* Right: view site + bell + user */}
      <div className="flex items-center gap-1.5">
        <Link
          href={`/${locale}`}
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm font-medium transition-colors mr-1"
          style={{ color: "#8892a0" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#00376f")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#8892a0")}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {locale === "km" ? "មើលគេហទំព័រ" : "View Site"}
        </Link>

        {/* Notification bell */}
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
          style={{ color: "#8892a0" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f4f6fb")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <Bell className="w-5 h-5" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
            style={{ background: "#ef4444" }}
          />
        </button>

        {/* User dropdown */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2.5 h-9 pl-2 pr-3 rounded-xl transition-colors ml-1"
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f4f6fb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Avatar className="w-7 h-7">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback
                    className="text-xs font-bold text-white"
                    style={{ background: "#00376f" }}
                  >
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold leading-none" style={{ color: "#0d1c2f" }}>
                    {user.full_name}
                  </p>
                  <p className="text-[11px] leading-none mt-0.5" style={{ color: "#8892a0" }}>
                    {ROLE_LABELS[user.role] ?? user.role}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/admin/profile`}>{t("profile")}</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 gap-2">
                <LogOut className="w-3.5 h-3.5" />
                {t("logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
