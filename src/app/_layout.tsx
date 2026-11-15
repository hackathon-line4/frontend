import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CalibrationSync } from '@/features/calibration/CalibrationSync';
import DevShortcut from '@/features/dev/DevShortcut';
import { SessionBoundary } from '@/features/session/SessionBoundary';
import { PushRegistration } from '@/features/push';
import { RealtimeSync } from '@/realtime/RealtimeSync';
import { colors, useAppFonts } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useAppFonts();

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bgIvory },
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
      </Stack>
      <DevShortcut />
      <SessionBoundary />
      <RealtimeSync />
      <PushRegistration />
      <CalibrationSync />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
