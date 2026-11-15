const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const cache = new Map();
function load(file) {
  file = path.resolve(__dirname, '..', file);
  if (cache.has(file)) return cache.get(file).exports;
  const mod = new Module(file); cache.set(file, mod);
  const nativeRequire = Module.createRequire(file);
  mod.require = name => name.startsWith('@/') ? load('src/' + name.slice(2) + '.ts')
    : name.startsWith('.') ? load(path.resolve(path.dirname(file), name + '.ts')) : nativeRequire(name);
  mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, file);
  return mod.exports;
}
const { ApiError } = load('src/api/errors.ts');
const { createApiClient } = load('src/api/client.ts');
const { createGuardianApi } = load('src/features/guardian/api.ts');
const { createGuardianStore } = load('src/features/guardian/store.ts');
const { createEventParser } = load('src/realtime/parser.ts');
const { createRealtimeClient } = load('src/realtime/client.ts');
const { createEventDispatcher } = load('src/realtime/dispatch.ts');
const { homeRecipient, messageStatus, toRecord } = load('src/features/guardian/models.ts');
const flush = async () => { for (let i = 0; i < 30; i++) await Promise.resolve(); };
function deferred() { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; }
const stamp = '2026-11-11T12:00:00Z';
const message = (patch = {}) => ({ id: 'm1', linkId: 'link', kind: 'SIGNAL', isEmergency: false,
  signal: { id: 'signal', name: '식사', description: '식사 시간' }, sender: { id: 'guardian', name: '보호자' }, receiver: { id: 'recipient', name: '당사자' }, createdAt: stamp,
  delivery: { status: 'DELIVERED', deliveredAt: stamp, failureReason: null }, playback: { count: 1, lastReportedAt: stamp },
  response: { status: 'WAITING', respondedAt: null, waitUntil: stamp, secondsToRespond: null, late: false }, ...patch });
const detail = m => ({ message: m, timeline: [], canResend: true, canExtendWait: m.response.status === 'WAITING' });
const home = { recipient: { id: 'recipient', name: '당사자', connection: { state: 'UNKNOWN', lastConfirmedAt: null }, status: { type: 'OK', messageId: null }, lastResponse: null }, favoriteSignals: [], recentActivities: [] };
function harness(overrides = {}) {
  let scope = { key: 'guardian:1:link', linkId: 'link', userId: 'guardian' }, keys = 0;
  const feedback = [];
  const api = { home: async () => home, signals: async () => [], detail: async () => detail(message()), ...overrides };
  const store = createGuardianStore({ api, scope: () => scope, createKey: () => `key-${++keys}`, feedback: x => feedback.push(x) });
  store.bind();
  return { store, feedback, setScope: value => { scope = value; store.bind(); } };
}

test('SSE parser accepts chunked CRLF, comments, BOM, multi-line JSON, empty id and default event', () => {
  const p = createEventParser();
  assert.deepEqual(p.feed('\uFEFF: ping\r'), []);
  assert.deepEqual(p.feed('\nid: abc\r\nevent: message.updated\r\ndata: {"가":\r\n'), []);
  assert.deepEqual(p.feed('data: true}\r\n\r'), []);
  assert.deepEqual(p.feed('\n'), [{ id: 'abc', event: 'message.updated', data: '{"가":\ntrue}' }]);
  assert.deepEqual(p.feed('id: bad\0id\ndata: next\n\n'), [{ id: 'abc', event: 'message', data: 'next' }]);
  assert.deepEqual(p.feed('id:\ndata:\n\n'), [{ id: '', event: 'message', data: '' }]);
  assert.throws(() => p.feed('x'.repeat(1024 * 1024 + 1)), /large/);
});

test('stream reconnect replays cursor, decodes split UTF-8, deduplicates, and stops on background', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const received = [], cursors = [];
  let sink, opens = 0;
  const bytes = new TextEncoder().encode('id: e1\nevent: message.updated\ndata: 한글\n\n');
  const client = createRealtimeClient({ valid: () => true, onConnected() {}, onEvent: event => received.push(event),
    open: async (_signal, cursor) => {
      cursors.push(cursor); opens++;
      return new Response(new ReadableStream({ start(controller) {
        if (opens === 1) { const split = bytes.indexOf(237) + 1; controller.enqueue(bytes.slice(0, split)); controller.enqueue(bytes.slice(split)); controller.close(); }
        else { sink = controller; controller.enqueue(bytes); }
      } }));
    } });
  client.start(); client.start(); await flush();
  assert.equal(opens, 1); assert.equal(received[0].data, '한글');
  t.mock.timers.tick(1000); await flush();
  assert.deepEqual(cursors, [undefined, 'e1']); assert.equal(received.length, 1);
  client.stop(); await flush(); t.mock.timers.tick(60000); await flush();
  assert.equal(opens, 2); assert.throws(() => sink.enqueue(bytes));
});

test('late stream connection after stop cannot deliver events or start reconnect', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const pending = deferred(); let delivered = 0, cancelled = false;
  const c = createRealtimeClient({ valid: () => true, open: () => pending.promise, onConnected: () => delivered++, onEvent: () => delivered++ });
  c.start(); c.stop();
  pending.resolve(new Response(new ReadableStream({ cancel() { cancelled = true; } })));
  await flush(); t.mock.timers.tick(60000); await flush();
  assert.equal(delivered, 0); assert.equal(cancelled, true);
});

test('silent SSE connection is aborted after missed heartbeats', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let aborted = false;
  const c = createRealtimeClient({ valid: () => true, open: signal => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => { aborted = true; reject(new Error('abort')); });
  }), onConnected() {}, onEvent() {} });
  c.start(); t.mock.timers.tick(45000); await flush(); c.stop(); assert.equal(aborted, true);
});

test('event dispatch uses common incoming handler, updates guardian stores, and rejects stale sessions', () => {
  let valid = true, role = 'guardian'; const calls = [];
  const dispatch = createEventDispatcher({ valid: () => valid, role: () => role, onMessage: m => calls.push(m.id),
    onIncoming: m => calls.push(m.id), onRefresh: () => calls.push('refresh'), onSession: () => calls.push('session') });
  const event = (name, data) => dispatch({ id: 'id', event: name, data: JSON.stringify(data) });
  event('message.updated', { message: message() }); assert.deepEqual(calls, ['m1', 'refresh']);
  role = 'recipient'; event('message.created', { message: { id: 'incoming', kind: 'SIGNAL', signal: {}, playbackPolicy: {} } });
  assert.ok(calls.includes('incoming'));
  event('link.updated', {}); assert.ok(calls.includes('session'));
  valid = false; const count = calls.length; event('message.created', { message: message() }); assert.equal(calls.length, count);
  dispatch({ event: 'message.created', data: '{' });
});

test('guardian creation retries uncertain requests with same key and concurrent taps share one flight', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const calls = [], pending = deferred();
  const h = harness({ send: async (...args) => { calls.push(args); return calls.length === 1 ? pending.promise : message(); } });
  const first = h.store.send('signal'); assert.equal(h.store.send('signal'), first);
  pending.reject(new ApiError('TIMEOUT')); await assert.rejects(first, { code: 'TIMEOUT' });
  await h.store.send('signal'); assert.equal(calls[0][2], calls[1][2]);
  await h.store.send('signal'); assert.notEqual(calls[1][2], calls[2][2]); h.store.stop();
});

test('HTTP 201 FAILED delivery stays failed and never reports sent feedback', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const failed = message({ delivery: { status: 'FAILED', failureReason: 'NO_DEVICE', deliveredAt: null }, response: { status: null } });
  const h = harness({ send: async () => failed });
  const result = await h.store.send('signal');
  assert.equal(result.delivery.status, 'FAILED'); assert.deepEqual(h.feedback, ['failed']);
  assert.equal(h.store.getSnapshot().messages.m1.delivery.status, 'FAILED'); h.store.stop();
});

test('SSE update invalidates an older in-flight detail and clears cross-account data', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const pending = deferred();
  const h = harness({ detail: () => pending.promise });
  const read = h.store.loadMessage('m1');
  h.store.ingest(message({ response: { status: 'RESPONDED', respondedAt: stamp } }));
  pending.resolve(detail(message())); await read;
  assert.equal(h.store.getSnapshot().messages.m1.response.status, 'RESPONDED');
  h.setScope({ key: 'other:2:other', linkId: 'other', userId: 'other' });
  assert.deepEqual(h.store.getSnapshot().messages, {});
  h.store.ingest(message()); assert.deepEqual(h.store.getSnapshot().messages, {}); h.store.stop();
});

test('account replacement and cancellation suppress late send confirmation', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const pending = deferred(), h = harness({ resend: () => pending.promise });
  const send = h.store.resend('m1'); h.setScope(null); pending.resolve(message());
  await assert.rejects(send, { code: 'SESSION_CHANGED' }); assert.deepEqual(h.feedback, []);
  assert.deepEqual(h.store.getSnapshot().messages, {}); h.store.stop();
});

test('guardian API uses encoded routes, creation keys only for send/resend, validates malformed response', async () => {
  const calls = [];
  const api = createGuardianApi({ request: async (path, opts) => { calls.push({ path, ...opts }); return message(); } });
  await api.send('link/1', 'signal', 'key1'); await api.resend('m/1', 'key2'); await api.extend('m/1');
  assert.equal(calls[0].path, '/links/link%2F1/messages'); assert.deepEqual(calls[0].body, { signalId: 'signal' });
  assert.equal(calls[1].path, '/messages/m%2F1/resend'); assert.equal(calls[1].idempotencyKey, 'key2');
  assert.equal(calls[2].creation, undefined); assert.deepEqual(calls[2].body, {});
  await assert.rejects(createGuardianApi({ request: async () => ({}) }).send('l', 's', 'k'), { code: 'INVALID_RESPONSE' });
});

test('SSE authenticates via headers, refreshes expired token and retains cursor on retry', async () => {
  let tokens = { accessToken: 'old', refreshToken: 'refresh' }; const headers = [];
  const client = createApiClient({ baseUrl: () => 'http://api/api/v1', createKey: () => 'k',
    fetch: async () => Response.json({ ok: true, data: { accessToken: 'new', refreshToken: 'rotated' } }),
    streamFetch: async (_url, options) => {
      headers.push(options.headers);
      return headers.length === 1 ? Response.json({ ok: false, error: { code: 'TOKEN_EXPIRED' } }, { status: 401 })
        : new Response(': ping\n\n', { headers: { 'Content-Type': 'text/event-stream' } });
    } });
  client.setAuth({ getRevision: () => 1, getTokens: () => tokens, saveTokens: async next => { tokens = next; return true; }, invalidate: async () => {} });
  const stream = await client.openStream('/events', new AbortController().signal, 'cursor1');
  assert.equal(headers[0].Authorization, 'Bearer old'); assert.equal(headers[1].Authorization, 'Bearer new');
  assert.equal(headers[1]['Last-Event-ID'], 'cursor1'); assert.equal(headers[1].Accept, 'text/event-stream'); await stream.body.cancel();
});

test('display models distinguish receipt, playback, response and server-authoritative waiting status', () => {
  const delivered = message();
  assert.equal(messageStatus(delivered), 'waiting');
  assert.equal(toRecord(delivered).response.kind, 'waiting');
  assert.ok(toRecord(delivered).delivery.vibratedAt);
  const requested = message({ delivery: { status: 'REQUESTED' } });
  assert.equal(toRecord(requested).response, null);
  assert.equal(messageStatus(requested), 'unconfirmed');
  const unknown = homeRecipient({ ...home, recipient: { ...home.recipient, status: { type: 'WAITING', elapsedMinutes: 40 } } });
  assert.equal(unknown.connected, false); assert.equal(unknown.state, 'WAITING');
  const replied = message({ response: { status: 'RESPONDED', respondedAt: stamp, secondsToRespond: 0 } });
  assert.equal(toRecord(replied).response.afterSec, 0); assert.equal(messageStatus(replied), 'replied');
});

test('watched history refreshes after events and stops reading after leaving its screen', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let reads = 0;
  const h = harness({ history: async () => { reads++; return [{ id: 'm1' }]; } });
  const unwatch = h.store.watchHistory('2026-11-11');
  h.store.scheduleRefresh(); t.mock.timers.tick(150); await flush();
  assert.equal(reads, 1); assert.equal(h.store.getSnapshot().histories['2026-11-11'][0].id, 'm1');
  unwatch(); await h.store.refresh(); assert.equal(reads, 1); h.store.stop();
});
