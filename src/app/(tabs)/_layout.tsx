import React from 'react';
import { Tabs } from 'expo-router';
import { colors } from '@/theme';
import { TabBar } from '@/components/TabBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false, animation: 'shift', sceneStyle: { backgroundColor: colors.paper } }}>
      <Tabs.Screen name="index" options={{ title: 'পরামর্শ' }} />
      <Tabs.Screen name="library" options={{ title: 'আইনকোষ' }} />
      <Tabs.Screen name="settings" options={{ title: 'সেটিংস' }} />
    </Tabs>
  );
}
