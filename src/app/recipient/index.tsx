import { router } from 'expo-router';

import { connectedGuardian, playConnectionCheck, playHelpCountdown, requestHelp } from '@/features/recipient';
import RecipientIdleScreen from '@/screens/recipient/RecipientIdleScreen';

export default function RecipientIdleRoute() {
  return (
    <RecipientIdleScreen
      guardianName={connectedGuardian.name}
      onTap={playConnectionCheck}
      onSend={() => router.push('/recipient/send')}
      onHelp={requestHelp}
      onHelpTick={playHelpCountdown}
      onSettings={() => router.push('/recipient/settings')}
    />
  );
}
