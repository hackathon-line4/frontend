import { router } from 'expo-router';

import {
  backInAddSignal,
  exitAddSignal,
  saveDraft,
  useAddSignal,
} from '@/features/addSignal';
import { playPulses, useStopVibrationOnBlur } from '@/features/vibration';
import AddSignalFeelScreen from '@/screens/addSignal/AddSignalFeelScreen';
import { useGuardianMutation, useGuardianState } from '@/features/guardian/hooks';

// 10-6 진동 체험 → '저장하기' → 10-7
export default function AddSignalFeelRoute() {
  const { draft } = useAddSignal();
  useStopVibrationOnBlur();
  const { data } = useGuardianState();
  const mutation = useGuardianMutation();

  return (
    <AddSignalFeelScreen
      signal={draft}
      // TODO: 연결된 당사자 정보 · 진동 보정값 API
      recipientName={data?.home?.recipient.name ?? '당사자'}
      recipientVibration="당사자 휴대폰에 저장된 값"
      busy={mutation.busy} error={mutation.error}
      onBack={backInAddSignal}
      onClose={exitAddSignal}
      // 목록에서 고른 기본 신호는 현장 어휘와 맞추기 위해 리듬을 바꾸지 않는다
      onChangeRhythm={draft.source === 'custom' ? backInAddSignal : undefined}
      // 보호자 휴대폰에서 진동 배열 그대로 재생. 화면 표시는 AddSignalFeelScreen이 같은 배열로 맞춘다
      onVibrate={playPulses}
      onSave={() => {
        void mutation.run(async abort => { await saveDraft(abort); if (!abort.aborted) router.replace('/guardian/add-signal/done'); });
      }}
    />
  );
}
