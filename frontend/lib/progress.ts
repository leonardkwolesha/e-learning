export interface EduProgress {
  completedTopics: string[];
  studyDays: string[]; // "YYYY-MM-DD"
  totalMinutes: number;
  scores: Record<string, number>; // topicId/chapterId → score %
  notes: Record<string, string>; // chapterId → notes text
  lastActivity?: string;
}

function empty(): EduProgress {
  return { completedTopics: [], studyDays: [], totalMinutes: 0, scores: {}, notes: {} };
}

export function getProgress(): EduProgress {
  if (typeof window === "undefined") return empty();
  try {
    const raw = localStorage.getItem("eduProgress");
    if (raw) return { ...empty(), ...JSON.parse(raw) };
  } catch {}
  return empty();
}

export function saveProgress(p: EduProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem("eduProgress", JSON.stringify(p));
}

export function recordStudyTime(minutes: number) {
  const p = getProgress();
  const today = new Date().toISOString().split("T")[0];
  if (!p.studyDays.includes(today)) p.studyDays.push(today);
  p.totalMinutes += minutes;
  p.lastActivity = new Date().toISOString();
  saveProgress(p);
}

export function markTopicComplete(topicId: string, score: number) {
  const p = getProgress();
  if (!p.completedTopics.includes(topicId)) p.completedTopics.push(topicId);
  p.scores[topicId] = score;
  const today = new Date().toISOString().split("T")[0];
  if (!p.studyDays.includes(today)) p.studyDays.push(today);
  p.lastActivity = new Date().toISOString();
  saveProgress(p);
}

export function saveNote(chapterId: string, text: string) {
  const p = getProgress();
  p.notes[chapterId] = text;
  saveProgress(p);
}

export function getNote(chapterId: string): string {
  return getProgress().notes[chapterId] ?? "";
}

export function getStreak(): number {
  const p = getProgress();
  if (!p.studyDays.length) return 0;
  const sorted = [...p.studyDays].sort().reverse();
  let streak = 0;
  for (const day of sorted) {
    const d = new Date(day);
    d.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today.getTime() - d.getTime()) / 86400000);
    if (diffDays === streak) streak++;
    else break;
  }
  return streak;
}

export function getAvgScore(): number {
  const p = getProgress();
  const scores = Object.values(p.scores);
  if (!scores.length) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function getTotalHours(): number {
  return Math.round(getProgress().totalMinutes / 60);
}

export function exportData() {
  try {
    const data = {
      exported_at: new Date().toISOString(),
      profile: JSON.parse(localStorage.getItem("eduProfile") ?? "{}"),
      preferences: JSON.parse(localStorage.getItem("eduPrefs") ?? "{}"),
      progress: getProgress(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eduai-data-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {}
}
