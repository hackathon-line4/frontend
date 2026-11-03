import { router } from 'expo-router';
import { useEffect } from 'react';

import { isSame, resetDraft, settingsHref, stepDraft, useCalibration } from '@/features/calibration';
import { useRole } from '@/features/session';
import CalibrationSettingsScreen from '@/screens/calibration/CalibrationSettingsScreen';

export default function CalibrationSettingsRoute() {
  const role = useRole();
  const { saved, draft } = useCalibration();

  // 새로 들어올 때는 저장값에서 시작. 저장하지 않고 나가면 이전 저장값 유지
  useEffect(() => {
    resetDraft();
  }, []);

  return (
    <CalibrationSettingsScreen
      values={draft}
      isDraft={!isSame(draft, saved)}
      onBack={() => (router.canGoBack() ? router.back() : router.replace(settingsHref(role)))}
      onStep={stepDraft}
      onTest={() => router.push('/calibration/test')}
    />
  );
}
