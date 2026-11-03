import { router } from 'expo-router';

import { getSession, homeHref } from '@/features/session';
import LoginScreen from '@/screens/auth/LoginScreen';

export default function LoginRoute() {
  // TODO: 로그인 API 응답의 역할로 setRole. 역할이 없으면 역할 선택, 있으면 해당 역할의 홈
  return (
    <LoginScreen
      onLogin={() => router.replace(homeHref(getSession().role))}
      onSignup={() => router.push('/auth/signup')}
    />
  );
}
