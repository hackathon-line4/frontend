const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

// Execute TypeScript modules in Node with explicit platform adapters, without a native runtime.
function loader(mocks = {}) {
  const cache = new Map();
  function load(filename) {
    filename = path.resolve(__dirname, '..', filename);
    if (cache.has(filename)) return cache.get(filename).exports;
    const mod = new Module(filename);
    cache.set(filename, mod);
    const nativeRequire = Module.createRequire(filename);
    mod.require = (name) => {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (name.startsWith('.')) return load(path.resolve(path.dirname(filename), `${name}.ts`));
      return nativeRequire(name);
    };
    const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    mod._compile(source, filename);
    return mod.exports;
  }
  return load;
}
const load = loader();
const { createApiClient } = load('src/api/client.ts');
const { ApiError } = load('src/api/errors.ts');
const success = (data) => Response.json({ ok: true, data });
const fail = (code, status = 401, rest = {}) => Response.json({ ok: false, error: { code, ...rest } }, { status, headers: { 'X-Request-Id': 'request-1' } });
function harness(fetch) {
  let tokens = { accessToken: 'old-access', refreshToken: 'old-refresh' };
  let revision = 0;
  let invalidations = 0;
  const client = createApiClient({ baseUrl: () => 'https://api.example.test/api/v1', createKey: () => 'uuid-1', fetch });
  client.setAuth({
    getRevision: () => revision,
    getTokens: () => tokens,
    saveTokens: async (next, previous) => { if (tokens !== previous) return false; tokens = next; return true; },
    invalidate: async (previous) => { if (tokens === previous) { tokens = null; revision++; invalidations++; } },
  });
  return { client, tokens: () => tokens, invalidations: () => invalidations, logout: () => { tokens = null; revision++; }, login: () => { tokens = { accessToken: 'other-user', refreshToken: 'other-refresh' }; revision++; } };
}

test('unwrap success, accept 204, and omit authorization on public endpoints', async () => {
  const calls = [];
  const { client } = harness(async (url, init) => { calls.push({ url, init }); return calls.length === 1 ? success({ id: 1 }) : new Response(null, { status: 204 }); });
  assert.deepEqual(await client.request('/me'), { id: 1 });
  assert.equal(calls[0].init.headers.Authorization, 'Bearer old-access');
  assert.equal(await client.request('/auth/logout', { method: 'POST', auth: false }), undefined);
  assert.equal(calls[1].init.headers.Authorization, undefined);
});

test('preserve server message, field, details, request ID, and creation key', async () => {
  const { client } = harness(async () => fail('VALIDATION_FAILED', 400, { message: '이메일 형식이 아니에요', field: 'email', details: { retryAfterSec: 4 } }));
  await assert.rejects(client.request('/items', { method: 'POST', creation: true }), (error) => {
    assert.equal(error.message, '이메일 형식이 아니에요');
    assert.equal(error.field, 'email');
    assert.equal(error.requestId, 'request-1');
    assert.equal(error.idempotencyKey, 'uuid-1');
    assert.equal(error.details.retryAfterSec, 4);
    return true;
  });
});

test('concurrent expired requests refresh once and retain body and idempotency key', async () => {
  let refreshes = 0;
  const calls = [];
  const h = harness(async (url, init) => {
    if (url.endsWith('/auth/refresh')) {
      refreshes++;
      await new Promise((resolve) => setTimeout(resolve, 15));
      assert.equal(init.headers.Authorization, undefined);
      assert.equal(init.headers['Idempotency-Key'], undefined);
      return success({ accessToken: 'new-access', refreshToken: 'new-refresh' });
    }
    calls.push(init);
    return init.headers.Authorization === 'Bearer old-access' ? fail('TOKEN_EXPIRED') : success({ sent: true });
  });
  await Promise.all([h.client.request('/messages', { method: 'POST', creation: true, body: { signalId: 's1' } }), h.client.request('/me')]);
  assert.equal(refreshes, 1);
  assert.equal(h.tokens().refreshToken, 'new-refresh');
  const created = calls.filter((call) => call.method === 'POST');
  assert.equal(created.length, 2);
  assert.equal(created[0].headers['Idempotency-Key'], created[1].headers['Idempotency-Key']);
  assert.equal(created[0].body, created[1].body);
});

test('invalid refresh clears credentials; network refresh failure keeps credentials', async () => {
  for (const network of [false, true]) {
    const h = harness(async (url) => {
      if (url.endsWith('/auth/refresh')) { if (network) throw new TypeError('offline'); return fail('INVALID_REFRESH_TOKEN'); }
      return fail('TOKEN_EXPIRED');
    });
    await assert.rejects(h.client.request('/me'), { code: network ? 'NETWORK_ERROR' : 'INVALID_REFRESH_TOKEN' });
    assert.equal(h.invalidations(), network ? 0 : 1);
  }
});

test('invalid login does not refresh or log out another session', async () => {
  let count = 0;
  const h = harness(async () => { count++; return fail('INVALID_CREDENTIALS'); });
  await assert.rejects(h.client.request('/auth/login', { auth: false, method: 'POST' }), { code: 'INVALID_CREDENTIALS' });
  assert.equal(count, 1);
  assert.equal(h.invalidations(), 0);
});

test('an expired retried request is not retried in a loop', async () => {
  let count = 0;
  const h = harness(async (url) => { count++; return url.endsWith('/auth/refresh') ? success({ accessToken: 'new', refreshToken: 'new-refresh' }) : fail('TOKEN_EXPIRED'); });
  await assert.rejects(h.client.request('/me'), { code: 'TOKEN_EXPIRED' });
  assert.equal(count, 3);
  assert.equal(h.invalidations(), 1);
});

test('logout during refresh cannot restore the old credentials', async () => {
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const h = harness(async (url) => {
    if (url.endsWith('/auth/refresh')) { await gate; return success({ accessToken: 'new', refreshToken: 'new-refresh' }); }
    return fail('TOKEN_EXPIRED');
  });
  const pending = h.client.request('/me');
  await new Promise((resolve) => setTimeout(resolve, 0));
  h.logout(); release();
  await assert.rejects(pending, { code: 'SESSION_CHANGED' });
  assert.equal(h.tokens(), null);
});

test('old in-flight errors do not invalidate a new login', async () => {
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const h = harness(async () => { await gate; return fail('UNAUTHORIZED'); });
  const pending = h.client.request('/me');
  h.login(); release();
  await assert.rejects(pending, { code: 'UNAUTHORIZED' });
  assert.equal(h.tokens().accessToken, 'other-user');
});

test('manual retry can reuse a creation key; reporting requests get no automatic key', async () => {
  const calls = [];
  const h = harness(async (_, init) => { calls.push(init); if (calls.length === 1) throw new TypeError('offline'); return success({}); });
  let retryKey;
  try { await h.client.request('/messages', { method: 'POST', creation: true }); }
  catch (error) { retryKey = error.idempotencyKey; }
  await h.client.request('/messages', { method: 'POST', creation: true, idempotencyKey: retryKey });
  await h.client.request('/messages/1/ack', { method: 'POST' });
  assert.equal(calls[1].headers['Idempotency-Key'], calls[0].headers['Idempotency-Key']);
  assert.equal(calls[2].headers['Idempotency-Key'], undefined);
});

test('timeout, cancellation, malformed responses, and missing host are distinct errors', async () => {
  const h = harness(async (_, init) => new Promise((_, reject) => {
    if (init.signal.aborted) reject(new Error('aborted'));
    init.signal.addEventListener('abort', () => reject(new Error('aborted')));
  }));
  await assert.rejects(h.client.request('/me', { timeoutMs: 5 }), { code: 'TIMEOUT' });
  const controller = new AbortController(); controller.abort();
  await assert.rejects(h.client.request('/me', { signal: controller.signal }), { code: 'ABORTED' });
  const malformed = harness(async () => new Response('not json'));
  await assert.rejects(malformed.client.request('/me'), { code: 'INVALID_RESPONSE' });
  const noHost = createApiClient({ baseUrl: () => '', createKey: () => 'key' });
  await assert.rejects(noHost.request('/me'), { code: 'CONFIGURATION_ERROR' });
});

function sessionHarness({ storedTokens, onboarded = 'true', me, error, writeError, request } = {}) {
  const stored = new Map([['sonullim.onboarded', onboarded]]);
  if (storedTokens) stored.set('sonullim.tokens', JSON.stringify(storedTokens));
  let adapter;
  let calls = 0;
  const api = { setAuth: (value) => { adapter = value; }, request: async (endpoint, options) => { calls++; if (request) return request(endpoint, options); if (error || endpoint === '/auth/logout') throw error ?? new ApiError('NETWORK_ERROR'); return me; } };
  const session = loader({
    '@/api': { api, ApiError, errorMessage: (failure) => failure.message },
    react: { useSyncExternalStore: () => {} },
    './storage': { readStored: async (key) => stored.get(key) ?? null, writeStored: async (key, value) => { if (writeError) throw writeError; if (value === null) stored.delete(key); else stored.set(key, value); } },
    './installation': { getInstallationId: async () => 'installation-1' },
  })('src/features/session/store.ts');
  return { session, stored, calls: () => calls, adapter: () => adapter };
}
const tokens = { accessToken: 'access', refreshToken: 'refresh' };
const me = (role, links = [], pendingLinkRequest = null) => ({ user: { id: 'u1', role, name: '이름', email: 'a@b.c', createdAt: '2026-11-07T10:00:00+09:00' }, links, pendingLinkRequest });

const authErrors = loader({ '@/api': { ApiError, errorMessage: (error) => error instanceof ApiError ? error.message : '잠시 후 다시 시도해 주세요' } })('src/features/auth/errors.ts');

test('duplicate signup email targets the email input even without a server field', () => {
  const result = authErrors.signupFailure(new ApiError('EMAIL_ALREADY_EXISTS', { message: 'Email exists' }));
  assert.equal(result.field, 'email');
  assert.match(result.message, /이미 가입된 이메일/);
});

test('signup password validation preserves the field and server rule', () => {
  assert.deepEqual(authErrors.signupFailure(new ApiError('VALIDATION_FAILED', { field: 'password', message: '비밀번호는 12자 이상이어야 해요' })), {
    field: 'password', message: '비밀번호는 12자 이상이어야 해요',
  });
});

test('only invalid login credentials target the password input', () => {
  const invalid = authErrors.loginFailure(new ApiError('INVALID_CREDENTIALS', { message: 'Invalid credentials' }));
  assert.equal(invalid.field, 'password');
  assert.match(invalid.message, /이메일 또는 비밀번호/);
  for (const code of ['NETWORK_ERROR', 'TOO_MANY_ATTEMPTS', 'CONFIGURATION_ERROR']) {
    const error = new ApiError(code);
    assert.deepEqual(authErrors.loginFailure(error), { message: error.message });
  }
});

test('password rules require eight characters with both an English letter and a digit', () => {
  const { isValidPassword } = load('src/features/auth/validation.ts');
  for (const value of ['abc123', 'abcdefgh', '12345678', '가나다라마바사1']) assert.equal(isValidPassword(value), false);
  for (const value of ['abcdefg1', 'ABC12345', 'pass123!']) assert.equal(isValidPassword(value), true);
});

test('saving either role sends the server value and opens its home without a link', async () => {
  for (const [role, serverRole, href] of [['guardian', 'GUARDIAN', '/guardian'], ['recipient', 'RECIPIENT', '/recipient']]) {
    const h = sessionHarness({ storedTokens: tokens, request: async (endpoint, options) => {
      if (endpoint === '/me') return me(null);
      assert.equal(endpoint, '/me/role');
      assert.equal(options.method, 'PUT');
      assert.deepEqual(options.body, { role: serverRole });
      return { user: me(serverRole).user };
    } });
    await h.session.restoreSession();
    assert.equal(h.session.sessionHref(), '/auth/role');
    await h.session.selectRole(role);
    assert.equal(h.session.sessionHref(), href);
  }
});

test('failed role save stays on role selection without applying the local choice', async () => {
  const h = sessionHarness({ storedTokens: tokens, request: async (endpoint) => {
    if (endpoint === '/me') return me(null);
    throw new ApiError('NETWORK_ERROR');
  } });
  await h.session.restoreSession();
  await assert.rejects(h.session.selectRole('guardian'), { code: 'NETWORK_ERROR' });
  assert.equal(h.session.getSession().role, null);
  assert.equal(h.session.sessionHref(), '/auth/role');
});

test('startup restores persisted tokens and routes all account states', async () => {
  const cases = [
    [null, [], null, '/auth/role'],
    ['GUARDIAN', [], null, '/guardian'],
    ['RECIPIENT', [], null, '/recipient'],
    ['GUARDIAN', [{ id: 'l1' }], null, '/guardian'],
    ['RECIPIENT', [{ id: 'l1' }], null, '/recipient'],
    ['RECIPIENT', [], { id: 'pending' }, '/link/recipient/confirm'],
  ];
  for (const [role, links, pending, href] of cases) {
    const h = sessionHarness({ storedTokens: tokens, me: me(role, links, pending) });
    await Promise.all([h.session.restoreSession(), h.session.restoreSession()]);
    assert.equal(h.calls(), 1);
    assert.equal(h.session.sessionHref(), href);
    assert.equal(h.session.getSession().status, 'authenticated');
  }
});

test('first launch opens onboarding; later anonymous launches open login', async () => {
  for (const onboarded of ['true', null]) {
    const h = sessionHarness({ onboarded });
    await h.session.restoreSession();
    assert.equal(h.calls(), 0);
    assert.equal(h.session.sessionHref(), onboarded ? '/auth/login' : '/onboarding');
  }
});

test('offline restoration keeps stored tokens and offers retry state', async () => {
  const h = sessionHarness({ storedTokens: tokens, error: new ApiError('NETWORK_ERROR') });
  await h.session.restoreSession();
  assert.equal(h.session.getSession().status, 'error');
  assert.ok(h.stored.has('sonullim.tokens'));
});

test('logout clears local credentials even when the server fails', async () => {
  const h = sessionHarness({ storedTokens: tokens, me: me('GUARDIAN', [{ id: 'l1' }]) });
  await h.session.restoreSession();
  await h.session.logout();
  assert.equal(h.session.getSession().status, 'anonymous');
  assert.equal(h.stored.has('sonullim.tokens'), false);
});

test('mutating the caller body cannot change a retry with the same key', async () => {
  const body = { signalId: 'original' };
  const sent = [];
  const h = harness(async (url, init) => {
    if (url.endsWith('/auth/refresh')) { body.signalId = 'changed'; return success({ accessToken: 'new', refreshToken: 'rotated' }); }
    sent.push(init.body);
    return init.headers.Authorization === 'Bearer old-access' ? fail('TOKEN_EXPIRED') : success({});
  });
  await h.client.request('/messages', { method: 'POST', creation: true, body });
  assert.equal(sent[0], sent[1]);
  assert.equal(JSON.parse(sent[1]).signalId, 'original');
});

test('late expiry from an old account cannot retry under the new account', async () => {
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  let calls = 0;
  const h = harness(async () => { calls++; await gate; return fail('TOKEN_EXPIRED'); });
  const pending = h.client.request('/messages', { method: 'POST', creation: true });
  h.login(); release();
  await assert.rejects(pending, { code: 'SESSION_CHANGED' });
  assert.equal(calls, 1);
});

test('corrupted stored credentials are removed instead of sent to the server', async () => {
  const h = sessionHarness({ storedTokens: { accessToken: 123 } });
  await h.session.restoreSession();
  assert.equal(h.calls(), 0);
  assert.equal(h.session.getSession().status, 'anonymous');
  assert.equal(h.stored.has('sonullim.tokens'), false);
});

test('late login and /me responses cannot undo local logout', async () => {
  for (const mode of ['login', 'restore']) {
    let release;
    const gate = new Promise((resolve) => { release = resolve; });
    const h = sessionHarness({ storedTokens: mode === 'restore' ? tokens : undefined, request: async (endpoint) => {
      await gate;
      return endpoint === '/auth/login' ? { ...tokens, ...me('GUARDIAN') } : me('GUARDIAN');
    } });
    const pending = mode === 'login' ? h.session.login('a@b.c', 'password') : h.session.restoreSession();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await h.session.clearSession(); release();
    if (mode === 'login') await assert.rejects(pending, { code: 'SESSION_CHANGED' });
    else await pending;
    assert.equal(h.session.getSession().status, 'anonymous');
    assert.equal(h.session.getSession().tokens, null);
  }
});
