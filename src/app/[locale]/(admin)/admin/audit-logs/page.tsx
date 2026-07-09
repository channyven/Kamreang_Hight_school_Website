import { createServerClient } from "@/lib/supabase";
import { getLocale } from "next-intl/server";
import { formatRelativeDate, formatShortDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { AuditLog } from "@/types";

const ACTION_COLORS: Record<string, "default" | "success" | "warning" | "destructive"> = {
  INSERT: "success",
  UPDATE: "warning",
  DELETE: "destructive",
};

async function getAuditLogs() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("admin_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []) as AuditLog[];
}

export default async function AuditLogsPage() {
  const locale = await getLocale();
  const logs = await getAuditLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {locale === "km" ? "កំណត់ត្រាសកម្មភាព" : "Audit Logs"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {locale === "km" ? "ប្រវត្តិការបន្ថែម/កែ/លុប" : "History of all create, update, and delete actions"}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No audit logs found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">User</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Action</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Table</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Record ID</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 text-xs">{log.user_email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={ACTION_COLORS[log.action] ?? "default"} className="text-xs uppercase">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-gray-100 rounded px-1.5 py-0.5 text-gray-700">{log.table_name}</code>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <code className="text-xs text-gray-400">{log.record_id?.slice(0, 8)}...</code>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-xs text-gray-600">{formatRelativeDate(log.created_at)}</p>
                        <p className="text-xs text-gray-400">{formatShortDate(log.created_at, locale)}</p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
