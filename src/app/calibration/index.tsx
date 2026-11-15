import { router } from 'expo-router';
import { useEffect } from 'react';

import {
  getCalibration,
  isSame,
  playPreview,
  resetDraft,
  settingsHref,
  stepDraft,
  useCalibration,
  type CalibrationKey,
} from '@/features/calibration';
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
      onStep={(key: CalibrationKey, delta: 1 | -1) => {
        stepDraft(key, delta);
        // 바꾼 값으로 짧은 미리보기 진동 1회
        playPreview(getCalibration().draft);
      }}
      onTest={() => router.push('/calibration/test')}
    />
  );
}
