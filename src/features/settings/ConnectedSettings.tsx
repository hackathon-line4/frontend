import { router } from 'expo-router';
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
    onCheckConnection={() => { void action.run(signal => serverSettings.startCheck(signal)); }}
    onLinkAnother={() => router.push('/link/guardian')} onConnectionHelp={() => router.push('/guardian/connection-help')}
    onCalibration={() => router.push('/calibration')} onCalibrationTest={() => router.push('/calibration/test')}
    onChangeSettings={patch => { void action.run(signal => serverSettings.save(patch, signal)); }}
    onOpenPhoneSettings={phoneSettings} onOpenRetention={() => {}} onLogout={onLogout} />;
}
export function ConnectedRecipientSettings() {
  const { data, session, permissions } = useServerSettings();
  const action = useGuardianMutation();
  const link = session.links.find(link => link.status === 'ACTIVE');
  const onLogout = () => { void action.run(async () => { await logout(); }); };
  if (!data?.recipient) return <SettingsFeedback error={data?.error || action.error} onLogout={onLogout} />;
  return <RecipientSettingsScreen guardianName={link?.guardian.name ?? '연결된 보호자 없음'} connection={connectionModel(link, data.check)}
    checking={action.busy || data.check?.status === 'PENDING'} settings={data.recipient} locationPermission={permissions.location} notificationPermission={permissions.notification}
    busy={action.busy || data.saving} error={action.error || data.error} onClose={goBack}
    onCheckConnection={() => { void action.run(signal => serverSettings.startCheck(signal)); }}
    onCalibration={() => router.push('/calibration')} onCalibrationTest={() => router.push('/calibration/test')}
    onChangeSettings={patch => { if (patch.shareLocationOnHelp !== undefined) void action.run(signal => serverSettings.save({ shareLocationOnHelp: patch.shareLocationOnHelp! }, signal)); }}
    onOpenPhoneSettings={phoneSettings} onLogout={onLogout} />;
}
export function ConnectedConnectionHelp() {
  const { data, session } = useServerSettings();
  const action = useGuardianMutation();
  const link = session.links.find(link => link.status === 'ACTIVE');
  return <ConnectionHelpScreen recipientName={link?.recipient.name ?? '당사자'} connection={connectionModel(link, data?.check ?? null)}
    checking={action.busy || data?.check?.status === 'PENDING'} error={action.error || data?.error}
    onBack={goBack} onRecheck={() => { void action.run(signal => serverSettings.startCheck(signal)); }} onRelink={() => router.push('/link/guardian')} />;
}
