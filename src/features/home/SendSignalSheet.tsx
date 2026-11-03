import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet, Button, Icon, ListRow, Row, Rhythm, Stack, StatusChip, StatusMessage, Text } from '@/components';
import type { Signal } from '@/features/signals';
import { colors, describeRhythm, radius, space } from '@/theme';

type SendSignalSheetProps = {
  visible: boolean;
  recipientName: string;
  /** 보낼 수 있는 신호. 1개면 바로 확인 단계, 여러 개면 먼저 고른다 */
  candidates: readonly Signal[];
  /** 고르기 단계 제목 (예: '긴급 신호 고르기') */
  pickTitle?: string;
  /** 신호가 1개여도 고르기 단계를 보여 준다 (긴급 신호) */
  alwaysPick?: boolean;
  /** 실제 전송. TODO: 서버 전송 API 연결 */
  onSend: (signal: Signal) => void;
  onClose: () => void;
};

// 신호 보내기 확인 시트: (고르기) → 확인 → 보냄(응답 대기)
export function SendSignalSheet({
  visible,
  recipientName,
  candidates,
  pickTitle = '신호 고르기',
  alwaysPick = false,
  onSend,
  onClose,
}: SendSignalSheetProps) {
  const [picked, setPicked] = useState<Signal | null>(null);
  const [sent, setSent] = useState(false);
  const signal = picked ?? (!alwaysPick && candidates.length === 1 ? candidates[0] : null);

  const close = () => {
    setPicked(null);
    setSent(false);
    onClose();
  };

  const send = () => {
    if (!signal) return;
    onSend(signal);
    setSent(true);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={close} accessibilityRole="button" accessibilityLabel="닫기" />
        <BottomSheet>
          <Stack gap={4}>
            {!signal ? (
              <>
                <Text variant="heading" accessibilityRole="header">
                  {pickTitle}
                </Text>
                <View>
                  {candidates.map((s, i) => (
                    <ListRow
                      key={s.id}
                      icon={s.icon}
                      title={s.name}
                      subtitle={describeRhythm(s.beats)}
                      divider={i > 0}
                      onPress={() => setPicked(s)}
                      accessibilityLabel={`${s.name}, ${describeRhythm(s.beats)}`}
                    />
                  ))}
                </View>
                <Button label="취소" variant="text" underline={false} onPress={close} />
              </>
            ) : sent ? (
              <>
                <StatusMessage icon="send">{`'${signal.name}' 신호를 보냈어요`}</StatusMessage>
                <StatusChip status="waiting" />
                <Button label="확인" onPress={close} />
              </>
            ) : (
              <>
                <Text variant="heading" accessibilityRole="header">
                  {`'${signal.name}' 신호를 보낼까요?`}
                </Text>
                <Row gap={3} style={styles.preview}>
                  <Icon name={signal.icon} size={24} />
                  <Text variant="bodyStrong" style={styles.flex}>
                    {signal.name}
                  </Text>
                  <Rhythm beats={signal.beats} size="sm" />
                </Row>
                <Text variant="caption" color="textSecondary">
                  {`${recipientName}의 휴대폰에 이 진동이 울려요.`}
                </Text>
                <Stack gap={2}>
                  <Button label="보내기" icon="send" onPress={send} />
                  <Button label="취소" variant="text" underline={false} onPress={close} />
                </Stack>
              </>
            )}
          </Stack>
        </BottomSheet>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.ink900,
    opacity: 0.4,
  },
  preview: {
    padding: space[3],
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSunken,
  },
});
