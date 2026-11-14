import { ApiError } from '@/api/errors';
import type { SettingsApi } from './api';
import type { SettingsScope } from './controller';

export function createConnectionInbox(options: { scope: () => SettingsScope | null; api: Pick<SettingsApi, 'getCheck' | 'ackCheck'>; onAcknowledged?: () => void }) {
  const inbox = new Map<string, string>();
  let running = false;
  function queue(id: string) {
    const scope = options.scope(); if (!scope) return;
    if (inbox.size >= 32) inbox.delete(inbox.keys().next().value!);
    inbox.set(id, scope.key);
  }
  async function acknowledge(signal?: AbortSignal) {
    if (running) return;
    const scope = options.scope(); if (!scope) { inbox.clear(); return; }
    running = true;
    try {
      for (const [id, owner] of inbox) {
        if (options.scope()?.key !== scope.key || signal?.aborted) return;
        if (owner !== scope.key) { inbox.delete(id); continue; }
        try {
          const check = await options.api.getCheck(id, signal);
          if (options.scope()?.key !== scope.key || signal?.aborted) return;
          if (check.requestedBy !== scope.userId) {
            await options.api.ackCheck(id, signal);
            if (!signal?.aborted && options.scope()?.key === scope.key) options.onAcknowledged?.();
          }
          if (!signal?.aborted && options.scope()?.key === scope.key && inbox.get(id) === scope.key) inbox.delete(id);
        } catch (failure) {
          if (options.scope()?.key !== scope.key || signal?.aborted) return;
          const transient = failure instanceof ApiError && (['NETWORK_ERROR', 'TIMEOUT', 'ABORTED'].includes(failure.code) || failure.status === 429 || (failure.status ?? 0) >= 500);
          if (!transient && inbox.get(id) === scope.key) inbox.delete(id);
        }
      }
    } finally { running = false; }
  }
  return { queue, acknowledge };
}
