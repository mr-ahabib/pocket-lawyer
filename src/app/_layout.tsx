import React, { Suspense, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, NotoSansBengali_400Regular, NotoSansBengali_500Medium, NotoSansBengali_600SemiBold, NotoSansBengali_700Bold } from '@expo-google-fonts/noto-sans-bengali';
import { DB_NAME } from '@/lib/db';
import { ensureDatabase } from '@/lib/dbBootstrap';
import { ModelProvider } from '@/lib/ModelContext';
import { colors, fonts } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Loading({ progress }: { progress?: number }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper, gap: 12 }}>
      <ActivityIndicator color={colors.green} />
      <Text style={{ fontFamily: fonts.regular, color: colors.ink3, fontSize: 14 }}>
        {progress !== undefined ? `আইনের ডেটাবেজ প্রস্তুত হচ্ছে… ${Math.round(progress * 100)}%` : 'প্রস্তুত হচ্ছে…'}
      </Text>
    </View>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({ NotoSansBengali_400Regular, NotoSansBengali_500Medium, NotoSansBengali_600SemiBold, NotoSansBengali_700Bold });
  const [dbReady, setDbReady] = useState(false);
  const [dbProgress, setDbProgress] = useState<number | undefined>(undefined);
  const [dbError, setDbError] = useState<string | null>(null);
  useEffect(() => {
    ensureDatabase((f) => setDbProgress(f))
      .then(() => setDbReady(true))
      .catch((e) => setDbError(String(e?.message ?? e)));
  }, []);
  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);
  if (!loaded) return null;
  if (dbError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper, padding: 32 }}>
        <Text style={{ fontFamily: fonts.regular, color: colors.ink2, fontSize: 15, textAlign: 'center' }}>ডেটাবেজ প্রস্তুত করা যায়নি। অ্যাপটি বন্ধ করে আবার খুলুন।{'\n'}{dbError}</Text>
      </View>
    );
  }
  if (!dbReady) return <Loading progress={dbProgress} />;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Suspense fallback={<Loading />}>
        <SQLiteProvider databaseName={DB_NAME} useSuspense>
          <ModelProvider>
            <Stack
              screenOptions={{
                animation: 'slide_from_right',
                animationDuration: 260,
                gestureEnabled: true,
                headerShadowVisible: false,
                headerTintColor: colors.ink,
                headerTitleStyle: { fontFamily: fonts.semibold, fontSize: 17 },
                headerStyle: { backgroundColor: colors.paper },
                contentStyle: { backgroundColor: colors.paper },
                headerBackButtonDisplayMode: 'minimal',
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="act/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="section/[id]" options={{ headerShown: false }} />
            </Stack>
          </ModelProvider>
        </SQLiteProvider>
      </Suspense>
    </SafeAreaProvider>
  );
}
