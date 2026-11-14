import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import GuardianNoReplyScreen from '@/screens/guardian/GuardianNoReplyScreen';
import HistoryDetailScreen from '@/screens/history/HistoryDetailScreen';
import HelpRequestDetailScreen from '@/screens/history/HelpRequestDetailScreen';
import RecipientCallDetailScreen from '@/screens/history/RecipientCallDetailScreen';
import { useSession } from '@/features/session';
import { openInMaps } from '@/features/location';
import { guardianApi, guardianStore } from './client';
import { GuardianFeedback } from './Feedback';
import { useGuardianMessage, useGuardianMutation, useGuardianState } from './hooks';
import { helpRecords, localTime, toNoReply, toRecord } from './models';

const openRecord = (id: string) => router.replace({ pathname: '/guardian/record/[id]', params: { id } });
export function GuardianMessageDetails({ id }: { id?: string }) {
  const message = useGuardianMessage(id);
  const { data, scope } = useGuardianState();
  const mutation = useGuardianMutation();
  if (!scope || !id) return <GuardianFeedback message="확인할 신호가 없어요" />;
  const detail = data?.details[id];
  if (!message || !detail) return <GuardianFeedback message={data?.errors[`message:${id}`] || '신호 기록을 불러오는 중이에요'} onRetry={() => { void guardianStore.loadMessage(id, true); }} />;
  const resend = () => { void mutation.run(async abort => {
    const result = await guardianStore.resend(id, abort);
    if (!abort.aborted) openRecord(result.id);
  }); };
  if (message.delivery.status === 'DELIVERED' && message.response.status === 'NO_RESPONSE') {
    return <GuardianNoReplyScreen record={toNoReply({ ...detail, message })} onBack={() => router.back()}
      onResend={resend} onKeepWaiting={() => { void mutation.run(abort => guardianStore.extend(id, abort)); }}
      busy={mutation.busy} error={mutation.error} canResend={detail.canResend} canExtendWait={detail.canExtendWait} />;
  }
  return <HistoryDetailScreen record={toRecord(message)} recipientName={message.receiver.name} onBack={() => router.back()}
    onOpenRecord={openRecord} onSendAgain={resend} busy={mutation.busy} error={mutation.error} canResend={detail.canResend} />;
}

export function GuardianOtherDetails({ id, kind }: { id: string; kind: string }) {
  const { data, scope } = useGuardianState();
  const session = useSession();
  const scopeKey = scope?.key;
  useFocusEffect(useCallback(() => {
    if (!scopeKey) return;
    if (kind === 'HELP_REQUEST') { void guardianStore.loadHelp(id); return guardianStore.watchHelp(id); }
    const controller = new AbortController();
    void guardianApi.receiveCall(id, controller.signal).then(() => guardianStore.loadHome(true)).catch(() => {});
    return () => controller.abort();
  }, [id, kind, scopeKey]));
  if (!scope) return <GuardianFeedback message="당사자를 먼저 연결해 주세요" />;
  const help = data?.helps[id];
  if (kind === 'HELP_REQUEST' && !help) return <GuardianFeedback message={data?.errors[`help:${id}`] || '도움 요청을 불러오는 중이에요'} onRetry={() => { void guardianStore.loadHelp(id, true); }} />;
  if (help) {
    const { record, followUps } = helpRecords(help);
    return <HelpRequestDetailScreen record={record} followUps={followUps} recipientName={help.helpRequest.sender.name} onBack={() => router.back()} onOpenRecord={openRecord}
      onOpenMap={record.location ? () => { void openInMaps(record.location!, `${help.helpRequest.sender.name}님이 도움을 요청한 곳`); } : undefined} />;
  }
  const item = data?.home?.recentActivities.find(item => item.id === id) ?? Object.values(data?.histories ?? {}).flat().find(item => item.id === id);
  const time = (value?: string | null) => (value ? localTime(value) : undefined);
  return <RecipientCallDetailScreen
    recipientName={data?.home?.recipient.name ?? '당사자'}
    guardianName={session.user?.name ?? '보호자'}
    sentAt={localTime(item?.occurredAt)}
    arrivedAt={time(item?.delivery.at)}
    openedAt={time(item?.openedAt)}
    onBack={() => router.back()} />;
}
