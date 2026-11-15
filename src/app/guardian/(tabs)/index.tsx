import { useSession } from '@/features/session';
import Preview from '@/features/guardian/preview/home';
import { router } from 'expo-router';
import { useGuardianState } from '@/features/guardian/hooks';
import { guardianStore } from '@/features/guardian/client';
import { GuardianFeedback } from '@/features/guardian/Feedback';
import { homeActivities, homeRecipient, toSignal } from '@/features/guardian/models';
import { toRecipientLocation, type LastLocation } from '@/features/location';
import GuardianHomeScreen from '@/screens/guardian/GuardianHomeScreen';

export default function GuardianHomeRoute() {
  const session = useSession();
  return __DEV__ && !session.tokens ? <Preview /> : <ConnectedRoute />;
}

function ConnectedRoute() {
  const { data, scope } = useGuardianState();
  if (!scope) return <GuardianFeedback message="연결된 당사자가 없어요" onLink={() => router.push('/link/guardian')} />;
  if (!data?.home) return <GuardianFeedback message={data?.errors.home || '당사자 상태를 불러오는 중이에요'} onRetry={() => { void guardianStore.refresh(); }} />;
  const home = data.home;
  const signals = (data.signals ?? home.favoriteSignals).map(toSignal);
  const openRecord = (id: string) => {
    const kind = home.recentActivities.find(item => item.id === id)?.kind;
    router.push({ pathname: '/guardian/record/[id]', params: { id, ...(kind ? { kind } : {}) } });
  };
  return <GuardianHomeScreen
    refreshError={data.errors.home}
    recipient={homeRecipient(home)} frequentSignals={(home.favoriteSignals.length
      ? home.favoriteSignals
      // 아직 고른 적이 없으면 기본 신호(촉신호)를 대신 보여 준다 ('협의할 것': 연결 직후 기본 6개로 채움)
      : (data.signals ?? []).filter(s => s.source === 'TEMPLATE').slice(0, 6)).map(toSignal)}
    emergencySignals={signals.filter(s => s.category === 'emergency')}
    location={toRecipientLocation({ sharingEnabled: home.location.sharingEnabled, last: home.location.last as LastLocation | null })}
    recentActivity={homeActivities(home)} onSendSignal={(signal, abort) => guardianStore.send(signal.id, abort)}
    onOpenNotifications={() => router.navigate('/guardian/history')}
    onOpenSignals={() => router.navigate('/guardian/signals')}
    onAddSignal={() => router.push('/guardian/add-signal')}
    onOpenLocation={() => router.navigate('/guardian/location')}
    onOpenHistory={() => router.navigate('/guardian/history')}
    onOpenRecord={openRecord}
    onOpenNoReply={id => {
      const next = id ?? home.recipient.status.messageId;
      if (!next) return;
      if (home.recipient.status.type === 'HELP_REQUESTED' && !id) router.push({ pathname: '/guardian/record/[id]', params: { id: next, kind: 'HELP_REQUEST' } });
      else router.push({ pathname: '/guardian/no-reply', params: { id: next } });
    }} />;
}
