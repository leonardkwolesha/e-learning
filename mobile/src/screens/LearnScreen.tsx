import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, KeyboardAvoidingView, Platform,
  NativeSyntheticEvent, NativeScrollEvent, Pressable,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../theme/colors';
import { LearnStackParamList, ContentBlock } from '../types';
import { contentApi, assessmentApi } from '../lib/api';
import { recordStudyTime, saveNote, getNote, markTopicComplete, isTopicComplete } from '../lib/storage';

type RouteType = RouteProp<LearnStackParamList, 'Learn'>;
type NavProp = NativeStackNavigationProp<LearnStackParamList>;

// ── Content Renderers ────────────────────────────────────────────────────────

function ContentBlockRenderer({ block }: { block: ContentBlock }) {
  const [copied, setCopied] = useState(false);

  if (block.type === 'heading') {
    const size = block.level === 1 ? 22 : block.level === 2 ? 19 : 17;
    const weight = block.level === 1 ? '800' : block.level === 2 ? '700' : '600';
    return (
      <Text style={[cs.heading, { fontSize: size, fontWeight: weight as any }]}>
        {block.content}
      </Text>
    );
  }

  if (block.type === 'text') {
    return <Text style={cs.bodyText}>{block.content}</Text>;
  }

  if (block.type === 'code') {
    return (
      <View style={cs.codeBlock}>
        <View style={cs.codeHeader}>
          <View style={cs.codeLangBadge}>
            <Text style={cs.codeLang}>{block.language || 'code'}</Text>
          </View>
          <TouchableOpacity
            onPress={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            style={cs.copyBtn}
          >
            <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={14} color={copied ? Colors.success : Colors.textMuted} />
            <Text style={[cs.copyText, copied && { color: Colors.success }]}>{copied ? 'Copied!' : 'Copy'}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text style={cs.codeText}>{block.content}</Text>
        </ScrollView>
      </View>
    );
  }

  if (block.type === 'formula') {
    return (
      <View style={cs.formulaBlock}>
        <View style={cs.formulaIconWrap}>
          <Ionicons name="calculator-outline" size={16} color={Colors.accent} />
        </View>
        <Text style={cs.formulaText}>{block.content}</Text>
      </View>
    );
  }

  if (block.type === 'callout') {
    const config = {
      info: { color: Colors.accent, icon: 'information-circle-outline' as const, bg: Colors.accentAlpha },
      warning: { color: Colors.warning, icon: 'warning-outline' as const, bg: Colors.warningAlpha },
      tip: { color: Colors.success, icon: 'bulb-outline' as const, bg: Colors.successAlpha },
    };
    const c = config[block.variant || 'info'];
    return (
      <View style={[cs.callout, { backgroundColor: c.bg, borderLeftColor: c.color }]}>
        <Ionicons name={c.icon} size={18} color={c.color} style={{ marginRight: 10, marginTop: 1 }} />
        <Text style={[cs.calloutText, { color: c.color }]}>{block.content}</Text>
      </View>
    );
  }

  if (block.type === 'list') {
    return (
      <View style={cs.listBlock}>
        {(block.items || []).map((item, i) => (
          <View key={i} style={cs.listItem}>
            <View style={cs.listBulletWrap}>
              {block.ordered
                ? <Text style={cs.listNumber}>{i + 1}.</Text>
                : <View style={cs.listDot} />}
            </View>
            <Text style={cs.listItemText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (block.type === 'diagram') {
    return (
      <View style={cs.diagramBlock}>
        <View style={cs.diagramHeader}>
          <Ionicons name="git-branch-outline" size={15} color={Colors.primary} />
          <Text style={cs.diagramLabel}>Diagram</Text>
        </View>
        <Text style={cs.diagramText}>{block.content}</Text>
      </View>
    );
  }

  return null;
}

// ── Screen ───────────────────────────────────────────────────────────────────

export default function LearnScreen() {
  const route = useRoute<RouteType>();
  const navigation = useNavigation<NavProp>();
  const { chapterId, chapterTitle, curriculumId } = route.params;

  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [generatingAssessment, setGeneratingAssessment] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [readProgress, setReadProgress] = useState(0);

  const startTime = useRef(Date.now());
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadContent();
    loadNote();
    checkCompletion();
    return () => {
      const minutes = Math.floor((Date.now() - startTime.current) / 60000);
      if (minutes > 0) recordStudyTime(minutes);
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [chapterId]);

  const loadContent = async () => {
    try {
      const data = await contentApi.get(chapterId) as { blocks: ContentBlock[] };
      setBlocks(data.blocks || []);
    } catch {
      try {
        const generated = await contentApi.generate(chapterId) as { blocks: ContentBlock[] };
        setBlocks(generated.blocks?.length ? generated.blocks : getMockBlocks());
      } catch {
        setBlocks(getMockBlocks());
      }
    } finally {
      setLoading(false);
    }
  };

  const loadNote = async () => { setNote(await getNote(chapterId)); };

  const checkCompletion = async () => { setCompleted(await isTopicComplete(chapterId)); };

  const handleNoteChange = useCallback((text: string) => {
    setNote(text);
    setNoteSaved(false);
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      await saveNote(chapterId, text);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    }, 800);
  }, [chapterId]);

  const handleMarkComplete = async () => {
    if (completed || markingComplete) return;
    setMarkingComplete(true);
    await markTopicComplete(chapterId);
    setCompleted(true);
    setMarkingComplete(false);
  };

  const startAssessment = async () => {
    setGeneratingAssessment(true);
    try {
      const activity = await assessmentApi.generate(chapterId) as { id: string };
      navigation.navigate('Assessment', { activityId: activity.id, chapterId, chapterTitle });
    } catch {
      navigation.navigate('Assessment', { chapterId, chapterTitle });
    } finally {
      setGeneratingAssessment(false);
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const pct = contentSize.height <= layoutMeasurement.height
      ? 100
      : Math.min(100, Math.round(((contentOffset.y + layoutMeasurement.height) / contentSize.height) * 100));
    setReadProgress(pct);
  };

  const getMockBlocks = (): ContentBlock[] => [
    { type: 'heading', level: 1, content: chapterTitle },
    { type: 'text', content: 'Welcome to this chapter. We will explore the foundational concepts step by step. By the end you\'ll have a solid understanding to apply these ideas confidently.' },
    { type: 'callout', variant: 'tip', content: 'Tip: Take short notes as you read. Connecting new ideas to what you already know greatly improves retention.' },
    { type: 'heading', level: 2, content: 'Core Concepts' },
    { type: 'text', content: 'The subject rests on several key principles. Mastering these will make advanced topics much easier to grasp.' },
    { type: 'list', ordered: false, items: [
      'Foundation: the basics underpin everything',
      'Practice: repetition builds fluency',
      'Application: connect theory to real problems',
      'Review: regular recall strengthens memory',
    ]},
    { type: 'heading', level: 2, content: 'Worked Example' },
    { type: 'code', language: 'python', content: '# Demonstrating a simple concept\ndef calculate(a, b):\n    """Returns the sum of two numbers"""\n    return a + b\n\n# Usage\nresult = calculate(10, 25)\nprint(f"Result: {result}")  # Output: Result: 35' },
    { type: 'callout', variant: 'info', content: 'The example above is intentionally simple. Real applications will involve more complex logic built on these same principles.' },
    { type: 'heading', level: 2, content: 'Key Formula' },
    { type: 'formula', content: 'Result = Input × Factor + Offset' },
    { type: 'heading', level: 2, content: 'Summary' },
    { type: 'text', content: 'In this chapter we covered the essential concepts that form the backbone of this topic. Make sure you are comfortable with each idea before moving on.' },
    { type: 'list', ordered: true, items: [
      'Identify the core principle',
      'Work through at least one example by hand',
      'Attempt the chapter assessment below',
    ]},
  ];

  if (loading) {
    return (
      <View style={s.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={s.loadingText}>Loading chapter content…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <StatusBar style="light" />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{chapterTitle}</Text>
        <View style={s.headerRight}>
          {completed && (
            <View style={s.completedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text style={s.completedBadgeText}>Done</Text>
            </View>
          )}
          <TouchableOpacity
            style={[s.headerBtn, showNotes && { backgroundColor: Colors.primaryAlpha, borderColor: Colors.primary + '50' }]}
            onPress={() => setShowNotes(!showNotes)}
          >
            <Ionicons name={showNotes ? 'create' : 'create-outline'} size={20} color={showNotes ? Colors.primary : Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Reading progress bar ── */}
      <View style={s.progressBarOuter}>
        <View style={[s.progressBarInner, { width: `${readProgress}%` as any }]} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          ref={scrollRef}
          style={s.scroll}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Content blocks */}
          <View style={s.contentWrap}>
            {blocks.map((block, i) => <ContentBlockRenderer key={i} block={block} />)}
          </View>

          {/* ── Notes section ── */}
          {showNotes && (
            <View style={s.notesSection}>
              <View style={s.notesSectionHeader}>
                <Ionicons name="create-outline" size={17} color={Colors.primary} />
                <Text style={s.notesSectionTitle}>My Notes</Text>
                {noteSaved && (
                  <View style={s.savedPill}>
                    <Ionicons name="checkmark" size={11} color={Colors.success} />
                    <Text style={s.savedPillText}>Saved</Text>
                  </View>
                )}
              </View>
              <TextInput
                style={s.notesInput}
                multiline
                placeholder="Write your notes here… (autosaved)"
                placeholderTextColor={Colors.textMuted}
                value={note}
                onChangeText={handleNoteChange}
                textAlignVertical="top"
              />
              <Text style={s.noteCount}>{note.length} characters</Text>
            </View>
          )}

          {/* ── Mark Complete ── */}
          {!completed ? (
            <Pressable
              style={({ pressed }) => [s.markCompleteBtn, pressed && { opacity: 0.85 }]}
              onPress={handleMarkComplete}
              disabled={markingComplete}
            >
              <View style={s.markCompleteBtnInner}>
                {markingComplete
                  ? <ActivityIndicator size="small" color={Colors.success} />
                  : <Ionicons name="checkmark-circle-outline" size={20} color={Colors.success} />}
                <Text style={s.markCompleteText}>
                  {markingComplete ? 'Marking…' : 'Mark Chapter as Complete'}
                </Text>
              </View>
            </Pressable>
          ) : (
            <View style={s.completedBanner}>
              <LinearGradient colors={[Colors.success + '18', Colors.success + '08']} style={s.completedBannerInner}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                <View>
                  <Text style={s.completedBannerTitle}>Chapter Completed!</Text>
                  <Text style={s.completedBannerSub}>Take the assessment to earn your mastery badge</Text>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* ── Assessment CTA ── */}
          <View style={s.assessmentCta}>
            <LinearGradient colors={['#1a0a3e', Colors.bgCard]} style={s.assessmentCtaBg}>
              <LinearGradient colors={[Colors.primary + '30', Colors.primary + '10']} style={s.assessmentCtaIconWrap}>
                <Ionicons name="school-outline" size={30} color={Colors.primaryLight} />
              </LinearGradient>
              <Text style={s.assessmentCtaTitle}>Test Your Knowledge</Text>
              <Text style={s.assessmentCtaSub}>Take the chapter assessment and earn your mastery badge</Text>
              <TouchableOpacity
                style={s.assessmentBtn}
                onPress={startAssessment}
                disabled={generatingAssessment}
                activeOpacity={0.85}
              >
                <LinearGradient colors={Colors.gradientPrimary as unknown as string[]} style={s.assessmentBtnGrad}>
                  {generatingAssessment
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <>
                        <Text style={s.assessmentBtnText}>Start Assessment</Text>
                        <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 6 }} />
                      </>}
                </LinearGradient>
              </TouchableOpacity>

              {/* Navigation buttons */}
              <View style={s.chapterNav}>
                <TouchableOpacity style={s.navBtn} onPress={() => navigation.goBack()}>
                  <Ionicons name="arrow-back" size={16} color={Colors.textSecondary} />
                  <Text style={s.navBtnText}>Back to Curriculum</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.navBtn, s.navBtnNext]}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={s.navBtnNextText}>Next Chapter</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.primaryLight} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const cs = StyleSheet.create({
  heading: { color: Colors.text, lineHeight: 30, marginTop: 8 },
  bodyText: { fontSize: 15, color: Colors.textSecondary, lineHeight: 26 },
  codeBlock: {
    backgroundColor: '#0d0d1a', borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
  },
  codeHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  codeLangBadge: { backgroundColor: Colors.primaryAlpha, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  codeLang: { fontSize: 11, color: Colors.primaryLight, fontWeight: '700' },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  copyText: { fontSize: 12, color: Colors.textMuted },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13, color: '#a9b7d0', padding: 14, lineHeight: 22,
  },
  formulaBlock: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.accentAlpha,
    borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.accent + '30', gap: 10,
  },
  formulaIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: Colors.accent + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  formulaText: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 15, color: Colors.accent, fontStyle: 'italic',
  },
  callout: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderRadius: 12, padding: 14, borderLeftWidth: 3,
  },
  calloutText: { flex: 1, fontSize: 14, lineHeight: 20 },
  listBlock: { gap: 10 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  listBulletWrap: { marginTop: 5 },
  listDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.primary },
  listNumber: { fontSize: 13, fontWeight: '700', color: Colors.primary, minWidth: 22 },
  listItemText: { flex: 1, fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  diagramBlock: {
    backgroundColor: Colors.bgCardAlt, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  diagramHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  diagramLabel: { fontSize: 12, color: Colors.primaryLight, fontWeight: '600' },
  diagramText: {
    fontSize: 13, color: Colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', lineHeight: 20,
  },
});

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  loading: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: Colors.textSecondary, fontSize: 15 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 10,
  },
  headerBtn: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  headerTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  completedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.success + '18',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.success + '35',
  },
  completedBadgeText: { fontSize: 11, color: Colors.success, fontWeight: '700' },

  progressBarOuter: { height: 3, backgroundColor: Colors.border },
  progressBarInner: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },

  scroll: { flex: 1 },
  contentWrap: { padding: 20, gap: 16, paddingBottom: 104 },

  notesSection: {
    margin: 20, marginTop: 4,
    backgroundColor: Colors.bgCard, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  notesSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  notesSectionTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.text },
  savedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.success + '18',
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6,
  },
  savedPillText: { fontSize: 11, color: Colors.success, fontWeight: '600' },
  notesInput: {
    fontSize: 14, color: Colors.text, lineHeight: 22,
    textAlignVertical: 'top', minHeight: 110,
  },
  noteCount: { fontSize: 11, color: Colors.textMuted, textAlign: 'right', marginTop: 8 },

  markCompleteBtn: {
    marginHorizontal: 20, marginBottom: 12,
    borderRadius: 14, borderWidth: 1.5,
    borderColor: Colors.success + '50',
    overflow: 'hidden',
  },
  markCompleteBtnInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14,
    backgroundColor: Colors.success + '10',
  },
  markCompleteText: { fontSize: 15, fontWeight: '700', color: Colors.success },

  completedBanner: { marginHorizontal: 20, marginBottom: 12, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.success + '35' },
  completedBannerInner: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  completedBannerTitle: { fontSize: 14, fontWeight: '700', color: Colors.success },
  completedBannerSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  assessmentCta: { margin: 20, marginTop: 4, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: Colors.primary + '30' },
  assessmentCtaBg: { padding: 24, alignItems: 'center', gap: 0 },
  assessmentCtaIconWrap: {
    width: 64, height: 64, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  assessmentCtaTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 8, textAlign: 'center' },
  assessmentCtaSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  assessmentBtn: { borderRadius: 14, overflow: 'hidden', width: '100%', elevation: 6, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10 },
  assessmentBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  assessmentBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  chapterNav: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 16, gap: 12 },
  navBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: 12,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
  },
  navBtnText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  navBtnNext: { backgroundColor: Colors.primaryAlpha, borderColor: Colors.primary + '40' },
  navBtnNextText: { fontSize: 13, color: Colors.primaryLight, fontWeight: '700' },
});
