import { router } from 'expo-router';
import { useEffect } from 'react';

import { getSession, homeHref } from '@/features/session';
import SplashScreen from '@/screens/SplashScreen';

const SPLASH_MS = 1500;

// 01 스플래시. 약 1.5초 뒤 자동 전환.
// 역할이 있으면(재실행) 그 역할의 홈, 없으면(첫 실행) 온보딩.
// TODO: 저장된 세션 복원 + 서버에서 역할 받아오기
export default function SplashRoute() {
  useEffect(() => {
    const timer = setTimeout(() => {
      const { role } = getSession();
      router.replace(role ? homeHref(role) : '/onboarding');
    }, SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  return <SplashScreen />;
}
