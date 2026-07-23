"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("errors.404");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <p className="text-[12rem] font-black leading-none text-school-blue-800/10 select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-1 bg-school-gold-500 rounded-full" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t("title")}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {t("description")}
        </p>
        
        <Link
          href="/"
          className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-school-blue-800 text-white font-semibold transition-all hover:bg-school-blue-900 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          {t("back_home")}
        </Link>
      </div>
    </div>
  );
}
