import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Button, Icon, IconButton, Row, Screen, Section, Stack, SwitchRow, Text } from '@/components';
import {
  canSendLocation,
  locationPermissionLabel,
  type ConnectionState,
  type LocationPermission,
  type NotificationPermission,
  type RecipientSettings,
} from '@/features/settings';
import { useRoleScale } from '@/features/session';
import { colors, radius, space } from '@/theme';

type Props = {
  guardianName: string;
  connection: ConnectionState;
  checking: boolean;
  settings: RecipientSettings;
  locationPermission: LocationPermission;
  notificationPermission: NotificationPermission;
  onClose: () => void;
  onCheckConnection: () => void;
  onCalibration: () => void;
  onCalibrationTest: () => void;
  onChangeSettings: (patch: Partial<RecipientSettings>) => void;
  onOpenPhoneSettings: () => void;
  busy?: boolean; error?: string; onLogout?: () => void;
};

// 09-3 당사자 설정 (design/screens/SettingsR.dc.html)
// 보호자 설정과 같은 순서(연결 → 진동 → 알림 → 위치). 글자 20 이상 · 행 80 이상 · 설명은 꼭 필요한 문장만.
export default function RecipientSettingsScreen({
  guardianName,
  connection,
  checking,
  settings,
  locationPermission,
  notificationPermission,
  onClose,
  onCheckConnection,
  onCalibration,
  onCalibrationTest,
  onChangeSettings,
  onOpenPhoneSettings,
  busy, error, onLogout,
}: Props) {
  const scale = useRoleScale();
  const connected = connection.status === 'connected';
  const locationOk = canSendLocation(locationPermission);
  const notificationsOn = notificationPermission === 'granted';
  const guardianLabel = `${guardianName} 보호자`;
  const locationStatus =
    locationPermission === 'approximate'
      ? locationPermissionLabel.approximate
      : `위치 권한 ${locationPermissionLabel[locationPermission]}`;

  return (
    <Screen
      scroll
      gutter="tab"
      gap={scale.sectionGap}
      header={
        <View style={styles.header}>
          <IconButton
            icon="close"
            accessibilityLabel="닫고 대기 화면으로"
            onPress={onClose}
            size={30}
            strokeWidth={2.6}
            touchSize={56}
          />
        </View>
      }
    >
      <Text variant="rTitle" accessibilityRole="header" style={styles.inset}>
        설정
      </Text>
      {error && <Text variant="rBody" accessibilityRole="alert">{error}</Text>}

      <Section title="연결" size="lg">
        <View style={[styles.bigCard, connected ? styles.solid : styles.dashed]}>
          <Stack gap={4}>
            <Row
              gap={4}
              accessible
              accessibilityLiveRegion="polite"
              accessibilityLabel={`${guardianLabel}, ${connected ? '연결됨' : `연결 확인 안 됨, 마지막 확인 ${connection.lastCheckedAt}`}`}
            >
              <Avatar name={guardianName} size="lg" />
              <Stack flex>
                <Text variant="rButton">{guardianLabel}</Text>
                <Row gap={2}>
                  {!connected && <Icon name="link-off" size={22} strokeWidth={2.4} />}
                  <Text variant="heading">{connected ? '연결됨' : '연결 확인 안 됨'}</Text>
                </Row>
                {!connected && <Text variant="rBody">마지막 확인 {connection.lastCheckedAt}</Text>}
              </Stack>
            </Row>
            {/* TODO: 확인 결과를 진동으로도 알림 (패턴은 검증 후 확정) */}
            <Button
              label="연결 확인하기"
              variant="secondary"
              size={scale.buttonSize}
              disabled={checking}
              onPress={onCheckConnection}
            />
          </Stack>
        </View>
      </Section>

      <Section title="진동" size="lg">
        <BigLinkRow label="내 진동 설정" onPress={onCalibration} minHeight={scale.rowMinHeight} />
        <BigLinkRow label="진동 테스트 다시 하기" onPress={onCalibrationTest} minHeight={scale.rowMinHeight} />
      </Section>

      <Section title="알림" size="lg">
        <View style={[styles.rowCard, { minHeight: scale.rowMinHeight }]}>
          <Row gap={3} accessible accessibilityLiveRegion="polite">
            <Icon name={notificationsOn ? 'check' : 'bell'} size={26} strokeWidth={2.6} />
            <Text variant="rButton" style={styles.flex}>
              {notificationPermission === 'unknown' ? '알림 권한은 휴대폰 설정에서 확인해 주세요' : notificationsOn ? '알림 권한 켜짐' : '알림 권한 꺼짐'}
            </Text>
          </Row>
        </View>
        {!notificationsOn && (
          <Button
            label="휴대폰 설정 열기"
            trailingIcon="external"
            variant="secondary"
            size={scale.buttonSize}
            onPress={onOpenPhoneSettings}
          />
        )}
      </Section>

      <Section title="위치" size="lg">
        <View style={[styles.bigCard, locationOk ? styles.solid : styles.dashed]}>
          <Stack gap={4}>
            <Row gap={3} accessible accessibilityLiveRegion="polite">
              <Icon name={locationOk ? 'tab-location' : 'pin-off'} size={28} strokeWidth={2.4} />
              <Text variant="rButton" style={styles.flex}>
                {locationStatus}
              </Text>
            </Row>
            <Text variant="rBody">
              도움 요청을 보낼 때만, 그 순간의 위치를 {guardianLabel}에게 보내요. 평소에는 보내지 않아요.
            </Text>
            {locationPermission === 'denied' && (
              <Text variant="rBody">지금은 권한이 꺼져 있어서 도움 요청만 가고 위치는 가지 않아요.</Text>
            )}
            {!locationOk && (
              <Button
                label="휴대폰 설정 열기"
                trailingIcon="external"
                size={scale.buttonSize}
                onPress={onOpenPhoneSettings}
              />
            )}
          </Stack>
        </View>
        <SwitchRow
          label="도움 요청에 위치 보내기"
          large
          value={settings.shareLocationOnHelp}
          disabled={busy}
          onValueChange={(shareLocationOnHelp) => onChangeSettings({ shareLocationOnHelp })}
        />
      </Section>
      {onLogout && <Button label="로그아웃" disabled={busy} variant="text" size={scale.buttonSize} onPress={onLogout} />}
    </Screen>
  );
}

function BigLinkRow({ label, onPress, minHeight }: { label: string; onPress: () => void; minHeight: number }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.rowCard, styles.linkRow, { minHeight }, pressed && styles.pressed]}
    >
      <Text variant="rButton" style={styles.flex}>
        {label}
      </Text>
      <Icon name="chevron-right" size={28} strokeWidth={2.6} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { height: 56, justifyContent: 'center' },
  inset: { paddingHorizontal: space[1] },

  bigCard: {
    padding: space[5],
    borderWidth: 3,
    borderColor: colors.ink900,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },
  solid: { borderStyle: 'solid' },
  dashed: { borderStyle: 'dashed' },

  rowCard: {
    justifyContent: 'center',
    paddingHorizontal: space[5],
    paddingVertical: space[4],
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
  pressed: { opacity: 0.8 },
});
