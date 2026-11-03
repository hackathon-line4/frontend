import { router } from 'expo-router';

import { mockRecipient } from '@/features/link/mock';
import GuardianLinkDoneScreen from '@/screens/link/GuardianLinkDoneScreen';

export default function GuardianLinkDoneRoute() {
  return (
    <GuardianLinkDoneScreen
      recipientName={mockRecipient.name}
      onSendFirstMessage={() => router.replace('/guardian')}
      onHome={() => router.replace('/guardian')}
    />
  );
}
