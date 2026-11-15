import { FIXED_REPEAT, getCalibration, type CalibrationValues } from '@/features/calibration/store';
import { getVibrationCapability, playWaveform, stopVibration } from '@/native/vibration';
import type { Beat, Pulses } from '@/theme';

import { feedbackWaveform, type FeedbackKind } from './feedback';
import { REPEAT_GAP_MS, pulsesWaveform, rhythmWaveform, strengthAmplitude, waveformMs } from './pattern';

// 화면에서 부르는 진동 함수. 보정값을 따로 넘기지 않으면 저장된 내 진동 설정을 쓴다.

export { getVibrationCapability, stopVibration } from '@/native/vibration';
export type { FeedbackKind } from './feedback';
export { pulsesWaveform, rhythmWaveform, waveformMs } from './pattern';
export { useStopVibrationOnBlur } from './useStopOnBlur';

/** 리듬 재생. 끝날 때까지 걸리는 시간(ms)을 돌려준다 */
export function playRhythm(beats: readonly Beat[], values: CalibrationValues = getCalibration().saved): number {
  const waveform = rhythmWaveform(beats, values);
  playWaveform(waveform);
  return waveformMs(waveform);
}

/** 저장된 내 진동 설정. 반복 횟수는 화면에서 없앴으므로 저장값과 상관없이 고정값을 쓴다 */
function savedForPlayback(): CalibrationValues {
  return { ...getCalibration().saved, repeat: FIXED_REPEAT };
}

/** 신호 진동 배열을 내 진동 설정(보정값)대로 재생. 끝날 때까지 걸리는 시간(ms)을 돌려준다 */
export function playSignal(pulses: Pulses, values: CalibrationValues = savedForPlayback()): number {
  const waveform = pulsesWaveform(pulses, values);
  playWaveform(waveform);
  return waveformMs(waveform);
}

/**
 * 진동 배열 그대로 1번 재생 (길이 보정·반복 없음). 세기만 내 진동 설정을 따른다.
 * 화면 그림과 진동을 맞춰야 할 때 쓴다: 보호자 휴대폰에서 느껴 보기(10-4~6), 온보딩 체험(02-3).
 */
export function playPulses(pulses: Pulses): number {
  const { strength } = getCalibration().saved;
  return playSignal(pulses, { strength, length: 2, repeat: 1 });
}

/**
 * 신호를 내 진동 설정대로 계속 반복 (07-4 신호 수신). 돌려준 함수로 멈춘다.
 * maxMs가 있으면 그 시간이 지난 뒤 새 반복을 시작하지 않는다 (긴급 신호 최대 1분 등).
 */
export function repeatSignal(pulses: Pulses, gapMs = REPEAT_GAP_MS, maxMs?: number, onPlay?: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let limit: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;
  const endAt = maxMs != null ? Date.now() + maxMs : Infinity;
  const stop = () => {
    stopped = true;
    clearTimeout(timer); clearTimeout(limit);
    stopVibration();
  };
  const loop = () => {
    if (stopped || Date.now() >= endAt) return;
    const ms = playSignal(pulses);
    if (getVibrationCapability().available && pulses.some((value) => value > 0)) onPlay?.();
    timer = setTimeout(loop, ms + gapMs);
  };
  loop();
  if (maxMs != null && maxMs > 0) limit = setTimeout(stop, maxMs);
  return stop;
}

export function playFeedback(kind: FeedbackKind) {
  const { strength } = getCalibration().saved;
  playWaveform(feedbackWaveform(kind, strengthAmplitude[strength - 1] ?? 255));
}

export function stopRhythm() {
  stopVibration();
}
