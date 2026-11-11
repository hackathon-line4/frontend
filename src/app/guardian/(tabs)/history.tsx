import { router } from 'expo-router';

import { resendSignal, useHistoryRecords } from '@/features/history';
import { mockRecipient } from '@/features/link/mock';
import { useSession } from '@/features/session';
import GuardianHistory from '@/features/guardian/History';
import HistoryListScreen from '@/screens/history/HistoryListScreen';

export default function HistoryRoute() {
  const session = useSession();
  return __DEV__ && !session.tokens ? <PreviewHistory /> : <GuardianHistory />;
}

function PreviewHistory() {
  const records = useHistoryRecords();
  return (
    <HistoryListScreen
      // TODO: 연결된 당사자 정보 (서버)
      recipientName={mockRecipient.name}
      records={records}
      onOpenRecord={(id) => router.push({ pathname: '/guardian/record/[id]', params: { id } })}
      onResend={resendSignal}
    />
  );
}
