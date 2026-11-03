import { StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components';
import { colors, fontFamily, radius, space } from '@/theme';

import type { ConnectionState } from './types';

// 09 연결 상태 문구 (role=status). 위험을 단정하는 말은 쓰지 않는다.
// 연결됨: 노란 바탕 + 고리 아이콘 · 연결 확인 안 됨: 점선 테두리 + 끊어진 고리 아이콘

type Props = {
  connection: ConnectionState;
  /** 상대 이름 (김하늘) */
  name: string;
};

export function ConnectionStatusBox({ connection, name }: Props) {
  const connected = connection.status === 'connected';
  const title = connected ? '연결됨' : '연결 확인 안 됨';
  const body = connected
    ? `${connection.lastCheckedAt}에 ${name}의 휴대폰과 연결을 확인했어요.`
    : `${name}의 휴대폰과 마지막으로 연결을 확인한 시각은 ${connection.lastCheckedAt}이에요. 지금 보내는 신호는 전달되지 않을 수 있어요.`;

  return (
    <View
      accessible
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${title}. ${body}`}
      style={[styles.box, connected ? styles.connected : styles.unconfirmed]}
    >
      <View style={styles.icon}>
        <Icon name={connected ? 'link' : 'link-off'} size={20} strokeWidth={2.4} />
      </View>
      <Text variant="label" style={styles.text}>
        <Text variant="label">{title}</Text>
        {'\n'}
        {body}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[3],
    paddingVertical: space[3],
    paddingHorizontal: space[4],
    borderRadius: radius.sm,
  },
  connected: { backgroundColor: colors.yellow100 },
  unconfirmed: { backgroundColor: colors.surface, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.ink900 },
  icon: { paddingTop: 2 },
  text: { flex: 1, fontFamily: fontFamily.regular, lineHeight: 22 },
});
