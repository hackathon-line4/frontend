import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, Row, Text, type IconName } from '@/components';
import { colors, radius, space, type SpaceToken } from '@/theme';

// 08-2 · 08-3 기록 상세의 상자 (design/screens/LogDetail · LogHelp)

type RecordSectionProps = {
  /** 작은 회색 제목. heading이 있으면 생략 */
  title?: string;
  /** 큰 제목 줄 (아이콘 + 제목) */
  heading?: ReactNode;
  /** default: 옅은 선 · strong: 2px 진한 선 · dashed: 응답 없음 · 연결 확인 안 됨 */
  tone?: 'default' | 'strong' | 'dashed';
  gap?: SpaceToken;
  children: ReactNode;
};

export function RecordSection({ title, heading, tone = 'default', gap = 3, children }: RecordSectionProps) {
  return (
    <View style={[styles.box, toneStyles[tone], { gap: space[gap] }]}>
      {heading ??
        (title && (
          <Text variant="label" color="textSecondary" accessibilityRole="header">
            {title}
          </Text>
        ))}
      {children}
    </View>
  );
}

/** 시각이 붙은 기록 한 줄 (보냄 · 기기에 전달 완료 …) */
export function TimelineRow({ label, time, icon }: { label: string; time?: string; icon?: IconName }) {
  return (
    <Row justify="space-between" gap={3} accessible accessibilityLabel={time ? `${label}, ${time}` : label}>
      <Row gap={2} style={styles.shrink}>
        {icon && <Icon name={icon} size={18} strokeWidth={2.6} />}
        <Text style={styles.shrink}>{label}</Text>
      </Row>
      {time && <Text variant="bodyStrong">{time}</Text>}
    </Row>
  );
}

const styles = StyleSheet.create({
  shrink: { flexShrink: 1 },
  box: {
    padding: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
});

const toneStyles = StyleSheet.create({
  default: { borderWidth: 1.5, borderColor: colors.lineStrong },
  strong: { borderWidth: 2, borderColor: colors.ink900 },
  dashed: { borderWidth: 2, borderStyle: 'dashed', borderColor: colors.ink900 },
});
