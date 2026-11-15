import { router } from 'expo-router';

import { canIncrease, stepDraft, summarize, useCalibration } from '@/features/calibration';
import CalibrationFeelScreen from '@/screens/calibration/CalibrationFeelScreen';

export default function CalibrationFeelRoute() {
  const { draft } = useCalibration();

  return (
    <CalibrationFeelScreen
      summary={summarize(draft)}
      onGood={() => router.push('/calibration/save')}
      onStronger={() => {
        // 세기 1단계 올리고 바로 다시 테스트. 이미 최대(또는 세기 조절 미지원)면 06-4
        if (canIncrease(draft, 'strength')) {
          stepDraft('strength', 1);
          router.replace('/calibration/test');
        } else {
          router.push('/calibration/help');
        }
      }}
      onRetest={() => router.replace('/calibration/test')}
    />
  );
}
