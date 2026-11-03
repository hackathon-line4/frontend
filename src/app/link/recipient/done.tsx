import { router } from 'expo-router';

import { mockGuardian } from '@/features/link/mock';
import RecipientLinkDoneScreen from '@/screens/link/RecipientLinkDoneScreen';

export default function RecipientLinkDoneRoute() {
  return <RecipientLinkDoneScreen guardianName={mockGuardian.name} onDone={() => router.replace('/recipient')} />;
}
