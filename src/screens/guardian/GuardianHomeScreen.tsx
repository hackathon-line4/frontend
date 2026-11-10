import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Grid, IconButton, ListRow, Logo, Row, Screen, SignalTile, Stack, StatusChip } from '@/components';
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

type Props = {
  recipient: RecipientStatus;
  /** 자주 쓰는 신호 (2×3, 최대 6개) */
  frequentSignals: readonly Signal[];
  /** 긴급 신호 고르기 목록 */
  emergencySignals: readonly Signal[];
  location: RecipientLocation;
  recentActivity: readonly Activity[];
  onSendSignal: (signal: Signal) => void;
  onOpenNotifications: () => void;
  onOpenSignals: () => void;
  onAddSignal: () => void;
  onOpenLocation: () => void;
  onOpenHistory: () => void;
  onOpenRecord: (id: string) => void;
  onOpenNoReply: () => void;
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
}: Props) {
  const [sheet, setSheet] = useState<SheetState>(null);

  return (
    <Screen
      gutter="tab"
      inTabs
      scroll
      gap={6}
      footer={
        <Button
          variant="emergency"
          label="긴급 신호"
          trailingIcon="chevron-right"
          onPress={() => setSheet({ candidates: emergencySignals, emergency: true })}
        />
      }
    >
      <Row justify="space-between" style={styles.header}>
        <Logo size="sm" />
        <IconButton icon="bell" accessibilityLabel="알림" onPress={onOpenNotifications} />
      </Row>

      <RecipientStatusCard status={recipient} onPressNoReply={onOpenNoReply} />

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
          <DashedButton icon="plus" label="신호 추가하기" onPress={onAddSignal} />
        </Stack>
      </Card>

      <LocationPreviewCard location={location} onPressDetail={onOpenLocation} />

      <Card>
        <SectionHeader title="최근 활동" linkLabel="전체 기록" onPressLink={onOpenHistory} />
        <View>
          {recentActivity.slice(0, 3).map((item) => (
            <ListRow
              key={item.id}
              title={item.signalName}
              subtitle={`${item.sentAt} 보냄`}
              divider
              trailing={<StatusChip status={item.status} />}
              onPress={() => (item.status === 'noReply' ? onOpenNoReply() : onOpenRecord(item.id))}
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
});
