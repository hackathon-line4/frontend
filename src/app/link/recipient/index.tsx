import { router } from 'expo-router';

import RecipientCodeEntryScreen from '@/screens/link/RecipientCodeEntryScreen';

// TODO: 코드 확인 API. 실패(코드 틀림·만료·거절) 시 error='코드를 다시 확인해 주세요'
export default function RecipientCodeEntryRoute() {
  return (
    <RecipientCodeEntryScreen
      onBack={() => router.back()}
      onScanQr={() => router.push('/link/recipient/scan')}
      onSubmit={() => router.push('/link/recipient/confirm')}
    />
  );
}
