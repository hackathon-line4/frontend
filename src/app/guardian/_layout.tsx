import { Stack } from 'expo-router';

import { RecipientCallAlert } from '@/features/guardian/RecipientCallAlert';
import { RoleGate } from '@/features/session';
import { colors } from '@/theme';

// 보호자 화면 묶음. 역할이 보호자일 때만 들어올 수 있다.
export default function GuardianLayout() {
  return (
    <RoleGate role="guardian">
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgIvory } }} />
      {/* 당사자의 '보호자 부르기'를 앱 안에서 알리는 창 (SSE) */}
      <RecipientCallAlert />
    </RoleGate>
  );
}
