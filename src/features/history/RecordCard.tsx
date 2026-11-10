import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Icon, Row, Stack, Text } from '@/components';
import { colors, fontFamily, radius, space } from '@/theme';

import { deliveryStatus, hhmm, responseStatus, withSubject, type StatusText } from './format';
import type { HelpRequestRecord, HistoryRecord, SignalRecord } from './types';

// 08-1 신호 기록 목록의 한 항목 (design/screens/LogList.dc.html)
// '기기 전달'과 '터치 응답'은 항상 두 줄로 따로 보여 준다.

type Props = {
  record: HistoryRecord;
  recipientName: string;
  onPress: () => void;
  /** 전송 실패 항목의 '다시 보내기' */
  onResend: () => void;
};

export function RecordCard({ record, recipientName, onPress, onResend }: Props) {
  if (record.type === 'help') return <HelpCard record={record} recipientName={recipientName} onPress={onPress} />;
  return <SignalCard record={record} onPress={onPress} onResend={onResend} />;
}

/* ---------- 상태 한 줄 ---------- */

function StatusLine({ label, status }: { label: string; status: StatusText }) {
  return (
    <Row gap={2} align="flex-start">
      <Text variant="small" color="textSecondary" style={styles.dt}>
        {label}
      </Text>
      <Row gap={2} flex align="flex-start">
        {status.icon && (
          <View style={styles.ddIcon}>
            <Icon name={status.icon} size={18} strokeWidth={2.4} />
          </View>
        )}
        <Text
          variant="label"
          color={status.icon ? 'textPrimary' : 'textSecondary'}
          style={[styles.dd, !status.strong && (status.icon ? styles.medium : styles.regular)]}
        >
          {status.text}
        </Text>
      </Row>
    </Row>
  );
}

/* ---------- 보낸 신호 ---------- */

function SignalCard({ record, onPress, onResend }: { record: SignalRecord; onPress: () => void; onResend: () => void }) {
  const delivery = deliveryStatus(record.delivery);
  const response = responseStatus(record);
  const failed = record.delivery.kind === 'failed';
  const noReply = record.response?.kind === 'noReply';
  const sent = `보낸 시각 ${hhmm(record.sentAt)}`;

  const content = (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${record.name}, ${sent}. 기기 전달, ${delivery.text}. 터치 응답, ${response.text}`}
      accessibilityHint="자세히 보기"
      style={({ pressed }) => [
        styles.content,
        !failed && styles.card,
        !failed && (noReply ? styles.cardNoReply : styles.cardDefault),
        pressed && styles.pressed,
      ]}
    >
      <Row justify="space-between" align="baseline" gap={2}>
        <Text variant="heading" style={styles.shrink}>
          {record.name}
        </Text>
        <Text variant="caption" color="textSecondary">
          {sent}
        </Text>
      </Row>
      <Text variant="caption" color="textSecondary">
        {record.meaning}
      </Text>
      <Stack gap={2}>
        <StatusLine label="기기 전달" status={delivery} />
        <StatusLine label="터치 응답" status={response} />
      </Stack>
    </Pressable>
  );

  if (!failed) return content;

  return (
    <View style={[styles.card, styles.cardStrong, styles.content]}>
      {content}
      <Button label="다시 보내기" icon="retry" variant="secondary" size="sm" onPress={onResend} />
    </View>
  );
}

/* ---------- 받은 도움 요청 ---------- */

function HelpCard({
  record,
  recipientName,
  onPress,
}: {
  record: HelpRequestRecord;
  recipientName: string;
  onPress: () => void;
}) {
  const received = `받은 시각 ${hhmm(record.sentAt)}`;
  const caption = `${withSubject(recipientName)} 보낸 요청${record.location ? ' · 위치 함께 공유됨' : ''}`;
  const opened: StatusText = record.openedAt
    ? { icon: 'check', text: `${hhmm(record.openedAt)}에 열어 봄`, strong: false }
    : { icon: null, text: '아직 열어 보지 않았어요', strong: false };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`도움 요청, ${received}. ${caption}. 내 확인, ${opened.text}`}
      accessibilityHint="자세히 보기"
      style={({ pressed }) => [styles.card, styles.cardStrong, styles.cardHelp, styles.content, pressed && styles.pressed]}
    >
      <Row justify="space-between" gap={2}>
        <Row gap={2}>
          <Icon name="warning" size={20} strokeWidth={2.4} />
          <Text variant="heading">도움 요청</Text>
        </Row>
        <Text variant="caption" color="textSecondary">
          {received}
        </Text>
      </Row>
      <Text variant="caption" color="textSecondary">
        {caption}
      </Text>
      <StatusLine label="내 확인" status={opened} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shrink: { flexShrink: 1 },
  medium: { fontFamily: fontFamily.medium },
  regular: { fontFamily: fontFamily.regular },

  content: { gap: space[3] },
  card: {
    padding: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  cardDefault: { borderWidth: 1, borderColor: colors.lineStrong },
  cardNoReply: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.ink900 },
  cardStrong: { borderWidth: 1.5, borderColor: colors.ink900 },
  cardHelp: { backgroundColor: colors.yellow100 },
  pressed: { opacity: 0.8 },

  dt: { width: 68, fontFamily: fontFamily.regular, lineHeight: 22 },
  ddIcon: { paddingTop: 2 },
  dd: { flexShrink: 1, lineHeight: 22 },
});
