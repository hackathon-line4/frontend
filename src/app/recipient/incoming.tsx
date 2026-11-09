import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

import {
  backToIdle,
  mockIncomingSignal,
  replyToSignal,
  startIncomingVibration,
  stopIncomingVibration,
} from '@/features/recipient';
import RecipientIncomingScreen from '@/screens/recipient/RecipientIncomingScreen';

// TODO: 실시간 수신 / 푸시 알림으로 이 화면을 열고 받은 신호를 넘긴다
export default function RecipientIncomingRoute() {
  const replying = useRef(false);

  useEffect(() => {
    startIncomingVibration(mockIncomingSignal.pulses);
    return stopIncomingVibration;
  }, []);

  const handleReply = async () => {
    if (replying.current) return;
    replying.current = true;
    stopIncomingVibration();
    const ok = await replyToSignal();
    replying.current = false;
    // 서버 확인 후에만 '응답 완료'. 실패하면 이 화면 유지 (자동 재시도는 replyToSignal에서)
    if (ok) router.replace('/recipient/replied');
  };

  return (
    <RecipientIncomingScreen
      senderName={mockIncomingSignal.senderName}
      signalName={mockIncomingSignal.signalName}
      onReply={handleReply}
      onNoReply={() => {
        // 반복 진동만 멈추고 조용히 대기로. 보호자에게는 '응답 없음' 전달 (TODO: 서버)
        stopIncomingVibration();
        backToIdle();
      }}
    />
  );
}
