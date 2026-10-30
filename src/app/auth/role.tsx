import { router } from 'expo-router';

import RoleSelectScreen from '@/screens/auth/RoleSelectScreen';

export default function RoleRoute() {
  return (
    <RoleSelectScreen
      onSelect={(role) => router.push(role === 'guardian' ? '/link/guardian' : '/link/recipient')}
    />
  );
}
