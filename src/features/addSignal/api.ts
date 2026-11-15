import { ApiError } from '@/api/errors';
import type { createApiClient } from '@/api/client';
import type { ServerSignal } from '@/features/guardian/types';
import type { ServerBeat } from '@/api/types';

export type Template = Omit<ServerSignal, 'source' | 'practiced'> & { alreadyAdded: boolean };
export type Preset = { id: string; rhythm: ServerBeat[]; durationMs: number; usedBy: { signalId: string; name: string } | null };
export type SignalCreation = { source: 'TEMPLATE'; templateId: string } | { source: 'CUSTOM'; name: string; description: string; category: string; icon: string; rhythm: ServerBeat[]; presetId?: string };
export function createSignalApi(client: Pick<ReturnType<typeof createApiClient>, 'request'>) {
  const root = (id: string) => `/links/${encodeURIComponent(id)}/signals`;
  return {
    async templates(linkId: string, signal?: AbortSignal) {
      const result = await client.request<{ items: Template[] }>(`/signal-templates?linkId=${encodeURIComponent(linkId)}`, { signal });
      if (!Array.isArray(result?.items)) throw new ApiError('INVALID_RESPONSE');
      return result.items;
    },
    async presets(linkId: string, signal?: AbortSignal) {
      const result = await client.request<{ items: Preset[] }>(`/rhythm-presets?linkId=${encodeURIComponent(linkId)}`, { signal });
      if (!Array.isArray(result?.items)) throw new ApiError('INVALID_RESPONSE');
      return result.items;
    },
    async create(linkId: string, body: SignalCreation, key: string, signal?: AbortSignal) {
      const result = await client.request<ServerSignal>(root(linkId), { method: 'POST', creation: true, idempotencyKey: key, body, signal });
      if (!result?.id || !result.name || !Array.isArray(result.pulses)) throw new ApiError('INVALID_RESPONSE');
      return result;
    },
    /** 신호 수정. 기본 신호는 이름 · 리듬을 바꿀 수 없다 (서버 SIGNAL_NOT_EDITABLE) */
    async update(linkId: string, signalId: string, patch: { name?: string; description?: string; category?: string }, signal?: AbortSignal) {
      const result = await client.request<ServerSignal>(`${root(linkId)}/${encodeURIComponent(signalId)}`, { method: 'PATCH', body: patch, signal });
      if (!result?.id) throw new ApiError('INVALID_RESPONSE');
      return result;
    },
    async remove(linkId: string, signalId: string, signal?: AbortSignal) {
      await client.request(`${root(linkId)}/${encodeURIComponent(signalId)}`, { method: 'DELETE', signal });
    },
    async rhythmCheck(linkId: string, rhythm: ServerBeat[], signal?: AbortSignal) {
      const result = await client.request<{ valid: boolean; conflictSignal: { id: string; name: string } | null }>(`${root(linkId)}/rhythm-check`, { method: 'POST', body: { rhythm }, signal });
      if (typeof result?.valid !== 'boolean') throw new ApiError('INVALID_RESPONSE');
      return result;
    },
  };
}
