"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, BookOpen, Clock, Trophy, Target,
  Code2, Globe, Database, Network, Shield, Cpu,
  Brain, Terminal, Wifi, Server, Lock, BarChart2,
} from "lucide-react";
import CurriculumTree from "@/components/curriculum/CurriculumTree";
import { getProgress } from "@/lib/progress";
import type { Chapter } from "@/types";
import type { LucideIcon } from "lucide-react";

interface SubjectMeta {
  name: string;
  Icon: LucideIcon;
  color: string;
  desc: string;
}

const SUBJECT_META: Record<string, SubjectMeta> = {
  cs:               { name: "Computer Science",       Icon: Cpu,      color: "#7c3aed", desc: "A complete computer science curriculum — hardware, software, algorithms, and beyond." },
  "python-intro":   { name: "Introduction to Python", Icon: Terminal, color: "#10b981", desc: "Learn Python from scratch — variables, control flow, functions, and basic OOP." },
  "web-design":     { name: "Web Design & HTML/CSS",  Icon: Globe,    color: "#2563eb", desc: "Build websites with HTML structure, CSS styling, and responsive design techniques." },
  "networks-intro": { name: "Networking Fundamentals",Icon: Wifi,     color: "#06b6d4", desc: "Understand how computers communicate — protocols, OSI model, TCP/IP, and security." },
  "database-sql":   { name: "Database Design & SQL",  Icon: Database, color: "#f59e0b", desc: "Design relational databases and write SQL queries to store and retrieve data." },
  "computer-security": { name: "Computer Security",   Icon: Shield,   color: "#ef4444", desc: "Protect systems and data — encryption, threats, firewalls, and security best practices." },
  algorithms:       { name: "Algorithms & Data Structures", Icon: Brain, color: "#8b5cf6", desc: "Master sorting, searching, complexity analysis, and core data structures." },
  ict:              { name: "ICT Fundamentals",        Icon: Cpu,      color: "#06b6d4", desc: "Information and Communication Technology — hardware, software, data representation, and more." },
  "web-tech":       { name: "Web Technologies",        Icon: Globe,    color: "#2563eb", desc: "Server-side and client-side web development, HTTP, APIs, and modern frameworks." },
  dba:              { name: "Database Administration", Icon: Server,   color: "#f59e0b", desc: "Manage, optimise, and secure production databases at scale." },
  "network-admin":  { name: "Network Administration",  Icon: Network,  color: "#06b6d4", desc: "Configure routers, switches, VLANs, and troubleshoot network infrastructure." },
  cybersec:         { name: "Cybersecurity",           Icon: Lock,     color: "#ef4444", desc: "Advanced security — penetration testing concepts, threat modelling, incident response." },
  "data-structures":{ name: "Data Structures",         Icon: BarChart2,color: "#8b5cf6", desc: "Arrays, linked lists, trees, graphs, hash tables — implementation and trade-offs." },
  oop:              { name: "Object-Oriented Programming", Icon: Code2,color: "#10b981", desc: "Classes, objects, inheritance, polymorphism, and design patterns in Python/Java." },
};

const CS_CHAPTERS: Record<string, Chapter[]> = {
  "python-intro": [
    { id: "python-intro-1", curriculum_id: "py", title: "Getting Started with Python",        sequence_order: 1, estimated_duration_mins: 30, prerequisites: [],                status: "available" },
    { id: "python-intro-2", curriculum_id: "py", title: "Variables & Data Types",             sequence_order: 2, estimated_duration_mins: 35, prerequisites: ["python-intro-1"], status: "available" },
    { id: "python-intro-3", curriculum_id: "py", title: "Control Flow — if / elif / else",    sequence_order: 3, estimated_duration_mins: 40, prerequisites: ["python-intro-2"], status: "available" },
    { id: "python-intro-4", curriculum_id: "py", title: "Loops — for and while",              sequence_order: 4, estimated_duration_mins: 40, prerequisites: ["python-intro-3"], status: "available" },
    { id: "python-intro-5", curriculum_id: "py", title: "Functions & Scope",                  sequence_order: 5, estimated_duration_mins: 45, prerequisites: ["python-intro-4"], status: "available" },
    { id: "python-intro-6", curriculum_id: "py", title: "Lists, Tuples & Dictionaries",       sequence_order: 6, estimated_duration_mins: 50, prerequisites: ["python-intro-5"], status: "available" },
    { id: "python-intro-7", curriculum_id: "py", title: "File Handling & Exceptions",         sequence_order: 7, estimated_duration_mins: 45, prerequisites: ["python-intro-6"], status: "available" },
    { id: "python-intro-8", curriculum_id: "py", title: "Introduction to OOP in Python",      sequence_order: 8, estimated_duration_mins: 55, prerequisites: ["python-intro-7"], status: "available" },
  ],
  "web-design": [
    { id: "web-design-1", curriculum_id: "web", title: "Introduction to the Web & HTML",      sequence_order: 1, estimated_duration_mins: 30, prerequisites: [],               status: "available" },
    { id: "web-design-2", curriculum_id: "web", title: "HTML Structure & Semantic Tags",       sequence_order: 2, estimated_duration_mins: 35, prerequisites: ["web-design-1"], status: "available" },
    { id: "web-design-3", curriculum_id: "web", title: "CSS Selectors & Box Model",            sequence_order: 3, estimated_duration_mins: 40, prerequisites: ["web-design-2"], status: "available" },
    { id: "web-design-4", curriculum_id: "web", title: "CSS Flexbox & Grid Layout",            sequence_order: 4, estimated_duration_mins: 45, prerequisites: ["web-design-3"], status: "available" },
    { id: "web-design-5", curriculum_id: "web", title: "Responsive Design & Media Queries",   sequence_order: 5, estimated_duration_mins: 45, prerequisites: ["web-design-4"], status: "available" },
    { id: "web-design-6", curriculum_id: "web", title: "HTML Forms & User Input",             sequence_order: 6, estimated_duration_mins: 40, prerequisites: ["web-design-5"], status: "available" },
    { id: "web-design-7", curriculum_id: "web", title: "Introduction to JavaScript",           sequence_order: 7, estimated_duration_mins: 55, prerequisites: ["web-design-6"], status: "available" },
    { id: "web-design-8", curriculum_id: "web", title: "DOM Manipulation & Events",            sequence_order: 8, estimated_duration_mins: 60, prerequisites: ["web-design-7"], status: "available" },
  ],
  "networks-intro": [
    { id: "networks-intro-1", curriculum_id: "net", title: "What is a Network?",              sequence_order: 1, estimated_duration_mins: 25, prerequisites: [],                    status: "available" },
    { id: "networks-intro-2", curriculum_id: "net", title: "Network Types — LAN, WAN, MAN",  sequence_order: 2, estimated_duration_mins: 30, prerequisites: ["networks-intro-1"],  status: "available" },
    { id: "networks-intro-3", curriculum_id: "net", title: "OSI Model — 7 Layers Explained", sequence_order: 3, estimated_duration_mins: 40, prerequisites: ["networks-intro-2"],  status: "available" },
    { id: "networks-intro-4", curriculum_id: "net", title: "TCP/IP Protocol Suite",           sequence_order: 4, estimated_duration_mins: 40, prerequisites: ["networks-intro-3"],  status: "available" },
    { id: "networks-intro-5", curriculum_id: "net", title: "IP Addressing & Subnetting",      sequence_order: 5, estimated_duration_mins: 50, prerequisites: ["networks-intro-4"],  status: "available" },
    { id: "networks-intro-6", curriculum_id: "net", title: "Routing & Switching",             sequence_order: 6, estimated_duration_mins: 45, prerequisites: ["networks-intro-5"],  status: "available" },
    { id: "networks-intro-7", curriculum_id: "net", title: "Network Security Basics",         sequence_order: 7, estimated_duration_mins: 40, prerequisites: ["networks-intro-6"],  status: "available" },
    { id: "networks-intro-8", curriculum_id: "net", title: "Wireless Networking & Wi-Fi",     sequence_order: 8, estimated_duration_mins: 35, prerequisites: ["networks-intro-7"],  status: "available" },
  ],
  "database-sql": [
    { id: "database-sql-1", curriculum_id: "db", title: "Introduction to Databases",          sequence_order: 1, estimated_duration_mins: 25, prerequisites: [],                   status: "available" },
    { id: "database-sql-2", curriculum_id: "db", title: "Relational Model & Tables",          sequence_order: 2, estimated_duration_mins: 30, prerequisites: ["database-sql-1"],   status: "available" },
    { id: "database-sql-3", curriculum_id: "db", title: "SQL Basics — SELECT, WHERE, ORDER",  sequence_order: 3, estimated_duration_mins: 40, prerequisites: ["database-sql-2"],   status: "available" },
    { id: "database-sql-4", curriculum_id: "db", title: "SQL Joins — INNER, LEFT, RIGHT",     sequence_order: 4, estimated_duration_mins: 45, prerequisites: ["database-sql-3"],   status: "available" },
    { id: "database-sql-5", curriculum_id: "db", title: "Aggregate Functions & GROUP BY",     sequence_order: 5, estimated_duration_mins: 40, prerequisites: ["database-sql-4"],   status: "available" },
    { id: "database-sql-6", curriculum_id: "db", title: "Database Normalisation (1NF–3NF)",   sequence_order: 6, estimated_duration_mins: 50, prerequisites: ["database-sql-5"],   status: "available" },
    { id: "database-sql-7", curriculum_id: "db", title: "Indexes & Query Optimisation",       sequence_order: 7, estimated_duration_mins: 45, prerequisites: ["database-sql-6"],   status: "available" },
    { id: "database-sql-8", curriculum_id: "db", title: "Transactions & Data Integrity",      sequence_order: 8, estimated_duration_mins: 40, prerequisites: ["database-sql-7"],   status: "available" },
  ],
  cs: [
    { id: "python-intro",    curriculum_id: "cs", title: "Introduction to Python",            sequence_order: 1, estimated_duration_mins: 30, prerequisites: [],              status: "available" },
    { id: "web-design",      curriculum_id: "cs", title: "Web Design & HTML/CSS",             sequence_order: 2, estimated_duration_mins: 35, prerequisites: [],              status: "available" },
    { id: "networks-intro",  curriculum_id: "cs", title: "Networking Fundamentals",           sequence_order: 3, estimated_duration_mins: 40, prerequisites: [],              status: "available" },
    { id: "database-sql",    curriculum_id: "cs", title: "Database Design & SQL",             sequence_order: 4, estimated_duration_mins: 45, prerequisites: [],              status: "available" },
    { id: "computer-security",curriculum_id: "cs",title: "Computer Security",                 sequence_order: 5, estimated_duration_mins: 40, prerequisites: [],              status: "available" },
    { id: "algorithms",      curriculum_id: "cs", title: "Algorithms & Data Structures",      sequence_order: 6, estimated_duration_mins: 55, prerequisites: [],              status: "available" },
    { id: "oop",             curriculum_id: "cs", title: "Object-Oriented Programming",        sequence_order: 7, estimated_duration_mins: 50, prerequisites: [],              status: "available" },
    { id: "os-basics",       curriculum_id: "cs", title: "Operating Systems Fundamentals",    sequence_order: 8, estimated_duration_mins: 45, prerequisites: [],              status: "available" },
  ],
};

function DEFAULT_CHAPTERS(subjectId: string): Chapter[] {
  return [
    { id: `${subjectId}-1`, curriculum_id: subjectId, title: "Introduction & Overview",     sequence_order: 1, estimated_duration_mins: 30, prerequisites: [], status: "available" },
    { id: `${subjectId}-2`, curriculum_id: subjectId, title: "Core Concepts",               sequence_order: 2, estimated_duration_mins: 40, prerequisites: [], status: "available" },
    { id: `${subjectId}-3`, curriculum_id: subjectId, title: "Practical Applications",      sequence_order: 3, estimated_duration_mins: 45, prerequisites: [], status: "available" },
    { id: `${subjectId}-4`, curriculum_id: subjectId, title: "Advanced Topics",             sequence_order: 4, estimated_duration_mins: 50, prerequisites: [], status: "available" },
    { id: `${subjectId}-5`, curriculum_id: subjectId, title: "Assessment & Review",         sequence_order: 5, estimated_duration_mins: 35, prerequisites: [], status: "available" },
  ];
}

export default function CurriculumPage({ params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId } = use(params);
  const meta = SUBJECT_META[subjectId] ?? { name: subjectId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), Icon: Code2, color: "#7c3aed", desc: "" };
  const { Icon } = meta;

  const baseChapters = CS_CHAPTERS[subjectId] ?? DEFAULT_CHAPTERS(subjectId);
  const [chapters, setChapters] = useState<Chapter[]>(baseChapters);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const progress = getProgress();
    const updated = baseChapters.map((ch) => {
      if (progress.completedTopics.includes(ch.id)) {
        return { ...ch, status: "completed" as const, mastery_score: progress.scores[ch.id] ?? 80 };
      }
      return ch;
    });
    setChapters(updated);
    setMounted(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId]);

  const completed = chapters.filter((c) => c.status === "completed").length;
  const total = chapters.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const totalHours = Math.round(chapters.reduce((a, c) => a + c.estimated_duration_mins, 0) / 60 * 10) / 10;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-5 sm:mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>

      <div
        className="rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${meta.color}25 0%, ${meta.color}08 100%)`,
          border: `1px solid ${meta.color}30`,
        }}
      >
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-15 blur-2xl"
          style={{ background: meta.color }}
        />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: `${meta.color}20`, border: `1px solid ${meta.color}30` }}
            >
              <Icon className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: meta.color }} />
            </div>
            <div className="flex-1 w-full">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">{meta.name}</h1>
              <p className="text-slate-400 text-sm mb-4">{meta.desc}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                {[
                  { icon: BookOpen, label: "Chapters",   value: total },
                  { icon: Trophy,   label: "Completed",  value: mounted ? completed : "—" },
                  { icon: Clock,    label: "Est. Hours", value: `${totalHours}h` },
                  { icon: Target,   label: "Progress",   value: mounted ? `${pct}%` : "—" },
                ].map(({ icon: SIcon, label, value }) => (
                  <div key={label} className="text-center p-2 rounded-xl"
                    style={{ background: "rgba(0,0,0,0.15)" }}>
                    <div className="text-lg sm:text-xl font-bold text-white">{value}</div>
                    <div className="text-xs text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 progress-track">
            <div className="progress-fill" style={{ width: `${pct}%`, background: meta.color }} />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-white mb-4">Curriculum Tree</h2>
        <CurriculumTree chapters={chapters} />
      </div>
    </div>
  );
}
