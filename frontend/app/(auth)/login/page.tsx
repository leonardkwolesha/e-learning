"use client";
import { useState } from "react";
import Link from "next/link";
import { Brain, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function parseAuthError(msg: string): string {
    const m = msg.toLowerCase();
    if (m.includes("invalid login") || m.includes("invalid credentials") || m.includes("wrong password"))
      return "Incorrect email or password. Please try again.";
    if (m.includes("email not confirmed") || m.includes("not confirmed"))
      return "Please verify your email address. Check your inbox for a confirmation link.";
    if (m.includes("too many") || m.includes("rate limit"))
      return "Too many attempts. Please wait a moment before trying again.";
    if (m.includes("network") || m.includes("fetch") || m.includes("failed"))
      return "Cannot reach the authentication service. Check your internet connection.";
    if (m.includes("user not found") || m.includes("no user"))
      return "No account found with that email address.";
    return "Sign in failed. Please check your credentials and try again.";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
      setError("App not configured: add your Supabase URL and anon key to .env.local, then restart the dev server.");
      return;
    }

    setLoading(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) {
        setError(parseAuthError(err.message));
        setLoading(false);
        return;
      }
      if (data.user) {
        try {
          const existing = JSON.parse(localStorage.getItem("eduProfile") ?? "{}");
          const meta = data.user.user_metadata;
          if (meta?.full_name && !existing.name) {
            localStorage.setItem("eduProfile", JSON.stringify({ ...existing, name: meta.full_name }));
          }
        } catch {}
        // Hard redirect so the proxy reads the fresh session cookie
        window.location.href = "/select-education";
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      setError(parseAuthError(msg));
      setLoading(false);
    }
  }

  return (
    <div className="glass rounded-2xl p-8">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mb-4 glow-purple">
          <Brain className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-slate-400 text-sm mt-1">Sign in to your EduAI OS account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
              autoComplete="current-password"
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
        </div>

        {/* Error message */}
        {error && (
          <div
            className="text-red-400 text-sm px-4 py-3 rounded-xl"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            {error}
          </div>
        )}

        {/* Remember me + Forgot */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
            <input type="checkbox" className="rounded" />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-purple-400 hover:text-purple-300 transition-colors">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 text-base"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Sign In <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      {/* Divider + Google */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        <span className="text-slate-500 text-sm">or</span>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
      </div>
      <button
        type="button"
        onClick={async () => {
          try {
            const { supabase } = await import("@/lib/supabase");
            await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/select-education` } });
          } catch {}
        }}
        className="btn-ghost w-full flex items-center justify-center gap-3"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <p className="text-center text-slate-400 text-sm mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
          Sign up free
        </Link>
      </p>
    </div>
  );
}
