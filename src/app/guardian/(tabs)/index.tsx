import { useSession } from '@/features/session';
import Preview from '@/features/guardian/preview/home';
import { router } from 'expo-router';
import { useFavoriteSignals } from '@/features/guardian/favorites';
import { useGuardianState } from '@/features/guardian/hooks';
import { guardianStore } from '@/features/guardian/client';
import { GuardianFeedback } from '@/features/guardian/Feedback';
import { homeActivities, homeRecipient, toSignal } from '@/features/guardian/models';
import { toRecipientLocation, useGuardianLocation, type LastLocation } from '@/features/location';
import GuardianHomeScreen from '@/screens/guardian/GuardianHomeScreen';

export default function GuardianHomeRoute() {
  const session = useSession();
  return __DEV__ && !session.tokens ? <Preview /> : <ConnectedRoute />;
}

function ConnectedRoute() {
  const { data, scope } = useGuardianState();
  // 자주 쓰는 신호는 별을 누르는 즉시 바뀌는 공용 상태를 본다 (신호 목록 · 상세와 같은 값)
  const favorites = useFavoriteSignals();
  // 홈 요약(GET /home)의 location은 서버에서 '꺼짐'으로 고정돼 있어, 위치 탭과 같은 위치 API를 읽는다
  const { view: locationView } = useGuardianLocation();
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
    recipient={homeRecipient(home)} frequentSignals={favorites.ids
      .map(id => data.signals?.find(s => s.id === id) ?? home.favoriteSignals.find(s => s.id === id))
      .filter((s): s is NonNullable<typeof s> => !!s)
      .map(toSignal)}
    emergencySignals={signals.filter(s => s.category === 'emergency')}
    location={toRecipientLocation(locationView ?? { sharingEnabled: home.location.sharingEnabled, last: home.location.last as LastLocation | null })}
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
