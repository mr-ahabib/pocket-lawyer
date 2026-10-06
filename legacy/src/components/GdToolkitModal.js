import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Share
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { EMERGENCY_HOTLINES } from '../database/lawData';

const GD_LOST = `বরাবর,
ভারপ্রাপ্ত কর্মকর্তা (OC)
................. থানা, ঢাকা।

বিষয়: জাতীয় পরিচয়পত্র (NID) / ডকুমেন্ট হারানো সংক্রান্ত সাধারণ ডায়েরি (GD)।

জনাব,
বিনীত নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ................. (নাম), পিতা: ................., বর্তমান ঠিকানা: .................।

অদ্য ................. তারিখে আনুমানিক ................. ঘটিকার সময় ................. এলাকা থেকে আমার মূল জাতীয় পরিচয়পত্র / পাসপোর্ট / চেকবইটি অসাবধানতাবশত হারিয়ে যায়। অনেক খোঁজাখুঁজি করিয়াও পাওয়া যায় নাই।

আইনি নিরাপত্তার স্বার্থে বিষয়টি আপনার থানায় সাধারণ ডায়েরিভুক্ত করার অনুরোধ জানাচ্ছি।

বিনীত,
নাম: .................
মোবাইল: .................
তারিখ: .................`;

const GD_THREAT = `বরাবর,
ভারপ্রাপ্ত কর্মকর্তা (OC)
................. থানা, ঢাকা।

বিষয়: অপরাধমূলক ভীতি প্রদর্শন ও প্রাণনাশের হুমকি সংক্রান্ত সাধারণ ডায়েরি (GD)।

জনাব,
বিনীত নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ................. (নাম), ঠিকানা: .................।

অদ্য ................. তারিখে আনুমানিক ................. ঘটিকায় বিবাদী ................. (নাম ও মোবাইল) আমাকে সরাসরি / ফোনে অকথ্য ভাষায় গালিগালাজ করে এবং জানমালের ক্ষতিসহ প্রাণনাশের হুমকি দেয় (কল রেকর্ড সংরক্ষিত আছে)। 

এমতাবস্থায় আমি চরম নিরাপত্তাহীনতায় ভুগছি। প্রয়োজনীয় আইনানুগ ব্যবস্থা গ্রহণের সুবিধার্থে বিষয়টি থানায় সাধারণ ডায়েরিভুক্ত করার আবেদন করছি।

বিনীত,
নাম: .................
মোবাইল: .................
তারিখ: .................`;

export default function GdToolkitModal({ visible, onClose }) {
  const [activeTab, setActiveTab] = useState('gd'); // 'gd' | 'rights' | 'hotlines'

  if (!visible) return null;

  const handleShare = async (title, content) => {
    try {
      await Share.share({ title, message: content });
    } catch (e) {
      console.log("Share error:", e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>জিডি ড্রাফট ও নাগরিক অধিকার</Text>
            <Text style={styles.headerSub}>থানার জিডি ফরম্যাট, সাংবিধানিক অধিকার ও হটলাইন</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Feather name="x" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Segmented Control */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'gd' && styles.tabItemActive]}
            onPress={() => setActiveTab('gd')}
          >
            <Text style={[styles.tabText, activeTab === 'gd' && styles.tabTextActive]}>জিডি ফরম্যাট</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'rights' && styles.tabItemActive]}
            onPress={() => setActiveTab('rights')}
          >
            <Text style={[styles.tabText, activeTab === 'rights' && styles.tabTextActive]}>সংবিধান ও অধিকার</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'hotlines' && styles.tabItemActive]}
            onPress={() => setActiveTab('hotlines')}
          >
            <Text style={[styles.tabText, activeTab === 'hotlines' && styles.tabTextActive]}>জরুরি হটলাইন</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'gd' && (
            <View>
              <View style={styles.infoPill}>
                <Feather name="info" size={14} color={theme.colors.primary} />
                <Text style={styles.infoPillText}>থানায় জিডি করতে কোনো ফি লাগে না। নিচে থেকে কপি করে আপনার তথ্য বসান।</Text>
              </View>

              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>হারানো সংক্রান্ত জিডি (নমুনা)</Text>
                  <TouchableOpacity style={styles.shareBtn} onPress={() => handleShare("হারানো জিডি", GD_LOST)}>
                    <Feather name="copy" size={14} color={theme.colors.primary} />
                    <Text style={styles.shareBtnText}>কপি / শেয়ার</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.codeText}>{GD_LOST}</Text>
              </View>

              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>হুমকি ও ভীতি প্রদর্শন জিডি (দণ্ডবিধি ৫০৬)</Text>
                  <TouchableOpacity style={styles.shareBtn} onPress={() => handleShare("হুমকি জিডি", GD_THREAT)}>
                    <Feather name="copy" size={14} color={theme.colors.primary} />
                    <Text style={styles.shareBtnText}>কপি / শেয়ার</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.codeText}>{GD_THREAT}</Text>
              </View>
            </View>
          )}

          {activeTab === 'rights' && (
            <View>
              <View style={styles.rightItem}>
                <Text style={styles.rightTag}>সংবিধানের অনুচ্ছেদ ৩৩</Text>
                <Text style={styles.rightHeading}>গ্রেপ্তারের কারণ অবিলম্বে জানার অধিকার</Text>
                <Text style={styles.rightDesc}>
                  গ্রেপ্তারকৃত ব্যক্তিকে অবিলম্বে কারণ না জানিয়ে আটকে রাখা সম্পূর্ণ বেআইনি। নিজের পছন্দের আইনজীবীর সাথে পরামর্শ করার সুযোগ পাওয়া সাংবিধানিক অধিকার।
                </Text>
              </View>

              <View style={styles.rightItem}>
                <Text style={styles.rightTag}>২৪ ঘণ্টার সাংবিধানিক রক্ষা</Text>
                <Text style={styles.rightHeading}>ম্যাজিস্ট্রেটের আদেশ ছাড়া ২৪ ঘণ্টার বেশি আটক নয়</Text>
                <Text style={styles.rightDesc}>
                  গ্রেপ্তারকারী পুলিশ কর্মকর্তা গ্রেপ্তারকৃত ব্যক্তিকে ২৪ ঘণ্টার মধ্যে নিকটস্থ ম্যাজিস্ট্রেটের আদালতে হাজির করতে আইনগতভাবে বাধ্য।
                </Text>
              </View>

              <View style={styles.rightItem}>
                <Text style={styles.rightTag}>সুপ্রিম কোর্টের ব্লাস্ট রিট</Text>
                <Text style={styles.rightHeading}>তল্লাশি ও জিজ্ঞাসাবাদের ৩ নিয়ম</Text>
                <Text style={styles.rightDesc}>
                  ১. সাদা পোশাকে গ্রেপ্তার নিষিদ্ধ। নাম ও পদবি স্পষ্ট থাকতে হবে।{'\n'}
                  ২. গ্রেপ্তারের ৩ ঘণ্টার মধ্যে পরিবারকে জানাতে হবে।{'\n'}
                  ৩. শারীরিক নির্যাতন আইনত দণ্ডনীয় অপরাধ।
                </Text>
              </View>
            </View>
          )}

          {activeTab === 'hotlines' && (
            <View>
              {EMERGENCY_HOTLINES.map((h, i) => (
                <View key={i} style={styles.hotlineRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.hotlinePhone}>{h.number}</Text>
                    <Text style={styles.hotlineName}>{h.name}</Text>
                    <Text style={styles.hotlineSub}>{h.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    gap: 8,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabItemActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: '#BFDBFE',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primaryLight,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoPillText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.primary,
    lineHeight: 16,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  shareBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  codeText: {
    backgroundColor: theme.colors.surface,
    padding: 10,
    borderRadius: 6,
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  rightItem: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    marginBottom: 12,
  },
  rightTag: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 6,
  },
  rightHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  rightDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  hotlineRow: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  hotlinePhone: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  hotlineName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  hotlineSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
  }
});
