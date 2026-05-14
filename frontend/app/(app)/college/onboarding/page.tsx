"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Brain, ChevronRight, ChevronLeft, Check, Sparkles, Eye, Headphones, BookOpen, Hand,
  Code2, Network, Database, Globe, Shield, Cpu, Zap, Cloud, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Your Level", "CS Modules", "Specialisation", "Learning Style", "Ready"];

const NTA_LEVELS = [
  {
    id: "certificate", label: "Certificate in IT", nta: "NTA Level 4–5",
    desc: "1–2 year foundational IT qualification (NACTE)", color: "#10b981",
    modules: 7, hours: 52,
    peek: ["Computing Fundamentals", "Hardware & Maintenance", "Basic Python", "Web Design Basics"],
  },
  {
    id: "ordinary_diploma", label: "Ordinary Diploma in IT", nta: "NTA Level 5–6",
    desc: "2–3 year technical IT qualification (NACTE)", color: "#7c3aed",
    modules: 8, hours: 96,
    peek: ["OOP (Java/Python)", "Database Administration", "Network Admin", "Web Development"],
  },
  {
    id: "higher_diploma", label: "Higher Diploma in IT", nta: "NTA Level 6–7",
    desc: "3–4 year advanced professional IT qualification", color: "#2563eb",
    modules: 8, hours: 120,
    peek: ["Software Engineering", "Cloud Computing", "Data Science & ML", "Network Security"],
  },
];

const MODULES: Record<string, { id: string; title: string; desc: string; icon: React.ElementType; badge: string; badgeColor: string; hours: number }[]> = {
  certificate: [
    { id: "m1", title: "Computing Fundamentals", desc: "History of computing, computer types, applications and careers in IT", icon: Cpu, badge: "Core", badgeColor: "#10b981", hours: 7 },
    { id: "m2", title: "Computer Hardware & Maintenance", desc: "PC assembly, component identification, fault diagnosis and repair", icon: Cpu, badge: "Practical", badgeColor: "#f59e0b", hours: 9 },
    { id: "m3", title: "Office Applications", desc: "Advanced Word, Excel formulas, Access databases, PowerPoint presentations", icon: BookOpen, badge: "Core", badgeColor: "#10b981", hours: 8 },
    { id: "m4", title: "Programming Basics with Python", desc: "Variables, data types, control structures, functions and simple programs", icon: Code2, badge: "Code", badgeColor: "#7c3aed", hours: 10 },
    { id: "m5", title: "Web Design Basics", desc: "HTML5 structure, CSS3 styling, responsive layouts and hosting basics", icon: Globe, badge: "Practical", badgeColor: "#06b6d4", hours: 8 },
    { id: "m6", title: "Basic Networking", desc: "Network types, OSI model, IP addressing, basic router/switch config", icon: Network, badge: "Core", badgeColor: "#2563eb", hours: 7 },
    { id: "m7", title: "Computer Security & Ethics", desc: "Cyber threats, password management, data protection and professional ethics", icon: Shield, badge: "Essential", badgeColor: "#ef4444", hours: 6 },
  ],
  ordinary_diploma: [
    { id: "m1", title: "OOP Programming (Java & Python)", desc: "Classes, inheritance, interfaces, exception handling and design patterns", icon: Code2, badge: "Core", badgeColor: "#7c3aed", hours: 14 },
    { id: "m2", title: "Database Administration (MySQL)", desc: "Database design, normalization, SQL, stored procedures, performance tuning", icon: Database, badge: "Core", badgeColor: "#10b981", hours: 12 },
    { id: "m3", title: "Network Administration (CCNA Track)", desc: "Routing protocols, VLANs, subnetting, Cisco IOS, firewall configuration", icon: Network, badge: "Core", badgeColor: "#2563eb", hours: 12 },
    { id: "m4", title: "Full-Stack Web Development", desc: "HTML/CSS/JS frontend, PHP/Node.js backend, MySQL integration, REST APIs", icon: Globe, badge: "Practical", badgeColor: "#06b6d4", hours: 14 },
    { id: "m5", title: "Systems Analysis & Design", desc: "SSADM, UML diagrams, requirements gathering, prototyping and feasibility", icon: Zap, badge: "Theory", badgeColor: "#f59e0b", hours: 10 },
    { id: "m6", title: "Software Engineering", desc: "Agile/Scrum, version control (Git/GitHub), testing, CI/CD basics", icon: Brain, badge: "Applied", badgeColor: "#ec4899", hours: 10 },
    { id: "m7", title: "Mobile App Development", desc: "Android fundamentals (Kotlin/Java), UI components, APIs, Google Play", icon: Cpu, badge: "Modern", badgeColor: "#f59e0b", hours: 10 },
    { id: "m8", title: "Cybersecurity Foundations", desc: "Ethical hacking intro, OWASP Top 10, network scanning, vulnerability basics", icon: Shield, badge: "Important", badgeColor: "#ef4444", hours: 10 },
  ],
  higher_diploma: [
    { id: "m1", title: "Advanced Software Engineering", desc: "Design patterns, microservices, Docker, clean architecture and refactoring", icon: Code2, badge: "Advanced", badgeColor: "#7c3aed", hours: 16 },
    { id: "m2", title: "Cloud Computing (AWS/Azure)", desc: "Cloud models, EC2, S3, Lambda, containerization, serverless architecture", icon: Cloud, badge: "Modern", badgeColor: "#06b6d4", hours: 16 },
    { id: "m3", title: "Data Science & Analytics", desc: "Python (Pandas, NumPy, Matplotlib), data cleaning, EDA, visualization", icon: Database, badge: "Analytical", badgeColor: "#10b981", hours: 14 },
    { id: "m4", title: "Machine Learning Fundamentals", desc: "Supervised/unsupervised learning, scikit-learn, model evaluation, deployment", icon: Brain, badge: "AI", badgeColor: "#ec4899", hours: 14 },
    { id: "m5", title: "Network Security & Penetration Testing", desc: "Kali Linux, Metasploit, IDS/IPS, SIEM, security auditing methodology", icon: Shield, badge: "Security", badgeColor: "#ef4444", hours: 14 },
    { id: "m6", title: "IT Project Management", desc: "PMI framework, Agile PM, stakeholder management, risk and budget control", icon: Zap, badge: "Management", badgeColor: "#f59e0b", hours: 12 },
    { id: "m7", title: "Enterprise Systems & ERP", desc: "SAP basics, enterprise architecture, system integration and middleware", icon: Cpu, badge: "Enterprise", badgeColor: "#2563eb", hours: 12 },
    { id: "m8", title: "Research Methods in IT", desc: "Literature review, research methodology, academic writing and project reports", icon: BookOpen, badge: "Research", badgeColor: "#06b6d4", hours: 10 },
  ],
};

const SPECIALISATIONS = [
  {
    id: "web_mobile", label: "Web & Mobile Development",
    desc: "Build websites and mobile apps from frontend to backend",
    icon: Globe, color: "from-blue-600 to-cyan-500", glow: "rgba(37,99,235,0.3)",
    skills: ["HTML/CSS/JS", "React / PHP", "Android Dev", "REST APIs"],
  },
  {
    id: "software_qa", label: "Software Development & QA",
    desc: "Design, code and test professional software systems",
    icon: Code2, color: "from-purple-600 to-violet-600", glow: "rgba(124,58,237,0.3)",
    skills: ["OOP (Java)", "Agile / Git", "Unit Testing", "CI/CD"],
  },
  {
    id: "networking", label: "Network Engineering & Security",
    desc: "Configure networks and protect systems from cyber threats",
    icon: Shield, color: "from-red-600 to-rose-500", glow: "rgba(239,68,68,0.3)",
    skills: ["Cisco CCNA", "Firewalls", "Ethical Hacking", "VPN / VLANs"],
  },
  {
    id: "database", label: "Database & Systems Administration",
    desc: "Design databases, manage servers and enterprise systems",
    icon: Database, color: "from-emerald-600 to-teal-500", glow: "rgba(16,185,129,0.3)",
    skills: ["MySQL / PostgreSQL", "Linux Admin", "Backup & Recovery", "Performance Tuning"],
  },
];

const LEARNING_STYLES = [
  { id: "visual", label: "Visual Learner", desc: "Architecture diagrams, screenshots and demo videos", icon: Eye, color: "from-purple-600 to-blue-600" },
  { id: "auditory", label: "Auditory Learner", desc: "Lectures, walkthroughs and verbal explanations", icon: Headphones, color: "from-blue-600 to-cyan-500" },
  { id: "reading", label: "Reading / Writing", desc: "Documentation, textbooks and written exercises", icon: BookOpen, color: "from-cyan-500 to-emerald-500" },
  { id: "kinesthetic", label: "Hands-on Labs", desc: "I learn by doing — labs, projects and real systems", icon: Hand, color: "from-emerald-500 to-teal-500" },
];

const GEN_PHASES = ["Analyzing your IT profile…", "Building module roadmap…", "Calibrating difficulty…", "Curriculum ready!"];

export default function CollegeOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [ntaLevel, setNtaLevel] = useState("");
  const [specialisation, setSpecialisation] = useState("");
  const [learningStyle, setLearningStyle] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genPhase, setGenPhase] = useState(0);
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);

  const selectedLevel = NTA_LEVELS.find((l) => l.id === ntaLevel);
  const modules = MODULES[ntaLevel] ?? [];
  const selectedSpec = SPECIALISATIONS.find((s) => s.id === specialisation);

  async function finish() {
    setGenerating(true);
    for (let i = 0; i < GEN_PHASES.length; i++) {
      setGenPhase(i);
      await new Promise((r) => setTimeout(r, 900));
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("eduProfile", JSON.stringify({
        educationType: "college",
        level: ntaLevel,
        name,
        program: "it",
        programLabel: selectedLevel?.label ?? "IT Program",
        specialisation,
        specialisationLabel: selectedSpec?.label ?? "",
        learningStyle,
        subjects: modules.map((m) => ({ id: m.id, title: m.title })),
      }));
    }
    router.push("/dashboard");
  }

  const canNext = [
    name.trim().length > 0 && ntaLevel !== "",
    true,
    specialisation !== "",
    learningStyle !== "",
  ][step];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="absolute inset-0 radial-purple pointer-events-none" />
      <div className="absolute inset-0 radial-blue pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#10b981,#06b6d4)" }}>
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg gradient-text">EduAI OS</span>
          <span className="mx-2 text-slate-700">|</span>
          <span className="text-sm font-medium text-slate-400">NACTE College · IT Program</span>
        </div>

        {/* Progress stepper */}
        <div className="flex items-center mb-8 gap-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  i < step ? "text-white shadow-lg" :
                  i === step ? "border-2 border-emerald-500 text-emerald-400 bg-emerald-500/10" :
                  "border border-white/10 text-slate-600"
                )}
                  style={i < step ? { background: "linear-gradient(135deg,#10b981,#06b6d4)" } : {}}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={cn("text-[10px] font-medium hidden sm:block",
                  i === step ? "text-white" : i < step ? "text-emerald-400" : "text-slate-600"
                )}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all duration-500"
                  style={{ background: i < step ? "linear-gradient(90deg,#10b981,#06b6d4)" : "rgba(255,255,255,0.07)" }} />
              )}
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-4 sm:p-8">

          {/* Step 0 — Name + NTA Level */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-emerald-400 mb-3"
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <Cpu className="w-3 h-3" /> NACTE Accredited · Information Technology
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">NACTE College IT Setup</h2>
                <p className="text-slate-400 text-sm">Tell us your name and qualification level to build your personalised IT curriculum.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Your Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Fatuma Hassan" className="input-base" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Qualification Level</label>
                <div className="space-y-3">
                  {NTA_LEVELS.map(({ id, label, nta, desc, color, modules: mods, hours, peek }) => {
                    const isHovered = hoveredLevel === id;
                    const isSelected = ntaLevel === id;
                    return (
                      <button key={id} onClick={() => setNtaLevel(id)}
                        onMouseEnter={() => setHoveredLevel(id)}
                        onMouseLeave={() => setHoveredLevel(null)}
                        className={cn(
                          "w-full p-4 rounded-xl border text-left transition-all duration-200 hover:scale-[1.01]",
                          isSelected
                            ? "border-emerald-500 bg-emerald-500/8"
                            : "border-white/8 glass glass-hover"
                        )}
                        style={isSelected ? { boxShadow: `0 0 20px ${color}30` } : {}}>
                        <div className="flex items-center justify-between mb-1">
                          <div className={cn("font-bold", isSelected ? "text-white" : "text-slate-200")}>{label}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                              style={{ background: `${color}20`, color }}>{nta}</span>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 mb-2">{desc}</div>
                        {(isHovered || isSelected) && (
                          <div className="mt-2 pt-2 border-t border-white/6">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              {peek.map((p) => (
                                <div key={p} className="flex items-center gap-1.5 text-xs text-slate-400">
                                  <div className="w-1 h-1 rounded-full shrink-0" style={{ background: color }} />
                                  {p}
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-3 mt-2 text-xs font-medium" style={{ color }}>
                              <span>{mods} modules</span>
                              <span>~{hours}h total</span>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — IT Modules */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {selectedLevel?.label} Modules
                </h2>
                <p className="text-slate-400 text-sm">
                  These are your NACTE-aligned IT modules. Each module includes theory, practical labs and assessments.
                </p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-sm text-emerald-300">
                  <strong>{modules.length} modules</strong> · ~{selectedLevel?.hours ?? 0}h total · {selectedLevel?.nta}
                </span>
              </div>
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {modules.map(({ id, title, desc, icon: Icon, badge, badgeColor, hours }) => (
                  <div key={id} className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.01]"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${badgeColor}15` }}>
                      <Icon className="w-5 h-5" style={{ color: badgeColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-semibold text-white text-sm">{title}</div>
                        <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                          style={{ background: `${badgeColor}20`, color: badgeColor }}>{badge}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate">{desc}</div>
                    </div>
                    <div className="text-xs text-slate-500 shrink-0">{hours}h</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Specialisation */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Choose Your Specialisation</h2>
                <p className="text-slate-400 text-sm">Your AI tutor will provide extra depth, career advice and project ideas in your chosen area.</p>
              </div>
              <div className="space-y-3">
                {SPECIALISATIONS.map(({ id, label, desc, icon: Icon, color, glow, skills }) => {
                  const selected = specialisation === id;
                  return (
                    <button key={id} onClick={() => setSpecialisation(id)}
                      className={cn(
                        "w-full flex items-center gap-4 p-5 rounded-xl border transition-all duration-200 text-left hover:scale-[1.01]",
                        selected ? "border-emerald-500 bg-emerald-500/8" : "border-white/8 glass glass-hover"
                      )}
                      style={selected ? { boxShadow: `0 0 24px ${glow}` } : {}}>
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}
                        style={{ boxShadow: selected ? `0 0 16px ${glow}` : "none" }}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white mb-1">{label}</div>
                        <div className="text-sm text-slate-400 mb-2">{desc}</div>
                        <div className="flex gap-2 flex-wrap">
                          {skills.map((s) => (
                            <span key={s} className="text-xs px-2 py-0.5 rounded-full text-slate-300"
                              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      {selected && (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: "linear-gradient(135deg,#10b981,#06b6d4)" }}>
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3 — Learning Style */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">How do you learn best?</h2>
                <p className="text-slate-400 text-sm">Your AI tutor adapts lab instructions, theory depth and project complexity to your style.</p>
              </div>
              <div className="space-y-3">
                {LEARNING_STYLES.map(({ id, label, desc, icon: Icon, color }) => {
                  const selected = learningStyle === id;
                  return (
                    <button key={id} onClick={() => setLearningStyle(id)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left hover:scale-[1.01]",
                        selected ? "border-emerald-500 bg-emerald-500/8" : "border-white/8 glass glass-hover"
                      )}>
                      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br", selected ? color : "")}
                        style={!selected ? { background: "rgba(255,255,255,0.06)" } : {}}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{label}</div>
                        <div className="text-sm text-slate-400">{desc}</div>
                      </div>
                      {selected && <Check className="w-5 h-5 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4 — Preview + Generate */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "linear-gradient(135deg,#10b981,#06b6d4)", boxShadow: "0 0 30px rgba(16,185,129,0.4)" }}>
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Ready, <span className="gradient-text">{name || "Student"}</span>!
                </h2>
                <p className="text-slate-400 text-sm">Your personalised NACTE IT curriculum</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Level", value: selectedLevel?.nta ?? "—", color: "#10b981" },
                  { label: "Modules", value: `${modules.length}`, color: "#7c3aed" },
                  { label: "Hours", value: `~${selectedLevel?.hours ?? 0}h`, color: "#2563eb" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="glass rounded-xl p-4 text-center">
                    <div className="text-lg font-bold mb-0.5" style={{ color }}>{value}</div>
                    <div className="text-xs text-slate-400">{label}</div>
                  </div>
                ))}
              </div>

              <div className="glass rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg,#10b981,#06b6d4)" }}>
                    <Cpu className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Program</div>
                    <div className="text-sm font-semibold text-white">{selectedLevel?.label}</div>
                  </div>
                </div>
                {selectedSpec && (
                  <>
                    <div className="h-px bg-white/6" />
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedSpec.color} flex items-center justify-center shrink-0`}>
                        <selectedSpec.icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Specialisation</div>
                        <div className="text-sm font-semibold text-white">{selectedSpec.label}</div>
                      </div>
                    </div>
                  </>
                )}
                <div className="h-px bg-white/6" />
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">First Modules</div>
                {modules.slice(0, 3).map(({ id, title, badge, badgeColor }) => (
                  <div key={id} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: badgeColor }} />
                    <span className="text-sm text-slate-300 flex-1">{title}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                      style={{ background: `${badgeColor}20`, color: badgeColor }}>{badge}</span>
                  </div>
                ))}
              </div>

              {generating && (
                <div className="flex flex-col items-center gap-3 py-2">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-emerald-500 rounded-full animate-spin" />
                  <p className="text-emerald-300 text-sm font-medium">{GEN_PHASES[genPhase]}</p>
                  <div className="flex gap-1.5">
                    {GEN_PHASES.map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full transition-all duration-300"
                        style={{ background: i <= genPhase ? "#10b981" : "rgba(255,255,255,0.1)" }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 sm:mt-8 pt-5 sm:pt-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={() => step === 0 ? router.push("/select-education") : setStep((s) => s - 1)}
              className="btn-ghost flex items-center gap-1.5 sm:gap-2 text-sm">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep((s) => s + 1)} disabled={!canNext}
                className="btn-primary flex items-center gap-1.5 sm:gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={finish} disabled={generating}
                className="btn-primary flex items-center gap-1.5 sm:gap-2 disabled:opacity-60">
                {generating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Building…</>
                ) : (
                  <><span className="sm:hidden">Generate</span>
                  <span className="hidden sm:inline">Generate My Curriculum</span>
                  <Sparkles className="w-4 h-4" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
