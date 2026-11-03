import { router } from 'expo-router';

import { backInAddSignal, customSignalIcon, exitAddSignal, updateDraft, useAddSignal } from '@/features/addSignal';
import AddSignalCustomScreen from '@/screens/addSignal/AddSignalCustomScreen';

// 10-3 직접 만들기 → 2단계 리듬
export default function AddSignalCustomRoute() {
  const { draft } = useAddSignal();

  return (
    <AddSignalCustomScreen
      initialValues={{ name: draft.name, category: draft.category, description: draft.description }}
      onBack={backInAddSignal}
      onClose={exitAddSignal}
      onNext={(values) => {
        updateDraft({ ...values, source: 'custom', basicId: undefined, icon: customSignalIcon });
        router.push('/guardian/add-signal/rhythm');
      }}
    />
  );
}
