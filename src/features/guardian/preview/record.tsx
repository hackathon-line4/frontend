import { router, useLocalSearchParams } from 'expo-router';
import { Linking, Platform } from 'react-native';

import { sendSignalAgain, useHistoryRecord, useHistoryRecords, type SignalRecord } from '@/features/history';
import { mockRecipient } from '@/features/link/mock';
import HelpRequestDetailScreen from '@/screens/history/HelpRequestDetailScreen';
import HistoryDetailScreen from '@/screens/history/HistoryDetailScreen';
import RecordNotFoundScreen from '@/screens/history/RecordNotFoundScreen';

// 08-2 신호 기록 상세 · 08-3 도움 요청 기록. 기록 종류에 따라 화면을 고른다.
export default function RecordRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const records = useHistoryRecords();
  const record = useHistoryRecord(id);
  const openRecord = (next: string) => router.push({ pathname: '/guardian/record/[id]', params: { id: next } });
  // TODO: 연결된 당사자 정보 (서버)
  const recipientName = mockRecipient.name;

  if (!record) return <RecordNotFoundScreen onBack={() => router.back()} />;

  if (record.type === 'help') {
    const followUps = record.followUpIds
      .map((fid) => records.find((r) => r.id === fid))
      .filter((r): r is SignalRecord => r?.type === 'signal');
    const { location } = record;
    return (
      <HelpRequestDetailScreen
        record={record}
        recipientName={recipientName}
        followUps={followUps}
        onBack={() => router.back()}
        onOpenRecord={openRecord}
        onOpenMap={() => {
          if (!location) return;
          const { latitude: lat, longitude: lng } = location;
          const url = Platform.OS === 'ios' ? `maps:0,0?q=${lat},${lng}` : `geo:${lat},${lng}?q=${lat},${lng}`;
          Linking.openURL(url).catch(() => Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`));
        }}
      />
    );
  }

  const relatedHelp = records.find((r) => r.id === record.relatedHelpId && r.type === 'help');
  return (
    <HistoryDetailScreen
      record={record}
      recipientName={recipientName}
      relatedHelp={relatedHelp?.type === 'help' ? relatedHelp : undefined}
      onBack={() => router.back()}
      onOpenRecord={openRecord}
      onSendAgain={() => {
        sendSignalAgain(record.id);
        router.back();
      }}
    />
  );
}
