import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, describeRhythm, fontFamily, radius, shadow, type Beat } from '@/theme';

import { SignalBadge, type SignalBadgeType } from './Badge';
import { Icon, type IconName } from './Icon';
import { Rhythm } from './Rhythm';
import { Text } from './Text';

/* ---------- Card ---------- */

type CardProps = {
  children: ReactNode;
  /** outline: 그림자 없이 선만 (당사자 앱, 설정 목록) */
  variant?: 'elevated' | 'outline';
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, variant = 'elevated', style }: CardProps) {
  return <View style={[styles.card, variant === 'elevated' ? shadow.card : styles.outline, style]}>{children}</View>;
}

/* ---------- SignalTile ---------- */

type SignalTileProps = {
  name: string;
  icon: IconName;
  badge: SignalBadgeType;
  beats: readonly Beat[];
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

// 전체가 button
export function SignalTile({ name, icon, badge, beats, onPress, style }: SignalTileProps) {
  const badgeLabel = { basic: '기본', custom: '직접', untrained: '연습 전' }[badge];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${badgeLabel}, ${describeRhythm(beats)}`}
      style={({ pressed }) => [styles.tile, pressed && styles.tilePressed, style]}
    >
      <View style={styles.tileTop} importantForAccessibility="no-hide-descendants">
        <Icon name={icon} size={24} />
        <SignalBadge type={badge} />
      </View>
      <Text style={styles.tileName}>{name}</Text>
      <Rhythm beats={beats} size="sm" />
    </Pressable>
  );
}

/* ---------- ListRow ---------- */

type ListRowProps = {
  title: string;
  subtitle?: string;
  icon?: IconName;
  /** 오른쪽 요소. 없고 onPress가 있으면 chevron */
  trailing?: ReactNode;
  onPress?: () => void;
  /** 위쪽 구분선 */
  divider?: boolean;
  accessibilityLabel?: string;
};

export function ListRow({ title, subtitle, icon, trailing, onPress, divider, accessibilityLabel }: ListRowProps) {
  const content = (
    <>
      {icon && <Icon name={icon} size={22} strokeWidth={2.2} />}
      <View style={styles.flex}>
        <Text variant="bodyStrong">{title}</Text>
        {subtitle && (
          <Text variant="small" color="textSecondary" style={styles.regular}>
            {subtitle}
          </Text>
        )}
      </View>
      {trailing ?? (onPress && <Icon name="chevron-right" size={20} strokeWidth={2.4} />)}
    </>
  );

  const rowStyle = [styles.row, divider && styles.divider];

  if (!onPress) return <View style={rowStyle}>{content}</View>;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [rowStyle, pressed && styles.rowPressed]}
    >
      {content}
    </Pressable>
  );
}

/* ---------- InfoBox ---------- */

type InfoBoxProps = {
  /** neutral: 도움말 · brand: 꼭 알아야 할 안내 · caution: 연결 확인 안 됨, 응답 없음 */
  tone?: 'neutral' | 'brand' | 'caution';
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function InfoBox({ tone = 'neutral', children, style }: InfoBoxProps) {
  return (
    <View style={[styles.info, infoTone[tone], style]}>
      {typeof children === 'string' ? <Text style={styles.infoText}>{children}</Text> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  regular: { fontFamily: fontFamily.regular },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.line,
  },

  tile: {
    minHeight: 116,
    padding: 12,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.bgIvory,
    gap: 8,
  },
  tilePressed: { backgroundColor: colors.surfaceSunken },
  tileTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tileName: {
    fontFamily: fontFamily.extraBold,
    fontSize: 17,
    lineHeight: 24,
  },

  row: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  rowPressed: { opacity: 0.7 },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.lineSubtle,
  },

  info: {
    borderRadius: radius.sm,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  infoText: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textPrimary,
  },
});

const infoTone = StyleSheet.create({
  neutral: { backgroundColor: colors.surfaceMuted },
  brand: { backgroundColor: colors.yellow100, borderWidth: 2, borderColor: colors.ink900 },
  caution: { backgroundColor: colors.surface, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.ink900 },
});
