import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

import { backInAddSignal, exitAddSignal, startAddSignal, startCustomDraft } from '@/features/addSignal';
import { useCatalog } from '@/features/addSignal/useCatalog';
import AddSignalChooseScreen from '@/screens/addSignal/AddSignalChooseScreen';

// 10-1 종류 선택. 진입: 홈 '+ 신호 추가하기' · 신호 탭 '+ 신호 추가' (?from=signals)
// 기본 신호(촉신호)는 연결할 때 모두 추가되므로, 보호자가 지운 기본 신호가 없으면 이 화면을 건너뛰고 바로 직접 만들기로 간다.
export default function AddSignalChooseRoute() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const catalog = useCatalog();
  const restoreCount = catalog.preview ? 0 : catalog.entries.filter((e) => !catalog.addedIds.includes(e.id)).length;
  const ready = catalog.preview || !!catalog.data || !!catalog.error;
  const skip = ready && !catalog.preview && restoreCount === 0;

  useEffect(() => {
    startAddSignal(from === 'signals' ? 'signals' : 'home');
  }, [from]);

  useEffect(() => {
    if (!skip) return;
    startCustomDraft();
    router.replace('/guardian/add-signal/custom');
  }, [skip]);

  // 목록을 확인하는 동안 · 건너뛸 때는 아무것도 그리지 않는다 (잠깐)
  if (!ready || skip) return null;

  return (
    <AddSignalChooseScreen
      restoreCount={catalog.preview ? undefined : restoreCount}
      onBack={backInAddSignal}
      onClose={exitAddSignal}
      onNext={(method) => {
        if (method === 'list') {
          router.push('/guardian/add-signal/list');
        } else {
          startCustomDraft();
          router.push('/guardian/add-signal/custom');
        }
      }}
    />
  );
}
