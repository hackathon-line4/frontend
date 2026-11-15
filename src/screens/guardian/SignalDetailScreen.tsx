import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Button, Card, IconButton, Rhythm, Row, Screen, ScreenHeader, ScreenTitle, Stack, StatusMessage, Tag, Text } from '@/components';
import { BackTextButton, rhythmSeconds, SendSignalSheet, SignalIconBox } from '@/features/home';
import type { Signal } from '@/features/signals';
import type { GuardianMessage } from '@/features/guardian/types';
import { space } from '@/theme';

type Props = {
  /** 없으면 '찾을 수 없음' 표시 */
  signal: Signal | undefined;
  recipientName: string;
  onBack: () => void;
  /** 알려주기: 당사자 휴대폰에 연습용으로 울림 (응답 요구 없음, 기록에는 '연습'으로 남김) */
  onTeach?: (signal: Signal) => void;
  /** 실제 신호 전송 → 응답 대기 */
  onSend: (signal: Signal, abort?: AbortSignal) => Promise<GuardianMessage>;
  /** 이름 · 설명 · 카테고리 수정 (기본 신호는 이름 잠금) */
  onEdit?: (signal: Signal) => void;
  /** 삭제 (확인 창은 화면 밖에서) */
  onDelete?: (signal: Signal) => void;
  /** 자주 쓰는 신호(홈 · 최대 6개) */
  favorite?: { on: boolean; onToggle: () => void };
  /** 화면 아래 안내 (자주 쓰는 신호 6개 초과 등) */
  notice?: string;
};

// 05-4 신호 상세 · 알려주기 (design/screens/SignalDetail.dc.html)
export default function SignalDetailScreen({ signal, recipientName, onBack, onTeach, onSend, onEdit, onDelete, favorite, notice }: Props) {
  const [taught, setTaught] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!signal) {
    return (
      <Screen header={<ScreenHeader onBack={onBack} />} paddingTop={6}>
        <ScreenTitle title="신호를 찾을 수 없어요" description="목록에서 다시 골라 주세요." />
      </Screen>
    );
  }

  const isCustom = signal.source === 'custom';

  return (
    <Screen
      header={
        // 수정 · 삭제는 자주 쓰지 않으므로 오른쪽 위 구석에 아이콘으로
        <Row justify="space-between" align="center">
          <BackTextButton onPress={onBack} />
          <Row gap={1}>
            {favorite && (
              <IconButton
                icon={favorite.on ? 'star-on' : 'star'}
                accessibilityLabel={favorite.on ? '자주 쓰는 신호에서 빼기' : '자주 쓰는 신호에 추가'}
                onPress={favorite.onToggle}
              />
            )}
            {onEdit && <IconButton icon="pencil" accessibilityLabel="신호 수정" onPress={() => onEdit(signal)} />}
            {onDelete && <IconButton icon="trash" accessibilityLabel="신호 삭제" onPress={() => onDelete(signal)} />}
          </Row>
        </Row>
      }
      scroll
      paddingTop={6}
      gap={7}
      footer={
        <Stack gap={4}>
          {onTeach && <Stack gap={2}>
            <Button
              label="알려주기"
              icon="vibrate"
              accessibilityHint={`${recipientName}의 휴대폰에 이 진동이 울려요. 옆에서 뜻을 알려 주세요.`}
              onPress={() => {
                onTeach(signal);
                setTaught(true);
              }}
            />
            <Text variant="caption" color="textSecondary" style={styles.center}>
              {`${recipientName}의 휴대폰에 이 진동이 울려요.\n옆에서 뜻을 알려 주세요.`}
            </Text>
          </Stack>}
          <Button label="신호 보내기" icon="send" variant="secondary" onPress={() => setSheetOpen(true)} />
        </Stack>
      }
    >
      <Stack gap={3} align="center">
        <SignalIconBox icon={signal.icon} />
        <ScreenTitle title={signal.name} size={30} align="center" />
        {signal.description && <Text>{signal.description}</Text>}
        <Tag
          icon={isCustom ? 'pencil' : 'book'}
          label={isCustom ? '직접 만든 신호' : '기본 신호'}
          tone={isCustom ? 'dark' : 'brand'}
        />
      </Stack>

      <Card style={styles.rhythmCard}>
        <Stack gap={4} align="center">
          <Text variant="label" color="textSecondary" accessibilityRole="header" style={styles.start}>
            진동 리듬
          </Text>
          <Rhythm beats={signal.beats} size="lg" />
          <Text variant="caption" color="textSecondary">
            {`약 ${rhythmSeconds(signal.pulses)}초`}
          </Text>
        </Stack>
      </Card>

      {notice && <StatusMessage icon="info">{notice}</StatusMessage>}
      {taught && <StatusMessage icon="vibrate">{`${recipientName}의 휴대폰에 연습 진동을 보냈어요`}</StatusMessage>}

      <SendSignalSheet
        visible={sheetOpen}
        recipientName={recipientName}
        candidates={[signal]}
        onSend={onSend}
        onClose={() => setSheetOpen(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  rhythmCard: {
    padding: space[5],
  },
  start: {
    alignSelf: 'flex-start',
  },
  center: {
    textAlign: 'center',
  },
});
