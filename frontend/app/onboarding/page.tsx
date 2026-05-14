"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Brain, GraduationCap, BookOpen, Palette, Headphones, Eye, Hand,
  ChevronRight, ChevronLeft, Check, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Identity", "Subjects", "Learning Style", "Preview"];

const SUBJECTS = [
  { id: "mathematics", label: "Mathematics", emoji: "📐" },
  { id: "physics", label: "Physics", emoji: "⚛️" },
  { id: "chemistry", label: "Chemistry", emoji: "🧪" },
  { id: "biology", label: "Biology", emoji: "🧬" },
  { id: "computer_science", label: "Computer Science", emoji: "💻" },
  { id: "english", label: "English Literature", emoji: "📖" },
  { id: "history", label: "History", emoji: "🏛️" },
  { id: "economics", label: "Economics", emoji: "📊" },
  { id: "geography", label: "Geography", emoji: "🌍" },
  { id: "psychology", label: "Psychology", emoji: "🧠" },
];

const LEARNING_STYLES = [
  { id: "visual", label: "Visual", desc: "I learn best from diagrams, charts, and videos", icon: Eye },
  { id: "auditory", label: "Auditory", desc: "I prefer listening to explanations and discussions", icon: Headphones },
  { id: "reading", label: "Reading/Writing", desc: "I learn best through reading and taking notes", icon: BookOpen },
  { id: "kinesthetic", label: "Hands-on", desc: "I prefer learning by doing and practising", icon: Hand },
];

const GRADE_LEVELS = [
  "Grade 9", "Grade 10", "Grade 11", "Grade 12",
  "Diploma / Certificate", "Undergraduate Year 1",
  "Undergraduate Year 2", "Undergraduate Year 3",
  "Undergraduate Year 4", "Postgraduate",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [learningStyle, setLearningStyle] = useState("");
  const [generating, setGenerating] = useState(false);

  function toggleSubject(id: string) {
    setSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function finish() {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2500));
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "#0a0a0f" }}>
      <div className="absolute inset-0 radial-purple pointer-events-none" />
      <div className="absolute inset-0 radial-blue pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Brain className="w-6 h-6 text-purple-400" />
          <span className="font-bold text-xl gradient-text">EduAI OS</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-all",
                i < step ? "gradient-bg text-white" :
                i === step ? "border-2 border-purple-500 text-purple-400" :
                "border border-white/15 text-slate-600"
              )}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn("text-sm hidden sm:block",
                i === step ? "text-white font-medium" : "text-slate-500"
              )}>{s}</span>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px ml-2"
                  style={{ background: i < step ? "linear-gradient(90deg,#7c3aed,#2563eb)" : "rgba(255,255,255,0.08)" }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8">

          {/* Step 0 — Identity */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Welcome! Tell us about yourself</h2>
                <p className="text-slate-400">We&apos;ll personalise your learning experience</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Your Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Johnson" className="input-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Education Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {GRADE_LEVELS.map((g) => (
                    <button key={g} onClick={() => setGrade(g)}
                      className={cn(
                        "px-4 py-3 rounded-xl text-sm font-medium text-left transition-all",
                        grade === g
                          ? "gradient-bg text-white"
                          : "glass glass-hover text-slate-300"
                      )}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Subjects */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Choose your subjects</h2>
                <p className="text-slate-400">Select all subjects you want to study</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SUBJECTS.map((s) => {
                  const selected = subjects.includes(s.id);
                  return (
                    <button key={s.id} onClick={() => toggleSubject(s.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                        selected
                          ? "border-purple-500 bg-purple-500/10 text-white"
                          : "border-white/8 glass glass-hover text-slate-400 hover:text-white"
                      )}>
                      <span className="text-2xl">{s.emoji}</span>
                      <span className="text-sm font-medium">{s.label}</span>
                      {selected && <Check className="w-4 h-4 text-purple-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2 — Learning style */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">How do you learn best?</h2>
                <p className="text-slate-400">This helps us tailor content delivery for you</p>
              </div>
              <div className="space-y-3">
                {LEARNING_STYLES.map(({ id, label, desc, icon: Icon }) => (
                  <button key={id} onClick={() => setLearningStyle(id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                      learningStyle === id
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-white/8 glass glass-hover"
                    )}>
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                      learningStyle === id ? "gradient-bg" : "bg-white/6"
                    )}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{label}</div>
                      <div className="text-sm text-slate-400">{desc}</div>
                    </div>
                    {learningStyle === id && (
                      <Check className="w-5 h-5 text-purple-400 ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Preview */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 rounded-3xl gradient-bg flex items-center justify-center mx-auto glow-purple">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Ready to build your curriculum, {name || "Student"}!
                </h2>
                <p className="text-slate-400">
                  We&apos;ll generate personalised curricula for{" "}
                  <span className="text-purple-400 font-medium">{subjects.length} subjects</span> using AI.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Subjects", value: subjects.length },
                  { label: "Grade", value: grade.split(" ")[1] || "—" },
                  { label: "Style", value: learningStyle || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="glass rounded-xl p-4">
                    <div className="text-2xl font-bold gradient-text">{value}</div>
                    <div className="text-sm text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
              {generating && (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin" />
                  <p className="text-slate-400 text-sm">Generating your personalised curricula with AI…</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={() => setStep((s) => s - 1)} disabled={step === 0}
              className="btn-ghost flex items-center gap-2 disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={(step === 0 && (!name || !grade)) || (step === 1 && subjects.length === 0) || (step === 2 && !learningStyle)}
                className="btn-primary flex items-center gap-2 disabled:opacity-40">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={finish} disabled={generating}
                className="btn-primary flex items-center gap-2">
                {generating ? "Generating…" : "Generate My Curriculum"}
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
