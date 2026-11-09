import type { AccessibilityActionEvent } from 'react-native';

import { RecipientScreen } from '@/components';

type Props = {
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
export default function RecipientIdleScreen({ guardianName, onTap, onSend, onHelp, onHelpTick, onSettings }: Props) {
  const handleAction = ({ nativeEvent }: AccessibilityActionEvent) => {
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
    <RecipientScreen
      state="idle"
      accessibilityLabel={`손울림 대기 중. ${guardianName} 보호자와 연결됨. 두 번 탭하면 신호 보내기, 3초 길게 누르면 도움 요청`}
      onPress={onTap}
      onDoubleTap={onSend}
      onLongPress={onHelp}
      onHoldTick={onHelpTick}
      accessibilityActions={actions}
      onAccessibilityAction={handleAction}
    />
  );
}
