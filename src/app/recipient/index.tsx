import { router } from 'expo-router';

import { connectedGuardian, playConnectionCheck, requestHelp } from '@/features/recipient';
import RecipientIdleScreen from '@/screens/recipient/RecipientIdleScreen';

export default function RecipientIdleRoute() {
  return (
    <RecipientIdleScreen
      guardianName={connectedGuardian.name}
      onTap={playConnectionCheck}
      onSend={() => router.push('/recipient/send')}
      onHelp={requestHelp}
      onSettings={() => router.push('/recipient/settings')}
    />
  );
}
