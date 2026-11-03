import { router } from 'expo-router';

import { restartTest, saveDraft, settingsHref, useCalibration } from '@/features/calibration';
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
        router.dismissTo(settingsHref(role));
      }}
      onRetest={restartTest}
    />
  );
}
