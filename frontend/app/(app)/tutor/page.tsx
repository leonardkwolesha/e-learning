"use client";
import { useState, useEffect } from "react";
import {
  Brain, BookOpen, Settings, Code2, Network, Database, Globe,
  Shield, Cpu, Zap, Monitor, ChevronDown, ChevronUp, GraduationCap,
  Menu, X,
} from "lucide-react";
import ChatInterface from "@/components/tutor/ChatInterface";
import { cn } from "@/lib/utils";

interface EduProfile {
  educationType?: string;
  level?: string;
  form?: string;
  name?: string;
  year?: string;
  programLabel?: string;
  universityLabel?: string;
  specialisation?: string;
  focusArea?: string;
}

interface Topic {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  color: string;
  difficulty: string;
}

/* ── All CS topics by education level ── */
const ALL_TOPICS: Record<string, Topic[]> = {
  "o-level-form1": [
    { id: "intro-cs",    title: "Introduction to Computer Systems",  category: "O Level · Form 1", icon: Monitor,  color: "#7c3aed", difficulty: "Beginner" },
    { id: "hardware-f1", title: "Computer Hardware Components",      category: "O Level · Form 1", icon: Cpu,      color: "#2563eb", difficulty: "Beginner" },
    { id: "os-f1",       title: "Operating Systems Basics",          category: "O Level · Form 1", icon: Monitor,  color: "#10b981", difficulty: "Beginner" },
    { id: "keyboard-f1", title: "Keyboarding & Typing Skills",       category: "O Level · Form 1", icon: Code2,    color: "#f59e0b", difficulty: "Beginner" },
    { id: "data-info-f1",title: "Data and Information",              category: "O Level · Form 1", icon: Database, color: "#06b6d4", difficulty: "Beginner" },
    { id: "storage-f1",  title: "Storage Devices & Memory",          category: "O Level · Form 1", icon: Database, color: "#ec4899", difficulty: "Beginner" },
    { id: "safety-f1",   title: "Health & Safety in Computing",      category: "O Level · Form 1", icon: Shield,   color: "#ef4444", difficulty: "Beginner" },
  ],
  "o-level-form2": [
    { id: "word-f2",      title: "Word Processing (MS Word)",         category: "O Level · Form 2", icon: BookOpen, color: "#7c3aed", difficulty: "Beginner" },
    { id: "excel-f2",     title: "Spreadsheet Applications (Excel)",  category: "O Level · Form 2", icon: Database, color: "#2563eb", difficulty: "Beginner" },
    { id: "internet-f2",  title: "Internet & Email Communication",    category: "O Level · Form 2", icon: Globe,    color: "#10b981", difficulty: "Beginner" },
    { id: "security-f2",  title: "Computer Security & Antivirus",     category: "O Level · Form 2", icon: Shield,   color: "#ef4444", difficulty: "Elementary" },
    { id: "networks-f2",  title: "Computer Networks Introduction",    category: "O Level · Form 2", icon: Network,  color: "#06b6d4", difficulty: "Elementary" },
    { id: "multimedia-f2",title: "Multimedia Concepts",               category: "O Level · Form 2", icon: Monitor,  color: "#ec4899", difficulty: "Beginner" },
    { id: "ethics-f2",    title: "Digital Citizenship & Ethics",      category: "O Level · Form 2", icon: Shield,   color: "#f59e0b", difficulty: "Beginner" },
  ],
  "o-level-form3": [
    { id: "database-f3", title: "Database Management (MS Access)",    category: "O Level · Form 3", icon: Database, color: "#7c3aed", difficulty: "Intermediate" },
    { id: "ppt-f3",      title: "Presentation Software (PowerPoint)", category: "O Level · Form 3", icon: Monitor,  color: "#2563eb", difficulty: "Beginner" },
    { id: "vb-f3",       title: "Programming with Visual Basic",      category: "O Level · Form 3", icon: Code2,    color: "#10b981", difficulty: "Intermediate" },
    { id: "algo-f3",     title: "Algorithms & Flowcharts",            category: "O Level · Form 3", icon: Zap,      color: "#f59e0b", difficulty: "Intermediate" },
    { id: "networks-f3", title: "Networks & Communication Systems",   category: "O Level · Form 3", icon: Network,  color: "#06b6d4", difficulty: "Intermediate" },
    { id: "ecommerce-f3",title: "E-Commerce & Online Transactions",   category: "O Level · Form 3", icon: Globe,    color: "#ec4899", difficulty: "Elementary" },
    { id: "maint-f3",    title: "Computer Maintenance",               category: "O Level · Form 3", icon: Cpu,      color: "#ef4444", difficulty: "Elementary" },
  ],
  "o-level-form4": [
    { id: "python-f4",  title: "Advanced Programming with Python",  category: "O Level · Form 4", icon: Code2,    color: "#7c3aed", difficulty: "Intermediate" },
    { id: "html-f4",    title: "Web Design (HTML & CSS)",           category: "O Level · Form 4", icon: Globe,    color: "#2563eb", difficulty: "Intermediate" },
    { id: "systems-f4", title: "Systems Analysis & Design",         category: "O Level · Form 4", icon: Database, color: "#10b981", difficulty: "Intermediate" },
    { id: "law-f4",     title: "Computer Ethics & Cyber Law",       category: "O Level · Form 4", icon: Shield,   color: "#ef4444", difficulty: "Intermediate" },
    { id: "ai-f4",      title: "Artificial Intelligence Overview",  category: "O Level · Form 4", icon: Brain,    color: "#ec4899", difficulty: "Intermediate" },
    { id: "ict-f4",     title: "ICT in Society & Development",      category: "O Level · Form 4", icon: Globe,    color: "#06b6d4", difficulty: "Elementary" },
    { id: "csee-f4",    title: "CSEE Exam Preparation",             category: "O Level · Form 4", icon: BookOpen, color: "#f59e0b", difficulty: "Exam Prep" },
  ],
  "a-level-form5": [
    { id: "arch-f5",   title: "Computer Architecture & Organization", category: "A Level · Form 5", icon: Cpu,      color: "#7c3aed", difficulty: "Advanced" },
    { id: "binary-f5", title: "Number Systems & Data Representation", category: "A Level · Form 5", icon: Code2,    color: "#2563eb", difficulty: "Intermediate" },
    { id: "python-f5", title: "Programming with Python",              category: "A Level · Form 5", icon: Code2,    color: "#10b981", difficulty: "Intermediate" },
    { id: "ds-f5",     title: "Data Structures I",                    category: "A Level · Form 5", icon: Database, color: "#f59e0b", difficulty: "Advanced" },
    { id: "algo-f5",   title: "Algorithm Design & Analysis",          category: "A Level · Form 5", icon: Zap,      color: "#06b6d4", difficulty: "Advanced" },
    { id: "sql-f5",    title: "Database Design & SQL",                category: "A Level · Form 5", icon: Database, color: "#ec4899", difficulty: "Intermediate" },
    { id: "bool-f5",   title: "Boolean Algebra & Logic Circuits",     category: "A Level · Form 5", icon: Cpu,      color: "#ef4444", difficulty: "Advanced" },
    { id: "os-f5",     title: "Operating System Concepts",            category: "A Level · Form 5", icon: Monitor,  color: "#818cf8", difficulty: "Intermediate" },
  ],
  "a-level-form6": [
    { id: "oop-f6",  title: "Object-Oriented Programming",          category: "A Level · Form 6", icon: Code2,    color: "#7c3aed", difficulty: "Advanced" },
    { id: "nets-f6", title: "Computer Networks & Protocols",        category: "A Level · Form 6", icon: Network,  color: "#2563eb", difficulty: "Advanced" },
    { id: "swe-f6",  title: "Software Engineering Principles",      category: "A Level · Form 6", icon: Zap,      color: "#10b981", difficulty: "Advanced" },
    { id: "web-f6",  title: "Web Technologies",                     category: "A Level · Form 6", icon: Globe,    color: "#06b6d4", difficulty: "Intermediate" },
    { id: "ai-f6",   title: "AI & Machine Learning Basics",         category: "A Level · Form 6", icon: Brain,    color: "#ec4899", difficulty: "Advanced" },
    { id: "sec-f6",  title: "Information Security & Cryptography",  category: "A Level · Form 6", icon: Shield,   color: "#ef4444", difficulty: "Advanced" },
    { id: "proj-f6", title: "Computer Project / Practicum",         category: "A Level · Form 6", icon: Code2,    color: "#f59e0b", difficulty: "Project" },
    { id: "acsee-f6",title: "ACSEE Exam Preparation",              category: "A Level · Form 6", icon: BookOpen, color: "#818cf8", difficulty: "Exam Prep" },
  ],
  "college-certificate": [
    { id: "fund-cert",  title: "Computing Fundamentals",            category: "Certificate · NTA 4-5", icon: Monitor,  color: "#10b981", difficulty: "Foundation" },
    { id: "hw-cert",    title: "Hardware & Maintenance",            category: "Certificate · NTA 4-5", icon: Cpu,      color: "#2563eb", difficulty: "Foundation" },
    { id: "office-cert",title: "Office Applications (Word/Excel)", category: "Certificate · NTA 4-5", icon: BookOpen, color: "#7c3aed", difficulty: "Foundation" },
    { id: "py-cert",    title: "Programming Basics (Python)",       category: "Certificate · NTA 4-5", icon: Code2,    color: "#06b6d4", difficulty: "Beginner" },
    { id: "web-cert",   title: "Web Design Basics (HTML & CSS)",    category: "Certificate · NTA 4-5", icon: Globe,    color: "#ec4899", difficulty: "Beginner" },
    { id: "net-cert",   title: "Basic Networking",                  category: "Certificate · NTA 4-5", icon: Network,  color: "#f59e0b", difficulty: "Foundation" },
    { id: "sec-cert",   title: "Computer Security & Ethics",        category: "Certificate · NTA 4-5", icon: Shield,   color: "#ef4444", difficulty: "Foundation" },
  ],
  "college-ordinary_diploma": [
    { id: "java-dip",  title: "OOP Programming (Java & Python)",         category: "Ordinary Diploma · NTA 5-6", icon: Code2,    color: "#f59e0b", difficulty: "Intermediate" },
    { id: "dba-dip",   title: "Database Administration (MySQL)",         category: "Ordinary Diploma · NTA 5-6", icon: Database, color: "#10b981", difficulty: "Intermediate" },
    { id: "ccna-dip",  title: "Network Administration (CCNA Track)",     category: "Ordinary Diploma · NTA 5-6", icon: Network,  color: "#2563eb", difficulty: "Intermediate" },
    { id: "web-dip",   title: "Full-Stack Web Development",              category: "Ordinary Diploma · NTA 5-6", icon: Globe,    color: "#7c3aed", difficulty: "Intermediate" },
    { id: "sys-dip",   title: "Systems Analysis & Design",               category: "Ordinary Diploma · NTA 5-6", icon: Zap,      color: "#06b6d4", difficulty: "Intermediate" },
    { id: "agile-dip", title: "Software Engineering & Agile",            category: "Ordinary Diploma · NTA 5-6", icon: Brain,    color: "#ec4899", difficulty: "Intermediate" },
    { id: "mob-dip",   title: "Mobile App Development",                  category: "Ordinary Diploma · NTA 5-6", icon: Cpu,      color: "#f59e0b", difficulty: "Intermediate" },
    { id: "cyber-dip", title: "Cybersecurity Foundations",               category: "Ordinary Diploma · NTA 5-6", icon: Shield,   color: "#ef4444", difficulty: "Intermediate" },
  ],
  "college-higher_diploma": [
    { id: "adv-se-hdip",  title: "Advanced Software Engineering",        category: "Higher Diploma · NTA 6-7", icon: Code2,    color: "#7c3aed", difficulty: "Advanced" },
    { id: "cloud-hdip",   title: "Cloud Computing (AWS/Azure)",          category: "Higher Diploma · NTA 6-7", icon: Globe,    color: "#06b6d4", difficulty: "Advanced" },
    { id: "ds-hdip",      title: "Data Science & Analytics",             category: "Higher Diploma · NTA 6-7", icon: Database, color: "#10b981", difficulty: "Advanced" },
    { id: "ml-hdip",      title: "Machine Learning Fundamentals",        category: "Higher Diploma · NTA 6-7", icon: Brain,    color: "#ec4899", difficulty: "Advanced" },
    { id: "pentest-hdip", title: "Network Security & Pen Testing",       category: "Higher Diploma · NTA 6-7", icon: Shield,   color: "#ef4444", difficulty: "Advanced" },
    { id: "pm-hdip",      title: "IT Project Management",                category: "Higher Diploma · NTA 6-7", icon: Zap,      color: "#f59e0b", difficulty: "Advanced" },
    { id: "erp-hdip",     title: "Enterprise Systems & ERP",             category: "Higher Diploma · NTA 6-7", icon: Cpu,      color: "#2563eb", difficulty: "Advanced" },
    { id: "res-hdip",     title: "Research Methods in IT",               category: "Higher Diploma · NTA 6-7", icon: BookOpen, color: "#818cf8", difficulty: "Advanced" },
  ],
  "university-Year 1": [
    { id: "prog-y1",    title: "Programming Fundamentals (Python & C)", category: "University · Year 1", icon: Code2,    color: "#7c3aed", difficulty: "Undergraduate" },
    { id: "discrete-y1",title: "Discrete Mathematics for CS",          category: "University · Year 1", icon: Zap,      color: "#2563eb", difficulty: "Undergraduate" },
    { id: "arch-y1",    title: "Computer Organization & Architecture", category: "University · Year 1", icon: Cpu,      color: "#10b981", difficulty: "Undergraduate" },
    { id: "comm-y1",    title: "Communication Skills & Academic Writing",category: "University · Year 1",icon: BookOpen, color: "#f59e0b", difficulty: "Foundation" },
    { id: "algo-y1",    title: "Introduction to Algorithms",           category: "University · Year 1", icon: Zap,      color: "#06b6d4", difficulty: "Undergraduate" },
    { id: "web1-y1",    title: "Web Technologies I (HTML5 & CSS3)",    category: "University · Year 1", icon: Globe,    color: "#ec4899", difficulty: "Undergraduate" },
  ],
  "university-Year 2": [
    { id: "dsa-y2",  title: "Data Structures & Algorithms",              category: "University · Year 2", icon: Database, color: "#7c3aed", difficulty: "Intermediate" },
    { id: "java-y2", title: "OOP with Java & Design Patterns",           category: "University · Year 2", icon: Code2,    color: "#2563eb", difficulty: "Intermediate" },
    { id: "db-y2",   title: "Database Systems",                          category: "University · Year 2", icon: Database, color: "#10b981", difficulty: "Intermediate" },
    { id: "nets-y2", title: "Computer Networks",                         category: "University · Year 2", icon: Network,  color: "#06b6d4", difficulty: "Intermediate" },
    { id: "os-y2",   title: "Operating Systems",                         category: "University · Year 2", icon: Monitor,  color: "#ec4899", difficulty: "Intermediate" },
    { id: "js-y2",   title: "Web Technologies II (JavaScript & React)",  category: "University · Year 2", icon: Globe,    color: "#f59e0b", difficulty: "Intermediate" },
  ],
  "university-Year 3": [
    { id: "swe-y3",    title: "Software Engineering",                    category: "University · Year 3", icon: Zap,      color: "#7c3aed", difficulty: "Advanced" },
    { id: "ai-y3",     title: "Artificial Intelligence",                 category: "University · Year 3", icon: Brain,    color: "#ec4899", difficulty: "Advanced" },
    { id: "hci-y3",    title: "Human-Computer Interaction",              category: "University · Year 3", icon: Globe,    color: "#06b6d4", difficulty: "Intermediate" },
    { id: "mobile-y3", title: "Mobile App Development",                  category: "University · Year 3", icon: Cpu,      color: "#f59e0b", difficulty: "Advanced" },
    { id: "sec-y3",    title: "Computer Security",                       category: "University · Year 3", icon: Shield,   color: "#ef4444", difficulty: "Advanced" },
    { id: "stats-y3",  title: "Statistics & Probability for CS",         category: "University · Year 3", icon: Zap,      color: "#2563eb", difficulty: "Intermediate" },
  ],
  "university-Year 4": [
    { id: "ml-y4",      title: "Machine Learning & Deep Learning",                  category: "University · Year 4", icon: Brain,    color: "#ec4899", difficulty: "Expert" },
    { id: "cloud-y4",   title: "Cloud Computing & DevOps",                          category: "University · Year 4", icon: Globe,    color: "#06b6d4", difficulty: "Advanced" },
    { id: "dist-y4",    title: "Distributed Systems",                               category: "University · Year 4", icon: Network,  color: "#7c3aed", difficulty: "Expert" },
    { id: "fyp-y4",     title: "Final Year Project",                                category: "University · Year 4", icon: Code2,    color: "#f59e0b", difficulty: "Project" },
    { id: "ethics-y4",  title: "IT Ethics & Professional Practice",                 category: "University · Year 4", icon: Shield,   color: "#10b981", difficulty: "Essential" },
    { id: "elective-y4",title: "Advanced Elective (Big Data / IoT / Blockchain)",   category: "University · Year 4", icon: Zap,      color: "#2563eb", difficulty: "Expert" },
  ],
  "default": [
    { id: "python-def", title: "Python Programming Fundamentals", category: "Computer Science", icon: Code2,    color: "#7c3aed", difficulty: "Beginner" },
    { id: "web-def",    title: "HTML, CSS & Web Design",          category: "Computer Science", icon: Globe,    color: "#2563eb", difficulty: "Beginner" },
    { id: "db-def",     title: "Database Systems & SQL",          category: "Computer Science", icon: Database, color: "#10b981", difficulty: "Beginner" },
    { id: "nets-def",   title: "Computer Networks Basics",        category: "Computer Science", icon: Network,  color: "#06b6d4", difficulty: "Beginner" },
    { id: "algo-def",   title: "Algorithms & Problem Solving",    category: "Computer Science", icon: Zap,      color: "#f59e0b", difficulty: "Intermediate" },
    { id: "sec-def",    title: "Computer Security Essentials",    category: "Computer Science", icon: Shield,   color: "#ef4444", difficulty: "Intermediate" },
  ],
};

function getTopicsKey(profile: EduProfile): string {
  if (profile.educationType === "secondary" && profile.level === "o-level")
    return `o-level-${profile.form ?? "form1"}`;
  if (profile.educationType === "secondary" && profile.level === "a-level")
    return `a-level-${profile.form ?? "form5"}`;
  if (profile.educationType === "college")
    return `college-${profile.level ?? "certificate"}`;
  if (profile.educationType === "university")
    return `university-${profile.year ?? "Year 1"}`;
  return "default";
}

function getLevelLabel(profile: EduProfile): string {
  if (profile.educationType === "secondary" && profile.level === "o-level")
    return `O Level · ${profile.form ? `Form ${profile.form.replace("form", "")}` : ""}`;
  if (profile.educationType === "secondary" && profile.level === "a-level")
    return `A Level · ${profile.form === "form5" ? "Form 5" : "Form 6"}`;
  if (profile.educationType === "college")
    return `NACTE · ${profile.programLabel ?? "IT Program"}`;
  if (profile.educationType === "university")
    return `${profile.universityLabel ?? "University"} · CS · ${profile.year ?? ""}`;
  return "Computer Science";
}

const MODES = [
  { id: "tutor",      label: "Tutor Mode",    desc: "Ask questions, get explanations",        color: "#7c3aed" },
  { id: "lecture",    label: "Lecture Mode",  desc: "AI teaches the topic step by step",      color: "#2563eb" },
  { id: "assessment", label: "Quiz Mode",     desc: "Test your understanding with questions",  color: "#10b981" },
] as const;

export default function TutorPage() {
  const [profile,       setProfile]       = useState<EduProfile>({});
  const [topics,        setTopics]        = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [mode,          setMode]          = useState<"tutor" | "lecture" | "assessment">("tutor");
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [mounted,       setMounted]       = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("eduProfile");
      if (raw) {
        const p: EduProfile = JSON.parse(raw);
        setProfile(p);
        const key = getTopicsKey(p);
        const list = ALL_TOPICS[key] ?? ALL_TOPICS["default"];
        setTopics(list);
        setSelectedTopic(list[0]);
      } else {
        const def = ALL_TOPICS["default"];
        setTopics(def);
        setSelectedTopic(def[0]);
      }
    } catch {
      const def = ALL_TOPICS["default"];
      setTopics(def);
      setSelectedTopic(def[0]);
    }
    setMounted(true);
  }, []);

  // Close sidebar when a topic is picked on mobile
  function pickTopic(topic: Topic) {
    setSelectedTopic(topic);
    setSidebarOpen(false);
  }

  const visibleTopics = showAllTopics ? topics : topics.slice(0, 5);
  const levelLabel    = mounted ? getLevelLabel(profile) : "Computer Science";
  const currentMode   = MODES.find((m) => m.id === mode)!;

  if (!mounted) {
    return (
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        <aside className="hidden lg:flex w-72 flex-shrink-0 animate-pulse flex-col"
          style={{ background: "#0a0a12", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="p-4 space-y-3">
            <div className="h-9 rounded-xl bg-white/5 w-3/4" />
            <div className="h-8 rounded-xl bg-white/5" />
            <div className="h-8 rounded-xl bg-white/5" />
          </div>
        </aside>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-500 text-sm">Loading your CS topics…</div>
        </div>
      </div>
    );
  }

  const SidebarContent = (
    <>
      {/* Sidebar header */}
      <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center glow-purple">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white text-sm">CS AI Tutor</div>
            <div className="text-xs text-slate-500 truncate">{levelLabel}</div>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode pills */}
        <div className="space-y-1.5">
          {MODES.map(({ id, label, desc, color }) => (
            <button key={id} onClick={() => { setMode(id); }}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                mode === id ? "text-white font-medium" : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
              style={mode === id ? { background: `${color}20`, border: `1px solid ${color}40` } : {}}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: mode === id ? color : "rgba(255,255,255,0.15)" }} />
                <span>{label}</span>
              </div>
              {mode === id && <div className="text-xs mt-0.5 ml-4" style={{ color: `${color}cc` }}>{desc}</div>}
            </button>
          ))}
        </div>
      </div>

      {/* Topic list */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">CS Topics</p>
          <span className="text-xs text-slate-600">{topics.length} topics</span>
        </div>

        <div className="space-y-1.5">
          {visibleTopics.map((topic) => {
            const Icon = topic.icon;
            const isSelected = selectedTopic?.id === topic.id;
            return (
              <button key={topic.id} onClick={() => pickTopic(topic)}
                className={cn(
                  "w-full text-left p-3 rounded-xl transition-all duration-200 hover:scale-[1.01]",
                  isSelected ? "border" : "glass glass-hover"
                )}
                style={isSelected ? {
                  background: `${topic.color}12`,
                  border: `1px solid ${topic.color}40`,
                  boxShadow: `0 0 12px ${topic.color}20`,
                } : {}}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${topic.color}18` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: topic.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn("text-xs font-medium leading-tight truncate", isSelected ? "text-white" : "text-slate-300")}>
                      {topic.title}
                    </div>
                    <div className="text-[10px] mt-0.5 font-medium" style={{ color: topic.color }}>
                      {topic.difficulty}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: topic.color }} />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {topics.length > 5 && (
          <button onClick={() => setShowAllTopics(!showAllTopics)}
            className="w-full mt-2 flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 py-2 transition-colors">
            {showAllTopics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showAllTopics ? "Show less" : `Show ${topics.length - 5} more`}
          </button>
        )}
      </div>

      {/* Level badge footer */}
      <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2 p-3 rounded-xl"
          style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}>
          <GraduationCap className="w-4 h-4 text-purple-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-400">Your Level</div>
            <div className="text-xs font-semibold text-white truncate">{levelLabel}</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden relative">

      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "flex flex-col flex-shrink-0 w-72 z-40 transition-transform duration-300",
          "fixed lg:relative inset-y-0 left-0 h-full",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{ background: "#0a0a12", borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        {SidebarContent}
      </aside>

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-2 px-3 py-2.5 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.25)" }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 transition-all hover:text-white"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Menu className="w-3.5 h-3.5" /> Topics
          </button>

          {selectedTopic && (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                style={{ background: `${selectedTopic.color}20` }}>
                <selectedTopic.icon className="w-3 h-3" style={{ color: selectedTopic.color }} />
              </div>
              <span className="text-xs font-medium text-white truncate">{selectedTopic.title}</span>
            </div>
          )}

          <span className="text-xs px-2 py-1 rounded-full font-medium shrink-0 text-white"
            style={{ background: `${currentMode.color}30` }}>
            {currentMode.label.replace(" Mode", "")}
          </span>
        </div>

        {/* Desktop topic context banner */}
        {selectedTopic && (
          <div className="hidden lg:flex items-center gap-3 px-5 py-3 shrink-0"
            style={{ background: `${selectedTopic.color}08`, borderBottom: `1px solid ${selectedTopic.color}20` }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${selectedTopic.color}15` }}>
              <selectedTopic.icon className="w-4 h-4" style={{ color: selectedTopic.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-white">{selectedTopic.title}</span>
              <span className="text-xs text-slate-400 ml-2">{selectedTopic.category}</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize shrink-0 text-white"
              style={{ background: `${selectedTopic.color}30` }}>
              {mode === "tutor" ? "Tutor" : mode === "lecture" ? "Lecture" : "Quiz"} Mode
            </span>
          </div>
        )}

        <ChatInterface
          topic={selectedTopic?.title ?? "Computer Science"}
          category={selectedTopic?.category ?? "CS"}
          mode={mode}
          topicColor={selectedTopic?.color ?? "#7c3aed"}
          level={profile.educationType ?? "secondary"}
        />
      </div>
    </div>
  );
}
