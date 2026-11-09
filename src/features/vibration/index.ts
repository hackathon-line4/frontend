import { getCalibration, type CalibrationValues } from '@/features/calibration/store';
import { playWaveform, stopVibration } from '@/native/vibration';
import type { Beat, Pulses } from '@/theme';

import { feedbackWaveform, type FeedbackKind } from './feedback';
import { REPEAT_GAP_MS, pulsesWaveform, rhythmWaveform, strengthAmplitude, waveformMs } from './pattern';

// 화면에서 부르는 진동 함수. 보정값을 따로 넘기지 않으면 저장된 내 진동 설정을 쓴다.

export { getVibrationCapability, stopVibration } from '@/native/vibration';
export type { FeedbackKind } from './feedback';
export { pulsesWaveform, rhythmWaveform, waveformMs } from './pattern';

/** 리듬 재생. 끝날 때까지 걸리는 시간(ms)을 돌려준다 */
export function playRhythm(beats: readonly Beat[], values: CalibrationValues = getCalibration().saved): number {
  const waveform = rhythmWaveform(beats, values);
  playWaveform(waveform);
  return waveformMs(waveform);
}

/** 신호 진동 배열을 내 진동 설정(보정값)대로 재생. 끝날 때까지 걸리는 시간(ms)을 돌려준다 */
export function playSignal(pulses: Pulses, values: CalibrationValues = getCalibration().saved): number {
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

/** 신호를 내 진동 설정대로 계속 반복 (07-4 신호 수신). 돌려준 함수로 멈춘다 */
export function repeatSignal(pulses: Pulses, gapMs = REPEAT_GAP_MS): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;
  const loop = () => {
    if (stopped) return;
    const ms = playSignal(pulses);
    timer = setTimeout(loop, ms + gapMs);
  };
  loop();
  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
    stopVibration();
  };
}

export function playFeedback(kind: FeedbackKind) {
  const { strength } = getCalibration().saved;
  playWaveform(feedbackWaveform(kind, strengthAmplitude[strength - 1] ?? 255));
}

export function stopRhythm() {
  stopVibration();
}
