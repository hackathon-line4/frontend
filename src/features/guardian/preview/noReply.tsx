import { router } from 'expo-router';

import { mockNoReplyRecord } from '@/features/home';
import GuardianNoReplyScreen from '@/screens/guardian/GuardianNoReplyScreen';

const goBack = () => (router.canGoBack() ? router.back() : router.navigate('/guardian'));

export default function GuardianNoReplyRoute() {
  return (
    <GuardianNoReplyScreen
      record={mockNoReplyRecord}
      onBack={goBack}
      onResend={() => {
        // TODO: 같은 신호(mockNoReplyRecord.signalId) 다시 전송 API + 전송 햅틱
        goBack();
      }}
      onKeepWaiting={goBack}
    />
  );
}
