export interface Chapter {
  id: string;
  curriculum_id: string;
  title: string;
  sequence_order: number;
  estimated_duration_mins: number;
  prerequisites: string[];
  status?: "locked" | "available" | "in_progress" | "completed";
  mastery_score?: number;
}

export interface ContentBlock {
  type: string;
  content?: string;
  level?: number;
  latex?: string;
  display?: boolean;
  spec?: string;
  caption?: string;
  language?: string;
  variant?: string;
  items?: string[];
  ordered?: boolean;
}

export interface WSMessage {
  type: string;
  payload: Record<string, unknown>;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  grade_level: string;
  education_type: "secondary" | "diploma" | "undergrad" | "postgrad";
  background_summary: string;
  learning_style: "visual" | "auditory" | "reading" | "kinesthetic";
  created_at: string;
}

export interface Curriculum {
  id: string;
  student_id: string;
  subject: string;
  total_chapters: number;
  generated_at: string;
  status: "generating" | "ready" | "error";
  chapters: Chapter[];
}

export interface Activity {
  id: string;
  chapter_id: string;
  activity_type: "quiz" | "assignment" | "practice";
  questions: Question[];
  generated_at: string;
}

export interface Question {
  id: string;
  type: "mcq" | "short_answer" | "problem";
  prompt: string;
  options?: string[];
  correct_answer?: string;
  correct_index?: number;
  marks: number;
  explanation?: string;
}

export interface SubmissionResult {
  id: string;
  score: number;
  max_score: number;
  percentage: number;
  ai_feedback: string;
  per_question_feedback: { question_id: string; earned: number; max: number; feedback: string }[];
  submitted_at: string;
}

export interface SentimentResult {
  emotion: string;
  attention_score: number;
  engagement_score: number;
  adaptation_trigger: boolean;
}
