import type { CalibrationValues } from './store';

// 06-2 테스트 진행 시간. 실제 진동 패턴·시간은 기기 검증 후 확정 (placeholder).
// 스크린리더 안내는 진동 시작 전에 끝내도록 첫 진동 전에 잠깐 기다린다.
export const TEST_LEAD_IN_MS = 1200;

const lengthScale = [0.7, 1, 1.5] as const;
const BASE_SIGNAL_MS = 1400;
const GAP_MS = 800;

/** 신호 1번 재생 + 쉬는 시간 */
export function testStepMs(values: CalibrationValues) {
  const scale = lengthScale[values.length - 1] ?? 1;
  return Math.round(BASE_SIGNAL_MS * scale) + GAP_MS;
}

// TODO: 보정값(세기·길이 배율)을 적용한 테스트 신호 진동 1회 재생 (expo-haptics / Vibration, 기기 지원 확인 후)
export function playTestSignal(_values: CalibrationValues) {}

// TODO: 진행 중인 테스트 진동 멈추기
export function stopTestSignal() {}
