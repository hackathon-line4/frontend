import { Children, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, fontFamily, radius, space, type SpaceToken } from '@/theme';

import { Text } from './Text';

// 설정·기록 화면의 섹션 묶음 (design/screens/SettingsG, SettingsR, LogDetail)

/* ---------- Section ---------- */

type SectionProps = {
  title: string;
  children: ReactNode;
  /** md: 보호자 15 · 회색 / lg: 당사자 18 · 진하게 */
  size?: 'md' | 'lg';
  /** 제목과 내용, 내용 사이 간격 */
  gap?: SpaceToken;
};

/** 제목(h2) + 내용 */
export function Section({ title, children, size = 'md', gap = 3 }: SectionProps) {
  const isLg = size === 'lg';
  return (
    <View style={{ gap: space[gap] }}>
      <Text
        variant={isLg ? 'heading' : 'label'}
        color={isLg ? 'textPrimary' : 'textSecondary'}
        accessibilityRole="header"
        style={isLg && styles.titleLg}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

/* ---------- ListGroup ---------- */

/** 선만 있는 흰 상자 안에 행을 구분선으로 나눠 쌓는다 (설정 목록) */
export function ListGroup({ children }: { children: ReactNode }) {
  const items = Children.toArray(children).filter(Boolean);
  return (
    <View style={styles.group}>
      {items.map((child, i) => (
        <View key={i} style={[styles.groupItem, i > 0 && styles.groupDivider]}>
          {child}
        </View>
      ))}
    </View>
  );
}

/* ---------- SwitchListRow ---------- */

type SwitchListRowProps = {
  disabled?: boolean;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

/** ListGroup 안에서 쓰는 테두리 없는 스위치 행. 옆에 '켜짐/꺼짐' 글자를 함께 둔다 */
export function SwitchListRow({ label, description, value, onValueChange, disabled = false }: SwitchListRowProps) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={description ? `${label}, ${description}` : label}
      accessibilityState={{ checked: value, disabled }}
      style={styles.switchRow}
    >
      <View style={styles.flex}>
        <Text variant="bodyStrong">{label}</Text>
        {description && (
          <Text variant="caption" color="textSecondary">
            {description}
          </Text>
        )}
      </View>
      <Text variant="label" style={styles.switchText}>
        {value ? '켜짐' : '꺼짐'}
      </Text>
      <View style={[styles.track, value ? styles.trackOn : styles.trackOff]}>
        <View style={value ? styles.thumbOn : styles.thumbOff} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  titleLg: { fontFamily: fontFamily.extraBold },

  group: {
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  groupItem: { paddingHorizontal: space[4] },
  groupDivider: { borderTopWidth: 1.5, borderTopColor: colors.line },

  switchRow: {
    minHeight: 56,
    paddingVertical: space[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  switchText: { fontSize: 14 },
  track: { width: 52, height: 32, borderRadius: 16, justifyContent: 'center' },
  trackOn: { backgroundColor: colors.ink900 },
  trackOff: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.borderInput },
  thumbOn: {
    position: 'absolute',
    left: 24,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.yellow500,
  },
  thumbOff: {
    position: 'absolute',
    left: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.textTertiary,
  },
});
