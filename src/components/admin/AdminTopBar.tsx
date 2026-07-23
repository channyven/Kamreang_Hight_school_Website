"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ExternalLink, LogOut, Menu, Moon, Search, Sun } from "lucide-react";
import { locales, localeNames } from "@/i18n/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { motion, LayoutGroup } from "framer-motion";
import { useAuth } from "@/providers/AuthContext";
import { useTheme } from "@/hooks/use-theme";
import { getInitials, adminHref, cn } from "@/utils";
import { useAdminLocale } from "@/providers/AdminLocaleProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AdminTopBar() {
  const { user, logout } = useAuth();
  const { locale, switchLocale } = useAdminLocale();
  const t = useTranslations("admin");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { theme, toggleTheme, mounted } = useTheme();

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
      className="h-14 flex items-center justify-between px-5 sticky top-0 z-30 bg-background border-b border-border shadow-sm print:hidden"
    >
      {/* Left: mobile menu + search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          className="lg:hidden p-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 flex-1 h-9 px-3 rounded-xl text-sm bg-muted text-muted-foreground">
          <Search className="w-4 h-4 shrink-0" />
          <input
            type="text"
            placeholder={locale === "km" ? "ស្វែងរក..." : "Search…"}
            className={cn(
              "flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground text-foreground",
              locale === "km" && "font-khmer"
            )}
          />
        </div>
      </div>

      {/* Right: view site + dark mode toggle + language + user */}
      <div className="flex items-center gap-1.5">
        <Link
          href={`/${locale}`}
          target="_blank"
          className={cn(
            "hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm font-medium transition-colors mr-1 text-muted-foreground hover:text-primary hover:bg-muted",
            locale === "km" && "font-khmer"
          )}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {locale === "km" ? "មើលគេហទំព័រ" : "View Site"}
        </Link>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors text-muted-foreground hover:text-primary hover:bg-muted"
        >
          {mounted && theme === "dark" ? (
            <Sun style={{ width: 18, height: 18 }} />
          ) : (
            <Moon style={{ width: 18, height: 18 }} />
          )}
        </button>

        {/* Language switcher */}
        <LayoutGroup>
          <div className="flex items-center gap-0.5 h-9 rounded-xl px-1.5 bg-muted">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => switchLocale(loc)}
                className={cn(
                  "relative flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150",
                  locale === "km" && "font-khmer",
                  loc === locale
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-primary"
                )}
                title={localeNames[loc]}
              >
                {loc === locale && (
                  <motion.div
                    layoutId="active-lang"
                    className="absolute inset-0 rounded-lg bg-primary"
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

        {/* User dropdown */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 h-9 pl-2 pr-3 rounded-xl transition-colors ml-1 hover:bg-muted">
                <Avatar className="w-7 h-7">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback
                    className="text-xs font-bold text-white bg-primary"
                  >
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold leading-none text-primary">
                    {user.full_name}
                  </p>
                  <p
                    className={cn(
                      "text-[11px] leading-none mt-0.5 text-muted-foreground",
                      locale === "km" && "font-khmer"
                    )}
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
              <DropdownMenuItem onClick={() => setShowLogoutConfirm(true)} className="text-destructive gap-2">
                <LogOut className="w-3.5 h-3.5" />
                {t("logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
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
    </header>
  );
}
