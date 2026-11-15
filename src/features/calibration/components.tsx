import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, Row, Stack, Text, type IconName } from '@/components';
import { useRoleScale } from '@/features/session';
import { colors, radius, space, type TypeVariant } from '@/theme';

// 06 진동 설정 화면에서만 쓰는 부품

/* ---------- StatusPill ---------- */

type StatusPillProps = {
  icon: IconName;
  label: string;
  /** brand: 노란 바탕 (바꾼 설정, 안내) · outline: 진한 테두리 (테스트 끝) · muted: 저장된 설정 */
  tone?: 'brand' | 'outline' | 'muted';
  /** 상태가 바뀌면 스크린리더가 읽음 (role=status) */
  live?: boolean;
};

export function StatusPill({ icon, label, tone = 'brand', live }: StatusPillProps) {
  return (
    <View
      accessible
      accessibilityLabel={label}
      accessibilityLiveRegion={live ? 'polite' : undefined}
      style={[styles.pill, pillTone[tone]]}
    >
      <Icon name={icon} size={18} strokeWidth={2.4} />
      <Text variant="label">{label}</Text>
    </View>
  );
}

/* ---------- StepperCard ---------- */

type StepperCardProps = {
  title: string;
  /** 제목 오른쪽 보조 글자 (예: 이 기기: 3단계까지) */
  note?: string;
  value: string;
  caption: string;
  decreaseLabel: string;
  increaseLabel: string;
  canDecrease: boolean;
  canIncrease: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
};

// 슬라이더 대신 − / + 버튼(64)과 단계값. 최소·최대에서는 버튼 비활성(점선 + 흐린 색) + '최소'/'최대' 라벨
export function StepperCard({
  title,
  note,
  value,
  caption,
  decreaseLabel,
  increaseLabel,
  canDecrease,
  canIncrease,
  onDecrease,
  onIncrease,
}: StepperCardProps) {
  return (
    <View style={styles.card}>
      <Stack gap={2}>
        <Row justify="space-between" align="baseline">
          <Text variant="heading" accessibilityRole="header">
            {title}
          </Text>
          {note && (
            <Text variant="caption" color="textSecondary">
              {note}
            </Text>
          )}
        </Row>
        <Row gap={3}>
          <StepButton icon="minus" label={decreaseLabel} limitLabel="최소" enabled={canDecrease} onPress={onDecrease} />
          <View
            accessible
            accessibilityLabel={`${title} ${value}, ${caption}`}
            accessibilityLiveRegion="polite"
            style={styles.value}
          >
            <Text variant="title2">{value}</Text>
            <Text variant="caption" color="textSecondary">
              {caption}
            </Text>
          </View>
          <StepButton icon="plus" label={increaseLabel} limitLabel="최대" enabled={canIncrease} onPress={onIncrease} />
        </Row>
      </Stack>
    </View>
  );
}

function StepButton({
  icon,
  label,
  limitLabel,
  enabled,
  onPress,
}: {
  icon: IconName;
  label: string;
  limitLabel: string;
  enabled: boolean;
  onPress: () => void;
}) {
  // 64 (calSpec). 당사자는 최소 터치 영역 72 이상
  const stepSize = Math.max(STEP_SIZE, useRoleScale().minTouch);
  return (
    <Pressable
      onPress={onPress}
      disabled={!enabled}
      accessibilityRole="button"
      accessibilityLabel={enabled ? label : `${label}, ${limitLabel}`}
      accessibilityState={{ disabled: !enabled }}
      style={({ pressed }) => [
        styles.step,
        { width: stepSize, height: stepSize },
        !enabled && styles.stepDisabled,
        pressed && enabled && styles.stepPressed,
      ]}
    >
      <Icon name={icon} size={enabled ? 28 : 22} strokeWidth={3} color={enabled ? colors.textPrimary : colors.borderInput} />
      {!enabled && (
        <Text variant="small" color="textSecondary">
          {limitLabel}
        </Text>
      )}
    </Pressable>
  );
}

/* ---------- OptionCard ---------- */

type OptionCardProps = {
  icon: IconName;
  title: string;
  caption: string;
  onPress: () => void;
  large?: boolean;
};

// 06-4 다른 방법 고르기. 카드 전체가 버튼
export function OptionCard({ icon, title, caption, onPress, large }: OptionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${caption}`}
      style={({ pressed }) => [styles.option, large && styles.optionLarge, pressed && styles.optionPressed]}
    >
      <Icon name={icon} size={28} strokeWidth={2.4} />
      <View style={styles.flex}>
        <Text variant={large ? 'rButton' : 'heading'}>{title}</Text>
        <Text variant={large ? 'body' : 'caption'} color="textSecondary">
          {caption}
        </Text>
      </View>
    </Pressable>
  );
}

/* ---------- HintList ---------- */

type HintListProps = {
  items: readonly { icon: IconName; text: string }[];
  /** 도움말 상자 (회색 바탕) */
  boxed?: boolean;
  textVariant?: TypeVariant;
  accessibilityLabel?: string;
};

// 아이콘 + 한 문장 안내 목록
export function HintList({ items, boxed, textVariant = 'body', accessibilityLabel }: HintListProps) {
  return (
    <Stack
      gap={boxed ? 2 : 3}
      padding={boxed ? 4 : undefined}
      accessibilityLabel={accessibilityLabel}
      style={boxed && styles.hintBox}
    >
      {items.map(({ icon, text }) => (
        <Row key={text} gap={2} align="flex-start">
          <View style={styles.hintIcon}>
            <Icon name={icon} size={20} strokeWidth={2.2} />
          </View>
          <Text variant={textVariant} style={styles.flex}>
            {text}
          </Text>
        </Row>
      ))}
    </Stack>
  );
}

/* ---------- SummaryList ---------- */

type SummaryListProps = {
  items: readonly [label: string, value: string][];
  large?: boolean;
};

// 06-5 저장할 값 목록 (이름 / 값 한 줄씩)
export function SummaryList({ items, large }: SummaryListProps) {
  return (
    <View
      accessible
      accessibilityLabel={items.map(([l, v]) => `${l}, ${v}`).join('. ')}
      style={styles.summary}
    >
      {items.map(([label, value], i) => (
        <View key={label} style={[styles.summaryRow, i > 0 && styles.summaryDivider]}>
          <Text variant={large ? 'rBody' : 'body'} color="textSecondary">
            {label}
          </Text>
          <Text variant={large ? 'rButton' : 'heading'}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

/* ---------- TestMark · ProgressPill (06-2) ---------- */

/** 06-2 가운데 휴대폰 그림 (장식) */
export function TestMark() {
  return (
    <View style={styles.testMark}>
      <Icon name="phone" size={76} strokeWidth={1.8} />
    </View>
  );
}

/** 06-2 진행 ('2번 중 1번째') */
export function ProgressPill({ label }: { label: string }) {
  return (
    <View style={styles.progress}>
      <Text variant="heading">{label}</Text>
    </View>
  );
}

const STEP_SIZE = 64;

const styles = StyleSheet.create({
  flex: { flex: 1 },

  testMark: {
    width: 160,
    height: 160,
    borderRadius: radius.full,
    borderWidth: 3,
    borderColor: colors.ink900,
    backgroundColor: colors.bgIvory,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.ink900,
    backgroundColor: colors.bgIvory,
  },

  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: radius.full,
  },

  card: {
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingVertical: space[3],
    paddingHorizontal: 14,
  },
  value: {
    flex: 1,
    alignItems: 'center',
  },
  step: {
    width: STEP_SIZE,
    height: STEP_SIZE,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.md,
    backgroundColor: colors.bgIvory,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDisabled: {
    borderStyle: 'dashed',
    borderColor: colors.borderInput,
    backgroundColor: colors.surfaceMuted,
  },
  stepPressed: {
    backgroundColor: colors.surfaceSunken,
  },

  option: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: space[3],
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  optionLarge: {
    minHeight: 80,
  },
  optionPressed: {
    backgroundColor: colors.surfaceSunken,
  },

  hintBox: {
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
  },
  hintIcon: {
    paddingTop: 3,
  },

  summary: {
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  summaryRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryDivider: {
    borderTopWidth: 1.5,
    borderTopColor: colors.line,
  },
});

const pillTone = StyleSheet.create({
  brand: { backgroundColor: colors.yellow100 },
  outline: { borderWidth: 2, borderColor: colors.ink900 },
  muted: { backgroundColor: colors.surfaceMuted },
});
