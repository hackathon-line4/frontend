import { ApiError } from '@/api/errors';
import type { GuardianScope, ServerSignal } from '@/features/guardian/types';
import type { SignalCreation } from './api';

/** An uncertain creation keeps the exact body and key, even after leaving the screen. */
export function createSignalSaver(options: {
  scope: () => GuardianScope | null; createKey: () => string;
  create: (linkId: string, body: SignalCreation, key: string, signal?: AbortSignal) => Promise<ServerSignal>;
}) {
  let owner: string | undefined;
  const intents = new Map<string, { key: string; flight?: Promise<ServerSignal> }>();
  return (body: SignalCreation, signal?: AbortSignal): Promise<ServerSignal> => {
    const scope = options.scope();
    if (!scope) return Promise.reject(new ApiError('ROLE_REQUIRED'));
    if (owner !== scope.key) { intents.clear(); owner = scope.key; }
    const serialized = JSON.stringify(body), snapshot = JSON.parse(serialized) as SignalCreation;
    let intent = intents.get(serialized);
    if (intent?.flight) return intent.flight;
    intent ??= { key: options.createKey() }; intents.set(serialized, intent);
    const current = intent;
    current.flight = (async () => {
      try {
        const result = await options.create(scope.linkId, snapshot, current.key, signal);
        if (options.scope()?.key !== scope.key || signal?.aborted) throw new ApiError('SESSION_CHANGED');
        intents.delete(serialized); return result;
      } catch (failure) {
        if (failure instanceof ApiError && !['NETWORK_ERROR', 'TIMEOUT', 'ABORTED', 'INVALID_RESPONSE', 'SESSION_CHANGED'].includes(failure.code) && (failure.status ?? 0) < 500 && failure.status !== 429) intents.delete(serialized);
        throw failure;
      } finally { current.flight = undefined; }
    })();
    return current.flight;
  };
}
