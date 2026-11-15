import { router } from 'expo-router';

import {
  backInAddSignal,
  exitAddSignal,
  knownSignals,
  pickBasicSignal,
  useAddSignal,
} from '@/features/addSignal';
import AddSignalListScreen from '@/screens/addSignal/AddSignalListScreen';
import { useCatalog } from '@/features/addSignal/useCatalog';
import { GuardianFeedback } from '@/features/guardian/Feedback';

// 10-2 촉신호 목록. 기본 신호는 리듬이 정해져 있어 2단계를 건너뛰고 3단계(체험)로 간다.
export default function AddSignalListRoute() {
  const { draft, saved } = useAddSignal();
  const catalog = useCatalog();
  if (!catalog.preview && !catalog.data) return <GuardianFeedback message={catalog.error || '신호 목록을 불러오는 중이에요'} onRetry={catalog.retry} />;

  return (
    <AddSignalListScreen
      entries={catalog.entries}
      addedIds={catalog.preview ? knownSignals(saved).map((s) => s.id) : catalog.addedIds}
      initialSelectedId={draft.source === 'basic' ? draft.basicId : undefined}
      onBack={backInAddSignal}
      onClose={exitAddSignal}
      onContinue={(entry) => {
        pickBasicSignal(entry);
        router.push('/guardian/add-signal/feel');
      }}
    />
  );
}
