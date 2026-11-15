import { Pressable, StyleSheet } from 'react-native';

import {
  Button,
  Card,
  Chip,
  Icon,
  ListGroup,
  ListRow,
  ProfileRow,
  Row,
  Screen,
  ScreenTitle,
  Section,
  Stack,
  SwitchListRow,
  Text,
  type IconName,
} from '@/components';
import { withSubject } from '@/features/history';
import { ConnectionStatusBox } from '@/features/settings/ConnectionStatusBox';
import {
  waitMinuteOptions,
  type CalibrationSummary,
  type ConnectionState,
  type GuardianSettings,
  type NotificationPermission,
} from '@/features/settings';
import { colors, radius, space, touch } from '@/theme';

type Props = {
  recipientName: string;
  connection: ConnectionState;
  checking: boolean;
  settings: GuardianSettings;
  calibration: CalibrationSummary | null;
  busy?: boolean; error?: string; locationSharing?: boolean; showRetention?: boolean;
  notificationPermission: NotificationPermission;
  onCheckConnection: () => void;
  onConnectionHelp: () => void;
  /** 알림 · 전체 화면 알림 · 배터리 등 휴대폰 설정 확인 */
  onOpenSetup?: () => void;
  onCalibration: () => void;
  onCalibrationTest: () => void;
  onChangeSettings: (patch: Partial<GuardianSettings>) => void;
  onOpenPhoneSettings: () => void;
  onOpenRetention: () => void;
  onLogout: () => void;
};

// 09-1 보호자 설정 (design/screens/SettingsG.dc.html)
// 하위 메뉴 없이 한 화면: 연결 관리 → 진동 설정 → 알림 → 개인정보 및 위치
export default function GuardianSettingsScreen({
  recipientName,
  connection,
  checking,
  settings,
  calibration,
  notificationPermission,
  onCheckConnection,
  onConnectionHelp,
  onOpenSetup,
  onCalibration,
  onCalibrationTest,
  onChangeSettings,
  onOpenPhoneSettings,
  onOpenRetention,
  onLogout,
  busy, error, locationSharing, showRetention = true,
}: Props) {
  const connected = connection.status === 'connected';
  const notificationsOn = notificationPermission === 'granted';

  return (
    <Screen gutter="tab" inTabs scroll paddingTop={6} gap={8}>
      <ScreenTitle title="설정" />
      {error && <Text accessibilityRole="alert">{error}</Text>}

      <Section title="연결 관리">
        <Card variant="emphasis" style={[styles.connCard, !connected && styles.connCardUnconfirmed]}>
          <Stack gap={4}>
            <ProfileRow name={recipientName} caption={`당사자 · ${connection.linkedOn} 연결`} size="md" />
            <ConnectionStatusBox connection={connection} name={recipientName} />
            <Button
              label="지금 연결 확인하기"
              icon="retry"
              variant="secondary"
              size="sm"
              disabled={checking}
              onPress={onCheckConnection}
            />
          </Stack>
        </Card>
        <ListGroup>
          {/* MVP는 보호자 1명 : 당사자 1명 연결만 (다른 당사자 연결하기 없음) */}
          <ListRow title="연결이 안 될 때" icon="info" onPress={onConnectionHelp} />
          {onOpenSetup && <ListRow title="휴대폰 설정 확인" icon="bell" divider onPress={onOpenSetup} />}
        </ListGroup>
      </Section>

      <Section title="진동 설정">
        <ListGroup>
          {/* 당사자의 보정 상태는 읽기 전용. 보호자가 원격으로 바꾸지 않는다 */}
          <Stack paddingY={3} accessible>
            <Text variant="label">{recipientName}의 진동 설정</Text>
            <Text variant="caption" color="textSecondary">
              {calibration ? `${calibration.calibratedOn} · 세기 ${calibration.strength} · 길이 ${calibration.length} · 반복 ${calibration.repeat}번` : '당사자의 진동 설정을 확인하지 못했어요.'}
            </Text>
          </Stack>
          <ListRow
            title="내 진동 설정 (보정)"
            subtitle="내 휴대폰에서 신호를 느껴 볼 때 쓰여요"
            icon="tab-settings"
            onPress={onCalibration}
          />
          <ListRow title="진동 테스트 다시 하기" icon="play" onPress={onCalibrationTest} />
        </ListGroup>
      </Section>

      <Section title="알림">
        <ListGroup>
          <SwitchListRow
            label="터치 응답 알림"
            description={`${withSubject(recipientName)} 화면을 터치해 응답하면`}
            value={settings.replyAlert}
            disabled={busy}
            onValueChange={(replyAlert) => onChangeSettings({ replyAlert })}
          />
          <SwitchListRow
            label="응답 없음 알림"
            description="정한 시간 동안 터치 응답이 없으면"
            value={settings.noReplyAlert}
            disabled={busy}
            onValueChange={(noReplyAlert) => onChangeSettings({ noReplyAlert })}
          />
          <Stack gap={2} paddingY={3}>
            <Text variant="bodyStrong" nativeID="wait-minutes">
              응답 기다리는 시간
            </Text>
            <Row gap={2} accessibilityLabelledBy="wait-minutes">
              {waitMinuteOptions.map((min) => (
                <Chip
                  key={min}
                  label={`${min}분`}
                  selected={settings.waitMinutes === min}
                  disabled={busy}
                  onPress={() => onChangeSettings({ waitMinutes: min })}
                />
              ))}
            </Row>
          </Stack>
          <Row gap={3} paddingY={3} style={styles.fixedRow} accessible accessibilityLabel="도움 요청 알림, 항상 켜짐">
            <Stack flex>
              <Text variant="bodyStrong">도움 요청 알림</Text>
              <Text variant="caption" color="textSecondary">
                놓치지 않도록 항상 켜져 있어요
              </Text>
            </Stack>
            <Row gap={1}>
              <Icon name="lock" size={16} />
              <Text variant="label">
                항상 켜짐
              </Text>
            </Row>
          </Row>
        </ListGroup>
      </Section>

      <Section title="개인정보 및 위치">
        <Card variant="outline" style={styles.privacyCard}>
          <Stack gap={3}>
            <InfoParagraph
              icon="tab-location"
              title={`${recipientName}의 위치 공유: ${locationSharing === undefined ? '확인 안 됨' : locationSharing ? '켜짐' : '꺼짐'}`}
              body={`위치 공유는 ${recipientName}의 휴대폰에서만 바꿀 수 있어요. 켜져 있으면 도움 요청을 보낼 때와 위치 탭에서 새로고침할 때, 그 순간의 위치가 한 번 와요. 이동 경로는 남지 않아요.`}
            />
            <InfoParagraph
              icon="bell"
              title={`내 알림 권한: ${notificationPermission === 'unknown' ? '휴대폰 설정에서 확인' : notificationsOn ? '허용됨' : '꺼짐'}`}
              body="알림을 끄면 도움 요청을 바로 받을 수 없어요."
            />
            <Stack>
              <LinkRow label="휴대폰 설정에서 권한 바꾸기" icon="external" onPress={onOpenPhoneSettings} />
              {showRetention && <LinkRow label="기록 보관과 삭제" onPress={onOpenRetention} />}
            </Stack>
          </Stack>
        </Card>
      </Section>

      <Button label={busy ? '처리 중…' : '로그아웃'} disabled={busy} variant="text" onPress={onLogout} />
    </Screen>
  );
}

function InfoParagraph({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  return (
    <Row gap={3} align="flex-start" accessible accessibilityLabel={`${title}. ${body}`}>
      <Stack paddingY={1}>
        <Icon name={icon} size={20} strokeWidth={2.2} />
      </Stack>
      <Stack flex>
        <Text variant="label">{title}</Text>
        <Text variant="caption" color="textSecondary">
          {body}
        </Text>
      </Stack>
    </Row>
  );
}

function LinkRow({ label, icon, onPress }: { label: string; icon?: IconName; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}
    >
      <Text variant="label">{label}</Text>
      {icon && <Icon name={icon} size={16} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  connCard: { padding: space[4], borderRadius: radius.lg },
  connCardUnconfirmed: { borderStyle: 'dashed' },
  privacyCard: { borderColor: colors.lineStrong, borderRadius: radius.md },
  fixedRow: { minHeight: 64 },
  link: {
    minHeight: touch.guardianMin,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  pressed: { opacity: 0.7 },
});
