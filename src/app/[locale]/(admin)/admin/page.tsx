import { createServerClient } from "@/lib/supabase";
import DashboardClient from "@/components/admin/DashboardClient";
import type { Message, AuditLog } from "@/types";

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

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return <DashboardClient data={data} />;
}
