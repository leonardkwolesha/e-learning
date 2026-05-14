import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../theme/colors';
import { OnboardingStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'SelectEducation'>;
};

const { width } = Dimensions.get('window');

const EDUCATION_TYPES = [
  {
    id: 'secondary',
    title: 'Secondary School',
    subtitle: 'O-Level & A-Level (NECTA)',
    description: 'Tailored curriculum for Form 1–6 students following the NECTA syllabus.',
    icon: 'school' as const,
    color: Colors.primary,
    badge: 'Most Popular',
  },
  {
    id: 'college',
    title: 'College',
    subtitle: 'Certificate, Diploma & Higher Diploma (NACTE)',
    description: 'Vocational and technical education for NACTE-accredited programs.',
    icon: 'library' as const,
    color: Colors.accent,
    badge: null,
  },
  {
    id: 'university',
    title: 'University',
    subtitle: 'Undergraduate & Postgraduate',
    description: 'Advanced degree programs with research-level content and AI support.',
    icon: 'business' as const,
    color: Colors.success,
    badge: null,
  },
];

export default function SelectEducationScreen({ navigation }: Props) {
  const handleSelect = (educationType: string) => {
    if (educationType === 'secondary') {
      navigation.navigate('SelectLevel', { educationType });
    } else if (educationType === 'college') {
      navigation.navigate('SelectLevel', { educationType });
    } else {
      navigation.navigate('SelectLevel', { educationType });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={Colors.gradientHero as unknown as string[]} style={styles.gradient} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <LinearGradient colors={Colors.gradientPrimary as unknown as string[]} style={styles.logoIcon}>
            <Ionicons name="school" size={28} color={Colors.white} />
          </LinearGradient>
          <View style={styles.progressRow}>
            {[1, 2, 3].map((step) => (
              <View key={step} style={[styles.progressDot, step === 1 && styles.progressDotActive]} />
            ))}
          </View>
        </View>

        <Text style={styles.title}>What's your education level?</Text>
        <Text style={styles.subtitle}>
          We'll personalize your curriculum and learning experience based on your level.
        </Text>

        <View style={styles.cards}>
          {EDUCATION_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={styles.card}
              onPress={() => handleSelect(type.id)}
              activeOpacity={0.85}
            >
              <View style={styles.cardInner}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIcon, { backgroundColor: type.color + '20' }]}>
                    <Ionicons name={type.icon} size={28} color={type.color} />
                  </View>
                  {type.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{type.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardTitle}>{type.title}</Text>
                <Text style={[styles.cardSubtitle, { color: type.color }]}>{type.subtitle}</Text>
                <Text style={styles.cardDesc}>{type.description}</Text>
                <View style={styles.cardArrow}>
                  <Text style={[styles.cardArrowText, { color: type.color }]}>Choose this path</Text>
                  <Ionicons name="arrow-forward" size={16} color={type.color} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.note}>
          You can update your education level later in Settings.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 350 },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 36,
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  cards: { gap: 16 },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardInner: {
    backgroundColor: Colors.bgCard,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: Colors.primary + '25',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: Colors.primaryLight },
  cardTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  cardDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 16 },
  cardArrow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardArrowText: { fontSize: 14, fontWeight: '600' },
  note: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
});
