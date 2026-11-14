import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Button, Card, Chip, IconButton, ListRow, Row, Screen, ScreenTitle, Stack, StatusChip, Text } from '@/components';
import { todayKey, shiftDateKey } from '@/features/history/date';
import { guardianStore } from './client';
import { GuardianFeedback } from './Feedback';
import { useGuardianState } from './hooks';
import { homeActivities } from './models';
import { CalendarPicker } from './CalendarPicker';

export default function GuardianHistory() {
  const { data, scope } = useGuardianState();
  const key = scope?.key;
  const [date, setDate] = useState(todayKey);
  const [onlyNoResponse, setOnlyNoResponse] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  useFocusEffect(useCallback(() => {
    if (!key) return;
    void guardianStore.loadHistory(date);
    return guardianStore.watchHistory(date);
  }, [date, key]));
  if (!scope) return <GuardianFeedback message="당사자를 먼저 연결해 주세요" />;
  const items = data?.histories[date];
  const activities = homeActivities({ recentActivities: items ?? [] });
  return <Screen gutter="tab" inTabs scroll paddingTop={6} gap={5}>
    <ScreenTitle title="신호 기록" description={`${data?.home?.recipient.name ?? '당사자'}과 주고받은 신호`} />
    <Row justify="space-between"><IconButton icon="back" accessibilityLabel="이전 날짜" onPress={() => setDate(d => shiftDateKey(d, -1))} /><Button variant="text" icon="calendar" label={date} onPress={() => setCalendarOpen(true)} /><IconButton icon="chevron-right" accessibilityLabel="다음 날짜" disabled={date >= todayKey()} onPress={() => setDate(d => shiftDateKey(d, 1))} /></Row>
    <Row gap={3}><Chip label="전체" selected={!onlyNoResponse} onPress={() => setOnlyNoResponse(false)} /><Chip label="응답 없음" selected={onlyNoResponse} onPress={() => setOnlyNoResponse(true)} /></Row>
    {data?.errors[`history:${date}`] ? <Stack gap={2}><Text accessibilityRole="alert">{data.errors[`history:${date}`]}</Text><Button label="다시 시도" onPress={() => { void guardianStore.loadHistory(date, true); }} /></Stack> : !items ? <Text>기록을 불러오는 중이에요.</Text> : <Card>
      {activities.filter(item => !onlyNoResponse || item.status === 'noReply').map(item => <ListRow key={item.id} title={item.signalName} subtitle={item.sentAt} divider
        trailing={<StatusChip status={item.status} />} onPress={() => router.push({ pathname: '/guardian/record/[id]', params: { id: item.id, kind: items.find(source => source.id === item.id)!.kind } })} />)}
      {(!items.length || (onlyNoResponse && !activities.some(item => item.status === 'noReply'))) && <Text>이 날은 해당하는 기록이 없어요.</Text>}
    </Card>}
    {calendarOpen && <CalendarPicker date={date} onSelect={next => { setDate(next); setCalendarOpen(false); }} onClose={() => setCalendarOpen(false)} />}
  </Screen>;
}
