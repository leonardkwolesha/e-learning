"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Brain, Lock, Eye, EyeOff, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error" | "invalid">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase passes the recovery token in the URL hash — exchange it for a session
  useEffect(() => {
    async function exchangeToken() {
      const { supabase } = await import("@/lib/supabase");
      // Listen for the PASSWORD_RECOVERY event that fires when the hash token is consumed
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          setSessionReady(true);
        }
      });

      // Also check if we already have a session (e.g. page refreshed)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setSessionReady(true);

      return () => subscription.unsubscribe();
    }
    exchangeToken();
  }, []);

  const mismatch = confirm.length > 0 && password !== confirm;
  const tooShort = password.length > 0 && password.length < 8;
  const canSubmit = password.length >= 8 && password === confirm && state !== "loading";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setState("loading");
    setErrorMsg("");

    try {
      const { supabase } = await import("@/lib/supabase");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setErrorMsg(error.message ?? "Failed to update password. Please request a new reset link.");
        setState("error");
      } else {
        setState("success");
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setState("error");
    }
  }

  return (
    <div className="glass rounded-2xl p-8">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mb-4 glow-purple">
          <Brain className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Set new password</h1>
        <p className="text-slate-400 text-sm mt-1">Choose a strong password for your account</p>
      </div>

      {state === "success" ? (
        /* ── Success ── */
        <div className="text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
            style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)" }}>
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <p className="text-white font-semibold mb-1">Password updated!</p>
            <p className="text-slate-400 text-sm">
              Your password has been changed successfully.<br />
              Redirecting you to sign in…
            </p>
          </div>
          <Link href="/login" className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
            Go to sign in
          </Link>
        </div>
      ) : !sessionReady ? (
        /* ── Waiting for token exchange ── */
        <div className="text-center space-y-5">
          <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center"
            style={{ background: "rgba(124,58,237,0.15)" }}>
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
          <p className="text-slate-400 text-sm">Verifying your reset link…</p>
          <p className="text-slate-500 text-xs">
            If this takes too long, your link may have expired.{" "}
            <Link href="/forgot-password" className="text-purple-400 hover:text-purple-300 transition-colors">
              Request a new one
            </Link>
          </p>
        </div>
      ) : (
        /* ── Form ── */
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">New password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
                autoFocus
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
            {tooShort && (
              <p className="text-amber-400 text-xs mt-1.5">Password must be at least 8 characters</p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
                required
                autoComplete="new-password"
                className="input-base"
                style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem",
                  borderColor: mismatch ? "rgba(239,68,68,0.5)" : undefined }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mismatch && (
              <p className="text-red-400 text-xs mt-1.5">Passwords do not match</p>
            )}
          </div>

          {/* Strength indicator */}
          {password.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((lvl) => {
                  const strength =
                    (password.length >= 8 ? 1 : 0) +
                    (/[A-Z]/.test(password) ? 1 : 0) +
                    (/[0-9]/.test(password) ? 1 : 0) +
                    (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
                  const color = strength <= 1 ? "#ef4444" : strength === 2 ? "#f59e0b" : strength === 3 ? "#06b6d4" : "#10b981";
                  return (
                    <div key={lvl} className="flex-1 h-1 rounded-full transition-all duration-300"
                      style={{ background: lvl <= strength ? color : "rgba(255,255,255,0.08)" }} />
                  );
                })}
              </div>
              <p className="text-xs text-slate-500">
                Add uppercase, numbers, and symbols for a stronger password
              </p>
            </div>
          )}

          {state === "error" && (
            <div className="flex items-start gap-2 text-red-400 text-sm px-4 py-3 rounded-xl"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {state === "loading" ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
            ) : (
              "Update password"
            )}
          </button>

          <p className="text-center text-sm text-slate-500">
            Remember your password?{" "}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
