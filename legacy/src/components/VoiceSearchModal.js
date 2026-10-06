import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Easing
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

const VOICE_PROMPTS = [
  "পুলিশ গাড়ি আটকে চাবি নিয়ে গেছে",
  "দোকানদার পণ্যের দাম বেশি চাচ্ছে",
  "ফেসবুকে ছবি ভাইরাল করার হুমকি দিচ্ছে",
  "ব্যাংক চেক বাউন্স করেছে টাকা দিচ্ছে না",
  "বিনা পরোয়ানায় পুলিশ বাসায় তল্লাশি করছে",
  "নোটিশ ছাড়া বাড়িওয়ালা বের করে দিচ্ছে",
];

export default function VoiceSearchModal({ visible, onClose, onSelectQuery }) {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [isListening, setIsListening] = useState(true);

  useEffect(() => {
    if (visible) {
      setIsListening(true);
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible]);

  if (!visible) return null;

  const handleSelect = (prompt) => {
    onSelectQuery(prompt);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.dialog}>
          {/* Header */}
          <View style={styles.dialogHeader}>
            <Text style={styles.dialogTitle}>ভয়েস আইনি সহকারী</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Feather name="x" size={22} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Animated Mic */}
          <View style={styles.micSection}>
            <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.micButton}>
                <MaterialIcons name="mic" size={42} color="#FFFFFF" />
              </View>
            </Animated.View>
            <Text style={styles.listeningText}>
              {isListening ? "আপনার সমস্যাটি স্পষ্ট করে বাংলায় বলুন..." : "শুনছি..."}
            </Text>
            <Text style={styles.listeningSubtext}>
              অফলাইন ভয়েস রিকগনিশন সক্রিয়
            </Text>
          </View>

          {/* Quick Voice Phrases */}
          <View style={styles.quickVoiceSection}>
            <Text style={styles.quickVoiceLabel}>অথবা সরাসরি নির্বাচিত বাক্যে ট্যাপ করুন:</Text>
            <View style={styles.promptsContainer}>
              {VOICE_PROMPTS.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.promptPill}
                  onPress={() => handleSelect(prompt)}
                >
                  <MaterialIcons name="record-voice-over" size={16} color={theme.colors.primary} />
                  <Text style={styles.promptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  dialog: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
  },
  micSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  pulseCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(29, 78, 216, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  micButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  listeningText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  listeningSubtext: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  quickVoiceSection: {
    marginTop: 16,
  },
  quickVoiceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  promptsContainer: {
    gap: 8,
  },
  promptPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  promptText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    flex: 1,
  }
});
