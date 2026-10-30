import { router } from 'expo-router';

import { mockGuardian } from '@/features/link/mock';
import RecipientLinkDoneScreen from '@/screens/link/RecipientLinkDoneScreen';

export default function RecipientLinkDoneRoute() {
  // TODO: 당사자 대기 화면(07-1) 구현 후 경로 교체
  return <RecipientLinkDoneScreen guardianName={mockGuardian.name} onDone={() => router.replace('/dev')} />;
}
