import { useEffect, useState } from 'react';

import { Button, Card, Icon, Row, Rhythm, Screen, SignalBadge, Stack, Text } from '@/components';
import {
  AddSignalHeader,
  FeelButton,
  PlayCircleButton,
  StepIntro,
  beatSchedule,
  formatRhythmLength,
} from '@/features/addSignal';
import type { Signal } from '@/features/signals';
import { colors, describeRhythm, radius, space, type Pulses } from '@/theme';

type Props = {
  signal: Pick<Signal, 'name' | 'icon' | 'source' | 'beats' | 'pulses'>;
  recipientName: string;
  /** 당사자 진동 설정 요약 (예: '세기 강하게 · 반복 2번') */
  recipientVibration: string;
  onBack: () => void;
  onClose: () => void;
  /** 직접 만든 신호만. 목록에서 고른 기본 신호는 리듬을 바꾸지 않는다 */
  onChangeRhythm?: () => void;
  /** 보호자 휴대폰에서 진동 재생 */
  onVibrate: (pulses: Pulses) => void;
  onSave: () => void;
  busy?: boolean; error?: string;
};

/** 화면의 리듬 그림을 박자 순서대로 진하게 (진동과 같은 시간표) */
function usePlayback(pulses: Pulses) {
  const [run, setRun] = useState(0);
  const [playingIndex, setPlayingIndex] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (run === 0) return;
    const { starts, end } = beatSchedule(pulses);
    const timers = starts.map((t, i) => setTimeout(() => setPlayingIndex(i), t));
    timers.push(setTimeout(() => setPlayingIndex(undefined), end));
    return () => timers.forEach(clearTimeout);
  }, [run, pulses]);

  return { playingIndex, play: () => setRun((n) => n + 1) };
}

// 10-6 신호 추가 3 · 진동 체험 (design/screens/Add3Feel.dc.html)
export default function AddSignalFeelScreen({
  signal,
  recipientName,
  recipientVibration,
  onBack,
  onClose,
  onChangeRhythm,
  onVibrate,
  onSave,
  busy, error,
}: Props) {
  const { playingIndex, play } = usePlayback(signal.pulses);

  const feel = () => {
    onVibrate(signal.pulses);
    play();
  };

  return (
    <Screen
      scroll
      gap={4}
      header={<AddSignalHeader onBack={onBack} onClose={onClose} />}
      footer={
        <Row gap={3}>
          {onChangeRhythm && (
            <Button label="리듬 바꾸기" variant="secondary" size="sm" onPress={onChangeRhythm} style={{ flex: 1 }} />
          )}
          <Button label={busy ? '저장 중…' : '저장하기'} disabled={busy} variant="dark" size="sm" onPress={onSave} style={{ flex: 1.4 }} />
        </Row>
      }
    >
      <StepIntro step={3} eyebrow="3단계 · 진동 체험" title="직접 느껴 보세요" />
      {error && <Text accessibilityRole="alert">{error}</Text>}

      <Card style={{ padding: space[5] }}>
        <Stack gap={5} accessibilityLabel="만든 리듬">
          <Row gap={2}>
            <Icon name={signal.icon} size={24} />
            <Text variant="heading" style={{ flex: 1 }}>
              {signal.name}
            </Text>
            <SignalBadge type={signal.source} />
          </Row>

          <Stack gap={3} align="center" paddingY={5} style={{ borderRadius: radius.md, backgroundColor: colors.surfaceSunken }}>
            <Rhythm beats={signal.beats} size="lg" playingIndex={playingIndex} />
            <Text variant="small" color="textSecondary" accessibilityLiveRegion="polite">
              {playingIndex !== undefined ? `재생 중 · ${playingIndex + 1}번째 진동` : describeRhythm(signal.beats)}
            </Text>
          </Stack>

          <Row justify="space-between">
            <Row gap={2}>
              <Icon name="timer" size={18} strokeWidth={2.2} />
              <Text variant="body">
                {'길이 '}
                <Text variant="bodyStrong">{formatRhythmLength(signal.pulses)}</Text>
              </Text>
            </Row>
            <PlayCircleButton accessibilityLabel="리듬 화면에서 다시 보기" onPress={play} />
          </Row>

          <FeelButton label="이 폰에서 느껴보기" onPress={feel} />
        </Stack>
      </Card>

      <Text variant="caption" color="textSecondary">
        {`${recipientName}의 휴대폰에서는 ${recipientName}의 진동 설정(${recipientVibration})에 맞춰 울려요.`}
      </Text>
    </Screen>
  );
}
