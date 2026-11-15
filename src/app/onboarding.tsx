import { router } from 'expo-router';
import { useState } from 'react';

import OnboardingScreen from '@/screens/OnboardingScreen';
import { errorMessage } from '@/api';
import { Button, Screen, Text } from '@/components';
import { completeOnboarding } from '@/features/session';
import { tactilePulses } from '@/features/signals';
import { playPulses } from '@/features/vibration';


export default function OnboardingRoute() {
  const [error, setError] = useState<string>();
  const finish = async () => {
    try { await completeOnboarding(); router.replace('/auth/login'); }
    catch (failure) { setError(errorMessage(failure)); }
  };
  if (error) return <Screen gap={4}><Text accessibilityRole="alert">{error}</Text><Button label="다시 시도" onPress={() => { void finish(); }} /></Screen>;
  return <OnboardingScreen onFinish={() => { void finish(); }} onTryVibration={() => playPulses(tactilePulses.here)} />;
}
