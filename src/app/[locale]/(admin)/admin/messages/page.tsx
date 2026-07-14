"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import { Search, Trash2, Loader2, Mail, MailOpen, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Message } from "@/types";
import { formatRelativeDate } from "@/utils";
import { toast } from "sonner";
import { getMessages, markMessageRead, markMessageReplied, deleteMessage } from "@/actions/messages";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const STATUS_BADGE: Record<string, { variant: "default" | "success" | "warning" | "destructive"; icon: React.ReactNode }> = {
  unread: { variant: "destructive", icon: <Mail className="w-3 h-3" /> },
  read: { variant: "warning", icon: <MailOpen className="w-3 h-3" /> },
  replied: { variant: "success", icon: <CheckCircle className="w-3 h-3" /> },
};

export default function AdminMessagesPage() {
  const locale = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Message | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    let list = await getMessages({ status: statusFilter });
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((m) => m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q) || m.subject?.toLowerCase().includes(q));
    }
    setMessages(list);
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const openMessage = async (msg: Message) => {
    setSelected(msg);
    if (msg.status === "unread") {
      await markMessageRead(msg.id);
      fetchMessages();
    }
  };

  const handleReply = async (id: string) => {
    await markMessageReplied(id);
    setSelected((prev) => prev ? { ...prev, status: "replied" } : null);
    fetchMessages();
    toast.success("Marked as replied");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    const result = await deleteMessage(id);
    if (result.success) { toast.success("Message deleted"); setSelected(null); fetchMessages(); }
    else toast.error(result.error ?? "Failed to delete");
  };

  const unreadCount = messages.filter((m) => m.status === "unread").length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            {locale === "km" ? "ប្រអប់សាររបស់ខ្ញុំ" : "Messages Inbox"}
          </h1>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} new</Badge>
          )}
        </div>
        <p className="text-gray-500 text-sm mt-1">{messages.length} messages</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder={locale === "km" ? "ស្វែងរក..." : "Search messages..."} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {["all", "unread", "read", "replied"].map((s) => (
            <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)} className={statusFilter === s ? "bg-school-blue-800" : ""}>
              {s === "all" ? (locale === "km" ? "ទាំងអស់" : "All") : s}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Mail className="w-10 h-10 mx-auto mb-2 text-gray-200" />
            <p>{locale === "km" ? "មិនមានសារ" : "No messages found"}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map((msg) => {
              const badge = STATUS_BADGE[msg.status] ?? STATUS_BADGE.read;
              return (
                <button
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-start gap-4 ${msg.status === "unread" ? "bg-blue-50/50" : ""}`}
                >
                  <div className="w-10 h-10 rounded-full bg-school-blue-100 flex items-center justify-center shrink-0 text-sm font-bold text-school-blue-700">
                    {msg.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`font-medium text-gray-900 truncate ${msg.status === "unread" ? "font-semibold" : ""}`}>{msg.name}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={badge.variant} className="text-xs flex items-center gap-1">
                          {badge.icon}{msg.status}
                        </Badge>
                        <span className="text-xs text-gray-400 flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />{formatRelativeDate(msg.created_at)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{msg.subject}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{msg.email}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Message Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">{selected.subject}</DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  {locale === "km" ? "ព័ត៌មានលម្អិតនៃសារ" : "Message details and contact information"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-400">From:</span> <span className="font-medium">{selected.name}</span></div>
                  <div><span className="text-gray-400">Email:</span> <span className="font-medium">{selected.email}</span></div>
                  {selected.phone && <div><span className="text-gray-400">Phone:</span> <span className="font-medium">{selected.phone}</span></div>}
                  <div><span className="text-gray-400">Date:</span> <span className="font-medium">{formatRelativeDate(selected.created_at)}</span></div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.message}</p>
                </div>
                <div className="flex justify-between items-center">
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(selected.id)}>
                    <Trash2 className="w-4 h-4 mr-1" />Delete
                  </Button>
                  <div className="flex gap-2">
                    {selected.status !== "replied" && (
                      <Button variant="outline" size="sm" onClick={() => handleReply(selected.id)}>
                        <CheckCircle className="w-4 h-4 mr-1" />Mark as Replied
                      </Button>
                    )}

                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
