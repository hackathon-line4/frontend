import { router } from 'expo-router';

import { mockLinkCode, mockRecipient } from '@/features/link/mock';
import GuardianLinkRequestScreen from '@/screens/link/GuardianLinkRequestScreen';

// TODO: 연결 요청 데이터 + 승인/거절 API
export default function GuardianLinkRequestRoute() {
  return (
    <GuardianLinkRequestScreen
      recipientName={mockRecipient.name}
      code={mockLinkCode}
      method="code"
      requestedAt="방금 전"
      onBack={() => router.back()}
      onAccept={() => router.replace('/link/guardian/done')}
      onReject={() => router.back()}
    />
  );
}
