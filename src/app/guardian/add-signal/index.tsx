import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

import { backInAddSignal, exitAddSignal, startAddSignal, startCustomDraft } from '@/features/addSignal';
import AddSignalChooseScreen from '@/screens/addSignal/AddSignalChooseScreen';

// 10-1 종류 선택. 진입: 홈 '+ 신호 추가하기' · 신호 탭 '+ 신호 추가' (?from=signals)
export default function AddSignalChooseRoute() {
  const { from } = useLocalSearchParams<{ from?: string }>();

  useEffect(() => {
    startAddSignal(from === 'signals' ? 'signals' : 'home');
  }, [from]);

  return (
    <AddSignalChooseScreen
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
