import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Dimensions, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { analyticsApi } from '../lib/api';
import { getProgress, getStreak, getAvgScore, getAllSubjectProgress, Progress } from '../lib/storage';
import { AnalyticsData } from '../types';

const { width } = Dimensions.get('window');
const BAR_MAX_HEIGHT = 80;

function MiniBarChart({ data, label }: { data: { value: number; label: string }[]; label: string }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  return (
    <View style={chartStyles.container}>
      <Text style={chartStyles.title}>{label}</Text>
      <View style={chartStyles.bars}>
        {data.map((d, i) => (
          <View key={i} style={chartStyles.barItem}>
            <View style={chartStyles.barTrack}>
              <LinearGradient
                colors={Colors.gradientPrimary as unknown as string[]}
                style={[chartStyles.barFill, { height: (d.value / maxVal) * BAR_MAX_HEIGHT }]}
              />
            </View>
            <Text style={chartStyles.barLabel}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: { marginVertical: 8 },
  title: { fontSize: 13, color: Colors.textMuted, marginBottom: 12, fontWeight: '600' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: BAR_MAX_HEIGHT + 24 },
  barItem: { flex: 1, alignItems: 'center', gap: 6 },
  barTrack: { flex: 1, justifyContent: 'flex-end', width: '100%' },
  barFill: { borderRadius: 4, width: '100%' },
  barLabel: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },
});

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const { subjects, profile } = useProfile();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [streak, setStreak] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getTotalChapters = (level: string) => {
    if (level === 'o-level' || level === 'certificate') return 7;
    if (level === 'a-level') return 8;
    return 10;
  };

  const load = async () => {
    const [prog, s, avg, allSubjectProgress] = await Promise.all([
      getProgress(), getStreak(), getAvgScore(), getAllSubjectProgress(),
    ]);
    setProgress(prog);
    setStreak(s);
    setAvgScore(avg);

    const totalChaps = getTotalChapters(profile?.level || 'o-level');

    const subjectProgressData = subjects.slice(0, 5).map((subj) => {
      const done = allSubjectProgress[subj.id] || 0;
      return {
        subject: subj.name.split(' ').slice(0, 2).join(' '),
        progress: totalChaps > 0 ? Math.min(100, Math.round((done / totalChaps) * 100)) : 0,
      };
    });

    const weakConceptsData = Object.entries(prog.scores)
      .filter(([, score]) => score < 70)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 5)
      .map(([topicId, score]) => ({
        concept: topicId.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        score,
      }));

    if (user) {
      try {
        const data = await analyticsApi.getStudentAnalytics(user.id) as AnalyticsData;
        setAnalytics({
          ...data,
          subject_progress: subjectProgressData,
          weak_concepts: weakConceptsData.length > 0 ? weakConceptsData : data.weak_concepts,
        });
      } catch {
        setAnalytics({
          total_chapters_completed: prog.completedTopics.length,
          total_study_time_minutes: prog.totalMinutes,
          average_score: avg,
          streak_days: s,
          subject_progress: subjectProgressData,
          weak_concepts: weakConceptsData,
        });
      }
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toISOString().split('T')[0];
    const isStudied = progress?.studyDays.includes(dayStr);
    return {
      label: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()],
      value: isStudied ? 30 : 5,
    };
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const hours = Math.floor((progress?.totalMinutes || 0) / 60);
  const mins = (progress?.totalMinutes || 0) % 60;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <LinearGradient colors={Colors.gradientHero as unknown as string[]} style={styles.header}>
          <Text style={styles.headerTitle}>My Progress</Text>
          <Text style={styles.headerSub}>Track your learning journey</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Stats grid */}
          <View style={styles.statsGrid}>
            {[
              { icon: 'flame', label: 'Day Streak', value: `${streak}`, color: Colors.warning, sub: 'days' },
              { icon: 'checkmark-circle', label: 'Completed', value: `${analytics?.total_chapters_completed || 0}`, color: Colors.success, sub: 'topics' },
              { icon: 'time', label: 'Study Time', value: `${hours}h ${mins}m`, color: Colors.accent, sub: 'total' },
              { icon: 'star', label: 'Avg Score', value: avgScore > 0 ? `${avgScore}%` : '--', color: Colors.primary, sub: 'score' },
            ].map((stat) => (
              <View key={stat.label} style={[styles.statCard, { borderColor: stat.color + '30' }]}>
                <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                  <Ionicons name={stat.icon as keyof typeof Ionicons.glyphMap} size={22} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Weekly activity */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Weekly Study Time</Text>
              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>This Week</Text>
              </View>
            </View>
            <MiniBarChart data={weeklyData} label="Minutes per day" />
          </View>

          {/* Subject progress */}
          {analytics && analytics.subject_progress.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Subject Progress</Text>
              <View style={styles.subjectProgressList}>
                {analytics.subject_progress.map((sp) => (
                  <View key={sp.subject} style={styles.subjectProgressItem}>
                    <View style={styles.subjectProgressTop}>
                      <Text style={styles.subjectProgressName} numberOfLines={1}>{sp.subject}</Text>
                      <Text style={styles.subjectProgressPct}>{sp.progress}%</Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <LinearGradient
                        colors={Colors.gradientPrimary as unknown as string[]}
                        style={[styles.progressFill, { width: `${sp.progress}%` as any }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Weak concepts */}
          {analytics && analytics.weak_concepts.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <Ionicons name="warning-outline" size={18} color={Colors.warning} />
                  <Text style={styles.cardTitle}>Areas to Improve</Text>
                </View>
              </View>
              {analytics.weak_concepts.map((wc) => (
                <View key={wc.concept} style={styles.weakCard}>
                  <View style={styles.weakInfo}>
                    <Text style={styles.weakConcept}>{wc.concept}</Text>
                    <Text style={styles.weakScore}>Score: {wc.score}%</Text>
                  </View>
                  <View style={[styles.weakSeverity, {
                    backgroundColor: wc.score < 50 ? Colors.errorAlpha : Colors.warningAlpha,
                  }]}>
                    <Text style={[styles.weakSeverityText, { color: wc.score < 50 ? Colors.error : Colors.warning }]}>
                      {wc.score < 50 ? 'Needs Work' : 'Review'}
                    </Text>
                  </View>
                </View>
              ))}
              <TouchableOpacity style={styles.reviewAllBtn}>
                <Text style={styles.reviewAllText}>Review all weak topics with AI Tutor</Text>
                <Ionicons name="arrow-forward" size={14} color={Colors.primaryLight} />
              </TouchableOpacity>
            </View>
          )}

          {/* Study streak calendar */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Study Streak</Text>
            <View style={styles.streakInfo}>
              <View style={styles.streakCircle}>
                <Text style={styles.streakNumber}>{streak}</Text>
                <Text style={styles.streakUnit}>days</Text>
              </View>
              <Text style={styles.streakMessage}>
                {streak === 0
                  ? 'Start your streak today! Study for at least 5 minutes.'
                  : streak < 3
                  ? 'Keep it up! You\'re building a great habit.'
                  : streak < 7
                  ? 'Great streak! Keep the momentum going.'
                  : `Amazing! ${streak} days straight — you're on fire! 🔥`}
              </Text>
            </View>

            <View style={styles.calendarRow}>
              {weeklyData.map((d, i) => (
                <View
                  key={i}
                  style={[
                    styles.calendarDay,
                    d.value > 5 && styles.calendarDayActive,
                  ]}
                >
                  <Text style={[styles.calendarDayText, d.value > 5 && styles.calendarDayTextActive]}>
                    {d.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  loadingContainer: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.text },
  headerSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  content: { padding: 16, gap: 16, paddingBottom: 104 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: (width - 44) / 2,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  cardBadge: {
    backgroundColor: Colors.primaryAlpha,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardBadgeText: { fontSize: 11, color: Colors.primaryLight, fontWeight: '600' },
  subjectProgressList: { gap: 16 },
  subjectProgressItem: { gap: 8 },
  subjectProgressTop: { flexDirection: 'row', justifyContent: 'space-between' },
  subjectProgressName: { fontSize: 14, color: Colors.text, fontWeight: '500', flex: 1 },
  subjectProgressPct: { fontSize: 13, color: Colors.primaryLight, fontWeight: '700' },
  progressTrack: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  weakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  weakInfo: { flex: 1 },
  weakConcept: { fontSize: 14, fontWeight: '600', color: Colors.text },
  weakScore: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  weakSeverity: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  weakSeverityText: { fontSize: 11, fontWeight: '700' },
  reviewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 14,
  },
  reviewAllText: { fontSize: 13, color: Colors.primaryLight, fontWeight: '600' },
  streakInfo: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  streakCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.warning + '50',
  },
  streakNumber: { fontSize: 24, fontWeight: '900', color: Colors.warning },
  streakUnit: { fontSize: 10, color: Colors.warning, fontWeight: '600' },
  streakMessage: { flex: 1, fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  calendarRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  calendarDay: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: Colors.bgCardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  calendarDayActive: { backgroundColor: Colors.primary + '30', borderColor: Colors.primary + '60' },
  calendarDayText: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  calendarDayTextActive: { color: Colors.primaryLight },
});
