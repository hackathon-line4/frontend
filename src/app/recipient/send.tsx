import { router } from 'expo-router';
import { useRef } from 'react';

import { backToIdle, connectedGuardian, outgoingSignalName, requestHelp, sendSignal } from '@/features/recipient';
import RecipientSendScreen from '@/screens/recipient/RecipientSendScreen';

export default function RecipientSendRoute() {
  const sending = useRef(false);

  const handleSend = async () => {
    if (sending.current) return;
    sending.current = true;
    const ok = await sendSignal(outgoingSignalName);
    sending.current = false;
    // 서버 확인 후에만 '보냄'. 실패하면 이 화면 유지
    if (ok) router.replace('/recipient/sent');
  };

  return (
    <RecipientSendScreen
      guardianName={connectedGuardian.name}
      signalName={outgoingSignalName}
      onSend={handleSend}
      onHelp={requestHelp}
      onTimeout={backToIdle}
    />
  );
}
