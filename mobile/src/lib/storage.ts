import AsyncStorage from '@react-native-async-storage/async-storage';
import { EduProfile, Message } from '../types';

const KEYS = {
  EDU_PROFILE: 'eduProfile',
  PROGRESS: 'eduProgress',
  NOTES: 'eduNotes',
  PREFERENCES: 'eduPreferences',
  SUBJECT_PROGRESS: 'eduSubjectProgress',
  CHAT_HISTORY: 'eduChatHistory',
};

export interface Progress {
  completedTopics: string[];
  studyDays: string[];
  totalMinutes: number;
  scores: Record<string, number>;
  lastActivity: string | null;
}

export interface Preferences {
  notifications: boolean;
  sounds: boolean;
  autoPlay: boolean;
}

// ── Profile ──────────────────────────────────────────────────────────────────

export async function saveEduProfile(profile: EduProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.EDU_PROFILE, JSON.stringify(profile));
}

export async function getEduProfile(): Promise<EduProfile | null> {
  const raw = await AsyncStorage.getItem(KEYS.EDU_PROFILE);
  return raw ? JSON.parse(raw) : null;
}

export async function clearEduProfile(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.EDU_PROFILE);
}

// ── Progress ─────────────────────────────────────────────────────────────────

export async function getProgress(): Promise<Progress> {
  const raw = await AsyncStorage.getItem(KEYS.PROGRESS);
  if (!raw) return { completedTopics: [], studyDays: [], totalMinutes: 0, scores: {}, lastActivity: null };
  return JSON.parse(raw);
}

export async function recordStudyTime(minutes: number): Promise<void> {
  const progress = await getProgress();
  const today = new Date().toISOString().split('T')[0];
  progress.totalMinutes += minutes;
  progress.lastActivity = new Date().toISOString();
  if (!progress.studyDays.includes(today)) progress.studyDays.push(today);
  await AsyncStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
}

export async function markTopicComplete(topicId: string, score?: number): Promise<void> {
  const progress = await getProgress();
  if (!progress.completedTopics.includes(topicId)) {
    progress.completedTopics.push(topicId);
  }
  if (score !== undefined) progress.scores[topicId] = score;
  const today = new Date().toISOString().split('T')[0];
  if (!progress.studyDays.includes(today)) progress.studyDays.push(today);
  progress.lastActivity = new Date().toISOString();
  await AsyncStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
}

export async function isTopicComplete(topicId: string): Promise<boolean> {
  const progress = await getProgress();
  return progress.completedTopics.includes(topicId);
}

export async function getStreak(): Promise<number> {
  const progress = await getProgress();
  if (progress.studyDays.length === 0) return 0;
  const sorted = [...progress.studyDays].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  let streak = 0;
  const current = new Date(today);
  for (const day of sorted) {
    const dayStr = current.toISOString().split('T')[0];
    if (day === dayStr) { streak++; current.setDate(current.getDate() - 1); }
    else break;
  }
  return streak;
}

export async function getAvgScore(): Promise<number> {
  const progress = await getProgress();
  const scores = Object.values(progress.scores);
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

// ── Subject progress (per-subject completed chapter count) ───────────────────

export async function saveSubjectProgress(subjectId: string, completedCount: number): Promise<void> {
  const raw = await AsyncStorage.getItem(KEYS.SUBJECT_PROGRESS);
  const map: Record<string, number> = raw ? JSON.parse(raw) : {};
  map[subjectId] = completedCount;
  await AsyncStorage.setItem(KEYS.SUBJECT_PROGRESS, JSON.stringify(map));
}

export async function getSubjectProgress(subjectId: string): Promise<number> {
  const raw = await AsyncStorage.getItem(KEYS.SUBJECT_PROGRESS);
  if (!raw) return 0;
  return JSON.parse(raw)[subjectId] || 0;
}

export async function getAllSubjectProgress(): Promise<Record<string, number>> {
  const raw = await AsyncStorage.getItem(KEYS.SUBJECT_PROGRESS);
  return raw ? JSON.parse(raw) : {};
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export async function saveNote(chapterId: string, note: string): Promise<void> {
  const raw = await AsyncStorage.getItem(KEYS.NOTES);
  const notes = raw ? JSON.parse(raw) : {};
  notes[chapterId] = note;
  await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
}

export async function getNote(chapterId: string): Promise<string> {
  const raw = await AsyncStorage.getItem(KEYS.NOTES);
  if (!raw) return '';
  return JSON.parse(raw)[chapterId] || '';
}

// ── Preferences ──────────────────────────────────────────────────────────────

export async function savePreferences(prefs: Partial<Preferences>): Promise<void> {
  const existing = await getPreferences();
  await AsyncStorage.setItem(KEYS.PREFERENCES, JSON.stringify({ ...existing, ...prefs }));
}

export async function getPreferences(): Promise<Preferences> {
  const raw = await AsyncStorage.getItem(KEYS.PREFERENCES);
  if (!raw) return { notifications: true, sounds: true, autoPlay: false };
  return JSON.parse(raw);
}

// ── Chat history ──────────────────────────────────────────────────────────────

export async function saveChatHistory(sessionId: string, messages: Message[]): Promise<void> {
  const raw = await AsyncStorage.getItem(KEYS.CHAT_HISTORY);
  const all: Record<string, any[]> = raw ? JSON.parse(raw) : {};
  all[sessionId] = messages.slice(-60).map((m) => ({
    ...m,
    timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
  }));
  await AsyncStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(all));
}

export async function getChatHistory(sessionId: string): Promise<Message[]> {
  const raw = await AsyncStorage.getItem(KEYS.CHAT_HISTORY);
  if (!raw) return [];
  const all = JSON.parse(raw);
  const msgs = all[sessionId] || [];
  return msgs.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
}

export async function clearChatHistory(sessionId: string): Promise<void> {
  const raw = await AsyncStorage.getItem(KEYS.CHAT_HISTORY);
  if (!raw) return;
  const all = JSON.parse(raw);
  delete all[sessionId];
  await AsyncStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(all));
}

// ── Clear all ─────────────────────────────────────────────────────────────────

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.EDU_PROFILE, KEYS.PROGRESS, KEYS.NOTES,
    KEYS.PREFERENCES, KEYS.SUBJECT_PROGRESS, KEYS.CHAT_HISTORY,
  ]);
}
