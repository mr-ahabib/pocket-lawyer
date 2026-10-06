import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { theme } from '../styles/theme';
import { DECISION_TREE } from '../ai/decisionTree';

export default function AiConsultantScreen({ initialNode = 'root', onResetToHome }) {
  const [currentNodeId, setCurrentNodeId] = useState(initialNode);
  const [history, setHistory] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentNode = DECISION_TREE[currentNodeId] || DECISION_TREE.root;

  const handleSelectOption = (option) => {
    Speech.stop();
    setIsSpeaking(false);
    if (option.next && DECISION_TREE[option.next]) {
      setHistory(prev => [...prev, currentNodeId]);
      setCurrentNodeId(option.next);
    }
  };

  const handleBack = () => {
    Speech.stop();
    setIsSpeaking(false);
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setCurrentNodeId(prev);
    }
  };

  const handleReset = () => {
    Speech.stop();
    setIsSpeaking(false);
    setHistory([]);
    setCurrentNodeId('root');
  };

  const handleSpeakAdvisory = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    if (!currentNode.isTerminal) return;

    const text = `আইনি সিদ্ধান্ত: ${currentNode.verdict}। যা বলবেন: ${currentNode.what_to_say}। সংশ্লিষ্ট আইন: ${currentNode.law_reference}।`;
    setIsSpeaking(true);
    Speech.speak(text, {
      language: 'bn-BD',
      pitch: 1.0,
      rate: 0.95,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  const handleShare = async () => {
    if (!currentNode.isTerminal) return;
    try {
      await Share.share({
        message: `পকেট আইনজীবী পরামর্শ:\n\nসিদ্ধান্ত: ${currentNode.verdict}\n\nযা বলবেন:\n"${currentNode.what_to_say}"\n\nআইন: ${currentNode.law_reference}\nহটলাইন: ${currentNode.hotline}`,
      });
    } catch (e) {
      console.log("Share error:", e);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Session Bar */}
      <View style={styles.topSessionBar}>
        {history.length > 0 ? (
          <TouchableOpacity style={styles.navBtn} onPress={handleBack}>
            <Feather name="arrow-left" size={18} color={theme.colors.textPrimary} />
            <Text style={styles.navBtnText}>পূর্ববর্তী প্রশ্ন</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.tagSession}>
            <Feather name="cpu" size={14} color={theme.colors.primary} />
            <Text style={styles.tagSessionText}>রুল-বেইজড আইনি ডিসিশন ট্রি</Text>
          </View>
        )}

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Feather name="refresh-cw" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.resetBtnText}>রিসেট</Text>
        </TouchableOpacity>
      </View>

      {/* Terminal Node: Final Legal Advisory */}
      {currentNode.isTerminal ? (
        <View style={styles.terminalContainer}>
          {/* Verdict Banner */}
          <View style={styles.verdictCard}>
            <View style={styles.verdictIconRow}>
              <View style={styles.verdictIcon}>
                <Feather name="check-circle" size={24} color={theme.colors.success} />
              </View>
              <Text style={styles.verdictHeader}>আইনি সমাধান ও বিশ্লেষণ</Text>
            </View>
            <Text style={styles.verdictTitle}>{currentNode.verdict}</Text>
            <View style={styles.lawRefBadge}>
              <Text style={styles.lawRefText}>আইন: {currentNode.law_reference}</Text>
            </View>
          </View>

          {/* Script: What to say verbatim */}
          <View style={styles.scriptBox}>
            <View style={styles.scriptHeader}>
              <MaterialIcons name="record-voice-over" size={20} color={theme.colors.primary} />
              <Text style={styles.scriptTitle}>পুলিশ বা সংশ্লিষ্ট ব্যক্তিকে যা বলবেন</Text>
            </View>
            <Text style={styles.scriptSub}>শান্ত ও মার্জিতভাবে এই কথাগুলো বলুন:</Text>
            <View style={styles.quoteCard}>
              <Text style={styles.quoteText}>"{currentNode.what_to_say}"</Text>
            </View>
          </View>

          {/* Immediate Steps */}
          {currentNode.immediate_steps && (
            <View style={styles.stepsBox}>
              <View style={styles.stepsHeader}>
                <Feather name="list" size={18} color={theme.colors.textPrimary} />
                <Text style={styles.stepsTitle}>তাত্ক্ষণিক পদক্ষেপ</Text>
              </View>
              {currentNode.immediate_steps.map((step, idx) => (
                <View key={idx} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Danger / Caution Warning */}
          {currentNode.danger_warning && (
            <View style={styles.warningBox}>
              <Feather name="alert-triangle" size={18} color={theme.colors.danger} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.warningTitle}>যা কখনো করবেন না (সতর্কতা):</Text>
                <Text style={styles.warningText}>{currentNode.danger_warning}</Text>
              </View>
            </View>
          )}

          {/* Hotline */}
          {currentNode.hotline && (
            <View style={styles.hotlineBox}>
              <Feather name="phone-call" size={16} color={theme.colors.primary} />
              <Text style={styles.hotlineText}>
                প্রয়োজনে তাৎক্ষণিক কল করুন: <Text style={{ fontWeight: '800' }}>{currentNode.hotline}</Text>
              </Text>
            </View>
          )}

          {/* Action Buttons: Audio & Share */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.audioActionBtn, isSpeaking && styles.audioActionBtnActive]}
              onPress={handleSpeakAdvisory}
            >
              <MaterialIcons
                name={isSpeaking ? "stop" : "volume-up"}
                size={20}
                color={isSpeaking ? '#FFFFFF' : theme.colors.primary}
              />
              <Text style={[styles.audioActionText, isSpeaking && { color: '#FFFFFF' }]}>
                {isSpeaking ? "থামুন" : "পরামর্শ শুনুন"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareActionBtn} onPress={handleShare}>
              <Feather name="share-2" size={18} color={theme.colors.textPrimary} />
              <Text style={styles.shareActionText}>পরামর্শ শেয়ার করুন</Text>
            </TouchableOpacity>
          </View>

          {/* Restart Button */}
          <TouchableOpacity style={styles.restartBtn} onPress={handleReset}>
            <Text style={styles.restartBtnText}>অন্য কোনো পরিস্থিতি পরীক্ষা করুন</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Question & Option Selection */
        <View style={styles.questionContainer}>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepIndicatorText}>ধাপ {history.length + 1}</Text>
          </View>

          <Text style={styles.questionText}>{currentNode.question}</Text>
          {currentNode.description && (
            <Text style={styles.questionDesc}>{currentNode.description}</Text>
          )}

          <View style={styles.optionsList}>
            {currentNode.options.map((opt, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionCard}
                onPress={() => handleSelectOption(opt)}
                activeOpacity={0.7}
              >
                <View style={styles.optionIndex}>
                  <Text style={styles.optionIndexText}>{index + 1}</Text>
                </View>
                <Text style={styles.optionText}>{opt.text}</Text>
                <Feather name="chevron-right" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  topSessionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  tagSession: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagSessionText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  questionContainer: {
    paddingVertical: 8,
  },
  stepIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  stepIndicatorText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    lineHeight: 28,
    marginBottom: 8,
  },
  questionDesc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 24,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    padding: 16,
    ...theme.shadows.sm,
  },
  optionIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionIndexText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    lineHeight: 21,
  },
  terminalContainer: {
    paddingBottom: 24,
  },
  verdictCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  verdictIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  verdictIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verdictHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.success,
  },
  verdictTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#14532D',
    lineHeight: 26,
    marginBottom: 10,
  },
  lawRefBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lawRefText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
  scriptBox: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    marginBottom: 16,
    ...theme.shadows.sm,
  },
  scriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  scriptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  scriptSub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 12,
  },
  quoteCard: {
    backgroundColor: theme.colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    borderRadius: 10,
    padding: 14,
  },
  quoteText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  stepsBox: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    marginBottom: 16,
  },
  stepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  stepsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 21,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.danger,
    marginBottom: 2,
  },
  warningText: {
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 18,
  },
  hotlineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 20,
  },
  hotlineText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  audioActionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingVertical: 14,
  },
  audioActionBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  audioActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  shareActionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingVertical: 14,
  },
  shareActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  restartBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  restartBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  }
});
