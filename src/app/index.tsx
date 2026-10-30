import { router } from 'expo-router';
import { useEffect } from 'react';

import SplashScreen from '@/screens/SplashScreen';

const SPLASH_MS = 1500;

// 01 스플래시. 약 1.5초 뒤 자동 전환.
// TODO: 첫 실행 → 온보딩 / 재실행 → 저장된 유형의 홈 (저장소 연결 후)
export default function SplashRoute() {
  useEffect(() => {
    const timer = setTimeout(() => router.replace('/onboarding'), SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  return <SplashScreen />;
}
