import { router } from 'expo-router';

import { draftAsSignal, exitAddSignal, useAddSignal } from '@/features/addSignal';
import { mockRecipient } from '@/features/link/mock';
import AddSignalDoneScreen from '@/screens/addSignal/AddSignalDoneScreen';

// 10-7 저장 완료. 저장한 신호는 '연습 전'
export default function AddSignalDoneRoute() {
  const { draft, saved, lastSavedId } = useAddSignal();
  const signal = saved.find((s) => s.id === lastSavedId) ?? draftAsSignal(draft);

  return (
    <AddSignalDoneScreen
      signal={signal}
      recipientName={mockRecipient.name}
      onTeachNow={() => {
        // 신호 추가 화면들을 닫고 신호 상세(05-4 알려주기)로
        // TODO: 연습 모드(이 신호부터)가 생기면 그 화면으로
        exitAddSignal();
        router.push({ pathname: '/guardian/signal/[id]', params: { id: signal.id } });
      }}
      onLater={exitAddSignal}
    />
  );
}
