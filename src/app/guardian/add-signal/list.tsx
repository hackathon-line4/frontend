import { router } from 'expo-router';

import {
  backInAddSignal,
  basicSignalCatalog,
  exitAddSignal,
  knownSignals,
  pickBasicSignal,
  useAddSignal,
} from '@/features/addSignal';
import AddSignalListScreen from '@/screens/addSignal/AddSignalListScreen';

// 10-2 촉신호 목록. 기본 신호는 리듬이 정해져 있어 2단계를 건너뛰고 3단계(체험)로 간다.
export default function AddSignalListRoute() {
  const { draft, saved } = useAddSignal();

  return (
    <AddSignalListScreen
      entries={basicSignalCatalog}
      addedIds={knownSignals(saved).map((s) => s.id)}
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
