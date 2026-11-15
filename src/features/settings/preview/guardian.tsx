import { router } from 'expo-router';
import { Linking } from 'react-native';

import { mockRecipient } from '@/features/link/mock';
import { logout, useSession } from '@/features/session';
import { checkConnection, mockCalibration, updateGuardianSettings, useSettings } from '@/features/settings';
import GuardianSettingsScreen from '@/screens/settings/GuardianSettingsScreen';

export default function GuardianSettingsRoute() {
  const session = useSession();
  const link = session.links.find((item) => item.status === 'ACTIVE');
  const { connection, checking, guardian, notificationPermission } = useSettings();
  return (
    <GuardianSettingsScreen
      // TODO: 연결된 당사자 정보 · 당사자 보정 결과 (서버)
      recipientName={session.tokens ? link?.recipient.name ?? '연결된 당사자 없음' : mockRecipient.name}
      connection={connection}
      checking={checking}
      settings={guardian}
      calibration={mockCalibration}
      notificationPermission={notificationPermission}
      onCheckConnection={checkConnection}
      onConnectionHelp={() => router.push('/guardian/connection-help')}
      onCalibration={() => router.push('/calibration')}
      onCalibrationTest={() => router.push('/calibration/test')}
      onChangeSettings={updateGuardianSettings}
      onOpenPhoneSettings={() => Linking.openSettings()}
      // TODO: 기록 보관 기간과 삭제 방법 안내 (정책 확정 후 화면 연결)
      onOpenRetention={() => {}}
      onLogout={() => {
        void logout();
      }}
    />
  );
}
