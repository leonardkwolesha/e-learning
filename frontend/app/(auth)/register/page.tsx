"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmEmail, setConfirmEmail] = useState(false);

  function parseAuthError(msg: string): string {
    const m = msg.toLowerCase();
    if (m.includes("already registered") || m.includes("already exists") || m.includes("unique") || m.includes("user_already_exists"))
      return "An account with this email already exists. Try signing in instead.";
    if (m.includes("weak password") || m.includes("password should") || m.includes("password is too"))
      return "Password is too weak. Use at least 6 characters with numbers and letters.";
    if (m.includes("invalid email") || m.includes("email address") || m.includes("email_address_invalid"))
      return "Please enter a valid email address.";
    if (m.includes("network") || m.includes("fetch") || m.includes("failed to fetch"))
      return "Cannot reach the authentication service. Check your internet connection.";
    if (m.includes("rate limit") || m.includes("too many") || m.includes("over_email"))
      return "Too many sign-up attempts. Please wait a few minutes and try again.";
    if (m.includes("signup") && m.includes("disabled"))
      return "Sign-ups are currently disabled. Contact support.";
    return `Registration failed: ${msg}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
      setError("App not configured: add your Supabase URL and anon key to .env.local, then restart the dev server.");
      return;
    }

    setLoading(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
        },
      });

      if (err) {
        setError(parseAuthError(err.message));
        setLoading(false);
        return;
      }

      // Persist name so onboarding pages can prefill it
      try {
        const existing = JSON.parse(localStorage.getItem("eduProfile") ?? "{}");
        localStorage.setItem("eduProfile", JSON.stringify({ ...existing, name: name.trim() }));
      } catch {}

      if (data.session) {
        // Email confirmation disabled — user is immediately signed in
        window.location.href = "/select-education";
      } else {
        // Email confirmation enabled — ask user to verify their inbox
        setConfirmEmail(true);
        setLoading(false);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      setError(parseAuthError(msg));
      setLoading(false);
    }
  }

  // Strength meter
  const strength =
    password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4
    : 3;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#06b6d4", "#10b981"][strength];

  if (confirmEmail) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Confirm your email</h2>
        <p className="text-slate-400 text-sm mb-1">
          We sent a confirmation link to
        </p>
        <p className="font-semibold text-white mb-4">{email}</p>
        <p className="text-slate-500 text-sm mb-6">
          Open your email and click the link to activate your account, then come back to sign in.
        </p>
        <Link href="/login" className="btn-primary inline-flex items-center gap-2">
          Go to Sign In <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-xs text-slate-600 mt-4">
          Didn&apos;t receive it? Check your spam folder or{" "}
          <button
            onClick={() => setConfirmEmail(false)}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            try again
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-8">
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mb-4 glow-purple">
          <Brain className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="text-slate-400 text-sm mt-1">Start your personalised learning journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Emmanuel Kimaro"
              required
              autoComplete="name"
              className="input-base"
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="input-base"
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="new-password"
              className="input-base"
              style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {/* Strength indicator */}
          {password.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex-1 h-1 rounded-full transition-all"
                    style={{ background: i <= strength ? strengthColor : "rgba(255,255,255,0.1)" }}
                  />
                ))}
              </div>
              <p className="text-xs" style={{ color: strengthColor }}>{strengthLabel} password</p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div
            className="text-red-400 text-sm px-4 py-3 rounded-xl"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 text-base"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Create Account <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      <p className="text-center text-slate-500 text-xs mt-6">
        By signing up, you agree to our{" "}
        <Link href="#" className="text-purple-400 hover:underline">Terms</Link> and{" "}
        <Link href="#" className="text-purple-400 hover:underline">Privacy Policy</Link>
      </p>

      <p className="text-center text-slate-400 text-sm mt-3">
        Already have an account?{" "}
        <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
