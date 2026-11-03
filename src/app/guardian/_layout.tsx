import { Stack } from 'expo-router';

import { RoleGate } from '@/features/session';
import { colors } from '@/theme';

// 보호자 화면 묶음. 역할이 보호자일 때만 들어올 수 있다.
export default function GuardianLayout() {
  return (
    <RoleGate role="guardian">
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgIvory } }} />
    </RoleGate>
  );
}
