import { Tabs } from 'expo-router';

import { TabBar, type TabKey } from '@/components';

// 보호자 하단 탭 5개: 홈 · 신호 · 위치 · 기록 · 설정
const routeByTab: Record<TabKey, string> = {
  home: 'index',
  signal: 'signals',
  location: 'location',
  history: 'history',
  settings: 'settings',
};

const tabByRoute = Object.fromEntries(Object.entries(routeByTab).map(([tab, route]) => [route, tab])) as Record<
  string,
  TabKey
>;

export default function GuardianTabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigateToTab }) => (
        <TabBar
          active={tabByRoute[state.routes[state.index].name] ?? 'home'}
          onSelect={(key) => {
            const route = state.routes.find((r) => r.name === routeByTab[key]);
            if (route) navigateToTab(route.key);
          }}
        />
      )}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="signals" />
      <Tabs.Screen name="location" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
