import { api, ApiError } from '@/api';
import type { createApiClient } from '@/api/client';
import type { IncomingMessage } from '@/api/types';

export type SendKind = 'call' | 'help';
/** locationStatus는 도움 요청에만 쓴다. 위치는 기다리지 않고 PENDING으로 먼저 보낸 뒤 붙인다 */
export type SendBody = { sentAt: string; locationStatus?: 'PENDING' | 'UNAVAILABLE' };
export type Acknowledgement = { deliveredAt: string; waitUntil: string | null };

export function canRetryRecipient(error: unknown) {
  return error instanceof ApiError && (['NETWORK_ERROR', 'TIMEOUT'].includes(error.code) ||
    error.status === 429 || (error.status != null && error.status >= 500));
}

export function createRecipientApi(client: Pick<ReturnType<typeof createApiClient>, 'request'>) {
  const messagePath = (id: string) => `/messages/${encodeURIComponent(id)}`;
  return {
    async incoming(signal?: AbortSignal) {
      const result = await client.request<{ items: IncomingMessage[] }>('/messages/incoming', { signal });
      if (!Array.isArray(result?.items) || result.items.some((item) =>
        !item?.id || !item.signal || !item.playbackPolicy || !['SIGNAL', 'PRACTICE'].includes(item.kind))) {
        throw new ApiError('INVALID_RESPONSE');
      }
      return result.items;
    },
    async send(kind: SendKind, linkId: string, body: SendBody, idempotencyKey?: string, signal?: AbortSignal) {
      const { locationStatus, ...rest } = body;
      const result = await client.request<{ id: string; linkId: string; locationStatus?: string }>(
        `/links/${encodeURIComponent(linkId)}/${kind === 'call' ? 'recipient-signals' : 'help-requests'}`, {
          method: 'POST', creation: true, idempotencyKey, signal,
          body: kind === 'call' ? { ...rest, type: 'CALL_GUARDIAN' } : { ...rest, locationStatus: locationStatus ?? 'UNAVAILABLE', location: null },
        });
      if (!result?.id || result.linkId !== linkId) throw new ApiError('INVALID_RESPONSE', { idempotencyKey });
      return result;
    },
    async acknowledge(id: string, receivedAt: string, signal?: AbortSignal) {
      const result = await client.request<Acknowledgement>(`${messagePath(id)}/ack`, {
        method: 'POST', body: { receivedAt }, signal,
      });
      if (!result || !Number.isFinite(Date.parse(result.deliveredAt)) ||
        (result.waitUntil !== null && !Number.isFinite(Date.parse(result.waitUntil)))) throw new ApiError('INVALID_RESPONSE');
      return result;
    },
    async playback(id: string, count: number, signal?: AbortSignal) {
      await client.request(`${messagePath(id)}/playback`, { method: 'POST', body: { count }, signal });
    },
    async respond(id: string, touchedAt: string, signal?: AbortSignal) {
      const result = await client.request<{ status: string; respondedAt: string; late: boolean }>(`${messagePath(id)}/response`, {
        method: 'POST', body: { touchedAt }, signal,
      });
      if (result?.status !== 'RESPONDED' || !Number.isFinite(Date.parse(result.respondedAt))) throw new ApiError('INVALID_RESPONSE');
      return result;
    },
  };
}

export type RecipientApi = ReturnType<typeof createRecipientApi>;
export const recipientApi = createRecipientApi(api);
