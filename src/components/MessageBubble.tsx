import React, { memo, useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Speech from 'expo-speech';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { colors, fonts, radius } from '@/theme';
import type { ChatMessage, Citation } from '@/lib/types';
import { toBanglaDigits } from '@/lib/understand';
import { banglaizeMarkers } from '@/lib/rag';
import { CitationCard } from './CitationCard';

const HEADINGS = new Set(['আইন কী বলে', 'শাস্তি ও পরিণতি', 'এখন আপনার করণীয়', 'সহজ ব্যাখ্যা']);

/** Renders the composer/model output with light structure: headings, bullets, numbered steps. */
function RichAnswer({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <View>
      {lines.map((ln, i) => {
        const trimmed = ln.trim();
        if (!trimmed) return <View key={i} style={{ height: 8 }} />;
        if (HEADINGS.has(trimmed) || /^#+\s/.test(trimmed)) return <Text key={i} style={s.heading}>{trimmed.replace(/^#+\s/, '')}</Text>;
        const bullet = trimmed.match(/^[•\-*]\s+(.*)$/);
        if (bullet) {
          return (
            <View key={i} style={s.bulletRow}>
              <View style={s.bulletDot} />
              <Text style={[s.aiText, { flex: 1 }]}>{bullet[1]}</Text>
            </View>
          );
        }
        const num = trimmed.match(/^([0-9০-৯]+)[.)।]\s+(.*)$/);
        if (num) {
          return (
            <View key={i} style={s.bulletRow}>
              <View style={s.numBadge}>
                <Text style={s.numText}>{num[1]}</Text>
              </View>
              <Text style={[s.aiText, { flex: 1 }]}>{num[2]}</Text>
            </View>
          );
        }
        return <Text key={i} style={s.aiText}>{trimmed}</Text>;
      })}
    </View>
  );
}

function Appear({ children }: { children: React.ReactNode }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [v]);
  return <Animated.View style={{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>{children}</Animated.View>;
}

export const MessageBubble = memo(function MessageBubble(props: { m: ChatMessage; onChip?: (text: string) => void }) {
  return (
    <Appear>
      <MessageBubbleInner {...props} />
    </Appear>
  );
});

function MessageBubbleInner({ m, onChip }: { m: ChatMessage; onChip?: (text: string) => void }) {
  if (m.role === 'user') {
    return (
      <View style={s.userRow}>
        <View style={s.userBubble}>
          <Text style={s.userText}>{m.text}</Text>
        </View>
      </View>
    );
  }
  return <AiMessage m={m} onChip={onChip} />;
}

function AiMessage({ m, onChip }: { m: ChatMessage; onChip?: (text: string) => void }) {
  const [showSources, setShowSources] = useState(false);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const n = m.citations?.length ?? 0;

  const copy = async () => {
    await Clipboard.setStringAsync(m.text.replace(/\[\s*[0-9০-৯]+\s*\]/g, '').trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  const speak = () => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(m.text.replace(/\[\s*[0-9০-৯]+\s*\]/g, ''), { language: 'bn-BD', rate: 0.95, onDone: () => setSpeaking(false), onStopped: () => setSpeaking(false), onError: () => setSpeaking(false) });
  };

  return (
    <View style={s.ai}>
      {m.text ? <RichAnswer text={banglaizeMarkers(m.text)} /> : null}
      {m.streaming && (
        <View style={s.thinking}>
          <ActivityIndicator size="small" color={colors.sage} />
          <Text style={s.thinkingText}>{m.text ? 'লিখছে…' : 'আইনের ধারা খুঁজছে…'}</Text>
        </View>
      )}
      {m.error ? <Text style={s.err}>{m.error}</Text> : null}

      {!m.streaming && !!m.text && (
        <View style={s.actions}>
          <Pressable onPress={copy} hitSlop={8} style={({ pressed }) => [s.actBtn, pressed && s.actPressed]} accessibilityLabel="কপি">
            <Feather name={copied ? 'check' : 'copy'} size={16} color={copied ? colors.sage : colors.ink3} />
          </Pressable>
          <Pressable onPress={speak} hitSlop={8} style={({ pressed }) => [s.actBtn, pressed && s.actPressed]} accessibilityLabel="শুনুন">
            <Feather name={speaking ? 'square' : 'volume-2'} size={16} color={speaking ? colors.sage : colors.ink3} />
          </Pressable>
          {n > 0 && (
            <Pressable onPress={() => setShowSources(true)} hitSlop={6} style={({ pressed }) => [s.srcBtn, pressed && s.actPressed]} accessibilityLabel="উৎস">
              <Feather name="book-open" size={14} color={colors.ink2} />
              <Text style={s.srcText}>উৎস</Text>
              <View style={s.srcBadge}>
                <Text style={s.srcBadgeText}>{toBanglaDigits(n)}</Text>
              </View>
            </Pressable>
          )}
        </View>
      )}

      {!m.streaming && !!m.options?.length && (
        <View style={s.chips}>
          {m.options.map((o) => (
            <Pressable key={o} onPress={() => onChip?.(o)} style={({ pressed }) => [s.chip, s.chipOption, pressed && { opacity: 0.7 }]}>
              <Text style={[s.chipText, { color: colors.green }]}>{o}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {!m.streaming && !!m.followUps?.length && (
        <View style={s.follow}>
          {m.followUps.map((f) => (
            <Pressable key={f} onPress={() => onChip?.(f)} style={({ pressed }) => [s.followRow, pressed && { opacity: 0.6 }]}>
              <Text style={s.followText}>{f}</Text>
              <Feather name="arrow-up-right" size={15} color={colors.ink3} />
            </Pressable>
          ))}
        </View>
      )}

      <SourcesSheet visible={showSources} onClose={() => setShowSources(false)} citations={m.citations ?? []} />
    </View>
  );
}

function SourcesSheet({ visible, onClose, citations }: { visible: boolean; onClose: () => void; citations: Citation[] }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <Pressable style={s.backdrop} onPress={onClose} />
      <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={s.grabber} />
        <View style={s.sheetHead}>
          <Text style={s.sheetTitle}>উৎস</Text>
          <Pressable onPress={onClose} hitSlop={10} style={s.sheetClose}>
            <Feather name="x" size={18} color={colors.ink} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 6 }} showsVerticalScrollIndicator={false}>
          {citations.map((c) => (
            <CitationCard key={c.sectionId} c={c} onOpen={onClose} />
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  userRow: { alignItems: 'flex-end', marginBottom: 18 },
  userBubble: { maxWidth: '82%', backgroundColor: colors.green, paddingHorizontal: 18, paddingVertical: 12, borderRadius: radius.xl, borderBottomRightRadius: 8 },
  userText: { fontFamily: fonts.regular, color: '#fff', fontSize: 15.5, lineHeight: 23 },
  ai: { marginBottom: 28, paddingHorizontal: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10, marginLeft: -8 },
  actBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  actPressed: { backgroundColor: colors.surface },
  srcBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 34, paddingLeft: 12, paddingRight: 8, borderRadius: radius.pill, backgroundColor: colors.card, marginLeft: 4 },
  srcText: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 20, color: colors.ink2 },
  srcBadge: { minWidth: 20, height: 20, paddingHorizontal: 5, borderRadius: 10, backgroundColor: colors.sageSoft, alignItems: 'center', justifyContent: 'center' },
  srcBadgeText: { fontFamily: fonts.semibold, fontSize: 11.5, lineHeight: 16, color: colors.green },
  follow: { marginTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
  followRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hairline },
  followText: { flex: 1, fontFamily: fonts.regular, fontSize: 14.5, lineHeight: 22, color: colors.ink },
  backdrop: { flex: 1, backgroundColor: 'rgba(12,59,46,0.35)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '78%', backgroundColor: colors.paper, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 18, paddingTop: 8 },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.hairline, marginBottom: 6 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  sheetTitle: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 26, color: colors.green },
  sheetClose: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  aiText: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 27, color: colors.ink },
  thinking: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  thinkingText: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.ink3 },
  err: { fontFamily: fonts.regular, color: colors.danger, fontSize: 13.5, marginTop: 6 },
  heading: { fontFamily: fonts.bold, fontSize: 13.5, color: colors.green, marginTop: 10, marginBottom: 6 },
  bulletRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.sage, marginTop: 11 },
  numBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center', marginTop: 3 },
  numText: { fontFamily: fonts.bold, fontSize: 12, color: colors.green },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.paper, borderRadius: radius.pill, paddingHorizontal: 12, height: 34 },
  chipOption: { backgroundColor: colors.sageSoft },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.ink2 },
});
