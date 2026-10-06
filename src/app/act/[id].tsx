import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { colors, fonts, radius, shadow } from '@/theme';
import { Hero, Screen, SearchBar, Tag } from '@/components/ui';
import { getAct, getSections } from '@/lib/db';
import { normalize, toBanglaDigits } from '@/lib/understand';
import type { Act, Section } from '@/lib/types';
import { actNameBn } from '@/lib/glosses';

function HeroTag({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
      <Text numberOfLines={1} style={{ fontFamily: fonts.semibold, fontSize: 12, lineHeight: 17, color: colors.ink2, includeFontPadding: false }}>{children}</Text>
    </View>
  );
}

type Row = { kind: 'chapter'; key: string; title: string } | { kind: 'section'; key: string; s: Section };

export default function ActScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const [act, setAct] = useState<Act | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [q, setQ] = useState('');
  const [showPreamble, setShowPreamble] = useState(false);

  useEffect(() => {
    const actId = Number(id);
    getAct(db, actId).then(setAct);
    getSections(db, actId).then(setSections);
  }, [id, db]);

  const rows = useMemo<Row[]>(() => {
    const nq = normalize(q);
    const out: Row[] = [];
    let lastCh = '';
    for (const s of sections) {
      if (nq && !(normalize(s.title).includes(nq) || normalize(s.text).includes(nq) || s.no === q.trim() || s.no_ascii === q.trim())) continue;
      if (!nq && s.chapter && s.chapter !== lastCh) {
        out.push({ kind: 'chapter', key: `c${s.ord}`, title: s.chapter });
        lastCh = s.chapter;
      }
      out.push({ kind: 'section', key: String(s.id), s });
    }
    return out;
  }, [sections, q]);

  return (
    <Screen>
      {act ? (
      <Hero back compact title="আইন" style={{ paddingBottom: 6 }}>
        <Text style={s.title}>{actNameBn(act.title)}</Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {act.act_no ? <HeroTag>{act.act_no}</HeroTag> : null}
          {act.published ? <HeroTag>{act.published}</HeroTag> : null}
          <HeroTag>{toBanglaDigits(act.section_count)} ধারা</HeroTag>
          {act.repealed ? <Tag tone="danger">রহিত</Tag> : <Tag tone="brass">প্রচলিত</Tag>}
        </View>
      </Hero>
      ) : (
        <Hero back compact title="আইন" style={{ paddingBottom: 6 }} />
      )}
      <FlatList
        data={rows}
        initialNumToRender={12}
        windowSize={11}
        removeClippedSubviews
        keyboardDismissMode="on-drag"
        keyExtractor={(r) => r.key}
        ListHeaderComponent={
          act ? (
            <View>
              <View style={s.head}>
              {act.repeal_note ? <Text style={s.repeal}>{act.repeal_note}</Text> : null}
              {act.long_title ? <Text style={s.long}>{act.long_title}</Text> : null}
              {act.preamble ? (
                <Pressable onPress={() => setShowPreamble((v) => !v)} style={{ marginTop: 8 }}>
                  <Text style={s.link}>{showPreamble ? 'প্রস্তাবনা লুকান' : 'প্রস্তাবনা দেখুন'}</Text>
                  {showPreamble && <Text style={s.preamble}>{act.preamble}</Text>}
                </Pressable>
              ) : null}
              {act.source_url ? (
                <Pressable onPress={() => Linking.openURL(act.source_url!)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
                  <Feather name="external-link" size={13} color={colors.info} />
                  <Text style={s.link}>মূল পাঠ: bdlaws.minlaw.gov.bd</Text>
                </Pressable>
              ) : null}
              </View>
              <View style={{ marginHorizontal: 20, marginTop: 10, marginBottom: 6 }}>
                <SearchBar light placeholder="এই আইনে খুঁজুন (ধারা নম্বর বা শব্দ)" value={q} onChangeText={setQ} onClear={() => setQ('')} />
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) =>
          item.kind === 'chapter' ? (
            <Text style={s.chapter}>{item.title}</Text>
          ) : (
            <Pressable onPress={() => router.push({ pathname: '/section/[id]', params: { id: String(item.s.id) } })} style={({ pressed }) => [s.row, pressed && { opacity: 0.7 }]}>
              <Text style={s.no}>{item.s.no || '•'}</Text>
              <View style={{ flex: 1 }}>
                {item.s.title ? <Text style={s.secTitle}>{item.s.title}</Text> : null}
                <Text style={s.secText} numberOfLines={item.s.title ? 2 : 3}>{item.s.text.replace(/\s+/g, ' ')}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.ink3} />
            </Pressable>
          )
        }
        ItemSeparatorComponent={() => <View style={s.sep} />}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      />
    </Screen>
  );
}

const s = StyleSheet.create({
  head: { marginHorizontal: 20, marginTop: 10, marginBottom: 6, padding: 16, backgroundColor: colors.card, borderRadius: radius.lg },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 34, color: colors.green, marginTop: 4 },
  repeal: { fontFamily: fonts.regular, marginTop: 10, fontSize: 13.5, color: colors.danger, lineHeight: 20 },
  long: { fontFamily: fonts.regular, fontSize: 14.5, lineHeight: 23, color: colors.ink2 },
  preamble: { fontFamily: fonts.regular, marginTop: 6, fontSize: 14.5, lineHeight: 23, color: colors.ink2 },
  link: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.info },
  chapter: { fontFamily: fonts.semibold, paddingHorizontal: 22, paddingTop: 18, paddingBottom: 10, fontSize: 12.5, color: colors.ink3, letterSpacing: 0.4 },
  sep: { height: 8 },
  row: { flexDirection: 'row', gap: 14, alignItems: 'center', marginHorizontal: 20, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.card, borderRadius: radius.md, ...shadow.card },
  no: { fontFamily: fonts.bold, minWidth: 36, fontSize: 14, color: colors.brass },
  secTitle: { fontFamily: fonts.semibold, fontSize: 15.5, color: colors.ink, lineHeight: 22 },
  secText: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 20, color: colors.ink2, marginTop: 2 },
});
