"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Bell, Shield, LogOut, ChevronRight, Check, Edit3, Save, X,
  Eye, EyeOff, Headphones, BookOpen, Hand, Zap, Clock, Target, Volume2,
  GraduationCap, Code2, Brain, Settings,
  RotateCcw, Download, Trash2, ArrowLeft, Lock, KeyRound, Mail,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getStreak, getAvgScore, getTotalHours, getProgress, exportData } from "@/lib/progress";

interface EduProfile {
  name?: string;
  educationType?: string;
  level?: string;
  form?: string;
  programLabel?: string;
  universityLabel?: string;
  year?: string;
  learningStyle?: string;
  focusArea?: string;
  specialisation?: string;
  specialisationLabel?: string;
  combination?: string;
}

function getLevelLabel(profile: EduProfile): string {
  if (profile.educationType === "secondary" && profile.level === "o-level")
    return `O Level · ${profile.form ? `Form ${profile.form.replace("form", "")}` : ""}`;
  if (profile.educationType === "secondary" && profile.level === "a-level")
    return `A Level · ${profile.form === "form5" ? "Form 5" : "Form 6"}`;
  if (profile.educationType === "college")
    return `NACTE · ${profile.programLabel ?? "IT Program"}`;
  if (profile.educationType === "university")
    return `${profile.universityLabel ?? "University"} · ${profile.year ?? ""}`;
  return "Not set";
}

const LEARNING_STYLES = [
  { id: "visual",      label: "Visual",   icon: Eye,       color: "#7c3aed" },
  { id: "auditory",    label: "Auditory", icon: Headphones, color: "#2563eb" },
  { id: "reading",     label: "Reading",  icon: BookOpen,  color: "#06b6d4" },
  { id: "kinesthetic", label: "Hands-on", icon: Hand,      color: "#10b981" },
];

const DIFFICULTY_LEVELS = [
  { id: "adaptive",     label: "Adaptive AI",    desc: "AI adjusts difficulty in real time based on your performance", color: "#7c3aed" },
  { id: "beginner",     label: "Beginner",        desc: "Slower pace with extra examples and explanations",            color: "#10b981" },
  { id: "intermediate", label: "Intermediate",    desc: "Standard pace matching the syllabus",                        color: "#2563eb" },
  { id: "advanced",     label: "Advanced",        desc: "Faster pace with deeper theory and harder problems",          color: "#f59e0b" },
];

const SESSION_LENGTHS = [
  { id: "15", label: "15 min", desc: "Quick daily micro-sessions" },
  { id: "30", label: "30 min", desc: "Balanced daily sessions" },
  { id: "45", label: "45 min", desc: "Deep focus sessions" },
  { id: "60", label: "1 hour", desc: "Extended study blocks" },
];

const SIDEBAR_ITEMS = [
  { id: "profile",       label: "Profile",        icon: User },
  { id: "learning",      label: "Learning Path",  icon: GraduationCap },
  { id: "preferences",   label: "AI Preferences", icon: Brain },
  { id: "notifications", label: "Notifications",  icon: Bell },
  { id: "account",       label: "Account & Data", icon: Shield },
];

export default function SettingsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("profile");
  const [profile, setProfile] = useState<EduProfile>({});
  const [userEmail, setUserEmail] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [learningStyle, setLearningStyle] = useState("visual");
  const [difficulty, setDifficulty] = useState("adaptive");
  const [sessionLength, setSessionLength] = useState("30");
  const [savedFeedback, setSavedFeedback] = useState(false);

  const [notifs, setNotifs] = useState({
    studyReminders: true,
    weeklyReport: true,
    newContent: false,
    achievements: true,
    aiTutor: true,
  });

  const [voicePrefs, setVoicePrefs] = useState({
    voice: true,
    autoVoice: false,
    codeHighlight: true,
    latex: true,
    animations: true,
  });

  const [changePwOpen, setChangePwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [pwChanging, setPwChanging] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("eduProfile");
      if (raw) {
        const p = JSON.parse(raw);
        setProfile(p);
        setNameInput(p.name ?? "");
        if (p.learningStyle) setLearningStyle(p.learningStyle);
      }
      const prefs = localStorage.getItem("eduPrefs");
      if (prefs) {
        const p = JSON.parse(prefs);
        if (p.difficulty) setDifficulty(p.difficulty);
        if (p.sessionLength) setSessionLength(p.sessionLength);
        if (p.notifs) setNotifs(p.notifs);
        if (p.voicePrefs) setVoicePrefs((prev) => ({ ...prev, ...p.voicePrefs }));
      }
    } catch {}

    // Load real email from Supabase Auth
    (async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) setUserEmail(user.email);
      } catch {}
    })();
  }, []);

  function savePreferences() {
    try {
      const updatedProfile = { ...profile, name: nameInput, learningStyle };
      localStorage.setItem("eduProfile", JSON.stringify(updatedProfile));
      localStorage.setItem("eduPrefs", JSON.stringify({ difficulty, sessionLength, notifs, voicePrefs }));
      setProfile(updatedProfile);
      setEditingName(false);
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2500);
    } catch {}
  }

  async function handleChangePassword() {
    setPwMsg(null);
    if (pwForm.next.length < 6) {
      setPwMsg({ type: "err", text: "New password must be at least 6 characters." });
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg({ type: "err", text: "Passwords do not match." });
      return;
    }
    setPwChanging(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { error } = await supabase.auth.updateUser({ password: pwForm.next });
      if (error) {
        setPwMsg({ type: "err", text: error.message });
      } else {
        setPwMsg({ type: "ok", text: "Password updated successfully!" });
        setPwForm({ current: "", next: "", confirm: "" });
        setTimeout(() => { setChangePwOpen(false); setPwMsg(null); }, 2200);
      }
    } catch {
      setPwMsg({ type: "err", text: "Failed to update password. Please try again." });
    } finally {
      setPwChanging(false);
    }
  }

  async function signOut() {
    setSigningOut(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      await supabase.auth.signOut();
    } catch {}
    localStorage.removeItem("eduProfile");
    localStorage.removeItem("eduPrefs");
    localStorage.removeItem("eduProgress");
    window.location.href = "/login";
  }

  function resetProgress() {
    if (confirm("This will reset all your progress and learning data. Are you sure?")) {
      localStorage.removeItem("eduProfile");
      localStorage.removeItem("eduPrefs");
      localStorage.removeItem("eduProgress");
      router.push("/select-education");
    }
  }

  const initials = (nameInput || profile.name || "S")
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const levelLabel = getLevelLabel(profile);

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-screen-lg mx-auto">

      {/* Page header */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 shrink-0" />
            Settings
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm truncate">
            Manage your profile, learning preferences and account
          </p>
        </div>
        {savedFeedback && (
          <div
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399" }}
          >
            <Check className="w-3.5 h-3.5" /> Saved
          </div>
        )}
      </div>

      {/* Mobile tab strip — sits above the flex layout */}
      <div className="md:hidden flex gap-2 overflow-x-auto pb-2 mb-5 -mx-1 px-1">
        {SIDEBAR_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-all duration-200",
              activeSection === id
                ? "gradient-bg text-white shadow-lg"
                : "glass text-slate-400 hover:text-white"
            )}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      <div className="flex gap-6">

        {/* Desktop sidebar */}
        <aside className="w-52 shrink-0 hidden md:block">
          <nav className="space-y-1 sticky top-24">
            {SIDEBAR_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left",
                  activeSection === id
                    ? "bg-purple-500/15 text-white border border-purple-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/6"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-5">

          {/* ── PROFILE ── */}
          {activeSection === "profile" && (
            <div className="space-y-5">

              {/* Avatar + identity card */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-5">Profile Information</h2>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6">
                  {/* Avatar */}
                  <div
                    className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center text-2xl font-bold text-white glow-purple shrink-0"
                  >
                    {initials}
                  </div>

                  {/* Name + email */}
                  <div className="flex-1 w-full text-center sm:text-left">
                    {editingName ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          className="input-base flex-1 text-base font-bold py-2"
                          autoFocus
                          onKeyDown={(e) => e.key === "Enter" && savePreferences()}
                        />
                        <button
                          onClick={savePreferences}
                          className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shrink-0"
                        >
                          <Save className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => { setEditingName(false); setNameInput(profile.name ?? ""); }}
                          className="w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-400 shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                        <span className="text-lg sm:text-xl font-bold text-white">
                          {nameInput || "Student"}
                        </span>
                        <button
                          onClick={() => setEditingName(true)}
                          className="w-7 h-7 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Real email from Supabase */}
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-sm text-slate-400 truncate">
                        {userEmail || "Loading…"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">EduAI OS Student</div>
                  </div>
                </div>

                {/* Education level summary */}
                <div
                  className="p-4 rounded-xl space-y-2"
                  style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="w-4 h-4 text-purple-400" />
                      <span className="font-medium text-white">{levelLabel}</span>
                    </div>
                    <button
                      onClick={() => router.push("/select-education")}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                    >
                      Change <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    <span>Computer Science curriculum</span>
                  </div>
                </div>
              </div>

              {/* Learning style */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-1">Learning Style</h2>
                <p className="text-slate-400 text-sm mb-4">
                  Your AI tutor adapts explanations and examples to your preferred style.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {LEARNING_STYLES.map(({ id, label, icon: Icon, color }) => {
                    const selected = learningStyle === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setLearningStyle(id)}
                        className={cn(
                          "flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-all duration-200 text-left hover:scale-[1.01]",
                          selected
                            ? "border-purple-500 bg-purple-500/10"
                            : "border-white/8 glass glass-hover"
                        )}
                        style={selected ? { boxShadow: `0 0 16px ${color}30` } : {}}
                      >
                        <div
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: selected ? `${color}25` : "rgba(255,255,255,0.06)" }}
                        >
                          <Icon className="w-4 h-4" style={{ color: selected ? color : "#64748b" }} />
                        </div>
                        <span className={cn("font-medium text-sm", selected ? "text-white" : "text-slate-400")}>
                          {label}
                        </span>
                        {selected && <Check className="w-4 h-4 ml-auto shrink-0" style={{ color }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={savePreferences}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Profile Changes
              </button>
            </div>
          )}

          {/* ── LEARNING PATH ── */}
          {activeSection === "learning" && (
            <div className="space-y-5">
              <div className="glass rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-1">Your Learning Path</h2>
                <p className="text-slate-400 text-sm mb-5">View and manage your current education path.</p>

                <div className="space-y-3">
                  {[
                    {
                      label: "Education Type",
                      value: profile.educationType
                        ? profile.educationType.charAt(0).toUpperCase() + profile.educationType.slice(1)
                        : "Not set",
                      icon: GraduationCap, color: "#7c3aed",
                    },
                    { label: "Level / Program", value: levelLabel, icon: Code2, color: "#2563eb" },
                    {
                      label: "Learning Style",
                      value: LEARNING_STYLES.find((s) => s.id === learningStyle)?.label ?? "Not set",
                      icon: Brain, color: "#10b981",
                    },
                    {
                      label: "Focus Area",
                      value: profile.focusArea ?? profile.specialisationLabel ?? profile.specialisation ?? "Not set",
                      icon: Target, color: "#f59e0b",
                    },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div
                      key={label}
                      className="flex items-center gap-4 p-4 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${color}15` }}
                      >
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-400">{label}</div>
                        <div className="text-sm font-semibold text-white truncate">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning stats */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-4">Learning Statistics</h2>
                <div className="grid grid-cols-2 gap-3">
                  {(() => {
                    const prog = getProgress();
                    const streak = getStreak();
                    const avg = getAvgScore();
                    const hrs = getTotalHours();
                    return [
                      { label: "Study Streak",      value: streak > 0 ? `${streak} day${streak !== 1 ? "s" : ""}` : "—", icon: Zap,    color: "#f59e0b" },
                      { label: "Topics Completed",  value: prog.completedTopics.length > 0 ? String(prog.completedTopics.length) : "—", icon: Check,   color: "#10b981" },
                      { label: "Hours Studied",     value: hrs > 0 ? `${hrs}h` : "—",                                                   icon: Clock,   color: "#2563eb" },
                      { label: "Average Score",     value: avg > 0 ? `${avg}%` : "—",                                                   icon: Target,  color: "#7c3aed" },
                    ];
                  })().map(({ label, value, icon: Icon, color }) => (
                    <div
                      key={label}
                      className="p-4 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: `${color}15` }}
                        >
                          <Icon className="w-3.5 h-3.5" style={{ color }} />
                        </div>
                        <span className="text-xs text-slate-400">{label}</span>
                      </div>
                      <div className="text-xl font-bold text-white">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => router.push("/select-education")}
                className="btn-ghost w-full flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-4 h-4" /> Change Education Level
              </button>
            </div>
          )}

          {/* ── AI PREFERENCES ── */}
          {activeSection === "preferences" && (
            <div className="space-y-5">
              {/* Difficulty */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-1">Content Difficulty</h2>
                <p className="text-slate-400 text-sm mb-4">
                  Control how your AI tutor paces and pitches content.
                </p>
                <div className="space-y-2">
                  {DIFFICULTY_LEVELS.map(({ id, label, desc, color }) => {
                    const selected = difficulty === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setDifficulty(id)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left hover:scale-[1.01]",
                          selected ? "border-purple-500 bg-purple-500/8" : "border-white/8 glass glass-hover"
                        )}
                        style={selected ? { boxShadow: `0 0 16px ${color}30` } : {}}
                      >
                        <div
                          className="w-3 h-3 rounded-full shrink-0 border-2 transition-all"
                          style={{ borderColor: color, background: selected ? color : "transparent" }}
                        />
                        <div className="flex-1">
                          <div className={cn("font-semibold text-sm", selected ? "text-white" : "text-slate-300")}>{label}</div>
                          <div className="text-xs text-slate-400">{desc}</div>
                        </div>
                        {selected && <Check className="w-4 h-4 shrink-0" style={{ color }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Session length */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" /> Daily Session Length
                </h2>
                <p className="text-slate-400 text-sm mb-4">
                  Your AI tutor structures content to fit your chosen duration.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {SESSION_LENGTHS.map(({ id, label, desc }) => {
                    const selected = sessionLength === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setSessionLength(id)}
                        className={cn(
                          "p-4 rounded-xl border text-left transition-all duration-200 hover:scale-[1.01]",
                          selected ? "border-blue-500 bg-blue-500/10" : "border-white/8 glass glass-hover"
                        )}
                      >
                        <div className={cn("text-xl font-bold mb-0.5", selected ? "text-white" : "text-slate-300")}>{label}</div>
                        <div className="text-xs text-slate-400">{desc}</div>
                        {selected && <Check className="w-4 h-4 text-blue-400 mt-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tutor display toggles */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-400" /> Tutor Voice & Display
                </h2>
                <p className="text-slate-400 text-sm mb-4">
                  Customise how your AI tutor communicates with you.
                </p>
                <div className="space-y-3">
                  {(Object.entries({
                    voice:          "Voice narration for lessons",
                    autoVoice:      "Auto-start voice when chapter loads",
                    codeHighlight:  "Show code syntax highlighting",
                    latex:          "Display formulas with LaTeX rendering",
                    animations:     "Show step-by-step algorithm animations",
                  }) as [keyof typeof voicePrefs, string][]).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-300 pr-4">{label}</span>
                      <button
                        onClick={() => setVoicePrefs((prev) => ({ ...prev, [key]: !prev[key] }))}
                        className="w-12 h-6 rounded-full relative transition-all duration-200 shrink-0 focus:outline-none"
                        style={{ background: voicePrefs[key] ? "#10b981" : "rgba(255,255,255,0.12)" }}
                        aria-checked={voicePrefs[key]}
                        role="switch"
                      >
                        <div
                          className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-200 shadow"
                          style={{ left: voicePrefs[key] ? "calc(100% - 1.375rem)" : "0.125rem" }}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={savePreferences}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Preferences
              </button>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeSection === "notifications" && (
            <div className="space-y-5">
              <div className="glass rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-400" /> Notification Settings
                </h2>
                <p className="text-slate-400 text-sm mb-5">
                  Control which notifications EduAI OS sends you.
                </p>

                <div className="space-y-1">
                  {(Object.entries({
                    studyReminders: { label: "Daily study reminders",   desc: "Get reminded to study at your set time every day",                 color: "#7c3aed" },
                    weeklyReport:   { label: "Weekly progress report",  desc: "Summary of topics covered, scores and streak",                     color: "#2563eb" },
                    newContent:     { label: "New content alerts",      desc: "Get notified when new topics are added to your curriculum",        color: "#06b6d4" },
                    achievements:   { label: "Achievement badges",      desc: "Celebrate when you complete topics or hit streak milestones",      color: "#f59e0b" },
                    aiTutor:        { label: "AI tutor messages",       desc: "Receive tips and nudges from your personal AI tutor",              color: "#10b981" },
                  }) as [keyof typeof notifs, { label: string; desc: string; color: string }][]).map(([key, { label, desc, color }]) => (
                    <div key={key} className="flex items-center gap-4 p-4 rounded-xl transition-colors hover:bg-white/3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white">{label}</div>
                        <div className="text-xs text-slate-400 truncate">{desc}</div>
                      </div>
                      <button
                        onClick={() => setNotifs((prev) => ({ ...prev, [key]: !prev[key] }))}
                        className="w-12 h-6 rounded-full relative transition-all duration-200 shrink-0"
                        style={{ background: notifs[key] ? color : "rgba(255,255,255,0.1)" }}
                        role="switch"
                        aria-checked={notifs[key]}
                      >
                        <div
                          className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-200 shadow"
                          style={{ left: notifs[key] ? "calc(100% - 1.375rem)" : "0.125rem" }}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={savePreferences}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Notification Settings
              </button>
            </div>
          )}

          {/* ── ACCOUNT & DATA ── */}
          {activeSection === "account" && (
            <div className="space-y-5">

              {/* Account info banner */}
              <div
                className="rounded-2xl p-5 flex items-center gap-4"
                style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}
              >
                <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center text-lg font-bold text-white shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{nameInput || "Student"}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="text-xs text-slate-400 truncate">{userEmail || "Loading…"}</span>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" /> Account Security
                </h2>
                <p className="text-slate-400 text-sm mb-5">Manage your account access and credentials.</p>

                <div className="space-y-2">
                  {/* Change Password accordion */}
                  <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
                    <button
                      onClick={() => { setChangePwOpen((o) => !o); setPwMsg(null); }}
                      className="w-full flex items-center justify-between p-4 rounded-xl transition-all hover:bg-white/4 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-white">Change Password</div>
                          <div className="text-xs text-slate-400">Update your Supabase account password</div>
                        </div>
                      </div>
                      <ChevronRight
                        className={cn("w-4 h-4 text-slate-500 transition-transform duration-200", changePwOpen && "rotate-90")}
                      />
                    </button>

                    {changePwOpen && (
                      <div className="px-4 pb-4 space-y-3">
                        {([
                          { key: "current" as const, label: "Current Password",      placeholder: "Enter current password" },
                          { key: "next"    as const, label: "New Password",          placeholder: "At least 6 characters" },
                          { key: "confirm" as const, label: "Confirm New Password",  placeholder: "Re-enter new password" },
                        ]).map(({ key, label, placeholder }) => (
                          <div key={key}>
                            <label className="block text-xs text-slate-400 mb-1">{label}</label>
                            <div className="relative">
                              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                              <input
                                type={showPw[key] ? "text" : "password"}
                                value={pwForm[key]}
                                onChange={(e) => setPwForm((p) => ({ ...p, [key]: e.target.value }))}
                                placeholder={placeholder}
                                className="input-base pl-9 pr-9 text-sm py-2"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPw((p) => ({ ...p, [key]: !p[key] }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                              >
                                {showPw[key] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        ))}

                        {pwMsg && (
                          <div
                            className="text-sm px-3 py-2.5 rounded-lg"
                            style={{
                              background: pwMsg.type === "ok" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                              border: `1px solid ${pwMsg.type === "ok" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                              color: pwMsg.type === "ok" ? "#34d399" : "#f87171",
                            }}
                          >
                            {pwMsg.text}
                          </div>
                        )}

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={handleChangePassword}
                            disabled={pwChanging}
                            className="btn-primary flex-1 text-sm py-2 flex items-center justify-center gap-1.5 disabled:opacity-60"
                          >
                            {pwChanging
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Check className="w-3.5 h-3.5" />
                            }
                            {pwChanging ? "Updating…" : "Update Password"}
                          </button>
                          <button
                            onClick={() => { setChangePwOpen(false); setPwMsg(null); setPwForm({ current: "", next: "", confirm: "" }); }}
                            className="btn-ghost px-4 text-sm py-2"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2FA — coming soon */}
                  <div
                    className="flex items-center justify-between p-4 rounded-xl opacity-60 cursor-not-allowed"
                    style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-white">Two-Factor Authentication</div>
                        <div className="text-xs text-slate-400">Coming soon — extra layer of security</div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 px-2 py-1 rounded-lg"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      Soon
                    </span>
                  </div>
                </div>
              </div>

              {/* Export data */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-400" /> Your Data
                </h2>
                <p className="text-slate-400 text-sm mb-4">Export or manage your learning data.</p>
                <button
                  onClick={() => exportData()}
                  className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:bg-white/4"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-white">Export Learning Data</div>
                    <div className="text-xs text-slate-400">Download your progress, notes and activity as JSON</div>
                  </div>
                </button>
              </div>

              {/* Danger zone */}
              <div
                className="rounded-2xl p-6"
                style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}
              >
                <h2 className="text-base font-bold text-red-400 mb-1 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Danger Zone
                </h2>
                <p className="text-slate-400 text-sm mb-4">These actions cannot be undone.</p>
                <button
                  onClick={resetProgress}
                  className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:bg-red-500/10"
                  style={{ border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  <RotateCcw className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-red-300">Reset All Progress</div>
                    <div className="text-xs text-slate-400">Clears your profile, progress and preferences and restarts setup.</div>
                  </div>
                </button>
              </div>

              {/* Sign out */}
              <button
                onClick={signOut}
                disabled={signingOut}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm text-red-400 transition-all hover:bg-red-500/10 disabled:opacity-60"
                style={{ border: "1px solid rgba(239,68,68,0.2)" }}
              >
                {signingOut
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <LogOut className="w-4 h-4" />
                }
                {signingOut ? "Signing out…" : "Sign Out"}
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
