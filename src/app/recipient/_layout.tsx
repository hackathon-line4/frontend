import { Stack } from 'expo-router';

import { RoleGate } from '@/features/session';
import { colors } from '@/theme';

// 당사자 화면 묶음. 탭바·헤더 없이 화면 전체가 하나의 터치 영역인 상태 화면들.
export default function RecipientLayout() {
  return (
    <RoleGate role="recipient">
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          gestureEnabled: false,
          contentStyle: { backgroundColor: colors.rBlack },
        }}
      >
        <Stack.Screen name="settings" options={{ animation: 'default', contentStyle: { backgroundColor: colors.bgIvory } }} />
      </Stack>
    </RoleGate>
  );
}
