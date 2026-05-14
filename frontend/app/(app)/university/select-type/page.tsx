"use client";
import { useRouter } from "next/navigation";
import { Brain, GraduationCap, Building2, ArrowRight, ArrowLeft } from "lucide-react";

const TYPES = [
  {
    id: "university",
    title: "University",
    subtitle: "Bachelor's, Master's & PhD",
    description:
      "Degree programs from accredited Tanzania universities including UDSM, UDOM, MUHAS, Mzumbe, OUT and more.",
    icon: GraduationCap,
    gradient: "from-blue-600 to-cyan-500",
    glow: "rgba(37,99,235,0.3)",
    href: "/university/onboarding",
    highlights: [
      "Bachelor's Degree (NTA Level 8)",
      "Postgraduate Diploma (NTA Level 9)",
      "Master's Degree (NTA Level 9)",
      "PhD / Doctorate (NTA Level 10)",
    ],
  },
  {
    id: "college",
    title: "College (NACTE)",
    subtitle: "Certificate & Diploma Programs",
    description:
      "NACTE-accredited certificate and diploma programs from Tanzania's technical and vocational colleges.",
    icon: Building2,
    gradient: "from-emerald-600 to-teal-500",
    glow: "rgba(16,185,129,0.3)",
    href: "/college/onboarding",
    highlights: [
      "Certificate (NTA Level 4–5)",
      "Ordinary Diploma (NTA Level 5–6)",
      "Higher Diploma (NTA Level 6–7)",
      "Business, IT, Health, Engineering tracks",
    ],
  },
];

export default function SelectTypePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="absolute inset-0 radial-purple pointer-events-none" />
      <div className="absolute inset-0 radial-blue pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl">
        {/* Back */}
        <button onClick={() => router.push("/select-education")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Education Selection
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mb-4 glow-purple">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white text-center">Higher Education</h1>
          <p className="text-slate-400 mt-2 text-center max-w-md">
            Select your institution type to access the right programs and curriculum.
          </p>
          <div className="mt-3 px-3 py-1 rounded-full text-xs font-medium text-cyan-400"
            style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
            🇹🇿 TCU & NACTE Accredited Programs
          </div>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-6">
          {TYPES.map(({ id, title, subtitle, description, icon: Icon, gradient, glow, href, highlights }) => (
            <button
              key={id}
              onClick={() => router.push(href)}
              className="group card text-left p-7 flex flex-col gap-5 hover:scale-[1.02] active:scale-[0.99] transition-all duration-200"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center`}
                style={{ boxShadow: `0 0 20px ${glow}` }}>
                <Icon className="w-7 h-7 text-white" />
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-0.5">{title}</h2>
                <p className="text-sm font-medium text-cyan-400 mb-3">{subtitle}</p>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{description}</p>
                <ul className="space-y-1.5">
                  {highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors">
                Select Type <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
