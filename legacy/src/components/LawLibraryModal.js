import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { BANGLADESH_LAWS, LAW_CATEGORIES } from '../database/lawData';

export default function LawLibraryModal({ visible, onClose, onSelectLaw }) {
  const [selectedCat, setSelectedCat] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');

  if (!visible) return null;

  const filteredLaws = BANGLADESH_LAWS.filter(law => {
    const matchesCat = selectedCat === 'All' || law.category === selectedCat;
    if (!matchesCat) return false;
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      law.title.toLowerCase().includes(q) ||
      law.section.toLowerCase().includes(q) ||
      law.act_name.toLowerCase().includes(q) ||
      law.offense_situation.toLowerCase().includes(q)
    );
  });

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>বাংলাদেশ আইনকোষ ডিরেক্টরি</Text>
            <Text style={styles.headerSub}>অফলাইনে সংরক্ষিত ২৮টি প্রধান পাবলিক আইন</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Feather name="x" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Feather name="search" size={18} color={theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="ধারা, আইন বা অপরাধ লিখে খুঁজুন..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchFilter}
            onChangeText={setSearchFilter}
          />
          {searchFilter.length > 0 && (
            <TouchableOpacity onPress={() => setSearchFilter('')}>
              <Feather name="x" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <View style={styles.catScrollWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
            {LAW_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catPill, selectedCat === cat.id && styles.catPillActive]}
                onPress={() => setSelectedCat(cat.id)}
              >
                <Text style={[styles.catText, selectedCat === cat.id && styles.catTextActive]}>
                  {cat.name_bn}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Law Items List */}
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          <Text style={styles.countText}>মোট ফলাফল: {filteredLaws.length} টি আইন</Text>
          {filteredLaws.map(law => (
            <TouchableOpacity
              key={law.id}
              style={styles.lawCard}
              onPress={() => {
                onClose();
                onSelectLaw(law);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.lawTopRow}>
                <Text style={styles.actName}>{law.act_name}</Text>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>{law.section}</Text>
                </View>
              </View>

              <Text style={styles.lawTitle}>{law.title}</Text>
              <Text style={styles.offenseText} numberOfLines={2}>{law.offense_situation}</Text>

              <View style={styles.lawBottomRow}>
                <View style={[
                  styles.bailBadge,
                  law.bailable === "জামিনযোগ্য" ? styles.bailYes : styles.bailNo
                ]}>
                  <Text style={[
                    styles.bailText,
                    { color: law.bailable === "জামিনযোগ্য" ? theme.colors.success : theme.colors.danger }
                  ]}>
                    {law.bailable || "আইনগত বিধান"}
                  </Text>
                </View>

                <View style={styles.detailLink}>
                  <Text style={styles.detailLinkText}>বিস্তারিত ধারা ও করণীয়</Text>
                  <Feather name="chevron-right" size={14} color={theme.colors.primary} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 30 }} />
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  catScrollWrapper: {
    paddingLeft: 20,
    marginBottom: 10,
  },
  catList: {
    gap: 8,
    paddingRight: 20,
    paddingVertical: 4,
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
  catText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  catTextActive: {
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
    marginBottom: 10,
  },
  lawCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    marginBottom: 10,
  },
  lawTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  actName: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
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
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  offenseText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  lawBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: 8,
  },
  bailBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bailYes: {
    backgroundColor: theme.colors.successLight,
  },
  bailNo: {
    backgroundColor: theme.colors.dangerLight,
  },
  bailText: {
    fontSize: 11,
    fontWeight: '700',
  },
  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  }
});
