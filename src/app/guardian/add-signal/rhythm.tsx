import { router } from 'expo-router';

import {
  backInAddSignal,
  exitAddSignal,
  knownSignals,
  setDraftBeats,
  useAddSignal,
} from '@/features/addSignal';
import { playPulses, useStopVibrationOnBlur } from '@/features/vibration';
import { beatsToPulses } from '@/theme';
import AddSignalRhythmScreen from '@/screens/addSignal/AddSignalRhythmScreen';
import { ApiError } from '@/api/errors';
import { useCatalog } from '@/features/addSignal/useCatalog';
import { signalApi } from '@/features/addSignal/client';
import { updateDraft } from '@/features/addSignal/store';
import { useGuardianMutation } from '@/features/guardian/hooks';
import { GuardianFeedback } from '@/features/guardian/Feedback';
import { getGuardianScope } from '@/features/guardian/client';

// 10-4 프리셋 · 10-5 직접 조합하기 (탭으로 전환) → 3단계 체험
export default function AddSignalRhythmRoute() {
  const { draft, saved } = useAddSignal();
  useStopVibrationOnBlur();
  const catalog = useCatalog();
  const mutation = useGuardianMutation();
  if (!catalog.preview && !catalog.data) return <GuardianFeedback message={catalog.error || '리듬을 불러오는 중이에요'} onRetry={catalog.retry} />;

  return (
    <AddSignalRhythmScreen
      name={draft.name}
      presets={catalog.presets}
      signals={catalog.preview ? knownSignals(saved) : catalog.signals}
      busy={mutation.busy} error={mutation.error}
      presetConflicts={Object.fromEntries((catalog.data?.presets ?? []).filter(p => p.usedBy).map(p => [p.rhythm.map(b => ({ SHORT: 'S', MEDIUM: 'M', LONG: 'L' } as const)[b]).join(''), p.usedBy!.name]))}
      initialBeats={draft.beats}
      onBack={backInAddSignal}
      onClose={exitAddSignal}
      // 보호자 휴대폰에서 박자 하나 · 리듬 전체를 beatMs 시간표대로
      onPlay={(beats) => playPulses(beatsToPulses(beats))}
      onNext={(beats) => {
        void mutation.run(async abort => {
          const rhythm = beats.map(b => ({ S: 'SHORT', M: 'MEDIUM', L: 'LONG' } as const)[b]);
          if (catalog.scope) {
            const result = await signalApi.rhythmCheck(catalog.scope.linkId, rhythm, abort);
            if (getGuardianScope()?.key !== catalog.scope.key) throw new ApiError('SESSION_CHANGED');
            if (!result.valid) throw new ApiError('RHYTHM_DUPLICATE', { message: result.conflictSignal ? `'${result.conflictSignal.name}'와 같은 리듬이에요. 다른 리듬을 골라 주세요.` : undefined });
          }
          if (abort.aborted) return;
          setDraftBeats(beats);
          updateDraft({ presetId: catalog.data?.presets.find(p => p.rhythm.join() === rhythm.join())?.id });
          router.push('/guardian/add-signal/feel');
        });
      }}
    />
  );
}
