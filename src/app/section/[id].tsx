import React, { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, shadow } from '@/theme';
import { Hero, Screen, Tag } from '@/components/ui';
import { getSection, getSections } from '@/lib/db';
import type { Section } from '@/lib/types';
import { actNameBn, gloss } from '@/lib/glosses';
import { toBanglaDigits } from '@/lib/understand';

function HeroTag({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
      <Text numberOfLines={1} style={{ fontFamily: fonts.semibold, fontSize: 12, lineHeight: 17, color: colors.ink2, includeFontPadding: false }}>{children}</Text>
    </View>
  );
}

type Full = NonNullable<Awaited<ReturnType<typeof getSection>>>;

export default function SectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const [sec, setSec] = useState<Full | null>(null);
  const [neighbors, setNeighbors] = useState<{ prev?: Section; next?: Section }>({});
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    let alive = true;
    Speech.stop();
    getSection(db, Number(id)).then(async (s) => {
      if (!alive || !s) return;
      setSpeaking(false);
      setSec(s);
      const all = await getSections(db, s.act_id);
      const i = all.findIndex((x) => x.id === s.id);
      setNeighbors({ prev: all[i - 1], next: all[i + 1] });
    });
    return () => {
      alive = false;
      Speech.stop();
    };
  }, [id, db]);

  if (!sec) return <Screen><Hero back compact title="ধারা" style={{ paddingBottom: 10 }} /></Screen>;
  const isBn = /[ঀ-৿]/.test(sec.act_title);
  const label = sec.no ? `ধারা ${toBanglaDigits(sec.no)}` : `ধারা ${toBanglaDigits(sec.ord + 1)}`;
  const g = gloss(sec.act_title, sec.no_ascii);
  const citation = `${actNameBn(sec.act_title)}${label ? `, ${label}` : ''}${sec.title ? ` (${sec.title})` : ''}`;
  const shareText = `${citation}\n\n${sec.text}\n\nউৎস: ${sec.source_url ?? 'bdlaws.minlaw.gov.bd'}`;

  const speak = () => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(`${citation}। ${sec.text}`, {
      language: /[ঀ-৿]/.test(sec.text) ? 'bn-BD' : 'en-US',
      rate: 0.95,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  return (
    <Screen>
      <Hero back compact title="ধারা" style={{ paddingBottom: 10 }}>
          <Pressable onPress={() => router.push({ pathname: '/act/[id]', params: { id: String(sec.act_id) } })} hitSlop={6}>
            <Text style={s.actLink} numberOfLines={2}>{actNameBn(sec.act_title)}</Text>
          </Pressable>
          <Text style={s.title}>{sec.title || label}</Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {label ? <Tag tone="brass">{label}</Tag> : null}
            {sec.chapter ? <HeroTag>{sec.chapter}</HeroTag> : null}
            {sec.repealed ? <Tag tone="danger">রহিত আইন</Tag> : null}
          </View>
        </Hero>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 2, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        {g ? (
          <View style={s.glossBox}>
            <Text style={s.glossLabel}>সহজ বাংলায়</Text>
            <Text style={s.glossText}>{g}</Text>
          </View>
        ) : null}
        {!isBn && !g ? <Text style={s.note}>এই আইনের সরকারি পাঠ শুধু ইংরেজিতে প্রকাশিত।</Text> : null}
        <View style={s.body}>
          <Text style={s.text} selectable>{sec.text}</Text>
        </View>

      </ScrollView>
      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={s.actions}>
          {([
            { icon: speaking ? 'square' : 'volume-2', label: speaking ? 'থামান' : 'শুনুন', onPress: speak },
            { icon: 'copy', label: 'কপি', onPress: () => Clipboard.setStringAsync(shareText) },
            { icon: 'share-2', label: 'শেয়ার', onPress: () => Share.share({ message: shareText }) },
            { icon: 'external-link', label: 'উৎস', onPress: () => sec.source_url && Linking.openURL(sec.source_url) },
          ] as { icon: React.ComponentProps<typeof Feather>['name']; label: string; onPress: () => void }[]).map((a) => (
            <Pressable key={a.label} onPress={a.onPress} style={({ pressed }) => [s.action, pressed && { opacity: 0.6 }]}>
              <Feather name={a.icon} size={18} color={colors.sage} />
              <Text style={s.actionText}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={s.nav}>
          <Pressable disabled={!neighbors.prev} onPress={() => neighbors.prev && router.replace({ pathname: '/section/[id]', params: { id: String(neighbors.prev.id) } })} style={[s.navBtn, !neighbors.prev && s.navOff]}>
            <Feather name="chevron-left" size={16} color={colors.ink2} />
            <Text style={s.navText} numberOfLines={1}>{neighbors.prev ? `ধারা ${toBanglaDigits(neighbors.prev.no || '')}` : 'শুরু'}</Text>
          </Pressable>
          <Pressable disabled={!neighbors.next} onPress={() => neighbors.next && router.replace({ pathname: '/section/[id]', params: { id: String(neighbors.next.id) } })} style={[s.navBtn, { justifyContent: 'flex-end' }, !neighbors.next && s.navOff]}>
            <Text style={s.navText} numberOfLines={1}>{neighbors.next ? `ধারা ${toBanglaDigits(neighbors.next.no || '')}` : 'শেষ'}</Text>
            <Feather name="chevron-right" size={16} color={colors.ink2} />
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  actLink: { fontFamily: fonts.medium, fontSize: 13.5, lineHeight: 20, color: colors.brass, marginTop: 2 },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 34, color: colors.green, marginTop: 4 },
  body: { marginTop: 16, backgroundColor: colors.card, borderRadius: radius.lg, padding: 18, ...shadow.card },
  text: { fontFamily: fonts.regular, fontSize: 16.5, lineHeight: 29, color: colors.ink },
  glossBox: { marginTop: 16, backgroundColor: colors.yellowSoft, borderRadius: radius.lg, padding: 16 },
  glossLabel: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 17, color: '#8A6200', letterSpacing: 0.4, marginBottom: 6 },
  glossText: { fontFamily: fonts.regular, fontSize: 15.5, lineHeight: 26, color: colors.ink },
  note: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, color: colors.ink3, marginTop: 12 },
  link: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.info },
  footer: { paddingHorizontal: 20, paddingTop: 10, backgroundColor: colors.paper },
  actions: { flexDirection: 'row', gap: 8 },
  action: { flex: 1, alignItems: 'center', gap: 4, backgroundColor: colors.card, borderRadius: radius.md, paddingVertical: 10 },
  actionText: { fontFamily: fonts.medium, fontSize: 12.5, lineHeight: 17, color: colors.ink2 },
  nav: { flexDirection: 'row', gap: 8, marginTop: 10 },
  navBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.card, borderRadius: radius.pill, paddingHorizontal: 14, height: 42 },
  navText: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.ink2, flexShrink: 1 },
  navOff: { opacity: 0.4 },
});
