import { Stack, StatusChip, Text } from '@/components';
import type { GuardianMessage } from './types';

export function MessageStatus({ message }: { message: GuardianMessage }) {
  const delivery = message.delivery.status;
  return <Stack gap={3} accessibilityLiveRegion="polite">
    <Text variant="label">기기 전달</Text>
    <StatusChip status={delivery === 'DELIVERED' ? 'delivered' : delivery === 'FAILED' ? 'failed' : 'unconfirmed'}
      label={delivery === 'DELIVERED' ? '기기에 전달됨' : delivery === 'FAILED' ? '전달 실패' : delivery === 'REQUESTED' ? '전달 요청 중' : '전달 확인 안 됨'} />
    <Text variant="label">터치 응답</Text>
    {message.kind === 'PRACTICE' ? <Text>연습 신호는 응답을 받지 않아요.</Text> : delivery !== 'DELIVERED' || !message.response.status
      ? <Text color="textSecondary">기기에 전달된 뒤부터 확인할 수 있어요.</Text>
      : <StatusChip status={message.response.status === 'RESPONDED' ? 'replied' : message.response.status === 'NO_RESPONSE' ? 'noReply' : 'waiting'} />}
  </Stack>;
}
