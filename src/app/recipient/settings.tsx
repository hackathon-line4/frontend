import { router } from 'expo-router';
import { Linking } from 'react-native';

import { mockGuardian } from '@/features/link/mock';
import { setLocationSharing, useLocationSharing } from '@/features/location';
import { useSession } from '@/features/session';
import { checkConnection, updateRecipientSettings, useSettings } from '@/features/settings';
import RecipientSettingsScreen from '@/screens/recipient/RecipientSettingsScreen';

export default function RecipientSettingsRoute() {
  const session = useSession();
  const link = session.links.find((item) => item.status === 'ACTIVE');
  const { connection, checking, recipient, locationPermission, notificationPermission } = useSettings();
  // 위치: 서버 공유 값 + 휴대폰 권한 (서버 없이 볼 때는 목 값)
  const sharing = useLocationSharing();
  const live = !!session.tokens && sharing.enabled !== null;
  return (
    <RecipientSettingsScreen
      // TODO: 연결된 보호자 정보 (서버)
      guardianName={session.tokens ? link?.guardian.name ?? '연결된 보호자 없음' : mockGuardian.name}
      connection={connection}
      checking={checking}
      settings={live ? { ...recipient, shareLocationOnHelp: !!sharing.enabled } : recipient}
      locationPermission={session.tokens ? sharing.permission : locationPermission}
      notificationPermission={notificationPermission}
      onClose={() => (router.canGoBack() ? router.back() : router.replace('/recipient'))}
      onCheckConnection={checkConnection}
      onCalibration={() => router.push('/calibration')}
      onCalibrationTest={() => router.push('/calibration/test')}
      onChangeSettings={(patch) => {
        if (session.tokens && patch.shareLocationOnHelp !== undefined) void setLocationSharing(patch.shareLocationOnHelp);
        else updateRecipientSettings(patch);
      }}
      onOpenPhoneSettings={() => Linking.openSettings()}
    />
  );
}
