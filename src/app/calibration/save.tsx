import { router } from 'expo-router';

import { getCalibration, persistCalibration, restartTest, saveDraft, settingsHref, useCalibration } from '@/features/calibration';
import { useRole } from '@/features/session';
import CalibrationSaveScreen from '@/screens/calibration/CalibrationSaveScreen';

export default function CalibrationSaveRoute() {
  const role = useRole();
  const { draft } = useCalibration();

  return (
    <CalibrationSaveScreen
      values={draft}
      onSave={() => {
        saveDraft();
        // 기기에 저장 + 로그인 상태면 서버에도 (실패해도 기기 값 유지)
        void persistCalibration(getCalibration().saved);
        router.dismissTo(settingsHref(role));
      }}
      onRetest={restartTest}
    />
  );
}
