"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  HelpCircle,
  Info,
} from "lucide-react";
import { useAuth } from "@/providers/AuthContext";
import { loginSchema, resetPasswordSchema, type LoginInput, type ResetPasswordInput } from "@/schemas/validations";
import { adminHref } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const km = locale === "km";
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "";
  const { signInWithEmail, resetPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [resetSending, setResetSending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
    reset: resetResetForm,
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  const getRedirectPath = (locale: string) =>
    redirect || adminHref(locale);

  const onSubmit = async (data: LoginInput) => {
    try {
      await signInWithEmail(data.email, data.password, rememberMe);
      const loc = window.location.pathname.split("/")[1];
      router.push(getRedirectPath(loc));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      if (msg.includes("inactive") || msg.includes("deactivated")) {
        toast.error(t("error_inactive"));
      } else if (msg.includes("No account")) {
        toast.error(t("error_no_account"));
      } else {
        toast.error(t("error_invalid"));
      }
    }
  };

  const onResetSubmit = async (data: ResetPasswordInput) => {
    setResetSending(true);
    try {
      await resetPassword(data.email);
      toast.success(t("reset_email_sent"));
      resetResetForm();
      setMode("login");
    } catch {
      toast.error(t("reset_email_error"));
    } finally {
      setResetSending(false);
    }
  };

  const schoolNameKm = process.env.NEXT_PUBLIC_SCHOOL_NAME_KM ?? "វិទ្យាល័យកំរៀង";
  const schoolNameEn = process.env.NEXT_PUBLIC_SCHOOL_NAME_EN ?? "Kamrieng High School";

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* School gate photo backdrop */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/login-bg.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/50 to-white/70" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 sm:p-10">
          {/* Logo / header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-md ring-4 ring-school-gold-400/30 mb-5 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/kamrieng-logo.png"
                alt={schoolNameEn}
                className="w-16 h-16 object-cover rounded-full"
              />
            </div>
            <h1 className="font-khmer text-2xl sm:text-3xl font-bold text-school-blue-900 leading-tight">
              {schoolNameKm}
            </h1>
            <p className="text-gray-500 text-sm mt-1">{schoolNameEn}</p>
            <p
              className={
                km
                  ? "font-khmer text-xs text-gray-400 mt-3"
                  : "text-[11px] font-semibold tracking-[0.2em] text-gray-400 uppercase mt-3"
              }
            >
              {t("management_system_login")}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="email">{t("email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={km ? "បញ្ចូលអ៊ីមែលរបស់អ្នក" : "Enter your email"}
                      className="pl-10 bg-gray-50 rounded-xl h-11"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t("password")}</Label>
                    <button
                      type="button"
                      onClick={() => setMode("reset")}
                      className="text-xs font-medium text-school-blue-700 hover:text-school-blue-900 transition-colors"
                    >
                      {t("forgot_password")}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={km ? "បញ្ចូលពាក្យសម្ងាត់" : "Enter your password"}
                      className="pl-10 pr-10 bg-gray-50 rounded-xl h-11"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 accent-school-blue-800 cursor-pointer"
                  />
                  <span className={km ? "font-khmer text-sm text-gray-600" : "text-sm text-gray-600"}>
                    {t("remember_me")}
                  </span>
                </label>

                <Button
                  type="submit"
                  className="w-full bg-school-blue-700 hover:bg-school-blue-800 rounded-xl h-11 group"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {t("login")}
                  {!isSubmitting && (
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-0.5" />
                  )}
                </Button>
              </motion.form>
            ) : (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className={km ? "font-khmer text-base font-semibold text-gray-900 mb-1.5" : "text-base font-semibold text-gray-900 mb-1.5"}>
                  {t("reset_password_title")}
                </h2>
                <p className={km ? "font-khmer text-sm text-gray-500 mb-5" : "text-sm text-gray-500 mb-5"}>
                  {t("reset_password_desc")}
                </p>

                <form onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="reset-email">{t("email")}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder={km ? "បញ្ចូលអ៊ីមែលរបស់អ្នក" : "Enter your email"}
                        className="pl-10 bg-gray-50 rounded-xl h-11"
                        {...registerReset("email")}
                      />
                    </div>
                    {resetErrors.email && (
                      <p className="text-sm text-red-500">{resetErrors.email.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-school-blue-700 hover:bg-school-blue-800 rounded-xl h-11"
                    disabled={resetSending}
                  >
                    {resetSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {t("send_reset_link")}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className={km ? "font-khmer w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors" : "w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"}
                  >
                    {t("back_to_login")}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border-t border-gray-100 mt-7 pt-5 flex items-center justify-center gap-6">
            <Link
              href={`/${locale}/contact`}
              className={
                km
                  ? "font-khmer inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-school-blue-700 transition-colors"
                  : "inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-school-blue-700 transition-colors"
              }
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {t("support")}
            </Link>
            <Link
              href={`/${locale}`}
              className={
                km
                  ? "font-khmer inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-school-blue-700 transition-colors"
                  : "inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-school-blue-700 transition-colors"
              }
            >
              <Info className="w-3.5 h-3.5" />
              {t("about_portal")}
            </Link>
          </div>

          <p className={km ? "font-khmer text-center text-[11px] text-gray-300 mt-4" : "text-center text-[11px] text-gray-300 mt-4"}>
            {t("authorized_staff_only")}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
