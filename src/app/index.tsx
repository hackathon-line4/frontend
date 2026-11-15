import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { Button, Screen, Text } from '@/components';
import { restoreSession, sessionHref, useSession } from '@/features/session';
import SplashScreen from '@/screens/SplashScreen';

export default function SplashRoute() {
  const session = useSession();
  const [elapsed, setElapsed] = useState(false);
  useEffect(() => {
    void restoreSession();
    const timer = setTimeout(() => setElapsed(true), 1500);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (elapsed && session.status !== 'loading' && session.status !== 'error') router.replace(sessionHref(session));
  }, [elapsed, session]);
  if (session.status === 'error') {
    return <Screen gap={5} reserveHeader="lg">
      <Text accessibilityRole="alert">{session.error}</Text>
      <Button label="다시 시도" onPress={() => { void restoreSession(); }} />
    </Screen>;
  }
  return <SplashScreen />;
}
