import { Button, DefinitionList, Icon, ListRow, Row, Screen, ScreenHeader, ScreenTitle, Stack, Text } from '@/components';
import {
  formatDateLabel,
  formatDuration,
  hhmm,
  responseStatus,
  type HelpRequestRecord,
  type SignalRecord,
} from '@/features/history';
import { RecordSection, TimelineRow } from '@/features/history/RecordSection';

type Props = {
  record: SignalRecord;
  recipientName: string;
  /** 이 신호와 관련된 도움 요청 */
  relatedHelp?: HelpRequestRecord;
  onBack: () => void;
  onOpenRecord: (id: string) => void;
  onSendAgain: () => void;
};

// 08-2 신호 기록 상세 (design/screens/LogDetail.dc.html)
// '기기 전달'과 '터치 응답'은 다른 상자로 나눠 보여 준다.
export default function HistoryDetailScreen({
  record,
  recipientName,
  relatedHelp,
  onBack,
  onOpenRecord,
  onSendAgain,
}: Props) {
  return (
    <Screen
      scroll
      header={<ScreenHeader title="신호 기록" onBack={onBack} />}
      footer={<Button label="이 신호 다시 보내기" variant="secondary" size="sm" onPress={onSendAgain} />}
      paddingTop={3}
      gap={5}
    >
      <Stack gap={1}>
        <ScreenTitle title={record.name} description={record.meaning} />
        <Text variant="caption" color="textSecondary">
          {formatDateLabel(record.date)} · {recipientName}에게
        </Text>
      </Stack>

      <Stack gap={3}>
        <DeliverySection record={record} />
        <ResponseSection record={record} />

        <RecordSection title="관련 도움 요청 · 위치 공유" gap={2}>
          {relatedHelp ? (
            <ListRow
              title={`도움 요청 · ${hhmm(relatedHelp.sentAt)} 받음`}
              subtitle={relatedHelp.location ? '위치 함께 공유됨' : undefined}
              onPress={() => onOpenRecord(relatedHelp.id)}
            />
          ) : (
            <Text variant="caption" color="textSecondary">
              이 신호와 관련된 기록이 없어요.
            </Text>
          )}
        </RecordSection>
      </Stack>

      <Text variant="caption" color="textSecondary">
        터치 응답은 당사자가 화면을 터치한 기록이에요. 신호의 뜻을 알아들었다는 뜻은 아니에요.
      </Text>
    </Screen>
  );
}

function DeliverySection({ record }: { record: SignalRecord }) {
  const { delivery } = record;
  return (
    <RecordSection title="기기 전달">
      <TimelineRow icon={delivery.kind === 'requesting' ? 'pending' : 'check'} label="보냄" time={record.sentAt} />
      {delivery.kind === 'requesting' && <TimelineRow icon="pending" label="전송 요청 중" />}
      {delivery.kind === 'failed' && <TimelineRow icon="warning" label={`전송 실패 · ${delivery.reason}`} />}
      {delivery.kind === 'unknown' && <TimelineRow icon="sig-question" label="전달 확인 안 됨" />}
      {delivery.kind === 'delivered' && (
        <>
          <TimelineRow icon="check" label="기기에 전달 완료" time={delivery.at} />
          {delivery.vibratedAt && <TimelineRow icon="check" label="진동 재생 (기기 보고)" time={delivery.vibratedAt} />}
        </>
      )}
    </RecordSection>
  );
}

function ResponseSection({ record }: { record: SignalRecord }) {
  const { response } = record;
  const status = responseStatus(record);

  if (!response) {
    return (
      <RecordSection title="터치 응답" gap={2}>
        <Text color="textSecondary">{status.text}</Text>
      </RecordSection>
    );
  }

  const label = { waiting: '응답 대기 중', replied: '응답 완료', noReply: '응답 없음' }[response.kind];
  const details: [string, string][] =
    response.kind === 'replied'
      ? [
          ['응답 시각', response.at],
          ['걸린 시간', `전달 후 ${formatDuration(response.afterSec)}`],
        ]
      : response.kind === 'waiting'
        ? [['기다린 시간', `전달 후 ${response.elapsedMin}분`]]
        : [['기다린 시간', `${response.waitMin}분 동안 터치 없음`]];

  return (
    <RecordSection title="터치 응답" tone={response.kind === 'noReply' ? 'dashed' : 'strong'}>
      <Row gap={2} accessible accessibilityLabel={label} accessibilityLiveRegion="polite">
        {status.icon && <Icon name={status.icon} size={22} strokeWidth={2.4} />}
        <Text variant="heading">{label}</Text>
      </Row>
      <DefinitionList items={details} />
    </RecordSection>
  );
}
