import { router, useLocalSearchParams } from 'expo-router';

import { signalApi } from '@/features/addSignal/client';
import { guardianStore } from '@/features/guardian/client';
import { GuardianFeedback } from '@/features/guardian/Feedback';
import { useGuardianMutation, useGuardianState } from '@/features/guardian/hooks';
import { toSignal } from '@/features/guardian/models';
import AddSignalCustomScreen from '@/screens/addSignal/AddSignalCustomScreen';

const categoryToServer = { daily: 'DAILY', outing: 'OUTING', check: 'CHECK', emergency: 'EMERGENCY' } as const;

// 신호 수정: 이름 · 설명 · 카테고리. 기본 신호는 이름을 잠근다 (서버도 SIGNAL_NOT_EDITABLE로 막음).
// 리듬 수정은 이번 범위에서 제외 (바꾸면 '연습 전'으로 돌아가는 흐름까지 필요).
export default function SignalEditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, scope } = useGuardianState();
  const mutation = useGuardianMutation();
  const server = data?.signals?.find((s) => s.id === id);
  if (!scope || !server) return <GuardianFeedback message="신호를 불러오는 중이에요" onRetry={() => { void guardianStore.loadSignals(true); }} />;
  const signal = toSignal(server);
  const basic = signal.source === 'basic';

  return (
    <AddSignalCustomScreen
      initialValues={{ name: signal.name, category: signal.category, description: signal.description ?? '' }}
      edit={{ nameLocked: basic, busy: mutation.busy, error: mutation.error }}
      onBack={() => router.back()}
      onClose={() => router.back()}
      onNext={(values) => {
        void mutation.run(async (abort) => {
          await signalApi.update(scope.linkId, signal.id, {
            ...(basic ? {} : { name: values.name }),
            description: values.description,
            category: categoryToServer[values.category],
          }, abort);
          await guardianStore.loadSignals(true);
          router.back();
        });
      }}
    />
  );
}
