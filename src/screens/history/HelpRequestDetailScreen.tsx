import { StyleSheet, View } from 'react-native';

import { Button, DefinitionList, Icon, ListRow, Row, Screen, ScreenHeader, ScreenTitle, Stack, Tag, Text } from '@/components';
import {
  deliveryStatus,
  hhmm,
  withSubject,
  type HelpRequestRecord,
  type SignalRecord,
} from '@/features/history';
import { RecordSection, TimelineRow } from '@/features/history/RecordSection';
import { colors, radius } from '@/theme';

type Props = {
  record: HelpRequestRecord;
  recipientName: string;
  /** 이후 주고받은 신호 */
  followUps: readonly SignalRecord[];
  onBack: () => void;
  onOpenRecord: (id: string) => void;
  onOpenMap: () => void;
};

// 08-3 도움 요청 기록 (design/screens/LogHelp.dc.html)
// 위치는 도움 요청과 함께 공유된 경우에만, 요청 순간 1회 위치만 보여 준다.
export default function HelpRequestDetailScreen({
  record,
  recipientName,
  followUps,
  onBack,
  onOpenRecord,
  onOpenMap,
}: Props) {
  const { location } = record;

  return (
    <Screen scroll header={<ScreenHeader title="신호 기록" onBack={onBack} />} paddingTop={3} gap={5}>
      <Stack gap={3}>
        <Tag label="당사자가 보낸 기록" icon="back" style={styles.tag} />
        <ScreenTitle title="도움 요청" description={`${withSubject(recipientName)} 화면을 3초 길게 눌러 보냈어요`} />
      </Stack>

      <Stack gap={3}>
        <RecordSection title="기록">
          <TimelineRow label="당사자가 보냄" time={record.sentAt} />
          <TimelineRow label="내 휴대폰에 도착" time={record.arrivedAt} />
          {record.openedAt && <TimelineRow label="내가 열어 봄" time={record.openedAt} />}
        </RecordSection>

        <RecordSection
          tone={location ? 'strong' : 'default'}
          heading={
            <Row gap={2} accessibilityRole="header">
              <Icon name="tab-location" size={20} strokeWidth={2.2} />
              <Text variant="bodyStrong">도움 요청과 함께 공유된 위치</Text>
            </Row>
          }
        >
          {location ? (
            <>
              {/* TODO: 실제 지도 (공유된 1회 위치에 핀 표시) */}
              <View accessible accessibilityRole="image" accessibilityLabel="지도 영역, 공유된 위치 표시" style={styles.map}>
                <Text variant="caption" color="textSecondary">
                  [지도 영역]
                </Text>
              </View>
              <DefinitionList
                items={[
                  ['주소', location.address],
                  ['기준 시각', location.at],
                  ['정확도', `약 ${location.accuracyM}m`],
                ]}
              />
              <Text variant="caption" color="textSecondary">
                요청한 순간의 위치 한 번만 공유돼요. 그 뒤의 위치는 공유되지 않아요.
              </Text>
              <Button label="지도 앱에서 열기" variant="secondary" size="sm" onPress={onOpenMap} />
            </>
          ) : (
            <Text variant="caption" color="textSecondary">
              이 요청과 함께 공유된 위치가 없어요.
            </Text>
          )}
        </RecordSection>

        <RecordSection title="이후 주고받은 신호" gap={1}>
          {followUps.length === 0 ? (
            <Text variant="caption" color="textSecondary">
              이후 주고받은 신호가 없어요.
            </Text>
          ) : (
            followUps.map((signal) => (
              <ListRow
                key={signal.id}
                title={`${signal.name} · ${hhmm(signal.sentAt)} 보냄`}
                subtitle={followUpSummary(signal)}
                onPress={() => onOpenRecord(signal.id)}
              />
            ))
          )}
        </RecordSection>
      </Stack>
    </Screen>
  );
}

/** '기기 전달 14:07 · 터치 응답 14:08' — 두 상태를 따로 적는다 */
function followUpSummary(signal: SignalRecord): string {
  const delivery =
    signal.delivery.kind === 'delivered' ? `기기 전달 ${hhmm(signal.delivery.at)}` : deliveryStatus(signal.delivery).text;
  if (!signal.response) return delivery;
  const response =
    signal.response.kind === 'replied'
      ? `터치 응답 ${hhmm(signal.response.at)}`
      : signal.response.kind === 'waiting'
        ? '응답 대기 중'
        : '응답 없음';
  return `${delivery} · ${response}`;
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.ink900,
  },
  map: {
    height: 160,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
