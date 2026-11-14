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
  const requireNative = Module.createRequire(file);
  mod.require = name => name.startsWith('@/') ? load('src/' + name.slice(2) + '.ts') : name.startsWith('.') ? load(path.resolve(path.dirname(file), name + '.ts')) : requireNative(name);
  mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, file);
  return mod.exports;
}
const { ApiError } = load('src/api/errors.ts');
const { createSignalApi } = load('src/features/addSignal/api.ts');
const { createSignalSaver } = load('src/features/addSignal/saver.ts');
const { signalCreation } = load('src/features/addSignal/creation.ts');
const { monthCells, shiftMonth } = load('src/features/history/calendar.ts');
const { createSettingsApi, notificationPatch } = load('src/features/settings/api.ts');
const { createSettingsController } = load('src/features/settings/controller.ts');
const { createConnectionInbox } = load('src/features/settings/connectionInbox.ts');
const { connectionModel } = load('src/features/settings/models.ts');
const { helpRecords } = load('src/features/guardian/models.ts');
const { createEventDispatcher } = load('src/realtime/dispatch.ts');
const stamp = '2026-11-12T09:00:00+09:00';
const storedSignal = { id: 's1', name: '식사', pulses: [150, 150, 1000] };
const custom = { source: 'CUSTOM', name: '식사', rhythm: ['SHORT', 'LONG'] };
const guardian = { replyAlert: true, noReplyAlert: true, waitMinutes: 10 };
const check = (status = 'PENDING', requestedBy = 'guardian') => ({ id: 'check', status, requestedBy, confirmedAt: status === 'CONFIRMED' ? stamp : null, timeoutAt: stamp });
const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
function deferred() { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; }

test('template creation sends only template UUID; custom creation maps names, categories and beats', () => {
  assert.deepEqual(signalCreation({ source: 'basic', basicId: 'template', name: 'ignored', beats: [] }), { source: 'TEMPLATE', templateId: 'template' });
  assert.deepEqual(signalCreation({ source: 'custom', name: ' 식사 ', description: ' 함께 먹기 ', icon: 'sig-bowl', category: 'daily', beats: ['S', 'M', 'L'], presetId: 'preset' }),
    { source: 'CUSTOM', name: '식사', description: '함께 먹기', icon: 'sig-bowl', category: 'DAILY', rhythm: ['SHORT', 'MEDIUM', 'LONG'], presetId: 'preset' });
});

test('catalog API encodes link IDs and only creations receive idempotency keys', async () => {
  const calls = [];
  const api = createSignalApi({ request: async (path, options) => {
    calls.push({ path, ...options });
    return path.includes('rhythm-check') ? { valid: false, conflictSignal: { id: 's1', name: '식사' } } : path.includes('?') ? { items: [] } : storedSignal;
  } });
  await api.templates('link/1'); await api.presets('link/1'); await api.create('link/1', custom, 'key'); await api.rhythmCheck('link/1', ['SHORT', 'LONG']);
  assert.equal(calls[0].path, '/signal-templates?linkId=link%2F1'); assert.equal(calls[1].path, '/rhythm-presets?linkId=link%2F1');
  assert.equal(calls[2].path, '/links/link%2F1/signals'); assert.equal(calls[2].idempotencyKey, 'key'); assert.equal(calls[2].creation, true);
  assert.equal(calls[3].creation, undefined); assert.deepEqual(calls[3].body, { rhythm: ['SHORT', 'LONG'] });
  await assert.rejects(createSignalApi({ request: async () => ({}) }).create('l', custom, 'k'), { code: 'INVALID_RESPONSE' });
});

test('uncertain signal save coalesces taps and reuses immutable body/key on retry', async () => {
  const calls = [], pending = deferred(); let keys = 0;
  const saver = createSignalSaver({ scope: () => ({ key: 'u1', linkId: 'link' }), createKey: () => `key${++keys}`,
    create: (...args) => { calls.push(args); return calls.length === 1 ? pending.promise : Promise.resolve(storedSignal); } });
  const body = { ...custom, rhythm: [...custom.rhythm] };
  const first = saver(body); assert.equal(saver(body), first);
  body.name = '변경'; body.rhythm.push('LONG');
  pending.reject(new ApiError('TIMEOUT')); await assert.rejects(first, { code: 'TIMEOUT' });
  await saver(custom); assert.deepEqual(calls[0].slice(0, 3), calls[1].slice(0, 3));
  assert.equal(calls[0][1].name, '식사'); assert.equal(calls[0][1].rhythm.length, 2);
  await saver(custom); assert.notEqual(calls[1][2], calls[2][2]);
});

test('permanent duplicate errors are not cached as success and edited bodies get new keys', async () => {
  const keys = []; let count = 0;
  const saver = createSignalSaver({ scope: () => ({ key: 'u1', linkId: 'link' }), createKey: () => `k${++count}`,
    create: async (_id, _body, key) => { keys.push(key); throw new ApiError('RHYTHM_DUPLICATE', { message: "'식사'와 같은 리듬이에요" }); } });
  await assert.rejects(saver(custom), /식사/); await assert.rejects(saver(custom));
  await assert.rejects(saver({ ...custom, name: '다른 신호' })); assert.deepEqual(keys, ['k1', 'k2', 'k3']);
});

test('late saves after account replacement or abort cannot produce a completion', async () => {
  let scope = { key: 'u1', linkId: 'l' };
  let pending = deferred(); const saver = createSignalSaver({ scope: () => scope, createKey: () => 'k', create: () => pending.promise });
  const first = saver(custom); scope = { key: 'u2', linkId: 'other' }; pending.resolve(storedSignal);
  await assert.rejects(first, { code: 'SESSION_CHANGED' });
  pending = deferred(); const controller = new AbortController(); const second = saver(custom, controller.signal); controller.abort(); pending.resolve(storedSignal);
  await assert.rejects(second, { code: 'SESSION_CHANGED' });
});

test('calendar cells respect leap years, weekday offsets and year boundaries', () => {
  const feb = monthCells('2024-02'); assert.equal(feb.filter(Boolean).length, 29); assert.equal(feb[4], '2024-02-01');
  assert.equal(feb.length % 7, 0); assert.equal(monthCells('2025-02').filter(Boolean).length, 28);
  assert.equal(shiftMonth('2026-01', -1), '2025-12'); assert.equal(shiftMonth('2026-12', 1), '2027-01');
  assert.equal(monthCells('2026-02')[0], '2026-02-01');
});

test('settings API maps false/partial values without overwriting unrelated preferences or read-only help alerts', async () => {
  assert.deepEqual(notificationPatch({ replyAlert: false }), { touchResponseAlert: false });
  const calls = [];
  const api = createSettingsApi({ request: async (path, options) => {
    calls.push({ path, ...options });
    return path.includes('notification') ? { touchResponseAlert: false, noResponseAlert: true, responseWaitMinutes: 30, helpRequestAlert: true }
      : path.includes('location') ? { enabled: false } : check();
  } });
  assert.deepEqual(await api.saveGuardian({ replyAlert: false }), { replyAlert: false, noReplyAlert: true, waitMinutes: 30 });
  assert.deepEqual(calls[0].body, { touchResponseAlert: false }); assert.equal(calls[0].creation, undefined);
  assert.deepEqual(await api.saveRecipient({ shareLocationOnHelp: false }), { shareLocationOnHelp: false });
  assert.deepEqual(calls[1].body, { enabled: false });
  await api.requestCheck('link/1'); assert.equal(calls[2].path, '/links/link%2F1/connection-checks');
  await api.ackCheck('check/1'); assert.equal(calls[3].path, '/connection-checks/check%2F1/ack');
  await assert.rejects(createSettingsApi({ request: async () => ({}) }).guardian(), { code: 'INVALID_RESPONSE' });
});

function settings(overrides = {}, initialRole = 'guardian') {
  let scope = { key: 'guardian:1:link', userId: 'guardian', role: initialRole, linkId: 'link' }, confirmations = 0;
  const api = { guardian: async () => guardian, partner: async () => null, recipient: async () => ({ shareLocationOnHelp: true }),
    saveGuardian: async patch => ({ ...guardian, ...patch }), saveRecipient: async patch => patch,
    requestCheck: async () => check(), getCheck: async () => check(), ackCheck: async () => {}, ...overrides };
  const store = createSettingsController({ api, scope: () => scope, confirmed: () => confirmations++ }); store.bind();
  return { store, confirmations: () => confirmations, setScope: value => { scope = value; store.bind(); } };
}

test('a settings save supersedes an older read and applies only server-confirmed values', async () => {
  const pending = deferred(); const h = settings({ guardian: () => pending.promise });
  const reading = h.store.load(); await h.store.save({ replyAlert: false });
  pending.resolve(guardian); await reading;
  assert.equal(h.store.getSnapshot().guardian.replyAlert, false); assert.equal(h.store.getSnapshot().saving, false);
});

test('settings failures preserve confirmed preferences, and a new account cannot inherit them', async () => {
  const h = settings({ saveGuardian: async () => { throw new ApiError('NETWORK_ERROR'); } }); await h.store.load();
  await assert.rejects(h.store.save({ replyAlert: false }), { code: 'NETWORK_ERROR' }); assert.equal(h.store.getSnapshot().guardian.replyAlert, true);
  h.setScope({ key: 'other', userId: 'other', role: 'recipient' });
  assert.equal(h.store.getSnapshot().guardian, null); await h.store.load(); assert.equal(h.store.getSnapshot().recipient.shareLocationOnHelp, true);
});

test('account replacement and background cancellation ignore late settings responses', async () => {
  const pending = deferred(); const h = settings({ saveGuardian: () => pending.promise });
  const writing = h.store.save({ replyAlert: false }); h.setScope(null); pending.resolve({ ...guardian, replyAlert: false });
  await assert.rejects(writing, { code: 'SESSION_CHANGED' }); assert.equal(h.store.getSnapshot().guardian, null);
  const slow = deferred(), other = settings({ guardian: () => slow.promise }); const reading = other.store.load(); other.store.stop(); slow.resolve(guardian); await reading;
  assert.equal(other.store.getSnapshot().guardian, null);
});

test('connection checks remain pending until server confirmation and timeout never becomes connected', async () => {
  let next = check(); const h = settings({ getCheck: async () => next });
  await h.store.startCheck(); assert.equal(h.store.getSnapshot().check.status, 'PENDING'); assert.equal(h.confirmations(), 0);
  await h.store.pollCheck(); assert.equal(h.confirmations(), 0);
  next = check('UNCONFIRMED'); await h.store.pollCheck(); assert.equal(h.store.getSnapshot().check.status, 'UNCONFIRMED');
  assert.equal(connectionModel(undefined, h.store.getSnapshot().check).status, 'unconfirmed'); assert.equal(h.confirmations(), 1);
});

test('joining a check requested by the peer quietly acks it, then reads authoritative confirmation', async () => {
  const calls = [], h = settings({ requestCheck: async () => check('PENDING', 'recipient'), ackCheck: async id => calls.push(id), getCheck: async () => check('CONFIRMED', 'recipient') });
  await h.store.startCheck(); assert.deepEqual(calls, ['check']); assert.equal(h.store.getSnapshot().check.status, 'CONFIRMED');
  assert.equal(connectionModel(undefined, h.store.getSnapshot().check).status, 'connected');
});

test('late connection polls after leaving the screen cannot overwrite current state', async () => {
  const slow = deferred(), h = settings({ getCheck: () => slow.promise }); await h.store.startCheck();
  const polling = h.store.pollCheck(); h.store.stop(); slow.resolve(check('CONFIRMED')); await polling;
  assert.equal(h.store.getSnapshot().check.status, 'PENDING'); assert.equal(h.confirmations(), 0);
});

test('only the completed check can be cleared after reloading authoritative link state', async () => {
  const h = settings({ getCheck: async () => check('CONFIRMED') }); await h.store.startCheck();
  h.store.clearCheck('check'); assert.equal(h.store.getSnapshot().check.status, 'PENDING');
  await h.store.pollCheck(); h.store.clearCheck('other'); assert.equal(h.store.getSnapshot().check.status, 'CONFIRMED');
  h.store.clearCheck('check'); assert.equal(h.store.getSnapshot().check, null);
});

test('SSE connection checks use a quiet callback, never the recipient signal screen', () => {
  const received = [];
  const dispatch = createEventDispatcher({ valid: () => true, role: () => 'recipient', onMessage() {}, onIncoming: () => assert.fail('No vibration screen for a connection check'),
    onSession() {}, onRefresh() {}, onSettings: () => received.push('refresh'), onConnectionCheck: id => received.push(id) });
  dispatch({ event: 'connection_check.requested', id: 'event1', data: JSON.stringify({ connectionCheck: check() }) });
  assert.deepEqual(received, ['check', 'refresh']);
});

test('help records show provided address and actual receipts, with no invented delivery or response', () => {
  const base = { helpRequest: { id: 'help', sentAt: stamp, guardianDeliveredAt: null, guardianOpenedAt: null, location: null }, followingMessages: [{ id: 'm1', signalName: '식사', sentAt: stamp, deliveredAt: null, respondedAt: null }] };
  const result = helpRecords(base); assert.equal(result.record.arrivedAt, '확인 안 됨'); assert.equal(result.record.location, null);
  assert.equal(result.followUps[0].delivery.kind, 'unknown'); assert.equal(result.followUps[0].response, null);
  base.helpRequest.location = { address: '서울시 중구', capturedAt: stamp, latitude: 37, longitude: 127, accuracyM: 50 };
  assert.equal(helpRecords(base).record.location.address, '서울시 중구');
});

test('quiet connection inbox retries transient failures, drops permanent errors, and never acks its own check', async () => {
  let reads = 0; const acks = [];
  const inbox = createConnectionInbox({ scope: () => ({ key: 'u1', userId: 'guardian' }), api: {
    getCheck: async id => { reads++; if (reads === 1) throw new ApiError('NETWORK_ERROR'); if (id === 'missing') throw new ApiError('NOT_FOUND'); return check('PENDING', id === 'own' ? 'guardian' : 'recipient'); },
    ackCheck: async id => acks.push(id),
  } });
  inbox.queue('peer'); await inbox.acknowledge(); assert.deepEqual(acks, []);
  await inbox.acknowledge(); assert.deepEqual(acks, ['peer']);
  inbox.queue('own'); inbox.queue('missing'); await inbox.acknowledge();
  const count = reads; await inbox.acknowledge(); assert.equal(reads, count); assert.deepEqual(acks, ['peer']);
});

test('an old account inbox request cannot ack, remove or consume a new account event', async () => {
  let scope = { key: 'old', userId: 'old' }; const pending = deferred(), acks = [];
  const inbox = createConnectionInbox({ scope: () => scope, api: { getCheck: id => id === 'old-check' ? pending.promise : Promise.resolve(check('PENDING', 'peer')), ackCheck: async id => acks.push(id) } });
  inbox.queue('old-check'); const work = inbox.acknowledge();
  scope = { key: 'new', userId: 'new' }; inbox.queue('new-check'); pending.resolve(check('PENDING', 'peer')); await work;
  assert.deepEqual(acks, []); await inbox.acknowledge(); assert.deepEqual(acks, ['new-check']);
});
