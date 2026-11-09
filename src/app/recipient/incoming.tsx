import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

import {
  backToIdle,
  clearIncoming,
  mockIncomingSignal,
  replyToSignal,
  startIncomingVibration,
  stopIncomingVibration,
  useIncomingSignal,
} from '@/features/recipient';
import RecipientIncomingScreen from '@/screens/recipient/RecipientIncomingScreen';

// 07-4 신호 수신. handleIncoming(SSE · FCM)이 받은 신호를 저장하고 이 화면을 연다.
// 화면을 바로 열면(개발용 화면 목록) 예시 신호를 보여 준다.
export default function RecipientIncomingRoute() {
  const signal = useIncomingSignal() ?? mockIncomingSignal;
  const replying = useRef(false);

  useEffect(() => {
    startIncomingVibration(signal);
    return stopIncomingVibration;
    // 새 신호가 오면(messageId가 바뀌면) 다시 시작
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signal.messageId]);

  const handleReply = async () => {
    if (replying.current) return;
    replying.current = true;
    stopIncomingVibration();
    const ok = await replyToSignal();
    replying.current = false;
    // 서버 확인 후에만 '응답 완료'. 실패하면 이 화면 유지 (자동 재시도는 replyToSignal에서)
    if (ok) {
      clearIncoming();
      router.replace('/recipient/replied');
    }
  };

  return (
    <RecipientIncomingScreen
      senderName={signal.senderName}
      signalName={signal.signalName}
      onReply={handleReply}
      onNoReply={() => {
        // 반복 진동만 멈추고 조용히 대기로. 보호자에게는 '응답 없음' 전달 (TODO: 서버)
        stopIncomingVibration();
        clearIncoming();
        backToIdle();
      }}
    />
  );
}
