import { useSyncExternalStore } from 'react';

import { getVibrationCapability } from '@/native/vibration';

// 내 진동 설정(06) 보정값. 저장값(saved)과 06-1에서 바꾸는 중인 값(draft)을 따로 둔다.
// 저장하지 않고 나가면 이전 저장값을 유지한다 (calSpec '다시 보정').
// 보정값은 모든 신호에 같은 비율로 적용 (전체 세기 · 전체 시간 배율 · 반복 횟수). 신호의 뜻은 바뀌지 않음.

export type CalibrationKey = 'strength' | 'length' | 'repeat';

export type CalibrationValues = Record<CalibrationKey, number>;

type CalibrationState = {
  saved: CalibrationValues;
  draft: CalibrationValues;
};

const vibration = getVibrationCapability();

// 세기 조절은 Android hasAmplitudeControl 지원 기기에서만. 미지원 기기는 길이·반복으로만 구분한다.
// 네이티브 모듈이 없는 곳(Expo Go·웹)은 화면 확인용으로 세기 항목을 그대로 보여준다.
// TODO: 단계 수는 기기 확인 후 결정 (지금은 3단계 가정).
export const device = {
  strengthSupported: !vibration.available || vibration.amplitudeControl,
  strengthLevels: 3,
} as const;

export const ranges: Record<CalibrationKey, { min: number; max: number }> = {
  strength: { min: 1, max: device.strengthLevels },
  length: { min: 1, max: 3 },
  repeat: { min: 1, max: 5 },
};

/**
 * 반복 횟수는 화면에서 바꾸지 않고 고정한다. 신호 수신(07-4)은 응답이 올 때까지 계속 반복하므로
 * 반복 횟수로 체감 차이가 거의 없어 설정 항목을 줄였다. 서버(repeatCount) 형식은 그대로 둔다.
 */
export const FIXED_REPEAT = 2;

const defaults: CalibrationValues = { strength: 2, length: 2, repeat: FIXED_REPEAT };

let state: CalibrationState = {
  // 앱 시작 때 restoreCalibration(persist.ts)이 기기·서버 저장값으로 바꾼다
  saved: defaults,
  draft: defaults,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCalibration(): CalibrationState {
  return state;
}

/** 계정이 바뀌면 저장값과 작성 중인 값 모두 초기화한다. */
export function resetCalibration() {
  state = { saved: { ...defaults }, draft: { ...defaults } };
  emit();
}

export function useCalibration(): CalibrationState {
  return useSyncExternalStore(subscribe, getCalibration, getCalibration);
}

function clamp(key: CalibrationKey, value: number) {
  const { min, max } = ranges[key];
  return Math.min(max, Math.max(min, value));
}

export function canIncrease(values: CalibrationValues, key: CalibrationKey) {
  if (key === 'strength' && !device.strengthSupported) return false;
  return values[key] < ranges[key].max;
}

export function canDecrease(values: CalibrationValues, key: CalibrationKey) {
  if (key === 'strength' && !device.strengthSupported) return false;
  return values[key] > ranges[key].min;
}

/** draft 값을 바꾼다. 범위 밖이면 무시 */
export function setDraftValue(key: CalibrationKey, value: number) {
  const next = clamp(key, value);
  if (state.draft[key] === next) return;
  state = { ...state, draft: { ...state.draft, [key]: next } };
  emit();
  // 미리보기 진동은 06-1 화면(app/calibration/index)에서 playPreview로 울린다
}

export function stepDraft(key: CalibrationKey, delta: 1 | -1) {
  setDraftValue(key, state.draft[key] + delta);
}

/** 06-1에 새로 들어올 때: 저장값에서 다시 시작 */
export function resetDraft() {
  if (isSame(state.draft, state.saved)) return;
  state = { ...state, draft: state.saved };
  emit();
}

export function saveDraft() {
  state = { ...state, saved: state.draft };
  emit();
  // 기기 · 서버 저장은 06-5 화면에서 persistCalibration (persist.ts)
}

/** 저장값 복원 (persist.ts). 바꾸는 중인 값이 없으면 draft도 같이 맞춘다 */
export function setSavedCalibration(values: CalibrationValues) {
  const draftUntouched = isSame(state.draft, state.saved);
  state = { saved: values, draft: draftUntouched ? values : state.draft };
  emit();
}

export function isSame(a: CalibrationValues, b: CalibrationValues) {
  return a.strength === b.strength && a.length === b.length && a.repeat === b.repeat;
}
