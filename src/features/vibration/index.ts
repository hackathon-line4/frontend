import { getCalibration, type CalibrationValues } from '@/features/calibration/store';
import { playWaveform, stopVibration } from '@/native/vibration';
import type { Beat } from '@/theme';

import { feedbackWaveform, type FeedbackKind } from './feedback';
import { rhythmWaveform, strengthAmplitude, waveformMs } from './pattern';

// 화면에서 부르는 진동 함수. 보정값을 따로 넘기지 않으면 저장된 내 진동 설정을 쓴다.

export { getVibrationCapability, stopVibration } from '@/native/vibration';
export type { FeedbackKind } from './feedback';
export { rhythmWaveform, waveformMs } from './pattern';

/** 리듬 재생. 끝날 때까지 걸리는 시간(ms)을 돌려준다 */
export function playRhythm(beats: readonly Beat[], values: CalibrationValues = getCalibration().saved): number {
  const waveform = rhythmWaveform(beats, values);
  playWaveform(waveform);
  return waveformMs(waveform);
}

export function playFeedback(kind: FeedbackKind) {
  const { strength } = getCalibration().saved;
  playWaveform(feedbackWaveform(kind, strengthAmplitude[strength - 1] ?? 255));
}

export function stopRhythm() {
  stopVibration();
}
