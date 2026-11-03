import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Chip, Grid, Icon, IconButton, Screen, ScreenTitle, Stack, Text } from '@/components';
import {
  formatDateLabel,
  formatDateSpoken,
  isNoReply,
  matchesFilter,
  shiftDateKey,
  todayKey,
  type HistoryFilter,
  type HistoryRecord,
} from '@/features/history';
import { RecordCard } from '@/features/history/RecordCard';
import { RecordLegend } from '@/features/history/RecordLegend';
import { colors, radius, space } from '@/theme';

type Props = {
  recipientName: string;
  records: readonly HistoryRecord[];
  onOpenRecord: (id: string) => void;
  onResend: (id: string) => void;
};

// 08-1 신호 기록 (design/screens/LogList.dc.html)
export default function HistoryListScreen({ recipientName, records, onOpenRecord, onResend }: Props) {
  const today = todayKey();
  const [date, setDate] = useState(today);
  const [filter, setFilter] = useState<HistoryFilter>('all');

  const ofDay = useMemo(() => records.filter((r) => r.date === date), [records, date]);
  const visible = ofDay.filter((r) => matchesFilter(r, filter));
  const noReplyCount = ofDay.filter(isNoReply).length;
  const isToday = date === today;

  return (
    <Screen gutter="tab" inTabs scroll paddingTop={6} gap={3}>
      <ScreenTitle title="신호 기록" description={`${recipientName}과 주고받은 신호`} />

      <Stack gap={3} style={styles.controls}>
        <View style={styles.dateBar}>
          <IconButton
            icon="back"
            size={22}
            strokeWidth={2.5}
            accessibilityLabel="이전 날짜"
            onPress={() => setDate((d) => shiftDateKey(d, -1))}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`날짜 고르기, ${formatDateSpoken(date)}${isToday ? ' 오늘' : ''}`}
            // TODO: 달력 열기 (오늘 이후 날짜는 고를 수 없게)
            onPress={() => {}}
            style={styles.dateButton}
          >
            <Icon name="calendar" size={20} strokeWidth={2.2} />
            <Text variant="bodyStrong">
              {formatDateLabel(date)}
              {isToday ? ' · 오늘' : ''}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isToday ? '다음 날짜, 오늘 이후 기록 없음' : '다음 날짜'}
            accessibilityState={{ disabled: isToday }}
            disabled={isToday}
            onPress={() => setDate((d) => shiftDateKey(d, 1))}
            style={styles.navButton}
          >
            <Icon
              name="chevron-right"
              size={22}
              strokeWidth={2.5}
              color={isToday ? colors.textDisabled : colors.textPrimary}
            />
          </Pressable>
        </View>

        <Grid columns={2} gap={2}>
          <Chip label={`전체 ${ofDay.length}`} selected={filter === 'all'} onPress={() => setFilter('all')} />
          <Chip
            label={`응답 없음 ${noReplyCount}`}
            selected={filter === 'noReply'}
            onPress={() => setFilter('noReply')}
          />
        </Grid>
      </Stack>

      <Stack gap={3} style={styles.list}>
        {visible.length === 0 ? (
          <Text color="textSecondary">이 날은 주고받은 신호가 없어요.</Text>
        ) : (
          visible.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              recipientName={recipientName}
              onPress={() => onOpenRecord(record.id)}
              onResend={() => onResend(record.id)}
            />
          ))
        )}
      </Stack>

      <RecordLegend />
    </Screen>
  );
}

const styles = StyleSheet.create({
  controls: { paddingTop: space[2] },
  list: { paddingTop: space[2] },

  dateBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[1],
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  dateButton: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
  },
  navButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
