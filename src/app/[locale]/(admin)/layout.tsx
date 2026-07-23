import { setRequestLocale } from "next-intl/server";
import { AuthProvider } from "@/providers/AuthContext";
import { AdminLocaleProvider } from "@/providers/AdminLocaleProvider";
import AdminGate from "@/components/admin/AdminGate";
import enMessages from "@/i18n/locales/en.json";
import kmMessages from "@/i18n/locales/km.json";
import { locales, type Locale } from "@/i18n/config";

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;
  const validLocale = locales.includes(locale as Locale) ? (locale as Locale) : "en";

  setRequestLocale(validLocale);

  return (
    <AdminLocaleProvider initialLocale={validLocale} enMessages={enMessages} kmMessages={kmMessages}>
      <AuthProvider>
        <AdminGate>{children}</AdminGate>
      </AuthProvider>
    </AdminLocaleProvider>
  );
}
