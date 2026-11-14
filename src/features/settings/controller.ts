import { ApiError, errorMessage } from '@/api/errors';
import type { GuardianSettings, RecipientSettings } from './types';
import type { ConnectionCheck, PartnerSettings, SettingsApi } from './api';

export type SettingsScope = { key: string; userId: string; role: 'guardian' | 'recipient'; linkId?: string };
type State = { scope: string | null; guardian: GuardianSettings | null; recipient: RecipientSettings | null; partner: PartnerSettings | null; check: ConnectionCheck | null; loading: boolean; saving: boolean; error: string };
const empty = (scope: string | null): State => ({ scope, guardian: null, recipient: null, partner: null, check: null, loading: false, saving: false, error: '' });
export function createSettingsController(options: { api: SettingsApi; scope: () => SettingsScope | null; confirmed: (id: string) => void }) {
  let state = empty(null), generation = 0;
  let read: AbortController | undefined, poll: AbortController | undefined;
  const listeners = new Set<() => void>();
  const update = (patch: Partial<State>) => { state = { ...state, ...patch }; listeners.forEach(fn => fn()); };
  const valid = (scope: SettingsScope) => options.scope()?.key === scope.key && state.scope === scope.key;
  function stop() { generation++; read?.abort(); read = undefined; poll?.abort(); poll = undefined; update({ loading: false }); }
  function bind() { const scope = options.scope(); if (state.scope !== (scope?.key ?? null)) { stop(); state = empty(scope?.key ?? null); listeners.forEach(fn => fn()); } return scope; }
  async function load() {
    const scope = bind(); if (!scope || read || state.saving) return;
    const request = new AbortController(); read = request;
    const version = generation;
    update({ loading: true, error: '' });
    try {
      if (scope.role === 'guardian') {
        const [guardian, partner] = await Promise.all([options.api.guardian(request.signal), scope.linkId ? options.api.partner(scope.linkId, request.signal) : Promise.resolve(null)]);
        if (valid(scope) && version === generation && !request.signal.aborted) update({ guardian, partner });
      } else {
        const recipient = await options.api.recipient(request.signal);
        if (valid(scope) && version === generation && !request.signal.aborted) update({ recipient });
      }
    } catch (failure) { if (valid(scope) && version === generation && !request.signal.aborted) update({ error: errorMessage(failure) }); }
    finally { if (read === request) { read = undefined; update({ loading: false }); } }
  }
  async function save(patch: Partial<GuardianSettings> | RecipientSettings, signal?: AbortSignal) {
    const scope = bind(); if (!scope) throw new ApiError('UNAUTHORIZED');
    if (state.saving) return;
    generation++; read?.abort(); read = undefined; update({ saving: true, loading: false, error: '' });
    try {
      const result = scope.role === 'guardian' ? await options.api.saveGuardian(patch as Partial<GuardianSettings>, signal) : await options.api.saveRecipient(patch as RecipientSettings, signal);
      if (!valid(scope) || signal?.aborted) throw new ApiError('SESSION_CHANGED');
      update(scope.role === 'guardian' ? { guardian: result as GuardianSettings } : { recipient: result as RecipientSettings });
    } finally { if (valid(scope)) update({ saving: false }); }
  }
  function acceptCheck(check: ConnectionCheck, scope: SettingsScope) {
    if (!valid(scope)) return;
    update({ check }); if (check.status !== 'PENDING') options.confirmed(check.id);
  }
  async function startCheck(signal?: AbortSignal) {
    const scope = bind(); if (!scope?.linkId) throw new ApiError('NOT_FOUND');
    let result = await options.api.requestCheck(scope.linkId, signal);
    if (!valid(scope) || signal?.aborted) throw new ApiError('SESSION_CHANGED');
    if (result.status === 'PENDING' && result.requestedBy !== scope.userId) {
      await options.api.ackCheck(result.id, signal); result = await options.api.getCheck(result.id, signal);
    }
    if (!valid(scope) || signal?.aborted) throw new ApiError('SESSION_CHANGED');
    acceptCheck(result, scope);
  }
  async function pollCheck() {
    const scope = bind(), check = state.check;
    if (!scope || !check || check.status !== 'PENDING' || poll) return;
    const request = new AbortController(); poll = request;
    try {
      const result = await options.api.getCheck(check.id, request.signal);
      if (!request.signal.aborted && valid(scope) && state.check?.id === check.id) acceptCheck(result, scope);
    } catch (failure) { if (valid(scope) && !request.signal.aborted) update({ error: errorMessage(failure) }); }
    finally { if (poll === request) poll = undefined; }
  }
  return { bind, stop, load, save, startCheck, pollCheck, getSnapshot: () => state,
    clearCheck(id: string) { if (state.check?.id === id && state.check.status !== 'PENDING') update({ check: null }); },
    subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; },
  };
}
