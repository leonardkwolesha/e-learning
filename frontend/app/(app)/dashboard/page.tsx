"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen, Play, Clock, TrendingUp, Zap, ChevronRight,
  Star, GraduationCap, Settings, Code2, Brain, Cpu,
  Globe, Database, Network, Monitor, Shield, Terminal,
  BarChart2, Cloud, Smartphone, Server, type LucideIcon,
} from "lucide-react";
import SubjectCard, { ICON_MAP } from "@/components/curriculum/SubjectCard";
import { getProgress, getStreak, getAvgScore, getTotalHours } from "@/lib/progress";

interface EduProfile {
  educationType?: string;
  level?: string;
  form?: string;
  name?: string;
  learningStyle?: string;
  focusArea?: string;
  specialisation?: string;
  specialisationLabel?: string;
  programLabel?: string;
  universityLabel?: string;
  year?: string;
  subjects?: { id: string; title: string }[];
}

interface Subject { id: string; name: string; iconName: string; color: string; progress: number; chapters: number; completedChapters: number; }
interface ContinueItem { id: string; title: string; subject: string; duration: number; progress: number; iconName: string; }
interface RecommendItem { id: string; title: string; subject: string; reason: string; difficulty: string; iconName: string; }
interface DashboardData { greeting: string; levelBadge: string; heroSub: string; subjects: Subject[]; continueLearning: ContinueItem[]; recommendations: RecommendItem[]; }

const OLEVEL_TOPICS: Record<string, Subject[]> = {
  form1: [
    { id: "intro-computers", name: "Intro to Computer Systems", iconName: "Monitor", color: "#7c3aed", progress: 0, chapters: 7, completedChapters: 0 },
    { id: "hardware", name: "Computer Hardware", iconName: "Cpu", color: "#2563eb", progress: 0, chapters: 7, completedChapters: 0 },
    { id: "os-basics", name: "Operating Systems Basics", iconName: "Monitor", color: "#10b981", progress: 0, chapters: 5, completedChapters: 0 },
    { id: "keyboarding", name: "Keyboarding & Typing", iconName: "Terminal", color: "#f59e0b", progress: 0, chapters: 8, completedChapters: 0 },
    { id: "data-info", name: "Data & Information", iconName: "Database", color: "#06b6d4", progress: 0, chapters: 5, completedChapters: 0 },
    { id: "storage", name: "Storage Devices & Memory", iconName: "Database", color: "#ec4899", progress: 0, chapters: 6, completedChapters: 0 },
    { id: "health-safety", name: "Health & Safety in Computing", iconName: "Shield", color: "#ef4444", progress: 0, chapters: 5, completedChapters: 0 },
  ],
  form2: [
    { id: "word-processing", name: "Word Processing (MS Word)", iconName: "BookOpen", color: "#7c3aed", progress: 0, chapters: 8, completedChapters: 0 },
    { id: "spreadsheets", name: "Spreadsheet Applications", iconName: "BarChart2", color: "#2563eb", progress: 0, chapters: 8, completedChapters: 0 },
    { id: "internet-email", name: "Internet & Email", iconName: "Globe", color: "#10b981", progress: 0, chapters: 7, completedChapters: 0 },
    { id: "computer-security", name: "Computer Security", iconName: "Shield", color: "#ef4444", progress: 0, chapters: 7, completedChapters: 0 },
    { id: "networks-intro", name: "Computer Networks Intro", iconName: "Network", color: "#06b6d4", progress: 0, chapters: 7, completedChapters: 0 },
    { id: "multimedia", name: "Multimedia Concepts", iconName: "Monitor", color: "#ec4899", progress: 0, chapters: 6, completedChapters: 0 },
    { id: "digital-citizen", name: "Digital Citizenship & Ethics", iconName: "Shield", color: "#f59e0b", progress: 0, chapters: 5, completedChapters: 0 },
  ],
  form3: [
    { id: "database-ms-access", name: "Database Management (Access)", iconName: "Database", color: "#7c3aed", progress: 0, chapters: 9, completedChapters: 0 },
    { id: "presentation", name: "Presentation Software", iconName: "Monitor", color: "#2563eb", progress: 0, chapters: 6, completedChapters: 0 },
    { id: "programming-vb", name: "Programming with Visual Basic", iconName: "Code2", color: "#10b981", progress: 0, chapters: 10, completedChapters: 0 },
    { id: "algorithms", name: "Algorithms & Flowcharts", iconName: "Zap", color: "#f59e0b", progress: 0, chapters: 8, completedChapters: 0 },
    { id: "networks-comm", name: "Networks & Communication", iconName: "Network", color: "#06b6d4", progress: 0, chapters: 8, completedChapters: 0 },
    { id: "ecommerce", name: "E-Commerce & Online Transactions", iconName: "Globe", color: "#ec4899", progress: 0, chapters: 6, completedChapters: 0 },
    { id: "maintenance", name: "Computer Maintenance", iconName: "Cpu", color: "#ef4444", progress: 0, chapters: 5, completedChapters: 0 },
  ],
  form4: [
    { id: "python-intro", name: "Advanced Programming (Python)", iconName: "Code2", color: "#7c3aed", progress: 0, chapters: 12, completedChapters: 0 },
    { id: "web-design", name: "Web Design (HTML & CSS)", iconName: "Globe", color: "#2563eb", progress: 0, chapters: 10, completedChapters: 0 },
    { id: "systems-analysis", name: "Systems Analysis & Design", iconName: "BookOpen", color: "#10b981", progress: 0, chapters: 9, completedChapters: 0 },
    { id: "computer-ethics", name: "Computer Ethics & Cyber Law", iconName: "Shield", color: "#ef4444", progress: 0, chapters: 7, completedChapters: 0 },
    { id: "ai-overview", name: "AI Overview", iconName: "Brain", color: "#ec4899", progress: 0, chapters: 6, completedChapters: 0 },
    { id: "ict-society", name: "ICT in Society & Development", iconName: "Globe", color: "#06b6d4", progress: 0, chapters: 5, completedChapters: 0 },
    { id: "csee-prep", name: "CSEE Exam Preparation", iconName: "BookOpen", color: "#f59e0b", progress: 0, chapters: 11, completedChapters: 0 },
  ],
};

const ALEVEL_SUBJECTS: Record<string, Subject[]> = {
  form5: [
    { id: "cs-arch", name: "Computer Architecture", iconName: "Cpu", color: "#7c3aed", progress: 0, chapters: 10, completedChapters: 0 },
    { id: "number-systems", name: "Number Systems & Data", iconName: "Terminal", color: "#2563eb", progress: 0, chapters: 8, completedChapters: 0 },
    { id: "python-alevel", name: "Programming with Python", iconName: "Code2", color: "#10b981", progress: 0, chapters: 14, completedChapters: 0 },
    { id: "data-structures", name: "Data Structures I", iconName: "Database", color: "#f59e0b", progress: 0, chapters: 12, completedChapters: 0 },
    { id: "algorithms-alevel", name: "Algorithm Design & Analysis", iconName: "Zap", color: "#06b6d4", progress: 0, chapters: 10, completedChapters: 0 },
    { id: "database-sql", name: "Database Design & SQL", iconName: "Database", color: "#ec4899", progress: 0, chapters: 10, completedChapters: 0 },
    { id: "boolean-algebra", name: "Boolean Algebra & Logic", iconName: "Cpu", color: "#ef4444", progress: 0, chapters: 8, completedChapters: 0 },
    { id: "os-concepts", name: "Operating System Concepts", iconName: "Monitor", color: "#818cf8", progress: 0, chapters: 6, completedChapters: 0 },
  ],
  form6: [
    { id: "oop", name: "Object-Oriented Programming", iconName: "Code2", color: "#7c3aed", progress: 0, chapters: 12, completedChapters: 0 },
    { id: "networks-alevel", name: "Computer Networks & Protocols", iconName: "Network", color: "#2563eb", progress: 0, chapters: 12, completedChapters: 0 },
    { id: "software-eng", name: "Software Engineering", iconName: "Zap", color: "#10b981", progress: 0, chapters: 10, completedChapters: 0 },
    { id: "web-tech", name: "Web Technologies", iconName: "Globe", color: "#06b6d4", progress: 0, chapters: 10, completedChapters: 0 },
    { id: "ai-ml", name: "AI & Machine Learning Basics", iconName: "Brain", color: "#ec4899", progress: 0, chapters: 10, completedChapters: 0 },
    { id: "security", name: "Information Security", iconName: "Shield", color: "#ef4444", progress: 0, chapters: 8, completedChapters: 0 },
    { id: "cs-project", name: "Computer Project / Practicum", iconName: "Code2", color: "#f59e0b", progress: 0, chapters: 10, completedChapters: 0 },
    { id: "acsee-prep", name: "ACSEE Exam Preparation", iconName: "BookOpen", color: "#818cf8", progress: 0, chapters: 4, completedChapters: 0 },
  ],
};

const COLLEGE_SUBJECTS: Record<string, Subject[]> = {
  certificate: [
    { id: "computing-fund", name: "Computing Fundamentals", iconName: "Monitor", color: "#10b981", progress: 0, chapters: 7, completedChapters: 0 },
    { id: "hardware-maint", name: "Hardware & Maintenance", iconName: "Cpu", color: "#2563eb", progress: 0, chapters: 9, completedChapters: 0 },
    { id: "office-apps", name: "Office Applications", iconName: "BookOpen", color: "#7c3aed", progress: 0, chapters: 8, completedChapters: 0 },
    { id: "python-cert", name: "Programming Basics (Python)", iconName: "Code2", color: "#06b6d4", progress: 0, chapters: 10, completedChapters: 0 },
    { id: "web-basics", name: "Web Design Basics", iconName: "Globe", color: "#ec4899", progress: 0, chapters: 8, completedChapters: 0 },
    { id: "networking-cert", name: "Basic Networking", iconName: "Network", color: "#f59e0b", progress: 0, chapters: 7, completedChapters: 0 },
    { id: "security-cert", name: "Computer Security & Ethics", iconName: "Shield", color: "#ef4444", progress: 0, chapters: 6, completedChapters: 0 },
  ],
  ordinary_diploma: [
    { id: "oop-dip", name: "OOP Programming (Java)", iconName: "Terminal", color: "#f59e0b", progress: 0, chapters: 14, completedChapters: 0 },
    { id: "dba", name: "Database Administration", iconName: "Database", color: "#10b981", progress: 0, chapters: 12, completedChapters: 0 },
    { id: "network-admin", name: "Network Administration", iconName: "Network", color: "#2563eb", progress: 0, chapters: 12, completedChapters: 0 },
    { id: "fullstack-web", name: "Full-Stack Web Development", iconName: "Globe", color: "#7c3aed", progress: 0, chapters: 14, completedChapters: 0 },
    { id: "systems-analysis-dip", name: "Systems Analysis & Design", iconName: "BookOpen", color: "#06b6d4", progress: 0, chapters: 10, completedChapters: 0 },
    { id: "agile-git", name: "Software Engineering & Agile", iconName: "Zap", color: "#ec4899", progress: 0, chapters: 10, completedChapters: 0 },
    { id: "mobile-dev", name: "Mobile App Development", iconName: "Smartphone", color: "#f59e0b", progress: 0, chapters: 10, completedChapters: 0 },
    { id: "cybersec", name: "Cybersecurity Foundations", iconName: "Shield", color: "#ef4444", progress: 0, chapters: 10, completedChapters: 0 },
  ],
  higher_diploma: [
    { id: "advanced-se", name: "Advanced Software Engineering", iconName: "Code2", color: "#7c3aed", progress: 0, chapters: 16, completedChapters: 0 },
    { id: "cloud-comp", name: "Cloud Computing (AWS/Azure)", iconName: "Cloud", color: "#06b6d4", progress: 0, chapters: 16, completedChapters: 0 },
    { id: "data-science", name: "Data Science & Analytics", iconName: "BarChart2", color: "#10b981", progress: 0, chapters: 14, completedChapters: 0 },
    { id: "ml-fund", name: "Machine Learning Fundamentals", iconName: "Brain", color: "#ec4899", progress: 0, chapters: 14, completedChapters: 0 },
    { id: "network-sec", name: "Network Security & Pen Testing", iconName: "Shield", color: "#ef4444", progress: 0, chapters: 14, completedChapters: 0 },
    { id: "it-pm", name: "IT Project Management", iconName: "BookOpen", color: "#f59e0b", progress: 0, chapters: 12, completedChapters: 0 },
    { id: "enterprise-sys", name: "Enterprise Systems & ERP", iconName: "Server", color: "#2563eb", progress: 0, chapters: 12, completedChapters: 0 },
    { id: "research-it", name: "Research Methods in IT", iconName: "Brain", color: "#818cf8", progress: 0, chapters: 10, completedChapters: 0 },
  ],
};

function withProgress(subjects: Subject[], scores: Record<string, number>, completed: string[]): Subject[] {
  return subjects.map((s) => ({
    ...s,
    progress: completed.includes(s.id) ? 100 : (scores[s.id] ?? 0),
    completedChapters: completed.includes(s.id) ? s.chapters : Math.floor((scores[s.id] ?? 0) / 100 * s.chapters),
  }));
}

function buildRecommendations(subjects: Subject[], completedTopics: string[], scores: Record<string, number>): RecommendItem[] {
  const notStarted = subjects.filter((s) => !completedTopics.includes(s.id) && !scores[s.id]);
  const inProgress = subjects.filter((s) => !completedTopics.includes(s.id) && (scores[s.id] ?? 0) > 0);
  const needsRevision = subjects
    .filter((s) => (scores[s.id] ?? 0) > 0 && (scores[s.id] ?? 0) < 70)
    .sort((a, b) => (scores[a.id] ?? 0) - (scores[b.id] ?? 0));

  const pool = [...inProgress.slice(0, 1), ...notStarted.slice(0, 2), ...needsRevision.slice(0, 1)].slice(0, 3);

  if (pool.length >= 1) {
    return pool.map((s, i) => ({
      id: s.id,
      title: inProgress.includes(s) ? `Continue: ${s.name}` : needsRevision.includes(s) ? `Revise: ${s.name}` : s.name,
      subject: s.iconName === "Globe" ? "Web Dev" : s.iconName === "Code2" || s.iconName === "Terminal" ? "Programming" : s.iconName === "Database" ? "Databases" : s.iconName === "Network" || s.iconName === "Wifi" ? "Networking" : s.iconName === "Shield" || s.iconName === "Lock" ? "Security" : "Computer Science",
      reason: inProgress.includes(s) ? `${scores[s.id]}% — keep going!` : needsRevision.includes(s) ? `Score ${scores[s.id]}% — room to improve` : i === 0 ? "Next in your curriculum" : "Recommended for your level",
      difficulty: completedTopics.includes(s.id) ? "Completed" : (scores[s.id] ?? 0) > 0 ? "In Progress" : "Not Started",
      iconName: s.iconName,
    }));
  }

  return [];
}

function buildDashboardData(profile: EduProfile, progress: ReturnType<typeof getProgress>): DashboardData {
  const { educationType, level, form, name, programLabel, universityLabel, year } = profile;
  const formKey = form ?? "form1";
  const { completedTopics, scores } = progress;

  if (educationType === "secondary" && level === "o-level") {
    const formLabel = form ? `Form ${form.replace("form", "")}` : "O Level";
    const subjects = withProgress(OLEVEL_TOPICS[formKey] ?? OLEVEL_TOPICS.form1, scores, completedTopics);
    const recs = buildRecommendations(subjects, completedTopics, scores);
    return {
      greeting: `Welcome back${name ? `, ${name}` : ""}!`,
      levelBadge: `O Level · ${formLabel} · Computer Studies`,
      heroSub: "Your personalised NECTA Computer Studies curriculum is ready.",
      subjects: subjects.slice(0, 7),
      continueLearning: subjects.slice(0, 3).map((s) => ({
        id: s.id, title: s.name, subject: "Computer Studies", duration: 30, progress: s.progress, iconName: s.iconName,
      })),
      recommendations: recs.length >= 1 ? recs : [
        { id: "python-intro", title: "Build Your First Python Program", subject: "Programming", reason: "Core CSEE practical skill", difficulty: "Beginner", iconName: "Code2" },
        { id: "web-design", title: "Build Your First Web Page (HTML)", subject: "Web Design", reason: "CSEE practical component", difficulty: "Beginner", iconName: "Globe" },
        { id: "networks-intro", title: "Computer Networks Fundamentals", subject: "Networks", reason: "Key CSEE examination topic", difficulty: "Beginner", iconName: "Network" },
      ],
    };
  }

  if (educationType === "secondary" && level === "a-level") {
    const formLabel = form === "form5" ? "Form 5" : "Form 6";
    const subjects = withProgress(ALEVEL_SUBJECTS[formKey] ?? ALEVEL_SUBJECTS.form5, scores, completedTopics);
    const recs = buildRecommendations(subjects, completedTopics, scores);
    return {
      greeting: `Welcome back${name ? `, ${name}` : ""}!`,
      levelBadge: `A Level · ${formLabel} · Computer Science`,
      heroSub: "Your ACSEE Computer Science curriculum is personalised for your form and specialisation.",
      subjects: subjects.slice(0, 8),
      continueLearning: subjects.slice(0, 3).map((s) => ({
        id: s.id, title: s.name, subject: "Computer Science", duration: 45, progress: s.progress, iconName: s.iconName,
      })),
      recommendations: recs.length >= 1 ? recs : [
        { id: "python-alevel", title: "Python Programming Projects", subject: "Programming", reason: "Directly assessed in ACSEE practicals", difficulty: "Intermediate", iconName: "Code2" },
        { id: "data-structures", title: "Data Structures — Linked Lists & Trees", subject: "CS Theory", reason: "High-frequency ACSEE topic", difficulty: "Advanced", iconName: "Database" },
        { id: "algorithms-alevel", title: "Algorithm Design & Big O Analysis", subject: "Algorithms", reason: "Core A Level CS theory", difficulty: "Advanced", iconName: "Zap" },
      ],
    };
  }

  if (educationType === "college") {
    const subjects = withProgress(COLLEGE_SUBJECTS[level ?? "certificate"] ?? COLLEGE_SUBJECTS.certificate, scores, completedTopics);
    const recs = buildRecommendations(subjects, completedTopics, scores);
    return {
      greeting: `Welcome back${name ? `, ${name}` : ""}!`,
      levelBadge: `NACTE College · ${programLabel ?? "IT Program"}`,
      heroSub: "Your NACTE-aligned IT curriculum is ready.",
      subjects: subjects.slice(0, 8),
      continueLearning: subjects.slice(0, 3).map((s) => ({
        id: s.id, title: s.name, subject: "IT Program", duration: 40, progress: s.progress, iconName: s.iconName,
      })),
      recommendations: recs.length >= 1 ? recs : [
        { id: "fullstack-web", title: "Build a Full-Stack Web Application", subject: "Web Development", reason: "Industry-ready project skill", difficulty: "Practical", iconName: "Globe" },
        { id: "cybersec", title: "Cybersecurity Foundations", subject: "Security", reason: "Growing demand in Tanzania", difficulty: "Intermediate", iconName: "Shield" },
        { id: "dba", title: "Database Administration Essentials", subject: "Databases", reason: "Core NACTE IT curriculum topic", difficulty: "Intermediate", iconName: "Database" },
      ],
    };
  }

  if (educationType === "university") {
    const currentYear = year ?? "Year 1";
    const fallbackSubjects: Subject[] = [
      { id: "prog-fund", name: "Programming Fundamentals", iconName: "Code2", color: "#7c3aed", progress: 0, chapters: 14, completedChapters: 0 },
      { id: "discrete-math", name: "Discrete Mathematics", iconName: "Zap", color: "#2563eb", progress: 0, chapters: 12, completedChapters: 0 },
      { id: "comp-arch", name: "Computer Architecture", iconName: "Cpu", color: "#10b981", progress: 0, chapters: 12, completedChapters: 0 },
      { id: "algo-intro", name: "Introduction to Algorithms", iconName: "Zap", color: "#06b6d4", progress: 0, chapters: 12, completedChapters: 0 },
      { id: "web-tech-1", name: "Web Technologies I", iconName: "Globe", color: "#ec4899", progress: 0, chapters: 10, completedChapters: 0 },
      { id: "comm-skills", name: "Communication Skills", iconName: "BookOpen", color: "#f59e0b", progress: 0, chapters: 8, completedChapters: 0 },
    ];
    const rawSubjects: Subject[] = profile.subjects?.length
      ? profile.subjects.map((m, i) => ({
          id: m.id, name: m.title, iconName: ["Code2", "Zap", "Cpu", "Globe", "Shield", "Brain"][i % 6],
          color: ["#7c3aed", "#2563eb", "#10b981", "#06b6d4", "#ef4444", "#ec4899"][i % 6],
          progress: 0, chapters: 12, completedChapters: 0,
        }))
      : fallbackSubjects;
    const subjects = withProgress(rawSubjects, scores, completedTopics);
    const recs = buildRecommendations(subjects, completedTopics, scores);
    return {
      greeting: `Welcome back${name ? `, ${name}` : ""}!`,
      levelBadge: `${universityLabel ?? "University"} · CS · ${currentYear}`,
      heroSub: `Your AI-powered CS curriculum for ${currentYear} is personalised for your program.`,
      subjects: subjects.slice(0, 6),
      continueLearning: subjects.slice(0, 3).map((s) => ({
        id: s.id, title: s.name, subject: "Computer Science", duration: 50, progress: s.progress, iconName: s.iconName,
      })),
      recommendations: recs.length >= 1 ? recs : [
        { id: "algo-intro", title: "Algorithms — Big O & Complexity", subject: "CS Theory", reason: "Foundation for all CS units", difficulty: "Year 1 Core", iconName: "Zap" },
        { id: "prog-fund", title: "Programming Fundamentals", subject: "Programming", reason: "Start your CS journey here", difficulty: "Beginner", iconName: "Code2" },
        { id: "web-tech-1", title: "Web Technologies I", subject: "Web Dev", reason: "Most in-demand industry skill", difficulty: "Intermediate", iconName: "Globe" },
      ],
    };
  }

  return {
    greeting: "Welcome to EduAI OS!",
    levelBadge: "Computer Science Curriculum",
    heroSub: "Select your education level to get your personalised CS curriculum.",
    subjects: [
      { id: "python-intro", name: "Python Programming", iconName: "Code2", color: "#7c3aed", progress: 0, chapters: 14, completedChapters: 0 },
      { id: "web-design", name: "Web Development", iconName: "Globe", color: "#2563eb", progress: 0, chapters: 12, completedChapters: 0 },
      { id: "database-sql", name: "Database Systems", iconName: "Database", color: "#10b981", progress: 0, chapters: 10, completedChapters: 0 },
      { id: "networks-intro", name: "Computer Networks", iconName: "Network", color: "#06b6d4", progress: 0, chapters: 12, completedChapters: 0 },
    ],
    continueLearning: [
      { id: "python-intro", title: "Python — Variables & Control Flow", subject: "Programming", duration: 35, progress: 0, iconName: "Code2" },
      { id: "web-design", title: "HTML5 & Responsive Design", subject: "Web Development", duration: 40, progress: 0, iconName: "Globe" },
      { id: "database-sql", title: "SQL Joins & Subqueries", subject: "Databases", duration: 45, progress: 0, iconName: "Database" },
    ],
    recommendations: [
      { id: "select-education", title: "Set Up Your Education Path", subject: "Onboarding", reason: "Get a personalised CS curriculum", difficulty: "Start Here", iconName: "Zap" },
      { id: "python-intro", title: "Python Basics in 30 Minutes", subject: "Programming", reason: "Perfect first topic in any CS level", difficulty: "Beginner", iconName: "Code2" },
      { id: "networks-intro", title: "How the Internet Really Works", subject: "Networks", reason: "Foundational CS knowledge", difficulty: "All Levels", iconName: "Network" },
    ],
  };
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<EduProfile>({});
  const [progress, setProgressState] = useState(getProgress());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("eduProfile");
      if (raw) setProfile(JSON.parse(raw));
    } catch {}
    setProgressState(getProgress());
    setMounted(true);
  }, []);

  const data = buildDashboardData(mounted ? profile : {}, mounted ? progress : { completedTopics: [], studyDays: [], totalMinutes: 0, scores: {}, notes: {} });

  const streak = mounted ? getStreak() : 0;
  const avgScore = mounted ? getAvgScore() : 0;
  const hours = mounted ? getTotalHours() : 0;
  const topicsDone = mounted ? progress.completedTopics.length : 0;

  const STATS = [
    { label: "Study Streak", value: streak > 0 ? `${streak} day${streak !== 1 ? "s" : ""}` : "—", icon: Zap, color: "#f59e0b" },
    { label: "Topics Done", value: topicsDone > 0 ? String(topicsDone) : "—", icon: BookOpen, color: "#10b981" },
    { label: "Hours Learned", value: hours > 0 ? `${hours}h` : "—", icon: Clock, color: "#2563eb" },
    { label: "Avg Score", value: avgScore > 0 ? `${avgScore}%` : "—", icon: TrendingUp, color: "#7c3aed" },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-screen-xl mx-auto space-y-6 sm:space-y-8">

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden p-5 sm:p-7"
        style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(37,99,235,0.12) 100%)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-8 blur-2xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #2563eb, transparent)" }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-purple-300 mb-3"
            style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}>
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="truncate max-w-[200px] sm:max-w-none">{data.levelBadge}</span>
          </div>
          <p className="text-slate-400 text-sm mb-1">{getGreeting()}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{data.greeting}</h1>
          <p className="text-slate-400 mb-5 max-w-lg text-sm leading-relaxed">
            {data.heroSub}
            {streak > 0 && ` You're on a ${streak}-day streak — keep it going!`}
          </p>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link href={`/learn/${data.continueLearning[0]?.id ?? "python-intro"}`}
              className="btn-primary inline-flex items-center gap-2 text-sm px-4 py-2.5 hover:scale-[1.03] transition-transform duration-200">
              <Play className="w-4 h-4" /> Continue Learning
            </Link>
            <Link href="/tutor" className="btn-ghost inline-flex items-center gap-2 text-sm px-4 py-2.5 hover:scale-[1.03] transition-transform duration-200">
              <Brain className="w-4 h-4" /> Ask AI Tutor
            </Link>
            <Link href="/settings" className="btn-ghost inline-flex items-center gap-2 text-sm px-4 py-2.5 hover:scale-[1.03] transition-transform duration-200 hidden sm:inline-flex">
              <Settings className="w-4 h-4" /> Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {STATS.map(({ label, value, icon: Icon, color }) => (
          <div key={label}
            className="card p-4 sm:p-5 hover:scale-[1.03] hover:border-white/20 transition-all duration-200 cursor-default group">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                style={{ background: `${color}18` }}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
              </div>
              <span className="text-slate-400 text-xs sm:text-sm leading-tight">{label}</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">{value}</div>
            {value === "—" && <div className="text-xs text-slate-600 mt-1">Start learning to track</div>}
          </div>
        ))}
      </div>

      {/* Continue Learning */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Play className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" /> Continue Learning
          </h2>
          <Link href="/curriculum/cs" className="text-purple-400 text-sm flex items-center gap-1 hover:text-purple-300 transition-colors">
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {data.continueLearning.map((item) => {
            const Icon: LucideIcon = ICON_MAP[item.iconName] ?? Code2;
            return (
              <Link key={item.id} href={`/learn/${item.id}`}
                className="card p-4 sm:p-5 group cursor-pointer hover:scale-[1.02] hover:border-purple-500/30 transition-all duration-200">
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                    style={{ background: "rgba(124,58,237,0.12)" }}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm leading-tight">{item.title}</h3>
                    <p className="text-slate-400 text-xs mt-1">{item.subject}</p>
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full gradient-bg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0">
                    <Play className="w-3 h-3 text-white ml-0.5" />
                  </div>
                </div>
                <div className="progress-track mb-1.5">
                  <div className="progress-fill transition-all duration-700" style={{ width: `${item.progress}%` }} />
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{item.progress > 0 ? `${item.progress}% complete` : "Not started"}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.duration}m</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CS Subjects */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" /> My CS Topics
          </h2>
          <Link href="/curriculum/cs" className="text-purple-400 text-sm flex items-center gap-1 hover:text-purple-300 transition-colors">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="scroll-row pb-2">
          {data.subjects.map((s) => <SubjectCard key={s.id} {...s} />)}
        </div>
      </section>

      {/* AI Recommendations */}
      <section className="pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 flex-wrap">
            <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" /> Recommended for You
            <span className="px-2 py-0.5 rounded-full text-xs font-medium text-purple-300"
              style={{ background: "rgba(124,58,237,0.2)" }}>AI</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {data.recommendations.map((item) => {
            const Icon: LucideIcon = ICON_MAP[item.iconName] ?? Code2;
            return (
              <Link key={item.id} href={item.id === "select-education" ? "/select-education" : `/learn/${item.id}`}
                className="card p-4 sm:p-5 group cursor-pointer hover:scale-[1.02] hover:border-purple-500/30 transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                    style={{ background: "rgba(124,58,237,0.12)" }}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full text-slate-400"
                    style={{ background: "rgba(255,255,255,0.06)" }}>{item.difficulty}</span>
                </div>
                <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-purple-200 transition-colors">{item.title}</h3>
                <p className="text-xs text-slate-400 mb-3">{item.subject}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Star className="w-3 h-3 text-amber-400" />
                    <span className="truncate">{item.reason}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
