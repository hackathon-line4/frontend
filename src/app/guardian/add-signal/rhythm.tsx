import { router } from 'expo-router';

import {
  backInAddSignal,
  exitAddSignal,
  knownSignals,
  rhythmPresets,
  setDraftBeats,
  useAddSignal,
} from '@/features/addSignal';
import { playPulses } from '@/features/vibration';
import { beatsToPulses } from '@/theme';
import AddSignalRhythmScreen from '@/screens/addSignal/AddSignalRhythmScreen';

// 10-4 프리셋 · 10-5 직접 조합하기 (탭으로 전환) → 3단계 체험
export default function AddSignalRhythmRoute() {
  const { draft, saved } = useAddSignal();

  return (
    <AddSignalRhythmScreen
      name={draft.name}
      presets={rhythmPresets}
      signals={knownSignals(saved)}
      initialBeats={draft.beats}
      onBack={backInAddSignal}
      onClose={exitAddSignal}
      // 보호자 휴대폰에서 박자 하나 · 리듬 전체를 beatMs 시간표대로
      onPlay={(beats) => playPulses(beatsToPulses(beats))}
      onNext={(beats) => {
        setDraftBeats(beats);
        router.push('/guardian/add-signal/feel');
      }}
    />
  );
}
