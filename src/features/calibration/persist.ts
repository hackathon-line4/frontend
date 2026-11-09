import { api } from '@/api';
import { getSession } from '@/features/session';
import { readStored, writeStored } from '@/features/session/storage';

import { device, getCalibration, ranges, setSavedCalibration, type CalibrationValues } from './store';

// 내 진동 설정(06) 저장 · 복원.
// 기기에 먼저 저장해서 서버가 없거나 실패해도 앱을 다시 켜면 그대로 쓴다.
// 로그인 상태면 서버(GET·PUT /me/vibration-settings)와도 맞춘다. 서버 값이 있으면 서버가 우선.

const STORAGE_KEY = 'sonullim.calibration';

type Level = 'WEAK' | 'NORMAL' | 'STRONG';
type Length = 'SHORT' | 'NORMAL' | 'LONG';

/** 서버 형식 (설정 C-1) */
type ServerVibrationSettings = {
  /** 세기 조절 미지원 기기는 null */
  intensity: Level | null;
  length: Length;
  repeatCount: number;
};

const levels: readonly Level[] = ['WEAK', 'NORMAL', 'STRONG'];
const lengths: readonly Length[] = ['SHORT', 'NORMAL', 'LONG'];

function clamp(value: number, { min, max }: { min: number; max: number }) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function isValues(value: unknown): value is CalibrationValues {
  const v = value as CalibrationValues | null;
  return !!v && [v.strength, v.length, v.repeat].every((n) => typeof n === 'number');
}

export function toServer(values: CalibrationValues): ServerVibrationSettings {
  return {
    intensity: device.strengthSupported ? levels[values.strength - 1] : null,
    length: lengths[values.length - 1],
    repeatCount: values.repeat,
  };
}

export function fromServer(settings: ServerVibrationSettings, fallback: CalibrationValues): CalibrationValues {
  const strength = settings.intensity ? levels.indexOf(settings.intensity) + 1 : fallback.strength;
  return {
    strength: clamp(strength, ranges.strength),
    length: clamp(lengths.indexOf(settings.length) + 1, ranges.length),
    // 서버는 1~5, 앱 화면은 지금 1~3 (기기 테스트 후 맞춤)
    repeat: clamp(settings.repeatCount, ranges.repeat),
  };
}

const signedIn = () => getSession().status === 'authenticated' && !!getSession().tokens;

/** 앱 시작 · 로그인 후: 기기 저장값 → 서버 값 순서로 복원 */
export async function restoreCalibration() {
  try {
    const stored = await readStored(STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : null;
    if (isValues(parsed)) setSavedCalibration(parsed);
  } catch {
    // 저장값이 깨졌으면 기본값으로 둔다
  }
  if (!signedIn()) return;
  try {
    const server = await api.request<ServerVibrationSettings>('/me/vibration-settings');
    const values = fromServer(server, getCalibration().saved);
    setSavedCalibration(values);
    await writeStored(STORAGE_KEY, JSON.stringify(values));
  } catch {
    // 서버가 없거나 실패하면 기기 저장값을 그대로 쓴다
  }
}

/** '설정 저장하기': 기기에 저장하고, 로그인 상태면 서버에도 보낸다 (실패해도 기기 값은 유지) */
export async function persistCalibration(values: CalibrationValues) {
  await writeStored(STORAGE_KEY, JSON.stringify(values)).catch(() => {});
  if (!signedIn()) return;
  await api
    .request<ServerVibrationSettings>('/me/vibration-settings', { method: 'PUT', body: toServer(values) })
    .catch(() => {
      // TODO: 서버 저장 실패를 화면에 알릴지 (지금은 기기 값만 유지)
    });
}
