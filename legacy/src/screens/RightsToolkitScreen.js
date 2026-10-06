import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Linking,
  Alert
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { EMERGENCY_HOTLINES } from '../database/lawData';

const GD_LOST_DRAFT = `বরাবর,
ভারপ্রাপ্ত কর্মকর্তা (OC)
................. থানা, ঢাকা।

বিষয়: জাতীয় পরিচয়পত্র (NID) / ডকুমেন্ট হারানো সংক্রান্ত সাধারণ ডায়েরি (GD)।

জনাব,
বিনীত নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ................. (নাম), পিতা: ................., মাতা: ................., বর্তমান ঠিকানা: ................., স্থায়ী ঠিকানা: .................।

অদ্য ................. তারিখে আনুমানিক ................. ঘটিকার সময় ................. এলাকা থেকে আমার মূল জাতীয় পরিচয়পত্র / ব্যাংক চেক / পাসপোর্টটি অসাবধানতাবশত হারিয়ে যায়। অনেক খোঁজাখুঁজি করিয়াও উহা পাওয়া যায় নাই।

ভবিষ্যতে কোনো অবৈধ অপব্যবহারের হাত হইতে রক্ষা পাওয়ার লক্ষ্যে এবং আইনি নিরাপত্তার স্বার্থে বিষয়টি আপনার থানায় সাধারণ ডায়েরিভুক্ত করার অনুরোধ জানাচ্ছি।

বিনীত,
নাম: .................
মোবাইল: .................
স্বাক্ষর ও তারিখ: .................`;

const GD_THREAT_DRAFT = `বরাবর,
ভারপ্রাপ্ত কর্মকর্তা (OC)
................. থানা, ঢাকা।

বিষয়: অপরাধমূলক ভীতি প্রদর্শন ও প্রাণনাশের হুমকি সংক্রান্ত সাধারণ ডায়েরি (GD)।

জনাব,
বিনীত নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ................. (নাম), পেশা: ................., ঠিকানা: .................।

অদ্য ................. তারিখে আনুমানিক ................. ঘটিকায় বিবাদী ................. (নাম ও ঠিকানা/মোবাইল) আমাকে সরাসরি / ফোনে অকথ্য ভাষায় গালিগালাজ করে এবং জানমালের ক্ষতিসাধনসহ প্রাণনাশের হুমকি প্রদান করে (কল রেকর্ড/মেসেজ সংরক্ষিত আছে)। 

এমতাবস্থায় আমি ও আমার পরিবার চরম নিরাপত্তাহীনতায় ভুগিতেছি। বিষয়টি তদন্তপূর্বক ভবিষ্যতে কোনো প্রকার অপ্রীতিকর ঘটনা ঘটিলে প্রয়োজনীয় আইনানুগ ব্যবস্থা গ্রহণের সুবিধার্থে বিষয়টি থানায় সাধারণ ডায়েরিভুক্ত করার আবেদন করছি।

বিনীত,
নাম: .................
মোবাইল: .................
স্বাক্ষর ও তারিখ: .................`;

export default function RightsToolkitScreen() {
  const [activeTab, setActiveTab] = useState('gd'); // 'gd' | 'rights' | 'hotlines'

  const handleShareDraft = async (title, draft) => {
    try {
      await Share.share({
        title,
        message: draft,
      });
    } catch (e) {
      console.log("Share error:", e);
    }
  };

  const handleCall = (number) => {
    Linking.openURL(`tel:${number}`).catch(err => console.log("Call error:", err));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>নাগরিক অধিকার ও জিডি টুলকিট</Text>
        <Text style={styles.headerDesc}>
          আইনি সহায়তার ড্রাফট, সাংবিধানিক অধিকার এবং জরুরি হেল্পলাইন
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'gd' && styles.tabBtnActive]}
          onPress={() => setActiveTab('gd')}
        >
          <Feather name="file-text" size={16} color={activeTab === 'gd' ? theme.colors.primary : theme.colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'gd' && styles.tabTextActive]}>জিডি ফরম্যাট</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'rights' && styles.tabBtnActive]}
          onPress={() => setActiveTab('rights')}
        >
          <Feather name="shield" size={16} color={activeTab === 'rights' ? theme.colors.primary : theme.colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'rights' && styles.tabTextActive]}>মৌলিক অধিকার</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'hotlines' && styles.tabBtnActive]}
          onPress={() => setActiveTab('hotlines')}
        >
          <Feather name="phone" size={16} color={activeTab === 'hotlines' ? theme.colors.primary : theme.colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'hotlines' && styles.tabTextActive]}>জরুরি হটলাইন</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tab 1: GD Formats */}
        {activeTab === 'gd' && (
          <View style={styles.tabContent}>
            <View style={styles.infoBanner}>
              <Feather name="info" size={16} color={theme.colors.primary} />
              <Text style={styles.infoBannerText}>
                থানায় জিডি করতে কোনো ফি লাগে না। ড্রাফটটি কপি করে আপনার তথ্য বসিয়ে থানায় জমা দিন।
              </Text>
            </View>

            {/* GD 1: Lost */}
            <View style={styles.draftCard}>
              <View style={styles.draftHeader}>
                <View>
                  <Text style={styles.draftTitle}>হারানো সংক্রান্ত জিডি (নমুনা)</Text>
                  <Text style={styles.draftSub}>NID, পাসপোর্ট, সার্টিফিকেট বা চেকবই হারালে</Text>
                </View>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => handleShareDraft("হারানো সংক্রান্ত জিডি ড্রাফট", GD_LOST_DRAFT)}
                >
                  <Feather name="share-2" size={16} color={theme.colors.primary} />
                  <Text style={styles.copyBtnText}>শেয়ার / কপি</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.draftPreview}>{GD_LOST_DRAFT}</Text>
            </View>

            {/* GD 2: Threat */}
            <View style={styles.draftCard}>
              <View style={styles.draftHeader}>
                <View>
                  <Text style={styles.draftTitle}>হুমকি প্রদান সংক্রান্ত জিডি (নমুনা)</Text>
                  <Text style={styles.draftSub}>মারধর বা প্রাণনাশের হুমকি দিলে (ধারা ৫০৬)</Text>
                </View>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => handleShareDraft("হুমকি সংক্রান্ত জিডি ড্রাফট", GD_THREAT_DRAFT)}
                >
                  <Feather name="share-2" size={16} color={theme.colors.primary} />
                  <Text style={styles.copyBtnText}>শেয়ার / কপি</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.draftPreview}>{GD_THREAT_DRAFT}</Text>
            </View>
          </View>
        )}

        {/* Tab 2: Constitutional Rights */}
        {activeTab === 'rights' && (
          <View style={styles.tabContent}>
            <View style={styles.rightCard}>
              <View style={styles.rightTag}>
                <Text style={styles.rightTagText}>সংবিধানের অনুচ্ছেদ ৩৩</Text>
              </View>
              <Text style={styles.rightTitle}>গ্রেপ্তারের কারণ অবিলম্বে জানার অধিকার</Text>
              <Text style={styles.rightBody}>
                গ্রেপ্তারকৃত কোনো ব্যক্তিকে যথাশীঘ্র সম্ভব গ্রেপ্তারের কারণ জ্ঞাপন না করে পুলিশ হেফাজতে রাখা যাবে না। নিজের পছন্দমতো আইনজীবীর সাথে পরামর্শ করার ও আত্মপক্ষ সমর্থনের অধিকার ক্ষুণ্ন করা সম্পূর্ণ বেআইনি।
              </Text>
            </View>

            <View style={styles.rightCard}>
              <View style={styles.rightTag}>
                <Text style={styles.rightTagText}>২৪ ঘণ্টার সাংবিধানিক সুরক্ষা</Text>
              </View>
              <Text style={styles.rightTitle}>ম্যাজিস্ট্রেটের আদেশ ছাড়া ২৪ ঘণ্টার বেশি আটক নয়</Text>
              <Text style={styles.rightBody}>
                গ্রেপ্তারকারী পুলিশ কর্মকর্তা গ্রেপ্তারকৃত ব্যক্তিকে যাত্রার প্রয়োজনীয় সময় ব্যতীত ২৪ ঘণ্টার মধ্যে নিকটস্থ ম্যাজিস্ট্রেটের আদালতে হাজির করতে বাধ্য। ম্যাজিস্ট্রেটের সুনির্দিষ্ট অনুমতি ছাড়া কোনো ব্যক্তিকে তার অধিক সময় পুলিশ হেফাজতে রাখা যায় না।
              </Text>
            </View>

            <View style={styles.rightCard}>
              <View style={styles.rightTag}>
                <Text style={styles.rightTagText}>ব্লাস্ট বনাম বাংলাদেশ মামলা</Text>
              </View>
              <Text style={styles.rightTitle}>সুপ্রিম কোর্টের রিট গাইডলাইন</Text>
              <Text style={styles.rightBody}>
                ১. সাদা পোশাকে গ্রেপ্তার করা যাবে না। পুলিশের নেমপ্লেট ও পরিচিতি থাকতে হবে।{'\n'}
                ২. গ্রেপ্তারের ৩ ঘণ্টার মধ্যে পরিবারের সদস্যদের অবস্থান ও কারণ টেলিফোনে জানাতে হবে।{'\n'}
                ৩. শারীরিক নির্যাতন সম্পূর্ণ নিষিদ্ধ ও অজামিনযোগ্য অপরাধ।
              </Text>
            </View>

            <View style={styles.legalAidCard}>
              <View style={styles.legalAidHeader}>
                <MaterialIcons name="gavel" size={24} color={theme.colors.primary} />
                <Text style={styles.legalAidTitle}>বিনামূল্যে সরকারি আইনি সেবা</Text>
              </View>
              <Text style={styles.legalAidBody}>
                যাদের বার্ষিক আয় সীমিত বা যারা আইনজীবী নিয়োগে অক্ষম, সরকার তাদের সম্পূর্ণ বিনামূল্যে আইনজীবী এবং মামলার খরচ প্রদান করে।{'\n\n'}
                হটলাইন: <Text style={{ fontWeight: '800' }}>১৬৪৩০</Text> (জাতীয় আইনগত সহায়তা প্রদান সংস্থা, আইন মন্ত্রণালয়)।
              </Text>
            </View>
          </View>
        )}

        {/* Tab 3: Emergency Hotlines */}
        {activeTab === 'hotlines' && (
          <View style={styles.tabContent}>
            <Text style={styles.hotlineSectionTitle}>বাংলাদেশের সকল জরুরি আইনি সহায়তা নম্বর</Text>
            {EMERGENCY_HOTLINES.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.hotlineRowCard}
                onPress={() => handleCall(item.number)}
              >
                <View style={styles.hotlineLeft}>
                  <Text style={styles.hotlineNumBig}>{item.number}</Text>
                  <Text style={styles.hotlineTitleMain}>{item.name}</Text>
                  <Text style={styles.hotlineSubMain}>{item.desc}</Text>
                </View>
                <View style={styles.callIconBtn}>
                  <MaterialIcons name="call" size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 16,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  headerDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabBtnActive: {
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
  },
  tabContent: {
    paddingBottom: 20,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.primary,
    lineHeight: 18,
  },
  draftCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    marginBottom: 16,
    ...theme.shadows.sm,
  },
  draftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  draftTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  draftSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  draftPreview: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  rightCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    marginBottom: 14,
    ...theme.shadows.sm,
  },
  rightTag: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  rightTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  rightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  rightBody: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  legalAidCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
    marginTop: 8,
  },
  legalAidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  legalAidTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  legalAidBody: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  hotlineSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  hotlineRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.sm,
  },
  hotlineLeft: {
    flex: 1,
  },
  hotlineNumBig: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  hotlineTitleMain: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  hotlineSubMain: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  callIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
