import { router } from 'expo-router';

import SignupScreen from '@/screens/auth/SignupScreen';

export default function SignupRoute() {
  // TODO: 회원가입 API
  return (
    <SignupScreen
      onSubmit={() => router.replace('/auth/role')}
      onBack={() => router.back()}
      onLogin={() => router.back()}
    />
  );
}
