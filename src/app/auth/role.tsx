import { router } from 'expo-router';

import { setRole } from '@/features/session';
import RoleSelectScreen from '@/screens/auth/RoleSelectScreen';

export default function RoleRoute() {
  // TODO: 역할 저장 API
  return (
    <RoleSelectScreen
      onSelect={(role) => {
        setRole(role);
        router.push(role === 'guardian' ? '/link/guardian' : '/link/recipient');
      }}
    />
  );
}
