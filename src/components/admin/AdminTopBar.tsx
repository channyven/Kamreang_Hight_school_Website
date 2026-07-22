"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Bell, ExternalLink, LogOut, Menu, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/AuthContext";
import { getInitials, adminHref, cn } from "@/utils";
import type { Locale } from "@/i18n/config";

export default function AdminTopBar() {
  const { user, logout } = useAuth();
  const locale = useLocale() as Locale;
  const t = useTranslations("admin");

  const roleLabel =
    user?.role === "administrator"
      ? t("role_administrator")
      : user?.role === "director"
        ? t("role_director")
        : user?.role === "editor"
          ? t("role_editor")
          : user?.role;

  return (
    <header
      className="h-14 flex items-center justify-between px-5 sticky top-0 z-30"
      style={{
        background: "#fff",
        borderBottom: "1px solid #f4f4f4",
        boxShadow: "0 1px 3px rgba(44,42,122,0.04)",
      }}
    >
      {/* Left: mobile menu + search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          className="lg:hidden p-2 rounded-lg transition-colors"
          style={{ color: "#848484" }}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div
          className="hidden sm:flex items-center gap-2 flex-1 h-9 px-3 rounded-xl text-sm"
          style={{ background: "#f4f4f4", color: "#848484" }}
        >
          <Search className="w-4 h-4 shrink-0" />
          <input
            type="text"
            placeholder={locale === "km" ? "ស្វែងរក..." : "Search…"}
            className={cn(
              "flex-1 bg-transparent outline-none text-sm placeholder:text-current",
              locale === "km" && "font-khmer"
            )}
            style={{ color: "#636363" }}
          />
        </div>
      </div>

      {/* Right: view site + bell + user */}
      <div className="flex items-center gap-1.5">
        <Link
          href={`/${locale}`}
          target="_blank"
          className={cn(
            "hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm font-medium transition-colors mr-1",
            locale === "km" && "font-khmer"
          )}
          style={{ color: "#848484" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#2c2a7a")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#848484")}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {locale === "km" ? "មើលគេហទំព័រ" : "View Site"}
        </Link>

        {/* Notification bell */}
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
          style={{ color: "#848484" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f4f4f4")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <Bell className="w-5 h-5" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
            style={{ background: "#ef4444" }}
          />
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          title={t("logout")}
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
          style={{ color: "#848484" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#fef2f2";
            e.currentTarget.style.color = "#dc2626";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#848484";
          }}
        >
          <LogOut className="w-5 h-5" />
        </button>

        {/* User dropdown */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2.5 h-9 pl-2 pr-3 rounded-xl transition-colors ml-1"
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f4f4f4")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Avatar className="w-7 h-7">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback
                    className="text-xs font-bold text-white"
                    style={{ background: "#2c2a7a" }}
                  >
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold leading-none" style={{ color: "#2c2a7a" }}>
                    {user.full_name}
                  </p>
                  <p
                    className={cn("text-[11px] leading-none mt-0.5", locale === "km" && "font-khmer")}
                    style={{ color: "#848484" }}
                  >
                    {roleLabel}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={cn("w-48", locale === "km" && "font-khmer")}>
              <DropdownMenuItem asChild>
                <Link href={adminHref(locale, "profile")}>{t("profile")}</Link>
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
