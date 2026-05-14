"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Brain, ChevronRight, ChevronLeft, Check, Sparkles, Eye, Headphones, BookOpen, Hand,
  Code2, Network, Database, Globe, Cpu, Shield, Zap, Binary, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Your Form", "CS Syllabus", "Specialisation", "Learning Style", "Ready"];

const FORMS = [
  {
    id: "form5", label: "Form 5", desc: "First year of A-Level CS",
    tag: "Foundation", color: "#7c3aed",
    peek: ["Computer Architecture", "Python Programming", "Data Structures", "Database Design"],
    hours: 68,
  },
  {
    id: "form6", label: "Form 6", desc: "ACSEE Final Year",
    tag: "Advanced", color: "#ef4444",
    peek: ["OOP & Software Eng.", "Computer Networks", "AI & ML Basics", "Security"],
    hours: 76,
  },
];

const CS_TOPICS: Record<string, { id: string; title: string; desc: string; icon: React.ElementType; badge: string; badgeColor: string; hours: number }[]> = {
  form5: [
    { id: "t1", title: "Computer Architecture & Organization", desc: "CPU design, instruction cycles, registers, buses and memory hierarchy", icon: Cpu, badge: "Foundation", badgeColor: "#7c3aed", hours: 10 },
    { id: "t2", title: "Number Systems & Data Representation", desc: "Binary, hexadecimal, BCD, ASCII, Unicode and floating point", icon: Binary, badge: "Theory", badgeColor: "#06b6d4", hours: 8 },
    { id: "t3", title: "Programming with Python", desc: "Functions, modules, file handling, recursion and OOP introduction", icon: Code2, badge: "Code", badgeColor: "#10b981", hours: 14 },
    { id: "t4", title: "Data Structures I", desc: "Arrays, stacks, queues, linked lists — operations and implementations", icon: Database, badge: "Core", badgeColor: "#7c3aed", hours: 12 },
    { id: "t5", title: "Algorithm Design & Analysis", desc: "Sorting, searching, Big-O notation, divide & conquer, greedy algorithms", icon: Zap, badge: "Logic", badgeColor: "#f59e0b", hours: 10 },
    { id: "t6", title: "Database Design & SQL", desc: "ER diagrams, normalization (1NF–3NF), SQL queries, transactions", icon: Database, badge: "Core", badgeColor: "#10b981", hours: 10 },
    { id: "t7", title: "Boolean Algebra & Logic Circuits", desc: "Logic gates, truth tables, Karnaugh maps, combinational circuits", icon: Brain, badge: "Theory", badgeColor: "#06b6d4", hours: 8 },
    { id: "t8", title: "Operating System Concepts", desc: "Processes, threads, memory management, scheduling algorithms", icon: Cpu, badge: "Core", badgeColor: "#7c3aed", hours: 6 },
  ],
  form6: [
    { id: "t1", title: "Object-Oriented Programming", desc: "Classes, inheritance, polymorphism, interfaces and design patterns", icon: Code2, badge: "Advanced", badgeColor: "#ef4444", hours: 12 },
    { id: "t2", title: "Computer Networks & Internet Protocols", desc: "OSI model, TCP/IP, routing, DNS, HTTP, subnetting", icon: Network, badge: "Core", badgeColor: "#2563eb", hours: 12 },
    { id: "t3", title: "Software Engineering Principles", desc: "SDLC models, Agile/Scrum, testing, version control (Git)", icon: Zap, badge: "Applied", badgeColor: "#10b981", hours: 10 },
    { id: "t4", title: "Web Technologies", desc: "HTML5, CSS3, JavaScript, DOM manipulation, intro to React", icon: Globe, badge: "Practical", badgeColor: "#06b6d4", hours: 10 },
    { id: "t5", title: "AI & Machine Learning Fundamentals", desc: "Neural networks, decision trees, clustering, data preprocessing", icon: Brain, badge: "Modern", badgeColor: "#ec4899", hours: 10 },
    { id: "t6", title: "Information Security & Cryptography", desc: "Symmetric/asymmetric encryption, hashing, firewalls, ethical hacking intro", icon: Shield, badge: "Important", badgeColor: "#ef4444", hours: 8 },
    { id: "t7", title: "Computer Project & Practicum", desc: "Full system development: design, code, test, document and present", icon: Sparkles, badge: "Project", badgeColor: "#f59e0b", hours: 10 },
    { id: "t8", title: "ACSEE Examination Preparation", desc: "Past papers, question analysis, time management and revision strategies", icon: BookOpen, badge: "Exam", badgeColor: "#f59e0b", hours: 4 },
  ],
};

const SPECIALISATIONS = [
  {
    id: "software",
    label: "Software Development & Engineering",
    desc: "Deep dive into programming, algorithms and building real software systems",
    icon: Code2, color: "from-purple-600 to-violet-600", glow: "rgba(124,58,237,0.3)",
    skills: ["Python / OOP", "Algorithms", "Software Engineering", "Git"],
  },
  {
    id: "networks",
    label: "Computer Networks & Security",
    desc: "Master how data travels across the internet and how systems are protected",
    icon: Shield, color: "from-blue-600 to-cyan-500", glow: "rgba(37,99,235,0.3)",
    skills: ["TCP/IP", "Routing", "Cryptography", "Ethical Hacking"],
  },
  {
    id: "ai_data",
    label: "AI, Data Science & Web",
    desc: "Explore artificial intelligence, data analysis and modern web development",
    icon: Brain, color: "from-pink-600 to-rose-500", glow: "rgba(236,72,153,0.3)",
    skills: ["Machine Learning", "Databases", "HTML/CSS/JS", "Data Analysis"],
  },
];

const LEARNING_STYLES = [
  { id: "visual", label: "Visual Learner", desc: "Architecture diagrams, code flow charts and visual examples", icon: Eye, color: "from-purple-600 to-blue-600" },
  { id: "auditory", label: "Auditory Learner", desc: "I prefer lectures, discussions and verbal explanations", icon: Headphones, color: "from-blue-600 to-cyan-500" },
  { id: "reading", label: "Reading / Writing", desc: "I learn through textbooks, notes and documentation", icon: BookOpen, color: "from-cyan-500 to-emerald-500" },
  { id: "kinesthetic", label: "Problem Solving", desc: "I learn by coding exercises, debugging and building projects", icon: Hand, color: "from-emerald-500 to-teal-500" },
];

const GEN_PHASES = ["Analyzing your CS profile…", "Mapping A-Level syllabus…", "Setting difficulty levels…", "Curriculum ready!"];

export default function ALevelOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [form, setForm] = useState("");
  const [specialisation, setSpecialisation] = useState("");
  const [learningStyle, setLearningStyle] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genPhase, setGenPhase] = useState(0);
  const [hoveredForm, setHoveredForm] = useState<string | null>(null);

  const selectedForm = FORMS.find((f) => f.id === form);
  const topics = CS_TOPICS[form] ?? [];
  const selectedSpec = SPECIALISATIONS.find((s) => s.id === specialisation);

  async function finish() {
    setGenerating(true);
    for (let i = 0; i < GEN_PHASES.length; i++) {
      setGenPhase(i);
      await new Promise((r) => setTimeout(r, 900));
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("eduProfile", JSON.stringify({
        educationType: "secondary",
        level: "a-level",
        form,
        name,
        specialisation,
        learningStyle,
        subjects: topics.map((t) => ({ id: t.id, title: t.title })),
        combination: "CS",
      }));
    }
    router.push("/dashboard");
  }

  const canNext = [
    name.trim().length > 0 && form !== "",
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
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg gradient-text">EduAI OS</span>
          <span className="mx-2 text-slate-700">|</span>
          <span className="text-sm font-medium text-slate-400">A Level · Computer Science</span>
        </div>

        {/* Progress stepper */}
        <div className="flex items-center mb-8 gap-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  i < step ? "gradient-bg text-white shadow-lg" :
                  i === step ? "border-2 border-orange-500 text-orange-400 bg-orange-500/10" :
                  "border border-white/10 text-slate-600"
                )}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={cn("text-[10px] font-medium hidden sm:block",
                  i === step ? "text-white" : i < step ? "text-orange-400" : "text-slate-600"
                )}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all duration-500"
                  style={{ background: i < step ? "linear-gradient(90deg,#f97316,#ef4444)" : "rgba(255,255,255,0.07)" }} />
              )}
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-4 sm:p-8">

          {/* Step 0 — Name + Form */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-orange-400 mb-3"
                  style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)" }}>
                  <Code2 className="w-3 h-3" /> ACSEE A-Level · Computer Science
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">Welcome to A-Level CS</h2>
                <p className="text-slate-400 text-sm">Tell us your name and form for your ACSEE-aligned personalised Computer Science curriculum.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Your Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Baraka Mwangi" className="input-base" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Current Form</label>
                <div className="grid grid-cols-2 gap-3">
                  {FORMS.map(({ id, label, desc, tag, color, peek, hours }) => {
                    const isHovered = hoveredForm === id;
                    const isSelected = form === id;
                    return (
                      <button key={id} onClick={() => setForm(id)}
                        onMouseEnter={() => setHoveredForm(id)}
                        onMouseLeave={() => setHoveredForm(null)}
                        className={cn(
                          "p-5 rounded-xl border text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
                          isSelected ? "border-orange-500 bg-orange-500/8" : "border-white/8 glass glass-hover"
                        )}
                        style={isSelected ? { boxShadow: `0 0 24px ${color}30` } : {}}>
                        <div className="flex items-center justify-between mb-2">
                          <div className={cn("font-bold text-lg", isSelected ? "text-white" : "text-slate-200")}>{label}</div>
                          <span className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                            style={{ background: `${color}20`, color }}>
                            {tag}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mb-2">{desc}</div>
                        {(isHovered || isSelected) && (
                          <div className="mt-2 pt-2 border-t border-white/6 space-y-1">
                            {peek.map((p) => (
                              <div key={p} className="flex items-center gap-1.5 text-xs text-slate-400">
                                <div className="w-1 h-1 rounded-full" style={{ background: color }} />
                                {p}
                              </div>
                            ))}
                            <div className="text-xs font-medium mt-1" style={{ color }}>~{hours}h of content</div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — CS Topics */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {selectedForm?.label} Computer Science Syllabus
                </h2>
                <p className="text-slate-400 text-sm">
                  These are your ACSEE Computer Science topics for {selectedForm?.label}. Each topic is AI-taught with theory, code examples and practice questions.
                </p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
                <Code2 className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="text-sm text-orange-300">
                  <strong>{topics.length} topics</strong> · ~{selectedForm?.hours ?? 0}h total · University-entrance level
                </span>
              </div>
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {topics.map(({ id, title, desc, icon: Icon, badge, badgeColor, hours }) => (
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
                          style={{ background: `${badgeColor}20`, color: badgeColor }}>
                          {badge}
                        </span>
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
                <p className="text-slate-400 text-sm">Your AI tutor will give deeper focus and extra resources in your chosen specialisation area.</p>
              </div>
              <div className="space-y-3">
                {SPECIALISATIONS.map(({ id, label, desc, icon: Icon, color, glow, skills }) => {
                  const selected = specialisation === id;
                  return (
                    <button key={id} onClick={() => setSpecialisation(id)}
                      className={cn(
                        "w-full flex items-center gap-4 p-5 rounded-xl border transition-all duration-200 text-left hover:scale-[1.01]",
                        selected ? "border-purple-500 bg-purple-500/8" : "border-white/8 glass glass-hover"
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
                        <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center shrink-0">
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
                <p className="text-slate-400 text-sm">Your AI tutor adapts A-Level CS content — code examples, theory depth and exercises — to your style.</p>
              </div>
              <div className="space-y-3">
                {LEARNING_STYLES.map(({ id, label, desc, icon: Icon, color }) => {
                  const selected = learningStyle === id;
                  return (
                    <button key={id} onClick={() => setLearningStyle(id)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left hover:scale-[1.01]",
                        selected ? "border-orange-500 bg-orange-500/8" : "border-white/8 glass glass-hover"
                      )}>
                      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br", selected ? color : "")}
                        style={!selected ? { background: "rgba(255,255,255,0.06)" } : {}}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{label}</div>
                        <div className="text-sm text-slate-400">{desc}</div>
                      </div>
                      {selected && <Check className="w-5 h-5 text-orange-400 shrink-0" />}
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
                  style={{ background: "linear-gradient(135deg,#f97316,#ef4444)", boxShadow: "0 0 30px rgba(249,115,22,0.4)" }}>
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  All set, <span className="gradient-text">{name || "Student"}</span>!
                </h2>
                <p className="text-slate-400 text-sm">Your personalised A-Level Computer Science curriculum</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Level", value: form === "form5" ? "Form 5" : "Form 6", color: "#f97316" },
                  { label: "Topics", value: `${topics.length}`, color: "#7c3aed" },
                  { label: "Hours", value: `~${selectedForm?.hours ?? 0}h`, color: "#2563eb" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="glass rounded-xl p-4 text-center">
                    <div className="text-xl font-bold mb-0.5" style={{ color }}>{value}</div>
                    <div className="text-xs text-slate-400">{label}</div>
                  </div>
                ))}
              </div>

              <div className="glass rounded-xl p-4 space-y-3">
                {selectedSpec && (
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedSpec.color} flex items-center justify-center shrink-0`}>
                      <selectedSpec.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Specialisation</div>
                      <div className="text-sm font-semibold text-white">{selectedSpec.label}</div>
                    </div>
                  </div>
                )}
                <div className="h-px bg-white/6" />
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">First Topics You&apos;ll Study</div>
                {topics.slice(0, 3).map(({ id, title, badge, badgeColor }) => (
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
                  <div className="w-8 h-8 border-2 border-white/20 border-t-orange-500 rounded-full animate-spin" />
                  <p className="text-orange-300 text-sm font-medium">{GEN_PHASES[genPhase]}</p>
                  <div className="flex gap-1.5">
                    {GEN_PHASES.map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full transition-all duration-300"
                        style={{ background: i <= genPhase ? "#f97316" : "rgba(255,255,255,0.1)" }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 sm:mt-8 pt-5 sm:pt-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={() => step === 0 ? router.push("/secondary/select-level") : setStep((s) => s - 1)}
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
