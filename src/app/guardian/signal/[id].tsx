import { useSession } from '@/features/session';
import Preview from '@/features/guardian/preview/signal';
import { router, useLocalSearchParams } from 'expo-router';
import { guardianStore } from '@/features/guardian/client';
import { useGuardianState } from '@/features/guardian/hooks';
import { GuardianFeedback } from '@/features/guardian/Feedback';
import { toSignal } from '@/features/guardian/models';
import SignalDetailScreen from '@/screens/guardian/SignalDetailScreen';

export default function SignalDetailRoute() {
  const session = useSession();
  return __DEV__ && !session.tokens ? <Preview /> : <ConnectedRoute />;
}

function ConnectedRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, scope } = useGuardianState();
  if (!scope || !data?.signals) return <GuardianFeedback message={!scope ? '당사자를 먼저 연결해 주세요' : data?.errors.signals || '신호를 불러오는 중이에요'} onRetry={() => { void guardianStore.refresh(); }} />;
  const signal = data.signals.find(s => s.id === id);
  return <SignalDetailScreen signal={signal ? toSignal(signal) : undefined}
    recipientName={data.home?.recipient.name ?? '당사자'} onBack={() => router.back()}
    onSend={(s, abort) => guardianStore.send(s.id, abort)} />;
}
