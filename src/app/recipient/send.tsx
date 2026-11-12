import {
  backToIdle,
  connectedGuardian,
  outgoingSignalName,
  playHelpCountdown,
  useRecipientSend,
} from '@/features/recipient';
import { useSession } from '@/features/session';
import RecipientSendScreen from '@/screens/recipient/RecipientSendScreen';

export default function RecipientSendRoute() {
  const session = useSession();
  const link = session.links.find((item) => item.status === 'ACTIVE');
  const { busy, sendCall, sendHelp } = useRecipientSend();

  return (
    <RecipientSendScreen
      guardianName={session.tokens ? link?.guardian.name ?? '연결된 보호자 없음' : connectedGuardian.name}
      signalName={outgoingSignalName}
      busy={busy}
      onSend={sendCall}
      onHelp={sendHelp}
      onHelpTick={playHelpCountdown}
      onTimeout={backToIdle}
    />
  );
}
