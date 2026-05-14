"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Brain, ChevronRight, ChevronLeft, Check, Sparkles, Eye, Headphones, BookOpen, Hand,
  Monitor, Code2, Network, Globe, Database, Cpu, Shield, Zap, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Your Form", "CS Syllabus", "Focus Area", "Learning Style", "Ready"];

const FORMS = [
  {
    id: "form1", label: "Form 1", desc: "Junior Secondary · Year 1",
    tag: "Beginner", color: "#10b981",
    peek: ["Intro to Computers", "Hardware Components", "OS Basics", "Typing Skills"],
    hours: 42,
  },
  {
    id: "form2", label: "Form 2", desc: "Junior Secondary · Year 2",
    tag: "Elementary", color: "#06b6d4",
    peek: ["Word Processing", "Spreadsheets", "Internet & Email", "Computer Security"],
    hours: 48,
  },
  {
    id: "form3", label: "Form 3", desc: "Senior Secondary · Year 3",
    tag: "Intermediate", color: "#7c3aed",
    peek: ["Database Systems", "Programming (VB)", "Algorithms", "Networks"],
    hours: 52,
  },
  {
    id: "form4", label: "Form 4", desc: "Senior Secondary · CSEE Year",
    tag: "CSEE Prep", color: "#f59e0b",
    peek: ["Python Programming", "Web Design", "Systems Analysis", "Exam Prep"],
    hours: 60,
  },
];

const CS_TOPICS: Record<string, { id: string; title: string; desc: string; icon: React.ElementType; badge: string; badgeColor: string; hours: number }[]> = {
  form1: [
    { id: "t1", title: "Introduction to Computer Systems", desc: "Types, components and uses of computers in daily life", icon: Monitor, badge: "Core", badgeColor: "#10b981", hours: 6 },
    { id: "t2", title: "Computer Hardware Components", desc: "CPU, RAM, ROM, input/output and storage devices", icon: Cpu, badge: "Core", badgeColor: "#10b981", hours: 7 },
    { id: "t3", title: "Operating Systems Basics", desc: "Windows interface, file management and folders", icon: Monitor, badge: "Core", badgeColor: "#10b981", hours: 5 },
    { id: "t4", title: "Keyboarding & Typing Skills", desc: "Touch typing, keyboard shortcuts and ergonomics", icon: Code2, badge: "Practical", badgeColor: "#06b6d4", hours: 8 },
    { id: "t5", title: "Data and Information", desc: "Difference between data and information, data types", icon: Database, badge: "Theory", badgeColor: "#7c3aed", hours: 5 },
    { id: "t6", title: "Storage Devices & Memory", desc: "HDD, SSD, USB drives, optical media, RAM vs ROM", icon: Database, badge: "Core", badgeColor: "#10b981", hours: 6 },
    { id: "t7", title: "Health & Safety in Computing", desc: "Posture, eye strain, electrical safety, ergonomics", icon: Shield, badge: "Essential", badgeColor: "#f59e0b", hours: 5 },
  ],
  form2: [
    { id: "t1", title: "Word Processing (MS Word)", desc: "Create, format and print professional documents", icon: BookOpen, badge: "Core", badgeColor: "#10b981", hours: 8 },
    { id: "t2", title: "Spreadsheet Applications (Excel)", desc: "Formulas, functions, charts and data analysis", icon: Database, badge: "Core", badgeColor: "#10b981", hours: 8 },
    { id: "t3", title: "Internet & Email Communication", desc: "Browsing, search engines and professional email", icon: Globe, badge: "Core", badgeColor: "#10b981", hours: 7 },
    { id: "t4", title: "Computer Security & Antivirus", desc: "Malware types, firewalls and protection strategies", icon: Shield, badge: "Important", badgeColor: "#ef4444", hours: 7 },
    { id: "t5", title: "Computer Networks Introduction", desc: "LAN, WAN, network types and basic topologies", icon: Network, badge: "Core", badgeColor: "#10b981", hours: 7 },
    { id: "t6", title: "Multimedia Concepts", desc: "Digital images, audio, video editing basics", icon: Monitor, badge: "Creative", badgeColor: "#ec4899", hours: 6 },
    { id: "t7", title: "Digital Citizenship & Ethics", desc: "Online safety, copyright, intellectual property", icon: Shield, badge: "Essential", badgeColor: "#f59e0b", hours: 5 },
  ],
  form3: [
    { id: "t1", title: "Database Management (MS Access)", desc: "Tables, queries, forms, reports and relationships", icon: Database, badge: "Core", badgeColor: "#10b981", hours: 9 },
    { id: "t2", title: "Presentation Software (PowerPoint)", desc: "Slide design, animations and delivery techniques", icon: Monitor, badge: "Core", badgeColor: "#10b981", hours: 6 },
    { id: "t3", title: "Programming with Visual Basic", desc: "Variables, loops, conditions and simple programs", icon: Code2, badge: "Code", badgeColor: "#7c3aed", hours: 10 },
    { id: "t4", title: "Algorithms & Flowcharts", desc: "Problem-solving, pseudocode and flowchart symbols", icon: Zap, badge: "Logic", badgeColor: "#06b6d4", hours: 8 },
    { id: "t5", title: "Networks & Communication Systems", desc: "Protocols, email systems and network devices", icon: Network, badge: "Core", badgeColor: "#10b981", hours: 8 },
    { id: "t6", title: "E-Commerce & Online Transactions", desc: "Online shopping, mobile money and security risks", icon: Globe, badge: "Modern", badgeColor: "#06b6d4", hours: 6 },
    { id: "t7", title: "Computer Maintenance & Troubleshooting", desc: "Hardware cleaning, software updates, diagnostics", icon: Cpu, badge: "Practical", badgeColor: "#f59e0b", hours: 5 },
  ],
  form4: [
    { id: "t1", title: "Advanced Programming with Python", desc: "Python syntax, functions, file handling and OOP basics", icon: Code2, badge: "Code", badgeColor: "#7c3aed", hours: 12 },
    { id: "t2", title: "Web Design (HTML & CSS)", desc: "HTML tags, CSS styling and building static websites", icon: Globe, badge: "Code", badgeColor: "#7c3aed", hours: 10 },
    { id: "t3", title: "Systems Analysis & Design", desc: "SDLC, data flow diagrams and system documentation", icon: Database, badge: "Theory", badgeColor: "#06b6d4", hours: 9 },
    { id: "t4", title: "Computer Ethics & Cyber Law", desc: "Privacy law, cybercrime, digital rights and piracy", icon: Shield, badge: "Important", badgeColor: "#ef4444", hours: 7 },
    { id: "t5", title: "Artificial Intelligence Overview", desc: "AI applications, robotics and machine learning basics", icon: Brain, badge: "Future", badgeColor: "#ec4899", hours: 6 },
    { id: "t6", title: "ICT in Society & Development", desc: "Role of ICT in healthcare, business and education", icon: Globe, badge: "Theory", badgeColor: "#06b6d4", hours: 5 },
    { id: "t7", title: "CSEE Examination Preparation", desc: "Past papers, exam strategies and revision techniques", icon: Sparkles, badge: "Exam", badgeColor: "#f59e0b", hours: 11 },
  ],
};

const FOCUS_AREAS = [
  {
    id: "web", label: "Web & Digital Design",
    desc: "Build websites, understand the internet and create digital content",
    icon: Globe, color: "from-blue-600 to-cyan-500", glow: "rgba(37,99,235,0.3)",
    skills: ["HTML & CSS", "Internet Safety", "E-Commerce"],
  },
  {
    id: "programming", label: "Programming & Algorithms",
    desc: "Write code, design algorithms and solve computational problems",
    icon: Code2, color: "from-purple-600 to-violet-600", glow: "rgba(124,58,237,0.3)",
    skills: ["Python / VB", "Flowcharts", "Logic"],
  },
  {
    id: "networking", label: "Networks & Hardware",
    desc: "Understand computers, networks and how digital systems work",
    icon: Network, color: "from-emerald-600 to-teal-500", glow: "rgba(16,185,129,0.3)",
    skills: ["LAN / WAN", "Hardware", "Security"],
  },
];

const LEARNING_STYLES = [
  { id: "visual", label: "Visual Learner", desc: "Diagrams, videos and visual examples work best for me", icon: Eye, color: "from-purple-600 to-blue-600" },
  { id: "auditory", label: "Auditory Learner", desc: "I prefer listening to explanations and discussions", icon: Headphones, color: "from-blue-600 to-cyan-500" },
  { id: "reading", label: "Reading / Writing", desc: "I learn through reading notes and writing summaries", icon: BookOpen, color: "from-cyan-500 to-emerald-500" },
  { id: "kinesthetic", label: "Hands-on Practice", desc: "I learn best by doing exercises and practical tasks", icon: Hand, color: "from-emerald-500 to-teal-500" },
];

const GEN_PHASES = ["Analyzing your CS profile…", "Building topic roadmap…", "Personalizing difficulty levels…", "Curriculum ready!"];

export default function OLevelOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [form, setForm] = useState("");
  const [focusArea, setFocusArea] = useState("");
  const [learningStyle, setLearningStyle] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genPhase, setGenPhase] = useState(0);
  const [hoveredForm, setHoveredForm] = useState<string | null>(null);

  const selectedForm = FORMS.find((f) => f.id === form);
  const topics = CS_TOPICS[form] ?? [];
  const selectedFocus = FOCUS_AREAS.find((f) => f.id === focusArea);

  async function finish() {
    setGenerating(true);
    for (let i = 0; i < GEN_PHASES.length; i++) {
      setGenPhase(i);
      await new Promise((r) => setTimeout(r, 900));
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("eduProfile", JSON.stringify({
        educationType: "secondary",
        level: "o-level",
        form,
        name,
        focusArea,
        learningStyle,
        subjects: topics.map((t) => ({ id: t.id, title: t.title })),
        coreSubjects: ["computer_studies"],
        electives: [],
      }));
    }
    router.push("/dashboard");
  }

  const canNext = [
    name.trim().length > 0 && form !== "",
    true,
    focusArea !== "",
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
          <span className="text-sm font-medium text-slate-400">O Level · Computer Studies</span>
        </div>

        {/* Progress stepper */}
        <div className="flex items-center mb-8 gap-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  i < step ? "gradient-bg text-white shadow-lg" :
                  i === step ? "border-2 border-purple-500 text-purple-400 bg-purple-500/10" :
                  "border border-white/10 text-slate-600"
                )}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={cn("text-[10px] font-medium hidden sm:block",
                  i === step ? "text-white" : i < step ? "text-purple-400" : "text-slate-600"
                )}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all duration-500"
                  style={{ background: i < step ? "linear-gradient(90deg,#7c3aed,#2563eb)" : "rgba(255,255,255,0.07)" }} />
              )}
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-4 sm:p-8">

          {/* Step 0 — Name + Form */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-emerald-400 mb-3"
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <Monitor className="w-3 h-3" /> NECTA O-Level · Computer Studies
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">Let&apos;s set up your profile</h2>
                <p className="text-slate-400 text-sm">Tell us your name and current form so your AI tutor can personalise every lesson.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Your Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amina Juma" className="input-base" autoFocus />
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
                          "p-4 rounded-xl border text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
                          isSelected
                            ? "border-purple-500 bg-purple-500/10"
                            : "border-white/8 glass glass-hover"
                        )}
                        style={isSelected ? { boxShadow: `0 0 20px ${color}30` } : {}}>
                        <div className="flex items-center justify-between mb-2">
                          <div className={cn("font-bold text-base", isSelected ? "text-white" : "text-slate-200")}>{label}</div>
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

          {/* Step 1 — CS Topics for selected form */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-white">
                    {selectedForm?.label} Computer Studies Syllabus
                  </h2>
                </div>
                <p className="text-slate-400 text-sm">
                  These are your NECTA-aligned Computer Studies topics for {selectedForm?.label}.
                  Your AI tutor will teach each topic step by step.
                </p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-sm text-purple-300">
                  <strong>{topics.length} topics</strong> · ~{selectedForm?.hours ?? 0}h total · AI-adapted to your pace
                </span>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
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

          {/* Step 2 — Focus Area */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Choose Your Focus Area</h2>
                <p className="text-slate-400 text-sm">
                  Pick the CS area you&apos;re most interested in. Your AI tutor will give extra depth in this area.
                </p>
              </div>
              <div className="space-y-3">
                {FOCUS_AREAS.map(({ id, label, desc, icon: Icon, color, glow, skills }) => {
                  const selected = focusArea === id;
                  return (
                    <button key={id} onClick={() => setFocusArea(id)}
                      className={cn(
                        "w-full flex items-center gap-4 p-5 rounded-xl border transition-all duration-200 text-left hover:scale-[1.01] active:scale-[0.99]",
                        selected ? "border-purple-500 bg-purple-500/8" : "border-white/8 glass glass-hover"
                      )}
                      style={selected ? { boxShadow: `0 0 24px ${glow}` } : {}}>
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}
                        style={{ boxShadow: selected ? `0 0 16px ${glow}` : "none" }}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white mb-0.5">{label}</div>
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
                <p className="text-slate-400 text-sm">Your AI tutor adapts explanations, examples and exercises to match your style.</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {LEARNING_STYLES.map(({ id, label, desc, icon: Icon, color }) => {
                  const selected = learningStyle === id;
                  return (
                    <button key={id} onClick={() => setLearningStyle(id)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left hover:scale-[1.01]",
                        selected ? "border-purple-500 bg-purple-500/10" : "border-white/8 glass glass-hover"
                      )}>
                      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br", selected ? color : "")}
                        style={!selected ? { background: "rgba(255,255,255,0.06)" } : {}}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{label}</div>
                        <div className="text-sm text-slate-400">{desc}</div>
                      </div>
                      {selected && <Check className="w-5 h-5 text-purple-400 shrink-0" />}
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
                <div className="w-20 h-20 rounded-3xl gradient-bg flex items-center justify-center mx-auto mb-4 glow-purple">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Ready, <span className="gradient-text">{name || "Student"}</span>!
                </h2>
                <p className="text-slate-400 text-sm">Here&apos;s your personalised CS curriculum summary</p>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Level", value: selectedForm?.label ?? "—", color: "#10b981" },
                  { label: "Topics", value: `${topics.length}`, color: "#7c3aed" },
                  { label: "Hours", value: `~${selectedForm?.hours ?? 0}h`, color: "#2563eb" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="glass rounded-xl p-4 text-center">
                    <div className="text-xl font-bold mb-0.5" style={{ color }}>{value}</div>
                    <div className="text-xs text-slate-400">{label}</div>
                  </div>
                ))}
              </div>

              {/* Details */}
              <div className="glass rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shrink-0">
                    <Monitor className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Curriculum</div>
                    <div className="text-sm font-semibold text-white">O Level Computer Studies · {selectedForm?.label}</div>
                  </div>
                </div>
                <div className="h-px bg-white/6" />
                {selectedFocus && (
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedFocus.color} flex items-center justify-center shrink-0`}>
                      <selectedFocus.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Focus Area</div>
                      <div className="text-sm font-semibold text-white">{selectedFocus.label}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* First 3 topics preview */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">First Topics You&apos;ll Study</div>
                {topics.slice(0, 3).map(({ id, title, badge, badgeColor }) => (
                  <div key={id} className="flex items-center gap-2 p-2.5 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: badgeColor }} />
                    <span className="text-sm text-slate-300 flex-1">{title}</span>
                    <span className="text-xs font-medium px-1.5 py-0.5 rounded"
                      style={{ background: `${badgeColor}20`, color: badgeColor }}>{badge}</span>
                  </div>
                ))}
              </div>

              {generating && (
                <div className="flex flex-col items-center gap-3 py-2">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin" />
                  <p className="text-purple-300 text-sm font-medium">{GEN_PHASES[genPhase]}</p>
                  <div className="flex gap-1.5">
                    {GEN_PHASES.map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full transition-all duration-300"
                        style={{ background: i <= genPhase ? "#7c3aed" : "rgba(255,255,255,0.1)" }} />
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
