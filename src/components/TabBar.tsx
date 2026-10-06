import React, { useEffect, useState } from 'react';
import { Animated, Easing, Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { colors, fonts, radius, shadow } from '@/theme';
import { useHideTabBar } from '@/lib/uiState';

const ICONS: Record<string, React.ComponentProps<typeof Feather>['name']> = {
  index: 'message-circle',
  library: 'book-open',
  settings: 'sliders',
};

const INSET = 3; // gap between the sliding pill and the bar edge – "almost touching"
const ITEM_W = 104;

/** Floating dark bar; a sage pill slides under the active tab with a spring. */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const hidden = useHideTabBar();
  const [kb, setKb] = useState(false);
  const [x] = useState(() => new Animated.Value(state.index));
  const [labelFade] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const a = Keyboard.addListener('keyboardDidShow', () => setKb(true));
    const b = Keyboard.addListener('keyboardDidHide', () => setKb(false));
    return () => {
      a.remove();
      b.remove();
    };
  }, []);

  useEffect(() => {
    labelFade.setValue(0);
    Animated.parallel([
      Animated.spring(x, { toValue: state.index, useNativeDriver: true, damping: 18, stiffness: 220, mass: 0.7 }),
      Animated.timing(labelFade, { toValue: 1, duration: 220, delay: 60, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [state.index, x, labelFade]);

  if (hidden || kb) return null;
  const n = state.routes.length;
  const translateX = x.interpolate({ inputRange: [0, Math.max(1, n - 1)], outputRange: [0, Math.max(1, n - 1) * ITEM_W] });

  return (
    <View pointerEvents="box-none" style={[s.wrap, { paddingBottom: Math.max(insets.bottom, 6) + 4 }]}>
      <LinearGradient pointerEvents="none" colors={['rgba(237,241,234,0)', colors.paper]} style={s.fade} />
      <View style={[s.bar, shadow.float, { width: n * ITEM_W + INSET * 2 }]}>
        <Animated.View pointerEvents="none" style={[s.pill, { transform: [{ translateX }] }]} />
        {state.routes.map((route: (typeof state.routes)[number], i: number) => {
          const focused = state.index === i;
          const { options } = descriptors[route.key];
          const label = typeof options.title === 'string' ? options.title : route.name;
          const onPress = () => {
            const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <Pressable key={route.key} onPress={onPress} style={s.item} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: focused }}>
              <Feather name={ICONS[route.name] ?? 'circle'} size={19} color={focused ? '#fff' : 'rgba(255,255,255,0.55)'} />
              {focused ? (
                <Animated.Text numberOfLines={1} style={[s.label, { opacity: labelFade }]}>
                  {label}
                </Animated.Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 110 },
  bar: { flexDirection: 'row', backgroundColor: colors.dark, borderRadius: radius.pill, padding: INSET },
  pill: { position: 'absolute', top: INSET, left: INSET, bottom: INSET, width: ITEM_W, borderRadius: radius.pill, backgroundColor: colors.sage },
  item: { width: ITEM_W, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  label: { fontFamily: fonts.semibold, fontSize: 13.5, lineHeight: 20, color: '#fff', includeFontPadding: false },
});

export const TAB_BAR_SPACE = 84;
