import { Subject } from '../types';
import { Colors } from '../theme/colors';

export const SUBJECT_ICONS: Record<string, string> = {
  hardware: 'hardware-chip-outline',
  os: 'layers-outline',
  programming: 'code-slash-outline',
  web: 'globe-outline',
  database: 'server-outline',
  networking: 'wifi-outline',
  security: 'shield-checkmark-outline',
  ai: 'sparkles-outline',
  data: 'analytics-outline',
  cloud: 'cloud-outline',
  mobile: 'phone-portrait-outline',
  algorithms: 'git-branch-outline',
  software: 'construct-outline',
  ethics: 'people-outline',
  research: 'book-outline',
  math: 'calculator-outline',
  office: 'document-text-outline',
  graphics: 'color-palette-outline',
  ict: 'desktop-outline',
  java: 'cafe-outline',
  python: 'terminal-outline',
  agile: 'refresh-circle-outline',
};

function makeSubject(id: string, name: string, colorIndex: number, desc?: string): Subject {
  return {
    id,
    name,
    icon: SUBJECT_ICONS[id] || 'book-outline',
    color: Colors.subjectColors[colorIndex % Colors.subjectColors.length],
    progress: 0,
    totalChapters: 12,
    completedChapters: 0,
    description: desc || name,
  };
}

export const SECONDARY_SUBJECTS: Record<string, Record<string, Subject[]>> = {
  'o-level': {
    'Form 1': [
      makeSubject('hardware', 'Computer Hardware & Maintenance', 0),
      makeSubject('os', 'Operating Systems', 1),
      makeSubject('office', 'Microsoft Office Suite', 2),
      makeSubject('web', 'Internet & Email', 3),
      makeSubject('python', 'Introduction to Programming', 4),
      makeSubject('graphics', 'Computer Graphics & Design', 5),
      makeSubject('ethics', 'ICT & Society', 6),
    ],
    'Form 2': [
      makeSubject('database', 'Database Fundamentals', 0),
      makeSubject('python', 'Python Programming', 1),
      makeSubject('web', 'HTML & CSS', 2),
      makeSubject('networking', 'Network Fundamentals', 3),
      makeSubject('security', 'Cybersecurity Intro', 4),
      makeSubject('office', 'Advanced Spreadsheets', 5),
      makeSubject('ict', 'Digital Literacy', 6),
    ],
    'Form 3': [
      makeSubject('python', 'Advanced Python', 0),
      makeSubject('database', 'Database Systems', 1),
      makeSubject('web', 'Web Design & Development', 2),
      makeSubject('networking', 'Networking & Protocols', 3),
      makeSubject('programming', 'OOP Introduction', 4),
      makeSubject('ethics', 'Computer Ethics & Law', 5),
      makeSubject('ict', 'ICT Projects', 6),
    ],
    'Form 4': [
      makeSubject('programming', 'Advanced Programming', 0),
      makeSubject('software', 'Software Development', 1),
      makeSubject('networking', 'Network Administration', 2),
      makeSubject('security', 'Cybersecurity & Encryption', 3),
      makeSubject('database', 'Data Management Systems', 4),
      makeSubject('web', 'Web Applications', 5),
      makeSubject('ict', 'NECTA Exam Preparation', 6),
    ],
  },
  'a-level': {
    'Form 5': [
      makeSubject('hardware', 'Computer Architecture', 0),
      makeSubject('algorithms', 'Data Structures & Algorithms', 1),
      makeSubject('java', 'OOP with Java', 2),
      makeSubject('database', 'Database Systems', 3),
      makeSubject('networking', 'Network Engineering', 4),
      makeSubject('software', 'Software Engineering', 5),
      makeSubject('security', 'System Security', 6),
      makeSubject('research', 'Research Methods', 7),
    ],
    'Form 6': [
      makeSubject('algorithms', 'Advanced Algorithms', 0),
      makeSubject('programming', 'Compiler Design', 1),
      makeSubject('ai', 'Artificial Intelligence', 2),
      makeSubject('networking', 'Advanced Networks', 3),
      makeSubject('security', 'Cryptography', 4),
      makeSubject('software', 'Distributed Systems', 5),
      makeSubject('ict', 'Final Year Project', 6),
      makeSubject('ethics', 'Professional Ethics', 7),
    ],
  },
};

export const COLLEGE_SUBJECTS: Record<string, Subject[]> = {
  certificate: [
    makeSubject('ict', 'ICT Fundamentals', 0),
    makeSubject('hardware', 'Computer Hardware', 1),
    makeSubject('office', 'Office Applications', 2),
    makeSubject('python', 'Python Programming', 3),
    makeSubject('web', 'Web Development', 4),
    makeSubject('networking', 'Networking Basics', 5),
    makeSubject('database', 'Database Management', 6),
  ],
  'ordinary-diploma': [
    makeSubject('java', 'OOP with Java', 0),
    makeSubject('database', 'Database Administration', 1),
    makeSubject('networking', 'Network Administration', 2),
    makeSubject('web', 'Full-Stack Web Development', 3),
    makeSubject('software', 'Systems Analysis & Design', 4),
    makeSubject('agile', 'Software Project Management', 5),
    makeSubject('mobile', 'Mobile Development', 6),
    makeSubject('security', 'Cybersecurity', 7),
  ],
  'higher-diploma': [
    makeSubject('software', 'Advanced Software Engineering', 0),
    makeSubject('cloud', 'Cloud Computing', 1),
    makeSubject('data', 'Data Science', 2),
    makeSubject('ai', 'Machine Learning', 3),
    makeSubject('security', 'Network Security', 4),
    makeSubject('agile', 'IT Project Management', 5),
    makeSubject('ict', 'Enterprise Systems', 6),
    makeSubject('research', 'Research Methods', 7),
  ],
};

export const UNIVERSITY_SUBJECTS: Record<string, Record<string, Subject[]>> = {
  undergraduate: {
    'Year 1': [
      makeSubject('python', 'Introduction to Programming', 0),
      makeSubject('math', 'Mathematics for Computing', 1),
      makeSubject('hardware', 'Computer Architecture', 2),
      makeSubject('web', 'Web Fundamentals', 3),
      makeSubject('math', 'Discrete Mathematics', 4),
      makeSubject('ethics', 'Communication Skills', 5),
    ],
    'Year 2': [
      makeSubject('algorithms', 'Data Structures & Algorithms', 0),
      makeSubject('database', 'Database Systems', 1),
      makeSubject('java', 'Object-Oriented Programming', 2),
      makeSubject('os', 'Operating Systems', 3),
      makeSubject('math', 'Statistics & Probability', 4),
      makeSubject('ethics', 'Technical Writing', 5),
    ],
    'Year 3': [
      makeSubject('software', 'Software Engineering', 0),
      makeSubject('ai', 'Artificial Intelligence', 1),
      makeSubject('networking', 'Networks & Security', 2),
      makeSubject('database', 'Advanced Databases', 3),
      makeSubject('ai', 'Machine Learning', 4),
      makeSubject('ethics', 'Professional Ethics', 5),
    ],
    'Year 4': [
      makeSubject('cloud', 'Cloud Computing', 0),
      makeSubject('software', 'Distributed Systems', 1),
      makeSubject('data', 'Big Data Analytics', 2),
      makeSubject('security', 'Advanced Security', 3),
      makeSubject('research', 'Research Project', 4),
      makeSubject('ict', 'Entrepreneurship & Innovation', 5),
    ],
  },
  postgraduate: {
    'MSc Year 1': [
      makeSubject('algorithms', 'Advanced Algorithms', 0),
      makeSubject('ai', 'Machine Learning & Deep Learning', 1),
      makeSubject('software', 'Distributed Systems', 2),
      makeSubject('research', 'Research Methods', 3),
      makeSubject('data', 'Advanced Data Engineering', 4),
      makeSubject('security', 'Advanced Cybersecurity', 5),
    ],
    'MSc Year 2': [
      makeSubject('research', 'Dissertation', 0),
      makeSubject('ai', 'Specialization: AI/ML', 1),
      makeSubject('cloud', 'Specialization: Cloud & DevOps', 2),
      makeSubject('security', 'Specialization: Security', 3),
      makeSubject('data', 'Specialization: Data Science', 4),
    ],
  },
};

export function getSubjectsForProfile(
  educationType: string,
  level: string,
  form?: string,
): Subject[] {
  if (educationType === 'secondary') {
    const levelKey = level === 'o-level' ? 'o-level' : 'a-level';
    const formKey = form || 'Form 1';
    return SECONDARY_SUBJECTS[levelKey]?.[formKey] || [];
  }
  if (educationType === 'college') {
    return COLLEGE_SUBJECTS[level] || [];
  }
  if (educationType === 'university') {
    const typeKey = level === 'postgraduate' ? 'postgraduate' : 'undergraduate';
    const yearKey = form || 'Year 1';
    return UNIVERSITY_SUBJECTS[typeKey]?.[yearKey] || [];
  }
  return [];
}
