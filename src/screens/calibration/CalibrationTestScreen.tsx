import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Stack, Text } from '@/components';
import {
  FIXED_REPEAT,
  ProgressPill,
  TEST_LEAD_IN_MS,
  TestMark,
  playTestSignal,
  stopTestSignal,
  summarize,
  testStepMs,
  type CalibrationValues,
} from '@/features/calibration';
import { useRoleScale } from '@/features/session';
import { colors, screen, space } from '@/theme';

type Props = {
  values: CalibrationValues;
  /** 반복을 모두 재생하면 (자동) */
  onFinish: () => void;
  onStop: () => void;
};

// 06-2 진동 테스트 중 · 두 역할 공통 (design/screens/Calib2.dc.html)
// 화면 전체 노란 배경 + 진행('2번 중 1번째'). 끝나면 자동으로 06-3.
export default function CalibrationTestScreen({ values, onFinish, onStop }: Props) {
  const scale = useRoleScale();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const finishRef = useRef(onFinish);
  useEffect(() => {
    finishRef.current = onFinish;
  }, [onFinish]);

  // 테스트는 항상 2번 (반복 횟수 설정은 없앰)
  const total = FIXED_REPEAT;
  const progress = `${total}번 중 ${step}번째`;
  const summary = summarize(values);

  useEffect(() => {
    // 스크린리더 안내는 진동 시작 전에 끝낸다
    AccessibilityInfo.announceForAccessibility(`진동 테스트 중. 휴대폰을 손에 쥐고 느껴 보세요. ${summary}`);

    const timers: ReturnType<typeof setTimeout>[] = [];
    const stepMs = testStepMs(values);
    for (let i = 0; i < total; i++) {
      timers.push(
        setTimeout(() => {
          setStep(i + 1);
          playTestSignal(values);
        }, TEST_LEAD_IN_MS + i * stepMs),
      );
    }
    timers.push(setTimeout(() => finishRef.current(), TEST_LEAD_IN_MS + total * stepMs));

    return () => {
      timers.forEach(clearTimeout);
      stopTestSignal();
    };
    // 화면에 들어올 때 한 번만 시작 (값이 바뀌면 다시 테스트 화면을 연다)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top + space[6],
          paddingBottom: Math.max(insets.bottom, space[4]) + space[6],
        },
      ]}
    >
      <Stack
        flex
        gap={8}
        align="center"
        justify="center"
        accessible
        accessibilityLabel={`진동 테스트 중. ${progress}. ${summary}`}
      >
        <TestMark />
        <Stack gap={2} align="center">
          <Text variant={scale.isRecipient ? 'rTitle' : 'title1'} style={styles.center}>
            진동 테스트 중
          </Text>
          <Text variant={scale.bodyVariant} style={styles.center}>
            {'휴대폰을 손에 쥐고\n느껴 보세요'}
          </Text>
        </Stack>
        <Stack gap={3} align="center">
          <ProgressPill label={progress} />
          <Text variant={scale.isRecipient ? 'rBody' : 'body'} style={styles.center}>
            {summary}
          </Text>
        </Stack>
      </Stack>
      <Button label="테스트 멈추기" icon="stop" variant="light" size={scale.buttonSize} onPress={onStop} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.yellow500,
    paddingHorizontal: screen.gutterRecipient,
  },
  center: {
    textAlign: 'center',
  },
});
