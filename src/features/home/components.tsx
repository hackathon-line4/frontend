import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, IconButton, Rhythm, Row, SignalBadge, Stack, Text, type IconName } from '@/components';
import type { Signal } from '@/features/signals';
import { colors, describeRhythm, fontFamily, radius, space, touch } from '@/theme';

import type { DeliveryStep } from './types';

// 05 보호자 홈 · 신호 · 위치 · 신호 상세 · 응답 없음 화면에서 쓰는 부품

/* ---------- ChevronLink ---------- */

type ChevronLinkProps = {
  label: string;
  onPress: () => void;
  /** strong: 진한 굵은 글자 (카드 안 '자세히 보기') · 기본: 회색 보조 링크 ('전체 보기') */
  strong?: boolean;
  accessibilityLabel?: string;
};

export function ChevronLink({ label, onPress, strong, accessibilityLabel }: ChevronLinkProps) {
  const color = strong ? colors.textPrimary : colors.textSecondary;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={space[1]}
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}
    >
      <Text variant="caption" style={[{ color }, strong && styles.bold]}>
        {label}
      </Text>
      <Icon name="chevron-right" size={16} color={color} strokeWidth={2.4} />
    </Pressable>
  );
}

/* ---------- SectionHeader ---------- */

type SectionHeaderProps = {
  title: string;
  linkLabel?: string;
  onPressLink?: () => void;
};

// 카드 제목 + 오른쪽 '전체 보기' 링크
export function SectionHeader({ title, linkLabel, onPressLink }: SectionHeaderProps) {
  return (
    <Row justify="space-between" style={styles.sectionHeader}>
      <Text variant="heading" accessibilityRole="header">
        {title}
      </Text>
      {linkLabel && onPressLink && <ChevronLink label={linkLabel} onPress={onPressLink} />}
    </Row>
  );
}

/* ---------- DashedButton ---------- */

// 점선 테두리 보조 버튼 ('+ 신호 추가하기')
export function DashedButton({ label, icon, onPress }: { label: string; icon?: IconName; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.dashed, pressed && styles.dashedPressed]}
    >
      {icon && <Icon name={icon} size={20} strokeWidth={2.4} />}
      <Text variant="bodyStrong">{label}</Text>
    </Pressable>
  );
}

/* ---------- BackTextButton ---------- */

// '< 뒤로' 글자 버튼 (신호 상세)
export function BackTextButton({ onPress, label = '뒤로' }: { onPress: () => void; label?: string }) {
  return (
    <View style={styles.backBar}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Icon name="back" size={24} strokeWidth={2.4} />
        <Text variant="body" style={styles.medium}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

/* ---------- IconCircle ---------- */

const circleTone = {
  success: { bg: colors.successBg, fg: colors.successFg },
  muted: { bg: colors.surfaceMuted, fg: colors.textSecondary },
} as const;

export function IconCircle({ icon, tone = 'success' }: { icon: IconName; tone?: keyof typeof circleTone }) {
  const t = circleTone[tone];
  return (
    <View style={[styles.iconCircle, { backgroundColor: t.bg }]}>
      <Icon name={icon} size={18} color={t.fg} strokeWidth={2.4} />
    </View>
  );
}

/* ---------- SignalIconBox ---------- */

// 신호 상세 위쪽 큰 아이콘 (84 · yellow-100)
export function SignalIconBox({ icon }: { icon: IconName }) {
  return (
    <View style={styles.iconBox}>
      <Icon name={icon} size={44} strokeWidth={1.8} />
    </View>
  );
}

/* ---------- SignalListRow ---------- */

type SignalListRowProps = {
  signal: Signal;
  onPress: () => void;
  divider?: boolean;
  /** 자주 쓰는 신호(홈) 별. 없으면 별을 그리지 않는다 */
  favorite?: { on: boolean; onToggle: () => void; disabled?: boolean };
};

// 신호 탭 목록 한 줄: 아이콘 · 이름 · 배지 · 리듬. 아직 알려 주지 않은 신호는 chevron 대신 '연습 전'
export function SignalListRow({ signal, onPress, divider = true, favorite }: SignalListRowProps) {
  const sourceLabel = signal.source === 'custom' ? '직접 만든 신호' : '기본 신호';
  const label = [signal.name, sourceLabel, signal.untrained ? '연습 전' : null, describeRhythm(signal.beats)]
    .filter(Boolean)
    .join(', ');

  const row = (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.signalRow, !favorite && divider && styles.divider, favorite && styles.flex, pressed && styles.pressed]}
    >
      <Icon name={signal.icon} size={24} />
      <Stack gap={2} flex>
        {/* '연습 전'은 신호의 상태라 이름 · 종류 뱃지 옆에 둔다 */}
        <Row gap={2} wrap>
          <Text variant="bodyStrong">{signal.name}</Text>
          <SignalBadge type={signal.source} />
          {signal.untrained && <SignalBadge type="untrained" />}
        </Row>
        <Rhythm beats={signal.beats} size="sm" />
      </Stack>
      {/* 별이 있는 목록은 오른쪽을 별 하나만 두고, 없을 때만 화살표로 누를 수 있음을 알린다 */}
      {!favorite && !signal.untrained && (
        <Icon name="chevron-right" size={20} color={colors.textSecondary} strokeWidth={2.4} />
      )}
    </Pressable>
  );
  if (!favorite) return row;

  // 별은 줄 누르기(상세 열기)와 따로 눌리게 줄 밖 오른쪽에 둔다
  return (
    <View style={[styles.favoriteRow, divider && styles.divider]}>
      {row}
      <IconButton
        icon={favorite.on ? 'star-on' : 'star'}
        accessibilityLabel={favorite.on ? `${signal.name}, 자주 쓰는 신호에서 빼기` : `${signal.name}, 자주 쓰는 신호에 추가`}
        color={favorite.on ? colors.textPrimary : colors.textSecondary}
        disabled={favorite.disabled}
        onPress={favorite.onToggle}
      />
    </View>
  );
}

/* ---------- NoReplyPill ---------- */

// 응답 없음 상세 제목 옆 상태 알약 (노랑 + 아이콘 + 글자)
export function NoReplyPill({ label = '응답 없음' }: { label?: string }) {
  return (
    <View style={styles.pill} accessible accessibilityLabel={label}>
      <Icon name="no-reply" size={16} strokeWidth={2.8} />
      <Text variant="label">{label}</Text>
    </View>
  );
}

/* ---------- DeliveryTimeline ---------- */

// 보냄 → 기기에 도착 → 진동 재생됨 → 화면 터치. 확인되지 않은 단계는 점선 원 + X
export function DeliveryTimeline({ steps }: { steps: readonly DeliveryStep[] }) {
  return (
    <View accessibilityLabel="진행 단계" accessibilityRole="list">
      {steps.map((step) => (
        <View
          key={step.label}
          accessible
          accessibilityLabel={[step.label, step.detail, step.time].filter(Boolean).join(', ')}
          style={styles.step}
        >
          <View style={[styles.stepMark, step.done ? styles.stepDone : styles.stepMissing]}>
            <Icon
              name={step.done ? 'check' : 'close'}
              size={16}
              color={step.done ? colors.textOnDark : colors.textPrimary}
              strokeWidth={3}
            />
          </View>
          <Stack flex>
            <Text variant="bodyStrong">{step.label}</Text>
            {step.detail && (
              <Text variant="caption" color="textSecondary">
                {step.detail}
              </Text>
            )}
          </Stack>
          <Text variant="caption" color="textSecondary">
            {step.time}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  favoriteRow: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  pressed: { opacity: 0.7 },
  bold: { fontFamily: fontFamily.bold },
  medium: { fontFamily: fontFamily.medium },

  link: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sectionHeader: {
    minHeight: 44,
  },

  dashed: {
    height: 52,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderInput,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dashedPressed: { backgroundColor: colors.surfaceSunken },

  backBar: {
    height: touch.guardianMin,
    flexDirection: 'row',
    alignItems: 'center',
  },
  back: {
    height: touch.guardianMin,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingRight: 10,
  },

  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconBox: {
    width: 84,
    height: 84,
    borderRadius: radius.xl,
    backgroundColor: colors.yellow100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  signalRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.lineSubtle,
  },

  pill: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    backgroundColor: colors.yellow500,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  step: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  stepMark: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDone: { backgroundColor: colors.ink900 },
  stepMissing: { borderWidth: 2.5, borderStyle: 'dashed', borderColor: colors.ink900 },
});
