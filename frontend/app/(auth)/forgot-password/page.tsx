"use client";
import { useState } from "react";
import Link from "next/link";
import { Brain, Mail, ArrowLeft, CheckCircle2, Loader2, Send, ShieldCheck } from "lucide-react";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const valid = isValidEmail(email);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || state === "loading") return;
    setState("loading");
    setErrorMsg("");

    try {
      const { supabase } = await import("@/lib/supabase");
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setErrorMsg("Failed to send reset email. Please check the address and try again.");
        setState("error");
      } else {
        setState("sent");
      }
    } catch {
      setErrorMsg("Something went wrong. Check your internet connection and try again.");
      setState("error");
    }
  }

  return (
    <>
      <style>{`
        @keyframes fp-float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-7px); }
        }
        @keyframes fp-ring {
          0%,100% { transform: scale(1);    opacity: .35; }
          50%      { transform: scale(1.18); opacity: .7;  }
        }
        @keyframes fp-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fp-check {
          0%  { transform: scale(0) rotate(-20deg); opacity: 0; }
          65% { transform: scale(1.22) rotate(4deg); }
          100%{ transform: scale(1) rotate(0); opacity: 1; }
        }
        @keyframes fp-shake {
          0%,100%{ transform: translateX(0); }
          20%    { transform: translateX(-6px); }
          40%    { transform: translateX(6px); }
          60%    { transform: translateX(-4px); }
          80%    { transform: translateX(4px); }
        }
        @keyframes fp-dot {
          0%,80%,100%{ transform: scaleY(1);   opacity:.4; }
          40%         { transform: scaleY(1.6); opacity:1;  }
        }
        .fp-float  { animation: fp-float 3.2s ease-in-out infinite; }
        .fp-ring   { animation: fp-ring  3.2s ease-in-out infinite; }
        .fp-in     { animation: fp-in    .45s cubic-bezier(.22,1,.36,1) both; }
        .fp-check  { animation: fp-check .55s cubic-bezier(.34,1.56,.64,1) both; }
        .fp-shake  { animation: fp-shake .45s ease both; }
        .fp-dot    { animation: fp-dot 1.2s ease-in-out infinite; }
      `}</style>

      <div className="glass rounded-2xl overflow-hidden fp-in">

        {/* ── Top accent bar ─────────────────────────────────────── */}
        <div className="h-1 w-full" style={{
          background: "linear-gradient(90deg, #7c3aed, #2563eb, #7c3aed)",
          backgroundSize: "200% 100%",
          animation: "fp-ring 3s linear infinite",
        }} />

        <div className="p-8">

          {/* ── Logo / icon ──────────────────────────────────────── */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4 fp-float">
              {/* pulsing ring */}
              <div className="absolute inset-0 rounded-2xl fp-ring"
                style={{ background: "rgba(124,58,237,0.25)", transform: "scale(1.35)" }} />
              <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center glow-purple relative">
                <Brain className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Forgot password?</h1>
            <p className="text-slate-400 text-sm mt-1 text-center">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>

          {state === "sent" ? (
            /* ── Success ─────────────────────────────────────────── */
            <div className="text-center space-y-5 fp-in">
              <div className="relative w-20 h-20 mx-auto">
                {/* outer glow ring */}
                <div className="absolute inset-0 rounded-full fp-ring"
                  style={{ background: "rgba(16,185,129,0.15)", transform: "scale(1.3)" }} />
                <div className="w-20 h-20 rounded-full flex items-center justify-center fp-check"
                  style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)" }}>
                  <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                </div>
              </div>

              <div style={{ animation: "fp-in .45s .15s both" }}>
                <p className="text-white font-semibold text-lg mb-1">Check your inbox</p>
                <p className="text-slate-400 text-sm leading-relaxed">
                  We sent a reset link to<br />
                  <span className="text-purple-400 font-medium">{email}</span>
                </p>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                style={{
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  animation: "fp-in .45s .3s both",
                }}>
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-400">The link expires in&nbsp;<span className="text-white">60 minutes</span></span>
              </div>

              <p className="text-xs text-slate-500" style={{ animation: "fp-in .45s .4s both" }}>
                Didn&apos;t get it?{" "}
                <button onClick={() => setState("idle")}
                  className="text-purple-400 hover:text-purple-300 transition-colors">
                  Try again
                </button>
                {" "}or check your spam folder
              </p>

              <Link href="/login"
                className="btn-ghost w-full flex items-center justify-center gap-2 text-sm"
                style={{ animation: "fp-in .45s .5s both" }}>
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </div>

          ) : (
            /* ── Form ────────────────────────────────────────────── */
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email field */}
              <div style={{ animation: "fp-in .4s .05s both" }}>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200"
                    style={{ color: valid ? "#a78bfa" : state === "error" ? "#f87171" : "#64748b" }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    autoFocus
                    className="input-base transition-all duration-200"
                    style={{
                      paddingLeft: "2.5rem",
                      paddingRight: valid ? "2.5rem" : undefined,
                      borderColor: state === "error" ? "rgba(248,113,113,0.5)"
                        : valid ? "rgba(167,139,250,0.4)" : undefined,
                    }}
                  />
                  {/* Green tick when valid */}
                  {valid && (
                    <CheckCircle2
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 fp-check" />
                  )}
                </div>
              </div>

              {/* Error banner */}
              {state === "error" && (
                <div className="text-red-400 text-sm px-4 py-3 rounded-xl fp-shake"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {errorMsg}
                </div>
              )}

              {/* Submit */}
              <div style={{ animation: "fp-in .4s .15s both" }}>
                <button
                  type="submit"
                  disabled={!valid || state === "loading"}
                  className="btn-primary w-full flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40"
                  style={{ transform: "scale(1)" }}
                  onMouseEnter={(e) => { if (valid && state !== "loading") (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
                >
                  {state === "loading" ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="flex items-end gap-0.5 h-5">
                        Sending
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="inline-block w-1 h-3 rounded-full bg-white/70 fp-dot"
                            style={{ animationDelay: `${i * 0.18}s` }} />
                        ))}
                      </span>
                    </span>
                  ) : (
                    <><Send className="w-4 h-4" /> Send reset link</>
                  )}
                </button>
              </div>

              {/* Back link */}
              <div style={{ animation: "fp-in .4s .22s both" }}>
                <Link href="/login"
                  className="flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-slate-300 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
