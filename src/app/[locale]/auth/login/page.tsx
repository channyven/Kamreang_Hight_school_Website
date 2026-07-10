"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Eye, EyeOff, LogIn, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function LoginForm() {
  const { signInWithEmail, signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const redirect = searchParams.get("redirect") ?? `/${locale}/admin`;

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirect);
    }
  }, [user, loading, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError("");
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
      router.replace(redirect);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      if (msg.includes("invalid-credential") || msg.includes("wrong-password") || msg.includes("user-not-found")) {
        setError("Invalid email or password.");
      } else if (msg.includes("No account found")) {
        setError("No admin account found for this email.");
      } else if (msg.includes("deactivated")) {
        setError("Your account has been deactivated. Contact an administrator.");
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.replace(redirect);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign in failed";
      setError(msg.includes("No account found") ? "No admin account linked to this Google account." : msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#f4f6fb" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#00376f" }} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0d1b38 0%, #00376f 60%, #1a56a0 100%)" }}
    >
      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/[0.04]" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full" style={{ background: "rgba(253,188,19,0.06)" }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "#fff",
            boxShadow: "0px 24px 60px rgba(13,27,56,0.25)",
          }}
        >
          {/* Logo + header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden" style={{ background: "#00376f" }}>
              <img
                src="/images/kamrieng-logo.png"
                alt="Kamrieng High School"
                className="w-10 h-10 object-cover rounded-full"
              />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "#0d1c2f" }}>
              Admin Portal
            </h1>
            <p className="text-sm mt-1" style={{ color: "#8892a0" }}>
              {process.env.NEXT_PUBLIC_SCHOOL_NAME_EN ?? "School Management"}
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div
              className="flex items-start gap-2.5 rounded-xl px-4 py-3 mb-5 text-sm"
              style={{ background: "#fef2f2", color: "#dc2626" }}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "#434750" }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                className="w-full h-11 px-3.5 rounded-xl border text-sm outline-none transition-all"
                style={{
                  borderColor: "#e0e6f0",
                  color: "#0d1c2f",
                  background: "#fafbff",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#00376f")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e0e6f0")}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "#434750" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3.5 pr-11 rounded-xl border text-sm outline-none transition-all"
                  style={{
                    borderColor: "#e0e6f0",
                    color: "#0d1c2f",
                    background: "#fafbff",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#00376f")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e0e6f0")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#8892a0" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !email || !password}
              className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{ background: "#00376f", color: "#fff" }}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = "#002d5a"; }}
              onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = "#00376f"; }}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "#e8edf5" }} />
            <span className="text-xs" style={{ color: "#c0c8d4" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "#e8edf5" }} />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full h-11 rounded-xl border text-sm font-medium flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ borderColor: "#e0e6f0", color: "#434750", background: "#fff" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8faff")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          >
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>

          {/* Footer */}
          <p className="text-center text-xs mt-6" style={{ color: "#c0c8d4" }}>
            For authorized school staff only
          </p>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "rgba(255,255,255,0.3)" }}>
          © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SCHOOL_NAME_EN}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
