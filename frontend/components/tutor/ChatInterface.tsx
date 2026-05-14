"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Bot, User, Sparkles, BookOpen, Code2, Zap } from "lucide-react";
import StreamingText from "@/components/shared/StreamingText";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

interface ChatInterfaceProps {
  topic?: string;
  category?: string;
  mode?: "tutor" | "lecture" | "assessment";
  topicColor?: string;
  level?: string;
}

// ── Suggestion pills per category ──────────────────────────────────────────
const CATEGORY_SUGGESTIONS: Record<string, string[]> = {
  Programming: [
    "Explain Python functions with examples",
    "Show me how loops work in code",
    "What is Object-Oriented Programming?",
    "Give me a beginner coding exercise",
  ],
  "OOP & Data Structures": [
    "Explain classes and objects in Python",
    "How do linked lists work?",
    "What is the difference between a stack and a queue?",
    "Walk me through sorting algorithms",
  ],
  "Data Structures & Algorithms": [
    "Explain Big O notation simply",
    "How does binary search work?",
    "Show me a recursive algorithm example",
    "Compare merge sort vs quick sort",
  ],
  Databases: [
    "Explain SQL SELECT with examples",
    "What are primary and foreign keys?",
    "How do database joins work?",
    "What is database normalisation?",
  ],
  Networks: [
    "Explain the OSI model layers",
    "How does TCP/IP work?",
    "What is the difference between HTTP and HTTPS?",
    "How does DNS resolve a domain name?",
  ],
  "Networks & Security": [
    "What are common network security threats?",
    "Explain firewalls and how they protect networks",
    "What is encryption and why is it important?",
    "How does a VPN work?",
  ],
  Hardware: [
    "Explain how a CPU processes instructions",
    "What is RAM and how does it differ from storage?",
    "How does a motherboard connect components?",
    "Explain the fetch-decode-execute cycle",
  ],
  "Operating Systems": [
    "What does an operating system do?",
    "Explain process management and scheduling",
    "What is the difference between a process and a thread?",
    "How does memory management work?",
  ],
  Web: [
    "Explain how HTML structures a webpage",
    "What does CSS do and how do selectors work?",
    "How does JavaScript make pages interactive?",
    "What is the difference between frontend and backend?",
  ],
  "AI & Machine Learning": [
    "What is machine learning in simple terms?",
    "Explain supervised vs unsupervised learning",
    "How does a neural network learn?",
    "What are real-world AI applications?",
  ],
  "Software Engineering": [
    "What is the Software Development Life Cycle?",
    "Explain Agile methodology",
    "What is version control and why use Git?",
    "How do you write good software requirements?",
  ],
  "Cloud & DevOps": [
    "What is cloud computing?",
    "Explain containerisation with Docker",
    "What does a CI/CD pipeline do?",
    "What is Kubernetes used for?",
  ],
  Security: [
    "What are the most common cybersecurity threats?",
    "Explain how encryption algorithms work",
    "What is ethical hacking?",
    "How do you secure a web application?",
  ],
  "Information Systems": [
    "What is an information system?",
    "Explain Management Information Systems (MIS)",
    "What is the role of ICT in organisations?",
    "How are information systems designed?",
  ],
  default: [
    "Explain this topic step by step",
    "Give me a practical example",
    "What are real-world applications?",
    "Quiz me on the key concepts",
  ],
};

// ── Welcome message per mode ───────────────────────────────────────────────
function buildWelcome(topic: string, category: string, mode: string, level: string): string {
  const levelLabel = level === "university" ? "university" : level === "college" ? "college" : "secondary school";

  if (mode === "lecture") {
    return `Welcome to your **${topic}** lecture! I'll walk you through the concepts step by step with clear explanations, real-world examples, and diagrams where needed. Ready to begin your ${levelLabel} CS lesson?`;
  }
  if (mode === "assessment") {
    return `Let's test your understanding of **${topic}**! I'll ask you questions one at a time and give you detailed feedback on each answer — just like a real exam. Type "Start quiz" whenever you're ready!`;
  }
  // tutor (default)
  return `Hi! I'm your AI tutor for **${topic}** (${category}). I can explain concepts, work through examples with you, answer your questions, and adapt to your pace. What would you like to explore first?`;
}

// ── Mock AI reply per category & mode ────────────────────────────────────
function buildMockReply(topic: string, category: string, mode: string): string {
  if (mode === "assessment") {
    return `Here's your first question on **${topic}**:\n\n**Q: ** ${getCategoryQuestion(category)}\n\nTake your time to think, then type your answer. I'll give you thorough feedback once you respond!`;
  }
  if (mode === "lecture") {
    return `**Lesson: ${topic}**\n\n${getCategoryLectureSnippet(category)}\n\nShall I continue with the next section or would you like to ask a question first?`;
  }
  return getCategoryTutorReply(topic, category);
}

function getCategoryQuestion(category: string): string {
  const qs: Record<string, string> = {
    Programming: "Write a Python function that takes a list of numbers and returns the largest value. Explain each line.",
    Databases: "What is the difference between a PRIMARY KEY and a FOREIGN KEY in a relational database? Give an example.",
    Networks: "List and briefly describe the 7 layers of the OSI model.",
    Hardware: "Describe what happens step by step when a CPU executes a single instruction (fetch-decode-execute cycle).",
    "Operating Systems": "What is the difference between a process and a thread? When would you use each?",
    Web: "Explain what happens technically when you type a URL in your browser and press Enter.",
    "AI & Machine Learning": "In your own words, explain the difference between supervised and unsupervised machine learning. Give one example of each.",
    Security: "Name three common cybersecurity attacks and explain how each one can be prevented.",
    default: "Explain the most important concept from this topic in your own words and give a practical example.",
  };
  return qs[category] ?? qs.default;
}

function getCategoryLectureSnippet(category: string): string {
  const snippets: Record<string, string> = {
    Programming: "**1. Variables and Data Types**\nIn Python, a variable stores a value. Python is dynamically typed, meaning you don't declare the type explicitly:\n\n```python\nname = \"Alice\"   # string\nage = 17          # integer\ngpa = 3.8         # float\nis_active = True  # boolean\n```\n\n**2. Functions**\nA function is a reusable block of code:\n\n```python\ndef greet(name):\n    return f\"Hello, {name}!\"\n\nprint(greet(\"Alice\"))  # → Hello, Alice!\n```",
    Databases: "**1. What is a Database?**\nA database is an organised collection of structured data stored electronically. A **Relational Database** organises data into tables (rows and columns).\n\n**2. Core SQL Commands**\n```sql\nSELECT name, age FROM students WHERE grade = 'A';\nINSERT INTO students (name, age) VALUES ('Alice', 17);\nUPDATE students SET grade = 'A' WHERE id = 1;\nDELETE FROM students WHERE id = 5;\n```",
    Networks: "**1. What is a Computer Network?**\nA network connects devices so they can share resources and communicate. Networks are categorised by size: LAN (Local), MAN (Metropolitan), WAN (Wide Area).\n\n**2. The OSI Model**\nThe OSI model has 7 layers:\n1. Physical — cables, signals\n2. Data Link — MAC addresses, frames\n3. Network — IP addresses, routing\n4. Transport — TCP/UDP, reliability\n5. Session — connection management\n6. Presentation — encryption, formatting\n7. Application — HTTP, FTP, DNS",
    default: "Let me break this topic down into clear, manageable sections. We'll start with the foundational concepts and build up to more advanced ideas, using real examples throughout.",
  };
  return snippets[category] ?? snippets.default;
}

function getCategoryTutorReply(topic: string, category: string): string {
  const replies: Record<string, string> = {
    Programming: `Great question about **${topic}**! Let me break it down clearly.\n\nIn programming, we use **variables** to store data, **control structures** (if/else, loops) to make decisions, and **functions** to organise reusable code.\n\nHere's a simple Python example:\n\n\`\`\`python\ndef calculate_average(numbers):\n    total = sum(numbers)\n    return total / len(numbers)\n\nscores = [85, 92, 78, 96]\nprint(calculate_average(scores))  # → 87.75\n\`\`\`\n\nWant me to explain any part in more detail, or give you a practice exercise?`,
    Databases: `Let me explain **${topic}** clearly!\n\nA relational database stores data in **tables**. Each table has columns (fields) and rows (records). Tables relate to each other through **keys**:\n\n- **Primary Key** — uniquely identifies each row (e.g., student_id)\n- **Foreign Key** — links to another table's primary key\n\nExample SQL query:\n\`\`\`sql\nSELECT s.name, c.title\nFROM students s\nJOIN enrollments e ON s.id = e.student_id\nJOIN courses c ON e.course_id = c.id\nWHERE s.grade_level = 'Form 3';\n\`\`\`\n\nShall we practice writing more SQL queries?`,
    Networks: `Let me explain **${topic}** step by step!\n\nComputer networks allow devices to communicate. The **TCP/IP model** is the foundation of the internet:\n\n1. **Application Layer** — where user apps live (HTTP, email, DNS)\n2. **Transport Layer** — ensures reliable delivery (TCP) or fast delivery (UDP)\n3. **Internet Layer** — handles addressing and routing (IP addresses)\n4. **Network Access Layer** — physical transmission (cables, Wi-Fi)\n\nWhen you open a website, your browser sends an HTTP request that travels through all these layers, reaches the server, and the response comes back the same way.\n\nWant to explore any specific layer in more depth?`,
    default: `Great question about **${topic}**! This is a key concept in Computer Science.\n\nLet me give you a clear, structured explanation with examples. The core idea is to understand both the theory and how it applies in practice — that's what the NECTA/NACTE examiners expect.\n\nAs we go through this, feel free to stop me at any point to ask for clarification or a different example. What specific aspect would you like me to focus on first?`,
  };
  return replies[category] ?? replies.default;
}

// ── Component ─────────────────────────────────────────────────────────────
export default function ChatInterface({
  topic = "Computer Science",
  category = "default",
  mode = "tutor",
  topicColor = "#7c3aed",
  level = "secondary",
}: ChatInterfaceProps) {
  const welcomeText = buildWelcome(topic, category, mode, level);

  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: welcomeText },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setMessages([{ id: "1", role: "assistant", content: buildWelcome(topic, category, mode, level) }]);
    setInput("");
  }, [topic, category, mode, level]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const suggestions = CATEGORY_SUGGESTIONS[category] ?? CATEGORY_SUGGESTIONS.default;

  function toggleVoice() {
    const SR =
      (typeof window !== "undefined" &&
        ((window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
          (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition));

    if (!SR) return; // silently no-op in unsupported browsers

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setInput(transcript);

      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal && transcript.trim()) {
        recognition.stop();
        // auto-send after a short pause so the user sees the transcribed text
        setTimeout(() => sendMessage(transcript.trim()), 300);
      }
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  async function sendMessage(text?: string) {
    const content = text ?? input.trim();
    if (!content || loading) return;
    setInput("");

    const userMsg: Message = { id: Date.now().toString(), role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    await new Promise((r) => setTimeout(r, 900));

    const reply = buildMockReply(topic, category, mode);

    setMessages((prev) => [
      ...prev,
      { id: (Date.now() + 1).toString(), role: "assistant", content: reply, streaming: true },
    ]);
    setLoading(false);
  }

  // Mode icon
  const ModeIcon = mode === "lecture" ? BookOpen : mode === "assessment" ? Zap : Code2;

  return (
    <div className="flex flex-col h-full">
      {/* Mode indicator bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
        <ModeIcon className="w-3.5 h-3.5" style={{ color: topicColor }} />
        <span style={{ color: topicColor }}>{mode === "tutor" ? "Tutor Mode" : mode === "lecture" ? "Lecture Mode" : "Assessment Mode"}</span>
        <span className="text-slate-500 mx-1">·</span>
        <span className="text-slate-400 truncate">{topic}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-3", msg.role === "user" && "flex-row-reverse")}>
            {/* Avatar */}
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1",
              msg.role === "assistant" ? "gradient-bg" : "bg-white/10"
            )}>
              {msg.role === "assistant"
                ? <Bot className="w-4 h-4 text-white" />
                : <User className="w-4 h-4 text-white" />}
            </div>

            {/* Bubble */}
            <div className={cn(
              "max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
              msg.role === "assistant" ? "rounded-tl-sm text-slate-200" : "rounded-tr-sm text-white",
            )} style={{
              background: msg.role === "assistant"
                ? "rgba(255,255,255,0.05)"
                : `linear-gradient(135deg, ${topicColor}, #2563eb)`,
              border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.08)" : "none",
              whiteSpace: "pre-wrap",
            }}>
              {msg.streaming
                ? <StreamingText text={msg.content} onDone={() => {
                    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, streaming: false } : m));
                  }} />
                : msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestion pills — shown only on fresh chat */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button key={s} onClick={() => sendMessage(s)}
              className="text-xs px-3 py-1.5 rounded-full transition-all hover:opacity-80"
              style={{
                background: `${topicColor}18`,
                border: `1px solid ${topicColor}35`,
                color: topicColor,
              }}>
              <Sparkles className="w-3 h-3 inline mr-1" />{s}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="p-4 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={`Ask about ${topic}…`}
              rows={1}
              className="input-base resize-none pr-2"
              style={{ minHeight: 44, maxHeight: 120 }}
            />
          </div>
          <button onClick={toggleVoice}
            title={listening ? "Stop recording" : "Voice input"}
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0",
              listening ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse" : "glass text-slate-400 hover:text-white"
            )}>
            {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${topicColor}, #2563eb)` }}>
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
