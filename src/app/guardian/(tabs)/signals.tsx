import { useSession } from '@/features/session';
import Preview from '@/features/guardian/preview/signals';
import { router } from 'expo-router';
import { useGuardianState } from '@/features/guardian/hooks';
import { guardianStore } from '@/features/guardian/client';
import { GuardianFeedback } from '@/features/guardian/Feedback';
import { useFavoriteSignals } from '@/features/guardian/favorites';
import { toSignal } from '@/features/guardian/models';
import SignalTabScreen from '@/screens/guardian/SignalTabScreen';

export default function SignalTabRoute() {
  const session = useSession();
  return __DEV__ && !session.tokens ? <Preview /> : <ConnectedRoute />;
}

function ConnectedRoute() {
  const { data, scope } = useGuardianState();
  const favorites = useFavoriteSignals();
  if (!scope || !data?.signals) return <GuardianFeedback message={!scope ? '당사자를 먼저 연결해 주세요' : data?.errors.signals || '신호를 불러오는 중이에요'} onRetry={() => { void guardianStore.refresh(); }} />;
  return <SignalTabScreen signals={data.signals.map(toSignal)} onOpenSignal={id => router.push(`/guardian/signal/${id}`)} onAddSignal={() => router.push('/guardian/add-signal?from=signals')}
    favorites={favorites.ready ? { isFavorite: favorites.isFavorite, onToggle: favorites.toggle, busy: favorites.busy, notice: favorites.notice } : undefined} />;
}
