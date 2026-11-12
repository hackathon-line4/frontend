import { StyleSheet, View } from 'react-native';

import { Button, Row, Screen, ScreenHeader, ScreenTitle, Stack, Text } from '@/components';
import { ConnectionStatusBox } from '@/features/settings/ConnectionStatusBox';
import type { ConnectionState } from '@/features/settings';
import { colors, space } from '@/theme';

type Props = {
  recipientName: string;
  connection: ConnectionState;
  checking: boolean;
  onBack: () => void;
  onRecheck: () => void;
  onRelink: () => void;
  error?: string;
};

// 09-2 연결이 안 될 때 (design/screens/SettingsConnIssue.dc.html)
// 연결이 확인되지 않는다는 것만으로 문제가 생겼다고 단정하지 않는다.
export default function ConnectionHelpScreen({ recipientName, connection, checking, onBack, onRecheck, onRelink, error }: Props) {
  const causes = [
    `${recipientName}의 휴대폰이 꺼져 있거나 인터넷에 연결되어 있지 않아요.`,
    `${recipientName}의 휴대폰에서 손울림 알림이 꺼져 있어요.`,
    '절전 모드 때문에 앱이 멈춰 있어요.',
  ];

  return (
    <Screen
      scroll
      header={<ScreenHeader title="설정" onBack={onBack} />}
      footer={
        <>
          <Button label="다시 확인하기" icon="retry" disabled={checking} onPress={onRecheck} />
          <Button label="계정 다시 연결하기" variant="secondary" size="sm" onPress={onRelink} />
        </>
      }
      paddingTop={3}
      gap={4}
    >
      <ScreenTitle
        title={connection.status === 'connected' ? '연결을 확인했어요' : '연결이 확인되지 않아요'}
        size={24}
      />
      <ConnectionStatusBox connection={connection} name={recipientName} />
      {error && <Text accessibilityRole="alert">{error}</Text>}

      <Stack gap={3} style={styles.causes}>
        <Text variant="bodyStrong" accessibilityRole="header">
          이런 경우일 수 있어요
        </Text>
        <Stack gap={3} accessibilityRole="list">
          {causes.map((cause) => (
            <Row key={cause} gap={3} align="flex-start">
              <View style={styles.bulletBox} importantForAccessibility="no-hide-descendants">
                <View style={styles.bullet} />
              </View>
              <Text style={styles.causeText}>
                {cause}
              </Text>
            </Row>
          ))}
        </Stack>
      </Stack>

      <Text variant="caption" color="textSecondary">
        연결이 확인되지 않는다는 것만으로 {recipientName}에게 문제가 생겼다고 볼 수는 없어요.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  causes: { paddingTop: space[2] },
  bulletBox: { height: 26, justifyContent: 'center' },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.ink900 },
  causeText: { flex: 1 },
});
