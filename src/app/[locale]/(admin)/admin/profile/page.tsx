"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserSchema } from "@/lib/validations";
import { updateUser } from "@/actions/users";
import { getInitials } from "@/lib/utils";
import type { z } from "zod";

type UpdateInput = z.infer<typeof updateUserSchema>;

const ROLE_LABELS: Record<string, string> = {
  administrator: "Administrator",
  director: "Director",
  editor: "Content Editor",
};

export default function AdminProfilePage() {
  const locale = useLocale();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      full_name: user?.full_name ?? "",
      email: user?.email ?? "",
      avatar_url: user?.avatar_url ?? "",
      is_active: true,
    },
  });

  const onSubmit = async (data: UpdateInput) => {
    if (!user?.id) return;
    setSaving(true);
    const result = await updateUser(user.id, data);
    setSaving(false);
    if (result.success) toast.success("Profile updated!");
    else toast.error(result.error ?? "Failed to update profile");
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {locale === "km" ? "គណនីរបស់ខ្ញុំ" : "My Profile"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {locale === "km" ? "គ្រប់គ្រងព័ត៌មានផ្ទាល់ខ្លួន" : "Manage your account information"}
        </p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback className="bg-school-blue-800 text-white text-lg">
            {getInitials(user.full_name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{user.full_name}</h2>
          <p className="text-sm text-gray-400">{user.email}</p>
          <Badge className="mt-1.5 text-xs" variant="outline">{ROLE_LABELS[user.role] ?? user.role}</Badge>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Profile Information</h2>

          <div className="space-y-1.5">
            <Label>Full Name *</Label>
            <Input {...register("full_name")} placeholder="Your full name" />
            {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input {...register("email")} type="email" disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
            <p className="text-xs text-gray-400">Email cannot be changed here. Contact administrator.</p>
          </div>

          <div className="space-y-1.5">
            <Label>Avatar URL</Label>
            <Input {...register("avatar_url")} placeholder="https://..." />
          </div>
        </div>

        <Button type="submit" className="bg-school-blue-800 hover:bg-school-blue-900" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {locale === "km" ? "រក្សាទុក" : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
