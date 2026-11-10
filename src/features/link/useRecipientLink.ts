import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError, type LinkRequest } from '@/api';
import { applyLinkRequest, useSession } from '@/features/session';

import type { VerifiedCode } from './api';
import { linkApi } from './client';
import { useLinkResource } from './useLinkResource';

type State = { kind: 'verified'; code: string; target: VerifiedCode } | { kind: 'request'; request: LinkRequest };

export function useRecipientLink(code: string, requestId: string) {
  const session = useSession();
  const [createdId, setCreatedId] = useState(() => requestId || session.pendingLinkRequest?.id || '');
  const id = createdId || requestId;
  const retryKey = useRef<string | undefined>(undefined);
  const resource = useLinkResource<State>(useCallback(async (signal: AbortSignal) => {
    if (id) return { kind: 'request', request: await linkApi.getRequest(id, signal) };
    return { kind: 'verified', code, target: await linkApi.verify(code) };
  }, [id, code]), !!id);
  const request = resource.data?.kind === 'request' ? resource.data.request : undefined;
  useEffect(() => {
    if (request) applyLinkRequest(request);
    if (request?.status === 'APPROVED') router.replace({ pathname: '/link/recipient/done', params: { requestId: request.id } });
  }, [request]);
  const create = () => {
    if (resource.data?.kind !== 'verified') return;
    void resource.run(async () => {
      try {
        const result = await linkApi.createRequest(code, retryKey.current);
        retryKey.current = undefined;
        return result;
      } catch (error) {
        if (error instanceof ApiError) retryKey.current = error.idempotencyKey;
        throw error;
      }
    }, (result) => {
      applyLinkRequest(result);
      setCreatedId(result.id);
      router.setParams({ requestId: result.id });
      resource.setData({ kind: 'request', request: result });
    });
  };
  const cancel = () => {
    if (!id) { router.replace('/link/recipient'); return; }
    void resource.run(() => linkApi.decide(id, 'cancel'), (result) => {
      applyLinkRequest(result);
      resource.setData({ kind: 'request', request: result });
    });
  };
  return { ...resource, create, cancel, request };
}
