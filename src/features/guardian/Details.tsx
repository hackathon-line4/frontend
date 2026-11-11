import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Button, Screen, ScreenHeader, ScreenTitle, Stack, Text } from '@/components';
import GuardianNoReplyScreen from '@/screens/guardian/GuardianNoReplyScreen';
import HistoryDetailScreen from '@/screens/history/HistoryDetailScreen';
import { guardianApi, guardianStore } from './client';
import { GuardianFeedback } from './Feedback';
import { useGuardianMessage, useGuardianMutation, useGuardianState } from './hooks';
import { localTime, toNoReply, toRecord } from './models';

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
  const item = data?.home?.recentActivities.find(item => item.id === id) ?? Object.values(data?.histories ?? {}).flat().find(item => item.id === id);
  return <Screen scroll header={<ScreenHeader title="당사자 신호" onBack={() => router.back()} />}>
    <Stack gap={4}>
      <ScreenTitle title={kind === 'HELP_REQUEST' ? '도움 요청' : item?.title ?? '보호자 호출'} />
      <Text>{help?.helpRequest.sender.name ?? data?.home?.recipient.name}님이 보낸 신호예요.</Text>
      <Text>{localTime(help?.helpRequest.sentAt ?? item?.occurredAt)}</Text>
      {help && <>
        <Text>{help.helpRequest.guardianOpenedAt ? '요청을 열어 봤어요.' : '요청 확인을 기록하고 있어요.'}</Text>
        <Text>{help.helpRequest.location ? `요청 당시 위치: ${help.helpRequest.location.address ?? `${help.helpRequest.location.latitude}, ${help.helpRequest.location.longitude}`}` : '이 요청에 공유된 위치가 없어요.'}</Text>
        {help.followingMessages.map(message => <Button key={message.id} variant="secondary" label={message.signalName} onPress={() => openRecord(message.id)} />)}
      </>}
    </Stack>
  </Screen>;
}
