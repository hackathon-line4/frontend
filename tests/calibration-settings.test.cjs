const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const defaults = { strength: 2, length: 2, repeat: 2 };
const draft = { strength: 3, length: 3, repeat: 5 };
const response = (repeatCount = 5) => ({ intensity: 'STRONG', length: 'LONG', repeatCount });
const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };

function loader(mocks) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(__dirname, '..', file);
    if (cache.has(file)) return cache.get(file).exports;
    const mod = new Module(file); cache.set(file, mod);
    const nativeRequire = Module.createRequire(file);
    mod.require = name => Object.hasOwn(mocks, name) ? mocks[name] : name.startsWith('@/') ? load('src/' + name.slice(2) + '.ts') : name.startsWith('.') ? load(path.resolve(path.dirname(file), name + '.ts')) : nativeRequire(name);
    mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, file);
    return mod.exports;
  }
  return load;
}
function setup() {
  const state = { session: { status: 'authenticated', user: { id: 'alice' }, tokens: {} }, revision: 1 };
  const storage = new Map(), calls = [];
  const io = { read: async key => storage.get(key) ?? null, write: async (key, value) => storage.set(key, value), request: async () => response() };
  const load = loader({
    react: { useSyncExternalStore: (_, get) => get() },
    '@/native/vibration': { getVibrationCapability: () => ({ available: true, amplitudeControl: true }) },
    '@/features/session/store': { getSession: () => state.session, getSessionRevision: () => state.revision },
    '@/features/session/storage': { readStored: key => io.read(key), writeStored: (key, value) => io.write(key, value) },
    '@/api': { api: { request: (...args) => { calls.push(args); return io.request(...args); } } },
  });
  return { state, storage, calls, io, store: load('src/features/calibration/store.ts'), persist: load('src/features/calibration/persist.ts') };
}

test('calibration applies only the successful server response and retains draft for retry on failure', async () => {
  const h = setup(); await h.persist.restoreCalibration();
  const previous = h.store.getCalibration().saved;
  h.store.setDraftValue('repeat', 4);
  const pending = deferred(); h.io.request = () => pending.promise;
  const save = h.persist.persistCalibration(draft);
  assert.deepEqual(h.store.getCalibration().saved, previous);
  pending.reject(new Error('offline')); await assert.rejects(save, /offline/);
  assert.deepEqual(h.store.getCalibration().saved, previous);
  assert.equal(h.store.getCalibration().draft.repeat, 4);
  h.io.request = async () => response(4);
  await h.persist.persistCalibration(draft);
  assert.equal(h.store.getCalibration().saved.repeat, 4);
  assert.equal(JSON.parse(h.storage.get('sonullim.calibration.alice')).repeat, 4);
  assert.deepEqual(h.calls.at(-1)[1].body, response());
});

test('calibration restores and saves all five server repeat levels without truncation', () => {
  const { persist, store } = setup();
  for (let repeat = 1; repeat <= 5; repeat++) {
    const values = persist.fromServer(response(repeat), defaults);
    assert.equal(values.repeat, repeat);
    assert.equal(persist.toServer(values).repeatCount, repeat);
  }
  assert.equal(store.ranges.repeat.max, 5);
  assert.throws(() => persist.fromServer(response(6), defaults), { code: 'INVALID_RESPONSE' });
  assert.throws(() => persist.fromServer({ ...response(), intensity: 'bad' }, defaults), { code: 'INVALID_RESPONSE' });
});

test('account switch resets saved and draft values and ignores old server reads and shared legacy cache', async () => {
  const h = setup();
  h.storage.set('sonullim.calibration', JSON.stringify(draft));
  const oldRead = deferred(); h.io.request = () => oldRead.promise;
  const first = h.persist.restoreCalibration(); await flush();
  h.store.setDraftValue('repeat', 5);
  h.state.session.user = { id: 'bob' }; h.state.revision++;
  h.io.request = async () => { throw new Error('offline'); };
  await h.persist.restoreCalibration();
  assert.deepEqual(h.store.getCalibration(), { saved: defaults, draft: defaults });
  oldRead.resolve(response()); await first;
  assert.deepEqual(h.store.getCalibration().saved, defaults);
  assert.equal(h.storage.has('sonullim.calibration.alice'), false);
});

test('late cache read after account replacement cannot restore the old account', async () => {
  const h = setup(), read = deferred(); h.io.read = () => read.promise;
  const restore = h.persist.restoreCalibration();
  h.state.session.user = { id: 'bob' }; h.state.revision++;
  read.resolve(JSON.stringify(draft)); await restore;
  assert.deepEqual(h.store.getCalibration().saved, defaults);
  assert.equal(h.calls.length, 0);
});

test('each account recovers its own confirmed cache when offline, and logout resets to preview defaults', async () => {
  const h = setup(); await h.persist.persistCalibration(draft);
  h.state.session.user = { id: 'bob' }; h.state.revision++;
  h.io.request = async () => response(1); await h.persist.persistCalibration({ ...draft, repeat: 1 });
  h.state.session.user = { id: 'alice' }; h.state.revision++;
  h.io.request = async () => { throw new Error('offline'); }; await h.persist.restoreCalibration();
  assert.equal(h.store.getCalibration().saved.repeat, 5);
  h.state.session = { status: 'anonymous', user: null, tokens: null }; h.state.revision++;
  await h.persist.restoreCalibration(); assert.deepEqual(h.store.getCalibration().saved, defaults);
});

test('save invalidates a slower restore so old reads cannot overwrite confirmed settings', async () => {
  const h = setup(), oldRead = deferred(); h.io.request = () => oldRead.promise;
  const restore = h.persist.restoreCalibration(); await flush();
  h.io.request = async () => response(); await h.persist.persistCalibration(draft);
  oldRead.resolve(response(1)); await restore;
  assert.equal(h.store.getCalibration().saved.repeat, 5);
  assert.equal(JSON.parse(h.storage.get('sonullim.calibration.alice')).repeat, 5);
});

test('cancelled or replaced-session saves cannot confirm success or overwrite the cache', async () => {
  for (const cancel of ['abort', 'account']) {
    const h = setup(), pending = deferred(), abort = new AbortController();
    h.io.request = () => pending.promise;
    const save = h.persist.persistCalibration(draft, abort.signal);
    if (cancel === 'abort') abort.abort(); else { h.state.session.user = { id: 'bob' }; h.state.revision++; }
    pending.resolve(response());
    await assert.rejects(save, { code: cancel === 'abort' ? 'ABORTED' : 'SESSION_CHANGED' });
    assert.deepEqual(h.store.getCalibration().saved, defaults);
    assert.equal(h.storage.size, 0);
  }
});

test('local-only save reports storage failure; confirmed server save survives a cache failure', async () => {
  const h = setup(); h.io.write = async () => { throw new Error('disk'); };
  await h.persist.persistCalibration(draft); assert.deepEqual(h.store.getCalibration().saved, draft);
  h.state.session = { status: 'anonymous', user: null, tokens: null }; h.state.revision++;
  await assert.rejects(h.persist.persistCalibration(draft), { code: 'STORAGE_ERROR' });
  assert.deepEqual(h.store.getCalibration().saved, defaults);
});

function permissionHarness() {
  const state = { os: 'android', fine: false, coarse: false, notification: null, locationError: false, notificationError: false };
  const read = loader({
    'react-native': { Platform: { get OS() { return state.os; } }, PermissionsAndroid: { PERMISSIONS: { ACCESS_FINE_LOCATION: 'fine', ACCESS_COARSE_LOCATION: 'coarse' }, check: async key => { if (state.locationError) throw new Error('location'); return state[key]; } } },
    '@/native/deviceSettings': { getNotificationPermission: () => { if (state.notificationError) throw new Error('notification'); return state.notification; } },
  })('src/features/settings/permissions.ts').readSettingsPermissions;
  return { state, read };
}

test('permission reader distinguishes precise, approximate, denied and unsupported permissions', async () => {
  const { state, read } = permissionHarness();
  assert.deepEqual(await read(), { location: 'denied', notification: 'unknown' });
  state.coarse = true; state.notification = true;
  assert.deepEqual(await read(), { location: 'approximate', notification: 'granted' });
  state.fine = true; state.notification = false;
  assert.deepEqual(await read(), { location: 'whileInUse', notification: 'denied' });
  state.os = 'ios'; assert.equal((await read()).location, 'unknown');
});

test('a failed permission query preserves the independent permission result', async () => {
  const { state, read } = permissionHarness();
  state.locationError = true; state.notification = true;
  assert.deepEqual(await read(), { location: 'unknown', notification: 'granted' });
  state.locationError = false; state.fine = true; state.notificationError = true;
  assert.deepEqual(await read(), { location: 'whileInUse', notification: 'unknown' });
});

test('settings permissions refresh on resume and ignore older reads after background or screen exit', async () => {
  let focus, listener;
  const results = [], reads = [];
  const appState = { currentState: 'active', addEventListener: (_, callback) => { listener = callback; return { remove() {} }; } };
  const serverSettings = { subscribe() {}, getSnapshot: () => ({ scope: 'alice' }), bind() {}, load() {}, pollCheck() {}, stop() {} };
  const load = loader({
    react: { useCallback: callback => callback, useState: value => [value, next => results.push(next)], useSyncExternalStore: (_, get) => get() },
    'expo-router': { useFocusEffect: callback => { focus = callback; } },
    'react-native': { AppState: appState },
    '@/features/session': { useSession: () => ({}) },
    '@/features/session/store': { reloadMe: async () => {} },
    './client': { serverSettings, getSettingsScope: () => ({ key: 'alice' }) },
    './permissions': { readSettingsPermissions: () => { const read = deferred(); reads.push(read); return read.promise; } },
  });
  load('src/features/settings/useServerSettings.ts').useServerSettings();
  const cleanup = focus();
  try {
    appState.currentState = 'background'; listener('background');
    appState.currentState = 'active'; listener('active');
    const current = { location: 'whileInUse', notification: 'granted' };
    reads[1].resolve(current); await flush();
    reads[0].resolve({ location: 'denied', notification: 'denied' }); await flush();
    assert.deepEqual(results, [current]);
    listener('active'); cleanup();
    reads[2].resolve({ location: 'denied', notification: 'denied' }); await flush();
    assert.deepEqual(results, [current]);
  } finally { cleanup(); }
});
