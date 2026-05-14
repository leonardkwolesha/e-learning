export interface User {
  id: string;
  email: string;
  role?: string;
  created_at?: string;
}

export interface StudentProfile {
  id?: string;
  user_id?: string;
  grade_level: string;
  education_type: string;
  background_summary?: string;
  learning_style?: string;
  created_at?: string;
}

export interface EduProfile {
  educationType: 'secondary' | 'college' | 'university';
  level: string;
  form?: string;
  name?: string;
  learning_style?: string;
  subjects?: string[];
  programType?: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  progress?: number;
  totalChapters?: number;
  completedChapters?: number;
  description?: string;
}

export interface Curriculum {
  id: string;
  student_id: string;
  subject: string;
  total_chapters: number;
  generated_at: string;
  status: string;
}

export interface Chapter {
  id: string;
  curriculum_id: string;
  title: string;
  sequence_order: number;
  estimated_duration_mins: number;
  prerequisites: string[];
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  mastery_score?: number;
}

export interface ContentBlock {
  type: 'heading' | 'text' | 'code' | 'formula' | 'callout' | 'diagram' | 'list';
  level?: number;
  content?: string;
  language?: string;
  variant?: 'info' | 'warning' | 'tip';
  ordered?: boolean;
  items?: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface Activity {
  id: string;
  chapter_id: string;
  activity_type: 'quiz' | 'assignment' | 'practice';
  questions: Question[];
  generated_at: string;
}

export interface Question {
  id: string;
  type: 'mcq' | 'short_answer' | 'problem_solving';
  question: string;
  options?: string[];
  correct_answer?: string;
  marks: number;
}

export interface SubmissionResult {
  score: number;
  max_score: number;
  ai_feedback: string;
  per_question_feedback: {
    question_id: string;
    earned: number;
    max: number;
    feedback: string;
  }[];
}

export interface AnalyticsData {
  total_chapters_completed: number;
  total_study_time_minutes: number;
  average_score: number;
  streak_days: number;
  subject_progress: { subject: string; progress: number }[];
  weak_concepts: { concept: string; score: number }[];
}

export interface Recommendation {
  chapter_id: string;
  chapter_title: string;
  subject: string;
  reason: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_minutes: number;
}

// Navigation param lists
export type AuthStackParamList = {
  Splash: undefined;
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type OnboardingStackParamList = {
  SelectEducation: undefined;
  SelectLevel: { educationType: string };
  Onboarding: { educationType: string; level: string };
  Diagnostic: { educationType: string; level: string; subjects: string[] };
};

export type LearnStackParamList = {
  CurriculumList: undefined;
  Curriculum: { subjectId: string; subjectName: string; color: string };
  Learn: { chapterId: string; chapterTitle: string; curriculumId: string };
  Assessment: { activityId?: string; chapterId: string; chapterTitle: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  LearnTab: undefined;
  TutorTab: undefined;
  AnalyticsTab: undefined;
  ProfileTab: undefined;
};
