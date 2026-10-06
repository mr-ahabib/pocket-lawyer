import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, shadow, t } from '@/theme';

export function Screen({ children, style }: { children?: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flex: 1, backgroundColor: colors.paper }, style]}>{children}</View>;
}

/** Deep-green header block used on every screen (tabs and inner screens alike). */
export function Hero({ children, style, compact, back, title }: { children?: React.ReactNode; style?: StyleProp<ViewStyle>; compact?: boolean; back?: boolean; title?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.hero, { paddingTop: insets.top + (compact ? 10 : 16) }, style]}>
      {back ? (
        <View style={s.heroNav}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={s.backBtn} accessibilityRole="button">
            <Feather name="arrow-left" size={20} color={colors.ink} />
          </Pressable>
          {title ? <Text numberOfLines={1} style={s.heroNavTitle}>{title}</Text> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

export function Card({ children, style, onPress }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  const body = <View style={[s.card, style]}>{children}</View>;
  if (!onPress) return body;
  return <Pressable onPress={onPress} style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.985 : 1 }] }]}>{body}</Pressable>;
}

export function Tag({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'green' | 'brass' | 'danger' }) {
  const bg = { neutral: colors.surface, green: colors.sageSoft, brass: colors.yellowSoft, danger: colors.dangerSoft }[tone];
  const fg = { neutral: colors.ink2, green: colors.sage, brass: '#8A6200', danger: colors.danger }[tone];
  return (
    <View style={[s.tag, { backgroundColor: bg }]}>
      <Text numberOfLines={1} style={[s.tagText, { color: fg, includeFontPadding: false }]}>{children}</Text>
    </View>
  );
}

export function Button({
  title, onPress, variant = 'primary', icon, loading, disabled, style, small,
}: {
  title: string; onPress?: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'light';
  icon?: React.ComponentProps<typeof Feather>['name']; loading?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle>; small?: boolean;
}) {
  const bg = { primary: colors.green, secondary: colors.surface, ghost: 'transparent', danger: colors.dangerSoft, light: '#fff' }[variant];
  const fg = { primary: '#fff', secondary: colors.ink, ghost: colors.ink2, danger: colors.danger, light: colors.green }[variant];
  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [s.btn, small && s.btnSmall, { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 }, style]}>
      {loading ? <ActivityIndicator color={fg} size="small" /> : icon ? <Feather name={icon} size={small ? 15 : 17} color={fg} /> : null}
      <Text numberOfLines={1} style={[t.button, small && { fontSize: 14 }, { color: fg, flexShrink: 0, includeFontPadding: false }]}>{title}</Text>
    </Pressable>
  );
}

export function SearchBar(props: TextInputProps & { onClear?: () => void; light?: boolean }) {
  const { light, onClear, ...rest } = props;
  return (
    <View style={[s.search, light && { backgroundColor: '#fff' }]}>
      <Feather name="search" size={18} color={colors.ink3} />
      <TextInput placeholderTextColor={colors.ink3} style={s.searchInput} returnKeyType="search" autoCorrect={false} {...rest} />
      {!!props.value && (
        <Pressable onPress={onClear} hitSlop={10}>
          <Feather name="x" size={18} color={colors.ink3} />
        </Pressable>
      )}
    </View>
  );
}

export function Empty({ icon = 'inbox', title, hint }: { icon?: React.ComponentProps<typeof Feather>['name']; title: string; hint?: string }) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Feather name={icon} size={22} color={colors.ink3} />
      </View>
      <Text style={[t.h2, { marginTop: 14, textAlign: 'center' }]}>{title}</Text>
      {hint ? <Text style={[t.bodySm, { textAlign: 'center', marginTop: 4 }]}>{hint}</Text> : null}
    </View>
  );
}

export function Hairline({ inset = 0 }: { inset?: number }) {
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.hairline, marginLeft: inset }} />;
}

export function Label({ children }: { children: React.ReactNode }) {
  return <Text style={[t.label, { paddingHorizontal: 24, paddingTop: 26, paddingBottom: 10 }]}>{children}</Text>;
}

export function Row({ title, hint, right, onPress, icon }: { title: string; hint?: string; right?: React.ReactNode; onPress?: () => void; icon?: React.ComponentProps<typeof Feather>['name'] }) {
  const inner = (
    <View style={s.row}>
      {icon ? (
        <View style={s.rowIcon}>
          <Feather name={icon} size={16} color={colors.sage} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={t.bodyMd}>{title}</Text>
        {hint ? <Text style={[t.caption, { marginTop: 2, fontFamily: fonts.regular }]}>{hint}</Text> : null}
      </View>
      {right ?? (onPress ? <Feather name="chevron-right" size={18} color={colors.ink3} /> : null)}
    </View>
  );
  if (!onPress) return inner;
  return <Pressable onPress={onPress} style={({ pressed }) => [pressed && { backgroundColor: colors.surface }]}>{inner}</Pressable>;
}

const s = StyleSheet.create({
  hero: { paddingHorizontal: 22, paddingBottom: 12, backgroundColor: 'transparent' },
  heroNav: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  heroNavTitle: { flex: 1, fontFamily: fonts.medium, fontSize: 13.5, lineHeight: 20, color: colors.ink3, includeFontPadding: false },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 18 },
  tag: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  tagText: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 17 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20, height: 48, borderRadius: radius.pill, alignSelf: 'flex-start' },
  btnSmall: { height: 40, paddingHorizontal: 16 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderRadius: radius.pill, paddingHorizontal: 16, height: 50, ...shadow.card },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 15.5, color: colors.ink, paddingVertical: 0 },
  empty: { alignItems: 'center', paddingVertical: 56, paddingHorizontal: 32 },
  emptyIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, minHeight: 58, gap: 12 },
  rowIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
});
