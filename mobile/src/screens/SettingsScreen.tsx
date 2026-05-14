import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  Switch, TextInput, Modal, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { clearAllData, getPreferences, savePreferences } from '../lib/storage';

const LEVEL_LABELS: Record<string, string> = {
  'o-level': 'O-Level', 'a-level': 'A-Level', certificate: 'Certificate',
  'ordinary-diploma': 'Ordinary Diploma', 'higher-diploma': 'Higher Diploma',
  undergraduate: 'Undergraduate', postgraduate: 'Postgraduate',
};

const LEARNING_STYLES = [
  { id: 'visual', label: 'Visual', icon: 'eye-outline' as const, desc: 'Diagrams & visuals' },
  { id: 'auditory', label: 'Auditory', icon: 'volume-high-outline' as const, desc: 'Listening & speech' },
  { id: 'reading', label: 'Reading', icon: 'book-outline' as const, desc: 'Reading & writing' },
  { id: 'kinesthetic', label: 'Hands-on', icon: 'hand-left-outline' as const, desc: 'Practice & doing' },
];

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { profile, setProfile, clearProfile } = useProfile();

  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    getPreferences().then((prefs) => {
      setNotifications(prefs.notifications);
      setSounds(prefs.sounds);
      setAutoPlay(prefs.autoPlay);
    });
  }, []);

  const toggleNotifications = (v: boolean) => { setNotifications(v); savePreferences({ notifications: v }); };
  const toggleSounds = (v: boolean) => { setSounds(v); savePreferences({ sounds: v }); };
  const toggleAutoPlay = (v: boolean) => { setAutoPlay(v); savePreferences({ autoPlay: v }); };

  // Edit modal state
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState(profile?.name || '');
  const [editStyle, setEditStyle] = useState(profile?.learning_style || '');
  const [saving, setSaving] = useState(false);

  const displayName = profile?.name || user?.email?.split('@')[0] || 'Learner';
  const levelLabel = profile
    ? (LEVEL_LABELS[profile.level] || profile.level) + (profile.form ? ` — ${profile.form}` : '')
    : 'Not set';
  const styleLabel = profile?.learning_style
    ? profile.learning_style.charAt(0).toUpperCase() + profile.learning_style.slice(1)
    : 'Not set';

  const openEdit = () => {
    setEditName(profile?.name || '');
    setEditStyle(profile?.learning_style || '');
    setEditVisible(true);
  };

  const saveEdit = async () => {
    if (!editName.trim()) {
      Alert.alert('Name required', 'Please enter a display name.');
      return;
    }
    if (!editStyle) {
      Alert.alert('Learning style required', 'Please select a learning style.');
      return;
    }
    if (!profile) return;
    setSaving(true);
    await setProfile({ ...profile, name: editName.trim(), learning_style: editStyle });
    setSaving(false);
    setEditVisible(false);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); } },
    ]);
  };

  const handleResetProfile = () => {
    Alert.alert(
      'Reset Profile',
      'This will clear your education profile and progress data. Your account remains. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset', style: 'destructive',
          onPress: async () => { await clearProfile(); await clearAllData(); },
        },
      ],
    );
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <Text style={ss.sectionTitle}>{title}</Text>
  );

  const SettingRow = ({
    icon, iconColor, title, subtitle, value, onPress, rightEl, danger,
  }: {
    icon: keyof typeof Ionicons.glyphMap; iconColor?: string; title: string;
    subtitle?: string; value?: string; onPress?: () => void;
    rightEl?: React.ReactNode; danger?: boolean;
  }) => (
    <TouchableOpacity
      style={ss.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !rightEl}
    >
      <View style={[ss.rowIcon, { backgroundColor: (iconColor || Colors.primary) + '1c' }]}>
        <Ionicons name={icon} size={19} color={iconColor || Colors.primary} />
      </View>
      <View style={ss.rowContent}>
        <Text style={[ss.rowTitle, danger && ss.rowTitleDanger]}>{title}</Text>
        {subtitle && <Text style={ss.rowSubtitle}>{subtitle}</Text>}
      </View>
      {value && <Text style={ss.rowValue} numberOfLines={1}>{value}</Text>}
      {rightEl}
      {onPress && !rightEl && <Ionicons name="chevron-forward" size={15} color={Colors.textMuted} style={{ marginLeft: 4 }} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={ss.safeArea} edges={['top']}>
      <StatusBar style="light" />

      {/* Edit Profile Modal */}
      <Modal visible={editVisible} animationType="slide" transparent onRequestClose={() => setEditVisible(false)}>
        <View style={modal.overlay}>
          <View style={modal.sheet}>
            {/* Drag handle */}
            <View style={modal.handle} />

            <View style={modal.headerRow}>
              <Text style={modal.title}>Edit Profile</Text>
              <TouchableOpacity style={modal.closeBtn} onPress={() => setEditVisible(false)}>
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 20, paddingBottom: 8 }}>
              {/* Name */}
              <View>
                <Text style={modal.label}>Display Name</Text>
                <View style={modal.inputWrap}>
                  <Ionicons name="person-outline" size={17} color={Colors.textMuted} />
                  <TextInput
                    style={modal.input}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Your name"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Learning style */}
              <View>
                <Text style={modal.label}>Learning Style</Text>
                <View style={modal.stylesGrid}>
                  {LEARNING_STYLES.map((ls) => (
                    <Pressable
                      key={ls.id}
                      style={[modal.styleCard, editStyle === ls.id && modal.styleCardActive]}
                      onPress={() => setEditStyle(ls.id)}
                    >
                      <View style={[modal.styleIcon, editStyle === ls.id && modal.styleIconActive]}>
                        <Ionicons name={ls.icon} size={22} color={editStyle === ls.id ? '#fff' : Colors.textSecondary} />
                      </View>
                      <Text style={[modal.styleLabel, editStyle === ls.id && modal.styleLabelActive]}>
                        {ls.label}
                      </Text>
                      <Text style={modal.styleDesc}>{ls.desc}</Text>
                      {editStyle === ls.id && (
                        <View style={modal.styleTick}>
                          <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Read-only info */}
              <View style={modal.infoBox}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
                <Text style={modal.infoText}>
                  To change your education level or subjects, use Reset Profile in Account Actions below.
                </Text>
              </View>

              {/* Save button */}
              <TouchableOpacity
                style={[modal.saveBtn, saving && { opacity: 0.7 }]}
                onPress={saveEdit}
                disabled={saving}
                activeOpacity={0.85}
              >
                <LinearGradient colors={['#7c3aed', '#6366f1']} style={modal.saveBtnGrad}>
                  <Ionicons name={saving ? 'hourglass-outline' : 'checkmark'} size={18} color="#fff" />
                  <Text style={modal.saveBtnText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Hero */}
        <LinearGradient colors={['#1e0a4a', '#120a2e', '#0a0a0f']} style={ss.hero}>
          <LinearGradient colors={['#7c3aed', '#6366f1']} style={ss.avatarLarge}>
            <Text style={ss.avatarText}>{displayName[0]?.toUpperCase() || 'U'}</Text>
          </LinearGradient>
          <Text style={ss.heroName}>{displayName}</Text>
          <Text style={ss.heroEmail}>{user?.email}</Text>
          <View style={ss.heroBadgeRow}>
            <View style={ss.heroBadge}>
              <Ionicons name="school-outline" size={12} color={Colors.primaryLight} />
              <Text style={ss.heroBadgeText}>{levelLabel}</Text>
            </View>
            <TouchableOpacity style={ss.heroEditBtn} onPress={openEdit} activeOpacity={0.8}>
              <Ionicons name="create-outline" size={14} color={Colors.primaryLight} />
              <Text style={ss.heroEditBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={ss.content}>
          {/* Account */}
          <SectionTitle title="Account" />
          <View style={ss.card}>
            <SettingRow icon="person-outline" title="Display Name" value={displayName} />
            <View style={ss.divider} />
            <SettingRow
              icon="mail-outline"
              title="Email"
              value={(user?.email?.length || 0) > 22
                ? user?.email?.slice(0, 18) + '…'
                : user?.email || ''}
            />
            <View style={ss.divider} />
            <SettingRow
              icon="school-outline"
              iconColor={Colors.accent}
              title="Education Level"
              subtitle={levelLabel}
            />
          </View>

          {/* Learning */}
          <SectionTitle title="Learning Preferences" />
          <View style={ss.card}>
            <SettingRow
              icon="color-wand-outline"
              iconColor={Colors.secondary}
              title="Learning Style"
              value={styleLabel}
              onPress={openEdit}
            />
            <View style={ss.divider} />
            <SettingRow
              icon="notifications-outline"
              iconColor={Colors.warning}
              title="Study Reminders"
              rightEl={
                <Switch
                  value={notifications}
                  onValueChange={toggleNotifications}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor={notifications ? Colors.primaryLight : Colors.textMuted}
                />
              }
            />
            <View style={ss.divider} />
            <SettingRow
              icon="volume-high-outline"
              iconColor={Colors.success}
              title="Sound Effects"
              rightEl={
                <Switch
                  value={sounds}
                  onValueChange={toggleSounds}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor={sounds ? Colors.primaryLight : Colors.textMuted}
                />
              }
            />
            <View style={ss.divider} />
            <SettingRow
              icon="play-circle-outline"
              iconColor={Colors.accent}
              title="Auto-play Next Chapter"
              rightEl={
                <Switch
                  value={autoPlay}
                  onValueChange={toggleAutoPlay}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor={autoPlay ? Colors.primaryLight : Colors.textMuted}
                />
              }
            />
          </View>

          {/* Quick edit shortcut */}
          <TouchableOpacity style={ss.editShortcut} onPress={openEdit} activeOpacity={0.85}>
            <LinearGradient colors={[Colors.primary + '22', Colors.secondary + '11']} style={ss.editShortcutInner}>
              <Ionicons name="create-outline" size={22} color={Colors.primaryLight} />
              <View style={{ flex: 1 }}>
                <Text style={ss.editShortcutTitle}>Edit Name & Learning Style</Text>
                <Text style={ss.editShortcutSub}>Update your personalisation settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={17} color={Colors.primaryLight} />
            </LinearGradient>
          </TouchableOpacity>

          {/* About */}
          <SectionTitle title="About" />
          <View style={ss.card}>
            <SettingRow
              icon="information-circle-outline"
              iconColor={Colors.accent}
              title="App Version"
              value="1.0.0"
            />
            <View style={ss.divider} />
            <SettingRow icon="document-text-outline" iconColor={Colors.textSecondary} title="Terms of Service" onPress={() => {}} />
            <View style={ss.divider} />
            <SettingRow icon="shield-checkmark-outline" iconColor={Colors.textSecondary} title="Privacy Policy" onPress={() => {}} />
          </View>

          {/* Danger zone */}
          <SectionTitle title="Account Actions" />
          <View style={ss.card}>
            <SettingRow
              icon="refresh-outline"
              iconColor={Colors.warning}
              title="Reset Education Profile"
              subtitle="Re-do onboarding and change your level"
              onPress={handleResetProfile}
            />
            <View style={ss.divider} />
            <SettingRow
              icon="log-out-outline"
              iconColor={Colors.error}
              title="Sign Out"
              onPress={handleSignOut}
              danger
            />
          </View>

          <Text style={ss.footer}>EduAI OS — AI-Powered Personalised Learning</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const ss = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  hero: { alignItems: 'center', paddingTop: 18, paddingBottom: 28, paddingHorizontal: 20 },
  avatarLarge: {
    width: 84, height: 84, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    elevation: 10, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 14,
  },
  avatarText: { fontSize: 34, fontWeight: '900', color: '#fff' },
  heroName: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  heroEmail: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
  heroBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.primaryAlpha, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 10, borderWidth: 1, borderColor: Colors.primary + '30',
  },
  heroBadgeText: { fontSize: 12, color: Colors.primaryLight, fontWeight: '600' },
  heroEditBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  heroEditBtnText: { fontSize: 12, color: Colors.primaryLight, fontWeight: '700' },

  content: { padding: 16, gap: 10, paddingBottom: 104 },
  sectionTitle: {
    fontSize: 11, color: Colors.textMuted, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.7,
    marginBottom: 8, paddingHorizontal: 4, marginTop: 6,
  },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: 18,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 14, gap: 12, minHeight: 58,
  },
  rowIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '500', color: Colors.text },
  rowTitleDanger: { color: Colors.error },
  rowSubtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  rowValue: { fontSize: 13, color: Colors.textSecondary, maxWidth: 110, textAlign: 'right' },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 64 },

  editShortcut: {
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.primary + '35',
  },
  editShortcutInner: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16,
  },
  editShortcutTitle: { fontSize: 15, fontWeight: '700', color: Colors.primaryLight },
  editShortcutSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  footer: { textAlign: 'center', fontSize: 12, color: Colors.textMuted, marginTop: 6 },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#15152a',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 36,
    borderWidth: 1, borderColor: Colors.border,
    maxHeight: '90%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 16,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text },
  closeBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  label: { fontSize: 12, color: Colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.bgInput, borderRadius: 14, paddingHorizontal: 14, height: 52,
    borderWidth: 1, borderColor: Colors.border,
  },
  input: { flex: 1, fontSize: 16, color: Colors.text },
  stylesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  styleCard: {
    width: '47%', backgroundColor: Colors.bgCard,
    borderRadius: 14, padding: 14,
    borderWidth: 2, borderColor: Colors.border, alignItems: 'center', gap: 6,
  },
  styleCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryAlpha },
  styleIcon: {
    width: 48, height: 48, borderRadius: 13,
    backgroundColor: Colors.bgCardAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  styleIconActive: { backgroundColor: Colors.primary },
  styleLabel: { fontSize: 14, fontWeight: '700', color: Colors.text },
  styleLabelActive: { color: Colors.primaryLight },
  styleDesc: { fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
  styleTick: { position: 'absolute', top: 8, right: 8 },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.bgCard, padding: 12, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  infoText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  saveBtn: { borderRadius: 14, overflow: 'hidden', elevation: 8, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
  saveBtnGrad: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
