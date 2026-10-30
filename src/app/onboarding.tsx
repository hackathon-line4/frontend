import { router } from 'expo-router';

import OnboardingScreen from '@/screens/OnboardingScreen';

export default function OnboardingRoute() {
  return <OnboardingScreen onFinish={() => router.replace('/auth/login')} />;
}
