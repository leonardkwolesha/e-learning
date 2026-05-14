import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, FlatList, Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../theme/colors';
import { LearnStackParamList, Chapter, Subject } from '../types';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { getChaptersForSubject } from '../data/topics';
import { curriculumApi } from '../lib/api';

type NavProp = NativeStackNavigationProp<LearnStackParamList>;

const STATUS_CONFIG = {
  completed: { icon: 'checkmark-circle' as const, color: Colors.success },
  in_progress: { icon: 'play-circle' as const, color: Colors.primary },
  available: { icon: 'ellipse-outline' as const, color: Colors.textSecondary },
  locked: { icon: 'lock-closed' as const, color: Colors.textDisabled },
};

const STATUS_LABEL = {
  completed: 'Done', in_progress: 'In Progress', available: 'Start', locked: 'Locked',
};

export default function CurriculumScreen() {
  const navigation = useNavigation<NavProp>();
  const { subjects, profile } = useProfile();
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(subjects[0] || null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [curriculumId, setCurriculumId] = useState<string | null>(null);

  useEffect(() => {
    if (subjects.length && !selectedSubject) setSelectedSubject(subjects[0]);
  }, [subjects]);

  useEffect(() => {
    if (selectedSubject) loadChapters(selectedSubject);
  }, [selectedSubject]);

  const loadChapters = async (subject: Subject) => {
    setLoading(true);
    try {
      const data = await curriculumApi.generate(user?.id || '', subject.name) as { id: string };
      setCurriculumId(data.id);
      const chapData = await curriculumApi.getChapters(data.id) as Chapter[];
      setChapters(chapData);
    } catch {
      const localChapters = getChaptersForSubject(
        subject.id,
        profile?.level || 'o-level',
        profile?.form,
      );
      setCurriculumId(`${subject.id}_local`);
      setChapters(localChapters);
    } finally {
      setLoading(false);
    }
  };

  const openChapter = (chapter: Chapter) => {
    if (chapter.status === 'locked') return;
    navigation.navigate('Learn', {
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      curriculumId: curriculumId || 'local',
    });
  };

  const completed = chapters.filter((c) => c.status === 'completed').length;
  const progressPct = chapters.length ? Math.round((completed / chapters.length) * 100) : 0;
  const totalMins = chapters.reduce((sum, c) => sum + c.estimated_duration_mins, 0);
  const totalHours = Math.floor(totalMins / 60);
  const remMins = totalMins % 60;

  const renderChapter = ({ item, index }: { item: Chapter; index: number }) => {
    const cfg = STATUS_CONFIG[item.status];
    const isLocked = item.status === 'locked';
    const isDone = item.status === 'completed';
    const isCurrent = item.status === 'in_progress';

    return (
      <View style={chapterStyles.wrapper}>
        {/* Timeline connector */}
        <View style={chapterStyles.timelineCol}>
          <View style={[
            chapterStyles.dot,
            isDone && chapterStyles.dotDone,
            isCurrent && chapterStyles.dotCurrent,
            isLocked && chapterStyles.dotLocked,
          ]}>
            {isDone ? (
              <Ionicons name="checkmark" size={13} color="#fff" />
            ) : isCurrent ? (
              <View style={chapterStyles.dotInner} />
            ) : (
              <Text style={chapterStyles.dotNumber}>{item.sequence_order}</Text>
            )}
          </View>
          {index < chapters.length - 1 && (
            <View style={[
              chapterStyles.line,
              isDone && { backgroundColor: Colors.success + '60' },
            ]} />
          )}
        </View>

        {/* Card */}
        <Pressable
          style={({ pressed }) => [
            chapterStyles.card,
            isCurrent && chapterStyles.cardCurrent,
            isLocked && chapterStyles.cardLocked,
            pressed && !isLocked && { opacity: 0.88 },
          ]}
          onPress={() => openChapter(item)}
        >
          {isCurrent && (
            <LinearGradient
              colors={[Colors.primary + '18', Colors.primary + '05']}
              style={StyleSheet.absoluteFill}
            />
          )}

          <View style={chapterStyles.cardTop}>
            <View style={{ flex: 1 }}>
              <View style={chapterStyles.chapterLabel}>
                <Text style={[chapterStyles.chapterNum, isLocked && { color: Colors.textDisabled }]}>
                  Chapter {item.sequence_order}
                </Text>
                {isCurrent && (
                  <View style={chapterStyles.currentPill}>
                    <Text style={chapterStyles.currentPillText}>Current</Text>
                  </View>
                )}
              </View>
              <Text
                style={[chapterStyles.title, isLocked && chapterStyles.titleLocked]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
            </View>

            {item.mastery_score !== undefined && (
              <View style={chapterStyles.masteryCircle}>
                <Text style={chapterStyles.masteryNum}>{item.mastery_score}%</Text>
              </View>
            )}
          </View>

          <View style={chapterStyles.cardMeta}>
            <View style={chapterStyles.metaItem}>
              <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
              <Text style={chapterStyles.metaText}>{item.estimated_duration_mins} min</Text>
            </View>
            {item.prerequisites.length > 0 && (
              <View style={chapterStyles.metaItem}>
                <Ionicons name="git-branch-outline" size={12} color={Colors.textMuted} />
                <Text style={chapterStyles.metaText}>{item.prerequisites.length} prereq</Text>
              </View>
            )}
            <View style={{ flex: 1 }} />
            <View style={[
              chapterStyles.statusBadge,
              { backgroundColor: cfg.color + '18', borderColor: cfg.color + '35' },
            ]}>
              <Ionicons name={cfg.icon} size={11} color={cfg.color} />
              <Text style={[chapterStyles.statusText, { color: cfg.color }]}>
                {STATUS_LABEL[item.status]}
              </Text>
            </View>

            {!isLocked && (
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} style={{ marginLeft: 6 }} />
            )}
          </View>

          {isCurrent && (
            <View style={chapterStyles.progressRow}>
              <View style={chapterStyles.progressTrack}>
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[chapterStyles.progressFill, { width: '45%' }]}
                />
              </View>
              <Text style={chapterStyles.progressPct}>45%</Text>
            </View>
          )}
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient colors={['#1e0a4a', '#120a2e', '#0a0a0f']} style={s.header}>
        <View style={s.headerRow}>
          <Text style={s.headerTitle}>Curriculum</Text>
          <View style={s.subjectCount}>
            <Ionicons name="layers-outline" size={13} color={Colors.primaryLight} />
            <Text style={s.subjectCountText}>{subjects.length} subjects</Text>
          </View>
        </View>

        {/* Subject pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillsScroll}>
          {subjects.map((sub) => (
            <Pressable
              key={sub.id}
              style={({ pressed }) => [
                s.pill,
                selectedSubject?.id === sub.id && [s.pillActive, { backgroundColor: sub.color }],
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => setSelectedSubject(sub)}
            >
              <Ionicons
                name={sub.icon as keyof typeof Ionicons.glyphMap}
                size={14}
                color={selectedSubject?.id === sub.id ? '#fff' : Colors.textMuted}
              />
              <Text
                style={[s.pillText, selectedSubject?.id === sub.id && s.pillTextActive]}
                numberOfLines={1}
              >
                {sub.name.split(' ').slice(0, 3).join(' ')}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* Subject summary banner */}
      {selectedSubject && !loading && (
        <View style={s.banner}>
          <View style={[s.bannerIcon, { backgroundColor: selectedSubject.color + '18' }]}>
            <Ionicons
              name={selectedSubject.icon as keyof typeof Ionicons.glyphMap}
              size={26}
              color={selectedSubject.color}
            />
          </View>
          <View style={s.bannerBody}>
            <Text style={s.bannerTitle}>{selectedSubject.name}</Text>
            <View style={s.bannerMeta}>
              <Text style={s.bannerMetaText}>{chapters.length} chapters</Text>
              <Text style={s.bannerDot}>·</Text>
              <Text style={s.bannerMetaText}>{totalHours}h {remMins}m total</Text>
              <Text style={s.bannerDot}>·</Text>
              <Text style={s.bannerMetaText}>{completed} done</Text>
            </View>
            <View style={s.bannerBarTrack}>
              <LinearGradient
                colors={[selectedSubject.color, selectedSubject.color + 'aa']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[s.bannerBarFill, { width: `${progressPct}%` as any }]}
              />
            </View>
          </View>
          <View style={s.bannerPct}>
            <Text style={[s.bannerPctNum, { color: selectedSubject.color }]}>{progressPct}%</Text>
          </View>
        </View>
      )}

      {/* Level label */}
      {profile && !loading && (
        <View style={s.levelLabel}>
          <Ionicons name="school-outline" size={13} color={Colors.textMuted} />
          <Text style={s.levelLabelText}>
            {profile.educationType?.charAt(0).toUpperCase() + profile.educationType?.slice(1)} ·{' '}
            {profile.level?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            {profile.form ? ` · ${profile.form}` : ''}
          </Text>
        </View>
      )}

      {loading ? (
        <View style={s.loading}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={s.loadingText}>Building your personalised curriculum…</Text>
        </View>
      ) : (
        <FlatList
          data={chapters}
          keyExtractor={(item) => item.id}
          renderItem={renderChapter}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const chapterStyles = StyleSheet.create({
  wrapper: { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },
  timelineCol: { alignItems: 'center', width: 28 },
  dot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.bgCard,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 2,
  },
  dotDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  dotCurrent: { backgroundColor: Colors.primary, borderColor: Colors.primaryLight },
  dotLocked: { backgroundColor: Colors.bgCardAlt, borderColor: Colors.border },
  dotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },
  dotNumber: { fontSize: 10, fontWeight: '700', color: Colors.textMuted },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
    minHeight: 16,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    gap: 10,
  },
  cardCurrent: { borderColor: Colors.primary + '60' },
  cardLocked: { opacity: 0.48 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  chapterLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  chapterNum: { fontSize: 11, color: Colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  currentPill: {
    backgroundColor: Colors.primary + '22',
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 6, borderWidth: 1, borderColor: Colors.primary + '40',
  },
  currentPillText: { fontSize: 10, color: Colors.primaryLight, fontWeight: '700' },
  title: { fontSize: 14, fontWeight: '700', color: Colors.text, lineHeight: 20 },
  titleLocked: { color: Colors.textMuted },
  masteryCircle: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.success + '18',
    borderWidth: 1, borderColor: Colors.success + '35',
    alignItems: 'center', justifyContent: 'center',
  },
  masteryNum: { fontSize: 12, fontWeight: '800', color: Colors.success },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: Colors.textMuted },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack: { flex: 1, height: 5, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressPct: { fontSize: 11, fontWeight: '700', color: Colors.primaryLight, width: 28 },
});

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
  subjectCount: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.primaryAlpha, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: Colors.primary + '30' },
  subjectCountText: { fontSize: 12, color: Colors.primaryLight, fontWeight: '700' },
  pillsScroll: { gap: 8, paddingRight: 4 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 13, paddingVertical: 8,
    borderRadius: 20, backgroundColor: Colors.bgCard,
    borderWidth: 1, borderColor: Colors.border,
    maxWidth: 170,
  },
  pillActive: { borderWidth: 0 },
  pillText: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  pillTextActive: { color: '#fff', fontWeight: '700' },

  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  bannerIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  bannerBody: { flex: 1, gap: 4 },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  bannerMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  bannerMetaText: { fontSize: 12, color: Colors.textSecondary },
  bannerDot: { fontSize: 12, color: Colors.textMuted },
  bannerBarTrack: { height: 5, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden', marginTop: 4 },
  bannerBarFill: { height: '100%', borderRadius: 3 },
  bannerPct: { alignItems: 'center', justifyContent: 'center' },
  bannerPctNum: { fontSize: 18, fontWeight: '900' },

  levelLabel: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 20, paddingVertical: 8,
    backgroundColor: Colors.bgCardAlt,
  },
  levelLabelText: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },

  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadingText: { fontSize: 14, color: Colors.textSecondary },
  list: { paddingTop: 16, paddingBottom: 104 },
});
