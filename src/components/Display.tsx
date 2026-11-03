import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors, fontFamily, radius, space, touch } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

/* ---------- Avatar ---------- */

const avatarSizes = {
  md: { box: 52, border: 2, font: 22 },
  lg: { box: 64, border: 2, font: 26 },
  xl: { box: 96, border: 3, font: 40 },
} as const;

// 이름 첫 글자. 장식이므로 스크린리더에서 숨김 (옆에 이름이 항상 함께 나옴)
export function Avatar({ name, size = 'lg' }: { name: string; size?: keyof typeof avatarSizes }) {
  const s = avatarSizes[size];
  return (
    <View
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={[styles.avatar, { width: s.box, height: s.box, borderRadius: s.box / 2, borderWidth: s.border }]}
    >
      <Text style={[styles.avatarText, { fontSize: s.font, lineHeight: s.font + 6 }]}>{name.slice(0, 1)}</Text>
    </View>
  );
}

/* ---------- Tag ---------- */

type TagProps = {
  label: string;
  icon?: IconName;
  /** md: 32 · 14 · lg: 36 · 17 */
  size?: 'md' | 'lg';
  /** brand: yellow-100 · dark: ink 바탕 */
  tone?: 'brand' | 'dark';
  bold?: boolean;
  style?: StyleProp<ViewStyle>;
};

// 안내·상태 알약 (만료 시간, 새 연결 요청, 역할, 연결됨)
export function Tag({ label, icon, size = 'md', tone = 'brand', bold = true, style }: TagProps) {
  const isLg = size === 'lg';
  const fg = tone === 'dark' ? colors.textOnDark : colors.textPrimary;
  return (
    <View
      style={[
        styles.tag,
        {
          height: isLg ? 36 : 32,
          paddingHorizontal: isLg ? space[4] : space[3],
          backgroundColor: tone === 'dark' ? colors.ink900 : colors.yellow100,
        },
        style,
      ]}
    >
      {icon && <Icon name={icon} size={isLg ? 18 : 16} color={fg} strokeWidth={2.4} />}
      <Text
        style={{
          fontFamily: bold ? fontFamily.extraBold : fontFamily.medium,
          fontSize: isLg ? 17 : 14,
          lineHeight: isLg ? 24 : 20,
          color: fg,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

/* ---------- Note ---------- */

// 보조 안내 한 줄 (info 아이콘 + 글자)
export function Note({ children, align = 'left', style }: { children: string; align?: 'left' | 'center'; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.note, align === 'center' && styles.noteCenter, style]}>
      <View style={styles.noteIcon}>
        <Icon name="info" size={NOTE_ICON} color={colors.textSecondary} strokeWidth={2} />
      </View>
      <Text variant="caption" color="textSecondary" style={[styles.noteText, align === 'center' && styles.noteTextCenter]}>
        {children}
      </Text>
    </View>
  );
}

/* ---------- StatusMessage ---------- */

type StatusMessageProps = {
  icon: IconName;
  children: string;
  /** plain: 글자만 · pill: 어두운 화면 위 알약 */
  variant?: 'plain' | 'pill';
  /** 당사자 화면은 17 이상 */
  large?: boolean;
};

// 진행 상태 안내 (role=status). 상태가 바뀌면 스크린리더가 읽는다.
export function StatusMessage({ icon, children, variant = 'plain', large }: StatusMessageProps) {
  const isPill = variant === 'pill';
  return (
    <View
      accessible
      accessibilityLiveRegion="polite"
      accessibilityLabel={children}
      style={[styles.status, isPill && styles.statusPill]}
    >
      <Icon
        name={icon}
        size={isPill ? 26 : 20}
        color={isPill ? colors.yellow500 : colors.textPrimary}
        strokeWidth={2.2}
      />
      <Text
        style={[
          styles.statusText,
          (large || isPill) && styles.statusTextLarge,
          { color: isPill ? colors.textOnDark : colors.textPrimary },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

/* ---------- NumberedSteps ---------- */

export function NumberedSteps({ steps, style }: { steps: readonly string[]; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.steps, style]} accessibilityRole="list">
      {steps.map((step, i) => (
        <View key={step} style={styles.stepRow} accessible accessibilityLabel={`${i + 1}단계, ${step}`}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{i + 1}</Text>
          </View>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </View>
  );
}

/* ---------- OrDivider ---------- */

export function OrDivider({ label = '또는', style }: { label?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.or, style]}>
      <View style={styles.orLine} />
      <Text color="textSecondary">{label}</Text>
      <View style={styles.orLine} />
    </View>
  );
}

/* ---------- DefinitionList ---------- */

// 이름 / 값 목록 (연결 요청 정보 등)
export function DefinitionList({ items }: { items: readonly [label: string, value: string][] }) {
  return (
    // 스크린리더는 열 순서가 아니라 '이름, 값' 한 줄씩 읽도록 묶는다
    <View style={styles.dl} accessible accessibilityLabel={items.map(([l, v]) => `${l}, ${v}`).join('. ')}>
      <View style={styles.dlColumn}>
        {items.map(([label]) => (
          <Text key={label} variant="caption" color="textSecondary" style={styles.dlCell}>
            {label}
          </Text>
        ))}
      </View>
      <View style={[styles.dlColumn, styles.flex]}>
        {items.map(([label, value]) => (
          <Text key={label} variant="caption" style={[styles.dlCell, styles.bold]}>
            {value}
          </Text>
        ))}
      </View>
    </View>
  );
}

/* ---------- ProfileRow ---------- */

type ProfileRowProps = {
  name: string;
  caption: string;
  size?: 'md' | 'lg';
  trailing?: ReactNode;
};

export function ProfileRow({ name, caption, size = 'lg', trailing }: ProfileRowProps) {
  const isLg = size === 'lg';
  return (
    <View style={[styles.profile, { gap: isLg ? space[4] : space[3] }]}>
      <Avatar name={name} size={isLg ? 'lg' : 'md'} />
      <View style={styles.flex} accessible accessibilityLabel={`${name}, ${caption}`}>
        <Text style={[styles.bold, { fontSize: isLg ? 22 : 18, lineHeight: isLg ? 30 : 26 }]}>{name}</Text>
        <Text variant="caption" color="textSecondary" style={isLg && styles.captionLarge}>
          {caption}
        </Text>
      </View>
      {trailing}
    </View>
  );
}

/* ---------- SuccessMark ---------- */

// 완료 그림 (연한 노란 원 + 노란 원 + 체크)
export function SuccessMark({ size = 120, label = '완료' }: { size?: number; label?: string }) {
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Circle cx="60" cy="60" r="58" fill={colors.yellow100} />
        <Circle cx="60" cy="60" r="42" fill={colors.yellow500} stroke={colors.ink900} strokeWidth={4} />
        <Path
          d="M42 61 l12 12 l24 -26"
          fill="none"
          stroke={colors.ink900}
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

/* ---------- ChoiceCard ---------- */

type ChoiceCardProps = {
  title: string;
  description: string;
  /** 노란 원 안에 들어갈 그림 */
  visual: ReactNode;
  onPress: () => void;
};

// 카드 전체가 하나의 버튼 (높이 200 이상). 역할 선택 등.
export function ChoiceCard({ title, description, visual, onPress }: ChoiceCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      style={({ pressed }) => [styles.choice, pressed && styles.choicePressed]}
    >
      <View style={styles.choiceTop}>
        <View style={styles.choiceVisual}>{visual}</View>
        <Icon name="chevron-right" size={28} strokeWidth={2.5} />
      </View>
      <Text style={styles.choiceTitle}>{title}</Text>
      <Text color="textSecondary" style={styles.choiceDesc}>
        {description}
      </Text>
    </Pressable>
  );
}

// Note: 아이콘을 첫 줄 글자 가운데에 맞춘다
const NOTE_ICON = 18;
const NOTE_LINE = 22;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bold: { fontFamily: fontFamily.extraBold },

  avatar: {
    backgroundColor: colors.yellow500,
    borderColor: colors.ink900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamily.extraBold,
  },

  // 정렬은 부모(alignItems)를 따른다. 세로로 늘어나는 목록 안에서는 alignSelf를 직접 준다.
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    borderRadius: radius.full,
  },

  note: {
    flexDirection: 'row',
    gap: space[2],
  },
  noteCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: space[2],
  },
  noteIcon: {
    paddingTop: (NOTE_LINE - NOTE_ICON) / 2,
  },
  noteText: {
    flexShrink: 1,
    lineHeight: NOTE_LINE,
  },
  noteTextCenter: {
    flexShrink: 0,
  },

  status: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
  },
  statusPill: {
    alignSelf: 'center',
    minHeight: touch.guardianMin,
    paddingHorizontal: space[5],
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceInverse,
    gap: space[3],
  },
  statusText: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 22,
  },
  statusTextLarge: {
    fontSize: 17,
    lineHeight: 24,
  },

  steps: {
    gap: space[3],
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.ink900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontFamily: fontFamily.extraBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textOnDark,
  },
  stepText: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 16,
    lineHeight: 24,
  },

  or: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  orLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: colors.lineStrong,
  },

  dl: {
    flexDirection: 'row',
    gap: space[4],
  },
  dlColumn: {
    gap: space[3],
  },
  dlCell: {
    fontSize: 15,
    lineHeight: 22,
  },

  profile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  captionLarge: {
    fontSize: 15,
    lineHeight: 22,
  },

  choice: {
    minHeight: 232,
    padding: space[6],
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    gap: space[3],
  },
  choicePressed: {
    backgroundColor: colors.surfaceSunken,
  },
  choiceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  choiceVisual: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.yellow500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: 22 * -0.02,
  },
  choiceDesc: {
    fontSize: 15,
    lineHeight: 24,
  },
});
