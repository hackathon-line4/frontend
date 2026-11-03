import { StyleSheet, View } from 'react-native';

import { colors, radius, space, typography } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

/* ---------- SignalBadge ---------- */

export type SignalBadgeType = 'basic' | 'custom' | 'untrained';

export function SignalBadge({ type }: { type: SignalBadgeType }) {
  if (type === 'untrained') {
    return (
      <View style={[styles.badge, styles.untrained]}>
        <Text style={[typography.badge, styles.untrainedText]}>연습 전</Text>
      </View>
    );
  }

  const isCustom = type === 'custom';
  const fg = isCustom ? colors.textOnDark : colors.ink900;
  return (
    <View style={[styles.badge, isCustom ? styles.custom : styles.basic]}>
      <Icon name={isCustom ? 'pencil' : 'book'} size={11} color={fg} />
      <Text style={[typography.badge, { color: fg }]}>{isCustom ? '직접' : '기본'}</Text>
    </View>
  );
}

/* ---------- StatusChip ---------- */

// 기록 기준 정의 (design/screens/DS-Components)
// replied     당사자의 명시적 화면 터치가 서버에 기록됨
// delivered   당사자 앱이 수신 확인(ack)을 보냄, 터치 응답은 없음
// unconfirmed 전송은 됐지만 기기 도착 여부를 알 수 없음
// failed      서버·네트워크 오류로 보내지 못함 (사유 함께 표시)
// waiting     응답 대기 중
// connected   연결됨
// noReply     도착 후 대기 시간(기본 10분) 동안 터치 없음. 위험으로 단정하지 않음
// 전송(기기 전달)과 응답(터치)은 항상 다른 줄·다른 칩으로 표시. '읽음', '이해함' 표현 금지.
export type SignalStatus =
  | 'replied'
  | 'delivered'
  | 'unconfirmed'
  | 'failed'
  | 'waiting'
  | 'connected'
  | 'noReply';

const statusSpec: Record<SignalStatus, { label: string; icon: IconName; fg: string; bg: string }> = {
  replied: { label: '응답 완료', icon: 'check', fg: colors.successFg, bg: colors.successBg },
  delivered: { label: '수신만', icon: 'device', fg: colors.infoFg, bg: colors.infoBg },
  unconfirmed: { label: '미확인', icon: 'sig-question', fg: colors.warningFg, bg: colors.warningBg },
  failed: { label: '실패', icon: 'warning', fg: colors.dangerFg, bg: colors.dangerBg },
  waiting: { label: '응답 대기 중', icon: 'waiting', fg: colors.ink900, bg: colors.surfaceMuted },
  connected: { label: '연결됨', icon: 'link', fg: colors.successFg, bg: colors.successBg },
  noReply: { label: '응답 없음', icon: 'no-reply', fg: colors.ink900, bg: 'transparent' },
};

type StatusChipProps = {
  status: SignalStatus;
  /** 기본 문구 대신 쓸 글자 (같은 의미 안에서만) */
  label?: string;
};

export function StatusChip({ status, label }: StatusChipProps) {
  const s = statusSpec[status];
  return (
    <View
      style={[styles.chip, { backgroundColor: s.bg }, status === 'noReply' && styles.noReply]}
      accessible
      accessibilityLabel={label ?? s.label}
    >
      <Icon name={s.icon} size={14} color={s.fg} />
      <Text variant="small" style={[styles.chipText, { color: s.fg }]}>
        {label ?? s.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    height: 22,
    paddingHorizontal: space[2],
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    alignSelf: 'flex-start',
  },
  basic: { borderWidth: 1.5, borderColor: colors.ink900 },
  custom: { backgroundColor: colors.ink900 },
  untrained: {
    height: 26,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.textTertiary,
  },
  untrainedText: {
    fontSize: 12,
    lineHeight: 12,
    color: colors.textSecondary,
  },
  chip: {
    height: 28,
    paddingHorizontal: space[3],
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    alignSelf: 'flex-start',
  },
  chipText: {
    fontFamily: typography.badge.fontFamily,
    lineHeight: 18,
  },
  noReply: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.ink900,
  },
});
