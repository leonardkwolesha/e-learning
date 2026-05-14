"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Brain, ChevronRight, ChevronLeft, Check, Sparkles, Eye, Headphones, BookOpen, Hand,
  Code2, Network, Database, Globe, Shield, Cpu, Zap, Cloud, Monitor, GraduationCap, FlaskConical,
  Loader2, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Your Level", "University", "Year & Track", "Learning Style", "Ready"];

const DEGREE_LEVELS: { id: string; label: string; nta: string; desc: string; years: string; color: string; Icon: LucideIcon }[] = [
  { id: "bachelor",         label: "BSc Computer Science",       nta: "NTA Level 8",  desc: "3–4 year undergraduate CS degree",          years: "3–4 Yrs", color: "#7c3aed", Icon: Code2 },
  { id: "bachelor_it",      label: "BSc Information Technology", nta: "NTA Level 8",  desc: "3 year undergraduate IT degree",             years: "3 Yrs",   color: "#2563eb", Icon: Monitor },
  { id: "postgrad_diploma", label: "PGD Computer Science",       nta: "NTA Level 9",  desc: "1 year postgraduate CS diploma (NACTE/TCU)", years: "1 Yr",    color: "#06b6d4", Icon: BookOpen },
  { id: "masters",          label: "MSc Computer Science",       nta: "NTA Level 9",  desc: "1–2 year advanced CS research degree",       years: "1–2 Yrs", color: "#10b981", Icon: GraduationCap },
  { id: "phd",              label: "PhD Computer Science",       nta: "NTA Level 10", desc: "3–5 year doctoral research in CS",           years: "3–5 Yrs", color: "#f59e0b", Icon: FlaskConical },
];

const UNIVERSITIES = [
  { id: "udsm", label: "University of Dar es Salaam", abbr: "UDSM", dept: "Dept. of Computer Science & Engineering" },
  { id: "udom", label: "University of Dodoma", abbr: "UDOM", dept: "School of Informatics" },
  { id: "out", label: "Open University of Tanzania", abbr: "OUT", dept: "Faculty of Science, Technology & Environmental Studies" },
  { id: "must", label: "Mbeya University of Science & Technology", abbr: "MUST", dept: "Faculty of Computing & ICT" },
  { id: "nm_aist", label: "Nelson Mandela African Institution of Science", abbr: "NM-AIST", dept: "School of Computational & Communication Sciences" },
  { id: "ardhi", label: "Ardhi University", abbr: "ARU", dept: "Institute of Human Settlements Studies" },
  { id: "saut", label: "St. Augustine University of Tanzania", abbr: "SAUT", dept: "Faculty of Science & Technology" },
  { id: "duce", label: "Dar es Salaam University College of Education", abbr: "DUCE", dept: "Department of Computer Science" },
  { id: "nia", label: "National Institute of Transport", abbr: "NIT", dept: "ICT & Management" },
  { id: "other", label: "Other Tanzania University", abbr: "Other", dept: "Computer Science / IT Department" },
];

const YEAR_MODULES: Record<string, { year: string; modules: { id: string; title: string; desc: string; icon: React.ElementType; badge: string; badgeColor: string; hours: number }[] }[]> = {
  bachelor: [
    {
      year: "Year 1", modules: [
        { id: "y1m1", title: "Programming Fundamentals (Python & C)", desc: "Variables, loops, functions, arrays, recursion, file I/O", icon: Code2, badge: "Core", badgeColor: "#7c3aed", hours: 14 },
        { id: "y1m2", title: "Discrete Mathematics", desc: "Sets, logic, proofs, combinatorics, graph theory, relations", icon: Zap, badge: "Theory", badgeColor: "#06b6d4", hours: 12 },
        { id: "y1m3", title: "Computer Organization & Architecture", desc: "CPU design, memory hierarchy, instruction sets, I/O systems", icon: Cpu, badge: "Core", badgeColor: "#10b981", hours: 12 },
        { id: "y1m4", title: "Communication Skills & Academic Writing", desc: "Report writing, presentations, research proposals, referencing", icon: BookOpen, badge: "Essential", badgeColor: "#f59e0b", hours: 8 },
        { id: "y1m5", title: "Introduction to Algorithms", desc: "Algorithm design, analysis, time complexity, Big-O notation", icon: Zap, badge: "Core", badgeColor: "#7c3aed", hours: 12 },
        { id: "y1m6", title: "Web Technologies I (HTML5 & CSS3)", desc: "Semantic HTML, responsive CSS, Flexbox, Grid, Bootstrap", icon: Globe, badge: "Practical", badgeColor: "#2563eb", hours: 10 },
      ],
    },
    {
      year: "Year 2", modules: [
        { id: "y2m1", title: "Data Structures & Algorithms", desc: "Trees, heaps, graphs, dynamic programming, algorithm paradigms", icon: Database, badge: "Core", badgeColor: "#7c3aed", hours: 14 },
        { id: "y2m2", title: "OOP with Java (& Design Patterns)", desc: "Classes, inheritance, polymorphism, SOLID, UML, 23 GoF patterns", icon: Code2, badge: "Code", badgeColor: "#10b981", hours: 14 },
        { id: "y2m3", title: "Database Systems", desc: "Relational model, advanced SQL, transactions, ACID, indexing, NoSQL intro", icon: Database, badge: "Core", badgeColor: "#2563eb", hours: 12 },
        { id: "y2m4", title: "Computer Networks", desc: "OSI model, TCP/IP, sockets, DNS, HTTP, routing, network programming", icon: Network, badge: "Core", badgeColor: "#06b6d4", hours: 12 },
        { id: "y2m5", title: "Operating Systems", desc: "Processes, threads, memory management, file systems, scheduling", icon: Cpu, badge: "Core", badgeColor: "#7c3aed", hours: 12 },
        { id: "y2m6", title: "Web Technologies II (JavaScript & React)", desc: "ES6+, DOM, fetch API, React hooks, state management, REST APIs", icon: Globe, badge: "Practical", badgeColor: "#f59e0b", hours: 12 },
      ],
    },
    {
      year: "Year 3", modules: [
        { id: "y3m1", title: "Software Engineering", desc: "Requirements, Agile/Scrum, UML, testing, CI/CD, version control", icon: Zap, badge: "Applied", badgeColor: "#10b981", hours: 12 },
        { id: "y3m2", title: "Artificial Intelligence", desc: "Search algorithms, knowledge representation, planning, expert systems", icon: Brain, badge: "AI", badgeColor: "#ec4899", hours: 12 },
        { id: "y3m3", title: "Human-Computer Interaction", desc: "UX design, usability testing, prototyping, accessibility standards", icon: Globe, badge: "Design", badgeColor: "#06b6d4", hours: 10 },
        { id: "y3m4", title: "Mobile App Development (React Native)", desc: "Cross-platform apps, native APIs, navigation, Expo, app store deployment", icon: Cpu, badge: "Practical", badgeColor: "#f59e0b", hours: 12 },
        { id: "y3m5", title: "Computer Security", desc: "Cryptography, secure coding, penetration testing, OWASP, PKI", icon: Shield, badge: "Security", badgeColor: "#ef4444", hours: 12 },
        { id: "y3m6", title: "Statistics & Probability for CS", desc: "Bayesian inference, distributions, hypothesis testing, regression", icon: Zap, badge: "Theory", badgeColor: "#7c3aed", hours: 10 },
      ],
    },
    {
      year: "Year 4", modules: [
        { id: "y4m1", title: "Machine Learning & Deep Learning", desc: "TensorFlow/PyTorch, CNNs, RNNs, transformers, NLP, model deployment", icon: Brain, badge: "Advanced AI", badgeColor: "#ec4899", hours: 16 },
        { id: "y4m2", title: "Cloud Computing & DevOps", desc: "AWS/Azure, Docker, Kubernetes, Terraform, CI/CD pipelines, microservices", icon: Cloud, badge: "Modern", badgeColor: "#06b6d4", hours: 14 },
        { id: "y4m3", title: "Distributed Systems", desc: "Consensus (Raft/Paxos), CAP theorem, distributed databases, gRPC", icon: Network, badge: "Advanced", badgeColor: "#7c3aed", hours: 12 },
        { id: "y4m4", title: "Final Year Project (Research & Implementation)", desc: "Proposal, literature review, implementation, testing, dissertation & viva", icon: Sparkles, badge: "Capstone", badgeColor: "#f59e0b", hours: 24 },
        { id: "y4m5", title: "IT Ethics & Professional Practice", desc: "IP law, GDPR, codes of conduct, professional responsibility, cybercrime law", icon: Shield, badge: "Essential", badgeColor: "#10b981", hours: 8 },
        { id: "y4m6", title: "Advanced Elective (Big Data / IoT / Blockchain)", desc: "Hadoop, Spark, IoT protocols, smart contracts, Ethereum, data lakes", icon: Zap, badge: "Elective", badgeColor: "#2563eb", hours: 12 },
      ],
    },
  ],
  bachelor_it: [
    {
      year: "Year 1", modules: [
        { id: "y1m1", title: "IT Fundamentals & Computing Concepts", desc: "Computer systems, hardware, software, IT careers and industry overview", icon: Cpu, badge: "Core", badgeColor: "#2563eb", hours: 10 },
        { id: "y1m2", title: "Programming with Python", desc: "Scripting, automation, data manipulation, functions and OOP basics", icon: Code2, badge: "Code", badgeColor: "#7c3aed", hours: 14 },
        { id: "y1m3", title: "Web Design & Development I", desc: "HTML5, CSS3, JavaScript basics, responsive design, Bootstrap", icon: Globe, badge: "Practical", badgeColor: "#06b6d4", hours: 12 },
        { id: "y1m4", title: "Database Concepts & SQL", desc: "Relational databases, ER diagrams, normalization, SQL queries", icon: Database, badge: "Core", badgeColor: "#10b981", hours: 12 },
        { id: "y1m5", title: "Networking Fundamentals", desc: "Network types, OSI/TCP-IP, IP addressing, basic configuration", icon: Network, badge: "Core", badgeColor: "#2563eb", hours: 10 },
        { id: "y1m6", title: "Communication & Professional Skills", desc: "Technical writing, presentation, IT project documentation", icon: BookOpen, badge: "Essential", badgeColor: "#f59e0b", hours: 8 },
      ],
    },
    {
      year: "Year 2", modules: [
        { id: "y2m1", title: "Systems Administration (Linux & Windows)", desc: "Linux CLI, Windows Server, user management, scripting, backup", icon: Cpu, badge: "Practical", badgeColor: "#10b981", hours: 14 },
        { id: "y2m2", title: "Web Development II (Full-Stack)", desc: "PHP/Node.js, MySQL backend, REST APIs, authentication, deployment", icon: Globe, badge: "Practical", badgeColor: "#2563eb", hours: 14 },
        { id: "y2m3", title: "Software Engineering & Agile", desc: "SDLC, Scrum, Git/GitHub, unit testing, code review, sprint planning", icon: Zap, badge: "Applied", badgeColor: "#7c3aed", hours: 12 },
        { id: "y2m4", title: "Network Administration & Security", desc: "Routing, switching, VLANs, VPN, firewall, IDS/IPS", icon: Shield, badge: "Security", badgeColor: "#ef4444", hours: 12 },
        { id: "y2m5", title: "Database Administration", desc: "MySQL/PostgreSQL DBA, indexing, replication, backup, performance", icon: Database, badge: "Core", badgeColor: "#06b6d4", hours: 12 },
        { id: "y2m6", title: "Cybersecurity Fundamentals", desc: "OWASP, penetration testing intro, vulnerability assessment, secure coding", icon: Shield, badge: "Important", badgeColor: "#ef4444", hours: 10 },
      ],
    },
    {
      year: "Year 3", modules: [
        { id: "y3m1", title: "Cloud Infrastructure (AWS/Azure)", desc: "Cloud services, IAM, EC2, RDS, serverless, infrastructure as code", icon: Cloud, badge: "Modern", badgeColor: "#06b6d4", hours: 14 },
        { id: "y3m2", title: "Mobile App Development", desc: "React Native / Android, UI design, device APIs, app deployment", icon: Cpu, badge: "Practical", badgeColor: "#f59e0b", hours: 12 },
        { id: "y3m3", title: "Data Analytics & Business Intelligence", desc: "Python (Pandas), SQL analytics, Power BI, dashboards, reporting", icon: Database, badge: "Analytics", badgeColor: "#10b981", hours: 12 },
        { id: "y3m4", title: "IT Project Management", desc: "PMI, Agile PM, MS Project, budgeting, risk management, PMP basics", icon: Zap, badge: "Management", badgeColor: "#f59e0b", hours: 10 },
        { id: "y3m5", title: "AI Tools for IT Professionals", desc: "Using AI APIs, ChatGPT integration, ML model deployment, automation", icon: Brain, badge: "AI", badgeColor: "#ec4899", hours: 10 },
        { id: "y3m6", title: "Final IT Project", desc: "Requirements, design, implementation, testing, documentation and presentation", icon: Sparkles, badge: "Capstone", badgeColor: "#7c3aed", hours: 18 },
      ],
    },
  ],
  postgrad_diploma: [
    {
      year: "Year 1", modules: [
        { id: "pgd1", title: "Advanced Programming & Software Design",   desc: "Design patterns, clean code, refactoring, advanced OOP in Python/Java",               icon: Code2,     badge: "Core",     badgeColor: "#7c3aed", hours: 14 },
        { id: "pgd2", title: "Advanced Database Systems",                desc: "Query optimisation, distributed databases, NoSQL, PostgreSQL/MySQL DBA tasks",         icon: Database,  badge: "Core",     badgeColor: "#10b981", hours: 12 },
        { id: "pgd3", title: "Computer Networks & Security",             desc: "Advanced TCP/IP, routing protocols, VPN, firewalls, network hardening",                icon: Shield,    badge: "Core",     badgeColor: "#ef4444", hours: 12 },
        { id: "pgd4", title: "Web & Mobile Application Development",    desc: "Full-stack web (React/Node.js), React Native mobile apps, REST APIs, deployment",      icon: Globe,     badge: "Practical",badgeColor: "#2563eb", hours: 14 },
        { id: "pgd5", title: "Systems Analysis & Software Engineering",  desc: "SDLC, Agile/Scrum, UML, requirements engineering, software testing and QA",           icon: Zap,       badge: "Applied",  badgeColor: "#f59e0b", hours: 10 },
        { id: "pgd6", title: "Introduction to AI & Machine Learning",   desc: "ML concepts, Python (scikit-learn), supervised/unsupervised learning, model evaluation",icon: Brain,     badge: "Modern",   badgeColor: "#ec4899", hours: 12 },
        { id: "pgd7", title: "IT Project Management",                    desc: "PMI/Agile PM, stakeholder management, project planning, risk, budgeting basics",       icon: BookOpen,  badge: "Essential",badgeColor: "#06b6d4", hours: 8  },
        { id: "pgd8", title: "Research Project (Dissertation)",          desc: "Proposal, literature review, implementation, testing, dissertation writing & viva",    icon: Sparkles,  badge: "Capstone", badgeColor: "#f59e0b", hours: 20 },
      ],
    },
  ],
  masters: [
    {
      year: "Year 1", modules: [
        { id: "m1m1", title: "Advanced Algorithms & Complexity", desc: "NP-completeness, approximation algorithms, randomized algorithms, complexity classes", icon: Zap, badge: "Advanced", badgeColor: "#7c3aed", hours: 16 },
        { id: "m1m2", title: "Machine Learning & AI Research", desc: "Deep learning, reinforcement learning, GANs, research methodology in ML", icon: Brain, badge: "Research", badgeColor: "#ec4899", hours: 16 },
        { id: "m1m3", title: "Advanced Distributed Systems", desc: "Byzantine fault tolerance, consensus protocols, cloud-native architectures", icon: Network, badge: "Advanced", badgeColor: "#06b6d4", hours: 14 },
        { id: "m1m4", title: "Advanced Database Systems", desc: "Query optimization, distributed databases, NewSQL, column stores, graph databases", icon: Database, badge: "Advanced", badgeColor: "#10b981", hours: 14 },
        { id: "m1m5", title: "Research Methods & Academic Writing", desc: "Systematic reviews, research design, publication writing, ethics", icon: BookOpen, badge: "Research", badgeColor: "#f59e0b", hours: 12 },
        { id: "m1m6", title: "Cybersecurity & Privacy Engineering", desc: "Formal verification, security proofs, differential privacy, zero-knowledge proofs", icon: Shield, badge: "Security", badgeColor: "#ef4444", hours: 14 },
      ],
    },
    {
      year: "Year 2", modules: [
        { id: "m2m1", title: "MSc Research Project / Thesis", desc: "Original research, prototype, evaluation, dissertation and oral defense", icon: Sparkles, badge: "Thesis", badgeColor: "#f59e0b", hours: 30 },
        { id: "m2m2", title: "Advanced Elective I (NLP / Computer Vision)", desc: "Transformer models, BERT, YOLO, image segmentation, generative AI", icon: Brain, badge: "Elective", badgeColor: "#ec4899", hours: 14 },
        { id: "m2m3", title: "Advanced Elective II (Blockchain / IoT)", desc: "Smart contracts, consensus mechanisms, IoT architecture, edge computing", icon: Zap, badge: "Elective", badgeColor: "#2563eb", hours: 14 },
      ],
    },
  ],
  phd: [
    {
      year: "Year 1", modules: [
        { id: "p1m1", title: "Advanced Seminars & Literature Review", desc: "Deep literature synthesis, gap identification, research proposal", icon: BookOpen, badge: "PhD Core", badgeColor: "#f59e0b", hours: 20 },
        { id: "p1m2", title: "Research Methodology (Advanced)", desc: "Experimental design, statistical methods, qualitative research in CS", icon: Zap, badge: "PhD Core", badgeColor: "#7c3aed", hours: 16 },
        { id: "p1m3", title: "Coursework Elective I", desc: "Advanced topic in your research area (ML, Systems, Security, etc.)", icon: Brain, badge: "Elective", badgeColor: "#ec4899", hours: 14 },
      ],
    },
    {
      year: "Year 2", modules: [
        { id: "p2m1", title: "Original Research & Experimentation", desc: "Implementing and evaluating novel contributions to CS knowledge", icon: Sparkles, badge: "Research", badgeColor: "#f59e0b", hours: 40 },
        { id: "p2m2", title: "Conference Paper Submissions", desc: "Writing, submitting and presenting to IEEE/ACM conferences", icon: Globe, badge: "Publication", badgeColor: "#06b6d4", hours: 14 },
      ],
    },
  ],
};

const LEARNING_STYLES = [
  { id: "visual", label: "Visual & Diagrammatic", desc: "System architecture diagrams, data flow charts and visual models", icon: Eye, color: "from-purple-600 to-blue-600" },
  { id: "auditory", label: "Lectures & Discussions", desc: "I prefer academic lectures, seminars and peer discussions", icon: Headphones, color: "from-blue-600 to-cyan-500" },
  { id: "reading", label: "Research & Documentation", desc: "I learn through research papers, textbooks and technical docs", icon: BookOpen, color: "from-cyan-500 to-emerald-500" },
  { id: "kinesthetic", label: "Project-Based Learning", desc: "I learn by building projects, experiments and case studies", icon: Hand, color: "from-emerald-500 to-teal-500" },
];

const GEN_PHASES = ["Analyzing your CS profile…", "Mapping university modules…", "Calibrating to your year…", "Curriculum ready!"];

export default function UniversityOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [degreeLevel, setDegreeLevel] = useState("");
  const [university, setUniversity] = useState("");
  const [year, setYear] = useState("");
  const [learningStyle, setLearningStyle] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genPhase, setGenPhase] = useState(0);
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);

  const selectedDegree = DEGREE_LEVELS.find((d) => d.id === degreeLevel);
  const selectedUni = UNIVERSITIES.find((u) => u.id === university);
  const yearData = YEAR_MODULES[degreeLevel] ?? [];
  const selectedYearData = yearData.find((y) => y.year === year);

  const STUDY_YEARS = yearData.map((y) => y.year);

  function handleDegreeChange(id: string) {
    setDegreeLevel(id);
    setYear("");
  }

  async function finish() {
    setGenerating(true);
    for (let i = 0; i < GEN_PHASES.length; i++) {
      setGenPhase(i);
      await new Promise((r) => setTimeout(r, 900));
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("eduProfile", JSON.stringify({
        educationType: "university",
        level: degreeLevel,
        name,
        university,
        universityLabel: selectedUni?.label ?? "",
        program: degreeLevel,
        programLabel: selectedDegree?.label ?? "",
        year,
        learningStyle,
        subjects: selectedYearData?.modules.map((m) => ({ id: m.id, title: m.title })) ?? [],
      }));
    }
    router.push("/dashboard");
  }

  const canNext = [
    name.trim().length > 0 && degreeLevel !== "",
    university !== "",
    year !== "",
    learningStyle !== "",
  ][step];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="absolute inset-0 radial-purple pointer-events-none" />
      <div className="absolute inset-0 radial-blue pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#2563eb,#06b6d4)" }}>
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg gradient-text">EduAI OS</span>
          <span className="mx-2 text-slate-700">|</span>
          <span className="text-sm font-medium text-slate-400">University · Computer Science</span>
        </div>

        {/* Progress stepper */}
        <div className="flex items-center mb-8 gap-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  i < step ? "text-white shadow-lg" :
                  i === step ? "border-2 border-blue-500 text-blue-400 bg-blue-500/10" :
                  "border border-white/10 text-slate-600"
                )}
                  style={i < step ? { background: "linear-gradient(135deg,#2563eb,#06b6d4)" } : {}}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={cn("text-[10px] font-medium hidden sm:block",
                  i === step ? "text-white" : i < step ? "text-blue-400" : "text-slate-600"
                )}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all duration-500"
                  style={{ background: i < step ? "linear-gradient(90deg,#2563eb,#06b6d4)" : "rgba(255,255,255,0.07)" }} />
              )}
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-4 sm:p-8">

          {/* Step 0 — Name + Degree Level */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-blue-400 mb-3"
                  style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)" }}>
                  <Brain className="w-3 h-3" /> University · Computer Science Programs
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">University CS Setup</h2>
                <p className="text-slate-400 text-sm">Tell us your name and degree level for your personalised AI university curriculum.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Your Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Emmanuel Kimaro" className="input-base" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Degree Level</label>
                <div className="space-y-2">
                  {DEGREE_LEVELS.map(({ id, label, nta, desc, years, color, Icon: DegIcon }) => {
                    const isSelected = degreeLevel === id;
                    return (
                      <button key={id} onClick={() => handleDegreeChange(id)}
                        onMouseEnter={() => setHoveredLevel(id)}
                        onMouseLeave={() => setHoveredLevel(null)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left hover:scale-[1.01]",
                          isSelected ? "border-blue-500 bg-blue-500/8" : "border-white/8 glass glass-hover"
                        )}
                        style={isSelected ? { boxShadow: `0 0 20px ${color}30` } : {}}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `${color}18` }}>
                          <DegIcon className="w-5 h-5" style={{ color }} />
                        </div>
                        <div className="flex-1">
                          <div className={cn("font-semibold text-sm", isSelected ? "text-white" : "text-slate-300")}>{label}</div>
                          <div className="text-xs text-slate-400">{nta} · {desc}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-md font-bold"
                            style={{ background: `${color}20`, color }}>
                            {years}
                          </span>
                          {isSelected && <Check className="w-4 h-4" style={{ color }} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — University */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Your University</h2>
                <p className="text-slate-400 text-sm">Select your institution from accredited Tanzania universities offering CS/IT programs.</p>
              </div>
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {UNIVERSITIES.map(({ id, label, abbr, dept }) => (
                  <button key={id} onClick={() => setUniversity(id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left hover:scale-[1.01]",
                      university === id ? "border-blue-500 bg-blue-500/8" : "border-white/8 glass glass-hover"
                    )}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
                      style={{ background: university === id ? "linear-gradient(135deg,#2563eb,#06b6d4)" : "rgba(255,255,255,0.06)", color: university === id ? "white" : "#94a3b8" }}>
                      {abbr.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn("font-medium text-sm truncate", university === id ? "text-white" : "text-slate-300")}>{label}</div>
                      <div className="text-xs text-slate-500 truncate">{abbr} · {dept}</div>
                    </div>
                    {university === id && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Year of Study + Module Preview */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Year of Study & Modules</h2>
                <p className="text-slate-400 text-sm">Select your current year — your AI tutor will teach the correct modules for your level.</p>
              </div>

              {/* Year selector */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Current Year</label>
                <div className="flex flex-wrap gap-2">
                  {STUDY_YEARS.map((y) => (
                    <button key={y} onClick={() => setYear(y)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02]",
                        year === y ? "text-white" : "glass glass-hover text-slate-300"
                      )}
                      style={year === y ? { background: "linear-gradient(135deg,#2563eb,#06b6d4)" } : {}}>
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modules for selected year */}
              {selectedYearData && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)" }}>
                    <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-sm text-blue-300">
                      <strong>{selectedYearData.modules.length} modules</strong> for {year} — AI-taught with code, theory and assessments
                    </span>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto pr-1 space-y-2">
                    {selectedYearData.modules.map(({ id, title, desc, icon: Icon, badge, badgeColor, hours }) => (
                      <div key={id} className="flex items-center gap-3 p-3.5 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: `${badgeColor}15` }}>
                          <Icon className="w-4 h-4" style={{ color: badgeColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-xs">{title}</span>
                            <span className="text-xs px-1 py-0.5 rounded text-[10px] font-medium shrink-0"
                              style={{ background: `${badgeColor}20`, color: badgeColor }}>{badge}</span>
                          </div>
                          <div className="text-xs text-slate-500 truncate mt-0.5">{desc}</div>
                        </div>
                        <span className="text-xs text-slate-500 shrink-0">{hours}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Learning Style */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">How do you learn best?</h2>
                <p className="text-slate-400 text-sm">Your AI tutor adapts content depth, research references and project complexity to your preferred style.</p>
              </div>
              <div className="space-y-3">
                {LEARNING_STYLES.map(({ id, label, desc, icon: Icon, color }) => {
                  const selected = learningStyle === id;
                  return (
                    <button key={id} onClick={() => setLearningStyle(id)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left hover:scale-[1.01]",
                        selected ? "border-blue-500 bg-blue-500/8" : "border-white/8 glass glass-hover"
                      )}>
                      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br", selected ? color : "")}
                        style={!selected ? { background: "rgba(255,255,255,0.06)" } : {}}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{label}</div>
                        <div className="text-sm text-slate-400">{desc}</div>
                      </div>
                      {selected && <Check className="w-5 h-5 text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4 — Preview + Generate */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "linear-gradient(135deg,#2563eb,#06b6d4)", boxShadow: "0 0 30px rgba(37,99,235,0.4)" }}>
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  All set, <span className="gradient-text">{name || "Student"}</span>!
                </h2>
                <p className="text-slate-400 text-sm">Your personalised university CS curriculum</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Degree", value: selectedDegree?.years ?? "—", color: "#2563eb" },
                  { label: "Modules", value: `${selectedYearData?.modules.length ?? 0}`, color: "#7c3aed" },
                  { label: "This Year", value: year.replace("Year ", "Y"), color: "#10b981" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="glass rounded-xl p-4 text-center">
                    <div className="text-xl font-bold mb-0.5" style={{ color }}>{value}</div>
                    <div className="text-xs text-slate-400">{label}</div>
                  </div>
                ))}
              </div>

              <div className="glass rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: selectedDegree ? `${selectedDegree.color}20` : "rgba(255,255,255,0.06)" }}>
                    {selectedDegree && <selectedDegree.Icon className="w-4 h-4" style={{ color: selectedDegree.color }} />}
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Program</div>
                    <div className="text-sm font-semibold text-white">{selectedDegree?.label}</div>
                  </div>
                </div>
                <div className="h-px bg-white/6" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs"
                    style={{ background: "linear-gradient(135deg,#2563eb,#06b6d4)", color: "white" }}>
                    {selectedUni?.abbr?.slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">University</div>
                    <div className="text-sm font-semibold text-white">{selectedUni?.label}</div>
                  </div>
                </div>
                {selectedYearData && (
                  <>
                    <div className="h-px bg-white/6" />
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{year} Modules Preview</div>
                    {selectedYearData.modules.slice(0, 3).map(({ id, title, badge, badgeColor }) => (
                      <div key={id} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: badgeColor }} />
                        <span className="text-sm text-slate-300 flex-1">{title}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                          style={{ background: `${badgeColor}20`, color: badgeColor }}>{badge}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {generating && (
                <div className="flex flex-col items-center gap-3 py-2">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-blue-300 text-sm font-medium">{GEN_PHASES[genPhase]}</p>
                  <div className="flex gap-1.5">
                    {GEN_PHASES.map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full transition-all duration-300"
                        style={{ background: i <= genPhase ? "#2563eb" : "rgba(255,255,255,0.1)" }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 sm:mt-8 pt-5 sm:pt-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={() => step === 0 ? router.push("/select-education") : setStep((s) => s - 1)}
              className="btn-ghost flex items-center gap-1.5 sm:gap-2 text-sm">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep((s) => s + 1)} disabled={!canNext}
                className="btn-primary flex items-center gap-1.5 sm:gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={finish} disabled={generating}
                className="btn-primary flex items-center gap-1.5 sm:gap-2 disabled:opacity-60">
                {generating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Building…</>
                ) : (
                  <><span className="sm:hidden">Generate</span>
                  <span className="hidden sm:inline">Generate My Curriculum</span>
                  <Sparkles className="w-4 h-4" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
