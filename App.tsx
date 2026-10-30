import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import DesignSystemScreen from '@/screens/DesignSystemScreen';
import { useAppFonts } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function App() {
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
      <DesignSystemScreen />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
