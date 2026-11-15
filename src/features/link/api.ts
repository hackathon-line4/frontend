import { ApiError, type LinkRequest } from '@/api';
import type { createApiClient } from '@/api/client';

export type LinkCode = { code: string; qrPayload: string; createdAt: string; expiresAt: string };
export type VerifiedCode = { guardian: { id: string; name: string }; expiresAt: string };
export const requestStatusMessage = {
  PENDING: '보호자의 확인을 기다리고 있어요',
  APPROVED: '연결됐어요',
  REJECTED: '보호자가 연결 요청을 거절했어요. 코드를 확인하고 다시 요청해 주세요.',
  CANCELED: '연결 요청이 취소됐어요.',
  EXPIRED: '연결 요청이 만료됐어요. 보호자에게 새 코드를 받아 주세요.',
};

export function createLinkApi(client: Pick<ReturnType<typeof createApiClient>, 'request'>) {
  const checkCode = (result: LinkCode): LinkCode => {
    if (!result || !/^\d{6}$/.test(result.code) || !Number.isFinite(Date.parse(result.expiresAt))) throw new ApiError('INVALID_RESPONSE');
    return result;
  };
  const requestPath = (id: string) => {
    if (!id) throw new ApiError('INVALID_RESPONSE');
    return `/link-requests/${encodeURIComponent(id)}`;
  };
  const checkRequest = (result: LinkRequest): LinkRequest => {
    if (!result?.id || !Object.hasOwn(requestStatusMessage, result.status) || !result.guardian?.id || !result.recipient?.id ||
      (result.status === 'APPROVED' && !result.link?.id)) throw new ApiError('INVALID_RESPONSE');
    return result;
  };
  return {
    async currentCode(signal?: AbortSignal) {
      try { return checkCode(await client.request<LinkCode>('/link-codes/current', { signal })); }
      catch (error) { if (error instanceof ApiError && error.code === 'NOT_FOUND') return null; throw error; }
    },
    async createCode(idempotencyKey?: string) {
      return checkCode(await client.request<LinkCode>('/link-codes', { method: 'POST', creation: true, idempotencyKey }));
    },
    async verify(code: string) {
      if (!/^\d{6}$/.test(code)) throw new ApiError('VALIDATION_FAILED', { message: '숫자 6자리를 입력해 주세요', field: 'code' });
      const result = await client.request<VerifiedCode>('/link-codes/verify', { method: 'POST', body: { code } });
      if (!result?.guardian?.id || !result.guardian.name || !Number.isFinite(Date.parse(result.expiresAt))) throw new ApiError('INVALID_RESPONSE');
      return result;
    },
    async createRequest(code: string, idempotencyKey?: string) {
      return checkRequest(await client.request<LinkRequest>('/link-requests', { method: 'POST', body: { code }, creation: true, idempotencyKey }));
    },
    async getRequest(id: string, signal?: AbortSignal) {
      return checkRequest(await client.request<LinkRequest>(requestPath(id), { signal }));
    },
    async receivedRequests(signal?: AbortSignal) {
      const result = await client.request<{ items: LinkRequest[] }>('/link-requests?status=PENDING', { signal });
      if (!Array.isArray(result?.items)) throw new ApiError('INVALID_RESPONSE');
      return result.items.map(checkRequest);
    },
    async decide(id: string, action: 'approve' | 'reject' | 'cancel') {
      try { return checkRequest(await client.request<LinkRequest>(`${requestPath(id)}/${action}`, { method: 'POST' })); }
      catch (error) {
        // Another device may have decided while this screen was open. Read the actual outcome.
        if (!(error instanceof ApiError) || error.code !== 'LINK_REQUEST_NOT_PENDING') throw error;
        return checkRequest(await client.request<LinkRequest>(requestPath(id)));
      }
    },
  };
}
