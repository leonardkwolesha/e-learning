import { supabase } from './supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(`${API_URL}/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    },
  });

  const json = await response.json();
  if (json.error) throw new Error(json.error);
  return json.data as T;
}

export const authApi = {
  register: (email: string, password: string) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

export const onboardingApi = {
  saveProfile: (profile: object) =>
    request('/onboarding/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    }),
  getDiagnosticQuestions: (subject: string, grade: string) =>
    request(`/onboarding/diagnostic/questions?subject=${encodeURIComponent(subject)}&grade=${encodeURIComponent(grade)}`),
  submitDiagnostic: (subject: string, answers: object) =>
    request('/onboarding/diagnostic', {
      method: 'POST',
      body: JSON.stringify({ subject, answers }),
    }),
};

export const curriculumApi = {
  generate: (studentId: string, subject: string) =>
    request('/curriculum/generate', {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId, subject }),
    }),
  get: (curriculumId: string) =>
    request(`/curriculum/${curriculumId}`),
  getChapters: (curriculumId: string) =>
    request(`/curriculum/${curriculumId}/chapters`),
};

export const contentApi = {
  generate: (chapterId: string) =>
    request(`/content/generate/${chapterId}`, { method: 'POST' }),
  get: (chapterId: string) =>
    request(`/content/${chapterId}`),
};

export const tutorApi = {
  sendMessage: (sessionId: string, message: string, chapterId?: string) =>
    request('/tutor/message', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, message, chapter_id: chapterId }),
    }),
  getHistory: (sessionId: string) =>
    request(`/tutor/history/${sessionId}`),
};

export const assessmentApi = {
  generate: (chapterId: string) =>
    request(`/assessment/generate/${chapterId}`, { method: 'POST' }),
  submit: (activityId: string, answers: object) =>
    request(`/assessment/submit/${activityId}`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),
  getResults: (activityId: string) =>
    request(`/assessment/results/${activityId}`),
};

export const analyticsApi = {
  getStudentAnalytics: (studentId: string) =>
    request(`/analytics/student/${studentId}`),
};

export const recommendApi = {
  getNext: (studentId: string) =>
    request(`/recommend/next/${studentId}`),
};
