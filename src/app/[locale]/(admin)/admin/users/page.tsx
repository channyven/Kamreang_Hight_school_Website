"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Plus, Search, Edit, Trash2, Loader2, Shield, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import type { User } from "@/types";
import { formatShortDate, getInitials, adminHref } from "@/utils";
import { toast } from "sonner";
import { deleteUser, toggleUserActive } from "@/actions/users";
import { useAuth } from "@/providers/AuthContext";

const ROLE_COLORS: Record<string, string> = {
  administrator: "bg-red-100 text-red-700",
  director: "bg-blue-100 text-blue-700",
  editor: "bg-green-100 text-green-700",
};

export default function AdminUsersPage() {
  const locale = useLocale();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("admin_users").select("*").order("created_at", { ascending: false });
    if (roleFilter !== "all") query = query.eq("role", roleFilter);
    const { data } = await query;
    let list = (data ?? []) as User[];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((u) => u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    }
    setUsers(list);
    setLoading(false);
  }, [roleFilter, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleActive = async (id: string, current: boolean) => {
    if (id === currentUser?.id) { toast.error("Cannot deactivate your own account"); return; }
    const result = await toggleUserActive(id, !current);
    if (result.success) { toast.success(`User ${!current ? "activated" : "deactivated"}`); fetchUsers(); }
    else toast.error(result.error ?? "Failed to update");
  };

  const handleDelete = async (id: string, name: string) => {
    if (id === currentUser?.id) { toast.error("Cannot delete your own account"); return; }
    if (!confirm(`Delete user "${name}"?`)) return;
    const result = await deleteUser(id);
    if (result.success) { toast.success("User deleted"); fetchUsers(); }
    else toast.error(result.error ?? "Failed to delete");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {locale === "km" ? "គ្រប់គ្រងអ្នកប្រើប្រាស់" : "User Management"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} users</p>
        </div>
        <Button asChild className="bg-school-blue-800 hover:bg-school-blue-900">
          <Link href={adminHref(locale, "users/new")}>
            <Plus className="w-4 h-4 mr-2" />
            {locale === "km" ? "បន្ថែម" : "Add User"}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder={locale === "km" ? "ស្វែងរក..." : "Search users..."} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {["all", "administrator", "director", "editor"].map((r) => (
            <Button key={r} variant={roleFilter === r ? "default" : "outline"} size="sm" onClick={() => setRoleFilter(r)} className={roleFilter === r ? "bg-school-blue-800" : ""}>
              {r === "all" ? (locale === "km" ? "ទាំងអស់" : "All") : r}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-school-blue-800" /></div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 text-gray-400">{locale === "km" ? "រកមិនឃើញ" : "No users found"}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">User</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Joined</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarImage src={u.avatar_url} />
                          <AvatarFallback className="bg-school-blue-800 text-white text-xs">
                            {getInitials(u.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-gray-900 truncate">{u.full_name}</p>
                            {u.id === currentUser?.id && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">You</span>}
                          </div>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 w-fit ${ROLE_COLORS[u.role] ?? "bg-gray-100 text-gray-700"}`}>
                        <Shield className="w-3 h-3" />{u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs">
                      {formatShortDate(u.created_at, locale)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.is_active ? "success" : "destructive"} className="text-xs">
                        {u.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleActive(u.id, u.is_active)} title={u.is_active ? "Deactivate" : "Activate"}>
                          {u.is_active ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                        </Button>
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                          <Link href={adminHref(locale, `users/${u.id}`)}><Edit className="w-4 h-4 text-blue-500" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(u.id, u.full_name)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
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
