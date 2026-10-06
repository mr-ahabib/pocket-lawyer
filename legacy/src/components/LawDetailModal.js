import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { theme } from '../styles/theme';

export default function LawDetailModal({ visible, law, onClose }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!law) return null;

  const handleSpeak = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `${law.title}। ${law.act_name}, ${law.section}। শাস্তি: ${law.penalty}। নাগরিকের করণীয়: ${law.citizen_action}`;
    setIsSpeaking(true);
    Speech.speak(textToSpeak, {
      language: 'bn-BD',
      pitch: 1.0,
      rate: 0.95,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  const handleClose = () => {
    Speech.stop();
    setIsSpeaking(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Modal Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Feather name="x" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle} numberOfLines={1}>আইনি বিশ্লেষণ</Text>
          <TouchableOpacity
            style={[styles.audioBtn, isSpeaking && styles.audioBtnActive]}
            onPress={handleSpeak}
          >
            <MaterialIcons
              name={isSpeaking ? "stop" : "volume-up"}
              size={22}
              color={isSpeaking ? theme.colors.danger : theme.colors.primary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Act & Section Header Card */}
          <View style={styles.headerCard}>
            <View style={styles.badgeRow}>
              <View style={styles.actBadge}>
                <Text style={styles.actBadgeText}>{law.act_name}</Text>
              </View>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{law.section}</Text>
              </View>
            </View>

            <Text style={styles.lawTitle}>{law.title}</Text>

            <View style={styles.statusRow}>
              <View style={[
                styles.statusBadge,
                law.bailable === "জামিনযোগ্য" ? styles.statusBailable : styles.statusNonBailable
              ]}>
                <Feather
                  name={law.bailable === "জামিনযোগ্য" ? "check-circle" : "alert-octagon"}
                  size={14}
                  color={law.bailable === "জামিনযোগ্য" ? theme.colors.success : theme.colors.danger}
                />
                <Text style={[
                  styles.statusBadgeText,
                  { color: law.bailable === "জামিনযোগ্য" ? theme.colors.success : theme.colors.danger }
                ]}>
                  {law.bailable || "আইনি বিধান"}
                </Text>
              </View>

              <View style={[styles.statusBadge, styles.statusCategory]}>
                <Feather name="tag" size={14} color={theme.colors.primary} />
                <Text style={[styles.statusBadgeText, { color: theme.colors.primary }]}>
                  {law.category_bn || law.category}
                </Text>
              </View>
            </View>
          </View>

          {/* Section: Offense & Situation */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeadingRow}>
              <Feather name="alert-circle" size={18} color={theme.colors.warning} />
              <Text style={styles.sectionHeading}>কখন এটি প্রযোজ্য হয়?</Text>
            </View>
            <Text style={styles.sectionBodyText}>{law.offense_situation}</Text>
          </View>

          {/* Section: Statutory Provision */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeadingRow}>
              <Feather name="book" size={18} color={theme.colors.primary} />
              <Text style={styles.sectionHeading}>আইনের মূল বিধান (আইন ও ধারা)</Text>
            </View>
            <Text style={styles.legalProvisionText}>{law.legal_provision}</Text>
          </View>

          {/* Section: Penalty / Punishment */}
          <View style={[styles.sectionBox, styles.penaltyBox]}>
            <View style={styles.sectionHeadingRow}>
              <Feather name="shield" size={18} color={theme.colors.danger} />
              <Text style={[styles.sectionHeading, { color: theme.colors.danger }]}>
                শাস্তি ও জরিমানা
              </Text>
            </View>
            <Text style={styles.penaltyText}>{law.penalty}</Text>
          </View>

          {/* Section: Citizen Action Guide */}
          <View style={[styles.sectionBox, styles.actionBox]}>
            <View style={styles.sectionHeadingRow}>
              <Feather name="check-square" size={18} color={theme.colors.success} />
              <Text style={[styles.sectionHeading, { color: theme.colors.success }]}>
                নাগরিক হিসেবে আপনার তাৎক্ষণিক অধিকার ও করণীয়
              </Text>
            </View>
            <Text style={styles.actionBodyText}>{law.citizen_action}</Text>
          </View>

          {/* Read Aloud Helper Card */}
          <TouchableOpacity style={styles.voiceCard} onPress={handleSpeak}>
            <MaterialIcons
              name={isSpeaking ? "pause-circle-filled" : "play-circle-filled"}
              size={36}
              color={theme.colors.primary}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.voiceCardTitle}>
                {isSpeaking ? "পড়া থামাতে ট্যাপ করুন" : "সম্পূর্ণ আইনটি বাংলায় শুনুন"}
              </Text>
              <Text style={styles.voiceCardDesc}>অফলাইন স্পিচ অ্যাসিস্ট্যান্ট দ্বারা পাঠ করা হবে</Text>
            </View>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  audioBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryLight,
  },
  audioBtnActive: {
    backgroundColor: theme.colors.dangerLight,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 20,
    marginBottom: 16,
    ...theme.shadows.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  actBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  sectionBadge: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  lawTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    lineHeight: 28,
    marginBottom: 14,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  statusBailable: {
    backgroundColor: theme.colors.successLight,
  },
  statusNonBailable: {
    backgroundColor: theme.colors.dangerLight,
  },
  statusCategory: {
    backgroundColor: theme.colors.primaryLight,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionBox: {
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    marginBottom: 14,
  },
  penaltyBox: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  actionBox: {
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF5',
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  sectionBodyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  legalProvisionText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  penaltyText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.danger,
    lineHeight: 22,
  },
  actionBodyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#065F46',
    lineHeight: 22,
  },
  voiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
  },
  voiceCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  voiceCardDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  }
});
