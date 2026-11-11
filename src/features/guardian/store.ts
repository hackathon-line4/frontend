import { ApiError, errorMessage } from '@/api/errors';
import type { GuardianApi } from './api';
import type { GuardianHome, GuardianMessage, GuardianScope, HelpDetail, HistoryItem, MessageDetail, ServerSignal } from './types';

export type GuardianState = {
  scope: string | null; home: GuardianHome | null; signals: ServerSignal[] | null;
  messages: Record<string, GuardianMessage>; details: Record<string, MessageDetail>; helps: Record<string, HelpDetail>;
  histories: Record<string, HistoryItem[]>;
  pending: Record<string, boolean>; errors: Record<string, string>;
};
const empty = (scope: string | null): GuardianState => ({ scope, home: null, signals: null, messages: {}, details: {}, helps: {}, histories: {}, pending: {}, errors: {} });
const bounded = <T,>(data: Record<string, T>, id: string, value: T): Record<string, T> => Object.fromEntries(Object.entries({ ...data, [id]: value }).slice(-64));

export function createGuardianStore(options: {
  api: GuardianApi; scope: () => GuardianScope | null; createKey: () => string;
  feedback: (kind: 'sent' | 'failed') => void;
}) {
  let state = empty(null);
  const listeners = new Set<() => void>();
  const versions = new Map<string, number>();
  const jobs = new Map<string, { controller: AbortController; promise: Promise<void> }>();
  const watched = new Map<string, number>();
  const historyWatches = new Set<string>();
  const helpWatches = new Set<string>();
  const intents = new Map<string, { key: string; flight?: Promise<GuardianMessage> }>();
  let deferredRefresh: ReturnType<typeof setTimeout> | undefined;
  const update = (patch: Partial<GuardianState>) => { state = { ...state, ...patch }; listeners.forEach(fn => fn()); };
  const valid = (scope: GuardianScope) => options.scope()?.key === scope.key && state.scope === scope.key;
  function stop() {
    clearTimeout(deferredRefresh);
    jobs.forEach((job, key) => { job.controller.abort(); versions.set(key, (versions.get(key) ?? 0) + 1); });
    jobs.clear(); update({ pending: {} });
  }
  function bind() {
    const scope = options.scope();
    if (state.scope !== (scope?.key ?? null)) {
      stop(); intents.clear(); watched.clear(); historyWatches.clear(); helpWatches.clear(); versions.clear(); state = empty(scope?.key ?? null); listeners.forEach(fn => fn());
    }
    return scope;
  }
  function read<T>(key: string, fetch: (scope: GuardianScope, signal: AbortSignal) => Promise<T>, apply: (value: T) => void, force = false): Promise<void> {
    const scope = bind(); if (!scope) return Promise.resolve();
    const existing = jobs.get(key);
    if (existing && !force) return existing.promise;
    existing?.controller.abort();
    const version = (versions.get(key) ?? 0) + 1; versions.set(key, version);
    const controller = new AbortController();
    const current = () => valid(scope) && versions.get(key) === version && !controller.signal.aborted;
    update({ pending: { ...state.pending, [key]: true }, errors: { ...state.errors, [key]: '' } });
    const promise = (async () => {
      try { const value = await fetch(scope, controller.signal); if (current()) apply(value); }
      catch (error) { if (current()) update({ errors: { ...state.errors, [key]: errorMessage(error) } }); }
      finally { if (current()) { jobs.delete(key); update({ pending: { ...state.pending, [key]: false } }); } }
    })();
    jobs.set(key, { controller, promise }); return promise;
  }
  const loadHome = (force = false) => read('home', (scope, signal) => options.api.home(scope.linkId, signal), home => update({ home }), force);
  const loadSignals = (force = false) => read('signals', (scope, signal) => options.api.signals(scope.linkId, signal), signals => update({ signals }), force);
  const loadHistory = (date: string, force = false) => read(`history:${date}`, (scope, signal) => options.api.history(scope.linkId, date, signal), items => update({ histories: bounded(state.histories, date, items) }), force);
  const loadMessage = (id: string, force = false) => read(`message:${id}`, (_scope, signal) => options.api.detail(id, signal), detail => {
    const scope = options.scope(); if (!scope || detail.message.linkId !== scope.linkId) return;
    update({ details: bounded(state.details, id, detail), messages: bounded(state.messages, id, detail.message) });
  }, force);
  const loadHelp = (id: string, force = false) => read(`help:${id}`, async (_scope, signal) => {
    if (!state.helps[id]?.helpRequest.guardianOpenedAt) await options.api.openHelp(id, signal);
    return options.api.help(id, signal);
  }, detail => { if (detail.helpRequest.linkId === options.scope()?.linkId) update({ helps: bounded(state.helps, id, detail) }); }, force);
  function refresh() {
    if (!bind()) return Promise.resolve();
    return Promise.all([loadHome(), ...(state.signals === null ? [loadSignals()] : []),
      ...[...watched.keys()].map(id => loadMessage(id)), ...[...historyWatches].map(date => loadHistory(date)), ...[...helpWatches].map(id => loadHelp(id))]).then(() => {});
  }
  function scheduleRefresh() {
    clearTimeout(deferredRefresh);
    deferredRefresh = setTimeout(() => { void loadHome(true); historyWatches.forEach(date => { void loadHistory(date, true); }); }, 150);
  }
  function ingest(message: GuardianMessage) {
    const scope = bind();
    if (!scope || message.linkId !== scope.linkId || message.sender.id !== scope.userId) return;
    const key = `message:${message.id}`;
    jobs.get(key)?.controller.abort(); jobs.delete(key); versions.set(key, (versions.get(key) ?? 0) + 1);
    const detail = state.details[message.id];
    update({ messages: bounded(state.messages, message.id, message), pending: { ...state.pending, [key]: false },
      ...(detail ? { details: bounded(state.details, message.id, { ...detail, message, canExtendWait: detail.canExtendWait && message.response.status !== 'RESPONDED' }) } : {}) });
    if (watched.has(message.id)) void loadMessage(message.id, true);
    scheduleRefresh();
  }
  function create(kind: 'send' | 'resend', id: string, signal?: AbortSignal): Promise<GuardianMessage> {
    const scope = bind();
    if (!scope) return Promise.reject(new ApiError('ROLE_REQUIRED'));
    const intentId = `${kind}:${id}`;
    let intent = intents.get(intentId);
    if (intent?.flight) return intent.flight;
    intent ??= { key: options.createKey() }; intents.set(intentId, intent);
    const current = intent;
    current.flight = (async () => {
      try {
        const result = await (kind === 'send' ? options.api.send(scope.linkId, id, current.key, signal) : options.api.resend(id, current.key, signal));
        if (!valid(scope) || signal?.aborted) throw new ApiError('SESSION_CHANGED');
        if (result.linkId !== scope.linkId) throw new ApiError('INVALID_RESPONSE');
        intents.delete(intentId); ingest(result);
        options.feedback(result.delivery.status === 'FAILED' ? 'failed' : 'sent');
        return result;
      } catch (error) {
        const retain = error instanceof ApiError && (['NETWORK_ERROR', 'TIMEOUT', 'ABORTED', 'INVALID_RESPONSE', 'SESSION_CHANGED'].includes(error.code) || error.status === 429 || (error.status ?? 0) >= 500);
        if (!retain && intents.get(intentId) === current) intents.delete(intentId);
        if (valid(scope) && !signal?.aborted) options.feedback('failed');
        throw error;
      } finally { current.flight = undefined; }
    })();
    return current.flight;
  }
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    bind, stop, refresh, loadHome, loadSignals, loadMessage, loadHelp, loadHistory, ingest, scheduleRefresh,
    watchHistory(date: string) { historyWatches.add(date); return () => { historyWatches.delete(date); }; },
    watchHelp(id: string) { helpWatches.add(id); return () => { helpWatches.delete(id); }; },
    watchMessage(id: string) { watched.set(id, (watched.get(id) ?? 0) + 1); return () => { const count = (watched.get(id) ?? 1) - 1; if (count) watched.set(id, count); else watched.delete(id); }; },
    send: (signalId: string, signal?: AbortSignal) => create('send', signalId, signal),
    resend: (id: string, signal?: AbortSignal) => create('resend', id, signal),
    async extend(id: string, signal?: AbortSignal) {
      const scope = bind(); if (!scope) throw new ApiError('ROLE_REQUIRED');
      const result = await options.api.extend(id, signal);
      if (!valid(scope) || signal?.aborted) throw new ApiError('SESSION_CHANGED');
      ingest(result); await loadMessage(id, true); return result;
    },
  };
}
