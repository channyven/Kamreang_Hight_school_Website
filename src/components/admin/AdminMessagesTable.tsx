"use client";

import { formatRelativeDate } from "@/utils";
import type { Message } from "@/types";

interface AdminMessagesTableProps {
  messages: Message[];
}

export default function AdminMessagesTable({ messages }: AdminMessagesTableProps) {
  return (
    <>
      {messages.map((msg, i) => (
        <tr
          key={msg.id}
          className="transition-colors"
          style={{
            borderBottom: i < messages.length - 1 ? "1px solid #eaeff6" : undefined,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f8faff")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "")}
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
    </>
  );
}
