import { router } from 'expo-router';
import { Linking } from 'react-native';

import { mockGuardian } from '@/features/link/mock';
import { useSession } from '@/features/session';
import { checkConnection, updateRecipientSettings, useSettings } from '@/features/settings';
import RecipientSettingsScreen from '@/screens/recipient/RecipientSettingsScreen';

export default function RecipientSettingsRoute() {
  const session = useSession();
  const link = session.links.find((item) => item.status === 'ACTIVE');
  const { connection, checking, recipient, locationPermission, notificationPermission } = useSettings();
  return (
    <RecipientSettingsScreen
      // TODO: 연결된 보호자 정보 (서버)
      guardianName={session.tokens ? link?.guardian.name ?? '연결된 보호자 없음' : mockGuardian.name}
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
