import { router, useLocalSearchParams } from 'expo-router';

import { mockRecipient } from '@/features/link/mock';
import { findSignal } from '@/features/signals';
import SignalDetailScreen from '@/screens/guardian/SignalDetailScreen';

export default function SignalDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const signal = id ? findSignal(id) : undefined;

  return (
    <SignalDetailScreen
      signal={signal}
      recipientName={mockRecipient.name}
      onBack={() => (router.canGoBack() ? router.back() : router.navigate('/guardian/signals'))}
      onTeach={() => {
        // TODO: 연습 진동 전송 API (기록 08에는 '연습'으로 따로 남김) · 성공 시 '연습 전' 해제
      }}
      onSend={() => {
        // TODO: 신호 전송 API 호출 + 전송 햅틱
      }}
    />
  );
}
