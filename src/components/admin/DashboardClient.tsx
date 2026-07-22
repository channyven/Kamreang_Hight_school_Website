"use client";

import { useLocale } from "next-intl";
import {
  Newspaper, MessageSquare,
  TrendingUp, TrendingDown, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { formatRelativeDate, adminHref, cn } from "@/utils";
import type { Message, AuditLog } from "@/types";
import VisitorChartWrapper from "@/components/admin/VisitorChartWrapper";

interface DashboardData {
  newsCount: number;
  unreadMessages: number;
  recentMessages: Message[];
  auditLogs: AuditLog[];
}

const ACTION_COLORS: Record<string, string> = {
  create: "#5d9738",
  publish: "#2c2a7a",
  update: "#c4951f",
  delete: "#dc2626",
  archive: "#848484",
  login: "#5451c3",
  logout: "#848484",
};

const ACTION_LABELS: Record<string, { km: string; en: string }> = {
  create: { km: "បានបង្កើត", en: "created" },
  update: { km: "បានកែប្រែ", en: "updated" },
  delete: { km: "បានលុប", en: "deleted" },
  publish: { km: "បានផ្សព្វផ្សាយ", en: "published" },
  archive: { km: "បានទុកក្នុងបណ្ណសារ", en: "archived" },
  login: { km: "បានចូលប្រព័ន្ធ", en: "logged in" },
  logout: { km: "បានចេញពីប្រព័ន្ធ", en: "logged out" },
};

const TABLE_LABELS: Record<string, { km: string; en: string }> = {
  news: { km: "ព័ត៌មាន", en: "news" },
  news_categories: { km: "ប្រភេទព័ត៌មាន", en: "news categories" },
  achievements: { km: "សមិទ្ធផល", en: "achievements" },
  hero_slides: { km: "ស្លាយពិពណ៌នា", en: "hero slides" },
  admin_users: { km: "អ្នកប្រើប្រាស់", en: "users" },
  teachers: { km: "គ្រូបង្រៀន", en: "teachers" },
  leadership: { km: "ថ្នាក់ដឹកនាំ", en: "leadership" },
  governance_items: { km: "អភិបាលកិច្ច", en: "governance" },
  downloads: { km: "ឯកសារ", en: "documents" },
  download_categories: { km: "ប្រភេទឯកសារ", en: "document categories" },
  messages: { km: "សារ", en: "messages" },
  settings: { km: "ការកំណត់", en: "settings" },
  school_info: { km: "ព័ត៌មានសាលា", en: "school info" },
  milestones: { km: "ព្រឹត្តិការណ៍សំខាន់", en: "milestones" },
  statistics: { km: "ស្ថិតិ", en: "statistics" },
  bank_accounts: { km: "គណនីធនាគារ", en: "bank accounts" },
  donation_purposes: { km: "គោលបំណងបរិច្ចាគ", en: "donation purposes" },
  donation_qr_codes: { km: "កូដ QR", en: "QR codes" },
};

function describeAuditLog(action: string, tableName: string, locale: string) {
  const actionLabel = ACTION_LABELS[action];
  const tableLabel = TABLE_LABELS[tableName];
  return {
    action: actionLabel ? actionLabel[locale === "km" ? "km" : "en"] : action,
    table: tableLabel
      ? tableLabel[locale === "km" ? "km" : "en"]
      : tableName.replace(/_/g, " "),
  };
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  const locale = useLocale();

  const now = new Date();
  const dateLabel = now.toLocaleDateString(locale === "km" ? "km-KH" : "en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const STAT_CARDS = [
    {
      label: locale === "km" ? "ព័ត៌មាន" : "News Articles",
      value: data.newsCount,
      icon: Newspaper,
      trend: +12,
      href: adminHref(locale, "news"),
      iconBg: "#f4f4fb",
      iconColor: "#2c2a7a",
    },
    {
      label: locale === "km" ? "សារមិនអាន" : "Unread Messages",
      value: data.unreadMessages,
      icon: MessageSquare,
      trend: data.unreadMessages > 0 ? -data.unreadMessages : 0,
      href: adminHref(locale, "messages"),
      iconBg: "#fef2f2",
      iconColor: "#dc2626",
    },
  ];

  return (
    <div className="min-h-full admin-page-bg">
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {locale === "km" ? "ទិដ្ឋភាពទូទៅ" : "Dashboard Overview"}
            </h1>
            <p className="text-sm mt-0.5 text-muted-foreground">{dateLabel}</p>
          </div>
          <Link
            href={adminHref(locale, "news/new")}
            className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold transition-all hover:opacity-90 shrink-0 bg-primary text-primary-foreground"
          >
            {locale === "km" ? "បង្ហោះអត្ថបទថ្មី" : "New Post"}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map(({ label, value, icon: Icon, trend, href, iconBg, iconColor }) => (
            <Link
              key={label}
              href={href}
              className="group block rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 admin-card-bg shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium mb-2 text-muted-foreground">{label}</p>
                  <p className="text-3xl font-bold tabular-nums text-primary">{value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {trend >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" style={{ color: "#5d9738" }} />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" style={{ color: "#dc2626" }} />
                    )}
                    <span
                      className="text-xs font-medium"
                      style={{ color: trend >= 0 ? "#5d9738" : "#dc2626" }}
                    >
                      {trend >= 0 ? `+${trend}` : trend} {locale === "km" ? "ថ្មី" : "new"}
                    </span>
                  </div>
                </div>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: iconBg }}
                >
                  <Icon className="w-5 h-5" style={{ color: iconColor }} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Chart + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Visitor Analytics */}
          <div className="lg:col-span-2 rounded-2xl p-5 admin-card-bg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  {locale === "km" ? "ស្ថិតិអ្នកចូលមើល" : "Visitor Analytics"}
                </h2>
                <p className="text-xs mt-0.5 text-muted-foreground">
                  {locale === "km" ? "សប្ដាហ៍ចុងក្រោយ" : "Last 7 days"}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 rounded inline-block bg-primary" />
                  {locale === "km" ? "សរុប" : "Total"}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 rounded inline-block bg-secondary" />
                  {locale === "km" ? "តែមួយគត់" : "Unique"}
                </span>
              </div>
            </div>
            <VisitorChartWrapper />
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl p-5 admin-card-bg shadow-sm">
            <h2 className="text-base font-semibold mb-4 text-foreground">
              {locale === "km" ? "សកម្មភាពថ្មីៗ" : "Recent Activity"}
            </h2>
            {data.auditLogs.length === 0 ? (
              <p className="text-sm text-center py-8 text-muted-foreground">
                {locale === "km" ? "មិនមានសកម្មភាព" : "No activity yet"}
              </p>
            ) : (
              <div className="space-y-3">
                {data.auditLogs.map((log) => {
                  const { action, table } = describeAuditLog(log.action, log.table_name, locale);
                  return (
                    <div key={log.id} className="flex items-start gap-3">
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ background: ACTION_COLORS[log.action] ?? "#848484" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs leading-snug text-foreground/70", locale === "km" && "font-khmer")}>
                          <span className="font-semibold">{log.user_email?.split("@")[0]}</span>{" "}
                          <span
                            className="font-medium"
                            style={{ color: ACTION_COLORS[log.action] ?? "#848484" }}
                          >
                            {action}
                          </span>{" "}
                          <span className="text-muted-foreground">{table}</span>
                        </p>
                        <p className="text-[11px] mt-0.5 text-muted-foreground/60">
                          {formatRelativeDate(log.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Messages table */}
        <div className="rounded-2xl overflow-hidden admin-card-bg shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">
              {locale === "km" ? "សារទំនក់ទំនងថ្មីៗ" : "Recent Messages"}
            </h2>
            <Link
              href={adminHref(locale, "messages")}
              className="text-sm font-medium flex items-center gap-1 transition-colors text-primary"
            >
              {locale === "km" ? "មើលទាំងអស់" : "View all"}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {data.recentMessages.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {locale === "km" ? "មិនមានសារ" : "No messages yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {[
                      locale === "km" ? "អ្នកផ្ញើ" : "Sender",
                      locale === "km" ? "ប្រធានបទ" : "Subject",
                      locale === "km" ? "ស្ថានភាព" : "Status",
                      locale === "km" ? "ទទួលបាន" : "Received",
                    ].map((col) => (
                      <th
                        key={col}
                        className={cn(
                          "text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                          locale === "km" && "font-khmer normal-case tracking-normal"
                        )}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentMessages.map((msg, i) => (
                    <tr
                      key={msg.id}
                      className={cn(
                        "transition-colors hover:bg-muted/50",
                        i < data.recentMessages.length - 1 ? "border-b border-border" : undefined
                      )}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-primary/10 text-primary">
                            {msg.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium leading-tight text-foreground">
                              {msg.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{msg.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 max-w-[200px]">
                        <p className="truncate text-foreground/70">{msg.subject}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            locale === "km" && "font-khmer",
                            msg.status === "unread"
                              ? "bg-destructive/10 text-destructive"
                              : msg.status === "replied"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-muted text-muted-foreground"
                          )}
                        >
                          {msg.status === "unread"
                            ? (locale === "km" ? "ថ្មី" : "New")
                            : msg.status === "replied"
                              ? (locale === "km" ? "បានឆ្លើយតប" : "Replied")
                              : (locale === "km" ? "បានអាន" : "Read")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {formatRelativeDate(msg.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
