import { Chapter } from '../types';

interface TopicTemplate {
  title: string;
  duration: number;
  description?: string;
}

const TOPICS: Record<string, TopicTemplate[]> = {
  hardware: [
    { title: 'Introduction to Computer Hardware', duration: 30 },
    { title: 'Input Devices & Their Functions', duration: 35 },
    { title: 'Output Devices & Display Technology', duration: 35 },
    { title: 'Secondary Storage Devices', duration: 40 },
    { title: 'System Unit & Internal Components', duration: 45 },
    { title: 'Motherboard, CPU & Processors', duration: 50 },
    { title: 'Memory: RAM, ROM & Cache', duration: 45 },
    { title: 'Peripheral Ports & Connections', duration: 35 },
    { title: 'Hardware Troubleshooting Techniques', duration: 45 },
    { title: 'Preventive Computer Maintenance', duration: 30 },
  ],
  os: [
    { title: 'Introduction to Operating Systems', duration: 30 },
    { title: 'Functions & Types of OS', duration: 35 },
    { title: 'Windows OS Interface & Navigation', duration: 40 },
    { title: 'File & Folder Management', duration: 40 },
    { title: 'Process & Memory Management', duration: 50 },
    { title: 'User Accounts & Permissions', duration: 40 },
    { title: 'Linux/Unix Fundamentals', duration: 55 },
    { title: 'Shell Commands & Scripting', duration: 55 },
    { title: 'OS Installation & Configuration', duration: 60 },
    { title: 'System Performance Monitoring', duration: 40 },
  ],
  python: [
    { title: 'Introduction to Programming & Python', duration: 30 },
    { title: 'Variables, Data Types & Operators', duration: 40 },
    { title: 'Input/Output & String Formatting', duration: 35 },
    { title: 'Conditional Statements (if/elif/else)', duration: 40 },
    { title: 'Loops: for, while & Iteration', duration: 45 },
    { title: 'Functions & Scope', duration: 50 },
    { title: 'Lists, Tuples & Sequences', duration: 45 },
    { title: 'Dictionaries & Sets', duration: 45 },
    { title: 'File Handling & I/O', duration: 50 },
    { title: 'Exception Handling & Debugging', duration: 45 },
    { title: 'Modules & Standard Libraries', duration: 40 },
    { title: 'Mini Project: Build a Real App', duration: 60 },
  ],
  web: [
    { title: 'How the Web Works: HTTP & Browsers', duration: 30 },
    { title: 'HTML5: Structure & Semantic Elements', duration: 45 },
    { title: 'CSS3: Styling & Selectors', duration: 50 },
    { title: 'CSS Flexbox & Grid Layout', duration: 55 },
    { title: 'Responsive Design & Media Queries', duration: 50 },
    { title: 'JavaScript Fundamentals', duration: 60 },
    { title: 'DOM Manipulation & Events', duration: 55 },
    { title: 'Forms, Validation & User Input', duration: 45 },
    { title: 'Fetch API & Working with JSON', duration: 50 },
    { title: 'Intro to React / Vue (Frontend Framework)', duration: 60 },
    { title: 'Version Control with Git', duration: 40 },
    { title: 'Deploying a Web Application', duration: 45 },
  ],
  database: [
    { title: 'Introduction to Databases & DBMS', duration: 35 },
    { title: 'Relational Model & Entity-Relationship Diagrams', duration: 50 },
    { title: 'SQL: SELECT, INSERT, UPDATE, DELETE', duration: 55 },
    { title: 'SQL Joins & Relationships', duration: 55 },
    { title: 'Normalization (1NF, 2NF, 3NF)', duration: 60 },
    { title: 'Indexes, Views & Stored Procedures', duration: 55 },
    { title: 'Transactions & ACID Properties', duration: 50 },
    { title: 'Database Security & Access Control', duration: 45 },
    { title: 'Introduction to NoSQL Databases', duration: 50 },
    { title: 'Database Design Project', duration: 60 },
  ],
  networking: [
    { title: 'Introduction to Computer Networks', duration: 30 },
    { title: 'Network Topologies & Types (LAN, WAN, MAN)', duration: 40 },
    { title: 'OSI Model & TCP/IP Stack', duration: 55 },
    { title: 'IP Addressing & Subnetting', duration: 60 },
    { title: 'Network Devices: Router, Switch, Hub', duration: 45 },
    { title: 'Wireless Networks & Wi-Fi Standards', duration: 45 },
    { title: 'DNS, DHCP & Network Services', duration: 50 },
    { title: 'Network Security & Firewalls', duration: 55 },
    { title: 'Network Troubleshooting & Diagnostics', duration: 50 },
    { title: 'Cloud Networking Fundamentals', duration: 45 },
  ],
  security: [
    { title: 'Introduction to Cybersecurity', duration: 30 },
    { title: 'Types of Threats & Attacks', duration: 45 },
    { title: 'Malware: Viruses, Trojans & Ransomware', duration: 50 },
    { title: 'Authentication & Access Control', duration: 50 },
    { title: 'Cryptography & Encryption Basics', duration: 60 },
    { title: 'Network Security & Firewalls', duration: 55 },
    { title: 'Web Application Security (OWASP)', duration: 60 },
    { title: 'Digital Forensics & Incident Response', duration: 55 },
    { title: 'Security Policies & Compliance', duration: 40 },
    { title: 'Ethical Hacking & Penetration Testing', duration: 60 },
  ],
  ai: [
    { title: 'Introduction to Artificial Intelligence', duration: 35 },
    { title: 'History of AI & Turing Test', duration: 30 },
    { title: 'Search Algorithms: BFS, DFS, A*', duration: 60 },
    { title: 'Machine Learning Concepts & Types', duration: 55 },
    { title: 'Linear Regression & Classification', duration: 60 },
    { title: 'Neural Networks & Deep Learning', duration: 70 },
    { title: 'Natural Language Processing (NLP)', duration: 60 },
    { title: 'Computer Vision Fundamentals', duration: 55 },
    { title: 'AI Ethics & Responsible AI', duration: 40 },
    { title: 'AI Project: Build a Classifier', duration: 75 },
  ],
  algorithms: [
    { title: 'Algorithm Analysis: Big-O Notation', duration: 50 },
    { title: 'Arrays, Linked Lists & Stacks', duration: 55 },
    { title: 'Queues, Trees & Heaps', duration: 60 },
    { title: 'Sorting Algorithms (Bubble, Merge, Quick)', duration: 65 },
    { title: 'Searching Algorithms & Hashing', duration: 55 },
    { title: 'Graphs & Graph Traversal (BFS/DFS)', duration: 65 },
    { title: 'Dynamic Programming', duration: 70 },
    { title: 'Greedy Algorithms', duration: 60 },
    { title: 'Divide & Conquer Strategies', duration: 60 },
    { title: 'Algorithm Design Project', duration: 75 },
  ],
  java: [
    { title: 'Introduction to Java & JVM', duration: 35 },
    { title: 'Classes, Objects & Encapsulation', duration: 50 },
    { title: 'Inheritance & Polymorphism', duration: 55 },
    { title: 'Abstraction & Interfaces', duration: 50 },
    { title: 'Exception Handling in Java', duration: 45 },
    { title: 'Collections Framework (List, Map, Set)', duration: 60 },
    { title: 'File I/O & Streams', duration: 50 },
    { title: 'Generics & Lambda Expressions', duration: 55 },
    { title: 'Multithreading & Concurrency', duration: 65 },
    { title: 'Java Project: Build an OOP Application', duration: 80 },
  ],
  software: [
    { title: 'Software Development Life Cycle (SDLC)', duration: 40 },
    { title: 'Requirements Engineering', duration: 45 },
    { title: 'System Design & Architecture', duration: 55 },
    { title: 'UML Diagrams & Modeling', duration: 55 },
    { title: 'Agile & Scrum Methodology', duration: 50 },
    { title: 'Version Control with Git & GitHub', duration: 45 },
    { title: 'Software Testing: Unit & Integration', duration: 55 },
    { title: 'Clean Code & Design Patterns', duration: 60 },
    { title: 'DevOps & CI/CD Pipelines', duration: 55 },
    { title: 'Project: Complete Software System', duration: 90 },
  ],
  cloud: [
    { title: 'Introduction to Cloud Computing', duration: 35 },
    { title: 'Cloud Service Models (IaaS, PaaS, SaaS)', duration: 45 },
    { title: 'AWS / Azure / GCP Overview', duration: 50 },
    { title: 'Virtual Machines & Containers', duration: 55 },
    { title: 'Docker & Containerization', duration: 60 },
    { title: 'Kubernetes Orchestration', duration: 65 },
    { title: 'Cloud Storage & Databases', duration: 50 },
    { title: 'Serverless Computing & Functions', duration: 55 },
    { title: 'Cloud Security & IAM', duration: 50 },
    { title: 'Cloud Project: Deploy a Full-Stack App', duration: 80 },
  ],
  data: [
    { title: 'Introduction to Data Science', duration: 35 },
    { title: 'Data Collection & Cleaning', duration: 50 },
    { title: 'Exploratory Data Analysis (EDA)', duration: 55 },
    { title: 'Statistics for Data Science', duration: 60 },
    { title: 'Data Visualization with Matplotlib/Seaborn', duration: 55 },
    { title: 'Machine Learning with Scikit-Learn', duration: 65 },
    { title: 'Feature Engineering & Selection', duration: 60 },
    { title: 'Model Evaluation & Tuning', duration: 60 },
    { title: 'Big Data Tools (Pandas, Spark)', duration: 65 },
    { title: 'Capstone: Data Science Project', duration: 90 },
  ],
  mobile: [
    { title: 'Introduction to Mobile Development', duration: 35 },
    { title: 'React Native / Flutter Fundamentals', duration: 55 },
    { title: 'UI Components & Layouts', duration: 55 },
    { title: 'Navigation & Routing', duration: 50 },
    { title: 'State Management', duration: 60 },
    { title: 'APIs & Networking on Mobile', duration: 55 },
    { title: 'Local Storage & Databases', duration: 50 },
    { title: 'Push Notifications & Background Services', duration: 50 },
    { title: 'App Publishing (Play Store / App Store)', duration: 45 },
    { title: 'Mobile Project: Build a Full App', duration: 90 },
  ],
  math: [
    { title: 'Number Systems & Binary Arithmetic', duration: 45 },
    { title: 'Set Theory & Logic Gates', duration: 50 },
    { title: 'Boolean Algebra & Karnaugh Maps', duration: 55 },
    { title: 'Functions & Relations', duration: 50 },
    { title: 'Graph Theory Basics', duration: 55 },
    { title: 'Matrices & Linear Algebra', duration: 60 },
    { title: 'Probability & Statistics', duration: 55 },
    { title: 'Combinatorics & Counting', duration: 50 },
    { title: 'Calculus for Computing', duration: 65 },
    { title: 'Mathematical Problem Solving', duration: 60 },
  ],
  office: [
    { title: 'Microsoft Word: Documents & Formatting', duration: 35 },
    { title: 'Microsoft Word: Tables, Images & Layout', duration: 40 },
    { title: 'Microsoft Excel: Spreadsheet Basics', duration: 40 },
    { title: 'Microsoft Excel: Formulas & Functions', duration: 50 },
    { title: 'Microsoft Excel: Charts & Data Analysis', duration: 50 },
    { title: 'Microsoft PowerPoint: Presentations', duration: 40 },
    { title: 'Microsoft PowerPoint: Animations & Design', duration: 40 },
    { title: 'Microsoft Access: Databases', duration: 50 },
    { title: 'Email, Calendar & Outlook', duration: 35 },
    { title: 'Office Integration & Productivity Tips', duration: 35 },
  ],
  ict: [
    { title: 'Introduction to ICT & Digital Age', duration: 30 },
    { title: 'Computer Systems & Components', duration: 35 },
    { title: 'Operating System Basics', duration: 40 },
    { title: 'Internet & World Wide Web', duration: 35 },
    { title: 'Email, Communication & Collaboration Tools', duration: 35 },
    { title: 'Information Security & Safe Browsing', duration: 40 },
    { title: 'Digital Content Creation', duration: 40 },
    { title: 'ICT in Business & Society', duration: 35 },
    { title: 'E-Commerce & Digital Payments', duration: 35 },
    { title: 'Emerging Technologies: AI, IoT, Blockchain', duration: 40 },
  ],
  graphics: [
    { title: 'Principles of Design & Visual Communication', duration: 35 },
    { title: 'Colour Theory & Typography', duration: 40 },
    { title: 'Raster vs Vector Graphics', duration: 40 },
    { title: 'Adobe Photoshop Fundamentals', duration: 55 },
    { title: 'Photo Editing & Retouching', duration: 50 },
    { title: 'Adobe Illustrator & Vector Art', duration: 55 },
    { title: 'Logo Design & Brand Identity', duration: 55 },
    { title: 'Layout Design for Print & Web', duration: 50 },
    { title: 'Animation Basics', duration: 50 },
    { title: 'Portfolio Project: Design a Brand', duration: 75 },
  ],
  ethics: [
    { title: 'Introduction to Computer Ethics', duration: 30 },
    { title: 'Intellectual Property & Copyright', duration: 35 },
    { title: 'Privacy, Data Protection & GDPR', duration: 40 },
    { title: 'Digital Divide & Access Equity', duration: 35 },
    { title: 'Social Media Ethics & Responsibility', duration: 35 },
    { title: 'Cybercrime & Legal Frameworks', duration: 40 },
    { title: 'Professional Codes of Conduct', duration: 35 },
    { title: 'AI Ethics & Algorithmic Bias', duration: 45 },
    { title: 'Environmental Impact of ICT', duration: 35 },
    { title: 'Case Studies in Technology Ethics', duration: 40 },
  ],
  agile: [
    { title: 'Introduction to Project Management', duration: 35 },
    { title: 'Agile Manifesto & Principles', duration: 35 },
    { title: 'Scrum Framework: Roles & Ceremonies', duration: 50 },
    { title: 'Sprint Planning & Backlogs', duration: 50 },
    { title: 'Kanban & Lean Methodology', duration: 45 },
    { title: 'User Stories & Acceptance Criteria', duration: 45 },
    { title: 'Risk Management in IT Projects', duration: 50 },
    { title: 'Project Estimation & Scheduling', duration: 50 },
    { title: 'Team Leadership & Communication', duration: 40 },
    { title: 'Project Retrospectives & Continuous Improvement', duration: 40 },
  ],
  programming: [
    { title: 'Programming Paradigms Overview', duration: 35 },
    { title: 'Procedural Programming Concepts', duration: 45 },
    { title: 'Object-Oriented Programming Principles', duration: 55 },
    { title: 'Functional Programming Concepts', duration: 50 },
    { title: 'Design Patterns (Creational, Structural)', duration: 60 },
    { title: 'Concurrency & Parallel Programming', duration: 65 },
    { title: 'Memory Management & Pointers', duration: 60 },
    { title: 'Compiler Design & Language Theory', duration: 65 },
    { title: 'Code Optimization & Performance', duration: 55 },
    { title: 'Advanced Programming Project', duration: 80 },
  ],
  research: [
    { title: 'Research Methods & Approaches', duration: 40 },
    { title: 'Literature Review & Citation', duration: 45 },
    { title: 'Quantitative Research Design', duration: 50 },
    { title: 'Qualitative Research Methods', duration: 50 },
    { title: 'Data Collection Instruments', duration: 45 },
    { title: 'Statistical Analysis & SPSS', duration: 55 },
    { title: 'Research Ethics & Plagiarism', duration: 40 },
    { title: 'Academic Writing & Dissertation Structure', duration: 50 },
    { title: 'Research Presentation Skills', duration: 40 },
    { title: 'Final Research Project/Dissertation', duration: 120 },
  ],
};

export function getChaptersForSubject(
  subjectId: string,
  level: string,
  form?: string,
  completedCount = 0,
): Chapter[] {
  const raw = SUBJECT_ID_KEY[subjectId] || subjectId;
  const templates = TOPICS[raw] || TOPICS.ict;

  const difficulty = getDifficulty(level, form);
  const chapterCount = getChapterCount(level);
  const slice = templates.slice(0, chapterCount);

  return slice.map((t, i) => {
    let status: Chapter['status'];
    if (i < completedCount) status = 'completed';
    else if (i === completedCount) status = 'in_progress';
    else if (i <= completedCount + 1) status = 'available';
    else status = 'locked';

    return {
      id: `${subjectId}_ch_${i + 1}`,
      curriculum_id: `${subjectId}_curriculum`,
      title: t.title,
      sequence_order: i + 1,
      estimated_duration_mins: Math.round(t.duration * difficulty),
      prerequisites: i > 0 ? [`${subjectId}_ch_${i}`] : [],
      status,
      mastery_score: status === 'completed' ? Math.floor(Math.random() * 25 + 70) : undefined,
    };
  });
}

function getDifficulty(level: string, form?: string): number {
  if (level === 'postgraduate') return 1.4;
  if (level === 'undergraduate') {
    if (form === 'Year 4') return 1.3;
    if (form === 'Year 3') return 1.2;
    return 1.1;
  }
  if (level === 'higher-diploma') return 1.2;
  if (level === 'ordinary-diploma') return 1.1;
  if (level === 'a-level') return 1.0;
  if (level === 'o-level' && (form === 'Form 3' || form === 'Form 4')) return 0.9;
  return 0.8;
}

function getChapterCount(level: string): number {
  if (level === 'postgraduate') return 10;
  if (level === 'undergraduate') return 10;
  if (level === 'higher-diploma' || level === 'ordinary-diploma') return 10;
  if (level === 'a-level') return 8;
  if (level === 'certificate') return 7;
  return 7;
}

const SUBJECT_ID_KEY: Record<string, string> = {
  'hardware': 'hardware',
  'os': 'os',
  'python': 'python',
  'web': 'web',
  'database': 'database',
  'networking': 'networking',
  'security': 'security',
  'ai': 'ai',
  'algorithms': 'algorithms',
  'java': 'java',
  'software': 'software',
  'cloud': 'cloud',
  'data': 'data',
  'mobile': 'mobile',
  'math': 'math',
  'office': 'office',
  'ict': 'ict',
  'graphics': 'graphics',
  'ethics': 'ethics',
  'agile': 'agile',
  'programming': 'programming',
  'research': 'research',
};
