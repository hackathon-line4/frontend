import { router } from 'expo-router';

import { restartTest, stepDraft, useCalibration } from '@/features/calibration';
import CalibrationHelpScreen from '@/screens/calibration/CalibrationHelpScreen';

export default function CalibrationHelpRoute() {
  const { draft } = useCalibration();

  return (
    <CalibrationHelpScreen
      values={draft}
      onBack={() => router.back()}
      onChoose={(key) => {
        stepDraft(key, 1);
        restartTest();
      }}
      onBackToSettings={() => router.dismissTo('/calibration')}
    />
  );
}
