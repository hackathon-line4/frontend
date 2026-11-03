import { StyleSheet, View } from 'react-native';

import { Card, Row, Tag, Text } from '@/components';
import { QrPlaceholder } from '@/components/Illustrations';
import { colors, space, typography } from '@/theme';

import { formatLinkCode, spellLinkCode } from './code';
import { formatMinutes } from './useCountdown';

type LinkCodeCardProps = {
  code: string;
  /** 남은 시간(초). 0이면 만료 */
  remainingSeconds: number;
};

// 04-G2 연결 코드 + 만료 시간 + QR
export function LinkCodeCard({ code, remainingSeconds }: LinkCodeCardProps) {
  const expired = remainingSeconds <= 0;

  return (
    <Card variant="emphasis" style={styles.card}>
      <Text
        accessibilityLabel={`연결 코드 ${spellLinkCode(code)}${expired ? ', 만료됨' : ''}`}
        style={[styles.code, expired && styles.expiredCode]}
      >
        {formatLinkCode(code)}
      </Text>

      {expired ? (
        <Tag icon="warning" label="만료됨" tone="dark" />
      ) : (
        <Tag icon="timer" label={`${formatMinutes(remainingSeconds)} 후 만료`} bold={false} />
      )}

      <View style={styles.divider} />

      <Row gap={4} style={[styles.stretch, expired && styles.dimmed]}>
        <View accessible accessibilityRole="image" accessibilityLabel="연결용 QR 코드">
          <QrPlaceholder />
        </View>
        <Text variant="label" weight="regular" color="textSecondary" style={styles.flex}>
          당사자 휴대폰의 <Text variant="label">QR 코드로 연결</Text>을 눌러 이 화면을 비춰도 돼요.
        </Text>
      </Row>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: space[3],
  },
  code: {
    ...typography.code,
    // 48 글자가 잘리지 않게 한 줄 높이만 늘린다
    lineHeight: 56,
  },
  expiredCode: {
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  divider: {
    alignSelf: 'stretch',
    height: 1,
    backgroundColor: colors.line,
  },
  stretch: {
    alignSelf: 'stretch',
  },
  dimmed: {
    opacity: 0.3,
  },
  flex: {
    flex: 1,
  },
});
