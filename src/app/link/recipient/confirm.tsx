import { router } from 'expo-router';
import { useState } from 'react';

import { mockGuardian } from '@/features/link/mock';
import RecipientConfirmScreen from '@/screens/link/RecipientConfirmScreen';

// TODO: 연결 요청 API. 보호자가 승인하면 /link/recipient/done 으로 이동
export default function RecipientConfirmRoute() {
  const [waiting, setWaiting] = useState(false);

  return (
    <RecipientConfirmScreen
      guardianName={mockGuardian.name}
      waiting={waiting}
      onConfirm={() => setWaiting(true)}
      onCancel={() => (waiting ? setWaiting(false) : router.back())}
    />
  );
}
