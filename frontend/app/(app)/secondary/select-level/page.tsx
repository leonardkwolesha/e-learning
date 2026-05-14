"use client";
import { useRouter } from "next/navigation";
import { Brain, Code2, Zap, ArrowRight, ArrowLeft, Monitor } from "lucide-react";

const LEVELS = [
  {
    id: "o-level",
    title: "Ordinary Level (O Level)",
    subtitle: "Form 1 – Form 4",
    description: "NECTA-aligned Computer Studies curriculum covering hardware, software, programming, databases and web design from Form 1 to Form 4 (CSEE).",
    icon: Monitor,
    gradient: "from-purple-600 to-indigo-600",
    glow: "rgba(124,58,237,0.35)",
    borderColor: "rgba(124,58,237,0.4)",
    href: "/secondary/o-level/onboarding",
    topics: 7,
    color: "#7c3aed",
    highlights: [
      { text: "7 CS topics per form, AI-adapted to your pace", dot: "#7c3aed" },
      { text: "Programming with Visual Basic & Python", dot: "#10b981" },
      { text: "Web Design: HTML & CSS basics", dot: "#06b6d4" },
      { text: "CSEE exam preparation & past papers", dot: "#f59e0b" },
    ],
  },
  {
    id: "a-level",
    title: "Advanced Level (A Level)",
    subtitle: "Form 5 – Form 6",
    description: "ACSEE Computer Science — no combinations, pure CS. Deep programming, data structures, algorithms, networks, AI and software engineering.",
    icon: Code2,
    gradient: "from-orange-500 to-rose-600",
    glow: "rgba(249,115,22,0.35)",
    borderColor: "rgba(249,115,22,0.4)",
    href: "/secondary/a-level/onboarding",
    topics: 8,
    color: "#f97316",
    highlights: [
      { text: "8 advanced CS topics per form", dot: "#f97316" },
      { text: "Python, OOP, data structures & algorithms", dot: "#7c3aed" },
      { text: "Networks, security & web technologies", dot: "#06b6d4" },
      { text: "AI, machine learning and CS project", dot: "#ec4899" },
    ],
  },
];

export default function SelectLevelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="absolute inset-0 radial-purple pointer-events-none" />
      <div className="absolute inset-0 radial-blue pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl">
        {/* Back */}
        <button onClick={() => router.push("/select-education")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Education Selection
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mb-4 glow-purple">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-purple-300 mb-4"
            style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}>
            <Zap className="w-3 h-3" /> Computer Science Curriculum — NECTA Aligned
          </div>
          <h1 className="text-3xl font-bold text-white text-center">Choose Your Secondary Level</h1>
          <p className="text-slate-400 mt-2 text-center max-w-md text-sm">
            Pick your current form level. Your AI tutor will build a personalised CS curriculum aligned to the NECTA syllabus.
          </p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-6">
          {LEVELS.map(({ id, title, subtitle, description, icon: Icon, gradient, glow, borderColor, href, topics, color, highlights }) => (
            <button
              key={id}
              onClick={() => router.push(href)}
              className="group text-left flex flex-col gap-5 p-7 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.99]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid rgba(255,255,255,0.08)`,
                boxShadow: "0 0 0 0 transparent",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.border = `1px solid ${borderColor}`;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${glow}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.border = `1px solid rgba(255,255,255,0.08)`;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 0 transparent`;
              }}
            >
              {/* Icon + tag */}
              <div className="flex items-center justify-between">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center`}
                  style={{ boxShadow: `0 0 20px ${glow}` }}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                  {topics} topics / form
                </span>
              </div>

              {/* Text */}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-0.5">{title}</h2>
                <p className="text-sm font-medium mb-3" style={{ color }}>{subtitle}</p>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{description}</p>
                <ul className="space-y-2">
                  {highlights.map((h) => (
                    <li key={h.text} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: h.dot }} />
                      {h.text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all" style={{ color }}>
                Select Level <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
