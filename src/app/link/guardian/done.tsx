import { router } from 'expo-router';

import { mockRecipient } from '@/features/link/mock';
import GuardianLinkDoneScreen from '@/screens/link/GuardianLinkDoneScreen';

export default function GuardianLinkDoneRoute() {
  // TODO: 보호자 홈(05-1) · 메시지 보내기 화면 구현 후 경로 교체
  return (
    <GuardianLinkDoneScreen
      recipientName={mockRecipient.name}
      onSendFirstMessage={() => router.replace('/dev')}
      onHome={() => router.replace('/dev')}
    />
  );
}
