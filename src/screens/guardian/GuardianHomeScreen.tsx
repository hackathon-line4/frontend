import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Grid, Icon, IconButton, ListRow, Logo, Row, Screen, SignalTile, Stack, StatusChip, Text } from '@/components';
import { colors, radius, space } from '@/theme';
import {
  DashedButton,
  LocationPreviewCard,
  RecipientStatusCard,
  SectionHeader,
  SendSignalSheet,
  type Activity,
  type RecipientLocation,
  type RecipientStatus,
} from '@/features/home';
import type { Signal } from '@/features/signals';
import type { GuardianMessage } from '@/features/guardian/types';

type Props = {
  recipient: RecipientStatus;
  /** 자주 쓰는 신호 (2×3, 최대 6개) */
  frequentSignals: readonly Signal[];
  /** 긴급 신호 고르기 목록 */
  emergencySignals: readonly Signal[];
  location: RecipientLocation;
  recentActivity: readonly Activity[];
  onSendSignal: (signal: Signal, abort?: AbortSignal) => Promise<GuardianMessage>;
  onOpenNotifications: () => void;
  onOpenSignals: () => void;
  onAddSignal: () => void;
  onOpenLocation: () => void;
  onOpenHistory: () => void;
  onOpenRecord: (id: string) => void;
  onOpenNoReply: (id?: string) => void;
  refreshError?: string;
};

type SheetState = { candidates: readonly Signal[]; emergency?: boolean } | null;

// 05-1 보호자 홈 (design/screens/GuardianHome.dc.html)
export default function GuardianHomeScreen({
  recipient,
  frequentSignals,
  emergencySignals,
  location,
  recentActivity,
  onSendSignal,
  onOpenNotifications,
  onOpenSignals,
  onAddSignal,
  onOpenLocation,
  onOpenHistory,
  onOpenRecord,
  onOpenNoReply,
  refreshError,
}: Props) {
  const [sheet, setSheet] = useState<SheetState>(null);

  return (
    <Screen
      gutter="tab"
      inTabs
      scroll
      gap={6}
    >
      <Row justify="space-between" style={styles.header}>
        <Logo size="sm" />
        <IconButton icon="bell" accessibilityLabel="알림" onPress={onOpenNotifications} />
      </Row>

      <RecipientStatusCard status={recipient} onPressNoReply={() => onOpenNoReply()} />

      {/* 긴급 신호: 하단 고정 대신 콘텐츠 안의 카드로. 연한 빨강 면 + 빨간 테두리 · 경고 아이콘으로 강조 */}
      <Pressable
        onPress={() => setSheet({ candidates: emergencySignals, emergency: true })}
        accessibilityRole="button"
        accessibilityLabel="긴급 신호 보내기. 위험할 때 바로 보내요"
        style={({ pressed }) => [styles.emergency, pressed && styles.emergencyPressed]}
      >
        <View style={styles.emergencyIcon}>
          <Icon name="warning" size={22} color={colors.surface} strokeWidth={2.6} />
        </View>
        <View style={styles.flex}>
          <Text variant="heading" style={styles.emergencyTitle}>
            긴급 신호
          </Text>
          <Text variant="caption" color="dangerFg">
            위험할 때 바로 보내요
          </Text>
        </View>
        <Icon name="chevron-right" size={22} color={colors.dangerFg} strokeWidth={2.6} />
      </Pressable>
      {refreshError && <Text accessibilityRole="alert">{`${refreshError} 마지막으로 확인한 상태를 표시하고 있어요.`}</Text>}

      <Card>
        <Stack gap={4}>
          <SectionHeader title="자주 쓰는 신호" linkLabel="전체 보기" onPressLink={onOpenSignals} />
          <Grid columns={2} gap={3}>
            {frequentSignals.slice(0, 6).map((signal) => (
              <SignalTile
                key={signal.id}
                name={signal.name}
                icon={signal.icon}
                badge={signal.source}
                beats={signal.beats}
                onPress={() => setSheet({ candidates: [signal] })}
                style={styles.tile}
              />
            ))}
          </Grid>
          {!frequentSignals.length && <Text>아직 자주 쓰는 신호가 없어요. 전체 보기에서 신호를 골라 주세요.</Text>}
          <DashedButton icon="plus" label="신호 추가하기" onPress={onAddSignal} />
        </Stack>
      </Card>

      <LocationPreviewCard location={location} onPressDetail={onOpenLocation} />

      <Card>
        <SectionHeader title="최근 활동" linkLabel="전체 기록" onPressLink={onOpenHistory} />
        <View>
          {!recentActivity.length && <Text>아직 주고받은 신호가 없어요.</Text>}
          {recentActivity.slice(0, 3).map((item) => (
            <ListRow
              key={item.id}
              title={item.signalName}
              icon={item.received ? 'arrow-in' : 'arrow-out'}
              subtitle={`${item.received ? '받음' : '보냄'} · ${item.sentAt}`}
              divider
              trailing={<StatusChip status={item.status} />}
              onPress={() => (item.status === 'noReply' ? onOpenNoReply(item.id) : onOpenRecord(item.id))}
            />
          ))}
        </View>
      </Card>

      <SendSignalSheet
        visible={sheet !== null}
        recipientName={recipient.name}
        candidates={sheet?.candidates ?? []}
        pickTitle="긴급 신호 고르기"
        alwaysPick={sheet?.emergency}
        onSend={onSendSignal}
        onClose={() => setSheet(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 48,
  },
  tile: {
    flex: 1,
  },
  flex: { flex: 1 },
  emergency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: 72,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.emergency,
    backgroundColor: colors.dangerBg,
  },
  emergencyPressed: { opacity: 0.8 },
  emergencyIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.emergency,
  },
  emergencyTitle: { color: colors.dangerFg },
});
