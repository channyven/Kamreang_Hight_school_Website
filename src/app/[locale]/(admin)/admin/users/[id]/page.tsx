"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { adminHref } from "@/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createUser, updateUser } from "@/actions/users";
import { supabase } from "@/lib/supabase";

interface UserFormData {
  full_name: string;
  email: string;
  password?: string;
  role: "administrator" | "director" | "editor";
  avatar_url?: string;
  is_active: boolean;
}

interface PageProps { params: Promise<{ id: string }>; }

export default function UserFormPage({ params }: PageProps) {
  const { id } = use(params);
  const isNew = id === "new";
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(!isNew);

  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } =
    useForm<UserFormData>({ defaultValues: { role: "editor", is_active: true } });

  useEffect(() => {
    if (!isNew) {
      supabase.from("admin_users").select("*").eq("id", id).single().then(({ data }) => {
        if (data) {
          const u = data as UserFormData & { id: string };
          setValue("full_name", u.full_name ?? "");
          setValue("email", u.email ?? "");
          setValue("role", u.role ?? "editor");
          setValue("avatar_url", u.avatar_url ?? "");
          setValue("is_active", u.is_active ?? true);
        }
        setLoading(false);
      });
    }
  }, [id, isNew, setValue]);

  const onSubmit = async (data: UserFormData) => {
    let result;
    if (isNew) {
      result = await createUser({
        full_name: data.full_name,
        email: data.email,
        password: data.password ?? "",
        role: data.role,
      });
    } else {
      result = await updateUser(id, {
        full_name: data.full_name,
        email: data.email,
        role: data.role,
        avatar_url: data.avatar_url,
        is_active: data.is_active,
      });
    }

    if (result.success) {
      toast.success(isNew ? "User created!" : "User updated!");
      router.push(adminHref(locale, "users"));
    } else {
      toast.error(result.error ?? "Failed to save");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-school-blue-800" />
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={adminHref(locale, "users")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            {locale === "km" ? "ត្រឡប់" : "Back"}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew
            ? (locale === "km" ? "បន្ថែមអ្នកប្រើ" : "Add User")
            : (locale === "km" ? "កែអ្នកប្រើ" : "Edit User")}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Profile</h2>

          <div className="space-y-1.5">
            <Label>Full Name *</Label>
            <Input {...register("full_name", { required: "Name is required" })} placeholder="Sovanra Chan" />
            {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Email *</Label>
            <Input {...register("email", { required: "Email is required" })} type="email" placeholder="user@school.edu.kh" />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {isNew && (
            <div className="space-y-1.5">
              <Label>Password *</Label>
              <Input
                {...register("password", { required: isNew ? "Password is required" : false, minLength: { value: 8, message: "Min 8 characters" } })}
                type="password"
                placeholder="Min 8 characters"
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Role *</Label>
            <Controller name="role" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrator">Administrator</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="editor">Content Editor</SelectItem>
                </SelectContent>
              </Select>
            )} />
          </div>

          {!isNew && (
            <div className="space-y-1.5">
              <Label>Avatar URL</Label>
              <Input {...register("avatar_url")} placeholder="https://..." />
            </div>
          )}

          {!isNew && (
            <div className="flex items-center justify-between">
              <Label>Account Active</Label>
              <Controller name="is_active" control={control} render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )} />
            </div>
          )}
        </div>

        <Button type="submit" className="w-full bg-school-blue-800 hover:bg-school-blue-900" disabled={isSubmitting} size="lg">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {isNew ? "Create User" : "Update User"}
        </Button>
      </form>
    </div>
  );
}
