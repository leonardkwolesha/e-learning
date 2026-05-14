import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../theme/colors';
import { OnboardingStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'SelectLevel'>;
  route: RouteProp<OnboardingStackParamList, 'SelectLevel'>;
};

const LEVELS: Record<string, { id: string; title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap; color: string }[]> = {
  secondary: [
    { id: 'o-level', title: 'O-Level', subtitle: 'Form 1 – Form 4', icon: 'school-outline', color: Colors.primary },
    { id: 'a-level', title: 'A-Level', subtitle: 'Form 5 – Form 6', icon: 'ribbon-outline', color: Colors.secondary },
  ],
  college: [
    { id: 'certificate', title: 'Certificate', subtitle: '1-year program', icon: 'document-text-outline', color: Colors.accent },
    { id: 'ordinary-diploma', title: 'Ordinary Diploma', subtitle: '2-year program', icon: 'newspaper-outline', color: Colors.primary },
    { id: 'higher-diploma', title: 'Higher Diploma', subtitle: '3-year program', icon: 'medal-outline', color: Colors.success },
  ],
  university: [
    { id: 'undergraduate', title: 'Undergraduate', subtitle: 'Bachelor\'s Degree (3–4 years)', icon: 'school-outline', color: Colors.primary },
    { id: 'postgraduate', title: 'Postgraduate', subtitle: 'Master\'s or PhD', icon: 'trophy-outline', color: Colors.warning },
  ],
};

const TITLES: Record<string, string> = {
  secondary: 'Which level are you in?',
  college: 'What\'s your college program?',
  university: 'Undergraduate or Postgraduate?',
};

export default function SelectLevelScreen({ navigation, route }: Props) {
  const { educationType } = route.params;
  const levels = LEVELS[educationType] || [];

  const handleSelect = (level: string) => {
    navigation.navigate('Onboarding', { educationType, level });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={Colors.gradientHero as unknown as string[]} style={styles.gradient} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.progressRow}>
            {[1, 2, 3].map((step) => (
              <View key={step} style={[styles.progressDot, step <= 2 && styles.progressDotActive]} />
            ))}
          </View>
        </View>

        <Text style={styles.title}>{TITLES[educationType] || 'Select your level'}</Text>
        <Text style={styles.subtitle}>
          This helps us match the right content and curriculum for you.
        </Text>

        <View style={styles.levels}>
          {levels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={styles.levelCard}
              onPress={() => handleSelect(level.id)}
              activeOpacity={0.85}
            >
              <View style={[styles.levelIcon, { backgroundColor: level.color + '20' }]}>
                <Ionicons name={level.icon} size={28} color={level.color} />
              </View>
              <View style={styles.levelContent}>
                <Text style={styles.levelTitle}>{level.title}</Text>
                <Text style={styles.levelSubtitle}>{level.subtitle}</Text>
              </View>
              <View style={[styles.levelArrow, { backgroundColor: level.color + '20' }]}>
                <Ionicons name="chevron-forward" size={20} color={level.color} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    marginBottom: 36,
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
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 32 },
  levels: { gap: 14 },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  levelIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelContent: { flex: 1 },
  levelTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  levelSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  levelArrow: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
