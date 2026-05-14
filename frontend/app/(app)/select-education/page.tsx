"use client";
import { useRouter } from "next/navigation";
import { Brain, BookOpen, GraduationCap, Code2, Cpu, Network, ArrowRight, Zap } from "lucide-react";

const PATHS = [
  {
    id: "secondary",
    title: "Secondary Education",
    subtitle: "O Level & Advanced Level",
    description: "NECTA-aligned Computer Studies / Computer Science curriculum from Form 1 to Form 6, covering hardware, programming, databases, networks and AI.",
    icon: BookOpen,
    gradient: "from-purple-600 to-indigo-600",
    glow: "rgba(124,58,237,0.35)",
    color: "#7c3aed",
    href: "/secondary/select-level",
    badges: ["O Level (Form 1–4)", "A Level (Form 5–6)", "NECTA Syllabus", "CSEE & ACSEE"],
    topics: [
      { icon: Code2, text: "Python & VB Programming" },
      { icon: Network, text: "Networks & Security" },
      { icon: Cpu, text: "Hardware & OS" },
    ],
  },
  {
    id: "university",
    title: "University & College",
    subtitle: "Degree · Diploma · Certificate",
    description: "Computer Science & IT programs for NACTE college students and university undergraduates — from certificate level through BSc, MSc to PhD.",
    icon: GraduationCap,
    gradient: "from-blue-600 to-cyan-500",
    glow: "rgba(37,99,235,0.35)",
    color: "#2563eb",
    href: "/university/select-type",
    badges: ["BSc / MSc CS", "NACTE IT Diploma", "PhD Research", "NTA Aligned"],
    topics: [
      { icon: Code2, text: "Software Engineering" },
      { icon: Brain, text: "AI & Machine Learning" },
      { icon: Network, text: "Cloud & DevOps" },
    ],
  },
];

export default function SelectEducationPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="absolute inset-0 radial-purple pointer-events-none" />
      <div className="absolute inset-0 radial-blue pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-4 glow-purple">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-cyan-300 mb-4"
            style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)" }}>
            <Zap className="w-3.5 h-3.5" /> 100% Computer Science — All Levels
          </div>
          <h1 className="text-4xl font-bold text-white text-center mb-3">Choose Your Education Level</h1>
          <p className="text-slate-400 text-center max-w-md">
            Select your education category. Your AI tutor will build a personalised, NECTA-aligned Computer Science curriculum just for you.
          </p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-6">
          {PATHS.map(({ id, title, subtitle, description, icon: Icon, gradient, glow, color, href, badges, topics }) => (
            <button
              key={id}
              onClick={() => router.push(href)}
              className="group text-left flex flex-col gap-5 p-7 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.99]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.border = `1px solid ${color}50`;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 32px ${glow}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.border = "1px solid rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center`}
                style={{ boxShadow: `0 0 24px ${glow}` }}>
                <Icon className="w-8 h-8 text-white" />
              </div>

              {/* Text */}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-0.5">{title}</h2>
                <p className="text-sm font-semibold mb-3" style={{ color }}>{subtitle}</p>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{description}</p>

                {/* CS topics preview */}
                <div className="space-y-2 mb-4">
                  {topics.map(({ icon: TIcon, text }) => (
                    <div key={text} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <TIcon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {badges.map((b) => (
                  <span key={b} className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
                    {b}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all" style={{ color }}>
                Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-slate-500 text-xs mt-8">
          🇹🇿 Tanzania Education System — NECTA &amp; NACTE Aligned
        </p>
      </div>
    </div>
  );
}
