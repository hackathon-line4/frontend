import { StyleSheet, View, type AccessibilityActionEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, RecipientScreen } from '@/components';
import { colors, space, touch } from '@/theme';

type Props = {
  busy?: boolean;
  guardianName: string;
  onTap: () => void;
  onSend: () => void;
  onHelp: () => void;
  /** 도움 요청을 위해 길게 누르는 동안 1초마다 */
  onHelpTick?: () => void;
  onSettings: () => void;
};

// 스크린리더: 화면 전체가 요소 하나. 기능은 사용자 지정 동작으로 제공.
// activate(스크린리더 두 번 탭) = 신호 보내기, longpress = 도움 요청
const actions = [
  { name: 'activate' },
  { name: 'longpress' },
  { name: 'send', label: '신호 보내기' },
  { name: 'help', label: '도움 요청' },
  { name: 'settings', label: '설정' },
] as const;

// 07-1 대기 (design/screens/RecvIdle.dc.html)
// 한 번 탭: 전송 없음 · 두 번 탭: 07-2 신호 보내기 · 3초 길게: 도움 요청
export default function RecipientIdleScreen({ guardianName, busy = false, onTap, onSend, onHelp, onHelpTick, onSettings }: Props) {
  const insets = useSafeAreaInsets();
  const handleAction = ({ nativeEvent }: AccessibilityActionEvent) => {
    if (busy) return;
    switch (nativeEvent.actionName) {
      case 'activate':
      case 'send':
        onSend();
        break;
      case 'longpress':
      case 'help':
        onHelp();
        break;
      case 'settings':
        onSettings();
        break;
    }
  };

  return (
    <View style={styles.root}>
    <RecipientScreen
      state="idle"
      busy={busy}
      accessibilityLabel={`손울림 대기 중. ${guardianName} 보호자와 연결됨. 두 번 탭하면 신호 보내기, 3초 길게 누르면 도움 요청`}
      onPress={onTap}
      onDoubleTap={onSend}
      onLongPress={onHelp}
      onHoldTick={onHelpTick}
      accessibilityActions={actions}
      onAccessibilityAction={handleAction}
    />
      {/*
        설정은 보호자와 함께 쓰는 기능이라 화면 구석에 작게 둔다 (전체 화면 터치와 겹치지 않는 별도 버튼).
        스크린리더 사용자는 화면 전체의 사용자 지정 동작 '설정'을 쓰므로 이 버튼은 읽지 않는다.
        개발 빌드의 개발 도구 버튼(오른쪽 위)과 겹치지 않게 왼쪽 위에 둔다.
      */}
      <View
        style={[styles.corner, { top: insets.top + space[3], left: insets.left + space[3] }]}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      >
        <IconButton
          icon="tab-settings"
          accessibilityLabel="설정"
          onPress={onSettings}
          disabled={busy}
          color={colors.borderInput}
          size={26}
          touchSize={touch.recipientMin}
          style={styles.cornerButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  corner: { position: 'absolute' },
  cornerButton: { backgroundColor: colors.ink900, borderRadius: 999 },
});
