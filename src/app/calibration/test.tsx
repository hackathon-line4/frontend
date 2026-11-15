import { router } from 'expo-router';

import { useCalibration } from '@/features/calibration';
import CalibrationTestScreen from '@/screens/calibration/CalibrationTestScreen';

export default function CalibrationTestRoute() {
  const { draft } = useCalibration();

  return (
    <CalibrationTestScreen
      values={draft}
      // 테스트 화면은 느낌 확인으로 바꿔 끼운다 (뒤로 가기로 테스트가 다시 열리지 않게)
      onFinish={() => router.replace('/calibration/feel')}
      onStop={() => router.back()}
    />
  );
}
