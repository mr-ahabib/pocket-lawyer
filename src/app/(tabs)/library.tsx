import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { colors, fonts, radius, shadow } from '@/theme';
import { TAB_BAR_SPACE } from '@/components/TabBar';
import { Empty, Hero, Screen, SearchBar } from '@/components/ui';
import { countActs, listActs } from '@/lib/db';
import { retrieve } from '@/lib/search';
import { toBanglaDigits } from '@/lib/understand';
import type { Act, SectionHit } from '@/lib/types';
import { actNameBn } from '@/lib/glosses';

type Mode = 'acts' | 'sections';

export default function LibraryScreen() {
  const db = useSQLiteContext();
  const [q, setQ] = useState('');
  const [mode, setMode] = useState<Mode>('acts');
  const [acts, setActs] = useState<Act[]>([]);
  const [hits, setHits] = useState<SectionHit[]>([]);
  const SUGGEST = ['জামিন', 'গ্রেফতার', 'চেক', 'ভাড়াটিয়া', 'যৌতুক', 'তালাক', 'মজুরি', 'জমি দখল', 'হুমকি', 'ভেজাল'];
  const [stats, setStats] = useState<{ total: number; inForce: number; sections: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    countActs(db).then(setStats).catch(() => {});
  }, [db]);

  useEffect(() => {
    let alive = true;
    const tmr = setTimeout(async () => {
      setLoading(true);
      try {
        if (mode === 'acts') {
          const rows = await listActs(db, { query: q, limit: 80 });
          if (alive) setActs(rows);
        } else if (q.trim().length >= 2) {
          const r = await retrieve(db, q, { limit: 30 });
          if (alive) setHits(r.hits);
        } else if (alive) setHits([]);
      } finally {
        if (alive) setLoading(false);
      }
    }, 160);
    return () => {
      alive = false;
      clearTimeout(tmr);
    };
  }, [q, mode, db]);

  const Header = (
    <View style={{ marginBottom: 8 }}>
      <Hero style={{ paddingBottom: 14 }}>
        <Text style={s.title}>আইনকোষ</Text>
        {stats && (
          <Text style={s.sub}>
            {toBanglaDigits(stats.total.toLocaleString('en-US'))}টি আইন · {toBanglaDigits(stats.sections.toLocaleString('en-US'))} ধারা
          </Text>
        )}
      </Hero>
      <View style={{ paddingHorizontal: 20, marginTop: 0 }}>
        <View style={{ borderRadius: radius.pill }}>
          <SearchBar light placeholder={mode === 'acts' ? 'আইনের নাম খুঁজুন…' : 'বিষয় লিখুন — জামিন, cheque, ভাড়া…'} value={q} onChangeText={setQ} onClear={() => setQ('')} />
        </View>
        <View style={s.seg}>
          {(['acts', 'sections'] as Mode[]).map((mm) => (
            <Pressable key={mm} onPress={() => setMode(mm)} style={[s.segBtn, mode === mm && s.segBtnOn]}>
              <Text style={[s.segText, mode === mm && s.segTextOn]}>{mm === 'acts' ? 'আইন' : 'ধারা'}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  const listProps = {
    contentContainerStyle: { paddingTop: 4, paddingBottom: TAB_BAR_SPACE + 8 },
    keyboardShouldPersistTaps: 'handled' as const,
    keyboardDismissMode: 'on-drag' as const,
    initialNumToRender: 10,
    windowSize: 11,
    removeClippedSubviews: true,
    ItemSeparatorComponent: () => <View style={{ height: 10 }} />,
  };

  return (
    <Screen>
      {Header}
      {mode === 'acts' ? (
        <FlatList
          {...listProps}
          data={acts}
          keyExtractor={(a) => String(a.id)}
          renderItem={({ item }) => <ActRow a={item} />}
          ListEmptyComponent={!loading ? <Empty icon="book" title="কিছু পাওয়া যায়নি" hint="অন্য নামে খুঁজে দেখুন" /> : null}
        />
      ) : (
        <FlatList
          {...listProps}
          data={hits}
          keyExtractor={(h) => String(h.id)}
          renderItem={({ item }) => <HitRow h={item} />}
          ListEmptyComponent={
            !loading ? (
              q.trim().length < 2 ? (
                <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
                  <Text style={s.sugLabel}>জনপ্রিয় বিষয়</Text>
                  <View style={s.sugWrap}>
                    {SUGGEST.map((w) => (
                      <Pressable key={w} onPress={() => setQ(w)} style={({ pressed }) => [s.sugChip, pressed && { backgroundColor: colors.surface }]}>
                        <Text style={s.sugText}>{w}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : (
                <Empty icon="search" title="কোনো ধারা মেলেনি" hint="বাংলা, বাংলিশ বা ইংরেজিতে লিখতে পারেন" />
              )
            ) : null
          }
        />
      )}
    </Screen>
  );
}

function ActRow({ a }: { a: Act }) {
  return (
    <Pressable onPress={() => router.push({ pathname: '/act/[id]', params: { id: String(a.id) } })} style={({ pressed }) => [s.card, pressed && { transform: [{ scale: 0.985 }] }]}>
      <View style={{ flex: 1 }}>
        <Text style={s.cardTitle}>{actNameBn(a.title)}</Text>
        {a.long_title ? <Text style={s.cardDesc} numberOfLines={2}>{a.long_title.replace(/\s+/g, ' ')}</Text> : null}
        <Text style={s.cardMeta}>
          {a.act_no ? `${a.act_no} · ` : ''}{toBanglaDigits(a.section_count)} ধারা{a.repealed ? ' · রহিত' : ''}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.ink3} />
    </Pressable>
  );
}

function HitRow({ h }: { h: SectionHit }) {
  return (
    <Pressable onPress={() => router.push({ pathname: '/section/[id]', params: { id: String(h.id) } })} style={({ pressed }) => [s.card, pressed && { transform: [{ scale: 0.985 }] }]}>
      <View style={{ flex: 1 }}>
        <Text style={s.hitAct} numberOfLines={1}>{actNameBn(h.act_title)}</Text>
        <Text style={s.cardTitle}>{h.no ? `ধারা ${toBanglaDigits(h.no)}` : ''}{h.title ? ` · ${h.title}` : ''}</Text>
        <Text style={s.hitText} numberOfLines={2}>{h.text.replace(/\s+/g, ' ')}</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 40, color: colors.green, marginTop: 4 },
  sub: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 20, color: colors.ink3, marginTop: 2 },
  seg: { flexDirection: 'row', gap: 8, marginTop: 14 },
  segBtn: { paddingHorizontal: 18, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  segBtnOn: { backgroundColor: colors.green },
  segText: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.ink2 },
  segTextOn: { color: '#fff' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 20, backgroundColor: colors.card, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14, ...shadow.card },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 15.5, lineHeight: 22, color: colors.ink },
  cardMeta: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.ink3, marginTop: 6 },
  cardDesc: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 20, color: colors.ink2, marginTop: 4 },
  sugLabel: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.ink3, marginBottom: 10 },
  sugWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sugChip: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.pill, paddingHorizontal: 14, height: 38, justifyContent: 'center' },
  sugText: { fontFamily: fonts.medium, fontSize: 14, color: colors.ink },
  hitAct: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.brass, marginBottom: 2 },
  hitText: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.ink2, marginTop: 4 },
});
