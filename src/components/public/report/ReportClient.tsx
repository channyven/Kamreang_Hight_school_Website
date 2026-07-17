"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { cn } from "@/utils";
import { reportSections, type SchoolReport } from "@/lib/report-data";
import type { Locale } from "@/i18n/config";
import {
  SectionShell,
  getSectionIcon,
  GeneralInfoSection,
  TeachingHoursSection,
  StudentStatsSection,
  StaffStatusSection,
  FacilitiesSection,
  BudgetSection,
  ChallengesSection,
  FutureDirectionSection,
  BackToTop,
} from "./ReportSections";

export default function ReportClient({
  report,
  locale,
}: {
  report: SchoolReport;
  locale: Locale;
}) {
  const t = useTranslations("report");
  const [active, setActive] = useState(reportSections[0].id);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Scrollspy: highlight the section currently in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    reportSections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileNavOpen(false);
  };

  const navItems = reportSections.map((s) => ({
    id: s.id,
    label: t(s.id as Parameters<typeof t>[0]),
    icon: getSectionIcon(s.icon),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
      {/* ─── Desktop sticky nav ─── */}
      <aside className="hidden lg:block">
        <div className="sticky top-28">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 px-3">
            {t("on_this_page")}
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                    isActive
                      ? "bg-school-blue-800 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-school-blue-800"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="mt-4 px-3">
            <BackToTop label={t("back_to_top")} onClick={() => scrollTo(reportSections[0].id)} />
          </div>
        </div>
      </aside>

      {/* ─── Mobile nav (collapsible) ─── */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileNavOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm text-sm font-medium text-school-blue-900"
        >
          <span className="flex items-center gap-2">
            <Menu className="w-4 h-4" />
            {t("jump_to")}: {navItems.find((n) => n.id === active)?.label}
          </span>
          {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
        {mobileNavOpen && (
          <nav className="mt-2 bg-white border border-gray-200 rounded-xl shadow-sm p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                    isActive
                      ? "bg-school-blue-800 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* ─── Content ─── */}
      <div className="min-w-0">
        <SectionShell id="general" title={t("general")} icon={getSectionIcon("Info")}>
          <GeneralInfoSection data={report.general} locale={locale} />
        </SectionShell>

        <SectionShell id="teaching" title={t("teaching")} icon={getSectionIcon("Clock")}>
          <TeachingHoursSection data={report.teachingHours} locale={locale} />
        </SectionShell>

        <SectionShell id="students" title={t("students")} icon={getSectionIcon("Users")}>
          <StudentStatsSection data={report.studentStats} locale={locale} />
        </SectionShell>

        <SectionShell id="staff" title={t("staff")} icon={getSectionIcon("UserCheck")}>
          <StaffStatusSection data={report.staffStatus} locale={locale} />
        </SectionShell>

        <SectionShell id="facilities" title={t("facilities")} icon={getSectionIcon("Building2")}>
          <FacilitiesSection data={report.facilities} locale={locale} />
        </SectionShell>

        <SectionShell id="budget" title={t("budget")} icon={getSectionIcon("Wallet")}>
          <BudgetSection data={report.budget} locale={locale} />
        </SectionShell>

        <SectionShell id="challenges" title={t("challenges")} icon={getSectionIcon("AlertTriangle")}>
          <ChallengesSection data={report.challenges} locale={locale} />
        </SectionShell>

        <SectionShell id="future" title={t("future")} icon={getSectionIcon("Rocket")}>
          <FutureDirectionSection data={report.futureDirection} locale={locale} />
        </SectionShell>

        <div className="pt-6 lg:hidden">
          <BackToTop label={t("back_to_top")} onClick={() => scrollTo(reportSections[0].id)} />
        </div>
      </div>
    </div>
  );
}
