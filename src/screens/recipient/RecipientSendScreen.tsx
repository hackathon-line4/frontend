import type { AccessibilityActionEvent } from 'react-native';

import { RecipientScreen } from '@/components';
import { SEND_IDLE_TIMEOUT_MS, useTimeout } from '@/features/recipient';

type Props = {
  busy?: boolean;
  guardianName: string;
  signalName: string;
  onSend: () => void;
  onHelp: () => void;
  /** 도움 요청을 위해 길게 누르는 동안 1초마다 */
  onHelpTick?: () => void;
  /** 10초 동안 터치가 없으면 보내지 않고 대기로 */
  onTimeout: () => void;
};

const actions = [{ name: 'activate' }, { name: 'longpress' }, { name: 'help', label: '도움 요청' }] as const;

// 07-2 신호 보내기. 화면 어디든 한 번 누르면 전송한다 (대기 화면에서 이미 두 번 탭으로 들어왔으므로).
// 스크린리더 사용자는 평소처럼 두 번 탭(활성화)으로 보낸다.
export default function RecipientSendScreen({ guardianName, signalName, busy = false, onSend, onHelp, onHelpTick, onTimeout }: Props) {
  useTimeout(onTimeout, busy ? null : SEND_IDLE_TIMEOUT_MS);

  const handleAction = ({ nativeEvent }: AccessibilityActionEvent) => {
    if (busy) return;
    if (nativeEvent.actionName === 'activate') onSend();
    else onHelp();
  };

  return (
    <RecipientScreen
      state="compose"
      busy={busy}
      signalName={signalName}
      accessibilityLabel={`${signalName} 보내기. 화면 어디든 누르면 ${guardianName} 보호자에게 보내요`}
      onPress={onSend}
      onLongPress={onHelp}
      onHoldTick={onHelpTick}
      accessibilityActions={actions}
      onAccessibilityAction={handleAction}
    />
  );
}
