import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../theme/colors';
import { Message } from '../types';
import { tutorApi } from '../lib/api';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { getChatHistory, saveChatHistory, clearChatHistory } from '../lib/storage';

const SUGGESTIONS = [
  'Explain this concept simply',
  'Give me an example',
  'How is this used in real life?',
  'What are common mistakes?',
  'Quiz me on this topic',
];

const TOPIC_SUGGESTIONS = [
  'Python Programming',
  'Data Structures',
  'Database Design',
  'Network Security',
  'OOP Concepts',
  'Web Development',
  'Algorithms',
  'Machine Learning',
];

const LEVEL_LABELS: Record<string, string> = {
  'o-level': 'O-Level', 'a-level': 'A-Level', certificate: 'Certificate',
  'ordinary-diploma': 'Ordinary Diploma', 'higher-diploma': 'Higher Diploma',
  undergraduate: 'Undergraduate', postgraduate: 'Postgraduate',
};

const WELCOME_MESSAGE = (name?: string): Message => ({
  id: 'welcome',
  role: 'assistant',
  content: `Hi${name ? ` ${name}` : ''}! I'm your AI tutor.\n\nI'm here to help you learn and understand any topic. You can:\n• Ask me to explain concepts\n• Request worked examples\n• Get quizzed on topics\n• Ask follow-up questions\n\nWhat would you like to learn today?`,
  timestamp: new Date(),
});

export default function TutorScreen() {
  const { profile, subjects } = useProfile();
  const { user } = useAuth();
  const [sessionId] = useState(`tutor_${user?.id || 'anon'}`);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE(profile?.name)]);
  const [input, setInput] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [showTopics, setShowTopics] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    getChatHistory(sessionId).then((history) => {
      if (history.length > 0) setMessages(history);
    });
  }, [sessionId]);

  const scrollToBottom = () => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    const msgText = text.trim();
    if (!msgText || sending) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: msgText,
      timestamp: new Date(),
    };

    const thinkingMessage: Message = {
      id: `thinking_${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, thinkingMessage]);
    setInput('');
    setCharCount(0);
    setSending(true);
    scrollToBottom();

    try {
      const data = await tutorApi.sendMessage(sessionId, msgText) as { reply: string };
      setMessages((prev) => {
        const updated = prev.map((m) =>
          m.isStreaming ? { ...m, content: data.reply, isStreaming: false } : m,
        );
        saveChatHistory(sessionId, updated);
        return updated;
      });
    } catch {
      const fallbackReply = generateFallbackReply(msgText);
      setMessages((prev) => {
        const updated = prev.map((m) =>
          m.isStreaming ? { ...m, content: fallbackReply, isStreaming: false } : m,
        );
        saveChatHistory(sessionId, updated);
        return updated;
      });
    } finally {
      setSending(false);
    }
  };

  const clearConversation = () => {
    Alert.alert('Clear Chat', 'Start a fresh conversation with your AI tutor?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive',
        onPress: async () => {
          await clearChatHistory(sessionId);
          setMessages([WELCOME_MESSAGE(profile?.name)]);
        },
      },
    ]);
  };

  const generateFallbackReply = (question: string): string => {
    const q = question.toLowerCase();
    const levelName = profile?.level ? (LEVEL_LABELS[profile.level] || profile.level) : 'your level';
    const subjectList = subjects.slice(0, 3).map((s) => s.name).join(', ') || 'your subjects';

    if (q.includes('explain') || q.includes('what is') || q.includes('what are')) {
      return `Great question! As a ${levelName} student studying ${subjectList}, here's how I'd break this down:\n\n1. **Foundation**: This concept builds on what you already know at ${levelName}\n2. **Core idea**: Every principle has a central mechanism — focus on understanding that first\n3. **Practice**: Apply it to small examples before tackling harder problems\n\nWould you like me to go deeper into any specific aspect?`;
    }
    if (q.includes('example') || q.includes('show me')) {
      return `Here's a practical example relevant to ${levelName} study:\n\n\`\`\`\n// Step 1: Define the problem\ninput → process → output\n\n// Step 2: Apply the concept\nresult = apply_concept(input_data)\n\`\`\`\n\nWalk through it step by step. Does this make the concept clearer? Any part you'd like me to expand on?`;
    }
    if (q.includes('quiz') || q.includes('test me')) {
      return `Let's test your understanding!\n\n**Question**: Which statement best describes the key principle you've been studying?\n\nA) It only applies in theoretical scenarios\nB) It solves a real problem by mapping inputs to structured outputs\nC) It was invented recently with no historical basis\nD) It works independently without any prerequisites\n\nThink it through — take your time!`;
    }
    if (q.includes('real life') || q.includes('application') || q.includes('why')) {
      return `Great — this is where ${subjectList.split(',')[0] || 'this subject'} gets really interesting!\n\nReal-world applications include:\n• Industry professionals use this concept daily in their work\n• It solves problems that affect millions of people\n• Many tools and systems you use are built on this foundation\n\nAt the ${levelName} level, understanding the "why" is just as important as the "how". Want a specific industry example?`;
    }
    return `That's a thoughtful question! Here's my response tailored for ${levelName} level:\n\nThis topic is important because:\n• It forms the foundation for more advanced concepts in ${subjectList.split(',')[0] || 'your field'}\n• It connects to real-world problems you'll encounter\n• Understanding it deeply will strengthen your overall knowledge\n\nWould you like me to elaborate on any specific aspect, or shall we work through an example together?`;
  };

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    setShowTopics(false);
    setInput(`Help me understand ${topic}`);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <LinearGradient colors={Colors.gradientPrimary as unknown as string[]} style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={14} color={Colors.white} />
          </LinearGradient>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
          {item.isStreaming ? (
            <View style={styles.thinkingRow}>
              <ActivityIndicator size="small" color={Colors.primaryLight} />
              <Text style={styles.thinkingText}>Thinking...</Text>
            </View>
          ) : (
            <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{item.content}</Text>
          )}
          <Text style={[styles.timestamp, isUser && styles.timestampUser]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.aiInfo}>
          <LinearGradient colors={Colors.gradientPrimary as unknown as string[]} style={styles.aiIconBig}>
            <Ionicons name="sparkles" size={20} color={Colors.white} />
          </LinearGradient>
          <View>
            <Text style={styles.aiName}>AI Tutor</Text>
            <View style={styles.aiStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Online & Ready</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={styles.topicsBtn}
            onPress={() => setShowTopics(!showTopics)}
          >
            <Ionicons name="book-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.topicsBtnText}>Topics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topicsBtn} onPress={clearConversation}>
            <Ionicons name="trash-outline" size={17} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Topic dropdown */}
      {showTopics && (
        <View style={styles.topicsDropdown}>
          <Text style={styles.topicsDropdownTitle}>Quick Topics</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topicsScroll}>
            {[...TOPIC_SUGGESTIONS, ...subjects.map((s) => s.name)].slice(0, 10).map((topic) => (
              <TouchableOpacity
                key={topic}
                style={[styles.topicChip, selectedTopic === topic && styles.topicChipActive]}
                onPress={() => handleTopicSelect(topic)}
              >
                <Text style={[styles.topicChipText, selectedTopic === topic && styles.topicChipTextActive]}>
                  {topic}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
      />

      {/* Suggestions */}
      {messages.length < 3 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsScroll}
        >
          {SUGGESTIONS.map((s) => (
            <TouchableOpacity
              key={s}
              style={styles.suggestionChip}
              onPress={() => sendMessage(s)}
            >
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputContainer}>
          <View style={{ flex: 1 }}>
            <TextInput
              style={styles.input}
              placeholder="Ask your AI tutor anything..."
              placeholderTextColor={Colors.textMuted}
              value={input}
              onChangeText={(t) => { setInput(t); setCharCount(t.length); }}
              multiline
              maxLength={1000}
              onSubmitEditing={() => sendMessage(input)}
              blurOnSubmit={false}
            />
            {charCount > 0 && (
              <Text style={styles.charCount}>{charCount}/1000</Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || sending}
          >
            <LinearGradient
              colors={Colors.gradientPrimary as unknown as string[]}
              style={styles.sendBtnGrad}
            >
              {sending ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Ionicons name="send" size={18} color={Colors.white} />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg, paddingBottom: 80 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  aiInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiIconBig: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  aiStatus: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  statusText: { fontSize: 11, color: Colors.success, fontWeight: '500' },
  topicsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  topicsBtnText: { fontSize: 13, color: Colors.textSecondary },
  topicsDropdown: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 12,
    backgroundColor: Colors.bgCardAlt,
  },
  topicsDropdownTitle: { fontSize: 12, color: Colors.textMuted, fontWeight: '600', paddingHorizontal: 16, marginBottom: 8 },
  topicsScroll: { paddingHorizontal: 16, gap: 8 },
  topicChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topicChipActive: { backgroundColor: Colors.primaryAlpha, borderColor: Colors.primary + '50' },
  topicChipText: { fontSize: 13, color: Colors.textSecondary },
  topicChipTextActive: { color: Colors.primaryLight, fontWeight: '600' },
  messagesList: { padding: 16, gap: 16, paddingBottom: 8 },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: '88%',
  },
  messageRowUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bubble: {
    backgroundColor: Colors.bgCard,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: '100%',
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 15, color: Colors.text, lineHeight: 22 },
  bubbleTextUser: { color: Colors.white },
  timestamp: { fontSize: 10, color: Colors.textMuted, marginTop: 4 },
  timestampUser: { color: 'rgba(255,255,255,0.6)', textAlign: 'right' },
  thinkingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  thinkingText: { fontSize: 14, color: Colors.textMuted, fontStyle: 'italic' },
  suggestionsScroll: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.primaryAlpha,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  suggestionText: { fontSize: 13, color: Colors.primaryLight, fontWeight: '500' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  charCount: { fontSize: 10, color: Colors.textMuted, textAlign: 'right', paddingRight: 6, paddingTop: 3 },
  sendBtn: { borderRadius: 22, overflow: 'hidden' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnGrad: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
