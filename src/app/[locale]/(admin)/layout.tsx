import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { AuthProvider } from "@/providers/AuthContext";
import AdminGate from "@/components/admin/AdminGate";
import enMessages from "@/i18n/locales/en.json";

// AuthProvider (and the Firebase Auth SDK it loads) is scoped to /admin and
// /login only — public pages never call useAuth(), so they shouldn't pay
// for Firebase's bundle size or its onAuthStateChanged() network check.
//
// The admin panel is always English for staff/operators, regardless of the
// public site's EN/KM locale toggle (middleware.ts already redirects any
// /km/{admin-path}/... request to /en/...). We don't rely on that alone
// though — `setRequestLocale("en")` here forces every server-side
// getLocale()/getTranslations() call under /admin to resolve to English,
// and re-wrapping children in a NextIntlClientProvider with the English
// messages imported directly (not resolved from the request) forces every
// client-side useLocale()/useTranslations() call the same way. Both are
// self-contained: neither depends on the root layout, middleware, or
// request-scoped locale propagation actually reaching this render.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  setRequestLocale("en");

  return (
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <AuthProvider>
        <AdminGate>{children}</AdminGate>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
