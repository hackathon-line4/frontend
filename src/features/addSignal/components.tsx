import type { ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Icon, IconButton, Rhythm, StepBar, Text, type IconName } from '@/components';
import { beatLabel, colors, fontFamily, radius, shadow, space, typography, type Beat } from '@/theme';

import { beatSeconds } from './rhythm';

// 신호 추가(10) 흐름에서만 쓰는 부품.

export const ADD_SIGNAL_STEPS = 4;

/* ---------- AddSignalHeader ---------- */

type AddSignalHeaderProps = {
  onBack?: () => void;
  onClose?: () => void;
};

// 왼쪽 뒤로 · 가운데 '신호 추가' · 오른쪽 닫기 (design/screens/Add1Choose 등)
export function AddSignalHeader({ onBack, onClose }: AddSignalHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>
        {onBack && <IconButton icon="back" accessibilityLabel="뒤로 가기" onPress={onBack} />}
      </View>
      <Text variant="bodyStrong" accessibilityRole="header">
        신호 추가
      </Text>
      <View style={[styles.headerSide, styles.headerRight]}>
        {onClose && <IconButton icon="close" accessibilityLabel="닫기" onPress={onClose} size={22} />}
      </View>
    </View>
  );
}

/* ---------- StepIntro ---------- */

type StepIntroProps = {
  step: number;
  /** '1단계 · 어떤 신호인가' */
  eyebrow?: string;
  title?: string;
  /** 제목 옆 (배지 등) */
  titleAccessory?: ReactNode;
};

// 진행 막대 + 단계 이름 + 제목
export function StepIntro({ step, eyebrow, title, titleAccessory }: StepIntroProps) {
  return (
    <View style={styles.intro}>
      <StepBar total={ADD_SIGNAL_STEPS} current={step} />
      {(eyebrow || title) && (
        <View style={styles.introText}>
          {eyebrow && (
            <Text variant="small" color="textSecondary" style={styles.bold}>
              {eyebrow}
            </Text>
          )}
          {title && (
            <View style={styles.titleRow}>
              <Text variant="title2" accessibilityRole="header" style={styles.flexShrink}>
                {title}
              </Text>
              {titleAccessory}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

/* ---------- TypePill ---------- */

// '기본 신호'(흰 바탕 + 테두리) · '직접 만든 신호'(검정 바탕)
export function TypePill({ type, label }: { type: 'basic' | 'custom'; label: string }) {
  const isCustom = type === 'custom';
  return (
    <View style={[styles.pill, isCustom ? styles.pillCustom : styles.pillBasic]}>
      <Text style={[typography.badge, { color: isCustom ? colors.textOnDark : colors.ink900 }]}>{label}</Text>
    </View>
  );
}

/** 점선 상태 표시 ('이미 추가됨') */
export function DashedPill({ label }: { label: string }) {
  return (
    <View style={styles.dashedPill}>
      <Text variant="small" color="textTertiary" style={styles.bold}>
        {label}
      </Text>
    </View>
  );
}

/* ---------- RadioMark ---------- */

export function RadioMark({ selected, size = 24 }: { selected: boolean; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      {selected ? (
        <>
          <Circle cx="12" cy="12" r="11" fill={colors.ink900} />
          <Path
            d="M7 12.5l3.2 3.2L17 9"
            fill="none"
            stroke={colors.textOnDark}
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <Circle cx="12" cy="12" r="10.5" fill="none" stroke={colors.borderInput} strokeWidth={1.8} />
      )}
    </Svg>
  );
}

/* ---------- SuccessCircle ---------- */

// 초록 원 + 흰 체크 (같은 리듬 없음 · 저장 완료)
export function SuccessCircle({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      <Circle cx="12" cy="12" r="11" fill={colors.successFg} />
      <Path
        d="M7.3 12.6l3.1 3.1 6.3-6.8"
        fill="none"
        stroke={colors.surface}
        strokeWidth={size > 40 ? 2.2 : 2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/* ---------- MethodCard (10-1) ---------- */

type MethodCardProps = {
  icon: IconName;
  title: string;
  description: string;
  type: 'basic' | 'custom';
  typeLabel: string;
  selected: boolean;
  onPress: () => void;
};

export function MethodCard({ icon, title, description, type, typeLabel, selected, onPress }: MethodCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={`${title}, ${description}, ${typeLabel}`}
      accessibilityState={{ checked: selected }}
      style={[styles.method, selected ? styles.methodSelected : styles.methodIdle]}
    >
      <View style={[styles.methodIcon, { backgroundColor: selected ? colors.yellow100 : colors.surfaceMuted }]}>
        <Icon name={icon} size={26} />
      </View>
      <View style={styles.methodBody}>
        <Text variant="heading">{title}</Text>
        <Text variant="caption" color="textSecondary">
          {description}
        </Text>
        <TypePill type={type} label={typeLabel} />
      </View>
      <RadioMark selected={selected} size={26} />
    </Pressable>
  );
}

/* ---------- SearchField (10-2) ---------- */

type SearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  /** 화면에는 숨기고 스크린리더에만 읽히는 라벨 */
  accessibilityLabel: string;
};

export function SearchField({ value, onChangeText, placeholder, accessibilityLabel }: SearchFieldProps) {
  return (
    <View style={styles.search}>
      <Icon name="search" size={20} color={colors.textSecondary} strokeWidth={2.2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        accessibilityLabel={accessibilityLabel}
        returnKeyType="search"
        clearButtonMode="while-editing"
        style={styles.searchInput}
      />
    </View>
  );
}

/* ---------- SignalOptionRow (10-2) ---------- */

type SignalOptionRowProps = {
  name: string;
  meaning: string;
  beats: readonly Beat[];
  selected: boolean;
  /** 이미 추가한 신호: 점선 '이미 추가됨' + 선택 불가 */
  added: boolean;
  divider: boolean;
  onPress: () => void;
};

export function SignalOptionRow({ name, meaning, beats, selected, added, divider, onPress }: SignalOptionRowProps) {
  const rhythmLabel = beats.map((b) => beatLabel[b]).join(' ');
  return (
    <Pressable
      onPress={onPress}
      disabled={added}
      accessibilityRole="radio"
      accessibilityLabel={`${name}, ${rhythmLabel}, ${meaning}${added ? ', 이미 추가됨' : ''}`}
      accessibilityState={{ checked: selected, disabled: added }}
      style={[styles.option, divider && styles.optionDivider]}
    >
      <View style={styles.optionBody}>
        <Text variant="bodyStrong" color={added ? 'textTertiary' : 'textPrimary'}>
          {name}
        </Text>
        <View style={styles.optionMeta}>
          <Rhythm beats={beats} size="sm" color={added ? colors.textTertiary : colors.ink900} />
          <Text variant="small" color={added ? 'textTertiary' : 'textSecondary'} style={styles.regular}>
            {meaning}
          </Text>
        </View>
      </View>
      {added ? <DashedPill label="이미 추가됨" /> : <RadioMark selected={selected} />}
    </Pressable>
  );
}

/* ---------- PresetCard (10-4) ---------- */

type PresetCardProps = {
  beats: readonly Beat[];
  /** '약 1.6초' */
  length: string;
  selected: boolean;
  /** 다른 신호가 쓰는 리듬이면 그 신호 이름 */
  usedBy?: string;
  onPress: () => void;
};

export function PresetCard({ beats, length, selected, usedBy, onPress }: PresetCardProps) {
  const rhythmLabel = beats.map((b) => beatLabel[b]).join(' ');
  const used = usedBy !== undefined;
  return (
    <Pressable
      onPress={onPress}
      disabled={used}
      accessibilityRole="radio"
      accessibilityLabel={`${rhythmLabel}, ${used ? `사용 중 · ${usedBy}` : length}`}
      accessibilityState={{ checked: selected, disabled: used }}
      style={[styles.preset, used ? styles.presetUsed : selected ? styles.presetSelected : styles.presetIdle]}
    >
      <View style={styles.presetTop}>
        <Rhythm beats={beats} size="sm" color={used ? colors.textTertiary : colors.ink900} />
        {selected && <RadioMark selected size={20} />}
      </View>
      {used ? (
        <Text variant="small" color="textTertiary" style={styles.bold}>
          {`사용 중 · ${usedBy}`}
        </Text>
      ) : (
        <Text variant="small" color="textSecondary" style={styles.regular}>
          {length}
        </Text>
      )}
    </Pressable>
  );
}

/* ---------- BeatSlot (10-5) ---------- */

// 만든 리듬 칸: 순서대로 표시, 방금 넣은 박자는 테두리 강조, 남은 칸은 점선
export function BeatSlot({ beat, latest }: { beat?: Beat; latest?: boolean }) {
  if (!beat) return <View style={styles.slotEmpty} accessibilityLabel="빈 칸" />;
  return (
    <View style={[styles.slot, latest && styles.slotLatest]}>
      <View importantForAccessibility="no-hide-descendants">
        <Rhythm beats={[beat]} size="md" />
      </View>
      <Text variant="badge" style={styles.slotLabel}>
        {beatLabel[beat]}
      </Text>
    </View>
  );
}

/* ---------- BeatAddButton (10-5) ---------- */

export function BeatAddButton({ beat, disabled, onPress }: { beat: Beat; disabled: boolean; onPress: () => void }) {
  const fg = disabled ? colors.textTertiary : colors.ink900;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${beatLabel[beat]} 추가, ${beatSeconds(beat)}`}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.beatButton, disabled && styles.beatButtonDisabled, pressed && styles.pressed]}
    >
      <View importantForAccessibility="no-hide-descendants">
        <Rhythm beats={[beat]} size="lg" color={fg} />
      </View>
      <Text variant="heading" style={{ color: fg }}>
        {beatLabel[beat]}
      </Text>
      <Text variant="small" color="textSecondary" style={styles.regular}>
        {beatSeconds(beat)}
      </Text>
    </Pressable>
  );
}

/* ---------- OutlineAction (10-5 하나 지우기 · 모두 지우기 · 들어보기) ---------- */

type OutlineActionProps = {
  label: string;
  icon: IconName;
  onPress: () => void;
  disabled?: boolean;
  /** pill: 작은 알약 (들어보기) */
  shape?: 'box' | 'pill';
};

export function OutlineAction({ label, icon, onPress, disabled = false, shape = 'box' }: OutlineActionProps) {
  const isPill = shape === 'pill';
  const fg = disabled ? colors.textTertiary : colors.ink900;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        isPill ? styles.actionPill : styles.actionBox,
        disabled && styles.actionDisabled,
        pressed && styles.pressed,
      ]}
    >
      <Icon name={icon} size={isPill ? 14 : 18} color={fg} strokeWidth={2.2} />
      <Text variant={isPill ? 'small' : 'label'} style={[isPill && styles.bold, { color: fg }]}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ---------- RhythmCheckMessage (10-5) ---------- */

// 같은 리듬 확인 (role=status). 겹치면 경고 아이콘, 아니면 초록 체크
export function RhythmCheckMessage({ duplicateOf }: { duplicateOf?: string }) {
  const text = duplicateOf ? `'${duplicateOf}'와 같은 리듬이에요` : '같은 리듬을 쓰는 신호가 없어요';
  return (
    <View
      style={styles.check}
      accessible
      accessibilityLiveRegion="polite"
      accessibilityLabel={text}
    >
      {duplicateOf ? <Icon name="warning" size={16} color={colors.dangerFg} /> : <SuccessCircle size={16} />}
      <Text variant="small" color={duplicateOf ? 'dangerFg' : 'textPrimary'} style={styles.flexShrink}>
        {text}
      </Text>
    </View>
  );
}

/* ---------- PlayCircleButton (10-6) ---------- */

export function PlayCircleButton({ accessibilityLabel, onPress }: { accessibilityLabel: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.playCircle, pressed && styles.pressed]}
    >
      <Icon name="play" size={20} />
    </Pressable>
  );
}

/* ---------- FeelButton (10-6 큰 노란 버튼) ---------- */

export function FeelButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.feel, pressed && styles.pressed]}
    >
      <Icon name="vibrate" size={28} />
      <Text variant="heading">{label}</Text>
    </Pressable>
  );
}

/* ---------- SignalIconBox ---------- */

export function SignalIconBox({ icon }: { icon: IconName }) {
  return (
    <View style={styles.iconBox}>
      <Icon name={icon} size={26} />
    </View>
  );
}

const styles = StyleSheet.create({
  flexShrink: { flexShrink: 1 },
  bold: { fontFamily: fontFamily.bold },
  regular: { fontFamily: fontFamily.regular },
  pressed: { opacity: 0.85 },

  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: -space[3], // 아이콘 버튼 터치 영역만큼 바깥으로 (아이콘을 여백선에 맞춤)
  },
  headerSide: { width: 48 },
  headerRight: { alignItems: 'flex-end' },

  intro: { gap: space[3], paddingTop: space[1] },
  introText: { gap: space[1] },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },

  pill: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  pillBasic: { borderWidth: 1, borderColor: colors.ink900 },
  pillCustom: { backgroundColor: colors.ink900 },
  dashedPill: {
    height: 26,
    paddingHorizontal: 8,
    borderRadius: 13,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.textTertiary,
    justifyContent: 'center',
  },

  method: {
    minHeight: 132,
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    ...shadow.card,
  },
  methodSelected: { borderWidth: 2.5, borderColor: colors.ink900 },
  methodIdle: { borderWidth: 1, borderColor: colors.lineStrong },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodBody: { flex: 1, gap: 6 },

  search: {
    height: 52,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    alignSelf: 'stretch',
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.textPrimary,
  },

  option: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  optionDivider: { borderTopWidth: 1, borderTopColor: colors.lineSubtle },
  optionBody: { flex: 1, gap: 5 },
  optionMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },

  preset: {
    minHeight: 92,
    padding: 12,
    borderRadius: radius.md,
    gap: 8,
  },
  presetSelected: { borderWidth: 2.5, borderColor: colors.ink900, backgroundColor: colors.surface, ...shadow.card },
  presetIdle: { borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: colors.surface, ...shadow.card },
  presetUsed: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderInput },
  presetTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 20 },

  slot: {
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  slotLatest: { borderWidth: 1.5, borderColor: colors.ink900 },
  slotEmpty: {
    height: 72,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.textDisabled,
  },
  slotLabel: { fontSize: 12, lineHeight: 16, color: colors.textPrimary },

  beatButton: {
    height: 104,
    borderWidth: 1.5,
    borderColor: colors.ink900,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...shadow.card,
  },
  beatButtonDisabled: {
    borderStyle: 'dashed',
    borderColor: colors.borderInput,
    backgroundColor: colors.surfaceMuted,
  },

  actionBox: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionPill: {
    height: 40,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.ink900,
    borderRadius: 20,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionDisabled: { borderStyle: 'dashed', borderColor: colors.borderInput },

  check: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },

  playCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.ink900,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feel: {
    height: 68,
    borderRadius: 18,
    backgroundColor: colors.yellow500,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
