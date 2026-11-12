const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function loader(mocks = {}) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(__dirname, '..', file);
    if (cache.has(file)) return cache.get(file).exports;
    const mod = new Module(file); cache.set(file, mod);
    const nativeRequire = Module.createRequire(file);
    mod.require = name => Object.hasOwn(mocks, name) ? mocks[name] : name.startsWith('.')
      ? load(path.resolve(path.dirname(file), name + '.ts')) : nativeRequire(name);
    mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText, file);
    return mod.exports;
  }
  return load;
}
const mocks = {};
const load = loader(mocks);
const { ApiError } = load('src/api/errors.ts');
mocks['@/api'] = { ApiError, api: { request: async () => { throw new Error('Unexpected default API'); } } };
const { createApiClient } = load('src/api/client.ts');
const { createRecipientApi } = load('src/features/recipient/api.ts');
const { createRecipientSender } = load('src/features/recipient/sender.ts');
const { createIncomingDelivery } = load('src/features/recipient/delivery.ts');
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
const stamp = '2026-11-11T06:00:00.000Z';

test('recipient endpoints use server bodies, creation keys only for creations, and validate confirmations', async () => {
  const calls = [];
  let key = 0;
  const client = createApiClient({ baseUrl: () => 'http://server/api/v1', createKey: () => `key-${++key}`, fetch: async (url, init) => {
    calls.push({ url, ...init });
    if (url.endsWith('/playback')) return new Response(null, { status: 204 });
    const data = url.endsWith('/ack') ? { deliveredAt: stamp, waitUntil: stamp }
      : url.endsWith('/response') ? { status: 'RESPONDED', respondedAt: stamp, late: false }
        : url.endsWith('/incoming') ? { items: [] } : { id: 'created', linkId: 'link/1' };
    return Response.json({ ok: true, data });
  } });
  const api = createRecipientApi(client);
  await api.send('call', 'link/1', { sentAt: stamp });
  await api.send('help', 'link/1', { sentAt: stamp });
  await api.acknowledge('message/1', stamp);
  await api.playback('message/1', 3);
  await api.respond('message/1', stamp);
  await api.incoming();
  assert.ok(calls[0].url.endsWith('/links/link%2F1/recipient-signals'));
  assert.deepEqual(JSON.parse(calls[0].body), { sentAt: stamp, type: 'CALL_GUARDIAN' });
  assert.deepEqual(JSON.parse(calls[1].body), { sentAt: stamp, locationStatus: 'UNAVAILABLE', location: null });
  assert.deepEqual(calls.slice(0, 2).map(x => x.headers['Idempotency-Key']), ['key-1', 'key-2']);
  assert.ok(calls.slice(2).every(x => !x.headers['Idempotency-Key']));
  assert.deepEqual(JSON.parse(calls[2].body), { receivedAt: stamp });
  assert.deepEqual(JSON.parse(calls[3].body), { count: 3 });
  assert.deepEqual(JSON.parse(calls[4].body), { touchedAt: stamp });
  assert.ok(calls[4].url.endsWith('/messages/message%2F1/response'));
  const broken = createRecipientApi({ request: async () => ({ status: 'WAITING', respondedAt: stamp }) });
  await assert.rejects(broken.respond('m', stamp), { code: 'INVALID_RESPONSE' });
  await assert.rejects(broken.send('call', 'l', { sentAt: stamp }), { code: 'INVALID_RESPONSE' });
});

test('failed creations retain the exact body/key for manual retry and duplicate taps share one flight', async () => {
  const calls = [], feedback = [];
  let context = { owner: 'user:1', linkId: 'link' }, keys = 0;
  const first = deferred();
  const send = createRecipientSender({ context: () => context, createKey: () => `key-${++keys}`, feedback: x => feedback.push(x),
    api: { send: async (...args) => { calls.push(args); if (calls.length === 1) return first.promise; return { id: 'ok' }; } } });
  const p = send('call');
  assert.equal(send('call'), p);
  first.reject(new ApiError('TIMEOUT'));
  assert.equal(await p, false);
  assert.deepEqual(feedback, ['failed']);
  assert.equal(await send('call'), true);
  assert.deepEqual(calls[0].slice(0, 4), calls[1].slice(0, 4));
  assert.equal(await send('call'), true);
  assert.equal(calls[2][3], 'key-2');
  context = null;
  assert.equal(await send('help'), false);
  assert.equal(calls.length, 3);
});

test('a creation finishing after cancellation or account replacement cannot confirm success', async () => {
  let context = { owner: 'u:1', linkId: 'l' };
  const feedback = [], pending = deferred();
  const send = createRecipientSender({ context: () => context, createKey: () => 'k', feedback: x => feedback.push(x), api: { send: () => pending.promise } });
  const result = send('help');
  context = { owner: 'other:2', linkId: 'other-link' };
  pending.resolve({ id: 'help' });
  assert.equal(await result, false);
  assert.deepEqual(feedback, []);
});

function deliveryHarness(t, overrides = {}, signal = {}) {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: Date.parse(stamp) });
  const calls = [], exits = [], feedback = [], replying = [], plays = [];
  let valid = true, stopped = 0;
  const api = {
    acknowledge: async (...args) => { calls.push(['ack', ...args]); return { deliveredAt: stamp, waitUntil: new Date(Date.now() + 60000).toISOString() }; },
    playback: async (...args) => { calls.push(['playback', ...args]); },
    respond: async (...args) => { calls.push(['response', ...args]); return { status: 'RESPONDED', respondedAt: stamp }; },
    ...overrides,
  };
  const delivery = createIncomingDelivery({ signal: { messageId: 'message', isPractice: false, pulses: [100], ...signal }, api,
    valid: () => valid, play: onPlay => { plays.push(onPlay); return () => { stopped++; }; },
    feedback: x => feedback.push(x), onReplying: x => replying.push(x), onDone: x => exits.push(x) });
  t.after(() => delivery.dispose());
  return { delivery, calls, exits, feedback, replying, plays, stopCount: () => stopped, invalidate: () => { valid = false; } };
}

test('ack precedes vibration; actual cycles report increasing cumulative playback counts', async t => {
  const ack = deferred(), report = deferred();
  const reports = [];
  const h = deliveryHarness(t, { acknowledge: () => ack.promise, playback: async (_id, count) => { reports.push(count); if (reports.length === 1) await report.promise; } });
  h.delivery.resume();
  assert.equal(h.plays.length, 0);
  ack.resolve({ deliveredAt: stamp, waitUntil: new Date(Date.now() + 60000).toISOString() }); await flush();
  assert.equal(h.plays.length, 1);
  h.plays[0](); h.plays[0]();
  assert.deepEqual(reports, [1]);
  report.resolve(); await flush();
  assert.deepEqual(reports, [1, 2]);
});

test('temporary response failure stays pending, retries the original touch, and confirms only once', async t => {
  const touches = [];
  const h = deliveryHarness(t, { respond: async (_id, touchedAt) => { touches.push(touchedAt); if (touches.length === 1) throw new ApiError('NETWORK_ERROR'); return {}; } });
  h.delivery.resume(); await flush();
  h.delivery.respond(); h.delivery.respond(); await flush();
  assert.equal(touches.length, 1);
  assert.deepEqual(h.exits, []); assert.deepEqual(h.feedback, []);
  assert.equal(h.stopCount(), 1);
  t.mock.timers.tick(1000); await flush();
  assert.equal(touches.length, 2); assert.equal(touches[0], touches[1]);
  assert.deepEqual(h.exits, ['replied']); assert.deepEqual(h.feedback, ['sent']);
});

test('pausing cancels in-flight responses; resume retries without accepting a stale success', async t => {
  const first = deferred(); let calls = 0;
  const h = deliveryHarness(t, { respond: () => ++calls === 1 ? first.promise : Promise.resolve({}) });
  h.delivery.resume(); await flush(); h.delivery.respond();
  h.delivery.pause(); first.resolve({}); await flush();
  assert.deepEqual(h.exits, []);
  t.mock.timers.tick(60000); await flush(); assert.equal(calls, 1);
  h.delivery.resume(); await flush();
  assert.equal(calls, 2); assert.deepEqual(h.exits, ['replied']);
});

test('permanent response errors allow manual retry rather than retrying forever', async t => {
  let calls = 0;
  const h = deliveryHarness(t, { respond: async () => { calls++; throw new ApiError('MESSAGE_NOT_RESPONDABLE', { status: 409 }); } });
  h.delivery.resume(); await flush(); h.delivery.respond(); await flush();
  t.mock.timers.tick(20000); await flush();
  assert.equal(calls, 1); assert.deepEqual(h.exits, []);
  assert.deepEqual(h.replying, [true, false]); assert.deepEqual(h.feedback, ['failed']);
});

test('server waitUntil ends vibration without fabricating a no-response write', async t => {
  const h = deliveryHarness(t, { acknowledge: async () => ({ deliveredAt: stamp, waitUntil: new Date(Date.now() + 2000).toISOString() }) });
  h.delivery.resume(); await flush();
  t.mock.timers.tick(1999); assert.deepEqual(h.exits, []);
  t.mock.timers.tick(1); await flush();
  assert.deepEqual(h.exits, ['timeout']); assert.equal(h.stopCount(), 1);
  assert.equal(h.calls.filter(x => x[0] === 'response').length, 0);
});

test('practice touch dismisses without response; disposed or replaced sessions never confirm', async t => {
  const h = deliveryHarness(t, {}, { isPractice: true });
  h.delivery.resume(); await flush(); h.delivery.respond(); await flush();
  assert.deepEqual(h.exits, ['dismissed']); assert.deepEqual(h.feedback, []);
  assert.equal(h.calls.filter(x => x[0] === 'response').length, 0);
});

test('a stale response after session invalidation has no feedback or navigation', async t => {
  const pending = deferred();
  const h = deliveryHarness(t, { respond: () => pending.promise });
  h.delivery.resume(); await flush(); h.delivery.respond(); h.invalidate();
  pending.resolve({}); await flush();
  assert.deepEqual(h.exits, []); assert.deepEqual(h.feedback, []);
});

test('ack network failure still plays, then retries ack and uses its real deadline', async t => {
  let attempts = 0;
  const h = deliveryHarness(t, { acknowledge: async () => { if (++attempts === 1) throw new ApiError('TIMEOUT'); return { deliveredAt: stamp, waitUntil: new Date(Date.now() + 3000).toISOString() }; } });
  h.delivery.resume(); await flush(); assert.equal(h.plays.length, 1);
  t.mock.timers.tick(1000); await flush(); assert.equal(attempts, 2); assert.equal(h.plays.length, 1);
  t.mock.timers.tick(3000); await flush(); assert.deepEqual(h.exits, ['timeout']);
});

test('unavailable native vibration is not reported as played; playback stops at the policy limit', t => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: 0 });
  let available = false, played = 0, stops = 0, reports = 0;
  const native = { getVibrationCapability: () => ({ available }), playWaveform: () => { played++; }, stopVibration: () => { stops++; } };
  const waveform = { timings: [0, 100], amplitudes: [0, 255] };
  const vibration = loader({
    '@/native/vibration': native,
    '@/features/calibration/store': { getCalibration: () => ({ saved: { strength: 2, length: 2, repeat: 1 } }) },
    './feedback': { feedbackWaveform: () => waveform },
    './pattern': { REPEAT_GAP_MS: 100, pulsesWaveform: () => waveform, rhythmWaveform: () => waveform, waveformMs: () => 100, strengthAmplitude: [1, 2] },
    './useStopOnBlur': {},
  })('src/features/vibration/index.ts');
  const stop = vibration.repeatSignal([100], 100, undefined, () => { reports++; });
  assert.equal(reports, 0); stop();
  available = true;
  const stopLive = vibration.repeatSignal([100], 100, 250, () => { reports++; });
  t.mock.timers.tick(200); assert.equal(reports, 2);
  t.mock.timers.tick(50); assert.equal(stops, 2);
  const before = played; t.mock.timers.tick(1000); assert.equal(played, before); stopLive();
});

test('incoming duplicate events are scoped to the login session and stale clears preserve a newer message', () => {
  let revision = 1;
  const pushes = [];
  const incoming = loader({
    'expo-router': { router: { push: route => pushes.push(route) } },
    '@/features/session/store': { getSessionRevision: () => revision },
    '@/theme': { beatsToPulses: () => [100, 100, 100] },
  })('src/features/recipient/incoming.ts');
  const message = { id: 'one', kind: 'SIGNAL', isEmergency: false, guardianName: '보호자',
    signal: { name: '신호', rhythm: ['SHORT'], pulses: [120] },
    playbackPolicy: { repeatIntervalSec: 10, maxDurationSec: 60 }, waitUntil: stamp };
  incoming.handleIncoming(message); incoming.handleIncoming(message);
  assert.equal(pushes.length, 1);
  assert.deepEqual(incoming.getCurrentIncoming().pulses, [120]);
  assert.equal(incoming.getCurrentIncoming().repeatGapMs, 10000);
  incoming.handleIncoming({ ...message, id: 'two' });
  assert.equal(incoming.getCurrentIncoming().messageId, 'one');
  assert.equal(pushes.length, 1);
  incoming.clearIncoming('one');
  assert.equal(incoming.openNextIncoming(), true);
  incoming.clearIncoming('one'); assert.equal(incoming.getCurrentIncoming().messageId, 'two');
  revision++;
  assert.equal(incoming.getCurrentIncoming(), null);
  incoming.handleIncoming(message); assert.equal(pushes.length, 3);
});

test('background/resume cannot restart an expired emergency playback limit', async t => {
  const h = deliveryHarness(t, {}, { maxPlayMs: 2000 });
  h.delivery.resume(); await flush(); assert.equal(h.plays.length, 1);
  h.delivery.pause(); t.mock.timers.tick(3000);
  h.delivery.resume(); await flush(); assert.equal(h.plays.length, 1);
  h.delivery.respond(); await flush(); assert.deepEqual(h.exits, ['replied']);
});
