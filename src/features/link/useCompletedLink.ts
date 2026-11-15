import { useCallback, useEffect } from 'react';

import { applyLinkRequest } from '@/features/session';

import { linkApi } from './client';
import { useLinkResource } from './useLinkResource';

export function useCompletedLink(requestId: string) {
  const resource = useLinkResource(useCallback((signal: AbortSignal) => linkApi.getRequest(requestId, signal), [requestId]));
  const request = resource.data;
  useEffect(() => { if (request?.status === 'APPROVED') applyLinkRequest(request); }, [request]);
  return { ...resource, request };
}
