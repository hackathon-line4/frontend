import { useSession } from '@/features/session';
import Preview from '@/features/guardian/preview/signal';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { randomUUID } from 'expo-crypto';
import { signalApi } from '@/features/addSignal/client';
import { ConfirmDialog } from '@/features/guardian/ConfirmDialog';
import { useFavoriteSignals } from '@/features/guardian/favorites';
import { guardianApi, guardianStore } from '@/features/guardian/client';
import { useGuardianMutation, useGuardianState } from '@/features/guardian/hooks';
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
  return <ConnectedDetail id={id} />;
}

function ConnectedDetail({ id }: { id: string }) {
  const { data, scope } = useGuardianState();
  const mutation = useGuardianMutation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const server = data?.signals?.find(s => s.id === id);
  const signal = server ? toSignal(server) : undefined;
  const favorites = useFavoriteSignals();
  return <>
    <SignalDetailScreen signal={signal}
      recipientName={data?.home?.recipient.name ?? '당사자'} onBack={() => router.back()}
      onSend={(s, abort) => guardianStore.send(s.id, abort)}
      onTeach={s => {
        if (!scope) return;
        // 알려주기: 당사자 휴대폰에 연습 진동. 당사자가 받으면(ack) 서버가 '연습 전'을 해제한다
        void mutation.run(async abort => {
          await guardianApi.practice(scope.linkId, s.id, randomUUID(), abort);
          // '연습 전'은 당사자 폰이 받은 뒤(ack)에 풀린다. 실시간 이벤트로도 갱신되지만, 놓칠 때를 대비해 잠시 뒤 다시 읽는다
          for (const ms of [3000, 8000]) setTimeout(() => { void guardianStore.loadSignals(true); }, ms);
        });
      }}
      onEdit={s => router.push({ pathname: '/guardian/signal/edit/[id]', params: { id: s.id } })}
      onDelete={() => setConfirmDelete(true)}
      notice={favorites.notice ?? (mutation.error && !confirmDelete ? mutation.error : undefined)}
      favorite={favorites.ready ? { on: favorites.isFavorite(id), onToggle: () => favorites.toggle(id) } : undefined} />
    <ConfirmDialog
      visible={confirmDelete && !!signal}
      icon="warning"
      destructive
      title={`'${signal?.name ?? ''}' 신호를 지울까요?`}
      message={signal?.source === 'basic'
        ? '기본 신호는 지운 뒤에도 신호 추가에서 다시 추가할 수 있어요.'
        : '직접 만든 신호는 지우면 되돌릴 수 없어요. 지난 기록은 그대로 남아요.'}
      confirmLabel="삭제하기"
      busy={mutation.busy}
      error={mutation.error}
      onCancel={() => setConfirmDelete(false)}
      onConfirm={() => {
        if (!scope || !signal) return;
        void mutation.run(async abort => {
          await signalApi.remove(scope.linkId, signal.id, abort);
          await guardianStore.loadSignals(true);
          void guardianStore.loadHome(true);
          setConfirmDelete(false);
          router.back();
        });
      }} />
  </>;
}
