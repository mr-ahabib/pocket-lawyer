import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Linking
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { LAW_CATEGORIES, EMERGENCY_HOTLINES } from '../database/lawData';

export default function HomeScreen({
  searchQuery,
  onSearchChange,
  searchResults,
  selectedCategory,
  onCategorySelect,
  onSelectLaw,
  onOpenVoiceModal,
  onOpenAiConsultant
}) {
  const isSearching = searchQuery.trim().length > 0 || selectedCategory !== 'All';

  const handleCall = (number) => {
    Linking.openURL(`tel:${number}`).catch(err => console.log("Call error:", err));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Smart Search Bar */}
      <View style={styles.searchSection}>
        <Text style={styles.searchPrompt}>কী আইনি সমস্যায় পড়েছেন?</Text>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={theme.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="যেমন: পুলিশ গাড়ি আটকেছে, বেশি দাম..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={() => onSearchChange('')}>
              <Feather name="x" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.micButton} onPress={onOpenVoiceModal}>
            <MaterialIcons name="mic" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* AI Interactive Consultation Shortcut Banner */}
      {!isSearching && (
        <TouchableOpacity style={styles.aiBanner} onPress={() => onOpenAiConsultant()}>
          <View style={styles.aiBannerIconWrapper}>
            <MaterialIcons name="psychology" size={30} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={styles.aiBannerTag}>
              <Text style={styles.aiBannerTagText}>রুল-বেইজড এআই</Text>
            </View>
            <Text style={styles.aiBannerTitle}>ধাপে ধাপে আইনি পরামর্শ নিন</Text>
            <Text style={styles.aiBannerSubtitle}>
              সরাসরি পরিস্থিতি সিলেক্ট করুন, এআই জানাবে কী বলবেন ও আপনার অধিকার
            </Text>
          </View>
          <Feather name="chevron-right" size={22} color={theme.colors.textMuted} />
        </TouchableOpacity>
      )}

      {/* Category Pills */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {LAW_CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                onPress={() => onCategorySelect(cat.id)}
              >
                <Feather
                  name={cat.icon || "tag"}
                  size={14}
                  color={isSelected ? '#FFFFFF' : theme.colors.textSecondary}
                />
                <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}>
                  {cat.name_bn}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Law Search Results or Default Catalog */}
      <View style={styles.resultsSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            {isSearching ? `ফলাফল (${searchResults.length})` : "জরুরি পাবলিক আইনসমূহ"}
          </Text>
          {isSearching && (
            <TouchableOpacity onPress={() => { onSearchChange(''); onCategorySelect('All'); }}>
              <Text style={styles.resetFilterText}>রিসেট করুন</Text>
            </TouchableOpacity>
          )}
        </View>

        {searchResults.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="info" size={36} color={theme.colors.textMuted} />
            <Text style={styles.emptyStateTitle}>কোনো সুনির্দিষ্ট আইন পাওয়া যায়নি</Text>
            <Text style={styles.emptyStateDesc}>
              অন্য কোনো আইনি শব্দ (যেমন: পুলিশ, জমি, চেক, ভেজাল) লিখে অনুসন্ধান করুন
            </Text>
          </View>
        ) : (
          searchResults.map(law => (
            <TouchableOpacity
              key={law.id}
              style={styles.lawCard}
              onPress={() => onSelectLaw(law)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={styles.actTag}>
                  <Text style={styles.actTagText}>{law.act_name}</Text>
                </View>
                <View style={styles.sectionTag}>
                  <Text style={styles.sectionTagText}>{law.section}</Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>{law.title}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>
                {law.offense_situation}
              </Text>

              <View style={styles.cardFooter}>
                <View style={[
                  styles.bailableBadge,
                  law.bailable === "জামিনযোগ্য" ? styles.bailableYes : styles.bailableNo
                ]}>
                  <Text style={[
                    styles.bailableText,
                    { color: law.bailable === "জামিনযোগ্য" ? theme.colors.success : theme.colors.danger }
                  ]}>
                    {law.bailable || "আইনগত বিধান"}
                  </Text>
                </View>
                <View style={styles.detailsAction}>
                  <Text style={styles.detailsActionText}>আইন ও করণীয় দেখুন</Text>
                  <Feather name="arrow-right" size={14} color={theme.colors.primary} />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Daily Legal Insight Card */}
      {!isSearching && (
        <View style={styles.dailyTipCard}>
          <View style={styles.dailyTipHeader}>
            <Feather name="shield" size={18} color="#1D4ED8" />
            <Text style={styles.dailyTipTitle}>সংবিধানের মৌলিক নাগরিক অধিকার</Text>
          </View>
          <Text style={styles.dailyTipBody}>
            বাংলাদেশ সংবিধানের ৩১ ও ৩২ অনুচ্ছেদ অনুযায়ী, আইনানুগ ব্যবস্থা ব্যতিরেকে কোনো ব্যক্তির জীবন, স্বাধীনতা বা সম্পত্তির কোনো ক্ষতিসাধন করা সম্পূর্ণ নিষিদ্ধ।
          </Text>
        </View>
      )}

      {/* Emergency Hotlines Directory */}
      {!isSearching && (
        <View style={styles.hotlinesSection}>
          <Text style={styles.sectionTitle}>জরুরি সরকারি আইনি সেবা ও হটলাইন</Text>
          <View style={styles.hotlinesGrid}>
            {EMERGENCY_HOTLINES.slice(0, 4).map((hotline, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.hotlineCard}
                onPress={() => handleCall(hotline.number)}
              >
                <View style={styles.hotlineTop}>
                  <Text style={styles.hotlineNumber}>{hotline.number}</Text>
                  <MaterialIcons name="phone-in-talk" size={18} color={theme.colors.success} />
                </View>
                <Text style={styles.hotlineName} numberOfLines={1}>{hotline.name}</Text>
                <Text style={styles.hotlineDesc}>{hotline.desc}</Text>
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
  },
  searchSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  searchPrompt: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textPrimary,
    height: 42,
  },
  clearBtn: {
    padding: 6,
    marginRight: 4,
  },
  micButton: {
    backgroundColor: theme.colors.primary,
    padding: 9,
    borderRadius: 10,
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    ...theme.shadows.sm,
  },
  aiBannerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBannerTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  aiBannerTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  aiBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  aiBannerSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  resultsSection: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  resetFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  lawCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  actTag: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  actTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  sectionTag: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sectionTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 19,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: 10,
  },
  bailableBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bailableYes: {
    backgroundColor: theme.colors.successLight,
  },
  bailableNo: {
    backgroundColor: theme.colors.dangerLight,
  },
  bailableText: {
    fontSize: 11,
    fontWeight: '700',
  },
  detailsAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 12,
  },
  emptyStateDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  dailyTipCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 24,
  },
  dailyTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dailyTipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  dailyTipBody: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  hotlinesSection: {
    marginBottom: 20,
  },
  hotlinesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
  },
  hotlineCard: {
    width: '48%',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    ...theme.shadows.sm,
  },
  hotlineTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  hotlineNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  hotlineName: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  hotlineDesc: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  }
});
