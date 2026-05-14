import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../theme/colors';
import { OnboardingStackParamList, EduProfile } from '../types';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { getSubjectsForProfile } from '../data/subjects';
import { onboardingApi } from '../lib/api';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Onboarding'>;
  route: RouteProp<OnboardingStackParamList, 'Onboarding'>;
};

const FORMS_MAP: Record<string, string[]> = {
  'o-level': ['Form 1', 'Form 2', 'Form 3', 'Form 4'],
  'a-level': ['Form 5', 'Form 6'],
  undergraduate: ['Year 1', 'Year 2', 'Year 3', 'Year 4'],
  postgraduate: ['MSc Year 1', 'MSc Year 2'],
};

const LEARNING_STYLES = [
  { id: 'visual', label: 'Visual', icon: 'eye-outline' as const, desc: 'Learn through diagrams & visuals' },
  { id: 'auditory', label: 'Auditory', icon: 'volume-high-outline' as const, desc: 'Learn through listening & speech' },
  { id: 'reading', label: 'Reading', icon: 'book-outline' as const, desc: 'Learn through reading & writing' },
  { id: 'kinesthetic', label: 'Hands-on', icon: 'hand-left-outline' as const, desc: 'Learn through practice & doing' },
];

export default function OnboardingScreen({ navigation, route }: Props) {
  const { educationType, level } = route.params;
  const { setProfile } = useProfile();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [form, setForm] = useState('');
  const [learningStyle, setLearningStyle] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const forms = FORMS_MAP[level] || [];
  const requiresForm = forms.length > 0;
  const allSubjects = requiresForm && form
    ? getSubjectsForProfile(educationType, level, form)
    : !requiresForm
    ? getSubjectsForProfile(educationType, level)
    : [];

  const steps = [
    { title: 'What\'s your name?', subtitle: 'We\'ll personalise your experience.' },
    ...(requiresForm ? [{ title: 'Select your year/form', subtitle: 'This determines your curriculum.' }] : []),
    { title: 'Choose your subjects', subtitle: 'Select the subjects you want to study.' },
    { title: 'How do you learn best?', subtitle: 'We\'ll adapt content to your style.' },
  ];

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((s) => s !== subjectId) : [...prev, subjectId],
    );
  };

  const handleNext = () => {
    if (step === 0 && !name.trim()) {
      Alert.alert('Name Required', 'Please enter your name to continue.');
      return;
    }
    if (requiresForm && step === 1 && !form) {
      Alert.alert('Selection Required', 'Please select your form/year.');
      return;
    }
    const subjectStep = requiresForm ? 2 : 1;
    if (step === subjectStep && selectedSubjects.length === 0) {
      Alert.alert('Subjects Required', 'Please select at least one subject.');
      return;
    }
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    if (!learningStyle) {
      Alert.alert('Learning Style Required', 'Please select your learning style.');
      return;
    }

    setLoading(true);
    const profile: EduProfile = {
      educationType: educationType as EduProfile['educationType'],
      level,
      form: form || undefined,
      name: name.trim(),
      learning_style: learningStyle,
      subjects: selectedSubjects,
    };

    try {
      if (user) {
        await onboardingApi.saveProfile({
          user_id: user.id,
          grade_level: form || level,
          education_type: educationType,
          background_summary: `${name}, ${educationType} - ${level}`,
          learning_style: learningStyle,
        });
      }
    } catch (e) {
      // Continue even if server call fails; local profile will still work
    }

    await setProfile(profile);
    setLoading(false);
  };

  const currentStep = steps[step];
  const subjectStep = requiresForm ? 2 : 1;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={Colors.gradientHero as unknown as string[]} style={styles.gradient} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          {step > 0 ? (
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
              <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtn} />
          )}
          <View style={styles.progressRow}>
            {steps.map((_, i) => (
              <View
                key={i}
                style={[styles.progressDot, i <= step && styles.progressDotActive, i < step && styles.progressDotDone]}
              />
            ))}
          </View>
        </View>

        <Text style={styles.stepLabel}>Step {step + 1} of {steps.length}</Text>
        <Text style={styles.title}>{currentStep.title}</Text>
        <Text style={styles.subtitle}>{currentStep.subtitle}</Text>

        {/* Step 0: Name */}
        {step === 0 && (
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>
        )}

        {/* Form/Year selection step */}
        {requiresForm && step === 1 && (
          <View style={styles.grid}>
            {forms.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.formCard, form === f && styles.formCardActive]}
                onPress={() => setForm(f)}
              >
                <Text style={[styles.formCardText, form === f && styles.formCardTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Subjects step */}
        {step === subjectStep && (
          <View>
            <Text style={styles.selectAllHint}>
              {selectedSubjects.length}/{allSubjects.length} selected
            </Text>
            <View style={styles.subjectsGrid}>
              {allSubjects.map((subject) => (
                <TouchableOpacity
                  key={subject.id}
                  style={[
                    styles.subjectChip,
                    selectedSubjects.includes(subject.id) && styles.subjectChipActive,
                    selectedSubjects.includes(subject.id) && { borderColor: subject.color },
                  ]}
                  onPress={() => toggleSubject(subject.id)}
                >
                  {selectedSubjects.includes(subject.id) && (
                    <Ionicons name="checkmark-circle" size={14} color={subject.color} style={{ marginRight: 4 }} />
                  )}
                  <Text
                    style={[
                      styles.subjectChipText,
                      selectedSubjects.includes(subject.id) && { color: subject.color },
                    ]}
                    numberOfLines={1}
                  >
                    {subject.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Learning style step */}
        {step === steps.length - 1 && (
          <View style={styles.stylesGrid}>
            {LEARNING_STYLES.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={[styles.styleCard, learningStyle === style.id && styles.styleCardActive]}
                onPress={() => setLearningStyle(style.id)}
              >
                <View style={[styles.styleIcon, learningStyle === style.id && styles.styleIconActive]}>
                  <Ionicons
                    name={style.icon}
                    size={24}
                    color={learningStyle === style.id ? Colors.white : Colors.textSecondary}
                  />
                </View>
                <Text style={[styles.styleLabel, learningStyle === style.id && styles.styleLabelActive]}>
                  {style.label}
                </Text>
                <Text style={styles.styleDesc}>{style.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.nextBtn, loading && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient colors={Colors.gradientPrimary as unknown as string[]} style={styles.nextGradient}>
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Text style={styles.nextText}>
                  {step === steps.length - 1 ? 'Start Learning' : 'Continue'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.white} style={{ marginLeft: 8 }} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressRow: { flexDirection: 'row', gap: 8 },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  progressDotActive: { backgroundColor: Colors.primary, width: 24 },
  progressDotDone: { backgroundColor: Colors.success, width: 8 },
  stepLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 28 },
  inputGroup: { marginBottom: 24 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 54,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: Colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  formCard: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  formCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryAlpha },
  formCardText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  formCardTextActive: { color: Colors.primaryLight },
  selectAllHint: { fontSize: 12, color: Colors.textMuted, marginBottom: 12 },
  subjectsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
    maxWidth: '48%',
  },
  subjectChipActive: { backgroundColor: Colors.primaryAlpha },
  subjectChipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  stylesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  styleCard: {
    width: '47%',
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  styleCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryAlpha },
  styleIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.bgCardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  styleIconActive: { backgroundColor: Colors.primary },
  styleLabel: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  styleLabelActive: { color: Colors.primaryLight },
  styleDesc: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', lineHeight: 16 },
  nextBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  nextBtnDisabled: { opacity: 0.7 },
  nextGradient: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});
