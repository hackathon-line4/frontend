import { RecipientScreen } from '@/components';
import { NO_REPLY_TIMEOUT_MS, useTimeout } from '@/features/recipient';

type Props = {
  senderName: string;
  signalName: string;
  onReply: () => void;
  /** 설정된 시간 동안 응답이 없으면 조용히 대기로 */
  onNoReply: () => void;
};

// 07-4 신호 수신 (design/screens/RecvSignal.dc.html). 화면 어디를 눌러도 반복 중단 + 응답 전송
export default function RecipientIncomingScreen({ senderName, signalName, onReply, onNoReply }: Props) {
  useTimeout(onNoReply, NO_REPLY_TIMEOUT_MS);

  return (
    <RecipientScreen
      state="incoming"
      signalName={signalName}
      accessibilityLabel={`${senderName}, ${signalName}. 화면 어디든 누르면 응답해요`}
      onPress={onReply}
    />
  );
}
