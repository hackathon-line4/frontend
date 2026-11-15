import { useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

import { RecipientScreen } from '@/components';
import { STATUS_RETURN_MS, useTimeout } from '@/features/recipient';

const label = '응답했어요. 잠시 뒤 대기 화면으로 돌아가요';

// 07-5 응답 완료 (design/screens/RecvDone.dc.html). 서버 확인 후에만 표시, 3초 뒤 대기로
export default function RecipientRepliedScreen({ onDone }: { onDone: () => void }) {
  useTimeout(onDone, STATUS_RETURN_MS);

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(label);
  }, []);

  return <RecipientScreen state="replied" accessibilityLabel={label} />;
}
