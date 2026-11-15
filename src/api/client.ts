import { ApiError } from './errors';
import type { Tokens } from './types';

export type AuthAdapter = {
  getRevision: () => number;
  getTokens: () => Tokens | null;
  saveTokens: (tokens: Tokens, previous: Tokens) => Promise<boolean>;
  invalidate: (previous: Tokens) => Promise<void>;
  roleRequired?: (previous: Tokens) => void;
};
export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  retryExpiredToken?: boolean;
  // Explicit: not every POST creates a resource (refresh, ack, reports, etc.).
  creation?: boolean;
  idempotencyKey?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
};

export function createApiClient(config: {
  baseUrl: () => string;
  createKey: () => string;
  fetch?: typeof fetch;
  streamFetch?: typeof fetch;
}) {
  let auth: AuthAdapter | undefined;
  let refreshFlight: { token: string; promise: Promise<void> } | undefined;
  const transport = config.fetch ?? globalThis.fetch;

  async function send<T>(path: string, options: RequestOptions & { serializedBody?: string }, tokens: Tokens | null): Promise<T> {
    const base = config.baseUrl().trim().replace(/\/+$/, '');
    if (!/^https?:\/\//.test(base)) throw new ApiError('CONFIGURATION_ERROR');
    if (!path.startsWith('/') || path.startsWith('//') || path.includes('..')) throw new ApiError('CONFIGURATION_ERROR');
    const controller = new AbortController();
    let timedOut = false;
    const abort = () => controller.abort();
    if (options.signal?.aborted) abort();
    options.signal?.addEventListener('abort', abort);
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, options.timeoutMs ?? 15000);
    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (options.body !== undefined) headers['Content-Type'] = 'application/json';
      if (tokens && options.auth !== false) headers.Authorization = `Bearer ${tokens.accessToken}`;
      if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;
      const response = await transport(`${base}${path}`, {
        method: options.method ?? 'GET', headers,
        body: options.serializedBody ?? (options.body === undefined ? undefined : JSON.stringify(options.body)),
        signal: controller.signal,
      });
      if (response.ok && response.status === 204) return undefined as T;
      const requestId = response.headers.get('X-Request-Id') ?? undefined;
      let envelope;
      try { envelope = await response.json(); }
      catch { throw new ApiError('INVALID_RESPONSE', { status: response.status, requestId }); }
      if (response.ok && envelope && typeof envelope === 'object' && envelope.ok === true && 'data' in envelope) return envelope.data as T;
      const failure = envelope?.error;
      throw new ApiError(typeof failure?.code === 'string' ? failure.code : 'INVALID_RESPONSE', {
        status: response.status, requestId,
        message: typeof failure?.message === 'string' ? failure.message : undefined,
        field: typeof failure?.field === 'string' ? failure.field : undefined,
        details: failure?.details && typeof failure.details === 'object' ? failure.details : undefined,
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(timedOut ? 'TIMEOUT' : controller.signal.aborted ? 'ABORTED' : 'NETWORK_ERROR');
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', abort);
    }
  }

  async function refresh(previous: Tokens) {
    const adapter = auth!;
    if (refreshFlight?.token === previous.refreshToken) return refreshFlight.promise;
    // Another request already rotated this token.
    const current = adapter.getTokens();
    if (!current) throw new ApiError('SESSION_CHANGED');
    if (current !== previous) return;
    const promise = (async () => {
      try {
        const tokens = await send<Tokens>('/auth/refresh', {
          method: 'POST', auth: false, body: { refreshToken: previous.refreshToken },
        }, null);
        if (!tokens?.accessToken || !tokens?.refreshToken) throw new ApiError('INVALID_RESPONSE');
        if (!await adapter.saveTokens(tokens, previous)) throw new ApiError('SESSION_CHANGED');
      } catch (error) {
        if (error instanceof ApiError && ['INVALID_REFRESH_TOKEN', 'UNAUTHORIZED'].includes(error.code)) {
          await adapter.invalidate(previous);
        }
        throw error;
      }
    })();
    const flight = { token: previous.refreshToken, promise };
    refreshFlight = flight;
    try { await promise; }
    finally { if (refreshFlight === flight) refreshFlight = undefined; }
  }

  async function authorized<T>(operation: (tokens: Tokens | null) => Promise<T>, options: RequestOptions): Promise<T> {
    const previous = options.auth === false ? null : auth?.getTokens() ?? null;
    const revision = auth?.getRevision();
      try { return await operation(previous); }
      catch (error) {
        if (!(error instanceof ApiError) || options.auth === false) throw error;
        if (error.code === 'TOKEN_EXPIRED' && options.retryExpiredToken !== false && previous && auth) {
          await refresh(previous);
          if (auth.getRevision() !== revision) throw new ApiError('SESSION_CHANGED');
          if (options.signal?.aborted) throw new ApiError('ABORTED');
          const retryTokens = auth.getTokens();
          if (!retryTokens) throw new ApiError('SESSION_CHANGED');
          try { return await operation(retryTokens); }
          catch (retryError) {
            if (retryError instanceof ApiError && ['UNAUTHORIZED', 'TOKEN_EXPIRED'].includes(retryError.code)) {
              await auth.invalidate(retryTokens);
            }
            if (retryError instanceof ApiError && retryError.code === 'ROLE_REQUIRED') auth.roleRequired?.(retryTokens);
            throw retryError;
          }
        }
        if (error.code === 'UNAUTHORIZED' && previous && auth) await auth.invalidate(previous);
        if (error.code === 'ROLE_REQUIRED' && previous && auth) auth.roleRequired?.(previous);
        throw error;
      }
  }

  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const prepared = {
      ...options,
      serializedBody: options.body === undefined ? undefined : JSON.stringify(options.body),
      idempotencyKey: options.idempotencyKey ?? (options.creation ? config.createKey() : undefined),
    };
    try {
      return await authorized<T>((tokens) => send<T>(path, prepared, tokens), options);
    } catch (error) {
      if (error instanceof ApiError && prepared.idempotencyKey) {
        throw new ApiError(error.code, { ...error, message: error.message, idempotencyKey: prepared.idempotencyKey });
      }
      throw error;
    }
  }
  async function openStream(path: string, signal: AbortSignal, lastEventId?: string): Promise<Response> {
    const revision = auth?.getRevision();
    return authorized(async (tokens) => {
      const base = config.baseUrl().trim().replace(/\/+$/, '');
      if (!/^https?:\/\//.test(base) || !path.startsWith('/') || path.startsWith('//') || path.includes('..')) throw new ApiError('CONFIGURATION_ERROR');
      if (!tokens) throw new ApiError('UNAUTHORIZED');
      const response = await (config.streamFetch ?? transport)(`${base}${path}`, {
        headers: { Accept: 'text/event-stream', Authorization: `Bearer ${tokens.accessToken}`,
          ...(lastEventId ? { 'Last-Event-ID': lastEventId } : {}) }, signal,
      });
      if (signal.aborted || auth?.getRevision() !== revision) {
        await response.body?.cancel(); throw new ApiError('SESSION_CHANGED');
      }
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new ApiError(body?.error?.code ?? 'INVALID_RESPONSE', { status: response.status });
      }
      if (!response.headers.get('content-type')?.includes('text/event-stream') || !response.body) {
        await response.body?.cancel(); throw new ApiError('INVALID_RESPONSE');
      }
      return response;
    }, { signal });
  }
  return { request, openStream, setAuth(adapter: AuthAdapter) { auth = adapter; } };
}
