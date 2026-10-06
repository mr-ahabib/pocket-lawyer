import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { setHideTabBar } from '@/lib/uiState';
import { TAB_BAR_SPACE } from '@/components/TabBar';
import { FlatList, Keyboard, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Gemma from '@modules/gemma-llm';
import { colors, fonts, radius, shadow } from '@/theme';
import { Hero, Screen } from '@/components/ui';
import { MessageBubble } from '@/components/MessageBubble';
import { VoiceButton } from '@/components/VoiceButton';
import { retrieve } from '@/lib/search';
import { compose, CLARIFY_QUERIES } from '@/lib/composer';
import { citedIndices, toCitations } from '@/lib/rag';
import { useModel } from '@/lib/ModelContext';
import { toBanglaDigits } from '@/lib/understand';
import type { ChatMessage } from '@/lib/types';

type Topic = { icon: React.ComponentProps<typeof Feather>['name']; title: string; q: string };
const TOPICS: Topic[] = [
  { icon: 'shield', title: 'পুলিশ ও গ্রেফতার', q: 'পুলিশ কি পরোয়ানা ছাড়া গ্রেফতার করতে পারে?' },
  { icon: 'truck', title: 'ট্রাফিক ও গাড়ি', q: 'হেলমেট ছাড়া বাইক চালালে জরিমানা কত?' },
  { icon: 'credit-card', title: 'চেক ও টাকা', q: 'চেক বাউন্স হলে কী করব?' },
  { icon: 'home', title: 'বাড়ি ভাড়া', q: 'বাড়িওয়ালা নোটিশ ছাড়া বের করে দিতে পারে?' },
  { icon: 'shopping-bag', title: 'ভোক্তা অধিকার', q: 'দোকানে বেশি দাম নিলে কোথায় অভিযোগ করব?' },
  { icon: 'briefcase', title: 'চাকরি ও বেতন', q: 'অফিস তিন মাস বেতন দিচ্ছে না, আমার অধিকার কী?' },
  { icon: 'heart', title: 'পরিবার', q: 'যৌতুক দাবি করলে কী শাস্তি?' },
  { icon: 'smartphone', title: 'অনলাইন হয়রানি', q: 'ফেসবুকে কেউ মানহানিকর পোস্ট দিলে কী করব?' },
];

let idc = 0;
const nid = () => `m${Date.now()}_${idc++}`;

export default function ChatScreen() {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const model = useModel();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef<FlatList>(null);
  const [kbOpen, setKbOpen] = useState(false);
  useEffect(() => {
    const a = Keyboard.addListener('keyboardDidShow', () => {
      setKbOpen(true);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    });
    const b = Keyboard.addListener('keyboardDidHide', () => setKbOpen(false));
    return () => {
      a.remove();
      b.remove();
    };
  }, []);
  const lastTopicRef = useRef<string>('');
  const voiceBaseRef = useRef('');

  const inChat = messages.length > 0;
  useEffect(() => {
    setHideTabBar(inChat);
    return () => setHideTabBar(false);
  }, [inChat]);

  const patch = (id: string, p: Partial<ChatMessage> | ((m: ChatMessage) => Partial<ChatMessage>)) =>
    setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, ...(typeof p === 'function' ? p(m) : p) } : m)));

  const typeOut = useCallback(
    (id: string, full: string) =>
      new Promise<void>((resolve) => {
        let i = 0;
        const step = () => {
          i = Math.min(full.length, i + 16);
          patch(id, { text: full.slice(0, i) });
          if (i < full.length) setTimeout(step, 16);
          else resolve();
        };
        step();
      }),
    [],
  );

  const ask = useCallback(
    async (raw: string) => {
      const q0 = raw.trim();
      if (!q0 || busy) return;
      const q = CLARIFY_QUERIES[q0] ?? q0;
      setInput('');
      voiceBaseRef.current = '';
      setBusy(true);
      const aiId = nid();
      setMessages((ms) => [...ms, { id: nid(), role: 'user', text: q0 }, { id: aiId, role: 'assistant', text: '', streaming: true }]);
      try {
        // Understand the question on its own first; only fall back to the previous topic
        // when nothing legal was recognised (a true follow-up like "আর জামিন?").
        let r = await retrieve(db, q, { includeRepealed: model.settings.includeRepealed });
        const vague = r.understanding.conceptHits === 0 && r.understanding.sectionRefs.length === 0;
        if (vague && lastTopicRef.current) {
          const r2 = await retrieve(db, `${lastTopicRef.current} ${q}`, { includeRepealed: model.settings.includeRepealed });
          if (r2.hits.length) r = r2;
        } else if (!vague) {
          lastTopicRef.current = q;
        }
        const { hits, understanding } = r;
        const composed = compose(q, understanding, hits);

        if (composed.clarify) {
          await typeOut(aiId, composed.clarify.question);
          patch(aiId, { streaming: false, options: composed.clarify.options });
          return;
        }

        // 1) Instant structured answer from the statute text.
        patch(aiId, { mode: 'retrieval' });
        await typeOut(aiId, composed.text);
        const idx = citedIndices(composed.text, hits.length);
        const all = toCitations(hits);
        const baseCites = idx.length ? all.filter((c) => idx.includes(c.index)) : all.slice(0, 3);
        patch(aiId, { citations: baseCites, followUps: composed.followUps });

        patch(aiId, { streaming: false });
      } catch (e: any) {
        patch(aiId, (m) => ({ streaming: false, error: `সমস্যা হয়েছে: ${e?.message ?? e}`, text: m.text }));
      } finally {
        setBusy(false);
      }
    },
    [busy, db, model, typeOut],
  );

  const reset = () => {
    Gemma.cancel();
    setMessages([]);
    lastTopicRef.current = '';
  };

  const onVoice = (text: string, final: boolean) => {
    setInput((voiceBaseRef.current ? voiceBaseRef.current + ' ' : '') + text);
    if (final) voiceBaseRef.current = (voiceBaseRef.current ? voiceBaseRef.current + ' ' : '') + text;
  };

  // plain function (not a component) so the TextInput is never remounted while typing
  const inputBox = (big?: boolean) => (
    <View style={[big ? s.inputCard : s.inputWrap, big ? shadow.card : shadow.card]}>
      <TextInput
        style={[s.input, big && { minHeight: 44 }]}
        placeholder={big ? 'আপনার সমস্যাটি লিখুন বা বলুন…' : 'আরও জিজ্ঞেস করুন…'}
        placeholderTextColor={colors.ink3}
        value={input}
        onChangeText={(v) => {
          setInput(v);
          voiceBaseRef.current = '';
        }}
        multiline
        maxLength={600}
        editable={!busy}
      />
      <VoiceButton onText={onVoice} disabled={busy} />
      {busy ? (
        <Pressable onPress={() => Gemma.cancel()} style={[s.send, { backgroundColor: colors.ink2 }]}>
          <Feather name="square" size={14} color="#fff" />
        </Pressable>
      ) : (
        <Pressable onPress={() => ask(input)} disabled={!input.trim()} style={[s.send, !input.trim() && { backgroundColor: colors.surface }]}>
          <Feather name="arrow-up" size={19} color={input.trim() ? '#fff' : colors.ink3} />
        </Pressable>
      )}
    </View>
  );

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
        {!inChat ? (
          <>
          <Hero compact style={{ paddingBottom: 6 }}>
            <View style={s.heroTop}>
              <Text style={s.brand} numberOfLines={1}>পকেট আইনজীবী</Text>
            </View>
          </Hero>
          <ScrollView contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE + 8 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={{ paddingHorizontal: 22 }}>
              <Text style={s.greeting}>কী সমস্যায়{'\n'}পড়েছেন?</Text>
              <Text style={s.greetingSub}>নিজের ভাষায় লিখুন — আইন খুঁজে সহজ বাংলায় বুঝিয়ে দেব।</Text>
              {inputBox(true)}
            </View>
            <Text style={s.sectionLabel}>যে বিষয়ে বেশি প্রশ্ন আসে</Text>
            <View style={s.chips}>
              {TOPICS.map((tp) => (
                <Pressable key={tp.title} onPress={() => ask(tp.q)} style={({ pressed }) => [s.chip, pressed && { opacity: 0.7 }]}>
                  <View style={s.chipIcon}>
                    <Feather name={tp.icon} size={15} color={colors.green} />
                  </View>
                  <Text style={s.chipText} numberOfLines={1}>{tp.title}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={s.sectionLabel}>উদাহরণ</Text>
            <View style={s.examples}>
              {TOPICS.slice(0, 5).map((tp, i) => (
                <Pressable key={tp.q} onPress={() => ask(tp.q)} style={({ pressed }) => [s.example, i > 0 && s.exampleBorder, pressed && { opacity: 0.6 }]}>
                  <Text style={s.exampleNo}>{toBanglaDigits(i + 1)}</Text>
                  <Text style={s.exampleText}>{tp.q}</Text>
                  <Feather name="arrow-up-right" size={16} color={colors.sage} />
                </Pressable>
              ))}
            </View>
          </ScrollView>
          </>
        ) : (
          <>
            <Hero compact style={{ paddingBottom: 10 }}>
              <View style={s.heroTop}>
                <Text style={s.brand} numberOfLines={1}>পকেট আইনজীবী</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Pressable onPress={reset} style={s.iconBtn} hitSlop={8}>
                    <Feather name="x" size={18} color={colors.ink} />
                  </Pressable>
                </View>
              </View>
            </Hero>
            <View style={{ flex: 1 }}>
              <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(m) => m.id}
                renderItem={({ item }) => <MessageBubble m={item} onChip={ask} />}
                contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 22, paddingBottom: 32 }}
                onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                showsVerticalScrollIndicator={false}
                initialNumToRender={8}
                windowSize={9}
              />
              <LinearGradient pointerEvents="none" colors={[colors.paper, 'rgba(237,241,234,0)']} style={s.fadeTop} />
              <LinearGradient pointerEvents="none" colors={['rgba(237,241,234,0)', colors.paper]} style={s.fadeBottom} />
            </View>
            <View style={[s.inputBar, { paddingBottom: kbOpen ? 10 : Math.max(insets.bottom, 10) }]}>
              {inputBox()}
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const s = StyleSheet.create({
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flex: 1, fontFamily: fonts.bold, fontSize: 17, lineHeight: 26, color: colors.ink2, marginRight: 10 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.card, paddingHorizontal: 11, height: 30, borderRadius: radius.pill },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: fonts.medium, fontSize: 12.5, lineHeight: 18, color: colors.ink2 },
  iconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  greeting: { fontFamily: fonts.bold, fontSize: 34, lineHeight: 48, color: colors.green, marginTop: 20 },
  greetingSub: { fontFamily: fonts.regular, fontSize: 14.5, lineHeight: 22, color: colors.ink2, marginTop: 6, marginBottom: 18, paddingRight: 30 },
  inputCard: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, backgroundColor: colors.card, borderRadius: radius.lg, paddingLeft: 18, paddingRight: 8, paddingVertical: 8, marginBottom: 2, ...shadow.card },
  inputWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, backgroundColor: colors.card, borderRadius: 28, paddingLeft: 18, paddingRight: 6, paddingVertical: 6, ...shadow.card },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 15.5, lineHeight: 23, color: colors.ink, maxHeight: 120, paddingVertical: 8 },
  send: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18, color: colors.ink2, paddingHorizontal: 22, marginTop: 28, marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderRadius: radius.pill, paddingLeft: 6, paddingRight: 16, height: 46, alignSelf: 'flex-start', ...shadow.card },
  chipIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.sageSoft, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 22, color: colors.ink, flexShrink: 0, includeFontPadding: false },
  examples: { marginHorizontal: 20, backgroundColor: colors.card, borderRadius: radius.lg, overflow: 'hidden', ...shadow.card },
  exampleNo: { width: 22, fontFamily: fonts.bold, fontSize: 13, color: colors.brass },
  example: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 15 },
  exampleBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
  exampleText: { flex: 1, fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: colors.ink },
  foot: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: colors.ink3, textAlign: 'center', marginTop: 24 },
  inputBar: { paddingHorizontal: 14, paddingTop: 4, backgroundColor: colors.paper },
  fadeTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 36 },
  fadeBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 36 },
});
