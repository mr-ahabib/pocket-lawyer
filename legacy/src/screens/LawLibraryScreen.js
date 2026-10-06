import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { LAW_CATEGORIES } from '../database/lawData';
import { getAllLaws, getLawsByCategory } from '../database/db';

export default function LawLibraryScreen({ onSelectLaw }) {
  const [selectedCat, setSelectedCat] = useState('All');
  const [filterText, setFilterText] = useState('');

  const allLaws = selectedCat === 'All' ? getAllLaws() : getLawsByCategory(selectedCat);

  const displayedLaws = allLaws.filter(law => {
    if (!filterText.trim()) return true;
    const q = filterText.toLowerCase();
    return (
      law.title.toLowerCase().includes(q) ||
      law.section.toLowerCase().includes(q) ||
      law.act_name.toLowerCase().includes(q) ||
      law.offense_situation.toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>বাংলাদেশ আইনকোষ</Text>
        <Text style={styles.headerDesc}>
          অফলাইনে সংরক্ষিত বাংলাদেশের প্রধান প্রধান পাবলিক ও ফৌজদারি আইনসমূহ
        </Text>
      </View>

      {/* Filter Input */}
      <View style={styles.filterSection}>
        <View style={styles.filterBox}>
          <Feather name="filter" size={18} color={theme.colors.textMuted} />
          <TextInput
            style={styles.filterInput}
            placeholder="আইনকোষে খুঁজুন (যেমন: ধারা ৬৬, ভোক্তা, ভূমি)..."
            placeholderTextColor={theme.colors.textMuted}
            value={filterText}
            onChangeText={setFilterText}
          />
          {filterText.length > 0 && (
            <TouchableOpacity onPress={() => setFilterText('')}>
              <Feather name="x" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Pills */}
      <View style={styles.catContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {LAW_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catPill, selectedCat === cat.id && styles.catPillActive]}
              onPress={() => setSelectedCat(cat.id)}
            >
              <Text style={[styles.catPillText, selectedCat === cat.id && styles.catPillTextActive]}>
                {cat.name_bn}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Laws List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        <Text style={styles.countText}>মোট আইন পাওয়া গেছে: {displayedLaws.length} টি</Text>

        {displayedLaws.map(law => (
          <TouchableOpacity
            key={law.id}
            style={styles.lawCard}
            onPress={() => onSelectLaw(law)}
            activeOpacity={0.7}
          >
            <View style={styles.topRow}>
              <View style={styles.actBadge}>
                <Text style={styles.actBadgeText}>{law.act_name}</Text>
              </View>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{law.section}</Text>
              </View>
            </View>

            <Text style={styles.lawTitle}>{law.title}</Text>
            <Text style={styles.lawOffense} numberOfLines={2}>{law.offense_situation}</Text>

            <View style={styles.bottomRow}>
              <View style={[
                styles.badgeStatus,
                law.bailable === "জামিনযোগ্য" ? styles.badgeSuccess : styles.badgeDanger
              ]}>
                <Text style={[
                  styles.badgeStatusText,
                  { color: law.bailable === "জামিনযোগ্য" ? theme.colors.success : theme.colors.danger }
                ]}>
                  {law.bailable || "আইনি ধারা"}
                </Text>
              </View>

              <View style={styles.readMore}>
                <Text style={styles.readMoreText}>আইনের বিস্তারিত ও শাস্তি</Text>
                <Feather name="chevron-right" size={16} color={theme.colors.primary} />
              </View>
            </View>
          </TouchableOpacity>
        ))}

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
    marginBottom: 12,
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
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  filterInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  catContainer: {
    paddingLeft: 20,
    marginBottom: 12,
  },
  catScroll: {
    gap: 8,
    paddingRight: 20,
    paddingVertical: 2,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  catPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  catPillTextActive: {
    color: '#FFFFFF',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginBottom: 12,
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
  topRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  actBadge: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  actBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  sectionBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  lawTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  lawOffense: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: 10,
  },
  badgeStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeSuccess: {
    backgroundColor: theme.colors.successLight,
  },
  badgeDanger: {
    backgroundColor: theme.colors.dangerLight,
  },
  badgeStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  }
});
