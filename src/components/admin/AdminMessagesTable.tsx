"use client";

import { formatRelativeDate, cn } from "@/utils";
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
          className={cn(
            "transition-colors hover:bg-muted/50",
            i < messages.length - 1 && "border-b border-border"
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
                msg.status === "unread"
                  ? "bg-destructive/10 text-destructive"
                  : msg.status === "replied"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {msg.status === "unread" ? "New" : msg.status === "replied" ? "Replied" : "Read"}
            </span>
          </td>
          <td className="px-5 py-3.5 text-xs text-muted-foreground">
            {formatRelativeDate(msg.created_at)}
          </td>
        </tr>
      ))}
    </>
  );
}
