import { StyleSheet, View } from 'react-native';

import { Card, Tag, Text } from '@/components';
import { QrPlaceholder } from '@/components/Illustrations';
import { colors, typography } from '@/theme';

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

      <View style={[styles.qrRow, expired && styles.dimmed]}>
        <View accessible accessibilityRole="image" accessibilityLabel="연결용 QR 코드">
          <QrPlaceholder />
        </View>
        <Text color="textSecondary" style={styles.qrText}>
          당사자 휴대폰의 <Text style={styles.qrStrong}>QR 코드로 연결</Text>을 눌러 이 화면을 비춰도 돼요.
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 14,
  },
  code: {
    ...typography.code,
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
  qrRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dimmed: {
    opacity: 0.3,
  },
  qrText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
  },
  qrStrong: {
    fontFamily: typography.label.fontFamily,
    color: colors.textPrimary,
  },
});
