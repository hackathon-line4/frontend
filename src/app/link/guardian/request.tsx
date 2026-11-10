import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect } from 'react';

import { requestStatusMessage } from '@/features/link/api';
import { linkApi } from '@/features/link/client';
import { LinkFeedback } from '@/features/link/LinkFeedback';
import { useLinkResource } from '@/features/link/useLinkResource';
import { applyLinkRequest } from '@/features/session';
import GuardianLinkRequestScreen from '@/screens/link/GuardianLinkRequestScreen';

export default function GuardianLinkRequestRoute() {
  const params = useLocalSearchParams<{ requestId?: string }>();
  const id = typeof params.requestId === 'string' ? params.requestId : '';
  const resource = useLinkResource(useCallback((signal: AbortSignal) => linkApi.getRequest(id, signal), [id]), true);
  const request = resource.data;
  useEffect(() => {
    if (request) applyLinkRequest(request);
    if (request?.status === 'APPROVED') router.replace({ pathname: '/link/guardian/done', params: { requestId: request.id } });
  }, [request]);
  const decide = (action: 'approve' | 'reject') => { void resource.run(() => linkApi.decide(id, action), resource.setData); };
  if (resource.busy) return <LinkFeedback message="요청을 처리하고 있어요…" busy />;
  if (resource.error) return <LinkFeedback message={resource.error} onRetry={resource.retry} onBack={() => router.replace('/link/guardian/code')} />;
  if (!request) return <LinkFeedback message="연결 요청을 확인하고 있어요…" busy />;
  if (request.status !== 'PENDING') return <LinkFeedback message={requestStatusMessage[request.status]} onBack={() => router.replace('/link/guardian/code')} />;
  return <GuardianLinkRequestScreen recipientName={request.recipient.name} code={request.code} method="code"
    requestedAt={new Date(request.requestedAt).toLocaleString('ko-KR')} onBack={() => router.replace('/link/guardian/code')}
    onAccept={() => decide('approve')} onReject={() => decide('reject')} />;
}
