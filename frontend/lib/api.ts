const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "API error");
  return json.data as T;
}

// ─── Auth ──────────────────────────────────────────────────────
export const authApi = {
  register: (email: string, password: string, name: string) =>
    request("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),
  login: (email: string, password: string) =>
    request("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};

// ─── Onboarding ────────────────────────────────────────────────
export const onboardingApi = {
  saveProfile: (data: Record<string, unknown>) =>
    request("/api/v1/onboarding/profile", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  submitDiagnostic: (data: Record<string, unknown>) =>
    request("/api/v1/onboarding/diagnostic", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Curriculum ────────────────────────────────────────────────
export const curriculumApi = {
  generate: (studentId: string, subject: string) =>
    request("/api/v1/curriculum/generate", {
      method: "POST",
      body: JSON.stringify({ student_id: studentId, subject }),
    }),
  get: (id: string) => request(`/api/v1/curriculum/${id}`),
  getChapters: (id: string) => request(`/api/v1/curriculum/${id}/chapters`),
};

// ─── Content ───────────────────────────────────────────────────
export const contentApi = {
  generate: (chapterId: string) =>
    request(`/api/v1/content/generate/${chapterId}`, { method: "POST" }),
  get: (chapterId: string) => request(`/api/v1/content/${chapterId}`),
};

// ─── Tutor ─────────────────────────────────────────────────────
export const tutorApi = {
  message: (sessionId: string, message: string, chapterId: string) =>
    request("/api/v1/tutor/message", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, message, chapter_id: chapterId }),
    }),
};

// ─── Assessment ────────────────────────────────────────────────
export const assessmentApi = {
  generate: (chapterId: string) =>
    request(`/api/v1/assessment/generate/${chapterId}`, { method: "POST" }),
  submit: (activityId: string, answers: Record<string, string>) =>
    request(`/api/v1/assessment/submit/${activityId}`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),
};

// ─── Analytics ─────────────────────────────────────────────────
export const analyticsApi = {
  getStudentAnalytics: (studentId: string) =>
    request(`/api/v1/analytics/student/${studentId}`),
  getRecommendations: (studentId: string) =>
    request(`/api/v1/recommend/next/${studentId}`),
};
