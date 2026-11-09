import { playRhythm, rhythmWaveform, stopRhythm, waveformMs } from '@/features/vibration';
import type { Beat } from '@/theme';

import type { CalibrationValues } from './store';

// 06-2 테스트 진동. 실제 패턴·시간은 기기 검증 후 확정 (placeholder).
// 스크린리더 안내는 진동 시작 전에 끝내도록 첫 진동 전에 잠깐 기다린다.
export const TEST_LEAD_IN_MS = 1200;

/** 테스트 신호 1번 = 짧게 + 길게. 길이 단계만큼 늘어난다 */
const TEST_BEATS: readonly Beat[] = ['S', 'L'];
/** 테스트 신호 사이에 쉬는 시간 */
const GAP_MS = 800;

/** 반복은 테스트 화면이 '2번 중 1번째'로 한 번씩 부른다. 여기서는 1번만 */
const once = (values: CalibrationValues): CalibrationValues => ({ ...values, repeat: 1 });

/** 신호 1번 재생 + 쉬는 시간 */
export function testStepMs(values: CalibrationValues) {
  return waveformMs(rhythmWaveform(TEST_BEATS, once(values))) + GAP_MS;
}

/** 보정값(세기·길이 배율)을 적용한 테스트 신호 진동 1회 */
export function playTestSignal(values: CalibrationValues) {
  playRhythm(TEST_BEATS, once(values));
}

export function stopTestSignal() {
  stopRhythm();
}

/** 06-1에서 값을 바꿀 때마다 그 값으로 짧은 미리보기 진동 1회 */
export function playPreview(values: CalibrationValues) {
  playRhythm(['M'], once(values));
}
