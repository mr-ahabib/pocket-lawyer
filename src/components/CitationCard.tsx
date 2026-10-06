import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, fonts, radius } from '@/theme';
import type { Citation } from '@/lib/types';
import { toAsciiDigits, toBanglaDigits } from '@/lib/understand';
import { actNameBn, gloss } from '@/lib/glosses';

export function CitationCard({ c, onOpen }: { c: Citation; onOpen?: () => void }) {
  const g = gloss(c.actTitle, toAsciiDigits(c.sectionNo));
  const isEn = !/[ঀ-৿]/.test(c.excerpt);
  return (
    <Pressable onPress={() => { onOpen?.(); router.push({ pathname: '/section/[id]', params: { id: String(c.sectionId) } }); }} style={({ pressed }) => [s.card, pressed && { backgroundColor: colors.surface }]}>
      <View style={s.badge}>
        <Text style={s.badgeText}>{toBanglaDigits(c.index)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.sec} numberOfLines={1}>
          {c.sectionNo ? `ধারা ${toBanglaDigits(c.sectionNo)}` : 'ধারা'}{c.sectionTitle && !isEn ? ` · ${c.sectionTitle}` : ''}
        </Text>
        <Text style={s.act} numberOfLines={1}>{actNameBn(c.actTitle)}</Text>
        <Text style={s.excerpt} numberOfLines={2}>{g ?? (isEn ? 'মূল পাঠ ইংরেজিতে — পুরোটা পড়তে চাপ দিন' : c.excerpt)}</Text>
        {c.repealed && <Text style={s.repealed}>রহিত আইন</Text>}
      </View>
      <Feather name="chevron-right" size={16} color={colors.ink3} style={{ alignSelf: 'center' }} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12, backgroundColor: colors.card, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.hairline },
  badge: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  badgeText: { fontFamily: fonts.bold, fontSize: 12, color: colors.green },
  sec: { fontFamily: fonts.semibold, fontSize: 14.5, lineHeight: 22, color: colors.ink },
  act: { fontFamily: fonts.medium, fontSize: 12.5, lineHeight: 18, color: colors.brass, marginTop: 1 },
  excerpt: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, color: colors.ink2, marginTop: 5 },
  repealed: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.danger, marginTop: 4 },
});
