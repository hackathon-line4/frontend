import { RecipientScreen } from '@/components';

type Props = {
  senderName: string;
  signalName: string;
  replying?: boolean;
  onReply: () => void;
};

// 07-4 신호 수신 (design/screens/RecvSignal.dc.html). 화면 어디를 눌러도 반복 중단 + 응답 전송
export default function RecipientIncomingScreen({ senderName, signalName, replying = false, onReply }: Props) {
  return (
    <RecipientScreen
      state="incoming"
      busy={replying}
      signalName={signalName}
      accessibilityLabel={replying ? '응답을 보내고 있어요. 연결이 회복되면 자동으로 다시 보내요' : `${senderName}, ${signalName}. 화면 어디든 누르면 응답해요`}
      onPress={onReply}
    />
  );
}
