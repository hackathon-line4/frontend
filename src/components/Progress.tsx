import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

type StepProps = {
  total: number;
  /** 1부터 */
  current: number;
};

export function StepBar({ total, current }: StepProps) {
  return (
    <View
      style={styles.stepBar}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${total}단계 중 ${current}단계`}
      accessibilityValue={{ min: 1, max: total, now: current }}
    >
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.step, { backgroundColor: i < current ? colors.ink900 : colors.line }]} />
      ))}
    </View>
  );
}

// 현재 = 24×8 막대, 나머지 = 8×8 점 (모양 + 명도로 구분)
export function PageDots({ total, current }: StepProps) {
  return (
    <View
      style={styles.dots}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${total}페이지 중 ${current}페이지`}
    >
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.dot, i === current - 1 ? styles.dotActive : styles.dotIdle]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stepBar: {
    flexDirection: 'row',
    gap: 4,
  },
  step: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: { width: 24, backgroundColor: colors.ink900 },
  dotIdle: { width: 8, backgroundColor: colors.lineStrong },
});
