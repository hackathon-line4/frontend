import { router } from 'expo-router';
import { useState } from 'react';
import { Linking } from 'react-native';
import { Button, Screen, ScreenHeader, ScreenTitle } from '@/components';
import { useGuardianMutation } from '@/features/guardian/hooks';
import { logout } from '@/features/session';
import GuardianSettingsScreen from '@/screens/settings/GuardianSettingsScreen';
import RecipientSettingsScreen from '@/screens/recipient/RecipientSettingsScreen';
import ConnectionHelpScreen from '@/screens/settings/ConnectionHelpScreen';
import { serverSettings } from './client';
import { calibrationModel, connectionModel } from './models';
import { useServerSettings } from './useServerSettings';
import { askPermission as askLocationPermission } from '@/features/location/device';

const phoneSettings = () => { void Linking.openSettings().catch(() => {}); };
const goBack = () => router.canGoBack() ? router.back() : router.replace('/');
function SettingsFeedback({ error, onLogout }: { error?: string; onLogout: () => void }) {
  return <Screen header={<ScreenHeader title="설정" onBack={goBack} />} gap={4}>
    <ScreenTitle title={error || '설정을 불러오는 중이에요'} />
    {error && <Button label="다시 시도" onPress={() => { void serverSettings.load(); }} />}
    <Button label="로그아웃" variant="text" onPress={onLogout} />
  </Screen>;
}
export function ConnectedGuardianSettings() {
  const { data, session, permissions } = useServerSettings();
  const action = useGuardianMutation();
  const link = session.links.find(link => link.status === 'ACTIVE');
  const onLogout = () => { void action.run(async () => { await logout(); }); };
  if (!data?.guardian) return <SettingsFeedback error={data?.error || action.error} onLogout={onLogout} />;
  return <GuardianSettingsScreen recipientName={link?.recipient.name ?? '연결된 당사자 없음'}
    connection={connectionModel(link, data.check)} checking={action.busy || data.check?.status === 'PENDING'}
    settings={data.guardian} calibration={calibrationModel(data.partner)} notificationPermission={permissions.notification}
    busy={action.busy || data.saving} error={action.error || data.error} locationSharing={data.partner?.locationSharing.enabled} showRetention={false}
    onCheckConnection={() => { void action.run(signal => serverSettings.startCheck(signal)); }} onOpenSetup={() => router.push('/guardian/setup')} onConnectionHelp={() => router.push('/guardian/connection-help')}
    onCalibration={() => router.push('/calibration')} onCalibrationTest={() => router.push('/calibration/test')}
    onChangeSettings={patch => { void action.run(signal => serverSettings.save(patch, signal)); }}
    onOpenPhoneSettings={phoneSettings} onOpenRetention={() => {}} onLogout={onLogout} />;
}
export function ConnectedRecipientSettings() {
  const { data, session, permissions } = useServerSettings();
  // 위치 보내기 스위치는 누르는 즉시 바꿔 보여 준다 (낙관적 업데이트). 저장에 실패하면 서버 값으로 되돌아간다
  const [shareOverride, setShareOverride] = useState<boolean | null>(null);
  const action = useGuardianMutation();
  const link = session.links.find(link => link.status === 'ACTIVE');
  const onLogout = () => { void action.run(async () => { await logout(); }); };
  if (!data?.recipient) return <SettingsFeedback error={data?.error || action.error} onLogout={onLogout} />;
  return <RecipientSettingsScreen guardianName={link?.guardian.name ?? '연결된 보호자 없음'} connection={connectionModel(link, data.check)}
    checking={action.busy || data.check?.status === 'PENDING'}
    settings={shareOverride === null ? data.recipient : { ...data.recipient, shareLocationOnHelp: shareOverride }} locationPermission={permissions.location} notificationPermission={permissions.notification}
    busy={action.busy || data.saving} error={action.error || data.error} onClose={goBack}
    onCheckConnection={() => { void action.run(signal => serverSettings.startCheck(signal)); }}
    onCalibration={() => router.push('/calibration')} onCalibrationTest={() => router.push('/calibration/test')}
    onChangeSettings={patch => {
      const enabled = patch.shareLocationOnHelp;
      if (enabled === undefined) return;
      void action.run(async signal => {
        // 저장이 실제로 시작될 때 바로 바꿔 보여 준다 (다른 저장 중이면 run이 무시하므로 표시도 바꾸지 않는다)
        setShareOverride(enabled);
        try {
          // 켤 때 위치 권한('항상 허용'까지)을 먼저 묻는다. 거절해도 공유 설정은 저장한다
          if (enabled && permissions.location !== 'granted') await askLocationPermission();
          await serverSettings.save({ shareLocationOnHelp: enabled }, signal);
        } finally {
          // 성공하면 서버 값이 같아지고, 실패하면 서버 값(이전 상태)으로 돌아간다
          setShareOverride(null);
        }
      });
    }}
    onOpenPhoneSettings={phoneSettings} onOpenSetup={() => router.push('/recipient/setup')} onLogout={onLogout} />;
}
export function ConnectedConnectionHelp() {
  const { data, session } = useServerSettings();
  const action = useGuardianMutation();
  const link = session.links.find(link => link.status === 'ACTIVE');
  return <ConnectionHelpScreen recipientName={link?.recipient.name ?? '당사자'} connection={connectionModel(link, data?.check ?? null)}
    checking={action.busy || data?.check?.status === 'PENDING'} error={action.error || data?.error}
    onBack={goBack} onRecheck={() => { void action.run(signal => serverSettings.startCheck(signal)); }} onRelink={() => router.push('/link/guardian')} />;
}
