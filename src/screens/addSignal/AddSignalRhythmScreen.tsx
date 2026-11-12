import { useState } from 'react';
import { AccessibilityInfo, View } from 'react-native';

import { Button, Card, Grid, Row, Screen, SegmentedTabs, Stack, Text } from '@/components';
import {
  AddSignalHeader,
  BeatAddButton,
  BeatSlot,
  MAX_BEATS,
  MIN_BEATS,
  OutlineAction,
  PresetCard,
  RhythmCheckMessage,
  StepIntro,
  beatAddedAnnouncement,
  formatBeatsLength,
  sameBeats,
} from '@/features/addSignal';
import type { Signal } from '@/features/signals';
import { beatLabel, beatsToPulses, samePulses, type Beat } from '@/theme';

type RhythmMode = 'preset' | 'tap';

const modeOptions: readonly { value: RhythmMode; label: string }[] = [
  { value: 'preset', label: '프리셋에서 고르기' },
  { value: 'tap', label: '직접 조합하기' },
];

const beatKinds: readonly Beat[] = ['S', 'M', 'L'];

type Props = {
  /** 만들고 있는 신호 이름 */
  name: string;
  presets: readonly (readonly Beat[])[];
  /** 이미 있는 신호: 같은 리듬은 쓸 수 없다 */
  signals: readonly Signal[];
  initialBeats: readonly Beat[];
  onBack: () => void;
  onClose: () => void;
  /** 박자 하나 · 리듬 전체를 보호자 휴대폰에서 울리기 */
  onPlay: (beats: readonly Beat[]) => void;
  onNext: (beats: readonly Beat[]) => void;
  busy?: boolean; error?: string;
  presetConflicts?: Record<string, string>;
};

// 10-4 리듬 프리셋 · 10-5 직접 조합하기 (design/screens/Add2Preset.dc.html · Add2Tap.dc.html)
export default function AddSignalRhythmScreen({
  name,
  presets,
  signals,
  initialBeats,
  onBack,
  onClose,
  onPlay,
  onNext,
  busy, error,
  presetConflicts = {},
}: Props) {
  // 진동이 완전히 같은 신호 (기본 신호와도 진동 배열로 비교)
  const usedBy = (beats: readonly Beat[]) => presetConflicts[beats.join('')] ?? signals.find((s) => samePulses(s.pulses, beatsToPulses(beats)))?.name;

  // 돌아왔을 때 고른 리듬을 그대로 보여 준다 (프리셋이면 프리셋 탭, 아니면 직접 조합 탭)
  const initialIsPreset = initialBeats.length === 0 || presets.some((p) => sameBeats(p, initialBeats));
  const [mode, setMode] = useState<RhythmMode>(initialIsPreset ? 'preset' : 'tap');
  const [preset, setPreset] = useState<readonly Beat[] | undefined>(() =>
    initialIsPreset && initialBeats.length > 0 && usedBy(initialBeats) === undefined ? initialBeats : undefined,
  );
  const [tapBeats, setTapBeats] = useState<readonly Beat[]>(initialIsPreset ? [] : initialBeats);

  const tapDuplicate = tapBeats.length >= MIN_BEATS ? usedBy(tapBeats) : undefined;
  const chosen = mode === 'preset' ? preset : tapBeats;
  const canNext =
    mode === 'preset'
      ? preset !== undefined && usedBy(preset) === undefined
      : tapBeats.length >= MIN_BEATS && tapDuplicate === undefined;

  const addBeat = (beat: Beat) => {
    if (tapBeats.length >= MAX_BEATS) return;
    const next = [...tapBeats, beat];
    setTapBeats(next);
    onPlay([beat]);
    AccessibilityInfo.announceForAccessibility(beatAddedAnnouncement(beat, next));
  };

  const removeLast = () => {
    const next = tapBeats.slice(0, -1);
    setTapBeats(next);
    AccessibilityInfo.announceForAccessibility(
      next.length > 0 ? `하나 지움, ${next.length}박자, ${formatBeatsLength(next)}` : '모두 지움',
    );
  };

  const clearAll = () => {
    setTapBeats([]);
    AccessibilityInfo.announceForAccessibility('모두 지움');
  };

  return (
    <Screen
      scroll
      gap={mode === 'preset' ? 4 : 3}
      header={<AddSignalHeader onBack={onBack} onClose={onClose} />}
      footer={
        <Button
          label={busy ? '리듬 확인 중…' : '다음 · 느껴 보기'}
          disabled={!canNext || busy}
          accessibilityHint={
            canNext
              ? undefined
              : tapDuplicate
                ? `'${tapDuplicate}'와 같은 리듬이에요`
                : mode === 'tap'
                  ? `박자를 ${MIN_BEATS}개 이상 넣어 주세요`
                  : '리듬을 골라 주세요'
          }
          onPress={() => chosen && onNext(chosen)}
        />
      }
    >
      <StepIntro
        step={2}
        eyebrow="2단계 · 진동 리듬 만들기"
        title={mode === 'preset' ? `'${name}'의 리듬` : undefined}
      />
      {error && <Text accessibilityRole="alert">{error}</Text>}
      <SegmentedTabs options={modeOptions} value={mode} onChange={setMode} />

      {mode === 'preset' ? (
        <Grid columns={2} gap={3}>
          {presets.map((beats) => {
            const key = beats.join('');
            return (
              <PresetCard
                key={key}
                beats={beats}
                length={formatBeatsLength(beats)}
                usedBy={usedBy(beats)}
                selected={preset !== undefined && sameBeats(preset, beats)}
                onPress={() => {
                  setPreset(beats);
                  onPlay(beats);
                }}
              />
            );
          })}
        </Grid>
      ) : (
        <Stack gap={5}>
          <Card>
            <Stack gap={3}>
              <Row justify="space-between">
                <Text variant="label" accessibilityRole="header">
                  만든 리듬
                </Text>
                <Text variant="small" color="textSecondary">
                  {`${tapBeats.length} / 최대 ${MAX_BEATS}박자 · ${formatBeatsLength(tapBeats)}`}
                </Text>
              </Row>
              <View
                accessible
                accessibilityLabel={
                  tapBeats.length > 0 ? tapBeats.map((b) => beatLabel[b]).join(', ') : '아직 넣은 박자가 없어요'
                }
              >
                <Grid columns={MAX_BEATS} gap={1}>
                  {Array.from({ length: MAX_BEATS }, (_, i) => (
                    <BeatSlot key={i} beat={tapBeats[i]} latest={i === tapBeats.length - 1} />
                  ))}
                </Grid>
              </View>
              <Row gap={2}>
                {tapBeats.length >= MIN_BEATS ? (
                  <RhythmCheckMessage duplicateOf={tapDuplicate} />
                ) : (
                  <Text variant="small" color="textSecondary" style={{ flex: 1 }}>
                    {`${MIN_BEATS}~${MAX_BEATS}박자로 만들어요`}
                  </Text>
                )}
                <OutlineAction
                  label="들어보기"
                  icon="play"
                  shape="pill"
                  disabled={tapBeats.length === 0}
                  onPress={() => onPlay(tapBeats)}
                />
              </Row>
            </Stack>
          </Card>

          <Stack gap={3}>
            <Text variant="label" accessibilityRole="header">
              박자 추가
            </Text>
            <Grid columns={3} gap={3}>
              {beatKinds.map((beat) => (
                <BeatAddButton
                  key={beat}
                  beat={beat}
                  disabled={tapBeats.length >= MAX_BEATS}
                  onPress={() => addBeat(beat)}
                />
              ))}
            </Grid>
            <Row gap={3}>
              <OutlineAction
                label="하나 지우기"
                icon="backspace"
                disabled={tapBeats.length === 0}
                onPress={removeLast}
              />
              <OutlineAction label="모두 지우기" icon="retry" disabled={tapBeats.length === 0} onPress={clearAll} />
            </Row>
          </Stack>
        </Stack>
      )}
    </Screen>
  );
}
