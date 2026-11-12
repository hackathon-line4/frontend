import { ApiError } from '@/api/errors';
import type { createApiClient } from '@/api/client';
import type { GuardianHome, GuardianMessage, HelpDetail, HistoryItem, MessageDetail, ServerSignal } from './types';

export function isGuardianMessage(value: unknown): value is GuardianMessage {
  const m = value as GuardianMessage | null;
  return !!m && typeof m.id === 'string' && typeof m.linkId === 'string' && !!m.signal?.id && !!m.sender?.id && !!m.receiver?.id &&
    !!m.delivery && !!m.response && !!m.playback && Number.isFinite(Date.parse(m.createdAt));
}
export function createGuardianApi(client: Pick<ReturnType<typeof createApiClient>, 'request'>) {
  const link = (id: string) => `/links/${encodeURIComponent(id)}`;
  const message = (id: string) => `/messages/${encodeURIComponent(id)}`;
  const check = (m: GuardianMessage) => { if (!isGuardianMessage(m)) throw new ApiError('INVALID_RESPONSE'); return m; };
  return {
    async history(id: string, date: string, signal?: AbortSignal) {
      const data = await client.request<{ items: HistoryItem[] }>(`${link(id)}/history?date=${encodeURIComponent(date)}`, { signal });
      if (!Array.isArray(data?.items)) throw new ApiError('INVALID_RESPONSE');
      return data.items;
    },
    async home(id: string, signal?: AbortSignal) {
      const data = await client.request<GuardianHome>(`${link(id)}/home`, { signal });
      if (!data?.recipient?.id || !data.recipient.status || !data.recipient.connection || !Array.isArray(data.favoriteSignals) || !Array.isArray(data.recentActivities)) throw new ApiError('INVALID_RESPONSE');
      return data;
    },
    async signals(id: string, signal?: AbortSignal) {
      const data = await client.request<{ items: ServerSignal[] }>(`${link(id)}/signals`, { signal });
      if (!Array.isArray(data?.items) || data.items.some(s => !s.id || !s.name)) throw new ApiError('INVALID_RESPONSE');
      return data.items;
    },
    async detail(id: string, signal?: AbortSignal) {
      const data = await client.request<MessageDetail>(message(id), { signal });
      check(data?.message);
      if (!Array.isArray(data.timeline)) throw new ApiError('INVALID_RESPONSE');
      return data;
    },
    async send(id: string, signalId: string, key: string, signal?: AbortSignal) {
      return check(await client.request<GuardianMessage>(`${link(id)}/messages`, {
        method: 'POST', creation: true, idempotencyKey: key, body: { signalId }, signal,
      }));
    },
    async resend(id: string, key: string, signal?: AbortSignal) {
      return check(await client.request<GuardianMessage>(`${message(id)}/resend`, { method: 'POST', creation: true, idempotencyKey: key, signal }));
    },
    async extend(id: string, signal?: AbortSignal) {
      return check(await client.request<GuardianMessage>(`${message(id)}/extend-wait`, { method: 'POST', body: {}, signal }));
    },
    async help(id: string, signal?: AbortSignal) {
      const data = await client.request<HelpDetail>(`/help-requests/${encodeURIComponent(id)}`, { signal });
      if (!data?.helpRequest?.id || !Array.isArray(data.followingMessages)) throw new ApiError('INVALID_RESPONSE');
      return data;
    },
    async openHelp(id: string, signal?: AbortSignal) {
      await client.request(`/help-requests/${encodeURIComponent(id)}/receipts`, { method: 'POST', body: { type: 'OPENED' }, signal });
    },
    async receiveCall(id: string, signal?: AbortSignal) {
      await client.request(`/recipient-signals/${encodeURIComponent(id)}/receipts`, { method: 'POST', body: { type: 'DELIVERED' }, signal });
    },
  };
}
export type GuardianApi = ReturnType<typeof createGuardianApi>;
