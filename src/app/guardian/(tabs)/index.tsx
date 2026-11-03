import { router } from 'expo-router';

import { mockFrequentSignalIds, mockLocation, mockRecentActivity, mockRecipientStatus } from '@/features/home';
import { findSignal, mockSignals, type Signal } from '@/features/signals';
import GuardianHomeScreen from '@/screens/guardian/GuardianHomeScreen';

// TODO: 서버 연결 후 당사자 상태 · 최근 활동 · 위치를 실시간으로 받아 온다.
// 응답 대기 시간을 넘긴 주의 카드는 mockRecipientStatusNoReply 로 확인할 수 있다.
const frequentSignals = mockFrequentSignalIds.map(findSignal).filter((s): s is Signal => s !== undefined);
const emergencySignals = mockSignals.filter((s) => s.category === 'emergency');

export default function GuardianHomeRoute() {
  return (
    <GuardianHomeScreen
      recipient={mockRecipientStatus}
      frequentSignals={frequentSignals}
      emergencySignals={emergencySignals}
      location={mockLocation}
      recentActivity={mockRecentActivity}
      onSendSignal={() => {
        // TODO: 신호 전송 API 호출 + 전송 햅틱
      }}
      onOpenNotifications={() => {
        // TODO: 알림 화면 (설계 필요)
      }}
      onOpenSignals={() => router.navigate('/guardian/signals')}
      onAddSignal={() => router.push('/guardian/add-signal')}
      onOpenLocation={() => router.navigate('/guardian/location')}
      onOpenHistory={() => router.navigate('/guardian/history')}
      onOpenRecord={(id) => router.push(`/guardian/record/${id}`)}
      onOpenNoReply={() => router.push('/guardian/no-reply')}
    />
  );
}
