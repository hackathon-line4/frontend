import { router } from 'expo-router';

import { persistCalibration, restartTest, settingsHref, useCalibration } from '@/features/calibration';
import { useGuardianMutation } from '@/features/guardian/hooks';
import { useRole } from '@/features/session';
import CalibrationSaveScreen from '@/screens/calibration/CalibrationSaveScreen';

export default function CalibrationSaveRoute() {
  const role = useRole();
  const { draft } = useCalibration();
  const mutation = useGuardianMutation();

  return (
    <CalibrationSaveScreen
      values={draft}
      busy={mutation.busy}
      error={mutation.error}
      onSave={() => {
        void mutation.run(async signal => {
          await persistCalibration(draft, signal);
          if (!signal.aborted) router.dismissTo(settingsHref(role));
        });
      }}
      onRetest={restartTest}
    />
  );
}
