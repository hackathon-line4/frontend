import { useSyncExternalStore } from 'react';

import { api, ApiError, errorMessage, type AuthResult, type LinkRequest, type Me, type ServerRole, type Tokens } from '@/api';

import { readStored, writeStored } from './storage';
import { getInstallationId } from './installation';

export type Role = 'guardian' | 'recipient';
type SessionState = {
  role: Role | null;
  tokens: Tokens | null;
  user: Me['user'] | null;
  links: Me['links'];
  pendingLinkRequest: Me['pendingLinkRequest'];
  status: 'loading' | 'anonymous' | 'authenticated' | 'error';
  error: string | null;
  onboarded: boolean;
};
const TOKEN_KEY = 'sonullim.tokens';
const ONBOARDING_KEY = 'sonullim.onboarded';
const empty = { role: null, tokens: null, user: null, links: [], pendingLinkRequest: null };
let state: SessionState = { ...empty, status: 'loading', error: null, onboarded: false };
const listeners = new Set<() => void>();
let restoreFlight: Promise<void> | undefined;
let revision = 0;

function update(patch: Partial<SessionState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}
export function getSession(): SessionState { return state; }
export function getSessionRevision() { return revision; }
function localRole(role: ServerRole | null): Role | null {
  return role === 'GUARDIAN' ? 'guardian' : role === 'RECIPIENT' ? 'recipient' : null;
}
function applyMe(me: Me) {
  update({ ...me, role: localRole(me.user.role), status: 'authenticated', error: null });
}

export async function clearSession() {
  revision += 1;
  update({ ...empty, status: 'anonymous', error: null });
  try { await writeStored(TOKEN_KEY, null); }
  catch { update({ error: '이 기기의 로그인 정보를 삭제하지 못했어요. 다시 시도해 주세요' }); }
}

api.setAuth({
  getRevision: () => revision,
  getTokens: () => state.tokens,
  async saveTokens(tokens, previous) {
    if (state.tokens !== previous) return false;
    update({ tokens });
    try { await writeStored(TOKEN_KEY, JSON.stringify(tokens)); }
    catch {
      if (state.tokens === tokens) await clearSession();
      throw new ApiError('STORAGE_ERROR');
    }
    return state.tokens === tokens;
  },
  async invalidate(previous) {
    if (state.tokens === previous) await clearSession();
  },
  roleRequired(previous) {
    if (state.tokens === previous) update({ role: null });
  },
});

export async function acceptSession(result: AuthResult) {
  const currentRevision = ++revision;
  const tokens = { accessToken: result.accessToken, refreshToken: result.refreshToken };
  if (!tokens.accessToken || !tokens.refreshToken) throw new ApiError('INVALID_RESPONSE');
  try { await writeStored(TOKEN_KEY, JSON.stringify(tokens)); }
  catch { throw new ApiError('STORAGE_ERROR'); }
  if (revision !== currentRevision) throw new ApiError('SESSION_CHANGED');
  update({ tokens, onboarded: true, status: 'loading', error: null });
  // Login does not include pendingLinkRequest, so confirm the full startup state.
  try {
    await writeStored(ONBOARDING_KEY, 'true');
    await reloadMe();
  } catch (error) {
    if (revision === currentRevision) update({ status: 'error', error: errorMessage(error) });
    throw error;
  }
}

export async function reloadMe() {
  const currentRevision = revision;
  const me = await api.request<Me>('/me');
  if (revision !== currentRevision || !state.tokens) return;
  applyMe(me);
}

export function restoreSession(): Promise<void> {
  if (restoreFlight) return restoreFlight;
  const currentRevision = revision;
  update({ status: 'loading', error: null });
  restoreFlight = (async () => {
    try {
      const [raw, onboarded] = await Promise.all([readStored(TOKEN_KEY), readStored(ONBOARDING_KEY)]);
      if (currentRevision !== revision) return;
      update({ onboarded: onboarded === 'true' });
      if (!raw) { update({ ...empty, status: 'anonymous' }); return; }
      let tokens: Tokens;
      try {
        tokens = JSON.parse(raw);
        if (typeof tokens?.accessToken !== 'string' || !tokens.accessToken || typeof tokens?.refreshToken !== 'string' || !tokens.refreshToken) throw new Error();
      } catch { await clearSession(); return; }
      update({ tokens, onboarded: true });
      await reloadMe();
    } catch (error) {
      if (currentRevision === revision) update({ status: 'error', error: errorMessage(error) });
    }
  })().finally(() => { restoreFlight = undefined; });
  return restoreFlight;
}

export async function completeOnboarding() {
  await writeStored(ONBOARDING_KEY, 'true');
  update({ onboarded: true });
}

export async function login(email: string, password: string) {
  const currentRevision = revision;
  const result = await api.request<AuthResult>('/auth/login', { method: 'POST', auth: false, body: { email: email.trim(), password } });
  if (revision !== currentRevision) throw new ApiError('SESSION_CHANGED');
  await acceptSession(result);
}

export async function signup(form: { email: string; password: string; name: string; agreements: { terms: boolean; privacy: boolean } }, idempotencyKey?: string) {
  const currentRevision = revision;
  const result = await api.request<AuthResult>('/auth/signup', {
    method: 'POST', auth: false, creation: true, idempotencyKey,
    body: { ...form, email: form.email.trim(), name: form.name.trim() },
  });
  if (revision !== currentRevision) throw new ApiError('SESSION_CHANGED');
  await acceptSession(result);
}

export async function selectRole(role: Role) {
  const currentRevision = revision;
  const result = await api.request<Tokens & { user: Me['user'] }>('/me/role', {
    method: 'PUT', body: { role: role === 'guardian' ? 'GUARDIAN' : 'RECIPIENT' },
  });
  if (currentRevision !== revision) throw new ApiError('SESSION_CHANGED');
  const tokens = { accessToken: result.accessToken, refreshToken: result.refreshToken };
  if (!tokens.accessToken || !tokens.refreshToken) throw new ApiError('INVALID_RESPONSE');
  try { await writeStored(TOKEN_KEY, JSON.stringify(tokens)); }
  catch { await clearSession(); throw new ApiError('STORAGE_ERROR'); }
  if (currentRevision !== revision) throw new ApiError('SESSION_CHANGED');
  revision += 1;
  update({ tokens, user: result.user, role: localRole(result.user.role) });
}

// Apply only a server-confirmed result belonging to the current account.
// /me remains authoritative on the next reload; it must expose real links for restart restoration.
export function applyLinkRequest(request: LinkRequest) {
  const userId = state.user?.id;
  if (state.status !== 'authenticated' || !userId || ![request.guardian.id, request.recipient.id].includes(userId)) return;
  if (request.status === 'APPROVED' && request.link) {
    update({ links: [...state.links.filter((link) => link.id !== request.link!.id), request.link], pendingLinkRequest: null });
  } else if (state.role === 'recipient') {
    if (request.status === 'PENDING') update({ pendingLinkRequest: { ...request, status: 'PENDING', decidedAt: null, link: null } });
    else if (state.pendingLinkRequest?.id === request.id) update({ pendingLinkRequest: null });
  }
}

export async function logout() {
  const currentRevision = revision;
  try {
    if (state.tokens) {
      const installationId = await getInstallationId();
      if (revision !== currentRevision) return;
      await api.request<void>('/auth/logout', {
        method: 'POST', timeoutMs: 5000, retryExpiredToken: false,
        body: { refreshToken: state.tokens?.refreshToken, installationId },
      });
    }
  } catch {
    // Local logout must also work offline.
  } finally {
    if (revision === currentRevision) await clearSession();
  }
}

// Development catalog previews only; a role alone never represents authentication.
export function setRole(role: Role | null) { update({ role }); }
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function useSession() { return useSyncExternalStore(subscribe, getSession, getSession); }
export function useRole() { return useSession().role; }
export function homeHref(role: Role | null) {
  if (role === 'guardian') return '/guardian' as const;
  if (role === 'recipient') return '/recipient' as const;
  return '/auth/role' as const;
}
export function sessionHref(session = state) {
  if (session.status !== 'authenticated') return session.onboarded ? '/auth/login' as const : '/onboarding' as const;
  if (!session.role) return '/auth/role' as const;
  if (session.role === 'recipient' && session.pendingLinkRequest) return '/link/recipient/confirm' as const;
  return homeHref(session.role);
}
