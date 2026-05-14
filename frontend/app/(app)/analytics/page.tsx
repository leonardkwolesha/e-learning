"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Cell,
} from "recharts";
import { TrendingUp, Zap, BookOpen, Clock, Target, AlertTriangle, MessageSquare } from "lucide-react";
import { getProgress, getStreak, getAvgScore, getTotalHours } from "@/lib/progress";

const CS_RADAR = [
  { subject: "Programming", score: 0 },
  { subject: "Databases", score: 0 },
  { subject: "Networks", score: 0 },
  { subject: "Security", score: 0 },
  { subject: "Web Dev", score: 0 },
  { subject: "Algorithms", score: 0 },
];

const WEAK_CS = [
  { concept: "Algorithm Complexity (Big O)", subject: "Algorithms", pct: 0 },
  { concept: "SQL Joins & Subqueries", subject: "Databases", pct: 0 },
  { concept: "OSI Model Layers", subject: "Networks", pct: 0 },
  { concept: "OOP Inheritance & Polymorphism", subject: "Programming", pct: 0 },
];

function buildEngagementData(studyDays: string[]): { day: string; score: number }[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const iso = d.toISOString().split("T")[0];
    const dayName = days[d.getDay()];
    return { day: dayName, score: studyDays.includes(iso) ? Math.floor(Math.random() * 30) + 65 : 0 };
  });
}

function buildChapterScores(scores: Record<string, number>): { chapter: string; score: number; color: string }[] {
  const entries = Object.entries(scores).slice(0, 7);
  if (!entries.length) return [];
  return entries.map(([id, score], i) => ({
    chapter: `T${i + 1}`,
    score,
    color: score >= 80 ? "#10b981" : score >= 60 ? "#06b6d4" : score >= 50 ? "#f59e0b" : "#ef4444",
  }));
}

function buildRadar(scores: Record<string, number>, completed: string[]): typeof CS_RADAR {
  const prog = (keys: string[]) => {
    const vals = keys.map((k) => scores[k] ?? 0).filter((v) => v > 0);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  };
  return [
    { subject: "Programming", score: prog(["python-intro", "programming-vb", "oop", "python-alevel", "prog-fund"]) },
    { subject: "Databases", score: prog(["database-sql", "database-ms-access", "dba"]) },
    { subject: "Networks", score: prog(["networks-intro", "networks-comm", "networks-alevel", "network-admin"]) },
    { subject: "Security", score: prog(["computer-security", "security", "cybersec", "health-safety"]) },
    { subject: "Web Dev", score: prog(["web-design", "web-tech", "fullstack-web", "web-basics"]) },
    { subject: "Algorithms", score: prog(["algorithms", "algorithms-alevel", "data-structures"]) },
  ];
}

function buildWeak(scores: Record<string, number>): { concept: string; subject: string; pct: number }[] {
  const low = Object.entries(scores)
    .filter(([, v]) => v > 0 && v < 75)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 4);

  const nameMap: Record<string, { concept: string; subject: string }> = {
    "algorithms": { concept: "Algorithm Design & Flowcharts", subject: "Algorithms" },
    "algorithms-alevel": { concept: "Algorithm Complexity (Big O)", subject: "Algorithms" },
    "data-structures": { concept: "Data Structures — Linked Lists & Trees", subject: "Programming" },
    "database-sql": { concept: "SQL Joins & Subqueries", subject: "Databases" },
    "database-ms-access": { concept: "Database Normalisation", subject: "Databases" },
    "networks-intro": { concept: "OSI Model & Network Layers", subject: "Networks" },
    "computer-security": { concept: "Encryption & Security Protocols", subject: "Security" },
    "boolean-algebra": { concept: "Boolean Algebra & Logic Gates", subject: "Computer Hardware" },
    "os-basics": { concept: "Process Scheduling & Memory Mgmt", subject: "Operating Systems" },
    "oop": { concept: "OOP — Inheritance & Polymorphism", subject: "Programming" },
  };

  if (!low.length) return WEAK_CS;

  return low.map(([id, pct]) => ({
    concept: nameMap[id]?.concept ?? id.replace(/-/g, " "),
    subject: nameMap[id]?.subject ?? "Computer Science",
    pct,
  }));
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-sm">
      <p className="text-slate-400">{label}</p>
      <p className="font-bold text-white">{payload[0].value}%</p>
    </div>
  );
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [progress, setProgressState] = useState(getProgress());

  useEffect(() => {
    setProgressState(getProgress());
    setMounted(true);
  }, []);

  const streak = mounted ? getStreak() : 0;
  const avg = mounted ? getAvgScore() : 0;
  const hours = mounted ? getTotalHours() : 0;
  const topicsDone = mounted ? progress.completedTopics.length : 0;

  const engagementData = mounted ? buildEngagementData(progress.studyDays) : Array.from({ length: 7 }, (_, i) => ({ day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i], score: 0 }));
  const chapterScores = mounted ? buildChapterScores(progress.scores) : [];
  const radarData = mounted ? buildRadar(progress.scores, progress.completedTopics) : CS_RADAR;
  const weakConcepts = mounted ? buildWeak(progress.scores) : WEAK_CS;

  const hasActivity = mounted && (topicsDone > 0 || hours > 0);

  const STATS = [
    { label: "Study Streak", value: streak > 0 ? `${streak} day${streak !== 1 ? "s" : ""}` : "—", icon: Zap, color: "#f59e0b", delta: streak > 0 ? "Active" : "Start studying" },
    { label: "Avg Mastery", value: avg > 0 ? `${avg}%` : "—", icon: Target, color: "#10b981", delta: avg > 0 ? (avg >= 70 ? "On track" : "Needs work") : "No data yet" },
    { label: "Topics Done", value: topicsDone > 0 ? String(topicsDone) : "—", icon: BookOpen, color: "#7c3aed", delta: topicsDone > 0 ? `${topicsDone} completed` : "None yet" },
    { label: "Total Hours", value: hours > 0 ? `${hours}h` : "—", icon: Clock, color: "#2563eb", delta: hours > 0 ? `${progress.totalMinutes % 60}m extra` : "No sessions yet" },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Your Progress</h1>
        <p className="text-slate-400 text-sm mt-1">AI-powered insights into your CS learning journey</p>
      </div>

      {!hasActivity && mounted && (
        <div className="glass rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ border: "1px solid rgba(124,58,237,0.25)" }}>
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl gradient-bg flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">No activity yet</h3>
            <p className="text-slate-400 text-sm">Complete your first CS topic to start seeing progress charts and insights here.</p>
          </div>
          <button onClick={() => router.push("/dashboard")} className="btn-primary text-sm whitespace-nowrap self-start sm:self-auto">
            Start Learning
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, color, delta }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <span className="text-xs font-medium" style={{ color: value === "—" ? "#475569" : "#10b981" }}>{delta}</span>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Engagement trend */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-white">Study Activity</h2>
              <p className="text-slate-400 text-sm">Days you studied this week</p>
            </div>
            {hasActivity && (
              <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                <TrendingUp className="w-4 h-4" /> {streak} day streak
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={engagementData}>
              <defs>
                <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={2}
                fill="url(#engGrad)" dot={{ fill: "#7c3aed", r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold text-white mb-1">CS Subject Mastery</h2>
          <p className="text-slate-400 text-sm mb-4">Mastery per CS domain</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Mastery" dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chapter scores */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold text-white mb-1">Assessment Scores</h2>
          <p className="text-slate-400 text-sm mb-4">Your CS topic assessment results</p>
          {chapterScores.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chapterScores} barSize={24}>
                <XAxis dataKey="chapter" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {chapterScores.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.8} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-slate-500 text-sm">
              Complete assessments to see your scores here
            </div>
          )}
        </div>

        {/* Weak concepts */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="font-bold text-white">Concepts to Revise</h2>
          </div>
          <div className="space-y-4">
            {weakConcepts.map(({ concept, subject, pct }) => (
              <div key={concept}>
                <div className="flex justify-between text-sm mb-1.5">
                  <div>
                    <span className="text-white font-medium">{concept}</span>
                    <span className="text-slate-500 text-xs ml-2">{subject}</span>
                  </div>
                  <span className="font-medium" style={{ color: pct === 0 ? "#475569" : pct < 50 ? "#ef4444" : "#f59e0b" }}>
                    {pct > 0 ? `${pct}%` : "—"}
                  </span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill"
                    style={{ width: `${pct}%`, background: pct < 50 ? "#ef4444" : "#f59e0b" }} />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push("/tutor")}
            className="btn-primary w-full mt-5 text-sm flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" /> Review with AI Tutor
          </button>
        </div>
      </div>
    </div>
  );
}
