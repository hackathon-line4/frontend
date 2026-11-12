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

// 07-2 신호 보내기. 화면 어디든 두 번 탭하면 전송한다.
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
      accessibilityLabel={`${signalName} 보내기. 화면 어디든 두 번 탭하면 ${guardianName} 보호자에게 보내요`}
      onDoubleTap={onSend}
      onLongPress={onHelp}
      onHoldTick={onHelpTick}
      accessibilityActions={actions}
      onAccessibilityAction={handleAction}
    />
  );
}
