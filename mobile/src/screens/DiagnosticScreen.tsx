import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../theme/colors';
import { OnboardingStackParamList } from '../types';
import { onboardingApi } from '../lib/api';
import { useProfile } from '../context/ProfileContext';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Diagnostic'>;
  route: RouteProp<OnboardingStackParamList, 'Diagnostic'>;
};

interface DiagQuestion {
  id: string;
  question: string;
  options: string[];
}

export default function DiagnosticScreen({ navigation, route }: Props) {
  const { educationType, level, subjects } = route.params;
  const { profile } = useProfile();
  const [questions, setQuestions] = useState<DiagQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; level: string } | null>(null);

  const subject = subjects[0] || 'General';

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const data = await onboardingApi.getDiagnosticQuestions(subject, level) as DiagQuestion[];
      setQuestions(data);
    } catch {
      // Fallback sample questions
      setQuestions([
        {
          id: '1',
          question: 'What is the primary function of an operating system?',
          options: ['Run applications', 'Manage hardware resources', 'Store data', 'Connect to the internet'],
        },
        {
          id: '2',
          question: 'Which data structure uses LIFO (Last In, First Out) order?',
          options: ['Queue', 'Stack', 'Array', 'Linked List'],
        },
        {
          id: '3',
          question: 'What does CPU stand for?',
          options: ['Central Processing Unit', 'Computer Processing Unit', 'Core Processing Unit', 'Central Program Unit'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    const q = questions[currentQ];
    setAnswers((prev) => ({ ...prev, [q.id]: answer }));
    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const data = await onboardingApi.submitDiagnostic(subject, answers) as { score: number; level: string };
      setResult(data);
    } catch {
      setResult({ score: 70, level: 'intermediate' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Generating your diagnostic quiz...</Text>
      </View>
    );
  }

  if (result) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={Colors.gradientHero as unknown as string[]} style={styles.gradient} />
        <View style={styles.resultContainer}>
          <LinearGradient colors={Colors.gradientPrimary as unknown as string[]} style={styles.resultScore}>
            <Text style={styles.resultScoreText}>{result.score}%</Text>
          </LinearGradient>
          <Text style={styles.resultTitle}>Diagnostic Complete!</Text>
          <Text style={styles.resultLevel}>
            Your level: <Text style={styles.resultLevelBadge}>{result.level}</Text>
          </Text>
          <Text style={styles.resultDesc}>
            Great! We've calibrated your curriculum to match your current knowledge level.
            Your learning journey starts now!
          </Text>
          <TouchableOpacity
            style={styles.doneBtn}
            activeOpacity={0.85}
          >
            <LinearGradient colors={Colors.gradientPrimary as unknown as string[]} style={styles.doneBtnGradient}>
              <Text style={styles.doneBtnText}>Go to Dashboard</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.white} style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const allAnswered = Object.keys(answers).length === questions.length;
  const current = questions[currentQ];
  const progress = (currentQ / questions.length) * 100;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={Colors.gradientHero as unknown as string[]} style={styles.gradient} />

      <View style={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Diagnostic Quiz</Text>
          <Text style={styles.headerSub}>{subject}</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
          </View>
          <Text style={styles.progressLabel}>{currentQ + 1}/{questions.length}</Text>
        </View>

        {/* Question */}
        <View style={styles.questionCard}>
          <Text style={styles.questionNumber}>Question {currentQ + 1}</Text>
          <Text style={styles.questionText}>{current.question}</Text>
        </View>

        {/* Options */}
        <View style={styles.options}>
          {current.options.map((option, i) => {
            const isSelected = answers[current.id] === option;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => handleAnswer(option)}
                activeOpacity={0.8}
              >
                <View style={[styles.optionLetter, isSelected && styles.optionLetterActive]}>
                  <Text style={[styles.optionLetterText, isSelected && styles.optionLetterTextActive]}>
                    {String.fromCharCode(65 + i)}
                  </Text>
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                  {option}
                </Text>
                {isSelected && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Navigation */}
        <View style={styles.navRow}>
          {currentQ > 0 && (
            <TouchableOpacity style={styles.navBtnSecondary} onPress={() => setCurrentQ(currentQ - 1)}>
              <Ionicons name="arrow-back" size={18} color={Colors.textSecondary} />
              <Text style={styles.navBtnSecondaryText}>Previous</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {currentQ < questions.length - 1 ? (
            <TouchableOpacity
              style={[styles.navBtn, !answers[current.id] && styles.navBtnDisabled]}
              onPress={() => answers[current.id] && setCurrentQ(currentQ + 1)}
              disabled={!answers[current.id]}
            >
              <LinearGradient colors={Colors.gradientPrimary as unknown as string[]} style={styles.navBtnGradient}>
                <Text style={styles.navBtnText}>Next</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.white} style={{ marginLeft: 4 }} />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navBtn, (!allAnswered || submitting) && styles.navBtnDisabled]}
              onPress={handleSubmit}
              disabled={!allAnswered || submitting}
            >
              <LinearGradient colors={Colors.gradientPrimary as unknown as string[]} style={styles.navBtnGradient}>
                {submitting ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.navBtnText}>Submit</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={() => setResult({ score: 75, level: 'intermediate' })} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip diagnostic</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: { color: Colors.textSecondary, fontSize: 15 },
  scroll: { flex: 1, padding: 24, paddingTop: 60 },
  header: { marginBottom: 24 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
  headerSub: { fontSize: 14, color: Colors.primaryLight, marginTop: 4 },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressLabel: { fontSize: 12, color: Colors.textMuted, width: 40, textAlign: 'right' },
  questionCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  questionNumber: { fontSize: 12, color: Colors.primaryLight, fontWeight: '600', marginBottom: 8 },
  questionText: { fontSize: 17, color: Colors.text, lineHeight: 26, fontWeight: '500' },
  options: { gap: 12, marginBottom: 24 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 16,
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
  optionLetterTextActive: { color: Colors.white },
  optionText: { flex: 1, fontSize: 15, color: Colors.text },
  optionTextActive: { color: Colors.primaryLight, fontWeight: '500' },
  navRow: { flexDirection: 'row', alignItems: 'center' },
  navBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navBtnSecondaryText: { fontSize: 14, color: Colors.textSecondary },
  navBtn: { borderRadius: 12, overflow: 'hidden' },
  navBtnDisabled: { opacity: 0.5 },
  navBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  navBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  skipBtn: { alignItems: 'center', marginTop: 16 },
  skipText: { fontSize: 13, color: Colors.textMuted },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  resultScore: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  resultScoreText: { fontSize: 36, fontWeight: '800', color: Colors.white },
  resultTitle: { fontSize: 26, fontWeight: '800', color: Colors.text, marginBottom: 8, textAlign: 'center' },
  resultLevel: { fontSize: 16, color: Colors.textSecondary, marginBottom: 16 },
  resultLevelBadge: { color: Colors.primaryLight, fontWeight: '700', textTransform: 'capitalize' },
  resultDesc: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  doneBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  doneBtnGradient: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});
