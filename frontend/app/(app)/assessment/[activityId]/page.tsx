"use client";
import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, CheckCircle2, XCircle, Trophy, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { markTopicComplete } from "@/lib/progress";

interface Question {
  id: string;
  type: "mcq" | "short_answer";
  marks: number;
  prompt: string;
  options: string[];
  correct: number; // -1 for short answer
}

const QUESTION_BANKS: Record<string, Question[]> = {
  "python-intro": [
    { id: "q1", type: "mcq", marks: 2, prompt: "What is the output of: print(2 ** 3)?", options: ["6", "8", "5", "9"], correct: 1 },
    { id: "q2", type: "mcq", marks: 2, prompt: "Which of the following correctly defines a function in Python?", options: ["function greet():", "def greet():", "void greet():", "func greet():"], correct: 1 },
    { id: "q3", type: "mcq", marks: 2, prompt: "What does len([10, 20, 30]) return?", options: ["2", "3", "30", "10"], correct: 1 },
    { id: "q4", type: "mcq", marks: 3, prompt: "Which data type is used to store True or False in Python?", options: ["int", "string", "bool", "float"], correct: 2 },
    { id: "q5", type: "short_answer", marks: 5, prompt: "Write a Python function called add_numbers that takes two parameters and returns their sum. Show an example call.", options: [], correct: -1 },
  ],
  "web-design": [
    { id: "q1", type: "mcq", marks: 2, prompt: "Which HTML tag is used to link a CSS stylesheet to an HTML page?", options: ["<style>", "<script>", "<link>", "<css>"], correct: 2 },
    { id: "q2", type: "mcq", marks: 2, prompt: "What does CSS stand for?", options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Syntax", "Coded Style System"], correct: 1 },
    { id: "q3", type: "mcq", marks: 2, prompt: "Which CSS property changes the text colour?", options: ["font-color", "text-color", "color", "foreground"], correct: 2 },
    { id: "q4", type: "mcq", marks: 3, prompt: "Which HTML element is the correct one for the largest heading?", options: ["<heading>", "<h6>", "<head>", "<h1>"], correct: 3 },
    { id: "q5", type: "short_answer", marks: 5, prompt: "Describe the difference between a class selector and an ID selector in CSS. Give one example of each.", options: [], correct: -1 },
  ],
  "networks-intro": [
    { id: "q1", type: "mcq", marks: 2, prompt: "How many layers does the OSI model have?", options: ["4", "5", "6", "7"], correct: 3 },
    { id: "q2", type: "mcq", marks: 2, prompt: "Which layer of the OSI model handles IP addressing and routing?", options: ["Data Link", "Transport", "Network", "Physical"], correct: 2 },
    { id: "q3", type: "mcq", marks: 2, prompt: "What does TCP stand for?", options: ["Transfer Control Protocol", "Transmission Control Protocol", "Transport Communication Protocol", "Terminal Control Protocol"], correct: 1 },
    { id: "q4", type: "mcq", marks: 3, prompt: "Which device connects multiple networks and forwards packets between them?", options: ["Switch", "Hub", "Router", "Bridge"], correct: 2 },
    { id: "q5", type: "short_answer", marks: 5, prompt: "Explain the difference between TCP and UDP. Give one real-world use case for each protocol.", options: [], correct: -1 },
  ],
  "database-sql": [
    { id: "q1", type: "mcq", marks: 2, prompt: "Which SQL keyword retrieves data from a table?", options: ["FETCH", "GET", "SELECT", "READ"], correct: 2 },
    { id: "q2", type: "mcq", marks: 2, prompt: "Which SQL clause filters rows based on a condition?", options: ["HAVING", "WHERE", "FILTER", "LIMIT"], correct: 1 },
    { id: "q3", type: "mcq", marks: 2, prompt: "Which SQL join returns all rows from the left table and matching rows from the right?", options: ["INNER JOIN", "RIGHT JOIN", "LEFT JOIN", "FULL JOIN"], correct: 2 },
    { id: "q4", type: "mcq", marks: 3, prompt: "What does PRIMARY KEY ensure in a database table?", options: ["Data is stored in order", "Each row has a unique identifier", "All columns have values", "The table has at least one row"], correct: 1 },
    { id: "q5", type: "short_answer", marks: 5, prompt: "Write a SQL query to find all students with a score greater than 70 from a table called students with columns: id, name, score.", options: [], correct: -1 },
  ],
  "computer-security": [
    { id: "q1", type: "mcq", marks: 2, prompt: "Which of the following is an example of a social engineering attack?", options: ["SQL Injection", "Buffer Overflow", "Phishing", "DDoS"], correct: 2 },
    { id: "q2", type: "mcq", marks: 2, prompt: "What does HTTPS stand for?", options: ["HyperText Transfer Protocol Secure", "High Transfer Protocol System", "HyperText Transport Protocol Standard", "Hosted Transfer Protocol Service"], correct: 0 },
    { id: "q3", type: "mcq", marks: 2, prompt: "Which type of encryption uses the same key to encrypt and decrypt data?", options: ["Asymmetric", "Hashing", "Symmetric", "Public-key"], correct: 2 },
    { id: "q4", type: "mcq", marks: 3, prompt: "What is a firewall primarily used for?", options: ["Speeding up internet connection", "Controlling network traffic based on rules", "Encrypting files on disk", "Backing up data"], correct: 1 },
    { id: "q5", type: "short_answer", marks: 5, prompt: "Explain what a man-in-the-middle (MITM) attack is and describe two ways to protect against it.", options: [], correct: -1 },
  ],
  "algorithms": [
    { id: "q1", type: "mcq", marks: 2, prompt: "What is the time complexity of binary search on a sorted array of n elements?", options: ["O(n)", "O(n²)", "O(log n)", "O(1)"], correct: 2 },
    { id: "q2", type: "mcq", marks: 2, prompt: "Which sorting algorithm works by repeatedly swapping adjacent elements if they are in the wrong order?", options: ["Merge Sort", "Quick Sort", "Bubble Sort", "Insertion Sort"], correct: 2 },
    { id: "q3", type: "mcq", marks: 2, prompt: "What does O(1) time complexity mean?", options: ["The algorithm runs in linear time", "The algorithm's time grows with input", "The algorithm runs in constant time regardless of input size", "The algorithm never terminates"], correct: 2 },
    { id: "q4", type: "mcq", marks: 3, prompt: "Which data structure follows the Last In, First Out (LIFO) principle?", options: ["Queue", "Stack", "Linked List", "Tree"], correct: 1 },
    { id: "q5", type: "short_answer", marks: 5, prompt: "Describe the merge sort algorithm in your own words. What is its time complexity and why is it more efficient than bubble sort for large datasets?", options: [], correct: -1 },
  ],
};

const DEFAULT_QUESTIONS: Question[] = [
  { id: "q1", type: "mcq", marks: 2, prompt: "What does CPU stand for?", options: ["Computer Processing Unit", "Central Processing Unit", "Core Program Utility", "Central Program Unit"], correct: 1 },
  { id: "q2", type: "mcq", marks: 2, prompt: "Which of the following is an input device?", options: ["Monitor", "Speaker", "Keyboard", "Printer"], correct: 2 },
  { id: "q3", type: "mcq", marks: 2, prompt: "What does RAM stand for?", options: ["Read Access Memory", "Random Access Memory", "Rapid Application Memory", "Read-only Application Memory"], correct: 1 },
  { id: "q4", type: "mcq", marks: 3, prompt: "Which number system does a computer use internally?", options: ["Decimal (base 10)", "Hexadecimal (base 16)", "Binary (base 2)", "Octal (base 8)"], correct: 2 },
  { id: "q5", type: "short_answer", marks: 5, prompt: "Explain the difference between hardware and software. Give two examples of each.", options: [], correct: -1 },
];

const TOPIC_NAMES: Record<string, string> = {
  "python-intro": "Introduction to Python",
  "web-design": "Web Design & HTML/CSS",
  "networks-intro": "Introduction to Networking",
  "database-sql": "Database Design & SQL",
  "computer-security": "Computer Security",
  "algorithms": "Algorithms & Complexity",
};

const TOPIC_FEEDBACK: Record<string, { pass: string; fail: string }> = {
  "python-intro": {
    pass: "Great work! You have a solid grasp of Python fundamentals — syntax, data types, and functions. Try building a small project to reinforce these skills further.",
    fail: "You're on the right track! Focus on Python syntax: function definitions with def, data types (int, str, bool, list), and practice writing small programs to build confidence.",
  },
  "web-design": {
    pass: "Excellent! Your understanding of HTML structure and CSS styling is strong. Next, explore JavaScript to make your web pages interactive.",
    fail: "Review the core HTML tags (headings, links, images) and CSS selectors (class vs ID). Practice building a simple webpage from scratch to solidify these concepts.",
  },
  "networks-intro": {
    pass: "Well done! You have a clear understanding of the OSI model and network protocols. Consider studying subnetting and routing protocols as your next step.",
    fail: "Revisit the OSI model's 7 layers and focus on the Network layer (IP addressing, routing) and Transport layer (TCP vs UDP). Draw the model from memory to help retention.",
  },
  "database-sql": {
    pass: "Impressive! Your SQL skills and understanding of database concepts are solid. Explore JOINs and normalisation to take your skills to the next level.",
    fail: "Focus on the core SQL commands: SELECT, WHERE, ORDER BY, and JOIN. Practice on a simple database with a few tables to build muscle memory.",
  },
};

function getFeedback(topicId: string, pct: number): string {
  const fb = TOPIC_FEEDBACK[topicId];
  if (fb) return pct >= 60 ? fb.pass : fb.fail;
  return pct >= 60
    ? "Good performance! You have a solid foundation in this CS topic. Keep practising to reach mastery level."
    : "Keep at it! Review the core concepts from this chapter and use the AI Tutor to clarify anything unclear before attempting the assessment again.";
}

type Phase = "intro" | "quiz" | "submitted" | "feedback";

export default function AssessmentPage({ params }: { params: Promise<{ activityId: string }> }) {
  const { activityId } = use(params);
  const router = useRouter();

  const questions = QUESTION_BANKS[activityId] ?? DEFAULT_QUESTIONS;
  const topicName = TOPIC_NAMES[activityId] ?? activityId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const totalMarks = questions.reduce((a, q) => a + q.marks, 0);

  const [phase, setPhase] = useState<Phase>("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [textAnswer, setTextAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [saved, setSaved] = useState(false);

  const q = questions[current];

  const submit = useCallback(() => {
    setPhase("submitted");
    setTimeout(() => setPhase("feedback"), 1500);
  }, []);

  useEffect(() => {
    if (phase !== "quiz") return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { submit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, submit]);

  const score = questions
    .filter((q) => q.type === "mcq" && answers[q.id] === q.correct)
    .reduce((a, q) => a + q.marks, 0);
  const pct = Math.round((score / totalMarks) * 100);

  useEffect(() => {
    if (phase === "feedback" && !saved) {
      markTopicComplete(activityId, pct);
      setSaved(true);
    }
  }, [phase, saved, activityId, pct]);

  function selectOption(idx: number) {
    setAnswers((prev) => ({ ...prev, [q.id]: idx }));
  }

  function next() {
    const updated = { ...answers };
    if (q.type === "short_answer") {
      updated[q.id] = textAnswer;
      setAnswers(updated);
      setTextAnswer("");
    }
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      submit();
    }
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  if (phase === "intro") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href={`/learn/${activityId}`}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Chapter
        </Link>

        <div className="glass rounded-2xl p-4 sm:p-8 text-center space-y-5 sm:space-y-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl gradient-bg mx-auto flex items-center justify-center glow-purple">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Chapter Assessment</h1>
            <p className="text-slate-400 text-sm sm:text-base">{topicName}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[
              { label: "Questions", value: questions.length },
              { label: "Total Marks", value: totalMarks },
              { label: "Time Limit", value: "30 min" },
            ].map(({ label, value }) => (
              <div key={label} className="glass rounded-xl p-4">
                <div className="text-2xl font-bold gradient-text">{value}</div>
                <div className="text-xs text-slate-400">{label}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Answer all questions. MCQ answers are auto-graded; short answers are marked for completion.
            Your score is saved to your progress automatically.
          </p>
          <button onClick={() => setPhase("quiz")} className="btn-primary text-base px-8">
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  if (phase === "submitted") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400">Saving your results…</p>
        </div>
      </div>
    );
  }

  if (phase === "feedback") {
    const grade = pct >= 80 ? "A" : pct >= 65 ? "B" : pct >= 50 ? "C" : "D";
    const gradeColor = pct >= 80 ? "#10b981" : pct >= 65 ? "#06b6d4" : pct >= 50 ? "#f59e0b" : "#ef4444";
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="glass rounded-2xl p-4 sm:p-8 space-y-5 sm:space-y-6">
          <div className="text-center">
            <div
              className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center mb-4"
              style={{ background: `${gradeColor}20`, border: `2px solid ${gradeColor}40` }}
            >
              <span className="text-4xl font-bold" style={{ color: gradeColor }}>{grade}</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Assessment Complete!</h2>
            <p className="text-slate-400 mt-1">{score}/{totalMarks} marks · {pct}%</p>
          </div>

          <div className="progress-track" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${pct}%`, background: gradeColor }} />
          </div>

          <div
            className="rounded-xl p-5 space-y-3"
            style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}
          >
            <h3 className="font-semibold text-white text-sm">AI Tutor Feedback</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{getFeedback(activityId, pct)}</p>
          </div>

          <div className="space-y-2">
            {questions.filter((q) => q.type === "mcq").map((q, i) => {
              const correct = answers[q.id] === q.correct;
              return (
                <div
                  key={q.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: correct ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)" }}
                >
                  {correct
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                  <span className="text-sm text-slate-300 flex-1 truncate">Q{i + 1}: {q.prompt}</span>
                  <span className="text-xs font-medium" style={{ color: correct ? "#10b981" : "#ef4444" }}>
                    {correct ? `+${q.marks}` : "0"}/{q.marks}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Link href={`/learn/${activityId}`} className="btn-ghost flex-1 text-center">
              Review Chapter
            </Link>
            <button
              onClick={() => router.push("/dashboard")}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <span className="text-slate-400 text-sm">Question {current + 1} of {questions.length}</span>
        <div
          className="flex items-center gap-2 text-sm glass px-3 py-1.5 rounded-xl"
          style={{ color: timeLeft < 300 ? "#ef4444" : "#94a3b8" }}
        >
          <Clock className="w-4 h-4" />
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>
      </div>

      <div className="flex gap-1.5 mb-6">
        {questions.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all"
            style={{
              background:
                i < current
                  ? "linear-gradient(90deg,#7c3aed,#2563eb)"
                  : i === current
                  ? "#7c3aed"
                  : "rgba(255,255,255,0.1)",
            }}
          />
        ))}
      </div>

      <div className="glass rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="text-xs px-2 py-0.5 rounded-full text-purple-300"
            style={{ background: "rgba(124,58,237,0.2)" }}
          >
            {q.type === "mcq" ? "Multiple Choice" : "Short Answer"}
          </span>
          <span className="text-xs text-slate-500">{q.marks} mark{q.marks > 1 ? "s" : ""}</span>
        </div>
        <h2 className="text-white font-semibold text-base leading-relaxed mb-6">{q.prompt}</h2>

        {q.type === "mcq" ? (
          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const selected = answers[q.id] === i;
              return (
                <button
                  key={i}
                  onClick={() => selectOption(i)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl text-sm transition-all border",
                    selected
                      ? "border-purple-500 bg-purple-500/15 text-white"
                      : "border-white/8 text-slate-300 hover:border-white/16 hover:bg-white/4"
                  )}
                >
                  <span className="font-medium mr-3 text-slate-500">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <textarea
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Write your detailed answer here. Show all steps and reasoning…"
            rows={6}
            className="input-base resize-none"
          />
        )}
      </div>

      <button
        onClick={next}
        disabled={q.type === "mcq" ? answers[q.id] === undefined : !textAnswer.trim()}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
      >
        {current === questions.length - 1 ? "Submit Assessment" : "Next Question"}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
