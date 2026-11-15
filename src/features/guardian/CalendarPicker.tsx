import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { BottomSheet, Button, Grid, IconButton, Row, Stack, Text } from '@/components';
import { monthCells, shiftMonth } from '@/features/history/calendar';
import { todayKey } from '@/features/history/date';
import { colors } from '@/theme';
import { guardianStore } from './client';
import { useGuardianState } from './hooks';

export function CalendarPicker({ date, onSelect, onClose }: { date: string; onSelect: (date: string) => void; onClose: () => void }) {
  const { data, scope } = useGuardianState();
  const [month, setMonth] = useState(date.slice(0, 7));
  const key = scope?.key;
  useFocusEffect(useCallback(() => {
    if (!key) return;
    void guardianStore.loadCalendar(month);
    return guardianStore.watchCalendar(month);
  }, [key, month]));
  const calendar = data?.calendars[month];
  const error = data?.errors[`calendar:${month}`];
  const today = todayKey();
  return <Modal transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.root}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="달력 닫기" />
      <BottomSheet><Stack gap={3}>
        <Row justify="space-between"><IconButton icon="back" accessibilityLabel="이전 달" onPress={() => setMonth(m => shiftMonth(m, -1))} /><Text variant="heading">{month.replace('-', '년 ')}월</Text><IconButton icon="chevron-right" accessibilityLabel="다음 달" disabled={month >= today.slice(0, 7)} onPress={() => setMonth(m => shiftMonth(m, 1))} /></Row>
        {error ? <><Text accessibilityRole="alert">{error}</Text><Button label="다시 시도" onPress={() => { void guardianStore.loadCalendar(month, true); }} /></> : !calendar ? <Text>기록이 있는 날짜를 불러오는 중이에요.</Text> : <>
          <Grid columns={7} gap={0}>{['일', '월', '화', '수', '목', '금', '토'].map(day => <Text key={day} style={styles.day}>{day}</Text>)}</Grid>
          <Grid columns={7} gap={0}>{monthCells(month).map((cell, index) => {
            const record = calendar.days.find(day => day.date === cell);
            return cell ? <Pressable key={cell} disabled={cell > today} accessibilityRole="button"
              accessibilityLabel={`${cell}, 기록 ${record?.count ?? 0}개${record?.hasNoResponse ? ', 응답 없음 포함' : ''}`}
              accessibilityState={{ selected: cell === date, disabled: cell > today }} onPress={() => onSelect(cell)}
              style={[styles.cell, cell === date && styles.selected, cell > today && styles.disabled]}>
              <Text variant={cell === date ? 'bodyStrong' : 'body'}>{Number(cell.slice(-2))}</Text>
              <Text variant="small">{record ? record.hasNoResponse ? '주의' : '●' : ' '}</Text>
            </Pressable> : <View key={`empty-${index}`} style={styles.cell} />;
          })}</Grid>
          <Text variant="small">● 기록 있음 · 주의: 터치 응답 없음 포함</Text>
        </>}
        <Button label="닫기" variant="text" onPress={onClose} />
      </Stack></BottomSheet>
    </View>
  </Modal>;
}
const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' }, backdrop: { ...StyleSheet.absoluteFill, backgroundColor: '#0006' },
  cell: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  selected: { backgroundColor: colors.yellow100 }, disabled: { opacity: 0.3 }, day: { textAlign: 'center' },
});
