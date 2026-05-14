import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Dimensions, Pressable, Modal,
} from 'react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../theme/colors';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { getProgress, getStreak, getAvgScore, getAllSubjectProgress } from '../lib/storage';
import { MainTabParamList, LearnStackParamList } from '../types';

type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'HomeTab'>,
  NativeStackNavigationProp<LearnStackParamList>
>;

const { width } = Dimensions.get('window');

const LEVEL_LABELS: Record<string, string> = {
  'o-level': 'O-Level', 'a-level': 'A-Level', certificate: 'Certificate',
  'ordinary-diploma': 'Ord. Diploma', 'higher-diploma': 'Higher Diploma',
  undergraduate: 'Undergraduate', postgraduate: 'Postgraduate',
};

function StatCard({ icon, value, label, color, bg }: {
  icon: keyof typeof Ionicons.glyphMap; value: string; label: string; color: string; bg: string;
}) {
  return (
    <View style={[statCardStyles.card, { borderColor: color + '25' }]}>
      <View style={[statCardStyles.iconWrap, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={statCardStyles.value}>{value}</Text>
      <Text style={statCardStyles.label} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const statCardStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { fontSize: 18, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  label: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center', fontWeight: '500' },
});

function SubjectCard({ subject, onPress }: { subject: any; onPress: () => void }) {
  const pct = subject.progress || 0;
  return (
    <Pressable
      style={({ pressed }) => [s.subjectCard, pressed && s.subjectCardPressed]}
      onPress={onPress}
    >
      <View style={[s.subjectIconBox, { backgroundColor: subject.color + '18' }]}>
        <Ionicons name={subject.icon as keyof typeof Ionicons.glyphMap} size={24} color={subject.color} />
      </View>
      <Text style={s.subjectName} numberOfLines={2}>{subject.name}</Text>
      <View style={s.subjectBottom}>
        <View style={s.subjectBar}>
          <View style={[s.subjectBarFill, { width: `${pct}%` as any, backgroundColor: subject.color }]} />
        </View>
        <Text style={[s.subjectPct, { color: subject.color }]}>{pct}%</Text>
      </View>
    </Pressable>
  );
}

interface Notification {
  id: string;
  type: 'recommendation' | 'streak' | 'reminder' | 'achievement';
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

function buildNotifications(subjects: any[], streak: number, completedCount: number): Notification[] {
  const notes: Notification[] = [];
  if (subjects[0]) notes.push({
    id: 'rec_0', type: 'recommendation', read: false,
    title: `Start ${subjects[0].name}`,
    body: 'Your AI tutor has prepared a personalised curriculum for you.',
    time: 'Just now', icon: 'sparkles', iconColor: Colors.primary,
  });
  if (subjects[1]) notes.push({
    id: 'rec_1', type: 'recommendation', read: false,
    title: `Continue ${subjects[1].name}`,
    body: 'You\'re 38% through — keep the momentum going!',
    time: '2 min ago', icon: 'play-circle', iconColor: Colors.accent,
  });
  if (streak > 0) notes.push({
    id: 'streak', type: 'streak', read: false,
    title: `${streak}-day streak!`,
    body: 'Amazing consistency. Study today to keep it going.',
    time: '10 min ago', icon: 'flame', iconColor: Colors.warning,
  });
  if (subjects[2]) notes.push({
    id: 'rec_2', type: 'recommendation', read: true,
    title: `New content: ${subjects[2].name}`,
    body: 'Chapter 3 is now available based on your progress.',
    time: '1 hr ago', icon: 'book', iconColor: Colors.success,
  });
  notes.push({
    id: 'reminder', type: 'reminder', read: true,
    title: 'Daily study reminder',
    body: 'You set a goal to study 30 minutes every day.',
    time: '2 hrs ago', icon: 'alarm', iconColor: Colors.secondary,
  });
  if (completedCount > 0) notes.push({
    id: 'achievement', type: 'achievement', read: true,
    title: `${completedCount} topic${completedCount > 1 ? 's' : ''} completed`,
    body: 'Great work! You\'re building real knowledge.',
    time: 'Yesterday', icon: 'trophy', iconColor: '#f59e0b',
  });
  return notes;
}

export default function DashboardScreen() {
  const navigation = useNavigation<NavProp>();
  const { profile, subjects } = useProfile();
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [subjectProgressMap, setSubjectProgressMap] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const loadStats = useCallback(async () => {
    const [s, avg, progress, allProgress] = await Promise.all([
      getStreak(), getAvgScore(), getProgress(), getAllSubjectProgress(),
    ]);
    setStreak(s);
    setAvgScore(avg);
    setTotalMinutes(progress.totalMinutes);
    setCompletedCount(progress.completedTopics.length);
    setSubjectProgressMap(allProgress);
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  useEffect(() => {
    setNotifications(buildNotifications(subjects, streak, completedCount));
  }, [subjects, streak, completedCount]);

  const unreadCount = notifications.filter((n) => !n.read && !readIds.has(n.id)).length;

  const openNotifications = () => setNotifVisible(true);

  const markAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

  const onRefresh = async () => { setRefreshing(true); await loadStats(); setRefreshing(false); };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const userName = profile?.name || user?.email?.split('@')[0] || 'Learner';
  const levelText = profile
    ? (LEVEL_LABELS[profile.level] || profile.level) + (profile.form ? ` · ${profile.form}` : '')
    : '';
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const studyTimeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const totalChapters = (() => {
    const lvl = profile?.level || 'o-level';
    if (lvl === 'o-level' || lvl === 'certificate') return 7;
    if (lvl === 'a-level') return 8;
    return 10;
  })();

  const toProgressPct = (subjectId: string) => {
    const done = subjectProgressMap[subjectId] || 0;
    return totalChapters > 0 ? Math.min(100, Math.round((done / totalChapters) * 100)) : 0;
  };

  const continueItems = subjects.slice(0, 4).map((s) => {
    const done = subjectProgressMap[s.id] || 0;
    const pct = toProgressPct(s.id);
    return {
      ...s,
      progress: pct,
      lastChapter: done > 0 ? `Chapter ${done + 1}` : 'Chapter 1',
      minutesLeft: Math.max(10, (totalChapters - done) * 15),
    };
  });

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <StatusBar style="light" />

      {/* ── Notifications Panel ── */}
      <Modal visible={notifVisible} animationType="slide" transparent onRequestClose={() => setNotifVisible(false)}>
        <View style={nm.overlay}>
          <Pressable style={nm.backdrop} onPress={() => setNotifVisible(false)} />
          <View style={nm.sheet}>
            <View style={nm.handle} />
            <View style={nm.sheetHeader}>
              <View>
                <Text style={nm.sheetTitle}>Notifications</Text>
                {unreadCount > 0 && (
                  <Text style={nm.sheetSub}>{unreadCount} unread</Text>
                )}
              </View>
              {unreadCount > 0 && (
                <TouchableOpacity style={nm.markAllBtn} onPress={markAllRead}>
                  <Text style={nm.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={nm.list}>
              {notifications.map((notif) => {
                const isRead = notif.read || readIds.has(notif.id);
                return (
                  <Pressable
                    key={notif.id}
                    style={({ pressed }) => [nm.item, !isRead && nm.itemUnread, pressed && { opacity: 0.8 }]}
                    onPress={() => {
                      setReadIds((prev) => new Set([...prev, notif.id]));
                      setNotifVisible(false);
                      navigation.navigate('LearnTab');
                    }}
                  >
                    <View style={[nm.itemIcon, { backgroundColor: notif.iconColor + '1e' }]}>
                      <Ionicons name={notif.icon} size={20} color={notif.iconColor} />
                    </View>
                    <View style={nm.itemBody}>
                      <Text style={[nm.itemTitle, isRead && nm.itemTitleRead]}>{notif.title}</Text>
                      <Text style={nm.itemText} numberOfLines={2}>{notif.body}</Text>
                      <Text style={nm.itemTime}>{notif.time}</Text>
                    </View>
                    {!isRead && <View style={nm.unreadDot} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* ── Hero Header ── */}
        <LinearGradient
          colors={['#1e0a4a', '#120a2e', '#0a0a0f']}
          style={s.hero}
        >
          {/* Top row */}
          <View style={s.heroTop}>
            <View style={s.heroLeft}>
              <Text style={s.greeting}>{greeting}</Text>
              <Text style={s.userName} numberOfLines={1}>{userName}</Text>
              {levelText ? (
                <View style={s.levelPill}>
                  <Ionicons name="school" size={11} color={Colors.primaryLight} />
                  <Text style={s.levelPillText}>{levelText}</Text>
                </View>
              ) : null}
            </View>
            <View style={s.heroActions}>
              {/* Notification Bell */}
              <Pressable
                style={({ pressed }) => [s.bellBtn, pressed && { opacity: 0.75 }]}
                onPress={openNotifications}
              >
                <Ionicons name="notifications-outline" size={22} color={Colors.text} />
                {unreadCount > 0 && (
                  <View style={s.bellBadge}>
                    <Text style={s.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </Pressable>

              {/* Avatar */}
              <Pressable
                style={({ pressed }) => [s.avatarWrap, pressed && { opacity: 0.8 }]}
                onPress={() => navigation.navigate('ProfileTab')}
              >
                <LinearGradient colors={['#7c3aed', '#6366f1']} style={s.avatar}>
                  <Text style={s.avatarLetter}>{userName[0]?.toUpperCase() || 'U'}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>

          {/* Stat cards */}
          <View style={s.statsRow}>
            <StatCard icon="flame" value={`${streak}`} label="Day Streak" color={Colors.warning} bg={Colors.warning + '22'} />
            <StatCard icon="checkmark-circle" value={`${completedCount}`} label="Completed" color={Colors.success} bg={Colors.success + '22'} />
            <StatCard icon="time" value={studyTimeStr} label="Study Time" color={Colors.accent} bg={Colors.accent + '22'} />
            <StatCard icon="star" value={avgScore > 0 ? `${avgScore}%` : '--'} label="Avg Score" color={Colors.primary} bg={Colors.primary + '22'} />
          </View>
        </LinearGradient>

        {/* ── Continue Learning ── */}
        {continueItems.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.sectionTitleRow}>
                <Ionicons name="play-circle" size={18} color={Colors.primary} />
                <Text style={s.sectionTitle}>Continue Learning</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('LearnTab')}>
                <Text style={s.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hScroll}>
              {continueItems.map((item) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [s.continueCard, { width: width * 0.68 }, pressed && { opacity: 0.9 }]}
                  onPress={() => navigation.navigate('LearnTab')}
                >
                  <LinearGradient
                    colors={[item.color, item.color + 'aa']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={s.continueCardInner}
                  >
                    {/* top row */}
                    <View style={s.cCardTop}>
                      <View style={s.cCardIcon}>
                        <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={20} color="#fff" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.cCardSubject} numberOfLines={1}>{item.name}</Text>
                        <Text style={s.cCardChapter}>{item.lastChapter}</Text>
                      </View>
                      <View style={s.cCardPctBadge}>
                        <Text style={s.cCardPctText}>{item.progress}%</Text>
                      </View>
                    </View>

                    {/* progress bar */}
                    <View style={s.cCardBarTrack}>
                      <View style={[s.cCardBarFill, { width: `${item.progress}%` as any }]} />
                    </View>

                    {/* footer */}
                    <View style={s.cCardFooter}>
                      <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.75)" />
                      <Text style={s.cCardTime}>{item.minutesLeft} min left</Text>
                      <View style={{ flex: 1 }} />
                      <View style={s.cCardResume}>
                        <Text style={s.cCardResumeText}>Resume</Text>
                        <Ionicons name="arrow-forward" size={12} color="#fff" />
                      </View>
                    </View>
                  </LinearGradient>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── My Subjects ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={s.sectionTitleRow}>
              <Ionicons name="grid" size={17} color={Colors.accent} />
              <Text style={s.sectionTitle}>My Subjects</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('LearnTab')}>
              <Text style={s.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={s.subjectsGrid}>
            {subjects.slice(0, 6).map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={{ ...subject, progress: toProgressPct(subject.id) }}
                onPress={() => navigation.navigate('LearnTab')}
              />
            ))}
          </View>
        </View>

        {/* ── AI Recommendations ── */}
        <View style={[s.section, { marginBottom: 104 }]}>
          <View style={s.sectionHeader}>
            <View style={s.sectionTitleRow}>
              <Ionicons name="sparkles" size={17} color="#f59e0b" />
              <Text style={s.sectionTitle}>AI Picks for You</Text>
            </View>
          </View>
          <View style={s.recList}>
            {subjects.slice(0, 3).map((subject, i) => {
              const reasons = [
                'Continue where you left off',
                'Builds on your recent progress',
                'Strengthen your weak areas',
              ];
              const badges = [
                { label: 'In Progress', color: Colors.primary },
                { label: 'Recommended', color: Colors.success },
                { label: 'Review', color: Colors.warning },
              ];
              return (
                <Pressable
                  key={subject.id + '_rec'}
                  style={({ pressed }) => [s.recCard, pressed && { opacity: 0.85 }]}
                  onPress={() => navigation.navigate('LearnTab')}
                >
                  <View style={[s.recIconBox, { backgroundColor: subject.color + '18' }]}>
                    <Ionicons name={subject.icon as keyof typeof Ionicons.glyphMap} size={22} color={subject.color} />
                  </View>
                  <View style={s.recBody}>
                    <Text style={s.recTitle} numberOfLines={1}>{subject.name}</Text>
                    <Text style={s.recReason}>{reasons[i]}</Text>
                  </View>
                  <View style={[s.recBadge, { backgroundColor: badges[i].color + '1a' }]}>
                    <Text style={[s.recBadgeText, { color: badges[i].color }]}>{badges[i].label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={15} color={Colors.textMuted} style={{ marginLeft: 6 }} />
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  hero: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 },
  heroLeft: { flex: 1, marginRight: 12 },
  heroActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bellBtn: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: Colors.error,
    minWidth: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2, borderColor: '#1e0a4a',
  },
  bellBadgeText: { fontSize: 9, fontWeight: '900', color: '#fff' },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: '500', marginBottom: 2 },
  userName: { fontSize: 24, fontWeight: '800', color: Colors.text, letterSpacing: -0.5, marginBottom: 8 },
  levelPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(124,58,237,0.18)', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 10, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(167,139,250,0.25)',
  },
  levelPillText: { fontSize: 11, color: Colors.primaryLight, fontWeight: '700' },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 48, height: 48, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 8,
  },
  avatarLetter: { fontSize: 20, fontWeight: '900', color: '#fff' },
  statsRow: { flexDirection: 'row', gap: 8 },

  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  seeAll: { fontSize: 13, color: Colors.primaryLight, fontWeight: '600' },
  hScroll: { paddingRight: 20, gap: 14 },

  continueCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  continueCardInner: { padding: 18, gap: 0 },
  cCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  cCardIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  cCardSubject: { fontSize: 15, fontWeight: '700', color: '#fff' },
  cCardChapter: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  cCardPctBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  cCardPctText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  cCardBarTrack: {
    height: 5, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3, overflow: 'hidden', marginBottom: 12,
  },
  cCardBarFill: { height: '100%', backgroundColor: '#fff', borderRadius: 3 },
  cCardFooter: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cCardTime: { fontSize: 12, color: 'rgba(255,255,255,0.72)', fontWeight: '500' },
  cCardResume: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
  },
  cCardResumeText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  subjectsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  subjectCard: {
    width: (width - 52) / 2,
    backgroundColor: Colors.bgCard,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
    elevation: 2,
  },
  subjectCardPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  subjectIconBox: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  subjectName: { fontSize: 13, fontWeight: '700', color: Colors.text, lineHeight: 18 },
  subjectBottom: { gap: 5 },
  subjectBar: { height: 5, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  subjectBarFill: { height: '100%', borderRadius: 3 },
  subjectPct: { fontSize: 11, fontWeight: '700' },

  recList: { gap: 10 },
  recCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: 16, padding: 14, gap: 12,
    borderWidth: 1, borderColor: Colors.border,
    elevation: 2,
  },
  recIconBox: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  recBody: { flex: 1 },
  recTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  recReason: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  recBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  recBadgeText: { fontSize: 11, fontWeight: '700' },
});

const nm = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: '#15152a',
    borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12,
    maxHeight: '80%',
    borderWidth: 1, borderColor: Colors.border,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: 16,
  },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
  sheetSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  markAllBtn: {
    backgroundColor: Colors.primaryAlpha,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 10, borderWidth: 1, borderColor: Colors.primary + '30',
    marginTop: 2,
  },
  markAllText: { fontSize: 12, color: Colors.primaryLight, fontWeight: '700' },
  list: { gap: 10, paddingBottom: 8 },
  item: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  itemUnread: {
    borderColor: Colors.primary + '40',
    backgroundColor: Colors.primary + '08',
  },
  itemIcon: {
    width: 44, height: 44, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  itemBody: { flex: 1, gap: 3 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  itemTitleRead: { color: Colors.textSecondary, fontWeight: '500' },
  itemText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
  itemTime: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.primary, marginTop: 4, flexShrink: 0,
  },
});
