import { router } from 'expo-router';
import { Linking } from 'react-native';

import { mockGuardian } from '@/features/link/mock';
import { checkConnection, updateRecipientSettings, useSettings } from '@/features/settings';
import RecipientSettingsScreen from '@/screens/recipient/RecipientSettingsScreen';

export default function RecipientSettingsRoute() {
  const { connection, checking, recipient, locationPermission, notificationPermission } = useSettings();
  return (
    <RecipientSettingsScreen
      // TODO: 연결된 보호자 정보 (서버)
      guardianName={mockGuardian.name}
      connection={connection}
      checking={checking}
      settings={recipient}
      locationPermission={locationPermission}
      notificationPermission={notificationPermission}
      onClose={() => (router.canGoBack() ? router.back() : router.replace('/recipient'))}
      onCheckConnection={checkConnection}
      onCalibration={() => router.push('/calibration')}
      onCalibrationTest={() => router.push('/calibration/test')}
      onChangeSettings={updateRecipientSettings}
      onOpenPhoneSettings={() => Linking.openSettings()}
    />
  );
}
