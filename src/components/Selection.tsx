import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors, fontFamily, radius, shadow, space, touch } from '@/theme';

import { Icon } from './Icon';
import { Text } from './Text';

// 선택 = 채움/두꺼운 테두리 + 체크 아이콘. 색만으로 구분하지 않음.

/* ---------- RadioCard ---------- */

type RadioCardProps = {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
};

export function RadioCard({ label, description, selected, onPress }: RadioCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      style={[styles.radioCard, selected ? styles.radioSelected : styles.radioIdle]}
    >
      <View style={styles.flex}>
        <Text variant="bodyStrong">{label}</Text>
        {description && (
          <Text variant="caption" color="textSecondary">
            {description}
          </Text>
        )}
      </View>
      <Svg width={24} height={24} viewBox="0 0 24 24" accessible={false}>
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
    </Pressable>
  );
}

/* ---------- SegmentedTabs ---------- */

type SegmentedTabsProps<T extends string> = {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedTabs<T extends string>({ options, value, onChange }: SegmentedTabsProps<T>) {
  return (
    <View style={styles.segTrack} accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.segItem, selected && styles.segSelected]}
          >
            <Text variant="label" color={selected ? 'textPrimary' : 'textSecondary'} style={!selected && styles.regular}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------- Chip ---------- */

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected ? styles.chipSelected : styles.chipIdle]}
    >
      {selected && <Icon name="check" size={14} color={colors.textOnDark} strokeWidth={3} />}
      <Text
        variant="label"
        color={selected ? 'textOnDark' : 'textPrimary'}
        style={!selected && styles.regular}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* ---------- Switch ---------- */

type SwitchRowProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** 당사자 앱: 64×40 */
  large?: boolean;
};

// 옆에 '켜짐/꺼짐' 글자 필수
export function SwitchRow({ label, value, onValueChange, large = false }: SwitchRowProps) {
  const w = large ? 64 : 52;
  const h = large ? 40 : 32;
  const onThumb = h - 8;
  const offThumb = h - 12;

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      style={[styles.row, large && styles.rowLarge]}
    >
      <Text variant={large ? 'rBody' : 'bodyStrong'} style={[styles.flex, large && styles.bold]}>
        {label}
      </Text>
      <Text variant="label" style={!large && styles.switchText}>
        {value ? '켜짐' : '꺼짐'}
      </Text>
      <View
        style={[
          { width: w, height: h, borderRadius: h / 2 },
          value ? styles.trackOn : styles.trackOff,
        ]}
      >
        <View
          style={
            value
              ? [styles.thumbOn, { width: onThumb, height: onThumb, borderRadius: onThumb / 2, left: w - onThumb - space[1] }]
              : [styles.thumbOff, { width: offThumb, height: offThumb, borderRadius: offThumb / 2 }]
          }
        />
      </View>
    </Pressable>
  );
}

/* ---------- Checkbox ---------- */

type CheckboxRowProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** 줄 전체가 label */
  children: ReactNode;
  accessibilityLabel: string;
  tone?: 'brand' | 'plain';
};

export function CheckboxRow({ checked, onChange, children, accessibilityLabel, tone = 'brand' }: CheckboxRowProps) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked }}
      style={[styles.checkRow, tone === 'brand' && styles.checkBrand]}
    >
      <View style={[styles.checkBox, checked ? styles.checkOn : styles.checkOff]}>
        {checked && <Icon name="check" size={16} color={colors.textOnDark} strokeWidth={3} />}
      </View>
      <View style={styles.flex}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  regular: { fontFamily: fontFamily.regular },
  bold: { fontFamily: fontFamily.extraBold },

  radioCard: {
    minHeight: 64,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  radioSelected: { borderWidth: 2.5, borderColor: colors.ink900 },
  radioIdle: { borderWidth: 1.5, borderColor: colors.lineStrong },

  segTrack: {
    flexDirection: 'row',
    gap: space[1],
    padding: space[1],
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
  segItem: {
    flex: 1,
    height: 44,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segSelected: {
    backgroundColor: colors.surface,
    ...shadow.segment,
  },

  chip: {
    minHeight: 44,
    paddingHorizontal: space[3],
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[1],
  },
  chipSelected: { backgroundColor: colors.ink900 },
  chipIdle: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.borderInput },

  row: {
    minHeight: 64,
    paddingHorizontal: space[4],
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  rowLarge: {
    minHeight: touch.recipientPrimary,
    borderRadius: radius.lg,
  },
  switchText: { fontSize: 14 },
  trackOn: { backgroundColor: colors.ink900, justifyContent: 'center' },
  trackOff: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderInput,
    justifyContent: 'center',
  },
  thumbOn: { position: 'absolute', backgroundColor: colors.yellow500 },
  thumbOff: { position: 'absolute', left: space[1], backgroundColor: colors.textTertiary },

  checkRow: {
    minHeight: 56,
    paddingHorizontal: space[4],
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  checkBrand: { backgroundColor: colors.yellow100 },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.ink900 },
  checkOff: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.borderInput },
});
