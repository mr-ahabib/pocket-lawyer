import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Share,
  StatusBar
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { theme } from './src/styles/theme';
import { initDB } from './src/database/db';
import { BANGLADESH_LAWS } from './src/database/lawData';
import { processUserMessage } from './src/ai/aiLawyerEngine';

import LawLibraryModal from './src/components/LawLibraryModal';
import GdToolkitModal from './src/components/GdToolkitModal';
import LawDetailModal from './src/components/LawDetailModal';
import VoiceSearchModal from './src/components/VoiceSearchModal';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [conversationState, setConversationState] = useState({});
  const [speakingMsgId, setSpeakingMsgId] = useState(null);

  // Modals state
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isGdOpen, setIsGdOpen] = useState(false);
  const [selectedLaw, setSelectedLaw] = useState(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const scrollViewRef = useRef(null);

  useEffect(() => {
    try {
      initDB();
    } catch (e) {
      console.log("DB init error:", e);
    }
    // Proactive initial greeting from Pocket Lawyer AI
    initGreeting();
  }, []);

  const initGreeting = () => {
    Speech.stop();
    setSpeakingMsgId(null);
    const greetingResponse = processUserMessage("reset_flow", {});
    setMessages([
      {
        id: 'msg_init',
        sender: 'ai',
        text: greetingResponse.text,
        options: greetingResponse.options,
        timestamp: new Date()
      }
    ]);
    setConversationState(greetingResponse.state || {});
  };

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputText;
    if (!text || text.trim() === '') return;

    Speech.stop();
    setSpeakingMsgId(null);

    const userMsgId = `user_${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Process through Conversational Semantic AI Lawyer Engine
    setTimeout(() => {
      const aiResponse = processUserMessage(text, conversationState);
      const aiMsgId = `ai_${Date.now()}`;
      
      const newAiMsg = {
        id: aiMsgId,
        sender: 'ai',
        type: aiResponse.type,
        text: aiResponse.text,
        advisory: aiResponse.advisory,
        relatedLaw: aiResponse.relatedLaw,
        options: aiResponse.options || aiResponse.nextOptions || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newAiMsg]);
      setConversationState(aiResponse.state || {});

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 350);
  };

  const handleOptionClick = (option) => {
    if (option.value.startsWith('view_law_')) {
      const lawId = parseInt(option.value.replace('view_law_', ''), 10);
      const law = BANGLADESH_LAWS.find(l => l.id === lawId);
      if (law) setSelectedLaw(law);
      return;
    }

    if (option.value === 'reset_flow') {
      initGreeting();
      return;
    }

    // Send the user selection as message
    handleSendMessage(option.value);
  };

  const handleSpeakText = (msgId, textToSpeak) => {
    if (speakingMsgId === msgId) {
      Speech.stop();
      setSpeakingMsgId(null);
      return;
    }

    Speech.stop();
    setSpeakingMsgId(msgId);
    Speech.speak(textToSpeak, {
      language: 'bn-BD',
      pitch: 1.0,
      rate: 0.95,
      onDone: () => setSpeakingMsgId(null),
      onError: () => setSpeakingMsgId(null)
    });
  };

  const handleCallHotline = (number) => {
    Linking.openURL(`tel:${number}`).catch(err => console.log(err));
  };

  const handleShareAdvisory = async (adv) => {
    try {
      await Share.share({
        message: `পকেট আইনজীবী পরামর্শ:\n\nসিদ্ধান্ত: ${adv.verdict}\n\nযা বলবেন:\n"${adv.what_to_say}"\n\nআইন: ${adv.act_name}, ${adv.section}\nহটলাইন: ${adv.hotline}`,
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Sleek Minimal Header */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <View style={styles.brandIconWrapper}>
            <MaterialIcons name="gavel" size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.brandTitle}>পকেট আইনজীবী</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusLabel}>অফলাইন এআই সক্রিয়</Text>
            </View>
          </View>
        </View>

        {/* Action Shortcuts */}
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setIsLibraryOpen(true)}>
            <Feather name="book-open" size={15} color={theme.colors.primary} />
            <Text style={styles.headerBtnText}>আইনকোষ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerBtn} onPress={() => setIsGdOpen(true)}>
            <Feather name="file-text" size={15} color={theme.colors.primary} />
            <Text style={styles.headerBtnText}>জিডি</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetIconBtn} onPress={initGreeting}>
            <Feather name="refresh-cw" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Conversational Stream */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            if (isUser) {
              return (
                <View key={msg.id} style={styles.userBubbleWrapper}>
                  <View style={styles.userBubble}>
                    <Text style={styles.userBubbleText}>{msg.text}</Text>
                  </View>
                </View>
              );
            }

            // AI Lawyer Message Bubble
            return (
              <View key={msg.id} style={styles.aiBubbleWrapper}>
                <View style={styles.avatarRow}>
                  <View style={styles.aiAvatar}>
                    <MaterialIcons name="psychology" size={18} color="#FFFFFF" />
                  </View>
                  <Text style={styles.aiName}>আইনি পরামর্শক</Text>
                </View>

                {/* Normal Text or Question */}
                <View style={styles.aiBubble}>
                  <Text style={styles.aiBubbleText}>{msg.text}</Text>
                </View>

                {/* Structured Advisory Card */}
                {msg.advisory && (
                  <View style={styles.advisoryCard}>
                    {/* Verdict */}
                    <View style={styles.verdictSection}>
                      <View style={styles.verdictBadge}>
                        <Feather name="shield" size={13} color={theme.colors.success} />
                        <Text style={styles.verdictBadgeText}>আইনি অবস্থান ও রায়</Text>
                      </View>
                      <Text style={styles.verdictHeading}>{msg.advisory.verdict}</Text>
                      <Text style={styles.statuteTag}>
                        আইন: {msg.advisory.act_name} ({msg.advisory.section})
                      </Text>
                    </View>

                    {/* What to Say Verbatim Script */}
                    <View style={styles.scriptSection}>
                      <View style={styles.scriptHeader}>
                        <MaterialIcons name="record-voice-over" size={18} color={theme.colors.primary} />
                        <Text style={styles.scriptTitle}>কর্মকর্তা বা পুলিশকে যা বলবেন</Text>
                      </View>
                      <View style={styles.quoteBox}>
                        <Text style={styles.quoteText}>"{msg.advisory.what_to_say}"</Text>
                      </View>
                    </View>

                    {/* Immediate Steps */}
                    {msg.advisory.immediate_steps && (
                      <View style={styles.stepsSection}>
                        <Text style={styles.stepsTitle}>তাৎক্ষণিক করণীয় পদক্ষেপ:</Text>
                        {msg.advisory.immediate_steps.map((st, i) => (
                          <View key={i} style={styles.stepRow}>
                            <View style={styles.stepDot}>
                              <Text style={styles.stepDotText}>{i + 1}</Text>
                            </View>
                            <Text style={styles.stepText}>{st}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Danger Warning */}
                    {msg.advisory.danger_warning && (
                      <View style={styles.warningBox}>
                        <Feather name="alert-triangle" size={15} color={theme.colors.danger} />
                        <Text style={styles.warningText}>{msg.advisory.danger_warning}</Text>
                      </View>
                    )}

                    {/* Card Actions: Speak, Share, Hotline */}
                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        style={[styles.actionPill, speakingMsgId === msg.id && styles.actionPillActive]}
                        onPress={() => handleSpeakText(msg.id, `${msg.advisory.verdict}। যা বলবেন: ${msg.advisory.what_to_say}। সংশ্লিষ্ট আইন: ${msg.advisory.act_name}`)}
                      >
                        <MaterialIcons
                          name={speakingMsgId === msg.id ? "stop" : "volume-up"}
                          size={16}
                          color={speakingMsgId === msg.id ? "#FFFFFF" : theme.colors.primary}
                        />
                        <Text style={[styles.actionPillText, speakingMsgId === msg.id && { color: "#FFFFFF" }]}>
                          {speakingMsgId === msg.id ? "থামুন" : "শুনুন"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionPill}
                        onPress={() => handleShareAdvisory(msg.advisory)}
                      >
                        <Feather name="share-2" size={14} color={theme.colors.textPrimary} />
                        <Text style={styles.actionPillText}>শেয়ার</Text>
                      </TouchableOpacity>

                      {msg.advisory.hotline && (
                        <TouchableOpacity
                          style={[styles.actionPill, styles.hotlinePill]}
                          onPress={() => handleCallHotline(msg.advisory.hotline.split(' ')[0])}
                        >
                          <Feather name="phone" size={13} color={theme.colors.success} />
                          <Text style={[styles.actionPillText, { color: theme.colors.success }]}>কল করুন</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}

                {/* Proactive Interactive Option Chips */}
                {msg.options && msg.options.length > 0 && (
                  <View style={styles.optionsContainer}>
                    {msg.options.map((opt, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.optionChip}
                        onPress={() => handleOptionClick(opt)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.optionChipText}>{opt.label}</Text>
                        <Feather name="arrow-up-right" size={13} color={theme.colors.primary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Clean, Floating Bottom Input Bar */}
        <View style={styles.bottomBarWrapper}>
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.micBtn} onPress={() => setIsVoiceOpen(true)}>
              <MaterialIcons name="mic" size={22} color={theme.colors.primary} />
            </TouchableOpacity>

            <TextInput
              style={styles.chatInput}
              placeholder="আইনি সমস্যাটি সংক্ষেপে লিখুন..."
              placeholderTextColor={theme.colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSendMessage()}
              returnKeyType="send"
            />

            {inputText.trim().length > 0 && (
              <TouchableOpacity style={styles.sendBtn} onPress={() => handleSendMessage()}>
                <Feather name="arrow-up" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Slide-over Modals */}
      <LawLibraryModal
        visible={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectLaw={(law) => setSelectedLaw(law)}
      />

      <GdToolkitModal
        visible={isGdOpen}
        onClose={() => setIsGdOpen(false)}
      />

      <LawDetailModal
        visible={!!selectedLaw}
        law={selectedLaw}
        onClose={() => setSelectedLaw(null)}
      />

      <VoiceSearchModal
        visible={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSelectQuery={(q) => handleSendMessage(q)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 32 : 0,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.success,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  resetIconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
  },
  chatScroll: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  userBubbleWrapper: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  userBubble: {
    maxWidth: '82%',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  userBubbleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  aiBubbleWrapper: {
    alignItems: 'flex-start',
    marginBottom: 18,
    maxWidth: '96%',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  aiAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiName: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    ...theme.shadows.sm,
  },
  aiBubbleText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 22,
  },
  advisoryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    width: '100%',
    ...theme.shadows.sm,
  },
  verdictSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 12,
  },
  verdictBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  verdictBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.success,
  },
  verdictHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
  },
  statuteTag: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
    marginTop: 4,
  },
  scriptSection: {
    marginBottom: 12,
  },
  scriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  scriptTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  quoteBox: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    padding: 10,
    borderRadius: 6,
  },
  quoteText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  stepsSection: {
    marginBottom: 12,
  },
  stepsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 6,
  },
  stepDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepDotText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  stepText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    color: '#991B1B',
    lineHeight: 16,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  hotlinePill: {
    backgroundColor: theme.colors.successLight,
    borderColor: '#A7F3D0',
  },
  optionsContainer: {
    marginTop: 10,
    gap: 6,
    width: '100%',
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  optionChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  bottomBarWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  micBtn: {
    padding: 8,
  },
  chatInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
  }
});
