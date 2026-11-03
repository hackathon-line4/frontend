import { router } from 'expo-router';
import { Linking } from 'react-native';

import { mockRecipient } from '@/features/link/mock';
import { setRole } from '@/features/session';
import { checkConnection, mockCalibration, updateGuardianSettings, useSettings } from '@/features/settings';
import GuardianSettingsScreen from '@/screens/settings/GuardianSettingsScreen';

export default function GuardianSettingsRoute() {
  const { connection, checking, guardian, notificationPermission } = useSettings();
  return (
    <GuardianSettingsScreen
      // TODO: 연결된 당사자 정보 · 당사자 보정 결과 (서버)
      recipientName={mockRecipient.name}
      connection={connection}
      checking={checking}
      settings={guardian}
      calibration={mockCalibration}
      notificationPermission={notificationPermission}
      onCheckConnection={checkConnection}
      onLinkAnother={() => router.push('/link/guardian')}
      onConnectionHelp={() => router.push('/guardian/connection-help')}
      onCalibration={() => router.push('/calibration')}
      onCalibrationTest={() => router.push('/calibration/test')}
      onChangeSettings={updateGuardianSettings}
      onOpenPhoneSettings={() => Linking.openSettings()}
      // TODO: 기록 보관 기간과 삭제 방법 안내 (정책 확정 후 화면 연결)
      onOpenRetention={() => {}}
      onLogout={() => {
        // TODO: 서버 로그아웃 · 저장된 세션 삭제
        setRole(null);
        router.replace('/auth/login');
      }}
    />
  );
}
