import { router } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';

import { ApiError } from '@/api';
import { Button, Screen, Text } from '@/components';
import { linkApi } from '@/features/link/client';
import { LinkFeedback } from '@/features/link/LinkFeedback';
import { useLinkResource } from '@/features/link/useLinkResource';
import GuardianLinkCodeScreen from '@/screens/link/GuardianLinkCodeScreen';

export default function GuardianLinkCodeRoute() {
  const code = useLinkResource(useCallback((signal: AbortSignal) => linkApi.currentCode(signal), []));
  const requests = useLinkResource(useCallback((signal: AbortSignal) => linkApi.receivedRequests(signal), []), true);
  const retryKey = useRef<string | undefined>(undefined);
  const incoming = requests.data?.find((request) => request.status === 'PENDING');
  useEffect(() => {
    if (incoming) router.replace({ pathname: '/link/guardian/request', params: { requestId: incoming.id } });
  }, [incoming]);
  const create = () => {
    void code.run(async () => {
      try {
        const result = await linkApi.createCode(retryKey.current);
        retryKey.current = undefined;
        return result;
      } catch (error) {
        if (error instanceof ApiError) retryKey.current = error.idempotencyKey;
        throw error;
      }
    }, code.setData);
  };
  if (code.busy) return <LinkFeedback message="코드를 만들고 있어요…" busy />;
  if (code.error) return <LinkFeedback message={code.error} onRetry={() => { if (retryKey.current) create(); else code.retry(); }} onBack={() => router.back()} />;
  if (!code.ready) return <LinkFeedback message="연결 코드를 확인하고 있어요…" busy />;
  if (!code.data) return <Screen gap={4} reserveHeader="lg">
    <Text>보호자와 당사자를 연결할 코드를 만들어 주세요.</Text>
    <Button label="코드 만들기" onPress={create} />
    <Button label="돌아가기" variant="secondary" onPress={() => router.back()} />
  </Screen>;
  return <GuardianLinkCodeScreen code={code.data.code} expiresAt={Date.parse(code.data.expiresAt)}
    requestError={requests.error} onRetryRequests={requests.retry} onBack={() => router.back()} onRenew={create} />;
}
