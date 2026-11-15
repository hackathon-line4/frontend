import { StyleSheet, View } from 'react-native';

import { Button, Card, Icon, Row, Screen, ScreenHeader, ScreenTitle, Stack, Text } from '@/components';
import { useRoleScale } from '@/features/session';
import { colors, radius, space } from '@/theme';

/** 켜짐 · 꺼짐 · 상태를 읽을 수 없어 직접 확인 */
export type SetupStatus = 'on' | 'off' | 'manual';

export type SetupItem = {
  key: string;
  title: string;
  /** 왜 필요한지 한 문장 */
  reason: string;
  status: SetupStatus;
  /** 버튼 글자. 없으면 버튼 없이 안내만 */
  actionLabel?: string;
  onAction?: () => void;
  /** 직접 따라 할 순서 (상태를 읽을 수 없는 항목) */
  steps?: string;
  /** 켜져 있을 때만 보이는 작은 끄기 버튼 (예: 손울림 대기 끄기) */
  offLabel?: string;
  onOff?: () => void;
};

type Props = {
  items: SetupItem[];
  onBack: () => void;
  /** 계정 연결 직후 들어왔을 때: 다 켠 뒤 대기(홈) 화면으로 */
  onDone?: () => void;
  /** 보호자용으로 쓸 때 제목 · 설명 · 여백 */
  title?: string;
  description?: string;
  role?: 'guardian' | 'recipient';
};

const statusLabel: Record<SetupStatus, string> = {
  on: '켜짐',
  off: '꺼짐',
  manual: '직접 확인',
};

// 당사자 폰 설정 안내 (B-9). 디자인 시안 없음 → 공용 부품으로 구성.
// 보호자가 당사자 폰을 들고 이 화면 하나로 설정을 끝낸다. 상태는 아이콘 + 글자로 (색만으로 구분하지 않음).
export default function RecipientSetupScreen({
  items,
  onBack,
  onDone,
  title = '폰 설정 확인',
  description = '손울림이 꺼져 있거나 화면이 잠겨 있어도 신호를 받으려면 아래 설정이 필요해요.',
  role = 'recipient',
}: Props) {
  const scale = useRoleScale();
  const checkable = items.filter((i) => i.status !== 'manual');
  const done = checkable.filter((i) => i.status === 'on').length;

  return (
    <Screen scroll gap={5} gutter={role === 'recipient' ? 'recipient' : undefined} header={<ScreenHeader onBack={onBack} size={scale.headerSize} />}
      footer={onDone && <Button label="설정 완료" size={scale.buttonSize} onPress={onDone} />}>
      <ScreenTitle title={title} description={description} />
      <Text variant="bodyStrong" accessibilityLiveRegion="polite">
        {`${checkable.length}개 중 ${done}개 켜짐`}
      </Text>
      <Stack gap={3}>
        {items.map((item) => (
          <SetupCard key={item.key} item={item} />
        ))}
      </Stack>
    </Screen>
  );
}

function SetupCard({ item }: { item: SetupItem }) {
  const on = item.status === 'on';
  const label = statusLabel[item.status];

  return (
    <Card variant={on ? 'outline' : 'elevated'}>
      <Stack gap={3}>
        <Row gap={3} align="center" accessible accessibilityLabel={`${item.title}, ${label}. ${item.reason}`}>
          <View style={[styles.badge, on ? styles.badgeOn : item.status === 'off' ? styles.badgeOff : styles.badgeManual]}>
            <Icon name={on ? 'check' : item.status === 'off' ? 'warning' : 'info'} size={18} strokeWidth={2.6} />
          </View>
          <View style={styles.flex}>
            <Text variant="bodyStrong">{item.title}</Text>
            <Text variant="small" color="textSecondary">
              {`${label} · ${item.reason}`}
            </Text>
          </View>
        </Row>
        {item.steps && (
          <Text variant="small" style={styles.steps}>
            {item.steps}
          </Text>
        )}
        {!on && item.actionLabel && item.onAction && (
          <Button label={item.actionLabel} variant={item.status === 'off' ? 'primary' : 'secondary'} onPress={item.onAction} />
        )}
        {on && item.offLabel && item.onOff && (
          <Button label={item.offLabel} variant="text" size="sm" underline={false} onPress={item.onOff} />
        )}
      </Stack>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  badge: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  badgeOn: { borderColor: colors.ink900 },
  badgeOff: { borderColor: colors.ink900, borderStyle: 'dashed' },
  badgeManual: { borderColor: colors.borderInput },
  steps: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    padding: space[3],
  },
});
