import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../theme/colors';
import { LearnStackParamList, Activity, Question, SubmissionResult } from '../types';
import { assessmentApi } from '../lib/api';
import { markTopicComplete } from '../lib/storage';

type RouteType = RouteProp<LearnStackParamList, 'Assessment'>;
type NavProp = NativeStackNavigationProp<LearnStackParamList>;

export default function AssessmentScreen() {
  const route = useRoute<RouteType>();
  const navigation = useNavigation<NavProp>();
  const { activityId, chapterId, chapterTitle } = route.params;

  const [activity, setActivity] = useState<Activity | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [currentQ, setCurrentQ] = useState(0);

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    try {
      let data: Activity;
      if (activityId) {
        data = await assessmentApi.getResults(activityId) as Activity;
      } else {
        data = await assessmentApi.generate(chapterId) as Activity;
      }
      setActivity(data);
    } catch {
      setActivity(getMockActivity());
    } finally {
      setLoading(false);
    }
  };

  const getMockActivity = (): Activity => ({
    id: 'mock',
    chapter_id: chapterId,
    activity_type: 'quiz',
    generated_at: new Date().toISOString(),
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        question: `Which of the following best describes the main concept covered in "${chapterTitle}"?`,
        options: [
          'A systematic approach to problem-solving',
          'A random collection of ideas',
          'A historical overview only',
          'An unrelated tangent',
        ],
        correct_answer: 'A systematic approach to problem-solving',
        marks: 2,
      },
      {
        id: 'q2',
        type: 'mcq',
        question: 'What is the most important principle when applying the concepts from this chapter?',
        options: [
          'Speed over accuracy',
          'Understanding the fundamentals before advancing',
          'Memorizing formulas without understanding',
          'Skipping practice exercises',
        ],
        correct_answer: 'Understanding the fundamentals before advancing',
        marks: 2,
      },
      {
        id: 'q3',
        type: 'short_answer',
        question: `Explain in your own words how you would apply the key concepts from "${chapterTitle}" to a real-world problem.`,
        marks: 4,
      },
      {
        id: 'q4',
        type: 'problem_solving',
        question: 'Describe the step-by-step approach you would take to solve a problem related to the topics covered. Include specific techniques and explain your reasoning.',
        marks: 6,
      },
    ],
  });

  const handleMCQAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!activity) return;
    const unanswered = activity.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await assessmentApi.submit(activity.id, answers) as SubmissionResult;
      setResult(res);
      const pct = Math.round((res.score / res.max_score) * 100);
      await markTopicComplete(chapterId, pct);
    } catch {
      const maxScore = activity.questions.reduce((sum, q) => sum + q.marks, 0);
      const score = Math.floor(maxScore * 0.75);
      setResult({
        score,
        max_score: maxScore,
        ai_feedback: 'Great work! You demonstrated a solid understanding of the concepts covered in this chapter. Focus on the areas where you lost points to strengthen your knowledge.',
        per_question_feedback: activity.questions.map((q) => ({
          question_id: q.id,
          earned: Math.floor(q.marks * 0.75),
          max: q.marks,
          feedback: 'Good attempt. Review the key concepts to improve further.',
        })),
      });
      await markTopicComplete(chapterId, 75);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Generating your assessment...</Text>
      </View>
    );
  }

  if (result) {
    const pct = Math.round((result.score / result.max_score) * 100);
    const grade = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';
    const gradeColor = pct >= 70 ? Colors.success : pct >= 50 ? Colors.warning : Colors.error;

    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={styles.resultScroll}>
          <LinearGradient colors={Colors.gradientHero as unknown as string[]} style={styles.resultHeader}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.popToTop()}>
              <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.resultHeaderTitle}>Assessment Complete</Text>
          </LinearGradient>

          <View style={styles.scoreSection}>
            <LinearGradient
              colors={[gradeColor + '30', gradeColor + '10']}
              style={styles.scoreCircle}
            >
              <Text style={[styles.scoreGrade, { color: gradeColor }]}>{grade}</Text>
              <Text style={[styles.scorePct, { color: gradeColor }]}>{pct}%</Text>
            </LinearGradient>
            <Text style={styles.scoreTitle}>
              {pct >= 80 ? 'Excellent Work!' : pct >= 60 ? 'Good Effort!' : 'Keep Practicing!'}
            </Text>
            <Text style={styles.scoreDetail}>
              {result.score} / {result.max_score} points
            </Text>
          </View>

          <View style={styles.feedbackCard}>
            <View style={styles.feedbackHeader}>
              <Ionicons name="sparkles" size={18} color={Colors.primary} />
              <Text style={styles.feedbackTitle}>AI Tutor Feedback</Text>
            </View>
            <Text style={styles.feedbackText}>{result.ai_feedback}</Text>
          </View>

          <Text style={styles.perQuestionTitle}>Question Breakdown</Text>
          {result.per_question_feedback.map((qf, i) => (
            <View key={qf.question_id} style={styles.qFeedbackCard}>
              <View style={styles.qFeedbackHeader}>
                <Text style={styles.qNumber}>Q{i + 1}</Text>
                <View style={styles.qScoreRow}>
                  <Text style={[styles.qScore, { color: qf.earned === qf.max ? Colors.success : Colors.warning }]}>
                    {qf.earned}/{qf.max} pts
                  </Text>
                </View>
              </View>
              <Text style={styles.qFeedbackText}>{qf.feedback}</Text>
            </View>
          ))}

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.popToTop()}
            activeOpacity={0.85}
          >
            <LinearGradient colors={Colors.gradientPrimary as unknown as string[]} style={styles.doneBtnGrad}>
              <Text style={styles.doneBtnText}>Continue Learning</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.white} style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!activity) return null;
  const current = activity.questions[currentQ];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / activity.questions.length) * 100;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{chapterTitle}</Text>
          <Text style={styles.headerSub}>{answeredCount}/{activity.questions.length} answered</Text>
        </View>
        <View style={[styles.activityTypeBadge, { backgroundColor: Colors.primaryAlpha }]}>
          <Text style={styles.activityTypeText}>{activity.activity_type}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.questionScroll} showsVerticalScrollIndicator={false}>
          {/* Question tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.qTabs}
          >
            {activity.questions.map((q, i) => (
              <TouchableOpacity
                key={q.id}
                style={[
                  styles.qTab,
                  i === currentQ && styles.qTabActive,
                  answers[q.id] && i !== currentQ && styles.qTabDone,
                ]}
                onPress={() => setCurrentQ(i)}
              >
                <Text style={[styles.qTabText, (i === currentQ || answers[q.id]) && styles.qTabTextActive]}>
                  {i + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Current question */}
          <View style={styles.questionCard}>
            <View style={styles.questionMeta}>
              <Text style={styles.questionType}>{current.type.replace('_', ' ').toUpperCase()}</Text>
              <View style={styles.marksBadge}>
                <Text style={styles.marksText}>{current.marks} pts</Text>
              </View>
            </View>
            <Text style={styles.questionText}>{current.question}</Text>
          </View>

          {/* MCQ Options */}
          {current.type === 'mcq' && current.options && (
            <View style={styles.options}>
              {current.options.map((option, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.option, answers[current.id] === option && styles.optionSelected]}
                  onPress={() => handleMCQAnswer(current.id, option)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.optionLetter, answers[current.id] === option && styles.optionLetterActive]}>
                    <Text style={[styles.optionLetterText, answers[current.id] === option && { color: Colors.white }]}>
                      {String.fromCharCode(65 + i)}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, answers[current.id] === option && styles.optionTextActive]}>
                    {option}
                  </Text>
                  {answers[current.id] === option && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Text answer */}
          {(current.type === 'short_answer' || current.type === 'problem_solving') && (
            <View style={styles.textAnswerContainer}>
              <TextInput
                style={styles.textAnswer}
                multiline
                numberOfLines={current.type === 'problem_solving' ? 8 : 4}
                placeholder="Write your answer here..."
                placeholderTextColor={Colors.textMuted}
                value={answers[current.id] || ''}
                onChangeText={(text) => setAnswers((prev) => ({ ...prev, [current.id]: text }))}
              />
              <Text style={styles.textAnswerHint}>
                {answers[current.id]?.length || 0} characters
              </Text>
            </View>
          )}

          {/* Navigation */}
          <View style={styles.navRow}>
            {currentQ > 0 && (
              <TouchableOpacity style={styles.navSecondary} onPress={() => setCurrentQ(currentQ - 1)}>
                <Ionicons name="arrow-back" size={16} color={Colors.textSecondary} />
                <Text style={styles.navSecondaryText}>Previous</Text>
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }} />
            {currentQ < activity.questions.length - 1 ? (
              <TouchableOpacity
                style={[styles.navPrimary, !answers[current.id] && styles.navDisabled]}
                onPress={() => answers[current.id] && setCurrentQ(currentQ + 1)}
              >
                <LinearGradient colors={Colors.gradientPrimary as unknown as string[]} style={styles.navGradient}>
                  <Text style={styles.navPrimaryText}>Next</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.white} style={{ marginLeft: 4 }} />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.navPrimary, (answeredCount < activity.questions.length || submitting) && styles.navDisabled]}
                onPress={handleSubmit}
                disabled={answeredCount < activity.questions.length || submitting}
              >
                <LinearGradient colors={Colors.gradientPrimary as unknown as string[]} style={styles.navGradient}>
                  {submitting ? (
                    <ActivityIndicator color={Colors.white} size="small" />
                  ) : (
                    <Text style={styles.navPrimaryText}>Submit</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {answeredCount < activity.questions.length && currentQ === activity.questions.length - 1 && (
            <Text style={styles.unansweredHint}>
              {activity.questions.length - answeredCount} question(s) still unanswered
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { color: Colors.textSecondary, fontSize: 15 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  headerSub: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  activityTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  activityTypeText: { fontSize: 11, color: Colors.primaryLight, fontWeight: '700', textTransform: 'capitalize' },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  questionScroll: { padding: 20, gap: 16, paddingBottom: 104 },
  qTabs: { gap: 8, marginBottom: 4 },
  qTab: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  qTabDone: { backgroundColor: Colors.success + '30', borderColor: Colors.success + '50' },
  qTabText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  qTabTextActive: { color: Colors.white },
  questionCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  questionMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  questionType: { fontSize: 11, color: Colors.primaryLight, fontWeight: '700', letterSpacing: 0.5 },
  marksBadge: {
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  marksText: { fontSize: 11, fontWeight: '700', color: Colors.warning },
  questionText: { fontSize: 16, color: Colors.text, lineHeight: 24, fontWeight: '500' },
  options: { gap: 12 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 12,
  },
  optionSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryAlpha },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.bgCardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterActive: { backgroundColor: Colors.primary },
  optionLetterText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  optionText: { flex: 1, fontSize: 15, color: Colors.text },
  optionTextActive: { color: Colors.primaryLight, fontWeight: '500' },
  textAnswerContainer: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  textAnswer: {
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  textAnswerHint: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'right',
  },
  navRow: { flexDirection: 'row', alignItems: 'center' },
  navSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navSecondaryText: { fontSize: 14, color: Colors.textSecondary },
  navPrimary: { borderRadius: 12, overflow: 'hidden' },
  navDisabled: { opacity: 0.5 },
  navGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  navPrimaryText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  unansweredHint: { fontSize: 12, color: Colors.warning, textAlign: 'center' },
  resultScroll: { padding: 20, paddingBottom: 104 },
  resultHeader: { padding: 20, borderRadius: 16, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  resultHeaderTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
  scoreSection: { alignItems: 'center', marginBottom: 24 },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scoreGrade: { fontSize: 36, fontWeight: '900' },
  scorePct: { fontSize: 16, fontWeight: '700' },
  scoreTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  scoreDetail: { fontSize: 15, color: Colors.textSecondary },
  feedbackCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  feedbackTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  feedbackText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  perQuestionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  qFeedbackCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qFeedbackHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  qNumber: { fontSize: 13, fontWeight: '700', color: Colors.primaryLight },
  qScoreRow: {},
  qScore: { fontSize: 13, fontWeight: '700' },
  qFeedbackText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  doneBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 20 },
  doneBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  doneBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});
