"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Brain, BarChart3, MessageSquare, Home, Bell, Search, Settings, X,
  Code2, Globe, Database, Network, Shield, Monitor, Cpu, Terminal,
  Zap, BookOpen, Wifi, Lock, BarChart2, Smartphone, Server,
  LogOut, User, ChevronRight, Menu, Flame, Trophy, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const navLinks = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/tutor", label: "AI Tutor", icon: MessageSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

interface SearchItem { id: string; title: string; subject: string; icon: typeof Code2; color: string; }

const ALL_TOPICS: SearchItem[] = [
  { id: "intro-computers", title: "Intro to Computer Systems", subject: "O Level", icon: Monitor, color: "#7c3aed" },
  { id: "hardware", title: "Computer Hardware", subject: "O Level", icon: Cpu, color: "#2563eb" },
  { id: "computer-security", title: "Computer Security", subject: "O Level", icon: Shield, color: "#ef4444" },
  { id: "networks-intro", title: "Computer Networks Introduction", subject: "O Level / A Level", icon: Wifi, color: "#06b6d4" },
  { id: "database-ms-access", title: "Database Management (Access)", subject: "O Level", icon: Database, color: "#7c3aed" },
  { id: "programming-vb", title: "Programming with Visual Basic", subject: "O Level", icon: Code2, color: "#10b981" },
  { id: "algorithms", title: "Algorithms & Flowcharts", subject: "O Level / A Level", icon: Zap, color: "#f59e0b" },
  { id: "python-intro", title: "Python Programming Fundamentals", subject: "O Level / A Level", icon: Terminal, color: "#10b981" },
  { id: "web-design", title: "Web Design — HTML & CSS", subject: "O Level / A Level", icon: Globe, color: "#2563eb" },
  { id: "cs-arch", title: "Computer Architecture", subject: "A Level", icon: Cpu, color: "#7c3aed" },
  { id: "data-structures", title: "Data Structures I", subject: "A Level", icon: Database, color: "#f59e0b" },
  { id: "algorithms-alevel", title: "Algorithm Design & Analysis", subject: "A Level", icon: Zap, color: "#06b6d4" },
  { id: "database-sql", title: "Database Design & SQL", subject: "A Level / College", icon: Database, color: "#ec4899" },
  { id: "oop", title: "Object-Oriented Programming", subject: "A Level / College", icon: Code2, color: "#7c3aed" },
  { id: "networks-alevel", title: "Computer Networks & Protocols", subject: "A Level", icon: Network, color: "#2563eb" },
  { id: "security", title: "Information Security", subject: "A Level / College", icon: Shield, color: "#ef4444" },
  { id: "python-alevel", title: "Programming with Python", subject: "A Level", icon: Terminal, color: "#10b981" },
  { id: "dba", title: "Database Administration", subject: "College", icon: Server, color: "#10b981" },
  { id: "fullstack-web", title: "Full-Stack Web Development", subject: "College", icon: Globe, color: "#7c3aed" },
  { id: "mobile-dev", title: "Mobile App Development", subject: "College", icon: Smartphone, color: "#f59e0b" },
  { id: "cybersec", title: "Cybersecurity Foundations", subject: "College", icon: Lock, color: "#ef4444" },
  { id: "prog-fund", title: "Programming Fundamentals", subject: "University", icon: Code2, color: "#7c3aed" },
  { id: "algo-intro", title: "Introduction to Algorithms", subject: "University", icon: Zap, color: "#06b6d4" },
  { id: "web-tech-1", title: "Web Technologies I", subject: "University", icon: Globe, color: "#ec4899" },
  { id: "data-science", title: "Data Science & Analytics", subject: "University", icon: BarChart2, color: "#10b981" },
  { id: "cloud-comp", title: "Cloud Computing (AWS/Azure)", subject: "University", icon: Server, color: "#06b6d4" },
  { id: "boolean-algebra", title: "Boolean Algebra & Logic Gates", subject: "A Level", icon: Cpu, color: "#ef4444" },
];

interface Notification { id: string; icon: typeof Flame; color: string; title: string; body: string; time: string; unread: boolean; }

function buildNotifications(): Notification[] {
  return [
    { id: "1", icon: Flame, color: "#f59e0b", title: "Keep your streak!", body: "You studied yesterday — log in today to keep your streak alive.", time: "now", unread: true },
    { id: "2", icon: Trophy, color: "#10b981", title: "New topic unlocked", body: "Python Fundamentals is ready for you to start.", time: "2h ago", unread: true },
    { id: "3", icon: Brain, color: "#7c3aed", title: "AI Tutor available", body: "Ask your AI tutor anything about today's curriculum.", time: "5h ago", unread: false },
    { id: "4", icon: AlertCircle, color: "#2563eb", title: "Weekly summary", body: "You completed 3 topics this week. Great progress!", time: "1d ago", unread: false },
  ];
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [initials, setInitials] = useState("S");
  const [userName, setUserName] = useState("Student");
  const [userEmail, setUserEmail] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [signingOut, setSigningOut] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    setNotifications(buildNotifications());

    // Load from Supabase auth first, then fall back to localStorage
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (user) {
        const fullName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Student";
        setUserEmail(user.email ?? "");
        const parts = fullName.trim().split(" ");
        setInitials(parts.map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() || "S");
        setUserName(fullName);
      }
    });

    // Also sync from localStorage profile
    try {
      const raw = localStorage.getItem("eduProfile");
      if (raw) {
        const p = JSON.parse(raw);
        if (p.name) {
          const parts = p.name.trim().split(" ");
          setInitials(parts.map((w: string) => w[0]).slice(0, 2).join("").toUpperCase());
          setUserName(p.name);
        }
      }
    } catch {}
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") { setSearchOpen(false); setBellOpen(false); setProfileOpen(false); setMobileMenuOpen(false); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
    else setQuery("");
  }, [searchOpen]);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  const results = query.trim().length >= 1
    ? ALL_TOPICS.filter((t) =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.subject.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : ALL_TOPICS.slice(0, 6);

  function navigate(id: string) { setSearchOpen(false); router.push(`/learn/${id}`); }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    localStorage.removeItem("eduProfile");
    window.location.href = "/login";
  }

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4 sm:px-6"
        style={{ background: "rgba(10,10,15,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 mr-6 group shrink-0">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center group-hover:opacity-90 transition-opacity">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg gradient-text hidden sm:block">EduAI OS</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/6"
              )}
            >
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Search — desktop */}
          <button onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl glass text-slate-400 hover:text-white transition-colors text-sm"
          >
            <Search className="w-4 h-4" />
            <span className="text-xs hidden lg:block">Search topics…</span>
            <span className="text-xs text-slate-600 hidden lg:block ml-1">⌘K</span>
          </button>

          {/* Search — mobile icon */}
          <button onClick={() => setSearchOpen(true)}
            className="sm:hidden w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Bell */}
          <div ref={bellRef} className="relative">
            <button
              onClick={() => { setBellOpen(!bellOpen); setProfileOpen(false); }}
              className={cn(
                "relative w-9 h-9 rounded-xl glass flex items-center justify-center transition-all duration-200",
                bellOpen ? "text-white bg-white/10" : "text-slate-400 hover:text-white"
              )}
            >
              <Bell className={cn("w-4 h-4 transition-transform duration-300", bellOpen && "scale-110")} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <div
                className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden shadow-2xl"
                style={{ background: "rgba(15,15,22,0.98)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
              >
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="font-semibold text-white text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <div key={n.id}
                        className={cn(
                          "flex gap-3 px-4 py-3 cursor-pointer transition-colors",
                          n.unread ? "bg-white/[0.03]" : "",
                          "hover:bg-white/[0.06]"
                        )}
                        onClick={() => setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, unread: false } : x))}
                      >
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: `${n.color}18` }}>
                          <Icon className="w-4 h-4" style={{ color: n.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-white truncate">{n.title}</span>
                            {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.body}</p>
                          <span className="text-[11px] text-slate-600 mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="px-4 py-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <Link href="/analytics" onClick={() => setBellOpen(false)}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                    View all activity <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Settings icon — desktop only */}
          <Link href="/settings"
            className={cn(
              "hidden md:flex w-9 h-9 rounded-xl glass items-center justify-center transition-colors",
              pathname === "/settings" ? "text-white bg-white/10" : "text-slate-400 hover:text-white"
            )}
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* Profile avatar */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => { setProfileOpen(!profileOpen); setBellOpen(false); }}
              className={cn(
                "w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white text-sm font-bold transition-all duration-200",
                profileOpen ? "ring-2 ring-purple-400 ring-offset-2 ring-offset-[#0a0a0f] scale-95" : "hover:opacity-90 hover:scale-105"
              )}
              title={userName}
            >
              {initials}
            </button>

            {profileOpen && (
              <div
                className="absolute right-0 top-12 w-64 rounded-2xl overflow-hidden shadow-2xl"
                style={{ background: "rgba(15,15,22,0.98)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
              >
                {/* User info */}
                <div className="px-4 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-bold shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{userName}</div>
                      {userEmail && <div className="text-xs text-slate-500 truncate">{userEmail}</div>}
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1.5">
                  {[
                    { href: "/settings", icon: User, label: "My Profile" },
                    { href: "/settings", icon: Settings, label: "Settings" },
                    { href: "/analytics", icon: BarChart3, label: "Analytics" },
                  ].map(({ href, icon: Icon, label }) => (
                    <Link key={label} href={href}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-slate-500" />
                      {label}
                    </Link>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} className="py-1.5">
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    {signingOut ? "Signing out…" : "Sign Out"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white transition-colors ml-1"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 pt-16 md:hidden"
          style={{ background: "rgba(10,10,15,0.97)", backdropFilter: "blur(20px)" }}
        >
          <nav className="flex flex-col px-4 pt-4 gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all",
                  pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/6"
                )}
              >
                <Icon className="w-5 h-5" />{label}
              </Link>
            ))}
            <Link href="/settings"
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all",
                pathname === "/settings" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/6"
              )}
            >
              <Settings className="w-5 h-5" /> Settings
            </Link>
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button onClick={handleSignOut} disabled={signingOut}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-red-400 hover:bg-red-500/5 transition-colors disabled:opacity-50"
              >
                <LogOut className="w-5 h-5" />
                {signingOut ? "Signing out…" : "Sign Out"}
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Search overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
        >
          <div className="w-full max-w-xl rounded-2xl overflow-hidden"
            style={{ background: "rgba(15,15,22,0.98)", border: "1px solid rgba(124,58,237,0.3)", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}
          >
            <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <Search className="w-5 h-5 text-purple-400 shrink-0" />
              <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && results.length) navigate(results[0].id); }}
                placeholder="Search CS topics, subjects, modules…"
                className="flex-1 bg-transparent text-white text-base outline-none placeholder:text-slate-500"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-slate-500 hover:text-slate-300 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => setSearchOpen(false)}
                className="text-xs text-slate-500 px-2 py-1 rounded-lg border border-white/10 hover:text-slate-300 transition-colors"
              >Esc</button>
            </div>
            <div className="py-2 max-h-[60vh] overflow-y-auto">
              {!query.trim() && <p className="text-xs text-slate-500 px-4 py-2">Popular topics</p>}
              {results.length === 0 && (
                <div className="px-4 py-6 text-center text-slate-500 text-sm">No topics found for &quot;{query}&quot;</div>
              )}
              {results.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.id} onClick={() => navigate(item.id)}
                    className="w-full flex items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-white/5"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${item.color}18` }}>
                      <Icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{item.title}</div>
                      <div className="text-xs text-slate-500">{item.subject}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                  </button>
                );
              })}
            </div>
            <div className="px-4 py-2.5 flex items-center justify-between text-xs text-slate-600"
              style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <span>↵ to open first result</span>
              <span>{ALL_TOPICS.length} topics available</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
