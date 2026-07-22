"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  Camera,
  Shield,
  Mail,
  User,
  Link2,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/providers/AuthContext";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import { profileUpdateSchema, changePasswordSchema } from "@/schemas/validations";
import { updateUser } from "@/actions/users";
import { getInitials } from "@/utils";
import type { z } from "zod";

type ProfileInput = z.infer<typeof profileUpdateSchema>;
type PasswordInput = z.infer<typeof changePasswordSchema>;

const ROLE_LABELS: Record<string, string> = {
  administrator: "Administrator",
  director: "Director",
  editor: "Content Editor",
};

const ROLE_BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  administrator: { bg: "#fef2f2", text: "#dc2626" },
  director: { bg: "#e8f0fe", text: "#1a56db" },
  editor: { bg: "#f4f6fb", text: "#8892a0" },
};

export default function AdminProfilePage() {
  const locale = useLocale();
  const { user, firebaseUser, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, dirtyFields, isDirty, isValid },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileUpdateSchema),
    mode: "onChange",
    defaultValues: {
      full_name: user?.full_name ?? "",
      avatar_url: user?.avatar_url ?? "",
    },
  });

  // ─── Password change state ───
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    label: string;
    color: string;
    width: string;
  } | null>(null);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch: watchPassword,
    reset: resetPassword,
    formState: {
      errors: passwordErrors,
      isDirty: passwordDirty,
      isValid: passwordValid,
    },
  } = useForm<PasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const watchedNewPassword = watchPassword("new_password");

  // Evaluate password strength in real time
  useEffect(() => {
    if (!watchedNewPassword) {
      setPasswordStrength(null);
      return;
    }
    const checks = {
      length: watchedNewPassword.length >= 8,
      upper: /[A-Z]/.test(watchedNewPassword),
      lower: /[a-z]/.test(watchedNewPassword),
      number: /[0-9]/.test(watchedNewPassword),
      special: /[^A-Za-z0-9]/.test(watchedNewPassword),
    };
    const passed = Object.values(checks).filter(Boolean).length;
    if (passed <= 2)
      setPasswordStrength({ label: "Weak", color: "#dc2626", width: "25%" });
    else if (passed <= 3)
      setPasswordStrength({ label: "Fair", color: "#d97706", width: "50%" });
    else if (passed <= 4)
      setPasswordStrength({ label: "Good", color: "#16a34a", width: "75%" });
    else
      setPasswordStrength({ label: "Strong", color: "#16a34a", width: "100%" });
  }, [watchedNewPassword]);

  // ─── Firebase error code → user-friendly message ───
  const getFirebaseErrorMessage = (code: string): string => {
    const messages: Record<string, string> = {
      "auth/wrong-password":
        locale === "km"
          ? "ពាក្យសម្ងាត់បច្ចុប្បន្នមិនត្រឹមត្រូវ"
          : "Current password is incorrect",
      "auth/weak-password":
        locale === "km"
          ? "ពាក្យសម្ងាត់ខ្សោយពេក"
          : "Password is too weak",
      "auth/requires-recent-login":
        locale === "km"
          ? "សូមចូលប្រព័ន្ធម្តងទៀត រួចព្យាយាមម្តងទៀត"
          : "Please log out and log in again, then retry",
      "auth/invalid-credential":
        locale === "km"
          ? "ពាក្យសម្ងាត់បច្ចុប្បន្នមិនត្រឹមត្រូវ"
          : "Current password is incorrect",
      "auth/user-not-found":
        locale === "km"
          ? "មិនមានគណនីនេះទេ"
          : "Account not found",
      "auth/too-many-requests":
        locale === "km"
          ? "ការស្នើសុំច្រើនពេក សូមរង់ចាំបន្តិច"
          : "Too many attempts — please wait a moment",
    };
    return messages[code] ?? (locale === "km" ? "ការផ្លាស់ប្តូរពាក្យសម្ងាត់បានបរាជ័យ" : "Password change failed");
  };

  const onPasswordSubmit = async (data: PasswordInput) => {
    if (!user?.email || !firebaseUser) return;
    setChangingPassword(true);

    try {
      // 1) Re-authenticate with current password
      const credential = EmailAuthProvider.credential(
        user.email,
        data.current_password
      );
      await reauthenticateWithCredential(firebaseUser, credential);

      // 2) Update password
      await updatePassword(firebaseUser, data.new_password);

      toast.success(
        locale === "km"
          ? "ពាក្យសម្ងាត់ត្រូវបានផ្លាស់ប្តូរដោយជោគជ័យ!"
          : "Password changed successfully!",
        { icon: <CheckCircle2 className="w-4 h-4 text-green-500" /> }
      );

      // Reset the form
      resetPassword();
      setShowPasswordSection(false);
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      const message = getFirebaseErrorMessage(fbErr.code ?? "");
      toast.error(message, { icon: <XCircle className="w-4 h-4" /> });
    } finally {
      setChangingPassword(false);
    }
  };

  // ── End password change state ──

  const watchedAvatar = watch("avatar_url");
  const watchedName = watch("full_name");
  const nameCharCount = watchedName?.length ?? 0;
  const nameMaxChars = 100;

  // Reset form when user data loads from auth
  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name ?? "",
        avatar_url: user.avatar_url ?? "",
      });
    }
  }, [user, reset]);

  const hasChanges = isDirty;

  const handleReset = useCallback(() => {
    reset({
      full_name: user?.full_name ?? "",
      avatar_url: user?.avatar_url ?? "",
    });
    setSaveSuccess(false);
    toast.info(locale === "km" ? "បានកំណត់ឡើងវិញ" : "Form reset to original values");
  }, [user, reset, locale]);

  const onSubmit = async (data: ProfileInput) => {
    if (!user?.id) return;
    setSaving(true);
    setSaveSuccess(false);

    const result = await updateUser(user.id, {
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      is_active: true,
    });

    setSaving(false);
    if (result.success) {
      toast.success(locale === "km" ? "បានធ្វើបច្ចុប្បន្នភាព!" : "Profile updated!", {
        icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
      });
      setSaveSuccess(true);
      await refreshUser();
      // Reset form with new values as the fresh baseline
      reset({
        full_name: data.full_name,
        avatar_url: data.avatar_url || "",
      });
    } else {
      toast.error(result.error ?? (locale === "km" ? "បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាព" : "Failed to update profile"), {
        icon: <XCircle className="w-4 h-4" />,
      });
    }
  };

  if (!user) return null;

  const badgeStyle = ROLE_BADGE_STYLES[user.role] ?? ROLE_BADGE_STYLES.editor;

  const nameError = errors.full_name;
  const avatarError = errors.avatar_url;

  return (
    <div className="min-h-full admin-page-bg">
      <div className="max-w-3xl mx-auto p-6 space-y-6">

        {/* ── Page header ── */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0d1c2f" }}>
            {locale === "km" ? "គណនីរបស់ខ្ញុំ" : "My Profile"}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#8892a0" }}>
            {locale === "km"
              ? "គ្រប់គ្រងព័ត៌មានផ្ទាល់ខ្លួន"
              : "Manage your personal information"}
          </p>
        </div>

        {/* ── Profile avatar card ── */}
        <div
          className="rounded-2xl overflow-hidden admin-card-bg"
          style={{
            boxShadow: "0px 2px 12px rgba(13,27,56,0.06)",
          }}
        >
          {/* Gradient header with avatar overlap */}
          <div
            className="h-28 relative"
            style={{
              background: "linear-gradient(135deg, #00376f 0%, #1a56db 100%)",
            }}
          >
            <div className="absolute -bottom-12 left-6">
              <div className="relative group">
                <Avatar className="w-24 h-24 ring-4 ring-white shadow-lg">
                  <AvatarImage src={watchedAvatar || user.avatar_url} />
                  <AvatarFallback
                    className="text-2xl font-bold text-white"
                    style={{ background: "#fdbc13" }}
                  >
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Name / Email / Role */}
          <div className="pt-16 pb-6 px-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold" style={{ color: "#0d1c2f" }}>
                  {user.full_name}
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <Mail className="w-3.5 h-3.5" style={{ color: "#8892a0" }} />
                  <span className="text-sm" style={{ color: "#8892a0" }}>
                    {user.email}
                  </span>
                </div>
              </div>
              <Badge
                className="text-xs font-semibold px-3 py-1 rounded-full self-start"
                style={{
                  background: badgeStyle.bg,
                  color: badgeStyle.text,
                  border: "none",
                }}
              >
                <Shield className="w-3 h-3 mr-1 inline" />
                {ROLE_LABELS[user.role] ?? user.role}
              </Badge>
            </div>
          </div>
        </div>

        {/* ── Edit form ── */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div
            className="rounded-2xl overflow-hidden admin-card-bg"
            style={{
              boxShadow: "0px 2px 12px rgba(13,27,56,0.06)",
            }}
          >
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold" style={{ color: "#0d1c2f" }}>
                  {locale === "km" ? "កែសម្រួលព័ត៌មាន" : "Edit Information"}
                </h2>
                {hasChanges && (
                  <span
                    className="text-xs font-medium flex items-center gap-1"
                    style={{ color: "#d97706" }}
                  >
                    <AlertCircle className="w-3 h-3" />
                    {locale === "km" ? "មានការផ្លាស់ប្តូរ" : "Unsaved changes"}
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* ── Full Name ── */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="full_name"
                  className="text-sm font-medium"
                  style={{ color: "#434750" }}
                >
                  <User className="w-3.5 h-3.5 mr-1.5 inline" />
                  {locale === "km" ? "ឈ្មោះពេញ" : "Full Name"} *
                </Label>
                <div className="relative">
                  <Input
                    id="full_name"
                    {...register("full_name")}
                    placeholder={
                      locale === "km" ? "សូមបញ្ចូលឈ្មោះពេញ" : "Enter your full name"
                    }
                    aria-invalid={!!nameError}
                    className={`h-10 rounded-xl border transition-all pr-16 ${
                      nameError
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                        : dirtyFields.full_name
                          ? "border-green-400 focus:border-green-500 focus:ring-green-500/20"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                  />
                  {/* Character counter */}
                  <span
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium tabular-nums ${
                      nameCharCount > nameMaxChars
                        ? "text-red-500"
                        : nameCharCount > 80
                          ? "text-amber-500"
                          : "text-gray-400"
                    }`}
                  >
                    {nameCharCount}/{nameMaxChars}
                  </span>
                </div>
                {nameError && (
                  <p
                    className="text-xs mt-1 flex items-center gap-1"
                    style={{ color: "#dc2626" }}
                  >
                    <AlertCircle className="w-3 h-3" />
                    {nameError.message}
                  </p>
                )}
                {!nameError && dirtyFields.full_name && (
                  <p
                    className="text-xs mt-1 flex items-center gap-1"
                    style={{ color: "#16a34a" }}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {locale === "km" ? "ឈ្មោះត្រឹមត្រូវ" : "Valid name"}
                  </p>
                )}
              </div>

              {/* ── Email (disabled) ── */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium"
                  style={{ color: "#434750" }}
                >
                  <Mail className="w-3.5 h-3.5 mr-1.5 inline" />
                  {locale === "km" ? "អ៊ីមែល" : "Email"}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="h-10 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200"
                />
                <p className="text-xs mt-1" style={{ color: "#8892a0" }}>
                  {locale === "km"
                    ? "មិនអាចផ្លាស់ប្តូរអ៊ីមែលបានទេ។ សូមទាក់ទងអ្នកគ្រប់គ្រង។"
                    : "Email cannot be changed here. Contact an administrator."}
                </p>
              </div>

              <Separator />

              {/* ── Avatar URL ── */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="avatar_url"
                  className="text-sm font-medium"
                  style={{ color: "#434750" }}
                >
                  <Link2 className="w-3.5 h-3.5 mr-1.5 inline" />
                  {locale === "km" ? "URL រូបថត" : "Avatar URL"}
                </Label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      id="avatar_url"
                      {...register("avatar_url")}
                      placeholder="https://example.com/avatar.jpg"
                      aria-invalid={!!avatarError}
                      className={`h-10 rounded-xl border transition-all ${
                        avatarError
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                          : dirtyFields.avatar_url
                            ? "border-green-400 focus:border-green-500 focus:ring-green-500/20"
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                    />
                  </div>
                  <Avatar className="w-10 h-10 shrink-0 ring-1 ring-gray-200">
                    <AvatarImage src={watchedAvatar || user.avatar_url} />
                    <AvatarFallback
                      className="text-xs font-bold text-white"
                      style={{ background: "#00376f" }}
                    >
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {avatarError && (
                  <p
                    className="text-xs mt-1 flex items-center gap-1"
                    style={{ color: "#dc2626" }}
                  >
                    <AlertCircle className="w-3 h-3" />
                    {avatarError.message}
                  </p>
                )}
                {!avatarError && watchedAvatar && watchedAvatar !== user.avatar_url && (
                  <p
                    className="text-xs mt-1 flex items-center gap-1"
                    style={{ color: "#16a34a" }}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {locale === "km" ? "URL ត្រឹមត្រូវ" : "Valid URL"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Action bar ── */}
          <div className="flex items-center justify-end gap-3 mt-6">
            {hasChanges && (
              <Button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="h-10 px-5 rounded-xl text-sm font-medium transition-all border"
                style={{
                  background: "#fff",
                  color: "#434750",
                  borderColor: "#e0e5ec",
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {locale === "km" ? "កំណត់ឡើងវិញ" : "Reset"}
              </Button>
            )}
            <Button
              type="submit"
              disabled={saving || !hasChanges || !isValid}
              className="h-10 px-6 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "#00376f",
                color: "#fff",
              }}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {locale === "km" ? "កំពុងរក្សាទុក..." : "Saving..."}
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {locale === "km" ? "បានរក្សាទុក" : "Saved"}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {locale === "km" ? "រក្សាទុក" : "Save Changes"}
                </>
              )}
            </Button>
          </div>
        </form>

        {/* ── Account meta info ── */}
        <div
          className="rounded-2xl p-6 admin-card-bg"
          style={{
            boxShadow: "0px 2px 12px rgba(13,27,56,0.06)",
          }}
        >
          <h2 className="text-sm font-semibold mb-4 text-muted-foreground">
            {locale === "km" ? "ព័ត៌មានគណនី" : "Account Details"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs font-medium" style={{ color: "#8892a0" }}>
                {locale === "km" ? "តួនាទី" : "Role"}
              </p>
              <p className="mt-0.5 font-medium" style={{ color: "#434750" }}>
                {ROLE_LABELS[user.role] ?? user.role}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "#8892a0" }}>
                {locale === "km" ? "ស្ថានភាព" : "Status"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    user.is_active ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="font-medium" style={{ color: "#434750" }}>
                  {user.is_active
                    ? locale === "km"
                      ? "សកម្ម"
                      : "Active"
                    : locale === "km"
                      ? "អសកម្ម"
                      : "Inactive"}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "#8892a0" }}>
                {locale === "km" ? "លេខសម្គាល់" : "Account ID"}
              </p>
              <p className="mt-0.5 font-mono text-xs" style={{ color: "#8892a0" }}>
                {user.id.slice(0, 8)}…
              </p>
            </div>
          </div>
        </div>

        {/* ── Password change section ── */}
        <div
          className="rounded-2xl overflow-hidden admin-card-bg"
          style={{
            boxShadow: "0px 2px 12px rgba(13,27,56,0.06)",
          }}
        >
          <button
            type="button"
            onClick={() => setShowPasswordSection((prev) => !prev)}
            className="w-full px-6 py-4 flex items-center justify-between transition-colors hover:bg-gray-50/50"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "#fef2f2" }}
              >
                <Lock className="w-4 h-4" style={{ color: "#dc2626" }} />
              </div>
              <div className="text-left">
                <h2
                  className="text-base font-semibold"
                  style={{ color: "#0d1c2f" }}
                >
                  {locale === "km" ? "ផ្លាស់ប្តូរពាក្យសម្ងាត់" : "Change Password"}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "#8892a0" }}>
                  {locale === "km"
                    ? "ធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់គណនីរបស់អ្នក"
                    : "Update your account password"}
                </p>
              </div>
            </div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 ${
                showPasswordSection ? "rotate-180" : ""
              }`}
              style={{ background: "#f4f6fb" }}
            >
              <svg
                className="w-4 h-4"
                style={{ color: "#8892a0" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>

          {showPasswordSection && (
            <form
              onSubmit={handlePasswordSubmit(onPasswordSubmit)}
              className="px-6 pb-6"
            >
              <Separator className="mb-6" />

              <div className="space-y-5">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="current_password"
                    className="text-sm font-medium"
                    style={{ color: "#434750" }}
                  >
                    <LogIn className="w-3.5 h-3.5 mr-1.5 inline" />
                    {locale === "km" ? "ពាក្យសម្ងាត់បច្ចុប្បន្ន" : "Current Password"} *
                  </Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showCurrentPassword ? "text" : "password"}
                      {...registerPassword("current_password")}
                      placeholder={
                        locale === "km"
                          ? "បញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន"
                          : "Enter your current password"
                      }
                      className="h-10 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "#8892a0" }}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.current_password && (
                    <p
                      className="text-xs mt-1 flex items-center gap-1"
                      style={{ color: "#dc2626" }}
                    >
                      <AlertCircle className="w-3 h-3" />
                      {passwordErrors.current_password.message}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="new_password"
                    className="text-sm font-medium"
                    style={{ color: "#434750" }}
                  >
                    <KeyRound className="w-3.5 h-3.5 mr-1.5 inline" />
                    {locale === "km" ? "ពាក្យសម្ងាត់ថ្មី" : "New Password"} *
                  </Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showNewPassword ? "text" : "password"}
                      {...registerPassword("new_password")}
                      placeholder={
                        locale === "km"
                          ? "បញ្ចូលពាក្យសម្ងាត់ថ្មីយ៉ាងតិច ៨ តួ"
                          : "Enter new password (min. 8 characters)"
                      }
                      className="h-10 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "#8892a0" }}
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Password strength bar */}
                  {watchedNewPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: passwordStrength?.width ?? "0%",
                            background: passwordStrength?.color ?? "#e0e5ec",
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <p
                          className="text-xs font-medium"
                          style={{ color: passwordStrength?.color ?? "#8892a0" }}
                        >
                          {passwordStrength?.label ?? ""}
                        </p>
                        <p className="text-xs" style={{ color: "#8892a0" }}>
                          {locale === "km"
                            ? "ត្រូវការតួអក្សរធំ តូច និងលេខ"
                            : "Requires uppercase, lowercase & number"}
                        </p>
                      </div>
                    </div>
                  )}

                  {passwordErrors.new_password && (
                    <p
                      className="text-xs mt-1 flex items-center gap-1"
                      style={{ color: "#dc2626" }}
                    >
                      <AlertCircle className="w-3 h-3" />
                      {passwordErrors.new_password.message}
                    </p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="confirm_password"
                    className="text-sm font-medium"
                    style={{ color: "#434750" }}
                  >
                    <KeyRound className="w-3.5 h-3.5 mr-1.5 inline" />
                    {locale === "km"
                      ? "បញ្ជាក់ពាក្យសម្ងាត់ថ្មី"
                      : "Confirm New Password"}{" "}
                    *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      {...registerPassword("confirm_password")}
                      placeholder={
                        locale === "km"
                          ? "បញ្ចូលពាក្យសម្ងាត់ថ្មីម្តងទៀត"
                          : "Re-enter your new password"
                      }
                      className={`h-10 rounded-xl border transition-all pr-10 ${
                        passwordErrors.confirm_password
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                          : passwordDirty && !passwordErrors.confirm_password && watchedNewPassword
                            ? "border-green-400 focus:border-green-500 focus:ring-green-500/20"
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "#8892a0" }}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {!passwordErrors.confirm_password &&
                    passwordDirty &&
                    watchedNewPassword &&
                    watchPassword("confirm_password") ===
                      watchedNewPassword && (
                      <p
                        className="text-xs mt-1 flex items-center gap-1"
                        style={{ color: "#16a34a" }}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {locale === "km"
                          ? "ពាក្យសម្ងាត់ត្រូវគ្នា"
                          : "Passwords match"}
                      </p>
                    )}
                  {passwordErrors.confirm_password && (
                    <p
                      className="text-xs mt-1 flex items-center gap-1"
                      style={{ color: "#dc2626" }}
                    >
                      <AlertCircle className="w-3 h-3" />
                      {passwordErrors.confirm_password.message}
                    </p>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Password change action bar */}
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    setShowPasswordSection(false);
                    resetPassword();
                  }}
                  disabled={changingPassword}
                  className="h-10 px-5 rounded-xl text-sm font-medium transition-all border"
                  style={{
                    background: "#fff",
                    color: "#434750",
                    borderColor: "#e0e5ec",
                  }}
                >
                  {locale === "km" ? "បោះបង់" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  disabled={changingPassword || !passwordDirty || !passwordValid}
                  className="h-10 px-6 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "#dc2626",
                    color: "#fff",
                  }}
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {locale === "km" ? "កំពុងផ្លាស់ប្តូរ..." : "Changing..."}
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      {locale === "km"
                        ? "ប្តូរពាក្យសម្ងាត់"
                        : "Change Password"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
