import { Button, Card, Icon, InfoBox, Rhythm, Row, Screen, SignalBadge, Stack, Text } from '@/components';
import { SignalIconBox, StepIntro, SuccessCircle, formatRhythmLength } from '@/features/addSignal';
import { signalCategoryLabel, type Signal } from '@/features/signals';
import { describeRhythm } from '@/theme';

type Props = {
  signal: Signal;
  recipientName: string;
  /** 연습 모드(이 신호부터) */
  onTeachNow: () => void;
  onLater: () => void;
};

// 10-7 신호 추가 4 · 저장 완료 (design/screens/Add5Done.dc.html)
export default function AddSignalDoneScreen({ signal, recipientName, onTeachNow, onLater }: Props) {
  const length = formatRhythmLength(signal.pulses);
  const category = signalCategoryLabel[signal.category];

  return (
    <Screen
      scroll
      paddingTop={10}
      gap={5}
      footer={
        <Stack gap={1}>
          <Button label="지금 알려주기" trailingIcon="arrow-right" onPress={onTeachNow} />
          <Button label="나중에 할게요" variant="text" underline={false} onPress={onLater} />
        </Stack>
      }
    >
      <StepIntro step={4} />

      <Stack gap={4} align="center" accessible accessibilityLiveRegion="polite" accessibilityLabel="신호가 추가되었습니다">
        <SuccessCircle size={84} />
        <Text variant="title2" accessibilityRole="header" style={{ textAlign: 'center' }}>
          신호가 추가되었습니다
        </Text>
      </Stack>

      <Stack gap={4}>
        <Card>
          <Row
            gap={4}
            accessible
            accessibilityLabel={`추가된 신호, ${signal.name}, ${signal.source === 'custom' ? '직접' : '기본'}, 연습 전, ${describeRhythm(signal.beats)}, ${category}, ${length}`}
          >
            <SignalIconBox icon={signal.icon} />
            <Stack flex gap={2}>
              <Row gap={2} wrap>
                <Text variant="heading">{signal.name}</Text>
                <SignalBadge type={signal.source} />
                {signal.untrained && <SignalBadge type="untrained" />}
              </Row>
              <Row gap={3} wrap>
                <Rhythm beats={signal.beats} size="md" />
                <Text variant="small" color="textSecondary">
                  {`${category} · ${length}`}
                </Text>
              </Row>
            </Stack>
          </Row>
        </Card>

        <InfoBox tone="brand">
          <Row gap={3} align="flex-start" paddingY={1}>
            <Icon name="book" size={26} />
            <Stack flex gap={1}>
              <Text variant="heading" accessibilityRole="header">
                {`${recipientName}은 이 신호를 아직 몰라요`}
              </Text>
              <Text variant="caption">
                {"연습 모드에서 함께 느껴 보며 알려 줘야 실제로 쓸 수 있어요. 익히기 전에는 신호 목록에 '연습 전'으로 표시돼요."}
              </Text>
            </Stack>
          </Row>
        </InfoBox>
      </Stack>
    </Screen>
  );
}
