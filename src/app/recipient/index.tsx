import { router } from 'expo-router';

import { connectedGuardian, playConnectionCheck, playHelpCountdown, useRecipientSend } from '@/features/recipient';
import { useSession } from '@/features/session';
import { Button, Screen, Text } from '@/components';
import RecipientIdleScreen from '@/screens/recipient/RecipientIdleScreen';

export default function RecipientIdleRoute() {
  const session = useSession();
  const link = session.links.find((item) => item.status === 'ACTIVE');
  const { busy, sendHelp } = useRecipientSend();
  if (session.tokens && !link) return <Screen gap={6} reserveHeader="lg">
    <Text>보호자와 계정을 연결해 주세요.</Text>
    <Button label="연결 코드 입력" size="lg" onPress={() => router.push('/link/recipient')} />
    <Button label="설정" size="lg" variant="secondary" onPress={() => router.push('/recipient/settings')} />
  </Screen>;
  return (
    <RecipientIdleScreen
      guardianName={link?.guardian.name ?? connectedGuardian.name}
      onTap={playConnectionCheck}
      onSend={() => router.push('/recipient/send')}
      busy={busy}
      onHelp={sendHelp}
      onHelpTick={playHelpCountdown}
      onSettings={() => router.push('/recipient/settings')}
    />
  );
}
