import { Button, InfoBox, Row, Screen, ScreenHeader, ScreenTitle, Stack, Text } from '@/components';
import { DeliveryTimeline, NoReplyPill, type NoReplyRecord } from '@/features/home';

type Props = {
  record: NoReplyRecord;
  onBack: () => void;
  onResend: () => void;
  onKeepWaiting: () => void;
  busy?: boolean; error?: string; canResend?: boolean; canExtendWait?: boolean;
};

// 05-5 보호자 · 응답 없음 (design/screens/GuardianNoReply.dc.html)
// 화면 터치가 확인되지 않았다는 사실만 보여 준다. 위험으로 단정하지 않음.
export default function GuardianNoReplyScreen({ record, onBack, onResend, onKeepWaiting, busy, error, canResend = true, canExtendWait = true }: Props) {
  return (
    <Screen
      header={<ScreenHeader title="신호 기록" onBack={onBack} />}
      scroll
      paddingTop={3}
      gap={6}
      footer={
        <>
          {error && <Text accessibilityRole="alert">{error}</Text>}
          <Button label={busy ? '처리 중…' : '다시 보내기'} disabled={busy || !canResend} icon="retry" onPress={onResend} />
          {canExtendWait && <Button disabled={busy} label="더 기다리기" variant="secondary" size="sm" onPress={onKeepWaiting} />}
        </>
      }
    >
      <Stack gap={1}>
        <Row justify="space-between" gap={3}>
          <ScreenTitle title={record.signalName} />
          <NoReplyPill />
        </Row>
        <Text variant="label" color="textSecondary">
          {`${record.recipientName}에게 · ${record.sentAtLabel}`}
        </Text>
      </Stack>

      <Stack gap={4}>
        <DeliveryTimeline steps={record.steps} />
        <InfoBox>
          <Stack gap={2}>
            <Text variant="caption">
              화면 터치가 확인되지 않았다는 뜻이에요. 위험한 상황이거나 신호를 못 느꼈다고 단정할 수는 없어요.
            </Text>
            <Text variant="caption" color="textSecondary">
              {`'응답'은 화면을 터치했다는 뜻이에요. 신호의 뜻을 이해했다는 뜻은 아니에요.`}
            </Text>
          </Stack>
        </InfoBox>
      </Stack>
    </Screen>
  );
}
