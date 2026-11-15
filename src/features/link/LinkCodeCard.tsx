import { StyleSheet } from 'react-native';

import { Card, Tag, Text } from '@/components';
import { colors, space, typography } from '@/theme';

import { formatLinkCode, spellLinkCode } from './code';
import { formatMinutes } from './useCountdown';

type LinkCodeCardProps = {
  code: string;
  /** 남은 시간(초). 0이면 만료 */
  remainingSeconds: number;
};

// 04-G2 연결 코드 + 만료 시간 (QR 연결은 하지 않음)
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
});
