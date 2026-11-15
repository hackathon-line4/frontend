import { api } from '@/api';
import { ApiError } from '@/api/errors';
import { getSession, getSessionRevision } from '@/features/session/store';
import { readStored, writeStored } from '@/features/session/storage';

import { device, getCalibration, ranges, resetCalibration, setSavedCalibration, type CalibrationValues } from './store';

type Level = 'WEAK' | 'NORMAL' | 'STRONG';
type Length = 'SHORT' | 'NORMAL' | 'LONG';
type ServerVibrationSettings = { intensity: Level | null; length: Length; repeatCount: number };
const levels: readonly Level[] = ['WEAK', 'NORMAL', 'STRONG'];
const lengths: readonly Length[] = ['SHORT', 'NORMAL', 'LONG'];

function isValues(value: unknown): value is CalibrationValues {
  const v = value as CalibrationValues | null;
  return !!v && (['strength', 'length', 'repeat'] as const).every(key =>
    Number.isInteger(v[key]) && v[key] >= ranges[key].min && v[key] <= ranges[key].max);
}

export function toServer(values: CalibrationValues): ServerVibrationSettings {
  if (!isValues(values)) throw new ApiError('VALIDATION_FAILED');
  return { intensity: device.strengthSupported ? levels[values.strength - 1] : null,
    length: lengths[values.length - 1], repeatCount: values.repeat };
}

export function fromServer(settings: ServerVibrationSettings, fallback: CalibrationValues): CalibrationValues {
  if (!settings || (settings.intensity !== null && !levels.includes(settings.intensity)) ||
    !lengths.includes(settings.length) || !Number.isInteger(settings.repeatCount) ||
    settings.repeatCount < ranges.repeat.min || settings.repeatCount > ranges.repeat.max) throw new ApiError('INVALID_RESPONSE');
  return { strength: settings.intensity === null ? fallback.strength : levels.indexOf(settings.intensity) + 1,
    length: lengths.indexOf(settings.length) + 1, repeat: settings.repeatCount };
}

function context() {
  const session = getSession();
  const userId = session.status === 'authenticated' && session.tokens ? session.user?.id : undefined;
  return { key: `${getSessionRevision()}:${session.status}:${userId ?? ''}`, userId, status: session.status,
    // 이전 공용 키는 소유자를 확인할 수 없어 가져오지 않는다.
    storageKey: `sonullim.calibration.${userId ?? 'preview'}` };
}
let owner: string | undefined;
let generation = 0;
function bind() {
  const scope = context();
  if (owner !== scope.key) {
    owner = scope.key; generation++; resetCalibration();
  }
  return scope;
}

/** 계정별 기기 캐시를 복원한 뒤 서버의 확정값을 적용한다. */
export async function restoreCalibration(signal?: AbortSignal) {
  const scope = bind(), version = ++generation;
  const valid = () => context().key === scope.key && generation === version && !signal?.aborted;
  if (scope.status !== 'authenticated' && scope.status !== 'anonymous') return;
  if (scope.status === 'authenticated' && !scope.userId) return;
  try {
    const stored = await readStored(scope.storageKey);
    const parsed: unknown = stored ? JSON.parse(stored) : null;
    if (!valid()) return;
    if (isValues(parsed)) setSavedCalibration(parsed);
  } catch { /* 손상되거나 읽을 수 없는 캐시는 서버 조회로 복원한다. */ }
  if (!scope.userId || !valid()) return;
  try {
    const server = await api.request<ServerVibrationSettings>('/me/vibration-settings', { signal });
    if (!valid()) return;
    const values = fromServer(server, getCalibration().saved);
    setSavedCalibration(values);
    await writeStored(scope.storageKey, JSON.stringify(values));
  } catch { /* 오프라인에서는 이 계정의 기존 확정값을 유지한다. */ }
}

/** 서버 저장 성공 후에만 적용한다. 실패한 draft는 화면에 남겨 재시도한다. */
export async function persistCalibration(values: CalibrationValues, signal?: AbortSignal) {
  const scope = bind(), version = ++generation;
  const valid = () => context().key === scope.key && generation === version && !signal?.aborted;
  const assertCurrent = () => { if (!valid()) throw new ApiError(signal?.aborted ? 'ABORTED' : 'SESSION_CHANGED'); };
  assertCurrent();
  if (scope.status !== 'authenticated' && scope.status !== 'anonymous') throw new ApiError('UNAUTHORIZED');
  if (scope.status === 'authenticated' && !scope.userId) throw new ApiError('UNAUTHORIZED');
  const submitted = { ...values };
  const body = toServer(submitted);
  let confirmed = submitted;
  if (scope.userId) {
    const server = await api.request<ServerVibrationSettings>('/me/vibration-settings', { method: 'PUT', body, signal });
    assertCurrent();
    confirmed = fromServer(server, submitted);
  }
  try { await writeStored(scope.storageKey, JSON.stringify(confirmed)); }
  catch {
    // 로그인 상태는 서버 저장이 완료됐으므로 캐시 실패로 재저장을 요구하지 않는다.
    if (!scope.userId) throw new ApiError('STORAGE_ERROR', { message: '진동 설정을 저장하지 못했어요. 다시 시도해 주세요' });
  }
  assertCurrent();
  setSavedCalibration(confirmed);
}
