import { useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type AccessibilityActionEvent,
  type AccessibilityActionInfo,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors, radius, space, typography } from '@/theme';

import { Text } from './Text';

// 당사자 앱 화면. 화면 전체가 버튼 1개 (분할·작은 버튼 없음).
// 상태는 화면 전체 색 + 가운데 큰 도형으로 구분. 노랑 + 흰색 조합 금지.
// sent · replied 는 서버 확인 후에만 표시.
export type RecipientState = 'idle' | 'compose' | 'sent' | 'incoming' | 'replied';

type RecipientScreenProps = {
  state: RecipientState;
  /** 보낸 사람·신호 이름·할 수 있는 동작 포함 */
  accessibilityLabel: string;
  /** incoming: 신호 이름 · compose: 보낼 신호 이름 */
  signalName?: string;
  onPress?: () => void;
  /** idle: 두 번 탭 = 보내기 화면 */
  onDoubleTap?: () => void;
  /** idle: 3초 길게 = 도움 요청 */
  onLongPress?: () => void;
  /** 스크린리더 사용자 지정 동작 */
  accessibilityActions?: readonly AccessibilityActionInfo[];
  onAccessibilityAction?: (event: AccessibilityActionEvent) => void;
};

const DOUBLE_TAP_MS = 350;
const LONG_PRESS_MS = 3000;

const backgrounds: Record<RecipientState, string> = {
  idle: colors.rBlack,
  compose: colors.rBlack,
  sent: colors.rYellow,
  incoming: colors.rYellow,
  replied: colors.rBlack,
};

export function RecipientScreen({
  state,
  accessibilityLabel,
  signalName,
  onPress,
  onDoubleTap,
  onLongPress,
  accessibilityActions,
  onAccessibilityAction,
}: RecipientScreenProps) {
  const lastTap = useRef(0);
  const isStatus = state === 'sent' || state === 'replied';

  const handlePress = () => {
    if (onDoubleTap) {
      const now = Date.now();
      if (now - lastTap.current < DOUBLE_TAP_MS) {
        lastTap.current = 0;
        onDoubleTap();
        return;
      }
      lastTap.current = now;
    }
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress}
      delayLongPress={LONG_PRESS_MS}
      accessibilityRole={isStatus ? undefined : 'button'}
      accessibilityLabel={accessibilityLabel}
      accessibilityLiveRegion={isStatus ? 'polite' : undefined}
      accessibilityActions={accessibilityActions}
      onAccessibilityAction={onAccessibilityAction}
      style={[styles.root, { backgroundColor: backgrounds[state] }]}
    >
      <View importantForAccessibility="no-hide-descendants" style={styles.center}>
        <Figure state={state} signalName={signalName} />
      </View>
    </Pressable>
  );
}

function SendGlyph({ size, background }: { size: number; background: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21.5 2.5L2.5 10.2l7.3 3.1 3.1 7.7z"
        fill={colors.rBlack}
        stroke={colors.rBlack}
        strokeWidth={1.3}
        strokeLinejoin="round"
      />
      <Path d="M21.5 2.5L9.8 13.3" stroke={background} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function Figure({ state, signalName }: { state: RecipientState; signalName?: string }) {
  switch (state) {
    case 'idle':
      return (
        <Svg width={280} height={280} viewBox="0 0 280 280">
          <Circle cx="140" cy="140" r="122" fill="none" stroke={colors.rYellow} strokeWidth={32} />
        </Svg>
      );
    case 'compose':
      return (
        <View style={styles.composeWrap}>
          <View style={styles.composeCircle}>
            <View style={styles.composeGlyph}>
              <SendGlyph size={170} background={colors.rYellow} />
            </View>
          </View>
          {signalName && <Text style={[styles.composeText, { color: colors.rYellow }]}>{signalName}</Text>}
        </View>
      );
    case 'sent':
      return (
        <View style={styles.sentWrap}>
          <SendGlyph size={280} background={colors.rYellow} />
          <Text style={styles.sentText}>보냈어요</Text>
        </View>
      );
    case 'incoming':
      return (
        <View style={styles.incomingCircle}>
          <Text style={styles.incomingText}>{signalName}</Text>
        </View>
      );
    case 'replied':
      return (
        <Svg width={320} height={320} viewBox="0 0 320 320">
          <Path
            d="M48 168 l76 76 l148 -164"
            fill="none"
            stroke={colors.rYellow}
            strokeWidth={48}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composeWrap: {
    alignItems: 'center',
    gap: space[10],
  },
  composeCircle: {
    width: 300,
    height: 300,
    borderRadius: radius.full,
    backgroundColor: colors.rYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 종이비행기 글리프의 시각 중심을 원 가운데로
  composeGlyph: {
    paddingRight: space[3],
  },
  composeText: {
    ...typography.rTitle,
    fontSize: 34,
    lineHeight: 46,
  },
  sentWrap: {
    alignItems: 'center',
    gap: space[10],
  },
  sentText: {
    ...typography.display,
    color: colors.rBlack,
  },
  incomingCircle: {
    width: 320,
    height: 320,
    borderRadius: radius.full,
    backgroundColor: colors.rBlack,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space[10],
  },
  incomingText: {
    ...typography.rDisplay,
    fontSize: 46,
    lineHeight: 53,
    letterSpacing: 46 * -0.04,
    color: colors.rYellow,
    textAlign: 'center',
  },
});
