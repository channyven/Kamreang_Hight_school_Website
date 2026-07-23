"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { NextIntlClientProvider } from "next-intl";
import type { AbstractIntlMessages } from "next-intl";
import type { Locale } from "@/i18n/config";

interface AdminLocaleContextValue {
  locale: Locale;
  switchLocale: (newLocale: Locale) => void;
}

const AdminLocaleContext = createContext<AdminLocaleContextValue | null>(null);

export function AdminLocaleProvider({
  children,
  initialLocale,
  enMessages,
  kmMessages,
}: {
  children: ReactNode;
  initialLocale: Locale;
  enMessages: AbstractIntlMessages;
  kmMessages: AbstractIntlMessages;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  // Sync the browser URL with the current locale without a page reload
  useEffect(() => {
    const pathname = window.location.pathname;
    const currentPrefix = pathname.match(/^\/(km|en)\//)?.[1];
    if (currentPrefix && currentPrefix !== locale) {
      const newPathname = pathname.replace(/^\/(?:km|en)\//, `/${locale}/`);
      window.history.replaceState(null, "", newPathname);
    }
  }, [locale]);

  const switchLocale = useCallback((newLocale: Locale) => {
    setLocale((prev) => (newLocale === prev ? prev : newLocale));
  }, []);

  const messages = locale === "km" ? kmMessages : enMessages;

  return (
    <AdminLocaleContext.Provider value={{ locale, switchLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </AdminLocaleContext.Provider>
  );
}

export function useAdminLocale() {
  const ctx = useContext(AdminLocaleContext);
  if (!ctx) throw new Error("useAdminLocale must be used within AdminLocaleProvider");
  return ctx;
}
