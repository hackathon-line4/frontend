import { router } from 'expo-router';

import GuardianLinkStartScreen from '@/screens/link/GuardianLinkStartScreen';

export default function GuardianLinkStartRoute() {
  return <GuardianLinkStartScreen onBack={() => router.back()} onCreateCode={() => router.push('/link/guardian/code')} />;
}
