"use client";
import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, BookOpen, MessageSquare, ChevronLeft, ChevronRight,
  Clock, CheckCircle, Volume2, VolumeX, Save, Check,
} from "lucide-react";
import ContentRenderer from "@/components/content/ContentRenderer";
import type { ContentBlock } from "@/types";
import { saveNote, getNote, recordStudyTime } from "@/lib/progress";

// ── CS content map ────────────────────────────────────────────────────────────
const CS_CONTENT: Record<string, { title: string; subtitle: string; blocks: ContentBlock[] }> = {
  "python-intro": {
    title: "Python Programming Fundamentals",
    subtitle: "Computer Science",
    blocks: [
      { type: "heading", level: 1, content: "Python Programming Fundamentals" },
      { type: "text", content: "Python is one of the most popular programming languages in the world. It is used in web development, data science, artificial intelligence, automation and more. Python's simple, readable syntax makes it an excellent first programming language." },
      { type: "callout", variant: "tip", content: "Python uses indentation (spaces) instead of curly braces {} to define code blocks. This enforces clean, readable code." },
      { type: "heading", level: 2, content: "Variables and Data Types" },
      { type: "text", content: "A variable is a named storage location that holds a value. Python automatically determines the data type based on the value you assign." },
      { type: "code", language: "python", content: `# String
name = "Alice"

# Integer
age = 17

# Float
gpa = 3.8

# Boolean
is_active = True

print(name, age, gpa, is_active)
# Output: Alice 17 3.8 True` },
      { type: "heading", level: 2, content: "Control Flow — if/elif/else" },
      { type: "text", content: "Control flow statements allow your program to make decisions. The if/elif/else statement runs different code depending on whether a condition is True or False." },
      { type: "code", language: "python", content: `score = 75

if score >= 80:
    grade = "A"
elif score >= 65:
    grade = "B"
elif score >= 50:
    grade = "C"
else:
    grade = "D"

print(f"Your grade is: {grade}")
# Output: Your grade is: B` },
      { type: "heading", level: 2, content: "Functions" },
      { type: "text", content: "A function is a reusable block of code that performs a specific task. Functions help you organise code and avoid repetition." },
      { type: "code", language: "python", content: `def calculate_average(numbers):
    if not numbers:
        return 0
    return sum(numbers) / len(numbers)

scores = [85, 92, 78, 96, 88]
avg = calculate_average(scores)
print(f"Class average: {avg}")
# Output: Class average: 87.8` },
      { type: "callout", variant: "info", content: "Functions that return values use the 'return' keyword. The 'def' keyword defines a function, followed by its name and parameters in parentheses." },
      { type: "heading", level: 2, content: "Lists and Loops" },
      { type: "list", ordered: false, items: [
        "A list is a collection of items: fruits = ['mango', 'banana', 'avocado']",
        "A for loop iterates over each item in a list or range",
        "A while loop continues running while a condition is True",
        "Use len() to get the number of items in a list",
      ]},
      { type: "code", language: "python", content: `fruits = ["mango", "banana", "avocado", "pineapple"]

for i, fruit in enumerate(fruits):
    print(f"{i + 1}. {fruit}")

# Output:
# 1. mango
# 2. banana
# 3. avocado
# 4. pineapple` },
      { type: "heading", level: 2, content: "Input and Output" },
      { type: "text", content: "Python makes it easy to interact with users. Use input() to read text from the user and print() to display output." },
      { type: "code", language: "python", content: `name = input("Enter your name: ")
age = int(input("Enter your age: "))
print(f"Hello {name}! In 5 years you will be {age + 5}.")` },
    ],
  },

  "web-design": {
    title: "Web Design — HTML & CSS",
    subtitle: "Computer Science",
    blocks: [
      { type: "heading", level: 1, content: "Web Design — HTML & CSS" },
      { type: "text", content: "HTML (HyperText Markup Language) is the standard language for creating web pages. CSS (Cascading Style Sheets) controls the visual appearance. Together they form the foundation of every website you see." },
      { type: "callout", variant: "tip", content: "Every website you visit is built with HTML and CSS. Right-click any webpage and select 'View Page Source' to see the HTML code." },
      { type: "heading", level: 2, content: "HTML Document Structure" },
      { type: "code", language: "html", content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My First Web Page</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is my first web page.</p>
    <a href="https://example.com">Click here</a>
</body>
</html>` },
      { type: "heading", level: 2, content: "Essential HTML Tags" },
      { type: "list", ordered: false, items: [
        "<h1> to <h6> — Headings (h1 is largest, h6 is smallest)",
        "<p> — Paragraph of text",
        "<a href='url'> — Hyperlink",
        "<img src='file.jpg' alt='description'> — Image",
        "<ul> and <li> — Unordered list with list items",
        "<div> — Block container element",
        "<span> — Inline container for styling text",
      ]},
      { type: "heading", level: 2, content: "CSS Selectors and Rules" },
      { type: "text", content: "CSS controls colours, fonts, spacing and layout. A CSS rule has two parts: a selector (which elements to style) and declarations (the styles to apply)." },
      { type: "code", language: "css", content: `/* Tag selector — styles ALL h1 elements */
h1 {
    color: #2563eb;
    font-size: 32px;
    text-align: center;
}

/* Class selector — styles elements with class="card" */
.card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* ID selector — styles the single element with id="nav" */
#nav {
    background: #1a1a2e;
    padding: 16px;
}` },
      { type: "heading", level: 2, content: "The CSS Box Model" },
      { type: "callout", variant: "info", content: "Every HTML element is a box with four zones: Content (the actual text/image), Padding (space inside the border), Border (the edge line), and Margin (space outside the border). Mastering the box model is key to controlling layout." },
      { type: "heading", level: 2, content: "Responsive Design" },
      { type: "text", content: "Responsive design means your webpage looks good on all screen sizes — phone, tablet, and desktop. Use CSS media queries to apply different styles at different screen widths." },
      { type: "code", language: "css", content: `/* Default: full-width on small screens */
.container { width: 100%; padding: 16px; }

/* Medium screens (768px and up) */
@media (min-width: 768px) {
    .container { max-width: 768px; margin: 0 auto; }
}

/* Large screens (1024px and up) */
@media (min-width: 1024px) {
    .container { max-width: 1200px; }
}` },
    ],
  },

  "networks-intro": {
    title: "Computer Networks Introduction",
    subtitle: "Computer Science",
    blocks: [
      { type: "heading", level: 1, content: "Computer Networks Introduction" },
      { type: "text", content: "A computer network is a collection of devices (computers, phones, servers) connected together to share resources and communicate. The internet is the world's largest computer network." },
      { type: "heading", level: 2, content: "Types of Networks" },
      { type: "list", ordered: false, items: [
        "LAN (Local Area Network) — connects devices in a small area like a school or office",
        "WAN (Wide Area Network) — connects networks over large distances (the internet is a WAN)",
        "MAN (Metropolitan Area Network) — city-wide network, e.g. a university campus",
        "PAN (Personal Area Network) — very short range, e.g. Bluetooth devices",
      ]},
      { type: "heading", level: 2, content: "The OSI Model — 7 Layers" },
      { type: "text", content: "The OSI (Open Systems Interconnection) model divides network communication into 7 layers. Each layer handles a specific job and communicates with the layers above and below it." },
      { type: "list", ordered: true, items: [
        "Physical — electrical signals, cables, Wi-Fi radio waves",
        "Data Link — MAC addresses, frames, error detection (Ethernet, Wi-Fi)",
        "Network — IP addresses, routing packets between networks",
        "Transport — TCP/UDP, reliable delivery, port numbers",
        "Session — maintains connections between applications",
        "Presentation — encryption, compression, data formatting",
        "Application — user-facing protocols: HTTP, FTP, DNS, email",
      ]},
      { type: "callout", variant: "tip", content: "Memory aid (bottom to top): 'Please Do Not Throw Sausage Pizza Away' — Physical, Data Link, Network, Transport, Session, Presentation, Application." },
      { type: "heading", level: 2, content: "IP Addresses" },
      { type: "text", content: "An IP address is a unique identifier for each device on a network, like a postal address. IPv4 uses the format 192.168.1.1. IPv6 uses a longer format to support more devices as the internet grows." },
      { type: "heading", level: 2, content: "TCP vs UDP" },
      { type: "text", content: "TCP (Transmission Control Protocol) guarantees delivery — it checks that all data arrives in order. UDP (User Datagram Protocol) is faster but does not guarantee delivery. Use TCP for files and web pages; use UDP for live video and gaming." },
      { type: "code", language: "bash", content: `# Check your IP address (Windows)
ipconfig

# Check your IP address (Linux/Mac)
ifconfig

# Test connection to a server
ping google.com

# Trace the route packets take
tracert google.com    # Windows
traceroute google.com # Linux/Mac` },
    ],
  },

  "database-sql": {
    title: "Database Design & SQL",
    subtitle: "Computer Science",
    blocks: [
      { type: "heading", level: 1, content: "Database Design & SQL" },
      { type: "text", content: "A database is an organised collection of structured data. Relational databases store data in tables (rows and columns) and use SQL (Structured Query Language) to create, read, update and delete data." },
      { type: "heading", level: 2, content: "Key Database Concepts" },
      { type: "list", ordered: false, items: [
        "Table — a collection of related data in rows and columns (like a spreadsheet)",
        "Primary Key — a unique identifier for each row (e.g., student_id)",
        "Foreign Key — links one table to another table's primary key",
        "Index — speeds up database searches",
        "Normalisation — organising data to reduce redundancy",
      ]},
      { type: "heading", level: 2, content: "Core SQL Commands" },
      { type: "code", language: "sql", content: `-- Create a table
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    form INT,
    created_at DATETIME DEFAULT NOW()
);

-- Insert a row
INSERT INTO students (name, email, form)
VALUES ('Alice Mwangi', 'alice@school.tz', 3);

-- Read data
SELECT name, email FROM students WHERE form = 3;

-- Update a row
UPDATE students SET form = 4 WHERE name = 'Alice Mwangi';

-- Delete a row
DELETE FROM students WHERE id = 5;` },
      { type: "heading", level: 2, content: "SQL Joins — Combining Tables" },
      { type: "text", content: "A JOIN combines rows from two or more tables based on a related column. INNER JOIN returns only matching rows. LEFT JOIN returns all rows from the left table, even if there is no match." },
      { type: "code", language: "sql", content: `-- INNER JOIN: students and their exam results
SELECT s.name, e.subject, e.score
FROM students s
INNER JOIN exams e ON s.id = e.student_id
WHERE e.score >= 50
ORDER BY e.score DESC;

-- GROUP BY: average score per form
SELECT form, AVG(score) AS avg_score, COUNT(*) AS students
FROM students s
JOIN exams e ON s.id = e.student_id
GROUP BY form
HAVING AVG(score) >= 60;` },
      { type: "heading", level: 2, content: "Database Normalisation" },
      { type: "text", content: "Normalisation is the process of organising a database to reduce data redundancy and improve integrity. The main normal forms are 1NF (no repeating groups), 2NF (no partial dependencies), and 3NF (no transitive dependencies)." },
      { type: "callout", variant: "info", content: "Always use parameterised queries in real applications to prevent SQL Injection attacks — never concatenate user input directly into SQL strings." },
    ],
  },
};

function DEFAULT_CONTENT(title: string): { title: string; subtitle: string; blocks: ContentBlock[] } {
  return {
    title,
    subtitle: "Computer Science",
    blocks: [
      { type: "heading", level: 1, content: title },
      { type: "text", content: `Welcome to the ${title} module. This topic is part of your personalised Computer Science curriculum.` },
      { type: "callout", variant: "tip", content: `Click "Ask AI Tutor" in the Quick Actions panel to get a personalised lesson on ${title} right now. The AI adapts explanations to your level.` },
      { type: "heading", level: 2, content: "Core Concepts" },
      { type: "text", content: `${title} is a fundamental topic in Computer Science. Understanding it well will help you succeed in your examinations and build a strong foundation for advanced topics.` },
      { type: "list", ordered: false, items: [
        "Review the key terminology and definitions",
        "Study worked examples and practice problems",
        "Use the AI Tutor to get explanations in your own language",
        "Take the chapter assessment to measure your understanding",
      ]},
      { type: "heading", level: 2, content: "Key Points to Remember" },
      { type: "callout", variant: "info", content: "Your AI tutor can generate diagrams, code examples, and step-by-step solutions for any topic in this chapter. Just ask!" },
      { type: "heading", level: 2, content: "Practice and Assessment" },
      { type: "text", content: "After reviewing the content, take the chapter assessment to test your understanding. You can retake it as many times as you need — each attempt is saved to your progress." },
    ],
  };
}

function getContent(chapterId: string) {
  if (CS_CONTENT[chapterId]) return CS_CONTENT[chapterId];
  const title = chapterId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  return DEFAULT_CONTENT(title);
}

export default function LearnPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = use(params);
  const router = useRouter();
  const chapter = getContent(chapterId);
  const contentRef = useRef<HTMLDivElement>(null);

  // Derive sections from heading blocks — indices match the `h-${i}` IDs in ContentRenderer
  const sections = chapter.blocks.reduce<Array<{ id: string; title: string }>>((acc, b, i) => {
    if (b.type === "heading" && b.content) acc.push({ id: `h-${i}`, title: b.content });
    return acc;
  }, []);

  const [activeTab, setActiveTab] = useState<"content" | "notes">("content");
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [listening, setListening] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setNotes(getNote(chapterId));
    const timer = setInterval(() => {
      recordStudyTime(1);
      setProgress((p) => Math.min(p + Math.round(100 / (sections.length * 3)), 100));
    }, 60000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  // Track active section via IntersectionObserver
  useEffect(() => {
    if (activeTab !== "content") return;
    const headingEls = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!headingEls.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) {
          const topmost = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          const idx = headingEls.findIndex((el) => el === topmost.target);
          if (idx >= 0) {
            setActiveSection(idx);
            setProgress((p) => Math.max(p, Math.round(((idx + 1) / sections.length) * 80)));
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    headingEls.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, sections.length]);

  function scrollToSection(id: string, idx: number) {
    setActiveSection(idx);
    setActiveTab("content");
    setProgress((p) => Math.max(p, Math.round(((idx + 1) / sections.length) * 80)));
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function saveNotes() {
    saveNote(chapterId, notes);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  }

  function toggleListen() {
    if (listening) {
      window.speechSynthesis?.cancel();
      setListening(false);
    } else {
      const text = chapter.blocks
        .filter((b) => b.type === "text" || b.type === "heading")
        .map((b) => b.content)
        .join(". ");
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onend = () => setListening(false);
      window.speechSynthesis?.speak(utterance);
      setListening(true);
    }
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <div className="flex gap-6">

        {/* Left panel */}
        <div className="flex-1 min-w-0">
          <button onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Chapter header */}
          <div className="rounded-2xl p-6 mb-6"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(37,99,235,0.1) 100%)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs text-purple-400 font-medium mb-1 block">{chapter.subtitle}</span>
                <h1 className="text-xl font-bold text-white mb-2">{chapter.title}</h1>
                <div className="flex items-center gap-4 text-slate-400 text-sm">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{sections.length * 8} min</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{sections.length} sections</span>
                </div>
              </div>
              <button onClick={toggleListen}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0"
                style={{
                  background: listening ? "rgba(239,68,68,0.15)" : "rgba(124,58,237,0.2)",
                  border: listening ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(124,58,237,0.3)",
                  color: listening ? "#f87171" : "#c4b5fd",
                }}>
                {listening ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {listening ? "Stop" : "Listen"}
              </button>
            </div>
            <div className="mt-4 progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>{progress}% complete</span>
              <span>Section {activeSection + 1} of {sections.length}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: "rgba(255,255,255,0.04)" }}>
            {(["content", "notes"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}>
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "content" && (
            <div className="glass rounded-2xl p-6 lg:p-8" ref={contentRef}>
              <ContentRenderer blocks={chapter.blocks} />
            </div>
          )}

          {activeTab === "notes" && (
            <div className="glass rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Your notes for this chapter — saved locally</p>
                <button onClick={saveNotes}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ background: notesSaved ? "rgba(16,185,129,0.15)" : "rgba(124,58,237,0.15)", color: notesSaved ? "#34d399" : "#c4b5fd" }}>
                  {notesSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  {notesSaved ? "Saved!" : "Save Notes"}
                </button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-72 resize-none bg-transparent text-slate-300 text-sm leading-relaxed outline-none placeholder:text-slate-600"
                placeholder="Take notes here — jot down key concepts, questions, or things to remember…" />
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={() => router.back()} className="btn-ghost flex items-center gap-2 text-sm">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <Link href={`/assessment/${chapterId}`} className="btn-primary flex items-center gap-2 text-sm">
              Take Assessment <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0">
          <div className="glass rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold text-white text-sm">Quick Actions</h3>
            <Link href={`/tutor?topic=${encodeURIComponent(chapter.title)}`}
              className="flex items-center gap-3 p-3 rounded-xl transition-all glass glass-hover cursor-pointer">
              <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Ask AI Tutor</div>
                <div className="text-xs text-slate-400">Get instant help on this topic</div>
              </div>
            </Link>
            <Link href={`/assessment/${chapterId}`}
              className="flex items-center gap-3 p-3 rounded-xl transition-all glass glass-hover cursor-pointer">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(16,185,129,0.2)" }}>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Take Quiz</div>
                <div className="text-xs text-slate-400">Test your knowledge</div>
              </div>
            </Link>
          </div>

          {/* Chapter outline — live, scrollable */}
          <div className="glass rounded-2xl p-5 sticky top-24">
            <h3 className="font-semibold text-white text-sm mb-4">Chapter Outline</h3>
            <div className="space-y-0.5">
              {sections.map((section, i) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id, i)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-start gap-2"
                  style={i === activeSection
                    ? { background: "rgba(124,58,237,0.15)", color: "#c4b5fd" }
                    : { color: "#64748b" }}
                  onMouseEnter={(e) => { if (i !== activeSection) e.currentTarget.style.color = "#e2e8f0"; }}
                  onMouseLeave={(e) => { if (i !== activeSection) e.currentTarget.style.color = "#64748b"; }}
                >
                  <span className="shrink-0 mt-0.5 text-xs opacity-50 font-mono">{i + 1}.</span>
                  <span className="leading-snug">{section.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
