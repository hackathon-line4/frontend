import { router } from 'expo-router';

import { mockSignals } from '@/features/signals';
import SignalTabScreen from '@/screens/guardian/SignalTabScreen';

// TODO: 신호 사전(Signal registry)을 서버에서 받아 온다.
export default function SignalTabRoute() {
  return (
    <SignalTabScreen
      signals={mockSignals}
      onOpenSignal={(id) => router.push(`/guardian/signal/${id}`)}
      onAddSignal={() => router.push('/guardian/add-signal?from=signals')}
    />
  );
}
