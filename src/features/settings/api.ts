import { ApiError } from '@/api/errors';
import type { createApiClient } from '@/api/client';
import type { GuardianSettings, RecipientSettings } from './types';

export type ConnectionCheck = { id: string; status: 'PENDING' | 'CONFIRMED' | 'UNCONFIRMED'; requestedBy: string; confirmedAt: string | null; timeoutAt: string };
export type PartnerSettings = { vibration: { intensity: string | null; length: string; repeatCount: number; updatedAt: string | null }; locationSharing: { enabled: boolean; updatedAt: string | null } };
type Notifications = { touchResponseAlert: boolean; noResponseAlert: boolean; responseWaitMinutes: number; helpRequestAlert: boolean };
export function mapNotifications(data: Notifications): GuardianSettings {
  if (!data || typeof data.touchResponseAlert !== 'boolean' || typeof data.noResponseAlert !== 'boolean' || ![5, 10, 30].includes(data.responseWaitMinutes)) throw new ApiError('INVALID_RESPONSE');
  return { replyAlert: data.touchResponseAlert, noReplyAlert: data.noResponseAlert, waitMinutes: data.responseWaitMinutes as GuardianSettings['waitMinutes'] };
}
export function notificationPatch(patch: Partial<GuardianSettings>) {
  return { ...(patch.replyAlert !== undefined ? { touchResponseAlert: patch.replyAlert } : {}), ...(patch.noReplyAlert !== undefined ? { noResponseAlert: patch.noReplyAlert } : {}), ...(patch.waitMinutes !== undefined ? { responseWaitMinutes: patch.waitMinutes } : {}) };
}
export function createSettingsApi(client: Pick<ReturnType<typeof createApiClient>, 'request'>) {
  const check = (data: ConnectionCheck) => {
    if (!data?.id || !data.requestedBy || !['PENDING', 'CONFIRMED', 'UNCONFIRMED'].includes(data.status) || !Number.isFinite(Date.parse(data.timeoutAt))) throw new ApiError('INVALID_RESPONSE');
    if (data.status === 'CONFIRMED' && !Number.isFinite(Date.parse(data.confirmedAt ?? ''))) throw new ApiError('INVALID_RESPONSE');
    return data;
  };
  const location = (data: { enabled: boolean }): RecipientSettings => {
    if (typeof data?.enabled !== 'boolean') throw new ApiError('INVALID_RESPONSE');
    return { shareLocationOnHelp: data.enabled };
  };
  return {
    async guardian(signal?: AbortSignal) { return mapNotifications(await client.request<Notifications>('/me/notification-settings', { signal })); },
    async recipient(signal?: AbortSignal) { return location(await client.request<{ enabled: boolean }>('/me/location-sharing', { signal })); },
    async saveGuardian(patch: Partial<GuardianSettings>, signal?: AbortSignal) {
      return mapNotifications(await client.request<Notifications>('/me/notification-settings', { method: 'PATCH', body: notificationPatch(patch), signal }));
    },
    async saveRecipient(patch: RecipientSettings, signal?: AbortSignal) {
      return location(await client.request<{ enabled: boolean }>('/me/location-sharing', { method: 'PUT', body: { enabled: patch.shareLocationOnHelp }, signal }));
    },
    async partner(linkId: string, signal?: AbortSignal) {
      const data = await client.request<PartnerSettings>(`/links/${encodeURIComponent(linkId)}/partner-settings`, { signal });
      if (!data?.vibration || typeof data.locationSharing?.enabled !== 'boolean') throw new ApiError('INVALID_RESPONSE');
      return data;
    },
    async requestCheck(linkId: string, signal?: AbortSignal) { return check(await client.request<ConnectionCheck>(`/links/${encodeURIComponent(linkId)}/connection-checks`, { method: 'POST', signal })); },
    async getCheck(id: string, signal?: AbortSignal) { return check(await client.request<ConnectionCheck>(`/connection-checks/${encodeURIComponent(id)}`, { signal })); },
    async ackCheck(id: string, signal?: AbortSignal) { await client.request(`/connection-checks/${encodeURIComponent(id)}/ack`, { method: 'POST', signal }); },
  };
}
export type SettingsApi = ReturnType<typeof createSettingsApi>;
