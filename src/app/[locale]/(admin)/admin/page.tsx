import { createServerClient } from "@/lib/supabase";
import { getLocale } from "next-intl/server";
import {
  Newspaper, MessageSquare,
  TrendingUp, TrendingDown, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { formatRelativeDate } from "@/utils";
import type { Message, AuditLog } from "@/types";
import VisitorChartWrapper from "@/components/admin/VisitorChartWrapper";
import AdminMessagesTable from "@/components/admin/AdminMessagesTable";

async function getDashboardData() {
  const supabase = createServerClient();
  const [newsCount, unreadMessages, recentMessages, auditLogs] =
    await Promise.all([
      supabase.from("news").select("*", { count: "exact", head: true }),
      supabase.from("messages").select("*", { count: "exact", head: true }).eq("status", "unread"),
      supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(6),
      supabase.from("admin_audit_logs").select("*").order("created_at", { ascending: false }).limit(8),
    ]);

  return {
    newsCount: newsCount.count ?? 0,
    unreadMessages: unreadMessages.count ?? 0,
    recentMessages: (recentMessages.data ?? []) as Message[],
    auditLogs: (auditLogs.data ?? []) as AuditLog[],
  };
}

const ACTION_COLORS: Record<string, string> = {
  create: "#16a34a",
  publish: "#2563eb",
  update: "#d97706",
  delete: "#dc2626",
  archive: "#7c3aed",
  login: "#0891b2",
  logout: "#8892a0",
};

export default async function AdminDashboardPage() {
  const locale = await getLocale();
  const data = await getDashboardData();

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
      href: `/${locale}/admin/news`,
      iconBg: "#e8f0fe",
      iconColor: "#1a56db",
    },
    {
      label: locale === "km" ? "សារមិនអាន" : "Unread Messages",
      value: data.unreadMessages,
      icon: MessageSquare,
      trend: data.unreadMessages > 0 ? -data.unreadMessages : 0,
      href: `/${locale}/admin/messages`,
      iconBg: "#fef2f2",
      iconColor: "#dc2626",
    },
  ];

  return (
    <div className="min-h-full" style={{ background: "#f4f6fb" }}>
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#0d1c2f" }}>
              {locale === "km" ? "ទិដ្ឋភាពទូទៅ" : "Dashboard Overview"}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#8892a0" }}>{dateLabel}</p>
          </div>
          <Link
            href={`/${locale}/admin/news/new`}
            className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold transition-all hover:opacity-90 shrink-0"
            style={{ background: "#00376f", color: "#fff" }}
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
              className="group block rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "#fff",
                boxShadow: "0px 2px 12px rgba(13,27,56,0.06)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: "#8892a0" }}>{label}</p>
                  <p className="text-3xl font-bold tabular-nums" style={{ color: "#0d1c2f" }}>{value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {trend >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" style={{ color: "#16a34a" }} />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" style={{ color: "#dc2626" }} />
                    )}
                    <span
                      className="text-xs font-medium"
                      style={{ color: trend >= 0 ? "#16a34a" : "#dc2626" }}
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
          <div
            className="lg:col-span-2 rounded-2xl p-5"
            style={{ background: "#fff", boxShadow: "0px 2px 12px rgba(13,27,56,0.06)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold" style={{ color: "#0d1c2f" }}>
                  {locale === "km" ? "ស្ថិតិអ្នកចូលមើល" : "Visitor Analytics"}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "#8892a0" }}>
                  {locale === "km" ? "សប្ដាហ៍ចុងក្រោយ" : "Last 7 days"}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs" style={{ color: "#8892a0" }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 rounded inline-block" style={{ background: "#00376f" }} />
                  {locale === "km" ? "សរុប" : "Total"}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 rounded inline-block" style={{ background: "#fdbc13" }} />
                  {locale === "km" ? "តែមួយគត់" : "Unique"}
                </span>
              </div>
            </div>
            <VisitorChartWrapper />
          </div>

          {/* Recent Activity */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "#fff", boxShadow: "0px 2px 12px rgba(13,27,56,0.06)" }}
          >
            <h2 className="text-base font-semibold mb-4" style={{ color: "#0d1c2f" }}>
              {locale === "km" ? "សកម្មភាពថ្មីៗ" : "Recent Activity"}
            </h2>
            {data.auditLogs.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "#c0c8d4" }}>
                {locale === "km" ? "មិនមានសកម្មភាព" : "No activity yet"}
              </p>
            ) : (
              <div className="space-y-3">
                {data.auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      style={{ background: ACTION_COLORS[log.action] ?? "#8892a0" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-snug" style={{ color: "#434750" }}>
                        <span className="font-semibold">{log.user_email?.split("@")[0]}</span>{" "}
                        <span
                          className="font-medium"
                          style={{ color: ACTION_COLORS[log.action] ?? "#8892a0" }}
                        >
                          {log.action}
                        </span>{" "}
                        <span style={{ color: "#8892a0" }}>{log.table_name}</span>
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: "#c0c8d4" }}>
                        {formatRelativeDate(log.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Messages table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#fff", boxShadow: "0px 2px 12px rgba(13,27,56,0.06)" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: "#eaeff6" }}
          >
            <h2 className="text-base font-semibold" style={{ color: "#0d1c2f" }}>
              {locale === "km" ? "សារទំនក់ទំនងថ្មីៗ" : "Recent Messages"}
            </h2>
            <Link
              href={`/${locale}/admin/messages`}
              className="text-sm font-medium flex items-center gap-1 transition-colors"
              style={{ color: "#00376f" }}
            >
              {locale === "km" ? "មើលទាំងអស់" : "View all"}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {data.recentMessages.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-2" style={{ color: "#c0c8d4" }} />
              <p className="text-sm" style={{ color: "#c0c8d4" }}>
                {locale === "km" ? "មិនមានសារ" : "No messages yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid #eaeff6" }}>
                    {["Sender", "Subject", "Status", "Received"].map((col) => (
                      <th
                        key={col}
                        className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "#8892a0" }}
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
                      className="transition-colors hover:[background:#f8faff]"
                      style={{
                        borderBottom: i < data.recentMessages.length - 1 ? "1px solid #eaeff6" : undefined,
                      }}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ background: "#e8f0fe", color: "#1a56db" }}
                          >
                            {msg.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium leading-tight" style={{ color: "#0d1c2f" }}>
                              {msg.name}
                            </p>
                            <p className="text-xs" style={{ color: "#8892a0" }}>{msg.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 max-w-[200px]">
                        <p className="truncate" style={{ color: "#434750" }}>{msg.subject}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={
                            msg.status === "unread"
                              ? { background: "#fef2f2", color: "#dc2626" }
                              : msg.status === "replied"
                                ? { background: "#dcfce7", color: "#15803d" }
                                : { background: "#f4f6fb", color: "#8892a0" }
                          }
                        >
                          {msg.status === "unread" ? "New" : msg.status === "replied" ? "Replied" : "Read"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: "#8892a0" }}>
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
