import { Redirect } from 'expo-router';

import { mockIncomingSignal, useIncomingDelivery, useIncomingSignal } from '@/features/recipient';
import { useSession } from '@/features/session';
import RecipientIncomingScreen from '@/screens/recipient/RecipientIncomingScreen';

export default function RecipientIncomingRoute() {
  const session = useSession();
  const incoming = useIncomingSignal();
  const preview = __DEV__ && !session.tokens;
  const signal = incoming ?? (preview ? mockIncomingSignal : null);
  const { replying, reply } = useIncomingDelivery(signal, preview);
  if (!signal) return <Redirect href="/recipient" />;

  return (
    <RecipientIncomingScreen
      senderName={signal.senderName}
      signalName={signal.signalName}
      replying={replying}
      onReply={reply}
    />
  );
}
