import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { colors, fonts, radius, shadow } from '@/theme';
import { TAB_BAR_SPACE } from '@/components/TabBar';
import { Button, Hairline, Hero, Label, Row, Screen } from '@/components/ui';
import { useModel } from '@/lib/ModelContext';
import { fmtBytes, isDownloaded } from '@/lib/models';
import { getMeta } from '@/lib/db';
import { toBanglaDigits } from '@/lib/understand';

export default function SettingsScreen() {
  const m = useModel();
  const db = useSQLiteContext();
  const [meta, setMeta] = useState<Record<string, string>>({});

  useEffect(() => {
    getMeta(db).then(setMeta).catch(() => {});
  }, [db]);

  const pct = m.progress ? Math.min(100, Math.round((m.progress.written / m.progress.total) * 100)) : 0;
  const statusText: Record<typeof m.status, string> = {
    unavailable: 'এই ডিভাইসে অফলাইন এআই সমর্থিত নয়',
    not_downloaded: 'চালু নেই',
    downloading: `ডাউনলোড হচ্ছে · ${toBanglaDigits(pct)}%`,
    downloaded: 'ডাউনলোড আছে · চালু হয়নি',
    loading: 'চালু হচ্ছে…',
    ready: 'চালু · অফলাইনে কাজ করছে',
    error: 'সমস্যা হয়েছে',
  };
  const dotColor = m.status === 'ready' ? colors.sage : m.status === 'error' ? colors.danger : colors.ink3;
  const has = isDownloaded(m.spec);

  return (
    <Screen>
      <Hero style={{ paddingBottom: 8 }}>
        <Text style={s.title}>সেটিংস</Text>
      </Hero>
      <ScrollView contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE + 16 }} showsVerticalScrollIndicator={false}>

        <Label>অফলাইন এআই</Label>
        <View style={s.group}>
          <View style={{ padding: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[s.dot, { backgroundColor: dotColor }]} />
              <Text style={s.statusText}>{statusText[m.status]}</Text>
            </View>
            <Text style={s.p}>প্রথমবার খোলার সময় নিজে থেকেই নামে ({fmtBytes(m.spec.sizeBytes)}); এরপর ইন্টারনেট ছাড়াই চলে। কোনো তথ্য ফোনের বাইরে যায় না।</Text>
            {m.status === 'downloading' && m.progress && (
              <View style={{ marginTop: 14 }}>
                <View style={s.bar}>
                  <View style={[s.barFill, { width: `${pct}%` }]} />
                </View>
                <Text style={s.barText}>{fmtBytes(m.progress.written)} / {fmtBytes(m.progress.total)}</Text>
              </View>
            )}
            {m.error ? <Text style={s.err}>{m.error}</Text> : null}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
              {(m.status === 'not_downloaded' || (m.status === 'error' && !has)) && <Button small title="ডাউনলোড করুন" icon="download" onPress={m.download} disabled={!m.nativeAvailable} />}
              {m.status === 'error' && has && <Button small title="আবার চেষ্টা করুন" icon="refresh-cw" onPress={m.load} />}
              {m.status === 'downloading' && <Button small title="বাতিল" variant="secondary" icon="x" onPress={m.cancelDownload} />}
              {m.status === 'downloaded' && <Button small title="চালু করুন" icon="play" onPress={m.load} />}
              {m.status === 'ready' && <Button small title="বন্ধ রাখুন" variant="secondary" icon="pause" onPress={m.unload} />}
              {(m.status === 'downloaded' || m.status === 'ready' || (m.status === 'error' && has)) && (
                <Button small title="মুছে ফেলুন" variant="danger" icon="trash-2" onPress={() => Alert.alert('অফলাইন এআই মুছবেন?', 'ফোন থেকে ফাইলটি মুছে যাবে; পরে আবার ডাউনলোড করা যাবে।', [{ text: 'না' }, { text: 'মুছুন', style: 'destructive', onPress: m.remove }])} />
              )}
            </View>
          </View>
        </View>

        <Label>পছন্দ</Label>
        <View style={s.group}>
          <Row title="অ্যাপ খুললেই এআই চালু হোক" hint="বন্ধ রাখলে প্রথম প্রশ্নের সময় চালু হবে" right={<Switch value={m.settings.autoLoad} onValueChange={(v) => m.updateSettings({ autoLoad: v })} trackColor={{ true: colors.sage, false: colors.hairline }} thumbColor="#fff" />} />
          <Hairline inset={18} />
          <Row title="দ্রুত মোড (GPU)" hint={m.settings.backend === 'cpu' ? 'বন্ধ' : 'স্বয়ংক্রিয়: ফোন সমর্থন করলে ব্যবহার হয়'} right={<Switch value={m.settings.backend !== 'cpu'} onValueChange={(v) => m.updateSettings({ backend: v ? 'auto' : 'cpu' })} trackColor={{ true: colors.sage, false: colors.hairline }} thumbColor="#fff" />} />
          <Hairline inset={18} />
          <Row title="রহিত আইনও খুঁজুন" hint="সাধারণত বন্ধ রাখুন" right={<Switch value={m.settings.includeRepealed} onValueChange={(v) => m.updateSettings({ includeRepealed: v })} trackColor={{ true: colors.sage, false: colors.hairline }} thumbColor="#fff" />} />
        </View>

        <Label>তথ্যসূত্র ও সহায়তা</Label>
        <View style={s.group}>
          <Row
            title="Laws of Bangladesh"
            hint={`আইন, বিচার ও সংসদ বিষয়ক মন্ত্রণালয় · ${meta.act_count ? toBanglaDigits(meta.act_count) : '—'}টি আইন · হালনাগাদ ${meta.scraped_at ?? '—'}`}
            icon="book"
            onPress={() => Linking.openURL('http://bdlaws.minlaw.gov.bd')}
          />
          <Hairline inset={18} />
          <Row title="জরুরি সেবা ৯৯৯" hint="পুলিশ, ফায়ার সার্ভিস, অ্যাম্বুলেন্স" icon="phone-call" onPress={() => Linking.openURL('tel:999')} />
          <Hairline inset={18} />
          <Row title="সরকারি আইনি সহায়তা ১৬৪৩০" hint="জাতীয় আইনগত সহায়তা প্রদান সংস্থা" icon="phone" onPress={() => Linking.openURL('tel:16430')} />
        </View>

        <Text style={s.foot}>এই অ্যাপ সাধারণ আইনি তথ্য দেয়; এটি আইনজীবীর পরামর্শের বিকল্প নয়।</Text>
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 40, color: colors.green, marginTop: 4 },
  sub: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.ink3, marginTop: 2 },
  group: { marginHorizontal: 20, backgroundColor: colors.card, borderRadius: radius.lg, overflow: 'hidden', ...shadow.card },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontFamily: fonts.semibold, fontSize: 15.5, color: colors.ink },
  p: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.ink2, marginTop: 8 },
  bar: { height: 6, borderRadius: 3, backgroundColor: colors.surface, overflow: 'hidden' },
  barFill: { height: 6, backgroundColor: colors.sage },
  barText: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.ink3, marginTop: 6 },
  err: { fontFamily: fonts.regular, color: colors.danger, fontSize: 13.5, marginTop: 10, lineHeight: 20 },
  foot: { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 18, color: colors.ink3, paddingHorizontal: 24, marginTop: 26 },
});
